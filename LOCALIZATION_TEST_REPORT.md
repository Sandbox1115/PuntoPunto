# PuntoPunto v0.9.8.8.19 — IT/EN localization review report

**Status:** REVIEW CANDIDATE — NOT RELEASED / NOT DEPLOYED  
**Base:** published v0.9.8.8.18 (commit `35613ecf62e91c4391b49a5e43c478402e65a136`)  
**Branch:** `review/v0.9.8.8.19-it-en`  
**Scope:** language-only documentation, HTML metadata, translation dictionary, localized number formatting and displayed version.

## Automated checks run on review sources

| Check | Result |
| --- | --- |
| JavaScript parse: i18n.js | PASS |
| JavaScript parse: app.js | PASS |
| JavaScript parse: pdf-tracker.js | PASS |
| English meta description supplied: index.html | PASS |
| English meta description supplied: privacy.html | PASS |
| Original complete Italian change log preserved | PASS |
| English-language change log present | PASS |
| Review version displayed by index.html | PASS |
| Review translation dictionary present | PASS |
| IT → EN → IT on 7 known regression strings | PASS (7/7) |

The seven exercised strings cover the OXS Erase/Restore tooltips, reset-progress confirmation, invalid XML message, accessible pattern label, opening a PDF project, and successful OXS export notice. The sample harness invoked the real `PuntoPuntoI18n.t` and `setLanguage` entrypoints and checked the English output against exact expected strings and restoration of the original Italian copy.

## Localization changes

- Added 77 complete translation entries for labels, tooltips, errors and recovery messages.
- Added localized English HTML descriptions for the homepage and privacy page.
- Updated numeric separators for OXS and PDF progress through the selected IT/EN locale.
- English-first README, security notes, publishing instructions and DMC attribution.
- Preserved the entire original Italian history as `CHANGELOG_IT.md` while providing an English change-log overview.
- Kept `GUIDA_UTENTE.md` in Italian and `USER_GUIDE_EN.md` in English.

## Limitations / release gate

This is a static and translation-engine test, **not a successful full end-to-end browser test**. It does not demonstrate compatibility with actual GitHub Pages, `file://`, mobile browsers, screen readers, live PDF.js, a real OXS import/export session, or real persistent storage.

**Before approval:** verify home, OXS editor, PDF setup and digitization, Privacy, Licenses and on-screen tutorials in both languages. Exercise errors, saves/recovery, overlapping stitch picker and controls on desktop and mobile. Do not merge into `main` or deploy until specifically approved.
