# PuntoPunto — Change log

## v0.9.8.8.19.1 — 28 October 2026 (complete Privacy translation; approved for publication)

- Provided independent, complete Italian and English Privacy documents, switching visibility with the IT/EN selector instead of translating legal paragraphs in fragments.
- Preserved both languages' six Privacy sections, GitHub hosting disclosures, attribution links and outstanding private-contact/controller notice.
- Aligned release version labels and metadata. No changes to PDF.js, project formats, stitch processing or browser storage.


English-language release history. The original full Italian development log is preserved in [CHANGELOG_IT.md](CHANGELOG_IT.md), without changing or discarding its entries. Unpublished intermediate builds were incorporated into later published releases as noted below.

## v0.9.8.8.19 — 28 October 2026 (IT/EN localization audit; approved for GitHub Pages publication)

- Complete and verify English-facing interface copy, tooltips, accessible labels, errors, status summaries and technical metadata.
- Normalize the public English documents while retaining a separate Italian user guide and complete historical Italian change log.
- Add language-specific tests and prevent mixed Italian/English output in updated paths; preserve OXS/PDF formats, privacy handling, user files, and PDF.js 6.4.299.
- The update was prepared on a separate review branch and approved by the owner for publication; the previous public version was v0.9.8.8.18.

## v0.9.8.8.18 — 28 October 2026 (UX and accessibility; published to GitHub Pages)

- Added keyboard navigation in the OXS grid: arrow keys, Shift+arrow keys to jump ten cells, Home/End, and Enter/Space to mark a stitch. Overlapping stitches still require an explicit choice.
- Improved visible focus indicators across links, buttons, menus, fields, and interactive areas; announced the active OXS cell in both languages.
- Synchronized sidebar `aria-expanded` states and the All colors `aria-pressed` state; promoted error announcements for assistive technology.
- Restored focus and trapped Tab navigation within the PDF setup and tutorial dialogs while retaining Escape behavior.
- Added reduced-motion support, forced-colors improvements, and larger key touch targets.
- No changes to OXS/JSON formats, progress backups, overlapping-stitch semantics, or PDF.js 6.4.299.

## v0.9.8.8.17.1 — 28 October 2026 (overlapping OXS completion marks; unpublished)

- Fixed completion indicators for a second overlapping stitch, even if another stitch is rendered later over the same square.
- At readable zoom levels, overlapping marks occupy distinct positions; at very low zoom one general completion indicator remains to prevent unreadable badges.
- No changes to stitch IDs, project formats, saves, PDF.js or the DMC catalog.

## v0.9.8.8.17 — 28 October 2026 (OXS editing improvements; unpublished)

- Added an OXS quick bar: active filters, unfinished-only mode, clear filters, undo the last marking gesture, and jump to the last worked stitch.
- Added mobile Chart and return-to-chart shortcuts for the Progress and Threads panels.
- Stored per-pattern viewport position, zoom, and last stitch separately in localStorage, without modifying exported projects or progress.
- Marking undo is not a persistent edit history and does not revert pattern edits.

## v0.9.8.8.16 — 28 October 2026 (mobile PDF workspace; unpublished)

- Added a wider PDF editing canvas on small phones, persistent quick tools and a separate thread picker.
- Placed secondary actions in a mobile menu while keeping Save project and zoom visible.
- A single-finger action commits on release; two-finger pinch/pan navigates without accidentally editing cells.
- Improved thread-selection flow, labels, touch targets and manual grid setup.
- No changes to project formats, imported data, PDF.js or export logic.

## v0.9.8.8.15 — 27 October 2026 (save and recovery reliability; unpublished)

- Validated checksums, structure and references before restoring OXS or PDF saves; tried the previous intact snapshot if the latest copy was damaged.
- Selected the newest valid PDF copy from IndexedDB or the local fallback, and prompted export of an external JSON backup when recovery was needed.
- Only acknowledged PDF saves after write confirmation, warned about pending writes and improved invalid-OXS recovery.
- Browser storage remains non-permanent; real-device HTTPS, file:// and interruption tests remain important.

## v0.9.8.8.14.1 — 27 October 2026 (translation corrections; unpublished)

- Translated two missing PDF labels: Normal view and Manual digitization and progress tracking are separate.
- Restored translation of the PDF subtitle after switching from an OXS project.
- No changes to the PDF.js engine, project content or saving behavior.

## v0.9.8.8.14 — 27 October 2026 (PDF.js migration; unpublished)

- Replaced PDF.js 3.11.174 with 6.4.299 and matched its ES module and worker, integrity-checked using SHA-256.
- Added bundled CMaps, standard fonts and WASM decoders for local and GitHub Pages delivery, without a CDN.
- Kept OXS formats, grid coordinates, saved projects and editor workflows unchanged.

## Earlier releases

| Release | Date | Summary |
| --- | --- | --- |
| 0.9.8.8.13 | 27 Oct 2026 | Stability and security hardening; same-origin assets, catalog checks and IndexedDB improvements |
| 0.9.8.8.12 | 27 Oct 2026 | Published touch-friendly Open OXS/Open PDF home controls |
| 0.9.8.8.11 | 2026 | Mobile OXS progress and thread panels |
| 0.9.8.8.10 | 2026 | Complete bilingual license and attribution page |
| 0.9.8.8.9 | 2026 | Two-finger OXS zoom/pan and focus mode |
| 0.9.8.8.8 | 2026 | Optional onboarding, clean home reset, mobile layout |
| 0.9.8.8.7 | 2026 | Guided return-to-home and safer project exit |
| 0.9.8.8.6 | 2026 | GitHub Issues as the public beta support channel |
| 0.9.8.8.5 | 26 Oct 2026 | GitHub Pages publication review and packaging checks |
| 0.9.8.8.4 | 23 Oct 2026 | Explicit OXS/PDF open actions and matching buttons |
| 0.9.8.8.3 | 23 Oct 2026 | Lightweight distribution and security hardening |
| 0.9.8.8.1 | 23 Oct 2026 | Initial bilingual UI and distinct stitch symbols |
| 0.9.8.8 | 23 Oct 2026 | Tester-driven layout and OXS/PDF improvements |
| 0.9.8.7 | 22 Oct 2026 | GitHub Pages preparation |
| 0.9.8.6 | 22 Oct 2026 | Privacy transparency |
| 0.9.8.4 | 22 Oct 2026 | PP identity and stabilization |
| 0.9.8.3 | 2026 | Cross-session save tests |
| 0.9.8.2 | 2026 | IndexedDB diagnostic corrections |
| 0.9.8.1 | 2026 | Post-installation diagnostics |
| 0.9.8 | 2026 | Local dependencies and data protection |
| 0.9.7 | 2026 | Overlapping-stitch selection |
| 0.9.6 | 2026 | Special stitches and regression testing |
| 0.9.5.1 | 2026 | OXS compatibility checks |
| 0.9.5 | 2026 | Stability and dependency installation |
| 0.9.2 | 2026 | DMC thread catalog and attribution |
| 0.9.1 | 2026 | Manual PDF digitization |

For the full original development notes, individual bug fixes, test procedures, limitations and all historical entries, see the [Italian change log](CHANGELOG_IT.md). The two logs are intentionally identified by language; no legacy notes have been deleted.
