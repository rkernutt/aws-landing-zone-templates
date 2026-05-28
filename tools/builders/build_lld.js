// AWS Landing Zone — Low Level Design template (2026)
const C = require("./docx_common.js");
const { Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak,
  TableOfContents,
  H1, H2, H3, H4, P, BULLET, SPACER, PAGEBREAK, CAPTION,
  richP, richBullet, makeTable, build, fs } = C;

const codeP = (txt) => new Paragraph({ children: [new TextRun({ text: txt, font: "Consolas", size: 18 })] });
const codeBlock = (lines) => lines.map((l) => codeP(l));

// ---------- Title block ----------
const titleBlock = [
  new Paragraph({ style: "Title", children: [new TextRun("AWS Landing Zone")] }),
  new Paragraph({ style: "Subtitle", children: [new TextRun("Low Level Design")] }),
  SPACER(),
  richP("Prepared for: {{CUSTOMER_NAME}}"),
  richP("Prepared by: {{PARTNER_NAME}}"),
  richP("Document version: {{DOC_VERSION}}    |    Date: {{DOC_DATE}}"),
  richP("Classification: {{DOC_CLASSIFICATION}}"),
  PAGEBREAK(),
];

const documentControl = [
  H1("Document Control"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Project", "{{PROJECT_NAME}}"],
      ["Customer", "{{CUSTOMER_NAME}}"],
      ["Delivery partner", "{{PARTNER_NAME}}"],
      ["Creation date", "{{DOC_DATE}}"],
      ["Owner / author", "{{DOC_AUTHOR}}"],
      ["Audience", "External"],
      ["Document classification", "{{DOC_CLASSIFICATION}}"],
    ],
    widths: [3000, 6026],
  }),
  SPACER(),
  H2("Revision History"),
  makeTable({
    headers: ["Version", "Revision Details", "Revised By", "Date"],
    rows: [
      ["0.1", "First draft", "{{DOC_AUTHOR}}", "{{DOC_DATE}}"],
      ["0.2", "Internal review", "", ""],
      ["1.0", "Initial release", "", ""],
    ],
  }),
  PAGEBREAK(),
];

const toc = [
  H1("Table of Contents"),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
  PAGEBREAK(),
];

const exec = [
  H1("Executive Summary"),
  H2("Document Purpose"),
  richP("This Low-Level Design (LLD) document captures detailed configuration values, resource names, identifiers, policies and operational settings for the AWS Landing Zone deployed for {{CUSTOMER_NAME}}. It is the companion document to the High-Level Design (HLD) and the source of truth for as-built configuration."),
  richP("Note: This document contains specific resource identifiers (account IDs, ARNs, CIDR blocks, IDs of TGWs/VPCs etc.). Update those values during build using the {{CUSTOMER_SHORT}} cbaccounts / MasterSubnetList workbooks and the {{DEPLOY_TOOLING}} state."),
  H2("Intended Audience"),
  BULLET("Cloud platform engineers and operations"),
  BULLET("Security engineers"),
  BULLET("Network engineers"),
  BULLET("Auditors and risk teams"),
  PAGEBREAK(),
];

