#!/usr/bin/env python3
"""Shared helpers for cross-account scripts.

Functions
---------
- load_accounts(path)            Read accounts from a CSV (account_id,alias,environment,ou)
- assume_role(account_id, role)  Return a session for the target account
- regions_for_session(session)   Return enabled regions
- log(msg, level)                Simple stdout logger
"""
from __future__ import annotations

import csv
import dataclasses
import logging
import sys
from typing import Iterator

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

LOG = logging.getLogger("lz")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s :: %(message)s")

BOTO_CONFIG = Config(retries={"max_attempts": 10, "mode": "adaptive"})


@dataclasses.dataclass(frozen=True)
class Account:
    account_id: str
    alias: str = ""
    environment: str = ""
    ou: str = ""


def load_accounts(path: str) -> list[Account]:
    """Load accounts from a CSV file.

    Expected header (any order; only ``account_id`` is required):
        account_id, alias, environment, ou
    Comment lines starting with ``#`` are ignored. ``account_id`` is normalised
    to a 12-digit zero-padded string.
    """
    out: list[Account] = []
    with open(path, newline="") as f:
        reader = csv.DictReader(line for line in f if not line.startswith("#"))
        for row in reader:
            aid = (row.get("account_id") or "").strip()
            if not aid:
                continue
            out.append(
                Account(
                    account_id=aid.zfill(12),
                    alias=(row.get("alias") or "").strip(),
                    environment=(row.get("environment") or "").strip(),
                    ou=(row.get("ou") or "").strip(),
                )
            )
    LOG.info("Loaded %d accounts from %s", len(out), path)
    return out


def assume_role(
    account_id: str,
    role_name: str = "AWSControlTowerExecution",
    session_name: str = "lz-tooling",
    base_session: boto3.session.Session | None = None,
) -> boto3.session.Session:
    """Assume ``role_name`` in ``account_id`` and return a new session.

    Raises ``ClientError`` on failure (caller decides whether to skip / fail).
    """
    sts = (base_session or boto3.Session()).client("sts", config=BOTO_CONFIG)
    role_arn = f"arn:aws:iam::{account_id}:role/{role_name}"
    creds = sts.assume_role(RoleArn=role_arn, RoleSessionName=session_name)["Credentials"]
    return boto3.Session(
        aws_access_key_id=creds["AccessKeyId"],
        aws_secret_access_key=creds["SecretAccessKey"],
        aws_session_token=creds["SessionToken"],
    )


def regions_for_session(session: boto3.session.Session, restrict: list[str] | None = None) -> list[str]:
    """Return enabled regions for the account, optionally restricted to ``restrict``."""
    ec2 = session.client("ec2", region_name="us-east-1", config=BOTO_CONFIG)
    enabled = [r["RegionName"] for r in ec2.describe_regions(AllRegions=False)["Regions"]]
    if restrict:
        return [r for r in enabled if r in restrict]
    return enabled


def for_each_account(
    accounts: list[Account],
    role_name: str,
    fn,
    continue_on_error: bool = True,
) -> dict[str, str]:
    """Iterate accounts, assume role, and invoke ``fn(session, account)``.

    Returns a dict ``{account_id: status}`` where status is ``OK`` or an error.
    """
    results: dict[str, str] = {}
    for acct in accounts:
        try:
            session = assume_role(acct.account_id, role_name)
            fn(session, acct)
            results[acct.account_id] = "OK"
            LOG.info("[%s/%s] done", acct.account_id, acct.alias or "?")
        except ClientError as exc:
            msg = f"{type(exc).__name__}: {exc}"
            results[acct.account_id] = msg
            LOG.error("[%s] FAILED — %s", acct.account_id, msg)
            if not continue_on_error:
                raise
    return results


def confirm_or_exit(action: str, dry_run: bool) -> None:
    """Print a banner and exit if dry-run. Otherwise return."""
    if dry_run:
        print(f"\n=== DRY RUN: '{action}'. Pass --apply to make changes. ===\n")
        sys.exit(0)
