# tools/

Source builders and validators. The Office files at the repo root are the
*delivered* artefacts — you can edit them directly, but if you'd rather make
structural changes (new section, new slide, schema-level changes to a
workbook), it's easier to edit the corresponding builder here and regenerate.

## Rebuild the Office files

```bash
# One-time setup
npm install docx pptxgenjs
python -m venv .venv && source .venv/bin/activate
pip install openpyxl python-docx python-pptx

# Word documents
node tools/builders/build_meta_docs.js     "00-Template-Pack-README.docx"
node tools/builders/build_placeholders.js  "01-Placeholder-Reference.docx"
node tools/builders/build_hld.js           "02-HLD-Template.docx"
node tools/builders/build_lld.js           "03-LLD-Template.docx"
node tools/builders/build_sow.js           "04-CCOE-MVP-SOW-Template.docx"

# PowerPoint
node tools/builders/build_deck.js          "05-CCOE-Approach-Template.pptx"

# Excel
python tools/builders/build_workbooks.py   # writes the three xlsx files
```

The builders' output paths are taken from the command-line argument
(`process.argv[2]` for the Node builders; the Python builder writes to the
`OUT` constant — adjust that if you move things).

## Run the validators locally

```bash
python tools/leak_check.py .
```

CI runs the same checks on every push / PR (`.github/workflows/validate.yml`):

1. **Leak check** — flags forbidden customer-specific terms in any file outside
   `Scripts/legacy/`.
2. **Word / PowerPoint XML validation** — ensures each `.docx` / `.pptx` is
   schema-valid.
3. **Excel formula recalculation** — uses LibreOffice headless to recalculate
   every formula, then scans for `#REF!` / `#DIV/0!` / `#VALUE!` / etc.

Add to the forbidden term list in `leak_check.py` when you encounter new
identifiers that shouldn't survive into templates.
