// Shared helpers and styles for the AWS Landing Zone template pack.
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink,
  InternalHyperlink, Bookmark, FootnoteReferenceRun, PositionalTab,
  PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
  TabStopType, TabStopPosition, Column, SectionType,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak,
} = require("docx");
const fs = require("fs");

// A4 portrait, 1" margins (Customer-facing docs are usually A4 in UK/EU)
const A4_W = 11906, A4_H = 16838, MARGIN = 1440;
const CONTENT_W = A4_W - MARGIN * 2; // 9026 DXA

const COLOUR_PRIMARY = "1F3864";   // deep navy
const COLOUR_ACCENT = "2E75B6";    // mid blue
const COLOUR_LIGHT = "D5E8F0";     // pale blue table header
const COLOUR_ALT = "F2F2F2";       // alternating row
const COLOUR_GREY = "595959";      // body grey

function defaultStyles() {
  return {
    default: { document: { run: { font: "Arial", size: 22 } } }, // 11pt
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 56, bold: true, color: COLOUR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 480, after: 240 } } },
      { id: "Subtitle", name: "Subtitle", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, color: COLOUR_ACCENT, font: "Arial", italics: true },
        paragraph: { spacing: { before: 0, after: 360 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: COLOUR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0,
                     border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOUR_ACCENT, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: COLOUR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: COLOUR_ACCENT, font: "Arial" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 2 } },
      { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, italics: true, color: COLOUR_GREY, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 3 } },
      { id: "Caption", name: "Caption", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 18, italics: true, color: COLOUR_GREY, font: "Arial" },
        paragraph: { spacing: { before: 80, after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Placeholder", name: "Placeholder", basedOn: "Normal", quickFormat: true,
        run: { size: 22, italics: true, color: "C00000", font: "Arial" } },
    ],
  };
}

function numberingConfig() {
  return {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
        { level: 2, format: LevelFormat.BULLET, text: "▪", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 2160, hanging: 360 } } } },
      ] },
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ] },
    ],
  };
}

// ---------- paragraph helpers ----------
const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })], ...opts.p });
const PLINES = (lines) => lines.map((t) => P(t));
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const H4 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_4, children: [new TextRun(t)] });
const BULLET = (t, level = 0) =>
  new Paragraph({ numbering: { reference: "bullets", level }, children: [new TextRun(t)] });
const NUM = (t) =>
  new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun(t)] });
const CAPTION = (t) => new Paragraph({ style: "Caption", children: [new TextRun(t)] });
const SPACER = () => new Paragraph({ children: [new TextRun("")] });
const PAGEBREAK = () => new Paragraph({ children: [new PageBreak()] });

// Highlight placeholder tokens in red italic by splitting on {{...}}
function richP(text, opts = {}) {
  const parts = text.split(/(\{\{[A-Z0-9_]+\}\})/g).filter(Boolean);
  const runs = parts.map((p) =>
    p.startsWith("{{")
      ? new TextRun({ text: p, italics: true, color: "C00000", bold: true })
      : new TextRun({ text: p, ...opts.run })
  );
  return new Paragraph({ children: runs, ...(opts.p || {}) });
}
function richBullet(text, level = 0) {
  const parts = text.split(/(\{\{[A-Z0-9_]+\}\})/g).filter(Boolean);
  const runs = parts.map((p) =>
    p.startsWith("{{")
      ? new TextRun({ text: p, italics: true, color: "C00000", bold: true })
      : new TextRun({ text: p })
  );
  return new Paragraph({ numbering: { reference: "bullets", level }, children: runs });
}

// ---------- table helpers ----------
const tBorder = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const tBorders = { top: tBorder, bottom: tBorder, left: tBorder, right: tBorder, insideHorizontal: tBorder, insideVertical: tBorder };

function richCellChildren(text) {
  const parts = text.split(/(\{\{[A-Z0-9_]+\}\})/g).filter(Boolean);
  const runs = parts.map((p) =>
    p.startsWith("{{")
      ? new TextRun({ text: p, italics: true, color: "C00000", bold: true, size: 20 })
      : new TextRun({ text: p, size: 20 })
  );
  return [new Paragraph({ children: runs })];
}

function makeTable({ headers, rows, widths }) {
  const total = CONTENT_W;
  if (!widths) {
    widths = Array(headers.length).fill(Math.floor(total / headers.length));
    const diff = total - widths.reduce((a, b) => a + b, 0);
    widths[widths.length - 1] += diff;
  }
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        borders: tBorders,
        width: { size: widths[i], type: WidthType.DXA },
        shading: { fill: COLOUR_PRIMARY, type: ShadingType.CLEAR, color: "auto" },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })] })],
      })
    ),
  });
  const dataRows = rows.map((r, ri) =>
    new TableRow({
      children: r.map((c, i) =>
        new TableCell({
          borders: tBorders,
          width: { size: widths[i], type: WidthType.DXA },
          shading: ri % 2 === 1 ? { fill: COLOUR_ALT, type: ShadingType.CLEAR, color: "auto" } : undefined,
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          children: richCellChildren(String(c ?? "")),
        })
      ),
    })
  );
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...dataRows],
  });
}

function build(title, subtitle, sections) {
  const doc = new Document({
    creator: "{{PARTNER_NAME}}",
    title,
    description: subtitle,
    styles: defaultStyles(),
    numbering: numberingConfig(),
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_W, height: A4_H },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
                children: [
                  new TextRun({ text: "{{PARTNER_NAME}}", italics: true, color: "C00000", bold: true, size: 18 }),
                  new TextRun({ text: " | " + title, color: COLOUR_GREY, size: 18 }),
                  new TextRun({ text: "\t", size: 18 }),
                  new TextRun({ text: "{{CUSTOMER_SHORT}}", italics: true, color: "C00000", bold: true, size: 18 }),
                ],
              }),
              new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOUR_ACCENT, space: 1 } },
                children: [new TextRun("")],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
                children: [
                  new TextRun({ text: "{{DOC_CLASSIFICATION}}", italics: true, color: "C00000", bold: true, size: 18 }),
                  new TextRun({ text: "\t", size: 18 }),
                  new TextRun({ text: "Page ", color: COLOUR_GREY, size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], color: COLOUR_GREY, size: 18 }),
                  new TextRun({ text: " of ", color: COLOUR_GREY, size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], color: COLOUR_GREY, size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: sections,
      },
    ],
  });
  return doc;
}

module.exports = {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink,
  InternalHyperlink, Bookmark, FootnoteReferenceRun,
  TabStopType, TabStopPosition, Column, SectionType,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak,
  CONTENT_W, COLOUR_PRIMARY, COLOUR_ACCENT, COLOUR_LIGHT,
  P, PLINES, H1, H2, H3, H4, BULLET, NUM, CAPTION, SPACER, PAGEBREAK,
  richP, richBullet, makeTable, build, fs,
};