// ---------- Org & accounts ----------
const orgSection = [
  H1("Organisation Design"),
  H2("Organisation Details"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Organisation ID", "{{ORG_ID}}"],
      ["Management account name", "{{MANAGEMENT_ACCOUNT_NAME}}"],
      ["Management account ID", "{{MANAGEMENT_ACCOUNT_ID}}"],
      ["Management root email", "aws+root@{{CUSTOMER_DOMAIN}}"],
      ["Feature set", "ALL_FEATURES"],
      ["Control Tower home region", "{{PRIMARY_REGION}}"],
      ["Governed regions", "{{PRIMARY_REGION}} (+ {{SECONDARY_REGION}} if enabled)"],
    ],
    widths: [3000, 6026],
  }),
  H2("Trusted Access"),
  richP("Trusted access is enabled for the AWS services that operate organisation-wide. Other services are managed via delegated admin from the Audit account."),
  makeTable({
    headers: ["Service", "Status", "Delegated admin"],
    rows: [
      ["AWS CloudTrail", "Enabled (org trail)", "—"],
      ["AWS Config", "Enabled", "Audit"],
      ["AWS Security Hub", "Enabled", "Audit"],
      ["Amazon GuardDuty", "Enabled", "Audit"],
      ["AWS IAM Access Analyzer", "Enabled", "Audit"],
      ["Amazon Inspector", "Enabled", "Audit"],
      ["Amazon Macie", "Enabled", "Audit"],
      ["AWS Audit Manager", "Enabled", "Audit"],
      ["AWS Backup", "Enabled", "Backup (or Audit)"],
      ["AWS Service Catalog", "Enabled", "Shared Services"],
      ["AWS Systems Manager", "Enabled", "Audit"],
      ["AWS RAM", "Enabled", "Network"],
      ["AWS Resource Explorer", "Enabled", "Audit"],
      ["Tag Policies", "Enabled", "—"],
      ["AI services opt-out policies", "Enabled", "—"],
      ["Backup policies", "Enabled", "Backup"],
      ["Declarative policies", "Enabled", "—"],
    ],
    widths: [3000, 3000, 3026],
  }),
  H2("Organisational Unit Structure"),
  makeTable({
    headers: ["OU", "Parent", "Purpose"],
    rows: [
      ["Security", "Root", "Houses Log Archive and Audit accounts."],
      ["Infrastructure", "Root", "Network and Shared Services accounts."],
      ["Workloads", "Root", "Container for Production / NonProduction."],
      ["Workloads/Production", "Workloads", "Per-BU production workload accounts."],
      ["Workloads/NonProduction", "Workloads", "Per-BU dev/test/UAT/SIT/preprod accounts."],
      ["Sandbox", "Root", "Throwaway dev / PoC accounts."],
      ["PolicyStaging", "Root", "OU for testing new SCP / RCP changes."],
      ["Suspended", "Root", "Decommissioned accounts pending closure."],
    ],
    widths: [2400, 1800, 4826],
  }),
  PAGEBREAK(),
];

const accountInventory = [
  H1("Account Inventory"),
  richP("All accounts at day one are listed in the accompanying 06-Accounts-Template.xlsx workbook. The headline entries are reproduced below; the workbook is authoritative."),
  H2("Foundation Accounts"),
  makeTable({
    headers: ["Account", "Alias", "Root Email", "Account ID"],
    rows: [
      ["Management", "{{CUSTOMER_CODE}}-management", "aws+management@{{CUSTOMER_DOMAIN}}", "{{MANAGEMENT_ACCOUNT_ID}}"],
      ["Log Archive", "{{CUSTOMER_CODE}}-log-archive", "aws+logs@{{CUSTOMER_DOMAIN}}", "{{LOG_ARCHIVE_ACCOUNT_ID}}"],
      ["Audit", "{{CUSTOMER_CODE}}-audit", "aws+audit@{{CUSTOMER_DOMAIN}}", "{{AUDIT_ACCOUNT_ID}}"],
      ["Network", "{{CUSTOMER_CODE}}-network", "aws+network@{{CUSTOMER_DOMAIN}}", "{{NETWORK_ACCOUNT_ID}}"],
      ["Shared Services", "{{CUSTOMER_CODE}}-shared-services", "aws+shared@{{CUSTOMER_DOMAIN}}", "{{SHARED_SERVICES_ACCOUNT_ID}}"],
      ["Backup (optional)", "{{CUSTOMER_CODE}}-backup", "aws+backup@{{CUSTOMER_DOMAIN}}", "TBD"],
    ],
  }),
  H2("Workload Accounts (per Business Unit)"),
  richP("For each business unit in {{BUSINESS_UNITS}}, the following accounts are created (subject to the env-per-BU scope: {{ENV_PER_BU}}):"),
  makeTable({
    headers: ["Account suffix", "Alias example", "Environment"],
    rows: [
      ["-prod", "{{CUSTOMER_CODE}}-<bu>-prod", "Production"],
      ["-preprod", "{{CUSTOMER_CODE}}-<bu>-preprod", "Pre-Production"],
      ["-uat", "{{CUSTOMER_CODE}}-<bu>-uat", "UAT"],
      ["-sit", "{{CUSTOMER_CODE}}-<bu>-sit", "System Integration Test"],
      ["-test", "{{CUSTOMER_CODE}}-<bu>-test", "Test"],
      ["-dev", "{{CUSTOMER_CODE}}-<bu>-dev", "Development"],
    ],
  }),
  PAGEBREAK(),
];

