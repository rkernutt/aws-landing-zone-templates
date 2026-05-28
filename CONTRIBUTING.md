# Contributing

This pack is a living template. PRs welcome.

## Ground rules

1. **No customer data.** Use `{{PLACEHOLDER}}` tokens only. The leak-check CI
   step will fail your PR if it finds a customer name, account ID, CIDR or
   internal URL outside `Scripts/legacy/`.
2. **Office files are binaries.** Either edit them directly in Word /
   PowerPoint / Excel, or regenerate from the source builders in `tools/`.
   See `tools/README.md`.
3. **Cross-doc consistency.** If you rename a placeholder, update it in
   `01-Placeholder-Reference.docx` and every file that uses it. CI doesn't
   catch this — review carefully.
4. **Modernise, don't add bloat.** Prefer AWS-native and Control Tower / LZA
   patterns over bespoke scripts.
5. **CI must be green** before a PR can merge.

## Branching

- `main` is the released pack.
- Feature branches: `feature/<short-description>`.
- Trivial fixes can go via PR directly to `main` with CI green.

## Commit messages

Conventional, but lightweight. Examples:

- `hld: refresh Security Hub standards section for FSBP v1.0.1`
- `tools: harden leak_check to scan .pptx slide notes`
- `scripts: bump default Inspector enabled resource types`
