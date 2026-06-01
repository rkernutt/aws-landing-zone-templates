#!/usr/bin/env python3
"""Scan every template file for residual customer-specific terms."""
import os
import pathlib
import re
import sys
import zipfile

# Default: repo root (one level up from tools/). Override by passing a path.
ROOT = str(pathlib.Path(sys.argv[1]).resolve()) if len(sys.argv) > 1 \
       else str(pathlib.Path(__file__).resolve().parent.parent)
# Terms that should NOT appear in any template (legacy/ is excluded).
TERMS = ["Close Brothers", "closebrothers", "Softcat", "Simon Teague", "Ross Hamilton",
         "Anthony Hayes", "Gareth Johnson", "Jason Larkin", "Cisco ACI", "Panorama",
         "CenturyLink", "Splunk Billing", "Aws.master2", "Cb-compliance", "cb-network-",
         "Cb-network-", "AssetDev", "AssetProd", "InvoiceDev", "InvoicePreProd",
         "MotorDev", "MotorProd", "PremiumDev", "PremiumProd", "CentralDev",
         "Awsroot", "Awssecurity", "Awssharedservices", "Awslogging", "Awsnetwork"]
ALLOW_DIRS = {"legacy", "tools", ".github", ".git"}

def read_docx_text(path):
    with zipfile.ZipFile(path) as z:
        for n in z.namelist():
            if n.endswith(".xml"):
                yield n, z.read(n).decode("utf-8", errors="ignore")

def read_xlsx_text(path):
    return read_docx_text(path)

def read_pptx_text(path):
    return read_docx_text(path)

def scan_text(text, terms):
    return [t for t in terms if t.lower() in text.lower()]

hits = []
for dirpath, dirnames, files in os.walk(ROOT):
    # Skip legacy/
    dirnames[:] = [d for d in dirnames if d not in ALLOW_DIRS]
    for fname in files:
        path = os.path.join(dirpath, fname)
        rel = os.path.relpath(path, ROOT)
        if fname.endswith((".docx", ".xlsx", ".pptx")):
            try:
                for n, content in read_docx_text(path):
                    found = scan_text(content, TERMS)
                    if found:
                        hits.append((rel, n, sorted(set(found))))
            except Exception as e:
                print(f"ERROR reading {rel}: {e}", file=sys.stderr)
        elif fname.endswith((".py", ".yaml", ".yml", ".md", ".txt", ".js")):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                found = scan_text(content, TERMS)
                if found:
                    hits.append((rel, "(text)", sorted(set(found))))
            except Exception as e:
                print(f"ERROR reading {rel}: {e}", file=sys.stderr)

if hits:
    print("FOUND legacy terms in:")
    for rel, n, terms in hits:
        print(f"  {rel} :: {n} :: {terms}")
    sys.exit(1)
else:
    print("PASSED — no legacy/customer-specific terms found in any template file.")
    sys.exit(0)
