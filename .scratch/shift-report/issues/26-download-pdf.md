# 26: "Download PDF" makes a real PDF of the document

**What to build:** Filip, 2026-10-31: the document Preview's "Download PDF" (a stub or `window.print()` after ticket 17) should really produce a PDF file: capture the rendered document (as on screen, dark) and download it as `<venue>-shift-report-<night>.pdf`. Client-side, no server rendering: render the document node to an image (e.g. `modern-screenshot` or `html-to-image`, pinned versions) and place it into an A4 PDF with `jsPDF`, splitting long documents across pages without cutting a line of text in half where practical (slice on block boundaries if cheap, otherwise plain page slicing). Real photos (same-origin `captures/photo`) and fonts must appear in the capture. The button shows a short busy state while it works and a calm note if it fails. MVP: an image-based PDF is fine (text needn't be selectable); load the libraries only when the button is pressed.

**Blocked by:** 17

**Status:** ready-for-agent

**Agent:** Sonnet, high effort (contained, UI + one dependency)

- [x] Pressing Download PDF downloads a PDF that looks like the document on screen, photos and fonts included
- [x] A long report (the 02:15 demo, submitted) spans several A4 pages and stays readable
- [x] Busy state while generating; a failure shows a calm note, never an error
- [x] Libraries are loaded on demand, not in the page bundle

## Comments

2026-10-30, agent (built): "Download PDF" makes a real file, `halo-club-shift-report-sat-24-oct.pdf` (`<venue>-shift-report-<night>.pdf`).

- **How.** `report-editor/pdf.ts`: `modern-screenshot` 4.7.0 renders the document (`article`) to a canvas at 2x, `jspdf` 4.2.1 lays it onto A4 pages, JPEG 0.9. Both pinned, both `import()`ed on the first press only. The page is the panel: panel colour full-bleed, the panel's padding as margins (56px sides, 64px top/bottom), so every page looks like the screen. Image-based, text not selectable (MVP).
- **Page cuts.** `lib/page-breaks.ts` (tested): a cut goes as low as it can without running through a block (paragraphs, list items, table rows, figures, and everything marked `break-inside-avoid`); `break-after-avoid` headings stay with the next block; a block taller than a page gets a plain cut. It reuses the print classes, so the PDF and Cmd+P break in the same places.
- **States.** While it works the button reads "Making PDF…" (same width, `aria-busy`, a second press is ignored). On failure a note left of the buttons for 5s, `text-xs text-ink-2`, `role="status"`, like E's other in-place notes: "Unable to make the PDF. Try again, or print with ⌘P."
- Capture rows' quotes are now typed (“…”) instead of `<q>`: the capture printed the CSS quotes as the words "open-quote".
- Cmd+P and the print stylesheet are unchanged.

Checked in Chrome (own isolated context and tab, 1440px): 02:15 scene, location set, draft kept, Incident confirmed, statement ticked, Submit and lock, Preview, Download PDF. The file: 3 A4 pages (595x842pt), ~490KB, Geist rendered, seeded photo placeholder, no cut lines; generated in ~0.5s. Libraries not requested before the press. Failure forced (canvas unavailable): the note shows, button back to "Download PDF". Test report deleted from Neon. Not exercised: a real phone photo in the capture (a same-origin `<img>`, which modern-screenshot inlines).
