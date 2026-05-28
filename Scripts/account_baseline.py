#!/usr/bin/env python3
"""Apply the standard account baseline to one or many AWS accounts.

What it does (per account):
  * IAM password policy: 14-char minimum, complexity, no reuse of last 24, 90-day expiry
  * S3 account-level Block Public Access (all four flags on)
  * Default EBS encryption enabled in every enabled region with the AWS-managed key
    (use a CMK alias via --ebs-kms-alias for stricter setups)
  * IMDSv2 required on the account (account-level default)

Usage:
  ./account_baseline.py --accounts-csv accounts.csv --role-name AWSControlTowerExecution --apply

The script is a *baseline*; it does not replace AWS Control Tower or LZA, which
provide more comprehensive guardrails. Use it for one-off remediation or for
accounts not yet under Control Tower governance.
"""
from __future__ import annotations

import argparse
import json
import sys

from botocore.exceptions import ClientError

from org_helper import (
    LOG,
    load_accounts,
    for_each_account,
    regions_for_session,
    confirm_or_exit,
)

PASSWORD_POLICY = dict(
    MinimumPasswordLength=14,
    RequireSymbols=True,
    RequireNumbers=True,
    RequireUppercaseCharacters=True,
    RequireLowercaseCharacters=True,
    AllowUsersToChangePassword=True,
    MaxPasswordAge=90,
    PasswordReusePrevention=24,
    HardExpiry=False,
)


def apply_password_policy(session, dry_run: bool) -> None:
    iam = session.client("iam")
    if dry_run:
        LOG.info("  [dry-run] would set IAM password policy")
        return
    iam.update_account_password_policy(**PASSWORD_POLICY)
    LOG.info("  IAM password policy applied")


def apply_s3_bpa(session, dry_run: bool) -> None:
    s3 = session.client("s3control")
    sts_id = session.client("sts").get_caller_identity()["Account"]
    if dry_run:
        LOG.info("  [dry-run] would enable S3 account-level Block Public Access for %s", sts_id)
        return
    s3.put_public_access_block(
        AccountId=sts_id,
        PublicAccessBlockConfiguration={
            "BlockPublicAcls": True,
            "IgnorePublicAcls": True,
            "BlockPublicPolicy": True,
            "RestrictPublicBuckets": True,
        },
    )
    LOG.info("  S3 BPA enabled for account %s", sts_id)


def apply_ebs_default_encryption(session, dry_run: bool, kms_alias: str | None, regions: list[str]) -> None:
    for region in regions:
        ec2 = session.client("ec2", region_name=region)
        if dry_run:
            LOG.info("  [dry-run] would enable default EBS encryption in %s", region)
            continue
        try:
            ec2.enable_ebs_encryption_by_default()
            if kms_alias:
                kms = session.client("kms", region_name=region)
                resp = kms.describe_key(KeyId=kms_alias)
                ec2.modify_ebs_default_kms_key_id(KmsKeyId=resp["KeyMetadata"]["KeyId"])
            LOG.info("  EBS default encryption ON in %s", region)
        except ClientError as exc:
            LOG.warning("  EBS default encryption failed in %s: %s", region, exc)


def apply_imdsv2_default(session, dry_run: bool, regions: list[str]) -> None:
    for region in regions:
        ec2 = session.client("ec2", region_name=region)
        if dry_run:
            LOG.info("  [dry-run] would set IMDSv2 account default in %s", region)
            continue
        try:
            ec2.modify_instance_metadata_defaults(HttpTokens="required", HttpPutResponseHopLimit=2, HttpEndpoint="enabled")
            LOG.info("  IMDSv2 account default set in %s", region)
        except ClientError as exc:
            LOG.warning("  IMDSv2 default failed in %s: %s", region, exc)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--accounts-csv", required=True, help="CSV with account_id,alias,environment,ou")
    p.add_argument("--role-name", default="AWSControlTowerExecution", help="Role to assume in target accounts")
    p.add_argument("--regions", nargs="+", default=None, help="Restrict to these regions (default: all enabled)")
    p.add_argument("--ebs-kms-alias", default=None, help="KMS key alias to use as default EBS key (optional)")
    p.add_argument("--dry-run", action="store_true", default=True, help="Print intended actions only (default)")
    p.add_argument("--apply", dest="dry_run", action="store_false", help="Make changes")
    p.add_argument("--continue-on-error", action="store_true", default=True)
    args = p.parse_args()

    accounts = load_accounts(args.accounts_csv)
    LOG.info("Baseline target: %d accounts", len(accounts))
    if args.dry_run:
        confirm_or_exit("apply account baseline", dry_run=True)

    def per_account(session, account):
        LOG.info("Processing %s (%s, %s)", account.account_id, account.alias, account.environment)
        regions = regions_for_session(session, args.regions)
        apply_password_policy(session, args.dry_run)
        apply_s3_bpa(session, args.dry_run)
        apply_ebs_default_encryption(session, args.dry_run, args.ebs_kms_alias, regions)
        apply_imdsv2_default(session, args.dry_run, regions)

    results = for_each_account(accounts, args.role_name, per_account, args.continue_on_error)
    print("\nSummary:")
    print(json.dumps(results, indent=2))
    return 0 if all(v == "OK" for v in results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
