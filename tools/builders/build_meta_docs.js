// Template Pack README + Placeholder Reference (.docx)
const C = require("./docx_common.js");
const {
  Packer, Paragraph, TextRun, HeadingLevel, TableOfContents,
  H1, H2, H3, P, BULLET, SPACER, PAGEBREAK,
  richP, richBullet, makeTable, build, fs,
} = C;

function flat(arr) {
  const out = [];
  for (const x of arr) Array.isArray(x) ? out.push(...flat(x)) : out.push(x);
  return out;
}

// ============================================================
// README — 00-Template-Pack-README.docx
// ============================================================
const readme = flat([
  new Paragraph({ style: "Title", children: [new TextRun("AWS Landing Zone Template Pack")] }),
  new Paragraph({ style: "Subtitle", children: [new TextRun("README — How to use this pack with a new customer")] }),
  SPACER(),
  richP("Maintained by: {{PARTNER_NAME}}    |    Pack version: 1.0    |    Last updated: {{DOC_DATE}}"),
  PAGEBREAK(),

  H1("Table of Contents"),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
  PAGEBREAK(),

  H1("1. What's in the pack"),
  richP("This pack is a complete starter kit for designing and documenting an AWS Landing Zone for a new customer. It captures a current (2026) AWS reference architecture for regulated industries, generalised so it can be reused without bespoke rework."),
  makeTable({
    headers: ["File", "Purpose"],
    rows: [
      ["00-Template-Pack-README.docx", "This README. Read first."],
      ["01-Placeholder-Reference.docx", "Canonical list of {{PLACEHOLDERS}} used across all documents."],
      ["02-HLD-Template.docx", "High Level Design — architecture, decisions, account structure."],
      ["03-LLD-Template.docx", "Low Level Design — detailed config, ARNs, policies, JSON snippets."],
      ["04-CCOE-MVP-SOW-Template.docx", "Statement of Work for a CCoE MVP engagement."],
      ["05-CCOE-Approach-Template.pptx", "9-slide pitch deck for the CCoE MVP."],
      ["06-Accounts-Template.xlsx", "Accounts inventory, OUs, tag policies, SCP attachment plan."],
      ["07-Subnet-Plan-Template.xlsx", "Subnet allocation per OU / BU / environment / tier."],
      ["08-CIS-Controls-Tracker-Template.xlsx", "CIS AWS Foundations Benchmark v3 status tracker."],
      ["Scripts/", "Modern boto3 utility scripts + CloudFormation snippets + legacy reference."],
    ],
    widths: [3500, 5526],
  }),

  H1("2. Recommended delivery sequence"),
  richP("Use the pack in the order below for a typical customer engagement. Each step depends on the artefacts produced before it."),
  makeTable({
    headers: ["Step", "Artefact", "Owner", "Notes"],
    rows: [
      ["1. Pre-sale", "05-CCOE-Approach-Template.pptx", "Account Manager", "Tailor to customer; use as discovery framing."],
      ["2. Engagement", "04-CCOE-MVP-SOW-Template.docx", "Account Manager / Architect", "Fill commercial placeholders, get signature."],
      ["3. Placeholder kick-off", "01-Placeholder-Reference.docx", "Lead Architect", "Capture all values in the first design workshop."],
      ["4. Design", "02-HLD-Template.docx", "Lead Architect", "Reuse content; tune to customer-specific requirements."],
      ["5. Design", "03-LLD-Template.docx", "Lead Architect + Engineers", "Populate ARNs, account IDs, JSON policies as build progresses."],
      ["6. Network plan", "07-Subnet-Plan-Template.xlsx", "Network Engineer", "Allocate CIDRs; reflect into LLD §6."],
      ["7. Account vending", "06-Accounts-Template.xlsx", "Cloud Platform", "Single source of truth for accounts."],
      ["8. Compliance tracking", "08-CIS-Controls-Tracker-Template.xlsx", "Security Engineer", "Live during build; output evidence pack at handover."],
      ["9. Build automation", "Scripts/", "Engineers", "Modernised scripts and CloudFormation; prefer Control Tower / LZA where possible."],
    ],
    widths: [800, 3600, 2200, 2426],
  }),

  H1("3. Working with placeholders"),
  richP("Every customer-specific value is replaced with a token of the form {{PLACEHOLDER}}, written in red italic in all templates. Open the document, search for \"{{\" and replace each value. The full taxonomy is in 01-Placeholder-Reference.docx."),
  H2("Suggested workflow"),
  BULLET("Run a workshop in the first week to gather every value in 01-Placeholder-Reference.docx."),
  BULLET("Capture the values in a single source-of-truth spreadsheet (one row per placeholder)."),
  BULLET("Use Word's Find & Replace (Ctrl+H) — search \"{{CUSTOMER_NAME}}\" → replace with the value."),
  BULLET("Repeat for each Office file in the pack."),
  BULLET("Do a final pass: search for any remaining \"{{\" — if any survive, you missed one."),
  H2("Optional: scripted fill-in"),
  richP("For larger engagements consider scripting the substitution. A small Python script using python-docx + openpyxl + python-pptx can do this against a CSV of values in seconds. Sample script included in the Scripts/ folder of future versions."),

  H1("4. Modernisation notes (vs. the 2020 origin)"),
  richP("This pack reflects what we would recommend today (2026). Key differences vs. a typical 2020-era deployment:"),
  makeTable({
    headers: ["Area", "2020 approach", "2026 approach"],
    rows: [
      ["Multi-account orchestration", "Custom CloudFormation StackSets + boto3", "AWS Control Tower + Landing Zone Accelerator (LZA), optional Account Factory for Terraform (AFT)"],
      ["Identity", "AWS SSO + Azure AD SCIM", "IAM Identity Center + Microsoft Entra ID (or Okta / Ping) via SAML + SCIM"],
      ["Preventative policies", "SCPs only", "SCPs + Resource Control Policies (RCPs) + Declarative Policies + Tag Policies + Backup Policies"],
      ["Security tooling", "Security Hub master in Master account", "Delegated administration to Audit account, Security Hub Central Configuration"],
      ["GuardDuty", "Threat detection only", "Runtime Monitoring, EKS, S3, RDS, Lambda, Malware Protection"],
      ["Compliance standards", "CIS v1.2 + custom NIST mapping", "CIS v3, FSBP, NIST 800-53 r5, NIST CSF 2.0, PCI DSS 4.0; AWS Audit Manager for evidence"],
      ["Network inspection", "Palo Alto VM-Series in dedicated VPCs", "Customer's choice: AWS Network Firewall (default) or NGFW VM-Series; AWS Cloud WAN for global topologies"],
      ["Logging", "S3 + Splunk", "CloudTrail Lake + S3 (Object Lock) + cross-account subscription to customer SIEM"],
      ["Backup", "Customer-managed (Rubrik etc.)", "AWS Backup organisation policies + Vault Lock + optional Backup account"],
      ["Compute / VPC defaults", "Manual SCP", "Declarative policies (block public AMIs, enforce default EBS encryption, IMDSv2 required)"],
    ],
    widths: [2200, 3000, 3826],
  }),

  H1("5. Quality bar"),
  BULLET("All templates use placeholders only — no customer-specific data should leak from one engagement to another."),
  BULLET("Cross-document consistency: account names, CIDRs and OU names match across HLD, LLD, accounts workbook and subnet plan."),
  BULLET("Office files validate cleanly in Word / PowerPoint / Excel."),
  BULLET("Scripts are dry-run by default; require explicit --apply for changes."),
  BULLET("No secrets, passwords or internal URLs should ever be checked into this folder. If you see one, delete it and rotate."),

  H1("6. Maintenance"),
  richP("This pack should be updated at least quarterly to reflect new AWS services and changes to AWS guidance. Suggested cadence:"),
  BULLET("Monthly: review re:Invent / re:Inforce announcements; flag anything that affects the design."),
  BULLET("Quarterly: refresh CIS controls, Security Hub standards, GuardDuty protection plans."),
  BULLET("Per engagement: capture any improvements / fixes back into the pack via a PR-style review."),
  H2("Known follow-ups"),
  BULLET("Add Mermaid / draw.io source files for the diagrams referenced in HLD §2 and §6."),
  BULLET("Add an example filled-in instance of the pack (\"Acme Bank\") as a worked reference."),
  BULLET("Optional: Terraform module references for Control Tower + AFT."),
]);

Packer.toBuffer(build("Template Pack README", "How to use the AWS Landing Zone pack", readme)).then((buf) => {
  fs.writeFileSync(process.argv[2], buf);
  console.log("Wrote " + process.argv[2]);
});
