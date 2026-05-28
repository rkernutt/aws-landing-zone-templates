# Scripts Pack

This folder accompanies the AWS Landing Zone template pack. It provides a small
set of modern, parameterised utility scripts plus CloudFormation snippets that
support a Control Tower + Landing Zone Accelerator delivery.

A set of 2020-vintage scripts is retained under `legacy/` for reference, but
most have been **superseded by AWS-native managed services** and should not be
redeployed as-is for new customers. The mapping table below shows the modern
equivalent for each legacy script.

## Folder layout

```
Scripts/
├── README.md                              (this file)
├── account_baseline.py                    Apply IAM/S3/EBS baseline to one or many accounts
├── enable_security_services.py            Enable + delegate Security Hub, GuardDuty, Config, Inspector
├── iam_password_policy.py                 Single-account IAM password policy
├── s3_account_block_public_access.py      Single-account S3 BPA + default encryption
├── default_ebs_encryption.py              Enable default EBS encryption in all regions
├── org_helper.py                          Shared helpers (assume role, paginate, etc.)
├── cloudformation/
│   ├── log-archive-bucket.yaml            Central CloudTrail / Config / VPC Flow logs bucket
│   ├── config-recorder.yaml               Per-account AWS Config recorder (use as StackSet)
│   └── securityhub-finding-forwarder.yaml EventBridge → SNS forwarder for Security Hub findings
└── legacy/                                Original 2020 scripts (read-only reference)
```

## Modernisation mapping

| Legacy script                              | What it did (2020)                                           | Recommended 2026 approach |
|--------------------------------------------|--------------------------------------------------------------|---------------------------|
| `IAM_Password_Policy.py`                   | Iterate accounts, set password policy via assumed role.       | `account_baseline.py` (parameterised) or AFT account customisations. |
| `Networkconfig.py`                         | Manage default VPC NACLs and SGs per account.                 | LZA `networkConfig.yaml` (NACL, SG, default VPC removal). |
| `S3_Public_Access.py`                      | Apply S3 Block Public Access at account level.                | `s3_account_block_public_access.py` or AFT customisation. |
| `Stackremoval.py`                          | Tidy up StackSet stack instances.                             | CloudFormation StackSets console / CLI; no script needed. |
| `awsconfig.py` / `deployawsconfig.yml`     | Enable AWS Config per account.                                | Control Tower + LZA enable Config automatically; for advanced cases use `cloudformation/config-recorder.yaml` as StackSet. |
| `awsconfigaggregator.yml`                  | Cross-account Config aggregator.                              | Control Tower delegated admin to Audit account aggregator. |
| `awsconfiglistcfpks*.py`                   | List Config conformance packs per account.                    | LZA + Security Hub Central Configuration. |
| `checkencryption.py`                       | Audit EBS / S3 encryption.                                    | AWS Config managed rules + Security Hub FSBP standard. |
| `cisconfpack.yml` / `nistconfpack.yml`     | CIS / NIST Config conformance packs.                          | Security Hub standards (CIS v3, FSBP, NIST 800-53 r5). |
| `compliance_lambda.py`                     | Auto-remediation for CloudTrail KMS finding.                  | Security Hub auto-remediation via EventBridge → SSM Automation runbooks. |
| `configconformancestatus.py`               | Report on conformance pack status.                            | Security Hub conformance dashboards. |
| `configrulesdeletebystring.py`             | Bulk delete Config rules.                                     | LZA configuration management. |
| `configrulesearchwitharn.py`               | Find Config rule by ARN.                                      | AWS Config console / `aws configservice describe-config-rules`. |
| `ebsencryption.py`                         | Enable default EBS encryption per region/account.             | `default_ebs_encryption.py` or declarative policy (recommended). |
| `getbucketpolicy.py`                       | Dump bucket policies for review.                              | One-off boto3 helper; use AWS Config or IAM Access Analyzer for ongoing review. |
| `netacctea.py` / `netacctinbound.py` / `netacctoutbound.py` | Apply NACLs to network account VPCs. | LZA `networkConfig.yaml` (subnet NACLs). |
| `removeconfigrule*.py`                     | Remove Config rules.                                          | LZA configuration management. |
| `s3_policy_addition.py`                    | Append statement to S3 bucket policies.                       | Manage via Terraform / CloudFormation in source control. |
| `s3security.py`                            | Apply encryption, BPA and ACL config to S3 buckets.            | `s3_account_block_public_access.py` + RCP `EnforceTLSEverywhere`. |
| `securityhub.py`                           | Enable Security Hub on each account & invite members.          | `enable_security_services.py` (delegated admin model). |
| `stakexecutionrole.py`                     | Create the legacy StackSet execution role.                     | Control Tower deploys this automatically; no script needed. |
| `S3 Bucket for Logs.yml`                   | CloudFormation for log archive bucket.                         | `cloudformation/log-archive-bucket.yaml` (with Object Lock + KMS). |

## Pre-requisites

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install boto3 botocore
```

Use AWS credentials for the **management account** with sufficient permission to
assume `OrganizationAccountAccessRole` (or `AWSControlTowerExecution`) in member
accounts. All scripts accept the role name to assume via `--role-name`.

## Notes & safety

- All scripts default to **dry-run** mode (`--dry-run`); pass `--apply` to make
  changes. Always run a dry-run first.
- Scripts log to stdout. Pipe to a file for audit (`./script.py --apply | tee run.log`).
- For destructive operations, scripts require an extra `--confirm` flag.
- Account IDs are read from the `06-Accounts-Template.xlsx` workbook by default;
  override with `--accounts-csv`.
- All scripts assume a Python ≥ 3.10 runtime. Tested with boto3 ≥ 1.34.
- **Never commit credentials or management URLs**: cleanup checks before sharing
  any engagement folder externally — appliance management URLs and pre-shared
  keys have a habit of being left behind in handover artefacts.

## Quick examples

Apply the account baseline to all workload accounts:

```bash
./account_baseline.py \
  --accounts-csv ./accounts.csv \
  --role-name AWSControlTowerExecution \
  --apply
```

Enable Security Hub org-wide with Audit as delegated admin:

```bash
./enable_security_services.py \
  --management-profile {{CUSTOMER_CODE}}-management \
  --audit-account-id {{AUDIT_ACCOUNT_ID}} \
  --regions {{PRIMARY_REGION}} \
  --apply
```
