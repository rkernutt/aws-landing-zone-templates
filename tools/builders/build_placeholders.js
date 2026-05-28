// Placeholder reference doc — 01-Placeholder-Reference.docx
const C = require("./docx_common.js");
const { Packer, Paragraph, TextRun, HeadingLevel, TableOfContents,
  H1, H2, H3, P, BULLET, SPACER, PAGEBREAK,
  richP, richBullet, makeTable, build, fs } = C;

function flat(a) { const o=[]; for (const x of a) Array.isArray(x)? o.push(...flat(x)) : o.push(x); return o; }

const groups = [
  { name: "A. Customer identity", rows: [
    ["{{CUSTOMER_NAME}}",      "Full legal name", "e.g. Acme Bank Group plc"],
    ["{{CUSTOMER_SHORT}}",     "Display short name", "e.g. Acme Bank"],
    ["{{CUSTOMER_CODE}}",      "Lower-case resource prefix (2-4 chars)", "e.g. acme"],
    ["{{CUSTOMER_DOMAIN}}",    "Primary email/AD domain", "e.g. acmebank.com"],
    ["{{CUSTOMER_LOGO_PATH}}", "Path to customer logo (used in headers/deck)", "(optional)"],
  ]},
  { name: "B. Engagement metadata", rows: [
    ["{{PARTNER_NAME}}",        "Delivery partner display name", "e.g. Acme Consulting"],
    ["{{PARTNER_LEGAL_NAME}}",  "Full legal entity name for SOW", "e.g. Acme Consulting Limited"],
    ["{{PARTNER_TERMS_URL}}",   "URL to partner T&Cs", "e.g. https://example.com/terms"],
    ["{{DOC_VERSION}}",         "Current document version", "e.g. 0.1, 1.0"],
    ["{{DOC_DATE}}",            "Creation date (DD/MM/YYYY)", "e.g. 28/05/2026"],
    ["{{DOC_AUTHOR}}",          "Document author", "e.g. Jane Smith"],
    ["{{DOC_CLASSIFICATION}}",  "Document classification", "e.g. Company Confidential"],
    ["{{PROJECT_NAME}}",        "Project name", "e.g. AWS Landing Zone Day One"],
    ["{{DESIGN_AUTHORITY}}",    "Customer-side design authority", "e.g. Head of Cloud Architecture"],
  ]},
  { name: "C. Geography & regions", rows: [
    ["{{PRIMARY_REGION}}",      "AWS region code", "e.g. eu-west-2"],
    ["{{PRIMARY_REGION_NAME}}", "Friendly region name", "e.g. London (eu-west-2)"],
    ["{{SECONDARY_REGION}}",    "Secondary / DR region or TBD", "e.g. eu-west-1 or TBD"],
    ["{{AZ_LIST}}",             "Availability Zones in primary region", "e.g. eu-west-2a, eu-west-2b, eu-west-2c"],
    ["{{DATA_RESIDENCY}}",      "Data residency constraint", "e.g. UK only, EU"],
  ]},
  { name: "D. Identity & directory", rows: [
    ["{{IDP_PRODUCT}}",        "Identity provider product", "e.g. Microsoft Entra ID, Okta, Ping"],
    ["{{IDP_PROTOCOL}}",       "Federation protocol", "e.g. SAML 2.0 + SCIM v2"],
    ["{{SSO_PORTAL_URL}}",     "IAM Identity Center start URL", "(generated after setup)"],
    ["{{ROOT_EMAIL_PATTERN}}", "Pattern for account root emails", "e.g. aws+{purpose}@{{CUSTOMER_DOMAIN}}"],
    ["{{BREAK_GLASS_GROUP}}",  "Emergency admin IAM group", "e.g. Enterprise_Admins"],
  ]},
  { name: "E. Account structure", rows: [
    ["{{MANAGEMENT_ACCOUNT_NAME}}", "Management account alias", "e.g. {{CUSTOMER_CODE}}-management"],
    ["{{MANAGEMENT_ACCOUNT_ID}}",   "Management account ID", "12-digit number, e.g. 111111111111"],
    ["{{LOG_ARCHIVE_ACCOUNT_ID}}",  "Log Archive account ID", ""],
    ["{{AUDIT_ACCOUNT_ID}}",        "Audit / Security Tooling account ID", ""],
    ["{{NETWORK_ACCOUNT_ID}}",      "Network account ID", ""],
    ["{{SHARED_SERVICES_ACCOUNT_ID}}","Shared Services account ID", ""],
    ["{{ORG_ID}}",                  "AWS Organizations ID", "e.g. o-abcdef1234"],
  ]},
  { name: "F. Business units & environments", rows: [
    ["{{BUSINESS_UNITS}}", "Comma-separated list of BUs", "e.g. Asset Finance, Motor Finance, Premium Finance, Treasury"],
    ["{{ENVIRONMENTS}}",   "Full list of environments", "e.g. Production, PreProduction, UAT, SIT, Test, Development"],
    ["{{ENV_PER_BU}}",     "Environments created per BU at day one", "Often a subset; e.g. Production, PreProduction, Development"],
    ["{{SANDBOX_ENABLED}}","Sandbox OU enabled?", "Yes / No"],
  ]},
  { name: "G. Networking", rows: [
    ["{{LZ_SUPERNET}}",          "Top-level LZ CIDR", "e.g. 172.26.0.0/16 or 10.0.0.0/8"],
    ["{{LZ_REGION_CIDR}}",       "Region allocation", "e.g. 172.26.0.0/16"],
    ["{{VPC_NETMASK_BU}}",       "Mask per BU", "e.g. /19"],
    ["{{VPC_NETMASK_ENV}}",      "Mask per environment", "e.g. /21"],
    ["{{ON_PREM_CIDRS}}",        "On-prem ranges", "e.g. 10.10.0.0/16, 10.20.0.0/16"],
    ["{{ON_PREM_DC_LIST}}",      "On-prem datacentres", "e.g. Slough, Brentwood"],
    ["{{CONNECTIVITY_MODEL}}",   "How AWS connects to on-prem", "e.g. 2× 10G Direct Connect with VPN backup"],
    ["{{INSPECTION_PRODUCT}}",   "Inspection engine", "e.g. AWS Network Firewall, Palo Alto VM-Series, Fortinet"],
    ["{{DNS_DOMAIN_INTERNAL}}",  "Internal DNS domain", "e.g. corp.acmebank.com"],
    ["{{DNS_FORWARDER_PRODUCT}}","Internal DNS service", "e.g. Active Directory DNS, Infoblox"],
  ]},
  { name: "H. Security & compliance", rows: [
    ["{{COMPLIANCE_FRAMEWORKS}}", "Target frameworks", "e.g. CIS AWS Foundations Benchmark v3, NIST CSF 2.0, PCI DSS 4.0"],
    ["{{REGULATORY_BODIES}}",     "Regulators applicable to customer", "e.g. FCA, PRA, ICO"],
    ["{{SIEM_PRODUCT}}",          "SIEM / log analytics", "e.g. Splunk Cloud, Microsoft Sentinel, AWS native"],
    ["{{TICKETING_PRODUCT}}",     "Ticketing / ITSM tool", "e.g. ServiceNow, Jira Service Management"],
    ["{{BACKUP_PRODUCT}}",        "Backup product", "e.g. AWS Backup, Rubrik, Veeam"],
    ["{{LOG_RETENTION_HOT}}",     "Hot log retention", "e.g. 90 days"],
    ["{{LOG_RETENTION_COLD}}",    "Cold log retention", "e.g. 7 years"],
  ]},
  { name: "I. Operating model", rows: [
    ["{{OPS_MODEL}}",      "Operating model summary", "e.g. Centralised Platform Team + Federated App Teams"],
    ["{{DEPLOY_TOOLING}}", "Deployment toolchain", "e.g. AWS LZA + Terraform, Control Tower + AFT, CloudFormation"],
    ["{{TAGGING_KEYS}}",   "Mandatory tag keys", "e.g. BusinessUnit, Environment, CostCentre, DataClassification, Owner"],
  ]},
  { name: "J. Commercials (SOW only)", rows: [
    ["{{ENGAGEMENT_DURATION}}", "End-to-end duration", "e.g. 10 weeks"],
    ["{{PHASE_1_FEE}}",         "Phase 1 fee", "e.g. £45,000"],
    ["{{PHASE_2_FEE}}",         "Phase 2 fee", "e.g. £35,000"],
    ["{{TOTAL_FEE}}",           "Total fee", "e.g. £80,000"],
    ["{{CURRENCY}}",            "Currency", "e.g. GBP, EUR, USD"],
    ["{{QUOTE_VALIDITY_DAYS}}", "Quote validity", "e.g. 30"],
  ]},
];