// ---------- Policies ----------
const policiesSection = [
  H1("Organisation Policies"),
  H2("Policy Inventory"),
  makeTable({
    headers: ["Policy Type", "Status", "Attached At"],
    rows: [
      ["Service Control Policies (SCP)", "Enabled", "Root + per-OU"],
      ["Resource Control Policies (RCP)", "Enabled", "Root + per-OU"],
      ["Tag Policies", "Enabled", "Root"],
      ["AI services opt-out policies", "Enabled", "Root"],
      ["Backup policies", "Enabled", "Per-OU"],
      ["Chatbot policies", "Enabled", "Root"],
      ["Declarative policies", "Enabled", "Root + per-OU"],
    ],
    widths: [3500, 2500, 3026],
  }),
  H2("SCP — DenyRootUser"),
  richP("Applied at the Root OU. Blocks use of root user in any member account."),
  codeBlock([
    "{",
    "  \"Version\": \"2012-10-17\",",
    "  \"Statement\": [",
    "    {",
    "      \"Sid\": \"DenyRootUser\",",
    "      \"Effect\": \"Deny\",",
    "      \"Action\": \"*\",",
    "      \"Resource\": \"*\",",
    "      \"Condition\": { \"StringLike\": { \"aws:PrincipalArn\": [\"arn:aws:iam::*:root\"] } }",
    "    }",
    "  ]",
    "}",
  ]),
  H2("SCP — RegionRestriction"),
  richP("Restricts member accounts to the approved regions. Global services are allowed by NotAction."),
  codeBlock([
    "{",
    "  \"Version\": \"2012-10-17\",",
    "  \"Statement\": [{",
    "    \"Sid\": \"DenyOutsideAllowedRegions\",",
    "    \"Effect\": \"Deny\",",
    "    \"NotAction\": [",
    "      \"iam:*\", \"organizations:*\", \"route53:*\", \"budgets:*\",",
    "      \"cloudfront:*\", \"globalaccelerator:*\", \"support:*\",",
    "      \"sts:*\", \"waf:*\", \"wafv2:*\", \"shield:*\", \"a4b:*\",",
    "      \"chatbot:*\", \"health:*\", \"trustedadvisor:*\"",
    "    ],",
    "    \"Resource\": \"*\",",
    "    \"Condition\": {",
    "      \"StringNotEquals\": {",
    "        \"aws:RequestedRegion\": [\"{{PRIMARY_REGION}}\", \"{{SECONDARY_REGION}}\"]",
    "      }",
    "    }",
    "  }]",
    "}",
  ]),
  H2("SCP — DenyDisableSecurityServices"),
  codeBlock([
    "{",
    "  \"Version\": \"2012-10-17\",",
    "  \"Statement\": [{",
    "    \"Effect\": \"Deny\",",
    "    \"Action\": [",
    "      \"cloudtrail:StopLogging\", \"cloudtrail:DeleteTrail\",",
    "      \"config:StopConfigurationRecorder\", \"config:DeleteConfigurationRecorder\",",
    "      \"config:DeleteDeliveryChannel\", \"config:DeleteConfigRule\",",
    "      \"guardduty:DeleteDetector\", \"guardduty:DisassociateFromMasterAccount\",",
    "      \"securityhub:DisableSecurityHub\", \"securityhub:DisassociateFromMasterAccount\",",
    "      \"inspector2:Disable\", \"inspector2:Deactivate\",",
    "      \"accessanalyzer:DeleteAnalyzer\",",
    "      \"macie2:DisableMacie\", \"macie2:DisassociateFromMasterAccount\"",
    "    ],",
    "    \"Resource\": \"*\"",
    "  }]",
    "}",
  ]),
  H2("RCP — Require TLS on S3 / SQS / SNS"),
  richP("Applied at the Root. Forces all access to the listed services to use TLS."),
  codeBlock([
    "{",
    "  \"Version\": \"2012-10-17\",",
    "  \"Statement\": [{",
    "    \"Sid\": \"EnforceTLSEverywhere\",",
    "    \"Effect\": \"Deny\",",
    "    \"Principal\": \"*\",",
    "    \"Action\": [\"s3:*\", \"sqs:*\", \"sns:*\"],",
    "    \"Resource\": \"*\",",
    "    \"Condition\": { \"BoolIfExists\": { \"aws:SecureTransport\": \"false\" } }",
    "  }]",
    "}",
  ]),
  H2("Tag Policy — Mandatory Keys"),
  richP("Mandatory tag keys: {{TAGGING_KEYS}}. Each key has a controlled allow-list per business unit / environment. The full tag policy JSON is held in the deployment repository."),
  H2("AI Services Opt-out"),
  richP("Applied at root; opts {{CUSTOMER_SHORT}} out of all AWS AI service training-data usage."),
  codeBlock([
    "{",
    "  \"services\": {",
    "    \"@@operators_allowed_for_child_policies\": [\"@@none\"],",
    "    \"default\": {",
    "      \"@@operators_allowed_for_child_policies\": [\"@@none\"],",
    "      \"opt_out_policy\": {",
    "        \"@@operators_allowed_for_child_policies\": [\"@@none\"],",
    "        \"@@assign\": \"optOut\"",
    "      }",
    "    }",
    "  }",
    "}",
  ]),
  PAGEBREAK(),
];

