# Release checks — PuntoPunto 0.9.8.8.23.1

Release date: 10 November 2026. Baseline: `f2eeef6ee46ae880b8b8f9f6d74c29f288d58f3a` (0.9.8.8.21.3). The project owner authorized publication of the reviewed 23.1 interface and typography.

## Validation scope

- Python: 9 tests covering locked assets, HTML/CSP, bilingual pages, version labels and distribution boundaries. The boundary tests ensure unlisted private files and `.env` files cannot enter the workflow artifact and that the legacy publisher excludes repository documents and QA.
- Node: 55 passing regression tests, including OXS completion/filtering, multi-stitch selection, local storage corruption recovery, PDF bulk white-fill/replacement/deletion, project codec, DMC localization, physical grid dimensions and display-only textile rendering. The completion-renderer harness now supplies the browser `window` object used by the optional textile renderer; all original completion assertions remain intact.
- Source and both generated packages: local references, unique DOM IDs, JavaScript syntax, CSP, sample format validity, SHA-256 manifests, original PDF.js/DMC hashes and all 16 original font-face hashes verified.
- Reproducibility: repeat `python3 qa/build.py` into an external temporary directory and compare both ZIP SHA-256 values. No dependency download is involved in the build.
- Chromium smoke checks: OXS sample and Lora title at smartphone width; PDF example rendered with same-origin PDF.js, grid setup and editor opened at tablet width; Privacy and Licenses inspected at smartphone width, including English font attribution. Earlier 23.1 review covered the home and OXS desktop arrangement. Viewport checks do not certify physical Android/iOS devices or every browser.

## Publication audit

Reviewed the proposed source tree and generated runtime inventory for credentials, private identity strings, private contact details, absolute workstation paths, environment files and accidental project exports. No user personal data or credential was found. The only email-shaped text match is in the unchanged PDF.js compressed dictionary, not a contact record. Third-party copyright and license notices remain intact.

The PDF example has no document metadata stream, author/contact metadata, form or JavaScript. The OXS example credits `PuntoPunto`; icon PNGs contain only DPI metadata. Original font binaries and the three locked assets are unmodified.

Only application assets, public examples, required dependency data and licenses, asset/font provenance and the generated integrity manifest are in the Pages artifact. The repository retains English/Italian changelogs, guides, QA and maintenance documents. Local preview pages, review reports, screenshots, ZIPs, offline embedded PDF payloads and caches are absent from the web distribution.

The existing repository also had a branch-based Pages publisher. `_config.yml` excludes repository-only content from that route; `.nojekyll` is generated only in the already-built workflow artifact. Selecting **GitHub Actions** as the sole Pages source remains the recommended administrator setting to avoid duplicate deployments. No repository access permissions, secrets or account settings are changed by this release.

## Limits

This is an audit of the release files, not a retrospective audit or removal of Git history. Browser storage still depends on origin/device and may be cleared; users should keep independent backups. A saved OXS viewport can retain its previous pan/zoom; **Fit** recenters the chart. Existing privacy documentation still identifies the missing formal controller/contact information; no private identity or invented contact was added to fill that gap.
