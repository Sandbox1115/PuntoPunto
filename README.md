# PuntoPunto

**PuntoPunto** is a free, non-commercial browser-based workspace for cross-stitch enthusiasts. It can open OXS patterns, help track completed stitches, and let you manually digitize supported PDF patterns into OXS files. It does not require an account or collect project contents for profiling.

> **GitHub Pages beta v0.9.8.8.20 — quality infrastructure release.** This software is provided for evaluation and may contain defects. Keep your original patterns and make regular backups of your progress.

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

This repository contains only the files needed to run the static site, two sample projects, user instructions, version history and third-party notices. No account credentials, personal contact details, internal test artifacts, screenshots of user projects or private datasets are intended for publication.

For deployment instructions see [GitHub Pages setup](PUBBLICAZIONE_GITHUB.md) and for changes see [CHANGELOG](CHANGELOG.md). Deploy via **Settings → Pages → Deploy from a branch → main → /(root)**; `.nojekyll` is included. This repository is publicly accessible even if its link is shared only with invited testers.

### Beta limitations

The bundled PDF.js version is now **6.4.299**. `isEvalSupported:false`, `enableScripting:false` and `enableXfa:false` mitigate known PDF execution risks; the bundled ESM library and module worker are locally integrity-checked. Runtime compatibility on real HTTPS and file:// browsers must still be verified before approval. Consult `SECURITY_NOTES.md`. The current manual PDF-to-OXS workflow may not reproduce special stitch types that have not been explicitly digitized. Always verify exported patterns against their original sources.

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
