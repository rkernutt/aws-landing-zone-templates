// CCoE Approach — pitch deck template (2026)
const pptxgen = require("pptxgenjs");

const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.333 x 7.5

// --- Palette: Midnight Executive ---
const NAVY = "1F3864";
const NAVY_DARK = "0F1B36";
const ICE = "CADCFC";
const ACCENT = "2E75B6";
const ACCENT_2 = "44C0E0";
const WHITE = "FFFFFF";
const GREY = "595959";
const RED = "C00000"; // placeholder colour

p.title = "CCoE MVP — Approach";
p.subject = "Cloud Centre of Excellence MVP Pitch Deck Template";
p.author = "{{PARTNER_NAME}}";
p.company = "{{PARTNER_NAME}}";

// Common geometry
const SL_W = 13.333, SL_H = 7.5, MARGIN = 0.5;

// Master slide for content
p.defineSlideMaster({
  title: "CONTENT",
  background: { color: WHITE },
  objects: [
    { rect: { x: 0, y: 0, w: SL_W, h: 0.55, fill: { color: NAVY } } },
    { text: {
        text: "{{CUSTOMER_SHORT}}  |  Cloud Centre of Excellence",
        options: { x: MARGIN, y: 0.08, w: 9, h: 0.35,
          fontSize: 12, fontFace: "Calibri", color: ICE, italic: true }
    } },
    { text: {
        text: "{{PARTNER_NAME}}",
        options: { x: SL_W - 3.2, y: 0.08, w: 3.0, h: 0.35,
          fontSize: 12, fontFace: "Calibri", color: WHITE, bold: true, align: "right" }
    } },
    { rect: { x: 0, y: SL_H - 0.35, w: SL_W, h: 0.35, fill: { color: NAVY_DARK } } },
    { text: {
        text: "Commercial in Confidence",
        options: { x: MARGIN, y: SL_H - 0.32, w: 6, h: 0.3,
          fontSize: 10, fontFace: "Calibri", color: ICE }
    } },
    { text: {
        text: "{{DOC_VERSION}}  |  {{DOC_DATE}}",
        options: { x: SL_W - 3.5, y: SL_H - 0.32, w: 3, h: 0.3,
          fontSize: 10, fontFace: "Calibri", color: ICE, align: "right" }
    } },
  ],
});

// ---------- Slide 1: Title ----------
{
  const s = p.addSlide();
  s.background = { color: NAVY };
  // Decorative bar
  s.addShape("rect", { x: 0, y: 6.0, w: 13.333, h: 0.06, fill: { color: ACCENT_2 } });
  s.addShape("rect", { x: 0, y: 5.85, w: 4.2, h: 0.06, fill: { color: ACCENT } });
  // Title
  s.addText("Cloud Centre of Excellence", {
    x: 0.7, y: 2.4, w: 12, h: 1.0,
    fontSize: 54, bold: true, color: WHITE, fontFace: "Calibri",
  });
  s.addText("Minimum Viable Product — Approach", {
    x: 0.7, y: 3.4, w: 12, h: 0.7,
    fontSize: 28, color: ICE, fontFace: "Calibri", italic: true,
  });
  // Customer block
  s.addText([
    { text: "Prepared for ", options: { fontSize: 18, color: ICE, fontFace: "Calibri" } },
    { text: "{{CUSTOMER_NAME}}", options: { fontSize: 18, color: WHITE, fontFace: "Calibri", bold: true } },
  ], { x: 0.7, y: 4.6, w: 12, h: 0.45 });
  s.addText([
    { text: "Prepared by ", options: { fontSize: 18, color: ICE, fontFace: "Calibri" } },
    { text: "{{PARTNER_NAME}}", options: { fontSize: 18, color: WHITE, fontFace: "Calibri", bold: true } },
    { text: "  ·  {{DOC_AUTHOR}}", options: { fontSize: 18, color: ICE, fontFace: "Calibri" } },
  ], { x: 0.7, y: 5.0, w: 12, h: 0.45 });
  s.addText("{{DOC_VERSION}}    |    {{DOC_DATE}}", {
    x: 0.7, y: 6.4, w: 12, h: 0.4, fontSize: 14, color: ICE, fontFace: "Calibri",
  });
}