// ---------- Identity ----------
const identitySection = [
  H1("Identity & Access Management"),
  H2("IAM Identity Center"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Region", "{{PRIMARY_REGION}}"],
      ["Identity source", "External — {{IDP_PRODUCT}}"],
      ["Protocol", "{{IDP_PROTOCOL}}"],
      ["User portal URL", "{{SSO_PORTAL_URL}}"],
      ["Session duration default", "1 hour (PowerUser/Admin), 4 hours (read-only)"],
      ["MFA", "Enforced at IdP"],
    ],
    widths: [3000, 6026],
  }),
  H2("Permission Sets"),
  makeTable({
    headers: ["Permission Set", "Backing Policy", "Mapped to (IdP group)"],
    rows: [
      ["LZ-Admin", "AdministratorAccess + audit trail conditions", "{{BREAK_GLASS_GROUP}}"],
      ["CloudPlatformEngineer", "Custom managed policy", "{{CUSTOMER_CODE}}-cloud-platform"],
      ["NetworkAdministrator", "NetworkAdministrator + custom", "{{CUSTOMER_CODE}}-network-admins"],
      ["SecurityAdministrator", "Custom security policy", "{{CUSTOMER_CODE}}-security-admins"],
      ["SecurityAuditor", "SecurityAudit + ViewOnlyAccess", "{{CUSTOMER_CODE}}-security-auditors"],
      ["WorkloadAdmin", "PowerUserAccess + IAM constraints", "{{CUSTOMER_CODE}}-<workload>-admins"],
      ["WorkloadDeveloper", "Custom developer policy", "{{CUSTOMER_CODE}}-<workload>-devs"],
      ["WorkloadReadOnly", "ViewOnlyAccess", "{{CUSTOMER_CODE}}-<workload>-readonly"],
      ["FinOps", "Custom FinOps policy", "{{CUSTOMER_CODE}}-finops"],
      ["Auditor", "SecurityAudit + ReadOnly + time-bound", "{{CUSTOMER_CODE}}-external-auditors"],
    ],
  }),
  H2("Break-glass IAM Users"),
  richP("Two IAM users are created in the management account in the group {{BREAK_GLASS_GROUP}}. Each user has hardware MFA enforced via the EnforceMFA policy below. Credentials are stored in a corporate vault; usage is alerted to {{SIEM_PRODUCT}}."),
  H3("EnforceMFA Policy"),
  codeBlock([
    "{",
    "  \"Version\": \"2012-10-17\",",
    "  \"Statement\": [",
    "    {",
    "      \"Sid\": \"AllowViewAccountInfo\",",
    "      \"Effect\": \"Allow\",",
    "      \"Action\": [\"iam:GetAccountPasswordPolicy\", \"iam:GetAccountSummary\", \"iam:ListVirtualMFADevices\"],",
    "      \"Resource\": \"*\"",
    "    },",
    "    {",
    "      \"Sid\": \"DenyAllExceptListedIfNoMFA\",",
    "      \"Effect\": \"Deny\",",
    "      \"NotAction\": [",
    "        \"iam:CreateVirtualMFADevice\", \"iam:EnableMFADevice\",",
    "        \"iam:GetUser\", \"iam:ListMFADevices\",",
    "        \"iam:ListVirtualMFADevices\", \"iam:ResyncMFADevice\",",
    "        \"sts:GetSessionToken\"",
    "      ],",
    "      \"Resource\": \"*\",",
    "      \"Condition\": { \"BoolIfExists\": { \"aws:MultiFactorAuthPresent\": \"false\" } }",
    "    }",
    "  ]",
    "}",
  ]),
  H2("IAM Password Policy"),
  BULLET("Minimum password length: 14"),
  BULLET("Require: 1 uppercase, 1 lowercase, 1 digit, 1 symbol"),
  BULLET("Password expiry: 90 days"),
  BULLET("Prevent reuse of the last 24 passwords"),
  BULLET("Admin reset required on expiry"),
  H2("Access Keys"),
  richP("Long-lived access keys are denied via SCP except for explicitly allowlisted service / automation roles. Where keys are unavoidable, IAM Access Analyzer flags them and they are rotated automatically via Secrets Manager."),
  PAGEBREAK(),
];

