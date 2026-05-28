#!/usr/bin/env python3
"""Enable default EBS encryption in every enabled region of an account.

Optional: pass --kms-alias to set a customer-managed CMK as the default key.

Usage:
  ./default_ebs_encryption.py --profile {{CUSTOMER_CODE}}-workload --apply
"""
from __future__ import annotations

import argparse
import sys

import boto3
from botocore.exceptions import ClientError


def enabled_regions(session) -> list[str]:
    ec2 = session.client("ec2", region_name="us-east-1")
    return [r["RegionName"] for r in ec2.describe_regions(AllRegions=False)["Regions"]]


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--profile", default=None)
    p.add_argument("--kms-alias", default=None, help="Alias for the CMK (must exist in every region)")
    p.add_argument("--regions", nargs="+", default=None, help="Restrict to these regions")
    p.add_argument("--dry-run", action="store_true", default=True)
    p.add_argument("--apply", dest="dry_run", action="store_false")
    args = p.parse_args()

    session = boto3.Session(profile_name=args.profile) if args.profile else boto3.Session()
    regions = args.regions or enabled_regions(session)
    for region in regions:
        ec2 = session.client("ec2", region_name=region)
        if args.dry_run:
            print(f"[dry-run] {region}: would enable EBS encryption by default")
            continue
        try:
            ec2.enable_ebs_encryption_by_default()
            if args.kms_alias:
                kms = session.client("kms", region_name=region)
                key_id = kms.describe_key(KeyId=args.kms_alias)["KeyMetadata"]["KeyId"]
                ec2.modify_ebs_default_kms_key_id(KmsKeyId=key_id)
            print(f"{region}: default EBS encryption ON")
        except ClientError as exc:
            print(f"{region}: FAILED — {exc}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