// ---------- Slide 2: Why a CCoE ----------
{
  const s = p.addSlide({ masterName: "CONTENT" });
  s.addText("Why a Cloud Centre of Excellence", {
    x: MARGIN, y: 0.85, w: 12, h: 0.7, fontSize: 36, bold: true, color: NAVY, fontFace: "Calibri",
  });
  s.addText("Cloud adoption changes how technology, people and process work together. A CCoE is the operating-model construct that lets {{CUSTOMER_SHORT}} consume AWS safely, consistently and cost-effectively.", {
    x: MARGIN, y: 1.6, w: 12, h: 0.7, fontSize: 16, color: GREY, fontFace: "Calibri", italic: true,
  });

  // Three cards
  const cards = [
    { title: "Govern", body: "Standards, financial controls, risk & compliance, architectural guardrails." },
    { title: "Enable", body: "Skills, automation, reference patterns and shared services that accelerate teams." },
    { title: "Secure", body: "Security tooling, monitoring, controls and evidence aligned to {{REGULATORY_BODIES}}." },
  ];
  const cardW = 4.0, cardH = 3.4, gap = 0.3;
  const startX = (SL_W - (cardW * 3 + gap * 2)) / 2;
  const yC = 2.9;
  cards.forEach((c, i) => {
    const x = startX + i * (cardW + gap);
    s.addShape("rect", { x, y: yC, w: cardW, h: cardH, fill: { color: WHITE }, line: { color: ICE, width: 1 } });
    s.addShape("rect", { x, y: yC, w: cardW, h: 0.18, fill: { color: ACCENT } });
    s.addText(c.title, { x: x + 0.3, y: yC + 0.4, w: cardW - 0.6, h: 0.6, fontSize: 22, bold: true, color: NAVY, fontFace: "Calibri" });
    s.addText(c.body, { x: x + 0.3, y: yC + 1.05, w: cardW - 0.6, h: cardH - 1.2, fontSize: 14, color: GREY, fontFace: "Calibri", valign: "top" });
  });
}

// ---------- Slide 3: CCoE Capability Map ----------
{
  const s = p.addSlide({ masterName: "CONTENT" });
  s.addText("CCoE Capability Map", {
    x: MARGIN, y: 0.85, w: 12, h: 0.7, fontSize: 36, bold: true, color: NAVY, fontFace: "Calibri",
  });
  s.addText("The capabilities required to operate cloud at scale. The MVP focuses on the highlighted core capabilities; others mature through subsequent phases.", {
    x: MARGIN, y: 1.6, w: 12, h: 0.6, fontSize: 14, color: GREY, fontFace: "Calibri", italic: true,
  });

  // 7 columns × variable rows
  const columns = [
    { title: "Governance",       items: ["Finance / FinOps", "Standards", "Architecture patterns", "Risk & Compliance"] },
    { title: "Operations",       items: ["Request fulfilment", "Incident management", "Monitoring", "Change", "Resource management"] },
    { title: "Platform",         items: ["Automation", "Provisioning (AFT)", "Resilience", "Identity", "Data protection"] },
    { title: "Strategy",         items: ["Cloud roadmap", "Migration approach", "Vendor management", "Sustainability"] },
    { title: "Security",         items: ["Identity management", "Infra security", "Access management", "Monitoring & logging"] },
    { title: "People",           items: ["Skills & capability", "Roles & RACI", "Culture", "Enablement"] },
    { title: "Development",      items: ["DevOps / GitOps", "CI/CD", "Release management", "Hackathons & MVPs"] },
  ];
  const colW = 1.75, colH = 5.2, colGap = 0.04;
  const totalW = colW * columns.length + colGap * (columns.length - 1);
  const startX = (SL_W - totalW) / 2;
  const yT = 2.3;
  columns.forEach((c, i) => {
    const x = startX + i * (colW + colGap);
    s.addShape("rect", { x, y: yT, w: colW, h: 0.55, fill: { color: NAVY } });
    s.addText(c.title, { x: x + 0.05, y: yT + 0.07, w: colW - 0.1, h: 0.4, fontSize: 13, bold: true, color: WHITE, align: "center", fontFace: "Calibri" });
    s.addShape("rect", { x, y: yT + 0.55, w: colW, h: colH - 0.55, fill: { color: "F5F8FC" }, line: { color: ICE, width: 0.5 } });
    c.items.forEach((it, j) => {
      const y = yT + 0.7 + j * 0.45;
      s.addShape("rect", { x: x + 0.1, y, w: colW - 0.2, h: 0.38, fill: { color: WHITE }, line: { color: ICE, width: 0.5 } });
      s.addText(it, { x: x + 0.12, y, w: colW - 0.24, h: 0.38, fontSize: 10, color: NAVY, fontFace: "Calibri", valign: "middle", align: "center" });
    });
  });
}

