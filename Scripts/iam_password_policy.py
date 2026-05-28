#!/usr/bin/env python3
"""Set the IAM password policy in a single AWS account.

Defaults follow CIS AWS Foundations Benchmark v3 (controls 1.8 and 1.9).

Usage:
  ./iam_password_policy.py --profile {{CUSTOMER_CODE}}-management --apply
"""
from __future__ import annotations

import argparse
import sys

import boto3


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--profile", default=None)
    p.add_argument("--min-length", type=int, default=14)
    p.add_argument("--max-age-days", type=int, default=90)
    p.add_argument("--reuse-prevention", type=int, default=24)
    p.add_argument("--dry-run", action="store_true", default=True)
    p.add_argument("--apply", dest="dry_run", action="store_false")
    args = p.parse_args()

    session = boto3.Session(profile_name=args.profile) if args.profile else boto3.Session()
    iam = session.client("iam")
    policy = dict(
        MinimumPasswordLength=args.min_length,
        RequireSymbols=True,
        RequireNumbers=True,
        RequireUppercaseCharacters=True,
        RequireLowercaseCharacters=True,
        AllowUsersToChangePassword=True,
        MaxPasswordAge=args.max_age_days,
        PasswordReusePrevention=args.reuse_prevention,
        HardExpiry=False,
    )
    if args.dry_run:
        print("[dry-run] Would apply:", policy)
        return 0
    iam.update_account_password_policy(**policy)
    print("Password policy applied.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
