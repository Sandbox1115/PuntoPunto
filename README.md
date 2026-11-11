# PuntoPunto

**PuntoPunto** is a free, non-commercial browser-based workspace for cross-stitch enthusiasts. It can open OXS patterns, help track completed stitches, and let you manually digitize supported PDF patterns into OXS files. It does not require an account or collect project contents for profiling.

> **Current release: v0.9.8.8.23.2.1.** Keep the original pattern and export regular progress backups. Verify generated OXS files against the source PDF.

## v0.9.8.8.23.2.1 — OXS interaction and mobile view

The stitch/thread editor controls appear only in Edit mode; the fabric and appearance settings are centralized under View. The mobile Pattern dock opens the dedicated Wide view (with Exit control). In Mark mode, a tap/click marks one stitch while dragging pans the pattern and never marks a chain of stitches. Pinch, special-stitch chooser, keyboard tools, OXS/JSON formats and PDF workflow are preserved. The original logo, licensed local fonts, offline privacy model and third-party assets are unchanged.

## Use the application

The public beta is available at:

**https://sandbox1115.github.io/PuntoPunto/**

Use **Open OXS** for `.oxs` pattern files and **Open PDF** for PDF patterns. The landing-page drop zone accepts either format. The UI starts in Italian; use the **IT / EN** control to switch to English. You can try the two provided samples:

- `esempio-fiore.oxs` — a sample cross-stitch pattern.
- `esempio-schema-pdf.pdf` — a sample PDF for manual grid setup and digitization.

Detailed instructions are in [User Guide (English)](USER_GUIDE_EN.md) and [Guida utente (Italiano)](GUIDA_UTENTE.md). The application also includes interactive guidance for the PDF workflow.

## Support and feedback

