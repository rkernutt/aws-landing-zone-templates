# AWS Landing Zone Template Pack

A reusable starter kit for designing and documenting an AWS Landing Zone for a
new customer. Captures a current (2026) reference architecture for regulated
industries, aligned to AWS Control Tower, the Landing Zone Accelerator (LZA)
and the AWS Security Reference Architecture.

Everything in this repo is fully genericised — customer-specific values are
written as `{{PLACEHOLDERS}}` (red italic in the Office files) so the same
pack can be reused for any engagement.

## Contents

| File / folder                          | Purpose |
|----------------------------------------|---------|
| `00-Template-Pack-README.docx`         | Read first. How to use the pack with a new customer. |
| `01-Placeholder-Reference.docx`        | Canonical list of every `{{PLACEHOLDER}}` used. |
| `02-HLD-Template.docx`                 | High Level Design (24 pages). |
| `03-LLD-Template.docx`                 | Low Level Design (35+ pages) with policy JSON. |
| `04-CCOE-MVP-SOW-Template.docx`        | Statement of Work for a CCoE MVP engagement. |
| `05-CCOE-Approach-Template.pptx`       | 9-slide pitch deck for the CCoE MVP. |
| `06-Accounts-Template.xlsx`            | Accounts inventory, OUs, tag policies, SCP attachment plan. |
| `07-Subnet-Plan-Template.xlsx`         | Subnet allocation per OU / BU / environment / tier. |
| `08-CIS-Controls-Tracker-Template.xlsx`| CIS AWS Foundations Benchmark v3 status tracker. |
| `Scripts/`                             | Modern boto3 utility scripts + CloudFormation snippets. |
| `Scripts/legacy/`                      | 2020-vintage reference scripts (not for new deployments). |
| `.github/workflows/`                   | CI checks: validate docx schemas, recalc xlsx formulas, leak-check. |

## Quick start

1. Clone the repo.
2. Open `00-Template-Pack-README.docx` and read the full instructions.
3. Run a placeholder-capture workshop using `01-Placeholder-Reference.docx`.
4. Find-and-replace `{{PLACEHOLDER}}` across each Office file with the captured
   values.
5. Tune section content where the customer differs from the reference design.

## Modernisation vs. 2020-era deployments

| Area                       | 2020 approach                          | 2026 approach |
|----------------------------|----------------------------------------|---------------|
| Multi-account orchestration| Custom CloudFormation StackSets        | Control Tower + LZA (+ optional AFT) |
| Identity                   | AWS SSO + Azure AD                     | IAM Identity Center + Entra ID / Okta |
| Preventative policies      | SCPs only                              | SCPs + RCPs + Declarative + Tag + Backup policies |
| Security tooling           | Per-account, hub in management         | Delegated to Audit, Security Hub Central Configuration |
| GuardDuty                  | Threat detection only                  | + Runtime Monitoring, EKS, S3, RDS, Lambda, Malware |
| Compliance                 | CIS v1.2 + custom NIST mapping         | CIS v3, FSBP, NIST 800-53 r5, NIST CSF 2.0, PCI DSS 4.0 |
| Network inspection         | NGFW VM-Series                         | AWS Network Firewall by default (NGFW as alternative) |
| Logging                    | S3 + SIEM                              | CloudTrail Lake + S3 (Object Lock) + cross-account → SIEM |
| Backup                     | Customer-managed (Rubrik etc.)         | AWS Backup org policies + Vault Lock |

See `00-Template-Pack-README.docx` § 4 for the full table.

## Working on this repo

- All content is treated as **template** — never commit a customer-specific
  value. Use `{{PLACEHOLDER}}` tokens defined in `01-Placeholder-Reference.docx`.
- The Office files (.docx / .pptx / .xlsx) are stored as binaries. To regenerate
  them from source, see `tools/` (Node.js / Python builders).
- Pull requests run the CI workflow which: validates docx schemas, recalculates
  xlsx formulas (catches #REF!/#DIV/0!), and runs a leak-check for prohibited
  customer-specific terms.

## Roadmap

- [ ] Add Mermaid / draw.io source files for the diagrams referenced in HLD §2 and §6.
- [ ] Add an example filled-in instance ("Acme Bank") as a worked reference.
- [ ] Terraform module references for Control Tower + AFT.
- [ ] Optional fill-in script (CSV → all Office files in one pass).

## Licence

All rights reserved. Internal use only — do not redistribute externally without
permission.
