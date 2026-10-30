# Publishing PuntoPunto on GitHub Pages

Repository target: `Sandbox1115/PuntoPunto` — published URL: `https://sandbox1115.github.io/PuntoPunto/`.

1. Use the public GitHub repository `Sandbox1115/PuntoPunto` (already created). Before uploading, check **Settings → Emails → Keep my email addresses private** and the author identity exposed in the initial commit history. GitHub commit metadata may be public even if site files contain no personal details. Avoid including personal profile details in its description, README or commit content.
2. Upload the **contents** of this distribution archive to the root of its `main` branch. Keep the `vendor/`, `data/`, `.nojekyll`, and both sample files in their original locations.
3. Choose **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)**.
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
