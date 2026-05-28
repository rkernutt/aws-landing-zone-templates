// AWS Landing Zone — High Level Design template (2026)
const C = require("./docx_common.js");
const { Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak,
  TableOfContents, TabStopType, TabStopPosition, PositionalTab, PositionalTabAlignment,
  PositionalTabRelativeTo, PositionalTabLeader,
  H1, H2, H3, H4, P, BULLET, SPACER, PAGEBREAK, CAPTION,
  richP, richBullet, makeTable, build, fs } = C;

const titleBlock = [
  new Paragraph({ style: "Title", children: [new TextRun("AWS Landing Zone")] }),
  new Paragraph({ style: "Subtitle", children: [new TextRun("High Level Design")] }),
  SPACER(),
  richP("Prepared for: {{CUSTOMER_NAME}}"),
  richP("Prepared by: {{PARTNER_NAME}}"),
  richP("Document version: {{DOC_VERSION}}    |    Date: {{DOC_DATE}}"),
  richP("Classification: {{DOC_CLASSIFICATION}}"),
  PAGEBREAK(),
];

const documentControl = [
  H1("Document Control"),
  H2("Document Information"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Project name", "{{PROJECT_NAME}}"],
      ["Customer", "{{CUSTOMER_NAME}}"],
      ["Delivery partner", "{{PARTNER_NAME}}"],
      ["Creation date", "{{DOC_DATE}}"],
      ["Owner / author", "{{DOC_AUTHOR}}"],
      ["Audience", "External"],
      ["Document classification", "{{DOC_CLASSIFICATION}}"],
      ["Design review board reference", "TBD"],
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
  SPACER(),
  H2("Document Review and Approval"),
  makeTable({
    headers: ["Reviewer", "Position", "Version", "Review Date"],
    rows: [
      ["", "{{CUSTOMER_SHORT}} Cloud Architect", "", ""],
      ["", "{{CUSTOMER_SHORT}} Head of Security", "", ""],
      ["", "{{DESIGN_AUTHORITY}}", "", ""],
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
  richP("This High-Level Design (HLD) document defines a recommended AWS Landing Zone for {{CUSTOMER_NAME}}. It establishes the multi-account structure, identity, security, networking and governance foundations on which {{CUSTOMER_SHORT}} can safely build and operate workloads in AWS."),
  richP("The design follows AWS Well-Architected best practices and the AWS Security Reference Architecture (AWS SRA), aligning with {{COMPLIANCE_FRAMEWORKS}} where applicable. It is implemented using {{DEPLOY_TOOLING}} and provides the day-one platform on which {{CUSTOMER_SHORT}} workloads will be built."),
  richP("The associated Low-Level Design (LLD) document captures detailed configuration values; the SOW captures the engagement scope."),
  H2("Glossary"),
  makeTable({
    headers: ["Term", "Description"],
    rows: [
      ["AWS", "Amazon Web Services"],
      ["AZ", "Availability Zone"],
      ["AFT", "Account Factory for Terraform"],
      ["LZA", "Landing Zone Accelerator on AWS"],
      ["IAM", "Identity and Access Management"],
      ["IdC", "AWS IAM Identity Center (formerly AWS SSO)"],
      ["OU", "Organisational Unit"],
      ["SCP", "Service Control Policy"],
      ["RCP", "Resource Control Policy"],
      ["TGW", "AWS Transit Gateway"],
      ["VPC", "Virtual Private Cloud"],
      ["FSBP", "AWS Foundational Security Best Practices"],
    ],
    widths: [2200, 6826],
  }),
  H2("Intended Audience"),
  richP("This document targets a technical audience including:"),
  BULLET("Cloud and solution architects"),
  BULLET("Network and security engineers"),
  BULLET("Operations and platform teams"),
  richBullet("{{CUSTOMER_SHORT}} technical and governance stakeholders"),
  H2("Background"),
  richP("{{CUSTOMER_SHORT}} is adopting AWS as a strategic cloud platform to enable {{PROJECT_NAME}}. A well-designed Landing Zone is required as the first deliverable so that subsequent workloads can be onboarded against a secure, compliant, well-governed foundation."),
  richP("This design considers known business, security and regulatory requirements ({{REGULATORY_BODIES}}) and uses AWS-native services as the default, while remaining open to integration with existing {{CUSTOMER_SHORT}} tooling for identity ({{IDP_PRODUCT}}), security analytics ({{SIEM_PRODUCT}}), and service management ({{TICKETING_PRODUCT}})."),
  PAGEBREAK(),
];

const solutionSummary = [
  H1("Solution Summary"),
  H2("Approach: Control Tower & Landing Zone Accelerator"),
  richP("The Landing Zone is built on AWS Organizations with all features enabled, AWS Control Tower as the governance plane, and the AWS Landing Zone Accelerator (LZA) for advanced customisation where Control Tower controls alone are not sufficient."),
  richP("The deployment toolchain is {{DEPLOY_TOOLING}}. Where workload teams require self-service account creation, AWS Control Tower Account Factory (optionally with Account Factory for Terraform — AFT) provides a governed vending machine."),
  H3("Why Control Tower + LZA"),
  BULLET("Managed Organisations baseline with strong default guardrails (preventative + detective controls)."),
  BULLET("Automated multi-account vending consistent with the AWS Security Reference Architecture."),
  BULLET("LZA gives extensibility for opinionated network, security and logging configurations beyond Control Tower."),
  BULLET("Native upgrade path as AWS Organisations features evolve (RCPs, declarative policies, Backup/Chatbot policies)."),
  H2("Account & OU Overview"),
  richP("Accounts and Organisational Units are aligned to function and business unit. The diagram below summarises the layout."),
  CAPTION("Figure 1 — High level account and OU layout"),
  P("[INSERT DIAGRAM: Org structure — Root → Security OU (Log Archive, Audit) → Infrastructure OU (Network, Shared Services) → Workloads OU (by Business Unit / Environment) → Sandbox OU → Suspended OU]"),
  H2("Network Design Overview"),
  richP("Networking centres on a hub-and-spoke model using AWS Transit Gateway (TGW), with centralised egress, ingress and east-west inspection in the Network account. The default inspection engine is {{INSPECTION_PRODUCT}}; alternative options are noted in section 7."),
  CAPTION("Figure 2 — High level network architecture"),
  P("[INSERT DIAGRAM: Hybrid connectivity → TGW → Inspection VPC → Spoke VPCs (per BU/Env). Show egress, ingress and east-west flows.]"),
  H2("Identity Overview"),
  richP("Identity uses AWS IAM Identity Center federated to {{IDP_PRODUCT}} via {{IDP_PROTOCOL}}. Permission sets are assigned to AD/Entra groups; least-privilege roles are inherited via Organizations. The break-glass path is the IAM user(s) in {{BREAK_GLASS_GROUP}} held in the management account."),
  H2("Security & Compliance Overview"),
  richP("Security is enforced through a layered control model: preventative controls (SCPs, RCPs, declarative policies), detective controls (Security Hub, GuardDuty, Config), reactive controls (EventBridge → SSM/Lambda automations), and corrective controls (AWS Config remediation actions). Frameworks targeted: {{COMPLIANCE_FRAMEWORKS}}."),
  PAGEBREAK(),
];

const problem = [
  H1("Problem Definition"),
  H2("Overview"),
  richP("{{CUSTOMER_SHORT}} requires a governed AWS environment that supports incremental workload onboarding while maintaining strict security, compliance and operational standards. The Landing Zone provides this foundation, defining how accounts, identities, networks and controls are provisioned and managed consistently."),
  H2("Scope"),
  H3("Business Scope"),
  richP("The following business units / functions are in scope:"),
  richBullet("{{BUSINESS_UNITS}}"),
  H3("Environment Scope"),
  richP("Each business unit may host the following environments:"),
  richBullet("{{ENVIRONMENTS}}"),
  H3("Out of Scope"),
  BULLET("Application-level migration or refactoring."),
  BULLET("Detailed configuration of third-party security or networking products (configured by vendor / customer)."),
  BULLET("Workload-specific operational runbooks."),
  BULLET("Disaster recovery and business continuity design for individual applications."),
  BULLET("User acceptance testing of business services."),
  H2("Change Drivers"),
  H3("New business capability"),
  richP("Enabling fast, governed delivery of cloud-native services within {{CUSTOMER_SHORT}}."),
  H3("Governance"),
  richP("Ensuring all cloud usage is governed for cost, security and accountability from day one."),
  H3("Visibility and auditability"),
  richP("Centralised logging, alerting and audit trail across all accounts — 'prevention is ideal, detection is mandatory'."),
  H3("Risk reduction through blast-radius isolation"),
  richP("Account-level isolation contains incidents to a single workload or environment."),
  H3("Efficiency and agility"),
  richP("Standardised account provisioning and baseline configurations accelerate delivery."),
  H2("Critical Success Factors"),
  makeTable({
    headers: ["CSF ID", "Requirement", "Description", "Day One"],
    rows: [
      ["CSF001", "Operating model alignment", "Establish CCoE governance & operating model for cloud delivery", "Partial"],
      ["CSF002", "Security baseline", "Meet or exceed {{COMPLIANCE_FRAMEWORKS}}", "Full"],
      ["CSF003", "Identity federation", "Single sign-on via {{IDP_PRODUCT}}", "Full"],
      ["CSF004", "Business unit & environment separation", "Account isolation per BU and environment", "Full"],
      ["CSF005", "Centralised network inspection", "All ingress / egress / east-west traffic inspected", "Full"],
      ["CSF006", "Centralised logging", "All account logs aggregated to Log Archive", "Full"],
    ],
    widths: [900, 2200, 4426, 1500],
  }),
  PAGEBREAK(),
];

const requirements = [
  H1("Design Definition"),
  H2("Requirements"),
  richP("Detailed requirements are tracked against this design using the MoSCoW prioritisation matrix. The table below provides the headline set; the full register is maintained in the project workspace."),
  makeTable({
    headers: ["REQ_ID", "Requirement", "Description", "MoSCoW"],
    rows: [
      ["REQ001", "Security baseline", "Meet or exceed CIS AWS Foundations Benchmark v3 and AWS FSBP", "MUST"],
      ["REQ002", "Identity federation", "Federate IAM Identity Center to {{IDP_PRODUCT}}", "MUST"],
      ["REQ003", "Multi-account isolation", "One AWS account per workload / environment", "MUST"],
      ["REQ004", "Centralised egress", "All outbound traffic via inspection in Network account", "MUST"],
      ["REQ005", "Centralised logging", "Aggregate CloudTrail, Config, VPC Flow, GuardDuty into Log Archive", "MUST"],
      ["REQ006", "Encryption at rest", "AWS KMS customer-managed keys for sensitive data stores", "MUST"],
      ["REQ007", "Tag enforcement", "{{TAGGING_KEYS}} mandatory on resources", "SHOULD"],
      ["REQ008", "Cost guardrails", "Budgets + anomaly detection per account / OU", "SHOULD"],
      ["REQ009", "Backup policies", "Organisation-level AWS Backup policies for in-scope services", "SHOULD"],
      ["REQ010", "Data residency", "Resources restricted to {{DATA_RESIDENCY}}", "MUST"],
      ["REQ011", "Inspection model", "Centralised {{INSPECTION_PRODUCT}} inspection for N/S and E/W", "MUST"],
      ["REQ012", "Service quotas", "Quotas monitored per account; alerts at 80% utilisation", "COULD"],
    ],
    widths: [900, 2200, 4426, 1500],
  }),
  PAGEBREAK(),
];

const raid = [
  H1("RAID"),
  H2("Risks"),
  makeTable({
    headers: ["ID", "Risk", "Mitigation"],
    rows: [
      ["RSK001", "Account sprawl and unaccounted cost", "Use Account Factory with approval workflow; budgets + anomaly detection from day one."],
      ["RSK002", "Cloud skills gap during delivery", "Pair {{CUSTOMER_SHORT}} engineers with {{PARTNER_NAME}} during build; CCoE enablement workshops."],
      ["RSK003", "Day-one design may not cover every future workload pattern", "Iterative day-two pattern catalogue; design optimised for extension via LZA customisations."],
      ["RSK004", "Over-restrictive guardrails block legitimate work", "Sandbox OU for testing policy changes; exception process via tickets in {{TICKETING_PRODUCT}}."],
      ["RSK005", "Regulator scrutiny of cloud adoption ({{REGULATORY_BODIES}})", "Compliance Matrix mapping controls to {{COMPLIANCE_FRAMEWORKS}}; evidence packs from Security Hub and Audit Manager."],
    ],
    widths: [900, 3000, 5126],
  }),
  H2("Issues / Critical Areas"),
  makeTable({
    headers: ["ID", "Issue", "Mitigation"],
    rows: [
      ["ICA001", "Hybrid connectivity bandwidth not yet sized", "Day-one VPN, transition to Direct Connect once sized. Capture sizing requirements in onboarding."],
      ["ICA002", "Some third-party tools not yet selected", "Default to AWS-native; rearchitect later via LZA customisation where needed."],
    ],
    widths: [900, 3000, 5126],
  }),
  H2("Assumptions"),
  makeTable({
    headers: ["ID", "Assumption", "Description"],
    rows: [
      ["ASP001", "AWS native default", "AWS native services are used for Day One unless an existing {{CUSTOMER_SHORT}} tool is mandated."],
      ["ASP002", "Management account ownership", "{{PARTNER_NAME}} sets up the management account; {{CUSTOMER_SHORT}} owns root credentials and MFA post-handover."],
      ["ASP003", "No application workloads", "No production workloads are migrated during the Landing Zone build."],
      ["ASP004", "Connectivity to on-prem", "Connectivity model: {{CONNECTIVITY_MODEL}}."],
      ["ASP005", "IdP available", "{{IDP_PRODUCT}} is available and configurable for SAML/SCIM federation."],
    ],
    widths: [900, 3000, 5126],
  }),
  H2("Dependencies"),
  makeTable({
    headers: ["ID", "Dependency", "Description"],
    rows: [
      ["DEP001", "Customer & partner resources", "Architects/engineers from both sides must be available for the build phase."],
      ["DEP002", "Network change windows", "On-prem firewall and routing changes need scheduled windows."],
      ["DEP003", "IdP admin access", "{{CUSTOMER_SHORT}} IdP team available to configure Identity Center federation."],
    ],
    widths: [900, 3000, 5126],
  }),
  PAGEBREAK(),
];

const designChoices = [
  H1("Design Choices"),
  H2("Account Deployment & Management Mechanism"),
  richP("AWS provides several mechanisms for deploying multi-account environments. The table below summarises the options considered."),
  makeTable({
    headers: ["Option", "Description", "Considered for {{CUSTOMER_SHORT}}"],
    rows: [
      ["Single account", "All workloads in one AWS account.", "Rejected — no isolation, no blast-radius reduction, fails baseline security expectations."],
      ["AWS Organizations only", "Multi-account with SCPs but no managed Landing Zone.", "Rejected — requires bespoke baseline & lifecycle tooling."],
      ["AWS Control Tower", "Managed Landing Zone with mandatory and optional controls, account vending.", "Selected as the governance plane."],
      ["AWS Control Tower + LZA", "Adds opinionated network/security baseline via the Landing Zone Accelerator solution.", "Selected. Recommended for regulated industries."],
      ["AWS Control Tower + AFT", "Account Factory for Terraform — Terraform-native vending alongside Control Tower.", "Optional, recommended where {{CUSTOMER_SHORT}} standardises on Terraform."],
    ],
    widths: [2200, 3000, 3826],
  }),
  H2("Design Decision"),
  richP("{{PARTNER_NAME}} recommends AWS Control Tower as the governance plane with the AWS Landing Zone Accelerator (LZA) deployed on top to provide the opinionated network and security baseline. Where {{CUSTOMER_SHORT}} elects to use Terraform-first vending, AFT will be enabled alongside Control Tower."),
  PAGEBREAK(),
];

const lzDesign = [
  H1("Landing Zone Design"),
  H2("Organisational Unit Structure"),
  richP("The following OU structure is created (mirrors AWS Security Reference Architecture):"),
  makeTable({
    headers: ["OU", "Purpose"],
    rows: [
      ["Security", "Hosts Log Archive and Audit (Security Tooling) accounts. Strictly controlled."],
      ["Infrastructure", "Hosts Network and Shared Services accounts."],
      ["Workloads/Prod", "Production workload accounts, grouped by business unit."],
      ["Workloads/NonProd", "Non-production workload accounts, grouped by business unit / environment."],
      ["Sandbox", "Ephemeral developer / proof-of-concept accounts with tight budget and SCP controls."],
      ["PolicyStaging", "Staging area to test new SCPs/RCPs before promotion."],
      ["Suspended", "Disabled / decommissioned accounts pending closure."],
    ],
    widths: [2400, 6626],
  }),
  H2("Foundational Accounts"),
  makeTable({
    headers: ["Account", "Purpose", "Key Services"],
    rows: [
      ["Management", "AWS Organizations root, billing, IAM Identity Center, Control Tower home.", "Organizations, Identity Center, Service Catalog, Billing, Account Factory"],
      ["Log Archive", "Immutable centralised log store.", "S3 (Object Lock), KMS, CloudTrail org trail destination, Config aggregator destination"],
      ["Audit (Security Tooling)", "Delegated admin for security services; aggregator account.", "Security Hub, GuardDuty, Config, Detective, Inspector, Macie, Access Analyzer, Audit Manager"],
      ["Network", "Centralised connectivity, inspection and DNS.", "Transit Gateway, Direct Connect Gateway, AWS Network Firewall / {{INSPECTION_PRODUCT}}, Route 53 Resolver"],
      ["Shared Services", "Cross-account shared services and developer tooling.", "AD/Directory Service, CodePipeline/CodeBuild, ECR, Service Catalog Hub, golden AMIs"],
      ["Backup", "Optional. Centralised vault for AWS Backup with vault locks.", "AWS Backup, KMS, Backup Vault Lock"],
    ],
    widths: [1800, 2800, 4426],
  }),
  H2("Workload Account Strategy"),
  richP("Workloads are grouped per business unit; each business unit owns one or more workload accounts split by environment ({{ENVIRONMENTS}}). The default pattern is one account per BU per environment for production-bearing workloads."),
  richBullet("Business units: {{BUSINESS_UNITS}}"),
  richBullet("Environments per BU: {{ENV_PER_BU}}"),
  PAGEBREAK(),
];

const identitySection = [
  H1("Identity & Access Management"),
  H2("Federation Model"),
  richP("IAM Identity Center in the management account is federated to {{IDP_PRODUCT}} via {{IDP_PROTOCOL}}. SCIM provides automated user/group provisioning. Permission sets are mapped to {{IDP_PRODUCT}} groups; users do not have direct console access keys."),
  H2("Permission Sets (initial)"),
  makeTable({
    headers: ["Permission Set", "Description", "Mapped IdP Group", "Backing Policy"],
    rows: [
      ["LZ-Admin", "Break-glass administrative access (rarely used).", "{{BREAK_GLASS_GROUP}}", "AdministratorAccess + audit-trail conditions"],
      ["CloudPlatformEngineer", "Day-to-day platform engineering across infra & shared services.", "{{CUSTOMER_CODE}}-cloud-platform", "Customer-managed least privilege"],
      ["NetworkAdministrator", "Networking changes in Network account.", "{{CUSTOMER_CODE}}-network-admins", "NetworkAdministrator + custom guardrails"],
      ["SecurityAuditor", "Read-only access to Audit + Log Archive accounts.", "{{CUSTOMER_CODE}}-security-auditors", "SecurityAudit + ViewOnlyAccess"],
      ["WorkloadAdmin", "Admin over a specific workload account.", "{{CUSTOMER_CODE}}-<workload>-admins", "PowerUserAccess + IAM constraints"],
      ["WorkloadDeveloper", "Developer-level access — no IAM, no security service modification.", "{{CUSTOMER_CODE}}-<workload>-devs", "Custom workload-developer policy"],
      ["WorkloadReadOnly", "View-only for diagnostics.", "{{CUSTOMER_CODE}}-<workload>-readonly", "ViewOnlyAccess"],
      ["FinOps", "Cost Explorer, Budgets, Compute Optimizer.", "{{CUSTOMER_CODE}}-finops", "Custom FinOps policy"],
      ["Auditor", "External / internal audit, time-bound.", "{{CUSTOMER_CODE}}-external-auditors", "SecurityAudit + ReadOnly"],
    ],
    widths: [2400, 3000, 1800, 1826],
  }),
  H2("Break-glass IAM Users"),
  richP("A minimum number of IAM users (recommended: 2) are kept in the management account in the {{BREAK_GLASS_GROUP}} group. These accounts have hardware MFA, must be stored securely and only used when IdP federation is unavailable. Their use triggers an automatic high-priority alert to {{SIEM_PRODUCT}}."),
  H2("Service-linked & Cross-account Roles"),
  richP("All cross-account access uses IAM roles assumed via STS. Long-lived access keys are denied via SCP, except for explicitly allowlisted automation roles. AWS managed service-linked roles are permitted; customer-managed automation roles are tightly scoped and reviewed quarterly."),
  PAGEBREAK(),
];

const governanceSection = [
  H1("Governance — Policies and Controls"),
  H2("Service Control Policies (preventative)"),
  richP("SCPs are applied at the Organisation root and per-OU level. The control set below is a representative day-one baseline; the full JSON is captured in the LLD."),
  makeTable({
    headers: ["SCP", "Purpose"],
    rows: [
      ["DenyRootUser", "Block use of root credentials in member accounts."],
      ["DenyLeaveOrganization", "Prevent member accounts from leaving the Organisation."],
      ["DenyDisableSecurityServices", "Block disabling of Security Hub, GuardDuty, Config, CloudTrail, IAM Access Analyzer, Inspector, Macie."],
      ["RegionRestriction", "Deny non-{{PRIMARY_REGION}} (and explicitly listed global) regions to enforce data residency."],
      ["DenyHighRiskActions", "Deny actions like deleting CloudTrail, modifying KMS key policies, etc."],
      ["DenyIamUserCreation", "Block IAM user / access key creation in member accounts (except allowlisted automation roles)."],
      ["RequireMFAforSensitiveActions", "Require MFA for high-risk console actions."],
      ["DenyNonComplianceResources", "Prevent creation of EBS / RDS / S3 without encryption."],
    ],
    widths: [3000, 6026],
  }),
  H2("Resource Control Policies (RCPs)"),
  richP("RCPs (introduced in 2024) provide org-wide guardrails on resource policies. The day-one baseline includes:"),
  BULLET("Enforce that S3 bucket policies require aws:SecureTransport = true."),
  BULLET("Deny S3, SQS, SNS resource policies that grant public principals."),
  BULLET("Deny KMS key policies that grant broad cross-account access without explicit allowlisting."),
  H2("Declarative Policies"),
  richP("Declarative policies are used to enforce default service configurations across all accounts (e.g., block public AMIs, default EBS encryption on, default VPC blocked)."),
  H2("Tag Policies"),
  richP("Tag policies enforce a consistent tagging schema. Mandatory keys:"),
  richBullet("{{TAGGING_KEYS}}"),
  H2("Backup Policies"),
  richP("AWS Backup organisation policies enforce backup of in-scope services (EBS, RDS, DynamoDB, EFS, FSx, S3 where applicable). Vaults are created in the Backup account with Vault Lock enabled, retention {{LOG_RETENTION_COLD}}."),
  PAGEBREAK(),
];

const networkSection = [
  H1("Network Design"),
  H2("Addressing"),
  richP("The Landing Zone supernet is {{LZ_SUPERNET}}. The primary region {{PRIMARY_REGION}} is allocated {{LZ_REGION_CIDR}}, with sub-allocations by OU and business unit. The detailed subnet plan is maintained in the MasterSubnetList workbook (template provided)."),
  H2("Connectivity"),
  richP("Hybrid connectivity is delivered via {{CONNECTIVITY_MODEL}}. Inside AWS, AWS Transit Gateway provides hub-and-spoke routing between the Network account and workload VPCs. AWS Cloud WAN is an alternative for customers with global, multi-region topology — out of scope for day one but called out in section 'Alternative Patterns'."),
  H2("Inspection Model"),
  richP("Centralised inspection is performed in the Network account. The default inspection engine is {{INSPECTION_PRODUCT}}. Three inspection patterns are deployed:"),
  BULLET("North/South (egress) — outbound traffic from spoke VPCs is steered to an inspection VPC, then to the internet via NAT Gateways / IGW."),
  BULLET("North/South (ingress) — inbound traffic terminates on AWS Global Accelerator / Application Load Balancer in a dedicated ingress VPC and is inspected before reaching workloads."),
  BULLET("East/West — inter-VPC and inter-account traffic is routed through the inspection layer via TGW route tables."),
  H2("DNS"),
  richP("Route 53 Resolver endpoints in the Network account provide bi-directional DNS resolution to on-premises via {{DNS_FORWARDER_PRODUCT}}. Internal zone {{DNS_DOMAIN_INTERNAL}} is hosted in a Route 53 Private Hosted Zone shared via RAM. Route 53 Resolver DNS Firewall blocks known-bad domains."),
  H2("VPC Default Hygiene"),
  BULLET("Default VPC deleted in every region of every account."),
  BULLET("Default Security Group has no rules; default NACL denies all traffic."),
  BULLET("Default route table named 'do-not-use' with no routes."),
  BULLET("VPC Flow Logs enabled to Log Archive in all VPCs."),
  H2("Alternative Patterns"),
  richP("Where {{CUSTOMER_SHORT}} adopts a global / multi-region topology in future, AWS Cloud WAN can replace or complement the TGW design. The inspection layer can also be migrated to AWS Network Firewall if the third-party VM-Series approach is decommissioned."),
  PAGEBREAK(),
];

const securitySection = [
  H1("Security Services"),
  H2("Delegated Admin Model"),
  richP("Security tooling is delegated to the Audit account via AWS Organizations delegated administration. This avoids running services from the management account."),
  makeTable({
    headers: ["Service", "Delegated To", "Purpose"],
    rows: [
      ["AWS Security Hub", "Audit", "Aggregated findings; CIS v3, FSBP, NIST 800-53 r5, PCI DSS 4.0 standards enabled."],
      ["Amazon GuardDuty", "Audit", "Threat detection; Runtime Monitoring, EKS, S3, RDS, Lambda, Malware Protection enabled."],
      ["AWS Config", "Audit", "Configuration recording + organisation aggregator + Conformance Packs."],
      ["IAM Access Analyzer", "Audit", "External & unused access analyses."],
      ["Amazon Inspector", "Audit", "EC2, ECR, Lambda code & dependency scanning."],
      ["Amazon Macie", "Audit", "Sensitive data discovery on S3 (selectively enabled)."],
      ["AWS Audit Manager", "Audit", "Evidence collection for {{COMPLIANCE_FRAMEWORKS}}."],
      ["Amazon Detective", "Audit", "Security investigation graphs."],
      ["AWS CloudTrail Lake", "Log Archive / Audit", "Long-term, queryable trail storage."],
    ],
    widths: [2400, 1500, 5126],
  }),
  H2("CloudTrail"),
  richP("A single organisation trail captures management and selected data events, delivered to the Log Archive account S3 bucket with KMS encryption and Object Lock (retention {{LOG_RETENTION_COLD}}). CloudTrail Lake is enabled for queryable retention. The trail is protected by SCP from being disabled."),
  H2("Logging Architecture"),
  BULLET("CloudTrail org trail → Log Archive S3 (Object Lock + KMS + lifecycle to Glacier)."),
  BULLET("AWS Config → Org aggregator in Audit + per-account delivery to Log Archive S3."),
  BULLET("VPC Flow Logs → Log Archive S3."),
  BULLET("GuardDuty findings → EventBridge → {{SIEM_PRODUCT}} + Security Hub."),
  BULLET("CloudWatch Logs → cross-account subscription filters → {{SIEM_PRODUCT}}."),
  richBullet("Hot retention {{LOG_RETENTION_HOT}}, cold retention {{LOG_RETENTION_COLD}}."),
  H2("Encryption"),
  richP("All sensitive data stores use AWS KMS customer-managed keys (CMKs). Default EBS encryption is enabled in every region of every account via declarative policy. Key administration is restricted to a small group in the Audit / Security Tooling account."),
  PAGEBREAK(),
];

const operationsSection = [
  H1("Operations & FinOps"),
  H2("Operating Model"),
  richP("The {{CUSTOMER_SHORT}} operating model is: {{OPS_MODEL}}. A Cloud Centre of Excellence is established with platform, security, FinOps and enablement functions. The CCoE MVP scope is covered by the accompanying SOW."),
  H2("Account Vending"),
  richP("New accounts are vended via Control Tower Account Factory (and/or AFT). The vending workflow integrates with {{TICKETING_PRODUCT}} for approval and SCM for the Terraform request templates."),
  H2("Monitoring & Alerting"),
  BULLET("Security findings → Security Hub → {{SIEM_PRODUCT}}."),
  BULLET("Operational health → Amazon CloudWatch + AWS Health → EventBridge → {{TICKETING_PRODUCT}}."),
  BULLET("Cost anomalies → AWS Cost Anomaly Detection → SNS → email + {{TICKETING_PRODUCT}}."),
  H2("FinOps"),
  BULLET("Consolidated billing in the management account; Cost Explorer + CUR enabled."),
  BULLET("Per-account budgets with thresholds at 50/80/100%."),
  BULLET("FinOps tagging strategy enforced via tag policies and Config rules."),
  BULLET("Savings Plans / RIs managed centrally with sharing turned on."),
  PAGEBREAK(),
];

const complianceSection = [
  H1("Compliance Mapping"),
  H2("Compliance Frameworks"),
  richP("This Landing Zone targets {{COMPLIANCE_FRAMEWORKS}}. The table below lists the standards enabled in Security Hub:"),
  makeTable({
    headers: ["Framework", "Coverage"],
    rows: [
      ["CIS AWS Foundations Benchmark v3.0.0", "Full"],
      ["AWS Foundational Security Best Practices (FSBP)", "Full"],
      ["NIST 800-53 r5", "Full (Security Hub)"],
      ["NIST CSF 2.0", "Mapped via Audit Manager"],
      ["PCI DSS 4.0", "Where in scope"],
      ["ISO 27001:2022", "Mapped via Audit Manager"],
      ["{{COMPLIANCE_FRAMEWORKS}} (customer-specific)", "Mapped via custom Audit Manager assessment"],
    ],
    widths: [3500, 5526],
  }),
  H2("Evidence Collection"),
  richP("AWS Audit Manager assessments are scoped to {{COMPLIANCE_FRAMEWORKS}}. Evidence is collected automatically (Config, CloudTrail, Security Hub) and held for {{LOG_RETENTION_COLD}}. A monthly compliance pack is generated and stored in the Audit account."),
  PAGEBREAK(),
];

const referencesSection = [
  H1("Technical References"),
  makeTable({
    headers: ["Reference", "URL"],
    rows: [
      ["AWS Security Reference Architecture", "https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture/"],
      ["AWS Control Tower", "https://docs.aws.amazon.com/controltower/"],
      ["AWS Landing Zone Accelerator", "https://aws.amazon.com/solutions/implementations/landing-zone-accelerator-on-aws/"],
      ["AWS Well-Architected Framework", "https://docs.aws.amazon.com/wellarchitected/latest/framework/"],
      ["AWS IAM Identity Center", "https://docs.aws.amazon.com/singlesignon/"],
      ["Security Hub Standards", "https://docs.aws.amazon.com/securityhub/latest/userguide/standards.html"],
      ["AWS Organizations Resource Control Policies", "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html"],
      ["AWS Backup Organization Policies", "https://docs.aws.amazon.com/aws-backup/latest/devguide/backup-organizations.html"],
    ],
    widths: [3500, 5526],
  }),
  PAGEBREAK(),
];

const signoff = [
  H1("Design Approval"),
  richP("This sign-off confirms that {{CUSTOMER_SHORT}} accepts that this High-Level Design meets the requirements as presented to {{PARTNER_NAME}} during the discovery and design activities."),
  H2("Technical Sign-off"),
  richP("{{CUSTOMER_SHORT}} has nominated a suitable person to provide technical sign-off of the design."),
  makeTable({
    headers: ["Field", "Detail"],
    rows: [["Print Name", ""], ["Position", ""], ["Signature", ""], ["Date", ""]],
    widths: [2200, 6826],
  }),
  SPACER(),
  H2("Stakeholder Sign-off"),
  richP("{{CUSTOMER_SHORT}} has nominated a suitable person to accept the design overall."),
  makeTable({
    headers: ["Field", "Detail"],
    rows: [["Print Name", ""], ["Position", ""], ["Signature", ""], ["Date", ""]],
    widths: [2200, 6826],
  }),
];

const all = [
  ...titleBlock,
  ...documentControl,
  ...toc,
  ...exec,
  ...solutionSummary,
  ...problem,
  ...requirements,
  ...raid,
  ...designChoices,
  ...lzDesign,
  ...identitySection,
  ...governanceSection,
  ...networkSection,
  ...securitySection,
  ...operationsSection,
  ...complianceSection,
  ...referencesSection,
  ...signoff,
];

const doc = build("High Level Design", "AWS Landing Zone — HLD Template", all);
Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2];
  fs.writeFileSync(out, buf);
  console.log("Wrote " + out);
});
