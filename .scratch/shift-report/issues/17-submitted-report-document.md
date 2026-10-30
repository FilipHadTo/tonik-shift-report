# 17: The submitted report as a clean document

**What to build:** Stories 57–58. After Submit, prototype E only shows the locked editor. The submitted report should read like a clean document, not an app screen, so it can be read, printed or forwarded as is: header, the Sections with content, Incidents (with Logged time, "Reported by" and "Confirmed by"), a "Not covered tonight" line (naming Incidents too when there are none, never a "No Incidents" claim), attachments at the end as larger photos labelled by Incident, the Captures verbatim, then the statement and footer ("AI-assisted, reviewed and submitted by …"). A Share action for the next team is a stub. Content order is in `.scratch/shift-report/report-structure.md`.

New screen, so Filip designs it first (in E, with `better-*` skills, from `docs/design-system.md`); then it can be built.

**Blocked by:** 16, the reports list shaping (PROCESS.md 2b.1)

**Status:** ready-for-agent

**Agent:** Opus, high effort; Filip delegated the design (2026-10-31), brainstorm autonomously

- [x] Filip has picked the layout (delegated to an agent, 2026-10-31)
- [x] Opening a submitted report shows the document; it prints cleanly
- [x] Share is a stub ("Download PDF" instead, per Filip's comment)
- [x] Looks like it belongs to prototype E, per `docs/design-system.md`; dark first, then light (light out of scope; print is light ink on white)

## Comments

2026-10-31, Filip: same route (option A). After Submit the manager stays on the Report screen, sees it's sent and goes home; the clean document opens as a Preview of a closed report from the reports list (shaping in PROCESS.md 2b.1). Light mode is out of scope.

2026-10-31, Filip (delegated to an agent, no hand design): a sent report has two ways in from the Reports list: (1) open the editor, locked (as today after Submit, Inbox read-only per ticket 21), and (2) open the final report as a clean document (Preview). The document has a placeholder "Download PDF" action (stub; may call `window.print()` with a print stylesheet, or just be a stub) instead of Share. On the Report screen, after Submit, the manager sees a clear "Sent" state and a way into the document. MVP, fits prototype E, no extras.

2026-10-31, agent (built; design brainstormed autonomously, simplest option that fits E):

- **Route.** Preview is `/prototype/report-editor/r/[id]?view=document`: the same route in document mode (story 68, ADR 0009), not a sub-route. `r/[id]/page.tsx` resolves `params` and `searchParams` inside the existing Suspense and renders `ReportEditor` or `ReportPreview` (`preview.tsx`). An open report's Preview URL goes to its editor; another demo id's report goes to Reports (404, as the editor does).
- **Sent state (stories 56, 67).** The Report screen's top-bar pill reads "Sent 02:16" (Glossary: UI copy says Sent); Invite staff and Submit leave the top bar. At the top of the document a quiet note in E's `raise` card: tick in `ok`, "Sent at 02:16. You're done for tonight." / "Submitted by Alex Morgan and locked. Changes are only possible as a dated Addendum.", with "Back to Reports" (ghost) and "Preview" (secondary). It sits where the eye lands when the sheet closes, mounts with `enter`. One place for both ways out instead of a second copy in the top bar.
- **Reports list.** A sent row now opens its Preview (`rowHref`, story 68); an open row still opens the editor. The second way in for a sent row is a labelled icon button ("Open in editor", `Columns3`, the three-column screen) before the chevron, nothing else changed. To keep it a sibling of the row link (no link inside a link), the row became a stretched link: the `li` owns the subgrid, hover fill and focus ring (`has-[>a:focus-visible]`), the link covers the row through `::after`, the icon button sits above it.
- **Document.** Same panel and 720px measure as the editor, existing type roles only: overline "Shift Report · Halo Club", h1 "Night of …", then a small label/value list (Closing Manager; Shift: started, submitted, locked; Captures per person; Covered: Incidents and n of 13 Sections). Sections with content in the report's order (General overview, Incidents, then the brief's); Incidents as numbered entries: title, one metadata line ("23:40 (logged 23:40) · Side entrance · Property damage · Reported by Marek (Door)"; unset values say "Time unknown" / "Location unknown"), What happened, then "Evidence: photo, see Attachments." and "Confirmed by Alex Morgan, 02:15" with the `ok` tick. No chips, cards or washes: provenance is stored, not printed (report-structure.md, decisions). Then "Not covered tonight" as one line, Attachments as a two-column grid of 4:3 photos captioned "Incident 1: Broken window / Photo, 23:40, Alex Morgan" (phone photos through the stored image, seeded ones keep the placeholder), Captures as a table (time, by, kind, content; text in quotes; pasted chats in full; a photo that isn't an attachment shows its thumbnail; dismissed ones marked), then the ticked statement and the footer "AI-assisted. Reviewed and submitted by … at …. Locked: changes only as a dated, attributed Addendum." Addenda left out: none exist yet.
- **Download PDF.** Top bar of the Preview, the one primary there, beside "Open in editor". It calls `window.print()`; the browser's "Save as PDF" makes the file. Print: `@media print` in `globals.css` gives `.dark` the light token values (ink on white), `print:` utilities drop the top bar and the panel chrome, `@page` margins 16/18mm, `break-inside-avoid` on Incidents, photos, capture rows and the statement, `break-after-avoid` on headings. Screen stays dark only.
- **Rules, test-first** in `lib/report/preview.ts` (`preview.test.ts`): `notCoveredTonight` (every Section without content, Incidents named when there are none, never a "No Incidents" claim; the Submit sheet's "Not covered tonight" uses it too now), `incidentTime`, `attachmentsOf` (photo Evidence once each, labelled by Incident number, in Incident order) and `tally` for the header counts.
- `CapturePhoto` got a context-free twin, `StoredPhoto`, so the Preview can show phone photos without the editor's context.
- Motion: only existing classes (`appear` on the document, `enter` on the Sent note); both have reduced-motion fallbacks.

Checked in Chrome at 1440px (own isolated context, own tab): 02:15 scene, location set and Incident confirmed, Keep all and the statement in the Submit sheet, Submit and lock; the Sent note and its Preview link; the list row opens the Preview and the icon button the locked editor (hit-tested); the document; print rules forced on screen (light ink on white, no top bar). Reset afterwards, test report deleted from Neon. No Gemini calls. Not exercised in the browser: "Reported by" (the 02:15 scene has no drafted staff Incident; it would need a Draft) and a real phone photo in Attachments.

