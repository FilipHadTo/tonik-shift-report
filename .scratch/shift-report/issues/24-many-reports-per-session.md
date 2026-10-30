# 24: Many reports per demo session (backend + bare Reports scaffold)

**What to build:** Stories 59 and 63–71, ADR 0009. Today one browser demo id has exactly one report. Make reports first-class:
- A report has its own id. The demo id keys the reviewer's Reports list. The first report is the demo report (pinned, seeded scenes, demo clock, demo controller, Reset); it is created on first visit as today.
- "New report" creates a clean, empty report for Halo Club on the real clock: Captured-at from the server clock, its Night from `nightOf`. No limits on how many, open or sent.
- The capture link and QR carry the report, not the demo id; a phone writes into that report only. Captures, photos, Draft/Enhance routes, rate limit and Submit work per report.
- Reset and the scene switch touch only the demo report.
- Routes: the public link `/prototype/report-editor` shows the Reports list; each report opens on its own URL under `app/prototype/report-editor/` (pick a clean shape, e.g. `/prototype/report-editor/r/[id]`). Keep old links (`?scene=`) working by sending them to the demo report.
- The Reports list here is a **bare functional scaffold** built from existing components: one row per report with the Night, Open/Sent, Incident count, sent time and by whom; the demo report pinned first; a "New report" button; open a report. No styling decisions beyond E's defaults: Filip designs the list, the "Sent" state and the document Preview later (ticket 17 and his 2b.1 design pass).

Migrate existing demo rows so current demo ids keep their report.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Opus, high effort (DB, routes, domain clock)

- [ ] The public link shows the Reports list with the demo report pinned; opening it works like today, scenes and Reset included
- [ ] "New report" makes a clean report on the real clock; a phone Capture sent through its QR lands only in it, with today's real time
- [ ] Two reports in one session never share Captures, photos or state; another demo id sees none of them
- [ ] Reset touches only the demo report; old `?scene=` links still land on the demo report
