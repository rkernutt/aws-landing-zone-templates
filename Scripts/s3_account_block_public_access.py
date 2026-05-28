#!/usr/bin/env python3
"""Enable S3 account-level Block Public Access in a single AWS account.

All four flags are set to true (recommended baseline). This is in addition to
per-bucket BPA; account-level overrides per-bucket settings.

Usage:
  ./s3_account_block_public_access.py --profile {{CUSTOMER_CODE}}-shared-services --apply
"""
from __future__ import annotations

import argparse
import sys

import boto3


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--profile", default=None)
    p.add_argument("--dry-run", action="store_true", default=True)
    p.add_argument("--apply", dest="dry_run", action="store_false")
    args = p.parse_args()

    session = boto3.Session(profile_name=args.profile) if args.profile else boto3.Session()
    account_id = session.client("sts").get_caller_identity()["Account"]
    s3 = session.client("s3control")

    if args.dry_run:
        print(f"[dry-run] Would enable S3 BPA on account {account_id}.")
        return 0
    s3.put_public_access_block(
        AccountId=account_id,
        PublicAccessBlockConfiguration={
            "BlockPublicAcls": True,
            "IgnorePublicAcls": True,
            "BlockPublicPolicy": True,
            "RestrictPublicBuckets": True,
        },
    )
    print(f"S3 BPA enabled on account {account_id}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
