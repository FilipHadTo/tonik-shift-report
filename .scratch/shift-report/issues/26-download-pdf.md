# 26: "Download PDF" makes a real PDF of the document

**What to build:** Filip, 2026-10-31: the document Preview's "Download PDF" (a stub or `window.print()` after ticket 17) should really produce a PDF file: capture the rendered document (as on screen, dark) and download it as `<venue>-shift-report-<night>.pdf`. Client-side, no server rendering: render the document node to an image (e.g. `modern-screenshot` or `html-to-image`, pinned versions) and place it into an A4 PDF with `jsPDF`, splitting long documents across pages without cutting a line of text in half where practical (slice on block boundaries if cheap, otherwise plain page slicing). Real photos (same-origin `captures/photo`) and fonts must appear in the capture. The button shows a short busy state while it works and a calm note if it fails. MVP: an image-based PDF is fine (text needn't be selectable); load the libraries only when the button is pressed.

**Blocked by:** 17

**Status:** ready-for-agent

**Agent:** Sonnet, high effort (contained, UI + one dependency)

- [ ] Pressing Download PDF downloads a PDF that looks like the document on screen, photos and fonts included
- [ ] A long report (the 02:15 demo, submitted) spans several A4 pages and stays readable
- [ ] Busy state while generating; a failure shows a calm note, never an error
- [ ] Libraries are loaded on demand, not in the page bundle
