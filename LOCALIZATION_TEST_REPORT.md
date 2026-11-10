# Current localization validation — v0.9.8.8.23.1

The release keeps existing IT/EN message and DMC-name regression suites, and adds the responsive craft interface with bilingual controls and typography attribution. Lora and Alegreya Sans include Italian accented glyphs. The historical report below records the earlier localization baseline; current release validation is recorded in `RELEASE_CHECKS.md`.

# PuntoPunto v0.9.8.8.19 — IT/EN localization review report

**Test status:** REVIEW CANDIDATE at the time of these checks; owner subsequently authorized GitHub Pages publication. This report records the **pre-release static checks**, not a live browser certification.  
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

## 0.9.8.8.21.2 — PDF DMC descriptions

Added tests that cover all 489 catalog entries, language switching in the PDF picker and added-thread legend, selected status, accent-insensitive Italian searches and preservation of English source descriptions and custom names. This supplemental reference is non-official and uses the source MakeBead CC BY 4.0 attribution.

## v0.9.8.8.21.3 — new bilingual actions (published after QA)

All new PDF palette-management labels, confirm dialogs and completion summaries use IT/EN static keys or parameterized templates. Project filenames, DMC codes, stored floss names and saved-project values remain unmodified by the language selector. The File disclosure in the mobile header retains readable button labels in both languages. New regression tests exercise English and Italian message output and the single-bulk undo behavior. Real-device accessibility and direct file:// execution must still be checked by the owner.
