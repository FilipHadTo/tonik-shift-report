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

- [x] The public link shows the Reports list with the demo report pinned; opening it works like today, scenes and Reset included
- [x] "New report" makes a clean report on the real clock; a phone Capture sent through its QR lands only in it, with today's real time
- [x] Two reports in one session never share Captures, photos or state; another demo id sees none of them
- [x] Reset touches only the demo report; old `?scene=` links still land on the demo report

## Comments

Built. Routes: `/prototype/report-editor` is Reports (bare scaffold from E's pieces: header, `Btn`, a panel with one row per report: Night, Open / Sent, Incidents, sent time and by whom, a "Demo" overline on the pinned row). Each report opens on `/prototype/report-editor/r/[id]` (params resolved inside a Suspense whose fallback is the skeleton). The demo report's id is the browser's demo id; clean reports are `r-` + 10 random chars, so ids never collide with demo ids. Old `?scene=` links on the list redirect to the demo report with the same query; old phone links (`capture?d=…`) still land in the demo report, since `d` is its id. APIs: `reports` (GET list, POST "New report"); `report`, `report/draft`, `report/enhance` take `{ d, r }` and 404 a report outside that demo id's list; `captures` and `captures/photo` take `r` only (the phone has no demo id). PUT (scene / Reset) takes only `d` and reseeds the demo report, never a clean one. The rate limit stays per IP (per report would be bypassed by "New report").

Domain (`lib/report/clock.ts`, test-first): `Report.kind` (`demo` | `clean`); `cleanReport(now)` (empty, Night from `nightOf` as "Fri 30 Oct", started now); `onClock(r, now)` sets a clean report's clock to the real time before anything is stamped (typed or phone Capture, Submit, manual Incident) and leaves the demo report on the demo clock; `reportRow` for the list. The server applies `onClock` in every write route; the screen applies it too, so the optimistic state matches. Venue time zone is `VENUE_TIME_ZONE = "Europe/London"` (open for Filip: Warsaw would match the reviewers' clocks).

Migration `drizzle/0005_many_reports.sql` (applied to Neon): `reports` gets `id` (PK, backfilled from `demo_id`), `kind` (existing rows `demo`), `created_at`; child tables rename `demo_id` to `report_id`. Existing rows keep their report (12 reports, all Captures / Incidents / blocks unchanged). One demo report per demo id is a partial unique index.

Other: the venue crumb in the top bar links back to Reports (story 67). The capture page shows the report's Night from the server instead of the fixed "Sat 24 Oct". The Demo controller renders only on the demo report.

Checked in Chrome (own isolated contexts, test rows removed): list shows the pinned demo report; it opens with scenes and Reset as before; New report opens an empty Fri 30 Oct report on the real clock with no Demo controller; a 390px phone on its QR link sent a Capture that landed in it at the real time and not in the demo report; Reset on the demo report left the clean report's Capture alone; `?scene=start` lands on the demo report; another demo id gets 404 on the clean report; a sent clean report shows Sent, time and Alex Morgan in the list and refuses phone Captures.