// ---------- Networking ----------
const networkSection = [
  H1("Networking Detailed Design"),
  H2("Defaults Per VPC"),
  makeTable({
    headers: ["Resource", "Naming", "Configuration", "Purpose"],
    rows: [
      ["DHCP Option Set", "{{CUSTOMER_CODE}}-<bu>-<env>-dhcp", "AWS provided", "DNS resolution"],
      ["Default Route Table", "main-do-not-use", "Local only", "Default RT — left empty"],
      ["Default NACL", "default-do-not-use", "Deny all", "Default NACL — locked down"],
      ["Default Security Group", "default-do-not-use", "No rules", "Default SG — empty"],
    ],
  }),
  H2("Top-level IP Allocation"),
  makeTable({
    headers: ["Allocation", "CIDR", "Mask"],
    rows: [
      ["Landing Zone supernet", "{{LZ_SUPERNET}}", "/16"],
      ["Primary region ({{PRIMARY_REGION}})", "{{LZ_REGION_CIDR}}", "/16"],
      ["Secondary region (placeholder)", "(future)", "/16"],
    ],
  }),
  H2("Per-OU Allocation Pattern"),
  makeTable({
    headers: ["Allocation", "Mask", "Hosts"],
    rows: [
      ["Network / Shared / Sandbox", "/19", "8190"],
      ["Per Business Unit", "{{VPC_NETMASK_BU}}", "8190 (default /19)"],
      ["Per Environment within BU", "{{VPC_NETMASK_ENV}}", "2046 (default /21)"],
    ],
  }),
  richP("Full subnet allocation is maintained in the 07-Subnet-Plan-Template.xlsx workbook."),
  H2("Tier Allocation (per Environment VPC)"),
  richP("Each environment VPC is split across three tiers, each spanning two Availability Zones in {{PRIMARY_REGION}}:"),
  BULLET("Web (public-facing or load-balancer fronted)"),
  BULLET("Application"),
  BULLET("Database"),
  H2("Transit Gateway"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Name", "{{CUSTOMER_CODE}}-tgw-{{PRIMARY_REGION}}"],
      ["ASN", "64512 (private range — adjust if conflicting)"],
      ["DNS support", "Enabled"],
      ["Multicast", "Disabled"],
      ["Default route table association", "Disabled (explicit control)"],
      ["Default route table propagation", "Disabled (explicit control)"],
      ["RAM share", "Shared with Organisation"],
    ],
    widths: [3000, 6026],
  }),
  H2("TGW Route Tables"),
  makeTable({
    headers: ["Route Table", "Purpose"],
    rows: [
      ["core-rt", "Core / on-prem / inspection routing."],
      ["prod-rt", "Production workload VPCs."],
      ["nonprod-rt", "Non-production workload VPCs."],
      ["sandbox-rt", "Sandbox accounts (isolated)."],
      ["blackhole-rt", "Catch-all blackhole for unwanted east-west flows."],
    ],
    widths: [2400, 6626],
  }),
  H2("Inspection VPC ({{INSPECTION_PRODUCT}})"),
  richP("Three inspection roles deployed (where required): egress, ingress, east-west. See LLD § 6 for instance-level configuration of {{INSPECTION_PRODUCT}}. If the platform standard is AWS Network Firewall, the equivalent firewall policy is captured under § 6.4."),
  makeTable({
    headers: ["VPC", "Purpose", "CIDR"],
    rows: [
      ["{{CUSTOMER_CODE}}-inspection-egress", "Outbound traffic inspection", "<allocated /24>"],
      ["{{CUSTOMER_CODE}}-inspection-ingress", "Inbound traffic inspection", "<allocated /24>"],
      ["{{CUSTOMER_CODE}}-inspection-eastwest", "East/West inter-VPC inspection", "<allocated /24>"],
    ],
  }),
  H2("AWS Network Firewall (Alternative)"),
  richP("Where AWS Network Firewall is the platform standard, a centralised firewall is deployed in the Inspection VPC with a stateful rule group that includes:"),
  BULLET("Block known-malicious IP / domain feeds via managed rule groups."),
  BULLET("Block egress to non-{{DATA_RESIDENCY}} regions."),
  BULLET("TLS inspection for explicitly allowlisted services (if certificate available)."),
  BULLET("Customer-specific stateful rules captured in source control."),
  H2("Route 53 Resolver"),
  makeTable({
    headers: ["Endpoint", "Direction", "Purpose"],
    rows: [
      ["{{CUSTOMER_CODE}}-resolver-inbound", "Inbound", "Allows on-prem to resolve AWS Private Hosted Zones."],
      ["{{CUSTOMER_CODE}}-resolver-outbound", "Outbound", "Forwards queries for {{DNS_DOMAIN_INTERNAL}} to {{DNS_FORWARDER_PRODUCT}}."],
    ],
  }),
  PAGEBREAK(),
];

