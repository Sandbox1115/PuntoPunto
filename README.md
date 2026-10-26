# PuntoPunto

**PuntoPunto** is a free, non-commercial browser-based workspace for cross-stitch enthusiasts. It can open OXS patterns, help track completed stitches, and let you manually digitize supported PDF patterns into OXS files. It does not require an account or collect project contents for profiling.

> **Private beta — v0.9.8.8.6.** This software is provided for evaluation and may contain defects. Keep your original patterns and make regular backups of your progress.

## Use the application

After GitHub Pages is enabled, the intended project address is:

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

The bundled PDF.js version is **3.11.174**. Existing security mitigations are enabled, but upgrading this dependency remains a priority. The current manual PDF-to-OXS workflow may not reproduce special stitch types that have not been explicitly digitized. Always verify exported patterns against their original sources.

A confidential privacy contact and formal data-controller information have **not yet been supplied**. These must be addressed before opening the public-hosted beta to testers; do not put personal contact details in the public repository without the owner's express permission.