// ---------- Slide 4: MVP Focus Areas ----------
{
  const s = p.addSlide({ masterName: "CONTENT" });
  s.addText("MVP Focus Areas", {
    x: MARGIN, y: 0.85, w: 12, h: 0.7, fontSize: 36, bold: true, color: NAVY, fontFace: "Calibri",
  });
  s.addText("The minimum capabilities to operate cloud safely from day one — these are the focus of this engagement.", {
    x: MARGIN, y: 1.6, w: 12, h: 0.5, fontSize: 14, color: GREY, fontFace: "Calibri", italic: true,
  });
  const focus = [
    { title: "Cloud Strategy & Roadmap", body: "Cloud principles, business outcomes, target operating model and 12-month roadmap." },
    { title: "Governance & Finance", body: "Tagging, budgets, anomaly detection, cost transparency, approval workflows." },
    { title: "Security Foundation", body: "IAM Identity Center, Security Hub, GuardDuty, Config, logging — aligned to {{COMPLIANCE_FRAMEWORKS}}." },
    { title: "Platform Automation", body: "Account vending (Control Tower / AFT), Terraform modules, golden patterns." },
    { title: "Operations & ITSM", body: "Integration with {{TICKETING_PRODUCT}}, on-call, incident response, observability via {{SIEM_PRODUCT}}." },
    { title: "People & Enablement", body: "Skills matrix, training plan, certifications, RACI and ways of working." },
  ];
  // 3 × 2 grid
  const cols = 3, rows = 2;
  const cardW = 4.0, cardH = 1.95, gx = 0.25, gy = 0.25;
  const startX = (SL_W - (cardW * cols + gx * (cols - 1))) / 2;
  const yC = 2.3;
  focus.forEach((c, i) => {
    const r = Math.floor(i / cols), col = i % cols;
    const x = startX + col * (cardW + gx);
    const y = yC + r * (cardH + gy);
    s.addShape("rect", { x, y, w: cardW, h: cardH, fill: { color: WHITE }, line: { color: ICE, width: 1 } });
    s.addShape("rect", { x, y, w: 0.12, h: cardH, fill: { color: ACCENT } });
    s.addText((i + 1).toString().padStart(2, "0"), { x: cardW + x - 0.7, y: y + 0.15, w: 0.6, h: 0.4, fontSize: 14, bold: true, color: ICE, align: "right", fontFace: "Calibri" });
    s.addText(c.title, { x: x + 0.3, y: y + 0.15, w: cardW - 1.0, h: 0.5, fontSize: 18, bold: true, color: NAVY, fontFace: "Calibri" });
    s.addText(c.body, { x: x + 0.3, y: y + 0.75, w: cardW - 0.4, h: cardH - 0.85, fontSize: 12, color: GREY, fontFace: "Calibri", valign: "top" });
  });
}