const connectivitySection = [
  H1("Hybrid Connectivity"),
  H2("Model"),
  richP("Connectivity model: {{CONNECTIVITY_MODEL}}. The detailed configuration below applies to a Direct Connect + VPN fallback model; adapt for the actual chosen pattern."),
  H2("Direct Connect"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Location(s)", "TBD (e.g., Equinix LD5, Telehouse North)"],
      ["Bandwidth", "TBD (e.g., 2× 10G)"],
      ["BGP ASN (AWS side)", "64512"],
      ["BGP ASN ({{CUSTOMER_SHORT}} side)", "TBD (customer ASN)"],
      ["VLAN", "TBD"],
      ["Encryption", "MACsec where supported"],
    ],
    widths: [3000, 6026],
  }),
  H2("Site-to-Site VPN (Fallback)"),
  richP("VPN tunnels are configured as a fallback for each Direct Connect link. BGP is enabled with route propagation into the TGW core route table. Pre-shared keys are stored in Secrets Manager with rotation."),
  PAGEBREAK(),
];

// ---------- Logging & Security ----------
const loggingSection = [
  H1("Logging & Security Service Configuration"),
  H2("CloudTrail (Organisation Trail)"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Trail name", "{{CUSTOMER_CODE}}-org-trail"],
      ["Organisation trail", "Yes"],
      ["Multi-region", "Yes"],
      ["S3 destination bucket", "{{CUSTOMER_CODE}}-cloudtrail-logs-{{LOG_ARCHIVE_ACCOUNT_ID}}"],
      ["KMS key", "alias/{{CUSTOMER_CODE}}-cloudtrail"],
      ["Object Lock", "Compliance mode, retention {{LOG_RETENTION_COLD}}"],
      ["Log file validation", "Enabled"],
      ["CloudTrail Lake", "Enabled — eventDataStore: {{CUSTOMER_CODE}}-trail-lake"],
      ["Management events", "All read/write"],
      ["Data events", "S3 (selective by prefix), Lambda (all functions)"],
      ["Insights events", "Enabled"],
    ],
    widths: [3000, 6026],
  }),
  H2("AWS Config"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Aggregator account", "Audit ({{AUDIT_ACCOUNT_ID}})"],
      ["Aggregator name", "{{CUSTOMER_CODE}}-config-aggregator"],
      ["Recording scope", "All resource types"],
      ["Recording frequency", "Continuous"],
      ["S3 delivery bucket", "{{CUSTOMER_CODE}}-config-logs-{{LOG_ARCHIVE_ACCOUNT_ID}}"],
      ["Retention", "{{LOG_RETENTION_COLD}}"],
      ["Conformance packs", "CIS v3, FSBP, NIST 800-53 r5, Operational Best Practices for {{CUSTOMER_SHORT}}"],
    ],
    widths: [3000, 6026],
  }),
  H2("Security Hub"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Delegated admin", "Audit"],
      ["Central configuration", "Enabled (Security Hub Central Configuration)"],
      ["Auto-enable for new accounts", "Yes"],
      ["Standards enabled", "CIS v3.0.0, AWS FSBP, NIST 800-53 r5, PCI DSS 4.0 (selective)"],
      ["Cross-region aggregation", "Enabled"],
      ["Finding aggregation region", "{{PRIMARY_REGION}}"],
      ["Integrations", "GuardDuty, Inspector, Macie, IAM Access Analyzer, Audit Manager, Detective, Config, Health, Firewall Manager, Patch Manager"],
    ],
    widths: [3000, 6026],
  }),
  H2("GuardDuty"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Delegated admin", "Audit"],
      ["Auto-enable for new accounts", "Yes"],
      ["Protection plans", "S3, EKS Audit Logs, EKS Runtime, EC2 Runtime, Lambda, RDS, Malware Protection for EC2, Malware Protection for S3"],
      ["Findings → Security Hub", "Yes"],
      ["Findings → EventBridge → {{SIEM_PRODUCT}}", "Yes"],
    ],
    widths: [3000, 6026],
  }),
  H2("IAM Access Analyzer"),
  BULLET("External access analyzer at organisation level (Audit account)."),
  BULLET("Unused access analyzer enabled (90-day window)."),
  BULLET("Findings → Security Hub."),
  H2("Amazon Inspector"),
  BULLET("Delegated admin: Audit."),
  BULLET("Auto-enable for: EC2, ECR (continuous), Lambda standard + code."),
  H2("Amazon Macie"),
  BULLET("Delegated admin: Audit. Selective enablement on customer-data buckets only."),
  BULLET("Sensitive data discovery jobs scoped via tags."),
  H2("AWS Audit Manager"),
  BULLET("Delegated admin: Audit."),
  BULLET("Assessments for {{COMPLIANCE_FRAMEWORKS}}."),
  BULLET("Evidence stored in Log Archive bucket with {{LOG_RETENTION_COLD}} retention."),
  PAGEBREAK(),
];

