# PuntoPunto security and dependency status — v0.9.8.8.21.2

## PDF.js upgraded

- Mozilla PDF.js **6.4.299** has replaced 3.11.174 in both distributions. The original core and worker files are SHA-256 checked **before** they are executed as trusted blob-based ESM modules. No external CDN.
- The migration preserves `isEvalSupported:false`, `enableScripting:false`, and `enableXfa:false` and the existing 30 MB PDF / 2,000-page limits.
- The offline version embeds the PDF.js engine, worker, CMaps, standard fonts and WASM resources; the GitHub Pages edition serves them locally in `vendor/`.
- Both formats have updated CSP definitions permitting only their own verified local module/blob resources. CSP configured through HTML `meta` is not equivalent to the stronger HTTP CSP header, and cannot enforce `frame-ancestors`.
- A successful controlled Chromium HTML-injection test is **not** equivalent to a real GitHub Pages HTTPS or direct file:// test. End-to-end checks on actual origins and mobile browsers remain mandatory before release approval.

## Other considerations

- OXS processing, data storage, privacy model, project file formats, and catalog DMC are preserved from v0.9.8.8.13.
- Continue to export and verify JSON backups; storage availability depends on browser/origin and can fail under file://.
- Before inviting external testers, finish the privacy contact/controller information from the prior security report.

## Attribution

Mozilla PDF.js is used under Apache License 2.0; see `vendor/LICENSE-PDFJS.txt`. DMC palette attribution remains unchanged.

## Data reliability — v0.9.8.8.19 (review)

Checksum and structural validation, restoration from an earlier valid copy, and error reporting have been strengthened. External JSON backups remain necessary: a browser may clear all data associated with an origin (including primary and backup copies) or deny storage quotas or permissions. No OXS/PDF project content is sent to external processing services. Automated tests using simulated browser storage do not guarantee persistence on real file://, HTTPS, or iOS/Android browsers.


## v0.9.8.8.20 quality gate

A locked-asset, whole-package SHA-256, script-syntax, local-reference, and deterministic behavior test suite is included under `qa/`. The offline package embeds PDF.js core, worker, fonts/CMaps/WASM and the DMC catalog for direct `file://` launch. On GitHub Pages, only same-origin verified resources are loaded. The GitHub Actions workflow gates deployment only after Pages **Source** is changed to **GitHub Actions**. If Pages still publishes directly from the branch, the new workflow does not prevent an untested deployment. Automated tests do not replace hands-on real-browser testing.

### v0.9.8.8.20.2 — published hotfix

The OXS overlapping-stitch chooser now displays all independent stitches per cell (including both triangular halves), each with a color/position preview and a live completed/total count. No change to exported project data, PDF.js binaries, vendor resources or persistent storage. Owner-approved hotfix: no changes to project file formats, storage, or third-party binaries. Release quality checks must pass before publishing.

### v0.9.8.8.21 — Localization scope (included in v0.9.8.8.21.2)

The new parameterized bilingual messages are rendered as text or DOM attributes, never as HTML. Project data, filenames and user-supplied thread names are preserved as data. No new external network requests, dependencies, telemetry, storage formats or PDF.js changes were introduced. Review the GitHub Pages and file:// distributions independently before publication.

## v0.9.8.8.21.1 — scope and safety of physical grid sizing

The physical-size form parses bounded decimal values locally and converts them to an integer grid before passing the existing dimensions to the PDF tracker. No OCR, server calls, external libraries, schema changes or new data persistence are introduced. DMC labels use the previously locked same-origin catalog; OXS source data is unchanged. The UI warns when the chart selection is inconsistent with square-looking cells. Physical-size conversion still requires the user to check actual chart alignment.

## v0.9.8.8.21.2 — Italian DMC labels

The additional static `dmc-floss-names-it.js` contains descriptive non-official translations keyed only by public DMC codes, with no user data, tracking, calls to third-party translation services or changes to persistence. Names are applied at display time; original and custom palette descriptions are not rewritten.