// ---------- Slide 5: Three-Step Approach ----------
{
  const s = p.addSlide({ masterName: "CONTENT" });
  s.addText("Our Approach", {
    x: MARGIN, y: 0.85, w: 12, h: 0.7, fontSize: 36, bold: true, color: NAVY, fontFace: "Calibri",
  });
  s.addText("Discover · Assess · Recommend — delivered through partnership.", {
    x: MARGIN, y: 1.6, w: 12, h: 0.5, fontSize: 14, color: GREY, fontFace: "Calibri", italic: true,
  });

  const steps = [
    { num: "01", title: "Discover", body: "Workshops & interviews to understand current operating model, cloud strategy and business drivers." },
    { num: "02", title: "Assess", body: "Gap analysis across people, process and technology. Map current to target CCoE capabilities." },
    { num: "03", title: "Recommend", body: "Target operating model, roadmap, prioritised actions, tooling and skills recommendations." },
  ];

  // Three large blocks with connectors
  const bW = 3.7, bH = 4.0, gap = 0.4;
  const startX = (SL_W - (bW * 3 + gap * 2)) / 2;
  const yB = 2.3;
  steps.forEach((st, i) => {
    const x = startX + i * (bW + gap);
    // Connector arrow between blocks
    if (i < steps.length - 1) {
      s.addShape("rightTriangle", { x: x + bW + 0.05, y: yB + bH / 2 - 0.15, w: 0.3, h: 0.3, fill: { color: ACCENT }, rotate: 0, flipH: true });
      s.addShape("rect", { x: x + bW + 0.05, y: yB + bH / 2 - 0.04, w: 0.3, h: 0.08, fill: { color: ACCENT } });
    }
    // Card
    s.addShape("rect", { x, y: yB, w: bW, h: bH, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
    // Big number
    s.addText(st.num, { x: x + 0.4, y: yB + 0.3, w: 2, h: 1.4, fontSize: 64, bold: true, color: ACCENT_2, fontFace: "Calibri" });
    s.addText(st.title, { x: x + 0.4, y: yB + 1.5, w: bW - 0.8, h: 0.7, fontSize: 28, bold: true, color: WHITE, fontFace: "Calibri" });
    s.addShape("rect", { x: x + 0.4, y: yB + 2.15, w: 0.8, h: 0.05, fill: { color: ACCENT_2 } });
    s.addText(st.body, { x: x + 0.4, y: yB + 2.3, w: bW - 0.8, h: bH - 2.5, fontSize: 14, color: ICE, fontFace: "Calibri", valign: "top" });
  });
}

// ---------- Slide 6: Deliverables ----------
{
  const s = p.addSlide({ masterName: "CONTENT" });
  s.addText("Deliverables", {
    x: MARGIN, y: 0.85, w: 12, h: 0.7, fontSize: 36, bold: true, color: NAVY, fontFace: "Calibri",
  });
  s.addText("Documentation produced and outcomes secured by the end of the engagement.", {
    x: MARGIN, y: 1.6, w: 12, h: 0.5, fontSize: 14, color: GREY, fontFace: "Calibri", italic: true,
  });

  // Two columns: Phase 1 / Phase 2
  const left = {
    title: "Phase 1 — Discovery",
    items: [
      "On-site / remote advisory sessions",
      "Current-state operating model captured",
      "Target-state requirements gathered",
      "Decisions log, risks & dependencies",
      "Business change impact assessment",
    ],
  };
  const right = {
    title: "Phase 2 — Recommendations",
    items: [
      "Executive summary",
      "As-is / to-be model and gap analysis",
      "Roadmap with phased delivery",
      "Recommendation rationale and tech choices",
      "Indicative costs, licensing, risks",
      "Target operating model and RACI",
    ],
  };
  const colW = 5.8, colH = 4.6, colY = 2.3;
  const lx = 0.7, rx = SL_W - colW - 0.7;
  [{ d: left, x: lx }, { d: right, x: rx }].forEach(({ d, x }) => {
    s.addShape("rect", { x, y: colY, w: colW, h: 0.55, fill: { color: NAVY } });
    s.addText(d.title, { x: x + 0.3, y: colY + 0.08, w: colW - 0.6, h: 0.4, fontSize: 18, bold: true, color: WHITE, fontFace: "Calibri" });
    s.addShape("rect", { x, y: colY + 0.55, w: colW, h: colH - 0.55, fill: { color: "F5F8FC" }, line: { color: ICE, width: 1 } });
    d.items.forEach((it, i) => {
      const y = colY + 0.8 + i * 0.55;
      s.addShape("ellipse", { x: x + 0.35, y: y + 0.06, w: 0.22, h: 0.22, fill: { color: ACCENT } });
      s.addText("✓", { x: x + 0.35, y: y + 0.04, w: 0.22, h: 0.22, fontSize: 12, color: WHITE, align: "center", bold: true, fontFace: "Calibri" });
      s.addText(it, { x: x + 0.7, y: y, w: colW - 1.0, h: 0.4, fontSize: 13, color: NAVY, valign: "middle", fontFace: "Calibri" });
    });
  });
}

// ---------- Slide 7: Timeline ----------
{
  const s = p.addSlide({ masterName: "CONTENT" });
  s.addText("Indicative Timeline", {
    x: MARGIN, y: 0.85, w: 12, h: 0.7, fontSize: 36, bold: true, color: NAVY, fontFace: "Calibri",
  });
  s.addText("Approximately {{ENGAGEMENT_DURATION}} end-to-end, with review and sign-off cycles built in.", {
    x: MARGIN, y: 1.6, w: 12, h: 0.5, fontSize: 14, color: GREY, fontFace: "Calibri", italic: true,
  });

  // Horizontal timeline bar
  const tx = 1.0, ty = 3.6, tw = SL_W - 2.0;
  s.addShape("rect", { x: tx, y: ty, w: tw, h: 0.08, fill: { color: ICE } });

  const milestones = [
    { label: "Kick-off", week: "Week 0" },
    { label: "Discovery workshops", week: "Week 1-3" },
    { label: "Draft target operating model", week: "Week 4" },
    { label: "Gap analysis review", week: "Week 5-6" },
    { label: "Final report & roadmap", week: "Week 7-8" },
    { label: "Sign-off", week: "Week 9" },
  ];
  milestones.forEach((m, i) => {
    const cx = tx + (tw * i) / (milestones.length - 1);
    s.addShape("ellipse", { x: cx - 0.18, y: ty - 0.13, w: 0.34, h: 0.34, fill: { color: ACCENT } });
    s.addShape("ellipse", { x: cx - 0.08, y: ty - 0.03, w: 0.14, h: 0.14, fill: { color: WHITE } });
    if (i % 2 === 0) {
      // Above
      s.addText(m.label, { x: cx - 1.0, y: ty - 1.3, w: 2.0, h: 0.45, fontSize: 13, bold: true, color: NAVY, align: "center", fontFace: "Calibri" });
      s.addText(m.week, { x: cx - 1.0, y: ty - 0.85, w: 2.0, h: 0.35, fontSize: 11, color: GREY, align: "center", italic: true, fontFace: "Calibri" });
    } else {
      // Below
      s.addText(m.label, { x: cx - 1.0, y: ty + 0.45, w: 2.0, h: 0.45, fontSize: 13, bold: true, color: NAVY, align: "center", fontFace: "Calibri" });
      s.addText(m.week, { x: cx - 1.0, y: ty + 0.9, w: 2.0, h: 0.35, fontSize: 11, color: GREY, align: "center", italic: true, fontFace: "Calibri" });
    }
  });
}

// ---------- Slide 8: Team & Investment ----------
{
  const s = p.addSlide({ masterName: "CONTENT" });
  s.addText("Team & Investment", {
    x: MARGIN, y: 0.85, w: 12, h: 0.7, fontSize: 36, bold: true, color: NAVY, fontFace: "Calibri",
  });
  s.addText("The {{PARTNER_NAME}} team allocated to this engagement and the indicative commercial summary.", {
    x: MARGIN, y: 1.6, w: 12, h: 0.5, fontSize: 14, color: GREY, fontFace: "Calibri", italic: true,
  });

  // Team table on the left
  const teamX = 0.7, teamY = 2.3, teamW = 6.5;
  s.addShape("rect", { x: teamX, y: teamY, w: teamW, h: 0.55, fill: { color: NAVY } });
  s.addText("Engagement Team", { x: teamX + 0.3, y: teamY + 0.08, w: teamW - 0.6, h: 0.4, fontSize: 18, bold: true, color: WHITE, fontFace: "Calibri" });
  const team = [
    ["Chief Technologist / Lead", "1 × FTE — Phase 1+2"],
    ["Cloud Architect", "1 × FTE — Phase 1+2"],
    ["Security Architect", "0.5 × FTE — Phase 1"],
    ["FinOps Specialist", "0.25 × FTE — Phase 2"],
    ["Programme Manager", "0.25 × FTE — Phase 1+2"],
  ];
  team.forEach((r, i) => {
    const y = teamY + 0.6 + i * 0.65;
    s.addShape("rect", { x: teamX, y, w: teamW, h: 0.6, fill: { color: i % 2 === 0 ? WHITE : "F5F8FC" }, line: { color: ICE, width: 0.5 } });
    s.addText(r[0], { x: teamX + 0.3, y, w: 3.6, h: 0.6, fontSize: 13, bold: true, color: NAVY, valign: "middle", fontFace: "Calibri" });
    s.addText(r[1], { x: teamX + 3.9, y, w: teamW - 4.2, h: 0.6, fontSize: 12, color: GREY, valign: "middle", fontFace: "Calibri" });
  });

  // Investment card on the right
  const ix = teamX + teamW + 0.3, iy = teamY, iw = SL_W - ix - 0.7;
  s.addShape("rect", { x: ix, y: iy, w: iw, h: 4.4, fill: { color: NAVY } });
  s.addText("Indicative Investment", { x: ix + 0.3, y: iy + 0.2, w: iw - 0.6, h: 0.5, fontSize: 18, bold: true, color: WHITE, fontFace: "Calibri" });
  s.addShape("rect", { x: ix + 0.3, y: iy + 0.7, w: 1.0, h: 0.05, fill: { color: ACCENT_2 } });
  s.addText("Phase 1: Discovery", { x: ix + 0.3, y: iy + 1.0, w: iw - 0.6, h: 0.35, fontSize: 13, color: ICE, fontFace: "Calibri" });
  s.addText("{{PHASE_1_FEE}} {{CURRENCY}}", { x: ix + 0.3, y: iy + 1.3, w: iw - 0.6, h: 0.5, fontSize: 22, bold: true, color: WHITE, fontFace: "Calibri" });
  s.addText("Phase 2: Recommendations", { x: ix + 0.3, y: iy + 2.0, w: iw - 0.6, h: 0.35, fontSize: 13, color: ICE, fontFace: "Calibri" });
  s.addText("{{PHASE_2_FEE}} {{CURRENCY}}", { x: ix + 0.3, y: iy + 2.3, w: iw - 0.6, h: 0.5, fontSize: 22, bold: true, color: WHITE, fontFace: "Calibri" });
  s.addShape("rect", { x: ix + 0.3, y: iy + 3.0, w: iw - 0.6, h: 0.03, fill: { color: ICE } });
  s.addText("Total (ex. VAT)", { x: ix + 0.3, y: iy + 3.15, w: iw - 0.6, h: 0.35, fontSize: 13, color: ICE, fontFace: "Calibri" });
  s.addText("{{TOTAL_FEE}} {{CURRENCY}}", { x: ix + 0.3, y: iy + 3.5, w: iw - 0.6, h: 0.7, fontSize: 28, bold: true, color: ACCENT_2, fontFace: "Calibri" });
}

// ---------- Slide 9: Thank You ----------
{
  const s = p.addSlide();
  s.background = { color: NAVY };
  s.addShape("rect", { x: 0, y: 6.0, w: 13.333, h: 0.06, fill: { color: ACCENT_2 } });
  s.addShape("rect", { x: 0, y: 5.85, w: 4.2, h: 0.06, fill: { color: ACCENT } });
  s.addText("Thank you", { x: 0.7, y: 2.5, w: 12, h: 1.4, fontSize: 90, bold: true, color: WHITE, fontFace: "Calibri" });
  s.addText("We look forward to partnering with {{CUSTOMER_SHORT}} on the cloud journey.", {
    x: 0.7, y: 4.2, w: 12, h: 0.6, fontSize: 22, color: ICE, fontFace: "Calibri", italic: true,
  });
  s.addText([
    { text: "{{DOC_AUTHOR}}", options: { fontSize: 16, color: WHITE, bold: true, fontFace: "Calibri" } },
    { text: "  ·  {{PARTNER_NAME}}", options: { fontSize: 16, color: ICE, fontFace: "Calibri" } },
  ], { x: 0.7, y: 5.0, w: 12, h: 0.45 });
}

const out = process.argv[2];
p.writeFile({ fileName: out }).then((f) => console.log("Wrote " + f));
