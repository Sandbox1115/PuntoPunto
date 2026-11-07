# Publishing PuntoPunto on GitHub Pages

Repository target: `Sandbox1115/PuntoPunto` — published URL: `https://sandbox1115.github.io/PuntoPunto/`.

1. Use the public GitHub repository `Sandbox1115/PuntoPunto` (already created). Before uploading, check **Settings → Emails → Keep my email addresses private** and the author identity exposed in the initial commit history. GitHub commit metadata may be public even if site files contain no personal details. Avoid including personal profile details in its description, README or commit content.
2. Upload the **contents** of this distribution archive to the root of its `main` branch. Keep the `vendor/`, `data/`, `.nojekyll`, and both sample files in their original locations.
3. For the QA deployment gate, use **Settings → Pages → Build and deployment → Source → GitHub Actions**; verify the workflow completed successfully. Do not rely on the independent branch-based Pages builder as a test gate.
4. Check the homepage, `privacy.html`, `licenze.html`, `data/dmc-floss.json`, and both sample files over HTTPS. Confirm there are no 404 responses and that PDF.js loads its worker from `vendor/`.
5. On a real desktop and Android browser, check OXS import/edit/export, PDF import and digitization, language switching and progress backup/restore. Verify persistence across a reload. A deployment isn't validated merely because the landing page renders.

**Important:** A GitHub Pages site is public, not restricted to invited testers. A `noindex` directive is only an indexing hint. Do not commit sensitive files, real user projects, internal reports or personal contact details. Git commits may reveal an author identity; review GitHub's email privacy settings before the first commit.

**Privacy release gate:** Before inviting testers, address the outstanding data-controller identity/contact requirement without publishing the owner's personal information without express authorization.

## Support channel

GitHub Issues is enabled as the official beta support and feedback channel: https://github.com/Sandbox1115/PuntoPunto/issues. Keep Discussions disabled for now. Do not publish confidential or personal data in issues.

### v0.9.8.8.9 — Home usability

The tutorial opens only when requested from a visible button; it never starts automatically. Closing an OXS project resets the thread legend, filters and statistics. The mobile hero illustration was adjusted to prevent overlap. Do not publish without the owner's approval.

### v0.9.8.8.12 — Previously published version (superseded by v0.9.8.8.18)

Mobile home offers prominent Open OXS and Open PDF buttons instead of desktop drag-and-drop instructions. Desktop drag-and-drop remains unchanged. The v0.9.8.8.13 improvements were subsequently incorporated into later builds.

### v0.9.8.8.19 — Approved IT/EN localization update

The owner approved publication of the reviewed v0.9.8.8.19 from `review/v0.9.8.8.19-it-en`. The live GitHub Pages deployment and real-browser tests must be checked independently of a successful code push. Keep automated and manual IT/EN regression results distinct.

### v0.9.8.8.20 — Automated quality controls (30 October 2026)

- Source: the verified, owner-approved GitHub Pages package; do not include the offline ZIP or personal project files in the website tree.
- Run `python3 qa/quality.py verify --root . --mode web`, the Python and Node.js regression suites, and both reproducible builds before the release.
- GitHub Pages must use **Source: GitHub Actions** for `quality-pages.yml` to enforce the QA gate. When Pages instead deploys from the branch, GitHub's original Pages build may still deploy independently of QA.
- The browser-based application still requires real-device functional tests, particularly for direct `file://` access to the separate local build.

### v0.9.8.8.20.1 — Review-only OXS completion hotfix

A review package is prepared for GitHub Pages and for direct local `index.html` use without an HTTP server. It restores plain completion ticks, fixes the Unfinished overlay/filter behavior for overlapping stitches and does not change OXS/JSON data formats. **Do not deploy until the owner approves the release.**

### v0.9.8.8.20.2 — published after review

The OXS overlapping-stitch chooser now displays all independent stitches per cell (including both triangular halves), each with a color/position preview and a live completed/total count. No change to exported project data, PDF.js binaries, vendor resources or persistent storage. Publication was explicitly approved after the local review; retain GitHub Actions QA and review the live deployment separately from the push.

### v0.9.8.8.21 — Prepared, NOT published

This is a language-only review candidate based on the published v0.9.8.8.20.2. Keep `main` and GitHub Pages unchanged until the owner's authorization. Run the extended IT/EN regression tests and the complete quality pipeline for both GitHub Pages and the local no-server archive; verify no user patterns, contact details, private keys or non-distribution files are added.

### v0.9.8.8.21.1 — review candidate (do not publish)

Physical PDF grid dimensions (cm/in plus fabric density) and read-only canonical English DMC names in the OXS UI. The previously published version is v0.9.8.8.20.2. Distribution must pass all QA and privacy checks. GitHub Pages and the public `main` branch must not be updated without explicit owner authorization.

### v0.9.8.8.21.2 — PDF thread names (published 2 November 2026)

Add the new local `dmc-floss-names-it.js` file alongside `dmc-catalog.js`; all 489 translated descriptions are display-only. Test PDF picker results, selected-thread status, the legend and project reload in both IT and EN, plus Italian/English/code searches. Preserve all original DMC and PDF.js binaries, pass full QA and check personal-data exposure before asking for approval. This reviewed functionality was published as v0.9.8.8.21.2.

### v0.9.8.8.21.3 — Published after QA (7 November 2026)

- Release base: **v0.9.8.8.21.2** (commit `738d536b2894f70b954bae335eb4dfabc277565d`). The owner explicitly approved publication of v0.9.8.8.21.3 on 7 November 2026.
- Changes: PDF one-click white stitch assignments, global palette replace/remove with confirmation and last-bulk undo, and a mobile-friendly right-aligned File menu; large home import buttons are retained.
- Confirm empty (no stitches) versus assign white (full-cross stitches) must remain distinct. Test colored cells, completed states, OXS round-trip, JSON backups, mobile touch/click and IT/EN.
- Publish only the verified source assets. Exclude local ZIP, internal browser scripts and private user files. Preserve the DMC/PDF.js lock hashes; check for personal information and credential leaks before pushing, then verify both the QA and Pages workflows succeeded on the released commit.
