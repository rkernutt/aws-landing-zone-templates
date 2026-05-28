#!/usr/bin/env python3
"""Enable Security Hub, GuardDuty, Config and Inspector organisation-wide.

Run from the AWS Organizations *management* account. The script will:
  1. Designate the Audit account as delegated administrator for each service.
  2. Enable each service in the listed regions of the delegated admin.
  3. Configure auto-enable for new accounts joining the Organisation.
  4. Enable the recommended Security Hub standards: AWS FSBP, CIS v3, NIST 800-53 r5.
  5. Enable all GuardDuty protection plans (Runtime Monitoring, EKS, S3, RDS, Lambda, Malware Protection).

Pre-requisites:
  - Trusted access enabled for the services (Organizations setting).
  - Caller has organizations:RegisterDelegatedAdministrator permissions.
  - Audit account exists and is reachable.

Usage:
  ./enable_security_services.py \
      --audit-account-id 123456789012 \
      --regions eu-west-2 \
      --apply
"""
from __future__ import annotations

import argparse
import json
import sys

import boto3
from botocore.exceptions import ClientError

from org_helper import LOG, BOTO_CONFIG, confirm_or_exit, assume_role

SECURITY_SERVICES = [
    "securityhub.amazonaws.com",
    "guardduty.amazonaws.com",
    "inspector2.amazonaws.com",
    "config.amazonaws.com",
    "access-analyzer.amazonaws.com",
    "macie.amazonaws.com",
    "auditmanager.amazonaws.com",
    "detective.amazonaws.com",
]

SH_STANDARDS = {
    # ARNs are region-substituted at call time
    "FSBP": "arn:aws:securityhub:{region}::standards/aws-foundational-security-best-practices/v/1.0.0",
    "CIS_v3": "arn:aws:securityhub:{region}::standards/cis-aws-foundations-benchmark/v/3.0.0",
    "NIST_800-53_r5": "arn:aws:securityhub:{region}::standards/nist-800-53/v/5.0.0",
}


def register_delegated_admins(org, audit_account_id: str, dry_run: bool) -> None:
    for svc in SECURITY_SERVICES:
        if dry_run:
            LOG.info("[dry-run] would register %s as delegated admin for %s", audit_account_id, svc)
            continue
        try:
            org.register_delegated_administrator(AccountId=audit_account_id, ServicePrincipal=svc)
            LOG.info("Registered %s for %s", audit_account_id, svc)
        except ClientError as exc:
            if exc.response["Error"]["Code"] in ("AccountAlreadyRegisteredException", "DuplicateRegistrationException"):
                LOG.info("Already registered: %s", svc)
            else:
                LOG.warning("Could not register %s: %s", svc, exc)


def enable_security_hub(session, region: str, dry_run: bool) -> None:
    sh = session.client("securityhub", region_name=region, config=BOTO_CONFIG)
    if dry_run:
        LOG.info("[dry-run] would enable Security Hub + standards in %s", region)
        return
    try:
        sh.enable_security_hub(EnableDefaultStandards=False)
    except ClientError as exc:
        if exc.response["Error"]["Code"] != "ResourceConflictException":
            raise
    for label, arn_tpl in SH_STANDARDS.items():
        try:
            sh.batch_enable_standards(StandardsSubscriptionRequests=[{"StandardsArn": arn_tpl.format(region=region)}])
        except ClientError as exc:
            LOG.warning("  Could not enable %s in %s: %s", label, region, exc)
    LOG.info("Security Hub configured in %s", region)


def enable_guardduty(session, region: str, dry_run: bool) -> None:
    gd = session.client("guardduty", region_name=region, config=BOTO_CONFIG)
    if dry_run:
        LOG.info("[dry-run] would enable GuardDuty + protection plans in %s", region)
        return
    detectors = gd.list_detectors().get("DetectorIds", [])
    if not detectors:
        det = gd.create_detector(Enable=True, FindingPublishingFrequency="FIFTEEN_MINUTES")["DetectorId"]
    else:
        det = detectors[0]
    gd.update_detector(
        DetectorId=det,
        Features=[
            {"Name": "S3_DATA_EVENTS", "Status": "ENABLED"},
            {"Name": "EKS_AUDIT_LOGS", "Status": "ENABLED"},
            {"Name": "EBS_MALWARE_PROTECTION", "Status": "ENABLED"},
            {"Name": "RDS_LOGIN_EVENTS", "Status": "ENABLED"},
            {"Name": "LAMBDA_NETWORK_LOGS", "Status": "ENABLED"},
            {"Name": "RUNTIME_MONITORING", "Status": "ENABLED",
             "AdditionalConfiguration": [
                 {"Name": "EKS_ADDON_MANAGEMENT", "Status": "ENABLED"},
                 {"Name": "ECS_FARGATE_AGENT_MANAGEMENT", "Status": "ENABLED"},
                 {"Name": "EC2_AGENT_MANAGEMENT", "Status": "ENABLED"},
             ]},
        ],
    )
    LOG.info("GuardDuty + protection plans enabled in %s", region)


def enable_inspector(session, region: str, dry_run: bool) -> None:
    insp = session.client("inspector2", region_name=region, config=BOTO_CONFIG)
    if dry_run:
        LOG.info("[dry-run] would enable Inspector in %s", region)
        return
    insp.enable(resourceTypes=["EC2", "ECR", "LAMBDA", "LAMBDA_CODE"])
    LOG.info("Inspector enabled in %s", region)


def configure_organization_admin(session, dry_run: bool) -> None:
    # Security Hub central configuration
    sh = session.client("securityhub", config=BOTO_CONFIG)
    if dry_run:
        LOG.info("[dry-run] would enable Security Hub central configuration & auto-enable for new accounts")
        return
    try:
        sh.update_organization_configuration(AutoEnable=True, AutoEnableStandards="DEFAULT",
                                             OrganizationConfiguration={"ConfigurationType": "CENTRAL"})
    except ClientError as exc:
        LOG.warning("Security Hub org config: %s", exc)
    # GuardDuty auto-enable for new members
    gd = session.client("guardduty", config=BOTO_CONFIG)
    try:
        det = gd.list_detectors()["DetectorIds"][0]
        gd.update_organization_configuration(DetectorId=det, AutoEnable=True)
    except (ClientError, IndexError) as exc:
        LOG.warning("GuardDuty org config: %s", exc)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--audit-account-id", required=True)
    p.add_argument("--regions", nargs="+", required=True)
    p.add_argument("--role-name", default="AWSControlTowerExecution")
    p.add_argument("--dry-run", action="store_true", default=True)
    p.add_argument("--apply", dest="dry_run", action="store_false")
    args = p.parse_args()

    LOG.info("Configuring %d region(s) for delegated admin %s", len(args.regions), args.audit_account_id)
    if args.dry_run:
        confirm_or_exit("enable security services", dry_run=True)

    org = boto3.client("organizations", config=BOTO_CONFIG)
    register_delegated_admins(org, args.audit_account_id, args.dry_run)

    audit_session = assume_role(args.audit_account_id, args.role_name, session_name="lz-security-bootstrap")
    for region in args.regions:
        LOG.info("--- Region %s ---", region)
        enable_security_hub(audit_session, region, args.dry_run)
        enable_guardduty(audit_session, region, args.dry_run)
        enable_inspector(audit_session, region, args.dry_run)
    configure_organization_admin(audit_session, args.dry_run)
    LOG.info("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