const groupBlocks = groups.flatMap((g) => [
  H1(g.name),
  makeTable({
    headers: ["Placeholder", "Description", "Example"],
    rows: g.rows,
    widths: [2800, 3500, 2726],
  }),
  SPACER(),
]);

const docContent = flat([
  new Paragraph({ style: "Title", children: [new TextRun("Placeholder Reference")] }),
  new Paragraph({ style: "Subtitle", children: [new TextRun("AWS Landing Zone Template Pack")] }),
  SPACER(),
  richP("Use this reference to gather every customer-specific value at the start of an engagement. Each placeholder appears identically across every document in the pack (HLD, LLD, SOW, deck, workbooks, scripts)."),
  richP("Convention: All placeholders are written as {{NAME}} — exactly, no spaces inside the braces. In templates they are styled red, italic, bold. If a value is genuinely not applicable, use \"N/A\" rather than leaving the placeholder visible."),
  PAGEBREAK(),
  H1("Contents"),
  new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-1" }),
  PAGEBREAK(),
  ...groupBlocks,
  H1("Fill-in checklist"),
  richP("Suggested workshop agenda to capture these values in the first design week:"),
  BULLET("Customer identity (A) — confirm legal name, short name, primary domain."),
  BULLET("Identity & directory (D) — engage IdP team early; they often have lead time."),
  BULLET("Account structure (E) — agree initial account list with finance / billing team."),
  BULLET("Business units & environments (F) — confirm scope with each BU sponsor."),
  BULLET("Networking (G) — engage network team for on-prem CIDRs and connectivity model."),
  BULLET("Security & compliance (H) — engage security & compliance to confirm frameworks."),
  BULLET("Commercials (J) — finalise with account manager before issuing SOW."),
]);

Packer.toBuffer(build("Placeholder Reference", "Canonical placeholder taxonomy", docContent)).then((buf) => {
  fs.writeFileSync(process.argv[2], buf);
  console.log("Wrote " + process.argv[2]);
});
