// CCoE MVP Statement of Work — template
const C = require("./docx_common.js");
const { Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak,
  TableOfContents,
  H1, H2, H3, P, BULLET, SPACER, PAGEBREAK,
  richP, richBullet, makeTable, build, fs } = C;

function flat(arr) {
  const out = [];
  for (const x of arr) {
    if (Array.isArray(x)) out.push(...flat(x));
    else out.push(x);
  }
  return out;
}

const titleBlock = [
  new Paragraph({ style: "Title", children: [new TextRun("Statement of Work")] }),
  new Paragraph({ style: "Subtitle", children: [new TextRun("Cloud Centre of Excellence — Minimum Viable Product")] }),
  SPACER(),
  richP("Customer: {{CUSTOMER_NAME}}"),
  richP("Supplier: {{PARTNER_LEGAL_NAME}}"),
  richP("Document version: {{DOC_VERSION}}    |    Date: {{DOC_DATE}}"),
  richP("Classification: Commercial in Confidence"),
  PAGEBREAK(),
];

const documentControl = [
  H1("Document Control"),
  makeTable({
    headers: ["Field", "Value"],
    rows: [
      ["Project name", "{{PROJECT_NAME}}"],
      ["Customer", "{{CUSTOMER_NAME}}"],
      ["Supplier", "{{PARTNER_LEGAL_NAME}}"],
      ["Creation date", "{{DOC_DATE}}"],
      ["Owner / author", "{{DOC_AUTHOR}}"],
      ["Audience", "External"],
      ["Document classification", "Commercial in Confidence"],
    ],
    widths: [3000, 6026],
  }),
  SPACER(),
  H2("Revision History"),
  makeTable({
    headers: ["Version", "Revision Details", "Revised By", "Date"],
    rows: [
      ["0.1", "Initial draft", "{{DOC_AUTHOR}}", "{{DOC_DATE}}"],
      ["1.0", "Issued for signature", "", ""],
    ],
  }),
  SPACER(),
  H2("Customer Approval History"),
  makeTable({
    headers: ["Version", "Approver", "Position", "Date"],
    rows: [["1.0", "", "", ""]],
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
  richP("This Statement of Work (SOW) sets out the professional services that {{PARTNER_LEGAL_NAME}} (\"{{PARTNER_NAME}}\", which definition shall include its subcontractors) will provide to {{CUSTOMER_NAME}} (\"the Customer\") in support of establishing a Cloud Centre of Excellence (CCoE) Minimum Viable Product. The SOW captures the scope, activities, deliverables, costs, indicative timelines and terms of reference for the engagement."),
  H2("Overview"),
  richP("{{PARTNER_NAME}} is engaged by the Customer to design and deliver an AWS Landing Zone and to establish the Cloud Centre of Excellence capabilities required to safely and effectively operate AWS at scale. This SOW relates specifically to the CCoE MVP phase: discovering the current operating model, recommending a target operating model, and producing the actionable plan to close the gap."),
  richP("The CCoE MVP focuses on people, process and tooling readiness — complementing the technical Landing Zone delivery captured under separate SOW(s). The objective is a minimum viable operating model that allows {{CUSTOMER_SHORT}} to consume AWS services safely, with the right governance, security, financial and operational controls in place."),
  PAGEBREAK(),
];

const scope = [
  H1("Engagement Scope"),
  richP("{{PARTNER_NAME}} has determined that the following consultancy services are within scope for this engagement."),
  H2("Phase 1: Discovery / Requirement Gathering"),
  richP("Phase 1 will be focused on performing a Technical Advisory Workshop, whereby {{PARTNER_NAME}} will perform assessments and hold discussions with the wider Customer teams to capture the current state and target state for the CCoE MVP capabilities."),
  H3("Advisory Focus Areas"),
  richP("The following CCoE capability domains are in scope for this engagement:"),
  H3("Governance"),
  BULLET("Finance and FinOps"),
  BULLET("Standards and architectural guardrails"),
  BULLET("Architecture design patterns / reference architectures"),
  BULLET("Risk and Compliance"),
  H3("Operations"),
  BULLET("Request fulfilment"),
  BULLET("Incident management"),
  BULLET("Change management"),
  BULLET("Monitoring and observability"),
  BULLET("Resource management"),
  H3("Platform"),
  BULLET("Automation (IaC tooling — Terraform / CDK / CloudFormation)"),
  BULLET("Provisioning and account vending (Control Tower / AFT)"),
  BULLET("Resilience and disaster recovery"),
  BULLET("Identity (IAM Identity Center, {{IDP_PRODUCT}} federation)"),
  BULLET("Data protection and encryption"),
  H3("Strategy"),
  BULLET("Cloud roadmap and adoption plan"),
  BULLET("Migration approach (Re-host / Re-platform / Re-factor / Repurchase)"),
  BULLET("Sustainability and carbon-aware design"),
  H3("Security"),
  BULLET("Identity management"),
  BULLET("Infrastructure security"),
  BULLET("Access management"),
  BULLET("Security monitoring, logging and SIEM integration ({{SIEM_PRODUCT}})"),
  BULLET("Vulnerability management"),
  H3("People & Culture"),
  BULLET("Skills and capability assessment"),
  BULLET("Roles and responsibilities (RACI)"),
  BULLET("Cloud operating model and team topologies"),
  BULLET("Training and enablement plan"),
  H3("Technical Domains in Scope"),
  BULLET("Infrastructure: networking (LAN/WAN/firewalls/routing), platform compute/storage/virtualisation, cloud connectivity"),
  BULLET("Identity & Access Management: SSO, federation, conditional access, MFA, modern vs legacy authentication"),
  BULLET("Automation: provisioning / deprovisioning, configuration management, GitOps"),
  BULLET("Data Security: CASB, DLP, EDR, classification and tagging"),
  BULLET("Network Security: firewalls, DPI, SSL/IPSec VPN, SSL inspection, sandboxing"),
  BULLET("Service Management: ITSM, change, request and incident — {{TICKETING_PRODUCT}} integration"),
  H2("Phase 2: Recommendations & Documentation"),
  richP("Phase 2 will be focused on the output of data captured during Phase 1 with a series of recommendations and an actionable target operating model."),
  H2("Deliverables"),
  H3("Phase 1 Advisory and Review Sessions"),
  BULLET("On-site (or remote) advisory and review sessions"),
  BULLET("Discovery and gathering of target-state requirements"),
  BULLET("Capture of decisions made during the sessions"),
  BULLET("Discussion of how the target state can be achieved, with associated considerations, risks, limitations, pre-requisites and dependencies"),
  BULLET("Capture and discussion of the impact of business change"),
  H3("Phase 2 Documentation Output"),
  BULLET("Executive summary"),
  BULLET("Desired target state (to-be)"),
  BULLET("Current state understanding (as-is)"),
  BULLET("Gap analysis"),
  BULLET("Summary of options"),
  BULLET("Recommendation and rationale"),
  BULLET("Concept and technology choices"),
  BULLET("Licensing implications"),
  BULLET("Associated implementation costs (indicative)"),
  BULLET("Risks, concerns and limitations"),
  BULLET("Dependencies and pre-requisites"),
  BULLET("Target operating model changes (roles, responsibilities, capability uplifts)"),
  BULLET("Roadmap with phased delivery milestones"),
  H2("Notable Exclusions"),
  BULLET("Any deliverables not explicitly referenced in this SOW are excluded unless mutually agreed between {{PARTNER_NAME}} and the Customer."),
  BULLET("Implementation / configuration of the recommendations is out of scope of this SOW and may be delivered under a separate engagement."),
  H2("Pre-requisites, Assumptions and Dependencies"),
  H3("Customer Responsibilities"),
  BULLET("This SOW must be signed and returned to {{PARTNER_NAME}} before the Services detailed herein can commence."),
  BULLET("An acceptable Purchase Order (PO) is issued before any Deliverables are released to the Customer."),
  BULLET("The Customer will provide a single point of contact to act as Design Authority for the engagement ({{DESIGN_AUTHORITY}})."),
  BULLET("Documentation produced will be dependent on workshops with relevant resources from the Customer. Any cancellation or rescheduling of workshops may impact delivery timelines or incur additional charges."),
  BULLET("The Customer will use reasonable endeavours to ensure that applicable staff (including third parties where necessary) with the necessary authority will be available to support the workshops and the production of the documentation."),
  H3("Assumptions"),
  BULLET("Information provided by the Customer is complete, accurate and up-to-date."),
  BULLET("Should the need to deliver significant new tasks arise during the project, {{PARTNER_NAME}} reserves the right to invoke project change control."),
  BULLET("A single review cycle will be sufficient. If multiple cycles are required, change control may be invoked."),
  BULLET("The Customer will return collated review comments on all documents within five working days, and both parties will work to agree updates within a further five working days. If no written communication is received within the five-day review period, the documentation Deliverables are deemed accepted and are under configuration management."),
  BULLET("Document approval will not be unreasonably withheld."),
  PAGEBREAK(),
];

const approach = [
  H1("Approach"),
  H2("Engagement Approach"),
  richP("The engagement is structured as a three-step model — Discover, Assess, Recommend — covering the CCoE focus areas described in section 2.2.1. The 'MVP' items are those required to operate, deliver and secure cloud services at the start of the Customer's cloud journey; further capabilities mature through subsequent CCoE engagements."),
  H3("Step 1 — Discover"),
  BULLET("Understand the current operating model — people, process, technology."),
  BULLET("Capture the cloud strategy and business drivers for cloud adoption."),
  BULLET("Identify current gaps with financial controls, standards and reference architectures for cloud."),
  H3("Step 2 — Assess"),
  BULLET("Recommend operating model adjustments to support cloud."),
  BULLET("Assess the use of automation against a standard blueprint for AWS."),
  BULLET("Assess current security tooling, process and governance against regulator requirements ({{REGULATORY_BODIES}})."),
  H3("Step 3 — Recommend"),
  BULLET("Gap analysis output."),
  BULLET("Target operating model recommendations."),
  BULLET("Roadmap with prioritised actions and indicative costs / effort."),
  H2("Indicative Timeline"),
  makeTable({
    headers: ["Phase", "Duration", "Key Activities"],
    rows: [
      ["Phase 1 — Discovery", "Approx. {{ENGAGEMENT_DURATION}} (typically 2-4 weeks)", "Workshops, interviews, current-state capture"],
      ["Phase 2 — Recommendations", "Approx. 2-4 weeks", "Document production, gap analysis, roadmap"],
      ["Review & sign-off", "5 working days per review cycle", "Customer review and acceptance"],
    ],
    widths: [2500, 2500, 4026],
  }),
  PAGEBREAK(),
];

const risks = [
  H1("Risks"),
  richP("{{PARTNER_NAME}} would like to highlight the following anticipated, uncertain events that may affect this project's objectives."),
  makeTable({
    headers: ["Risk", "Likelihood", "Impact", "Mitigating Actions"],
    rows: [
      ["Availability of suitable Customer and {{PARTNER_NAME}} resources for workshops and discovery", "Medium", "High", "Project Managers to plan meetings in advance and secure resources."],
      ["Delivery of deliverables not detailed in this SOW could impact project completion", "Low", "Medium", "Project managers will maintain a strict scope and change control process."],
      ["Customer organisational change during engagement (e.g., re-structures, exec changes)", "Low", "High", "Regular stakeholder mapping; early engagement of {{DESIGN_AUTHORITY}}."],
      ["Required technical information / access not provided within timelines", "Medium", "Medium", "Risk Action Issue Decision (RAID) log; weekly status updates."],
    ],
    widths: [3500, 1500, 1500, 2526],
  }),
  PAGEBREAK(),
];

const outOfScope = [
  H1("Out of Scope"),
  richP("The following are deemed out of scope for this engagement and SOW:"),
  BULLET("Implementation / configuration work to support the recommendations at this stage."),
  BULLET("Any items or tasks not specifically mentioned in the Project Scope section in this SOW should be considered out of scope and excluded."),
  BULLET("Unless stated in the project scope in this SOW there will be no remedial work carried out in the environment. Additionally, any remedial work done on the environment is performed on a best endeavours basis."),
  BULLET("Disaster recovery and business continuity planning."),
  BULLET("Design of operational processes and procedures (beyond MVP CCoE recommendations)."),
  BULLET("Service Level Agreement (SLA) development."),
  BULLET("Technical support after implementation — at additional cost, support can be provided by the {{PARTNER_NAME}} Managed Services department. Please contact your {{PARTNER_NAME}} Account Manager for more information."),
  PAGEBREAK(),
];

const costs = [
  H1("Costs Schedule"),
  H2("Pricing"),
  richP("The scope and pricing detailed herein supersedes any previous agreements, quotes or proposals. {{PARTNER_NAME}} will provide the Professional Services described within at the costs set out below."),
  makeTable({
    headers: ["Professional Services", "Amount ({{CURRENCY}})"],
    rows: [
      ["Phase 1: Advisory & Consultation", "{{PHASE_1_FEE}}"],
      ["Phase 2: Report Output & Recommendations", "{{PHASE_2_FEE}}"],
      ["Total (exclusive of VAT)", "{{TOTAL_FEE}}"],
    ],
    widths: [5500, 3526],
  }),
  richP("Prices are exclusive of VAT and any reasonable expenses incurred outside of British mainland. Quotations are valid for {{QUOTE_VALIDITY_DAYS}} days from the date of this document."),
  PAGEBREAK(),
];

const terms = [
  H1("Terms and Conditions"),
  H2("General"),
  richP("All goods and services provided are bound by the full {{PARTNER_NAME}} Terms & Conditions, which are available at {{PARTNER_TERMS_URL}}."),
  H2("Work Hours"),
  richP("{{PARTNER_NAME}}'s standard workday is 7.0 hours per day worked between the hours of 09:30 and 17:30, Monday to Friday. {{PARTNER_NAME}} consultants will work the hours which are reasonably necessary to provide the Services and Deliverables under this SOW. Work required at weekends, public holidays or out of hours can be scheduled in advance but will be handled through change control and may incur additional costs."),
  H2("Travel and Expenses"),
  richP("All prices quoted include expenses for British mainland site visits. Expenses outside of this area will be charged at cost."),
  H2("Cancellation"),
  richP("Due to the costs incurred by {{PARTNER_NAME}} for the cancellation of consultancy, the following charges will be applied:"),
  makeTable({
    headers: ["Notice Given", "Cancellation Charge"],
    rows: [
      ["2 days or fewer before start date", "100%"],
      ["3-6 days before start date", "50%"],
      ["1 week or more before start date", "Nil"],
    ],
    widths: [5500, 3526],
  }),
  H2("Acceptance"),
  richP("Following provision of the Deliverables by {{PARTNER_NAME}}, the Customer shall promptly confirm adherence to the scoped outcome by written confirmation. Where such acceptance is not provided in a reasonable time frame, the Customer will submit to {{PARTNER_NAME}} the reasons for such failure. {{PARTNER_NAME}} will review the detail provided and, where found to be true, will provide details of remedy actions within a reasonable timeframe."),
  H2("Additional Terms"),
  BULLET("The Customer shall supply to {{PARTNER_NAME}} (a) the names and contact details of the Customer Contacts, and (b) any other information reasonably requested by {{PARTNER_NAME}} (together, the \"Key Information\")."),
  BULLET("The Customer will provide access to the in-scope environments including all system passwords as applicable."),
  BULLET("Quotations for the scope of work are valid for {{QUOTE_VALIDITY_DAYS}} days from the date stated on the quotation."),
  BULLET("Receipt of the Customer's purchase order shall be considered the Customer's offer to proceed on the terms quoted."),
  BULLET("The scope shall not proceed until the Customer has provided any of the Key Information, license keys as applicable and has confirmed all Customer Responsibilities have been fulfilled prior to delivery."),
  H2("Document Approval"),
  richP("This sign-off confirms the Customer's acceptance of this SOW and {{PARTNER_NAME}} Terms and Conditions. In addition, the Customer accepts the identified risks within the SOW which may impact the time scales and content of the deliverables."),
  richP("Where no sign-off is provided, acceptance will be assumed upon receipt of a purchase order equal to the value of the schedule outlined within this SOW."),
  SPACER(),
  H2("{{PARTNER_NAME}} Sign-off"),
  makeTable({
    headers: ["Field", "Detail"],
    rows: [["Print Name", ""], ["Position", ""], ["Signature", ""], ["Date", ""]],
    widths: [2500, 6526],
  }),
  SPACER(),
  H2("{{CUSTOMER_SHORT}} Sign-off"),
  makeTable({
    headers: ["Field", "Detail"],
    rows: [["Print Name", ""], ["Position", ""], ["Signature", ""], ["Date", ""]],
    widths: [2500, 6526],
  }),
];

const all = flat([
  ...titleBlock,
  ...documentControl,
  ...toc,
  ...exec,
  ...scope,
  ...approach,
  ...risks,
  ...outOfScope,
  ...costs,
  ...terms,
]);

const doc = build("CCoE MVP Statement of Work", "Cloud Centre of Excellence — SOW Template", all);
Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2];
  fs.writeFileSync(out, buf);
  console.log("Wrote " + out);
});