[GitHub Issues](https://github.com/Sandbox1115/PuntoPunto/issues) is the **official channel for beta feedback, bug reports and technical support**. Discussions are intentionally not enabled. A GitHub account is required to create an issue, and submissions are public. **Do not disclose personal details, private patterns, PDFs, account information or confidential project data in an issue.** Issues are not a secure channel for private data-protection requests.

## Privacy and local storage

Pattern processing, PDF rendering, stitch editing, progress tracking and OXS exports run in your browser. **The application does not upload your OXS/PDF documents to a PuntoPunto server**, and it does not implement account registration, marketing analytics or advertising trackers. Local browser storage (such as IndexedDB and localStorage) may hold progress and project data; clearing it may erase saved work. Export project/progress files regularly.

GitHub Pages, as the hosting provider, processes technical connection data, including IP address logging for security. See the site's [Privacy](privacy.html) page and the [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection).

## Copyright and third-party components

You must respect the copyright and license terms of patterns you import. Digitizing a third-party PDF does not transfer rights to the resulting OXS file; redistribution or sale may require permission from the copyright holder.

The embedded PDF.js library is provided under **Apache License 2.0** and the MakeBead DMC color data under **CC BY 4.0**, with attribution. See [Licenses and attributions](licenze.html), [`vendor/LICENSE-PDFJS.txt`](vendor/LICENSE-PDFJS.txt), and [`data/ATTRIBUZIONE-DMC.txt`](data/ATTRIBUZIONE-DMC.txt).

The site source files are publicly readable because they are served by GitHub Pages. **This does not, by itself, grant an open-source license for the original PuntoPunto code.**

## Hosting and release information

The repository contains the static application, two public samples, documentation, third-party notices and QA/build tooling. The Pages artifact includes only runtime files and required notices; QA, documentation, release reports and archives are not served. No account credentials, personal contact details, internal test artifacts, screenshots of user projects or private datasets are intended for publication.

For deployment instructions see [GitHub Pages setup](PUBBLICAZIONE_GITHUB.md) and for changes see [CHANGELOG](CHANGELOG.md). For a QA-gated deployment choose **Settings → Pages → Source → GitHub Actions** and use the tested quality workflow. Do not assume the existing branch-based Pages workflow is gated by QA. The workflow generates `.nojekyll` in its runtime artifact; `_config.yml` excludes repository-only files from the legacy branch publisher as well. This repository is publicly accessible even if its link is shared only with invited testers.

### Beta limitations

The bundled PDF.js version is now **6.4.299**. `isEvalSupported:false`, `enableScripting:false` and `enableXfa:false` mitigate known PDF execution risks; the bundled ESM library and module worker are locally integrity-checked. Automated checks do not certify every browser or real mobile device. Consult `SECURITY_NOTES.md`. The current manual PDF-to-OXS workflow may not reproduce special stitch types that have not been explicitly digitized. Always verify exported patterns against their original sources.

A confidential privacy contact and formal data-controller information have **not yet been supplied**. These must be addressed before opening the public-hosted beta to testers; do not put personal contact details in the public repository without the owner's express permission.

### Version 0.9.8.8.9 usability changes

- A detailed IT/EN guide is available on demand from a prominent home button.
- Explicit, confirmed return-to-home control for OXS projects.
- Confirmed return-to-home using the logo or Close from a PDF project, with a reminder to export the full JSON project backup.
- Both GitHub Pages and self-contained local distributions are supported.

### v0.9.8.8.9 — Usability update

The home tutorial is available via a visible button and never pops up automatically. Closing an OXS resets the legend, stitch types and project statistics. Narrow-screen hero artwork and captions no longer overlap text. This historical note refers to the original 0.9.8.8.9 preview, since incorporated into later releases.

### Mobile pattern navigation (v0.9.8.8.9)
Two-finger pinch-to-zoom and pan work in the OXS canvas. Use **Hide interface** for a distraction-free, full-screen editing area, then **Show controls** to restore the toolbars. Touch-based marking is committed on finger release so pinching never marks stitches.

## Mobile file opening (v0.9.8.8.13)

On phones, use the **Open OXS** or **Open PDF** button on the home screen. File drag-and-drop remains available in desktop browsers.

## Persistence notes — 0.9.8.8.19

Automatic saves are checked for integrity and structural validity before recovery. PDF saves may fall back to localStorage; the newest valid copy is preferred on reopening. Keep independent JSON backups: browser data can still be cleared, and cross-tab edits are not merged.

## Mobile PDF editor — 0.9.8.8.19

On phones, the PDF editor opens in wide view with a persistent tool dock. Use **Threads** to select DMC/custom floss, **Actions** for import/export and other controls, and two fingers to zoom and pan without editing cells. A single tap changes a cell on release. Always download a full project backup periodically.

## Roadmap backlog

PWA/mobile installability is deferred until the saving/recovery and mobile PDF editor releases have completed real-device validation. Version 0.9.8.8.20 is **not** a PWA and does not install service workers or change offline caching.

OXS quick filters, undo last marking, and jump to last stitch are available. The viewport position is stored as a local preference, not part of exported JSON backups.


## Localization review

Version 0.9.8.8.19 was prepared and reviewed on `review/v0.9.8.8.19-it-en` before publication. Documentation is English by default; [Italian user guide](GUIDA_UTENTE.md) and [English user guide](USER_GUIDE_EN.md) are maintained separately. Historical Italian release notes are preserved in [CHANGELOG_IT.md](CHANGELOG_IT.md), with an English overview in [CHANGELOG.md](CHANGELOG.md). No changes to library binaries, project formats or uploaded user files were intended for this review.


## v0.9.8.8.20 — Quality infrastructure

- Run `python3 qa/quality.py verify --root . --mode web` for a release-blocking source/integrity audit, including local links, version labels, all packaged hashes, PDF.js and catalog SHA-256, JS syntax and HTML structure.
- Run `python3 -m unittest discover -s qa/tests -v` and `node --test qa/tests/*.test.cjs` for behavioral and build-system regressions. No external test frameworks or network access are needed.
- Run `python3 qa/build.py --source . --output dist` to prepare verified `dist/github-pages/` and `dist/offline/` distributions. The offline version embeds the verified PDF.js engine, matching worker and resource files and the DMC catalog: open `dist/offline/index.html` directly with a browser; HTTP is not needed.
- `qa/quality.py manifest` generates an integrity manifest of every packaged file except the manifest itself. Do not hand-edit the manifest; CI verifies it.
- `.github/workflows/quality-pages.yml` gates an **Actions-based** Pages deployment on the QA checks. To enforce the gate, GitHub Pages must be configured to deploy from **GitHub Actions**, not by directly publishing the branch; the workflow is included in the published repository. Verify the GitHub Pages deployment source before relying on this workflow as a mandatory release gate.

## v0.9.8.8.20.1 — OXS completion rendering hotfix (review build)

- Restores the original plain green checkmark for all completed OXS stitches; overlapping stitches share the same visual style with smaller positional offsets, without circular badges.
- Corrects completion marks shown by the **Unfinished** filter. Completion is tracked per stitch, and other thread/kind filters now also apply to completion overlays.
- Resolves overlap checks against the stitch's actual cell, not adjacent cells included in the ornament selection index.
- No changes to saved progress, OXS/JSON schemas, PDF.js, DMC catalog or user data. This version is **not yet published** to GitHub Pages.

## v0.9.8.8.20.2 — OXS overlapping stitches (published)

Selecting a cell with multiple independent stitches now shows all of them, including both colored triangular halves and a full cross when present. The chooser reports completed/total and stays open as you mark each stitch. The original green plain checks remain unchanged. The change was tested in a local review build and approved for the v0.9.8.8.20.2 GitHub Pages release.

## v0.9.8.8.21 — Final IT/EN localization (review candidate)

Dynamic OXS/PDF messages now use complete named templates in Italian and English, with numbers, filenames and thread codes substituted as data. The bilingual engine also refreshes bound status labels/tooltips after switching languages, and updates an open overlapping-stitch selector without modifying completed stitches. Validation/recovery errors have more comprehensive English wording. User-supplied names, filenames, palette titles and OXS/PDF content are never translated as project data. The separate Italian historical release log is kept in `CHANGELOG_IT.md`; this file and `CHANGELOG.md` are public English documentation. These changes were integrated into the subsequently approved v0.9.8.8.21.2 release.

## v0.9.8.8.21.1 — physical grid setup and English DMC thread labels

In PDF setup, choose exact column/row counts or enter design width/height and fabric density in cm (stitches/cm) or inches (ct). The application rounds to integer stitch counts and previews an evenly divided grid. Verify printed chart alignment: measurements alone do not certify stitch counts. OXS uses the bundled DMC catalog to show canonical English thread names for recognized DMC codes under EN; original/custom palette descriptions remain unchanged in project data.

These changes were integrated into the subsequently published v0.9.8.8.21.2 release.

## v0.9.8.8.21.2 — PDF DMC floss names in both languages (published)

- In the PDF editor, the DMC search results, already-added legend and selected-thread status now follow the IT/EN selector. Italian search terms also match the localized descriptions; English and numeric code searches continue to work.
- The additional 489-name Italian reference is a **non-official descriptive translation** of the already bundled MakeBead DMC catalog (CC BY 4.0). It ships locally, works offline, and does not modify the original catalog, floss codes, RGB values, or imported/saved user palette descriptions.
- Custom threads are never translated. The feature is display-only, does not call a translation service, and does not change PDF/OXS/JSON formats or browser persistence. The owner approved GitHub Pages publication of v0.9.8.8.21.3.

## v0.9.8.8.21.3 — PDF bulk operations and mobile file menu (published)

**Fill uncolored cells with white** assigns a full white DMC B5200 cross to every remaining undefined or confirmed-empty square. This is different from **Confirm remaining cells empty**, which produces blank fabric with no stitch. The operation never recolors already assigned stitches, requires confirmation, and can be undone before further editing.

Use **Manage** beside a PDF palette entry to replace it across all assigned squares with a different thread already in the legend. Add a new DMC/custom thread to the legend first if needed. Replacement preserves point types and completed progress. **Delete thread** removes the entry and makes its assigned cells undefined, clearing their completed markings; confirmation and one-step bulk undo are provided.

On mobile, the small header file buttons are grouped in a **File** disclosure on the right. It retains Open OXS, Open PDF and PDF Project with full labels and touch-sized controls. The large home buttons are unchanged. This release does not modify any user project schema.

## v0.9.8.8.23.1 — responsive craft interface and typography

The reviewed craft interface is now the web release: a smartphone dock, tablet arrangement and wide desktop panels, with consistent Privacy and Licenses pages. **Lora** headings and **Alegreya Sans** body text retain the established font sizes. Font files are self-hosted under SIL OFL 1.1; see `licenze.html` and `vendor/FONT_SOURCES.json`.

Appearance controls toggle Aida cloth, crossed threads and grid details. The visual preferences stay in localStorage (`pp-appearance-v23`); they do not alter OXS/PDF/JSON data. PDF fabric styling applies to manually assigned stitches, not the source PDF image.

The source and both distributions pass the same quality gate. Pages uses an explicit runtime allowlist in `qa/runtime-files.json`; tests, Git metadata, private patterns, local review files and release ZIPs must never be added to it. See `RELEASE_CHECKS.md` for the scope of release validation.