const storageSection = [
  H1("Storage, Encryption & Backup"),
  H2("KMS"),
  makeTable({
    headers: ["Key Alias", "Account", "Purpose"],
    rows: [
      ["alias/{{CUSTOMER_CODE}}-cloudtrail", "Log Archive", "Encrypt CloudTrail S3 bucket"],
      ["alias/{{CUSTOMER_CODE}}-config", "Log Archive", "Encrypt Config delivery bucket"],
      ["alias/{{CUSTOMER_CODE}}-vpc-flow", "Log Archive", "Encrypt VPC Flow Logs"],
      ["alias/{{CUSTOMER_CODE}}-backup", "Backup", "Encrypt AWS Backup vault"],
      ["alias/{{CUSTOMER_CODE}}-secrets-shared", "Shared Services", "Encrypt shared secrets / parameters"],
      ["alias/{{CUSTOMER_CODE}}-<workload>-data", "Workload", "Per-workload data encryption (multi-region where required)"],
    ],
  }),
  richP("Key rotation: automatic annual rotation enabled. Key policies follow least privilege."),
  H2("S3 Account-level Settings"),
  BULLET("Block Public Access: enabled in all accounts."),
  BULLET("Default encryption: SSE-KMS (per-bucket key)."),
  BULLET("Object Ownership: BucketOwnerEnforced (ACLs disabled)."),
  BULLET("Bucket logging: server access logging enabled to a dedicated logs bucket."),
  H2("AWS Backup"),
  makeTable({
    headers: ["Plan", "Schedule", "Retention", "In Scope"],
    rows: [
      ["{{CUSTOMER_CODE}}-daily-7d", "Daily 02:00 UTC", "7 days", "All Production tagged Backup=daily-7d"],
      ["{{CUSTOMER_CODE}}-daily-35d", "Daily 02:00 UTC", "35 days", "All Production tagged Backup=daily-35d"],
      ["{{CUSTOMER_CODE}}-monthly-12m", "Monthly 1st 03:00 UTC", "12 months", "All Production tagged Backup=monthly-12m"],
      ["{{CUSTOMER_CODE}}-yearly-7y", "Yearly 1 Jan", "{{LOG_RETENTION_COLD}}", "Regulated workloads tagged Backup=yearly-7y"],
    ],
    widths: [3000, 1800, 1500, 2726],
  }),
  richP("Backup vaults are protected with AWS Backup Vault Lock in compliance mode for regulated workloads."),
  PAGEBREAK(),
];

