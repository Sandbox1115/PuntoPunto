> **Mobile (v0.9.8.8.13):** from the home screen, tap **Open OXS** or **Open PDF** to choose a file from your device; drag-and-drop remains available on desktop.

# PuntoPunto — User guide (English)

## Open your pattern

Use **Open OXS** to load an OXS pattern; this action does not open PDF files. Use **Open PDF** for a PDF pattern. The general drop zone accepts both formats. Two sample files are included in the repository.

## Work on an OXS pattern

Use the legend to select a thread and see matching stitches. Filter by **thread**, **stitch type**, or both. Select **Symbols only** if the color fills obscure the stitch symbols. Mark stitches completed, or use the editing tools to modify a pattern. Export progress and/or your edited OXS.

## Manually digitize a PDF

1. Open the PDF and choose the diagram page.
2. Set and verify the grid boundary, row count and column count.
3. Use the DMC catalog or define a custom thread. Select a stitch type and assign the appropriate cells.
4. Mark empty cells as confirmed empty; undefined cells must be resolved before a complete OXS export.
5. Use the wide view or collapse the thread panel when you need more canvas space.
6. Export OXS only after confirming the digitization. Compare the result with the original PDF, especially for special stitches not supported by the manual workflow.

## Save and restore

Save a full PDF project to include the original PDF, grid, thread definitions and progress. Use progress JSON for an existing matching PDF. Browser-local copies can disappear if site data is cleared or the browser changes. **Keep exported backups.**

## Respect creators' rights

Personal digitization of third-party patterns is subject to applicable law and the pattern's license. Converting a PDF does not grant redistribution or resale rights. See the [Licenses](licenze.html) and [Privacy](privacy.html) pages.

## Language

The interface opens in Italian by default. Use the IT/EN selector to change languages; the choice is remembered by the browser when storage is available. Pattern titles, imported filenames and thread identifiers are not automatically translated.

## Feedback and support

During the beta, use [PuntoPunto GitHub Issues](https://github.com/Sandbox1115/PuntoPunto/issues) to report bugs or suggest improvements. Issues are public and require a GitHub account: do not share personal information, confidential patterns or private project files. Issues are not suitable for confidential privacy requests.

## Welcome guide and returning home (0.9.8.8.9)

A detailed IT/EN guide is available on demand from a prominent home button. Reopen it from the home screen with **How does PuntoPunto work?**. In the OXS editor, **Close project and return home** asks for confirmation but does not delete saved progress. In the PDF editor, clicking the PuntoPunto logo or **Close** asks for confirmation and recommends exporting **Save project** (JSON with the PDF and digitization) before leaving.

### v0.9.8.8.9 — Usability update

The home tutorial is available via a visible button and never pops up automatically. Closing an OXS resets the legend, stitch types and project statistics. Narrow-screen hero artwork and captions no longer overlap text. This historical change was incorporated into subsequent releases.

### Mobile OXS gestures (v0.9.8.8.9)
- Use two fingers to zoom and pan without marking any stitches.
- Tap or drag with one finger to mark stitches as usual.
- **Hide interface** expands the pattern; **Show controls** restores the complete editor.
- The plus, minus and Fit buttons remain available in the standard view.

**OXS on phones (v0.9.8.8.13):** scroll below the canvas to find Progress and Thread legend. Two large shortcuts take you directly to each section. Color and stitch filters update the pattern immediately. Focus mode hides the lower panels until you return to the normal view.

### Saving and recovery (v0.9.8.8.15)

Wait for the save confirmation after editing. If a warning appears, export a JSON backup before closing. If an older snapshot is recovered, verify it and immediately export a new JSON file. Preserve the source OXS alongside its progress JSON; for PDF use “Save project” to include the source document. Browser storage is not permanent and may be cleared or unavailable on file://. Avoid editing the same project simultaneously in multiple tabs.

### Mobile PDF editor — v0.9.8.8.16 (incorporated into later versions)

On phones, the PDF workspace opens automatically in wide view. The quick tools (**Progress**, **Stitches**, **Empty**, **Undefined**) stay visible. Open **Threads** to pick DMC or custom floss and return to the chart. **Actions** contains Help, project import, progress JSON import/export, OXS export and Close; **Save project** remains directly accessible. Tap once to edit; use two fingers to zoom and pan without touching cells. Keep exporting JSON backups.

### OXS editor keyboard controls (v0.9.8.8.18)

Press Tab to focus the grid. Use arrow keys to select a cell, Shift+arrows to move 10 cells, Home/End to reach the beginning/end of the row. Press Enter or Space to mark, or select a stitch when stitches overlap. Press Esc to close the stitch selector.

### Localization review — v0.9.8.8.19

Use the IT/EN control on the home page, PDF editor, Privacy and Licenses pages. Check tooltips, validation errors, PDF/OXS recovery messages and assistive labels as well as visible buttons. Uploaded pattern titles, filenames and user-provided floss names remain unchanged by design. The 0.9.8.8.19 localization review was incorporated into the published release; v0.9.8.8.20 adds quality infrastructure.

### v0.9.8.8.20.2 — published improvement

The OXS overlapping-stitch chooser now displays all independent stitches per cell (including both triangular halves), each with a color/position preview and a live completed/total count. No change to exported project data, PDF.js binaries, vendor resources or persistent storage. The feature was tested and approved for the v0.9.8.8.20.2 GitHub Pages release.