const opsSection = [
  H1("Operations"),
  H2("Account Vending"),
  richP("Account creation is performed via Control Tower Account Factory. Where AFT is enabled, account requests are raised as pull requests against the {{CUSTOMER_CODE}}-aft repository and approved by the platform team."),
  H2("Patching"),
  BULLET("AWS Systems Manager Patch Manager — quick-start baselines per OS family."),
  BULLET("Maintenance windows defined per environment (Prod: weekend off-hours; Non-Prod: weekday off-hours)."),
  BULLET("Compliance dashboards in Security Hub."),
  H2("Monitoring & Alerting"),
  BULLET("CloudWatch Logs cross-account subscription to {{SIEM_PRODUCT}}."),
  BULLET("EventBridge rules for security findings → {{TICKETING_PRODUCT}}."),
  BULLET("AWS Health events → email + {{TICKETING_PRODUCT}}."),
  H2("Cost Controls"),
  BULLET("AWS Budgets per account: monthly threshold 50/80/100% → email + ticket."),
  BULLET("Cost Anomaly Detection monitors for each account."),
  BULLET("Compute Optimizer + Cost Explorer access via FinOps permission set."),
  PAGEBREAK(),
];

// ---------- Appendix ----------
const appendix = [
  H1("Appendix A — CIS AWS Foundations Benchmark v3 Coverage"),
  richP("The accompanying 08-CIS-Controls-Tracker-Template.xlsx workbook maintains the live coverage view. The headline categories are:"),
  BULLET("1 — Identity & Access Management"),
  BULLET("2 — Storage"),
  BULLET("3 — Logging"),
  BULLET("4 — Monitoring"),
  BULLET("5 — Networking"),
  H1("Appendix B — NIST CSF 2.0 Mapping"),
  makeTable({
    headers: ["Function", "Outcome", "Landing Zone alignment"],
    rows: [
      ["GOVERN", "GV.OC, GV.RM, GV.RR", "CCoE governance; SCP/RCP/tag policy regime; risk register."],
      ["IDENTIFY", "ID.AM, ID.RA, ID.IM", "AWS Config inventory; Inspector vulnerability scanning; Access Analyzer."],
      ["PROTECT", "PR.AA, PR.DS, PR.PS", "IAM Identity Center, KMS, S3 Block Public Access, Network Firewall."],
      ["DETECT", "DE.CM, DE.AE", "Security Hub, GuardDuty, CloudTrail Lake, VPC Flow Logs → SIEM."],
      ["RESPOND", "RS.MA, RS.MI", "EventBridge → SSM Automation runbooks; Detective for forensics."],
      ["RECOVER", "RC.RP, RC.CO", "AWS Backup with Vault Lock; Resilience Hub; cross-region failover patterns."],
    ],
    widths: [1500, 2500, 5026],
  }),
  H1("Appendix C — References"),
  makeTable({
    headers: ["Reference", "URL"],
    rows: [
      ["AWS Security Reference Architecture", "https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture/"],
      ["AWS Control Tower Controls", "https://docs.aws.amazon.com/controltower/latest/controlreference/"],
      ["Landing Zone Accelerator", "https://aws.amazon.com/solutions/implementations/landing-zone-accelerator-on-aws/"],
      ["AWS Backup Vault Lock", "https://docs.aws.amazon.com/aws-backup/latest/devguide/vault-lock.html"],
      ["Resource Control Policies", "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html"],
      ["Declarative Policies", "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_declarative.html"],
      ["Security Hub Central Configuration", "https://docs.aws.amazon.com/securityhub/latest/userguide/central-configuration-intro.html"],
    ],
    widths: [3500, 5526],
  }),
];

function flat(arr) {
  const out = [];
  for (const x of arr) {
    if (Array.isArray(x)) out.push(...flat(x));
    else out.push(x);
  }
  return out;
}

const all = flat([
  ...titleBlock,
  ...documentControl,
  ...toc,
  ...exec,
  ...orgSection,
  ...accountInventory,
  ...policiesSection,
  ...identitySection,
  ...networkSection,
  ...connectivitySection,
  ...loggingSection,
  ...storageSection,
  ...opsSection,
  ...appendix,
]);

const doc = build("Low Level Design", "AWS Landing Zone — LLD Template", all);
Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2];
  fs.writeFileSync(out, buf);
  console.log("Wrote " + out);
});
