# 09: Save every manager action

**What to build:** Every change the Closing Manager makes on the Report screen is saved: Keep / Discard, Confirm and Reopen, filling a Gap or marking Unknown, editing an Incident or a block, writing into a Section, adding or deleting an Incident, showing or hiding a Section, Dismiss and restore, marking a Capture as written by hand, the Invite staff flag, Captures typed in the Inbox composer (Captured-at set by the server). The server applies the same report domain action to the stored report and saves it, so the rules can't be bypassed from the browser. The screen updates at once and settles on the server's result. A reload shows exactly what was there.

**Blocked by:** 08

**Status:** ready-for-agent

**Agent:** Opus 5.5, medium effort (cross-cutting or rule-heavy)

- [x] Do each action above in the 02:15 scene, reload: everything is still there
- [x] An invalid action (e.g. Confirm on an Incident with a Gap) is refused by the server and the screen shows the saved state
- [x] No visible delay or flicker on actions; looks and works like prototype E, per `docs/design-system.md`

## Comments

Built: `POST /prototype/report-editor/report` takes `{ d, action }`, loads this demo id's stored report, applies the action with the report domain's rules and saves it (`saveReport` in `lib/db`, one Neon batch). It answers with the saved report; 409 plus the saved report when the rules refuse it, 400 for anything it doesn't recognise. E applies each action at once and settles on the server's answer.

Key decisions:
- `lib/report/save.ts` (tested first): `parseSaveAction` checks the browser's payload field by field; `applySaved` refuses what the rules don't allow (Confirm with a Gap or a pending Enhance Draft, edits / Delete on a confirmed Incident until Reopen, Keep / Discard on anything but a Draft, unknown ids, Submit with blockers), then runs the same reducer.
- AI results are never taken from the browser: Draft and Enhance are sent as requests and the server runs Extract / Enhance itself (fake model for now; tickets 14 and 15 swap in Gemini). The deterministic fake makes the server's result match what the screen showed.
- Captured-at of a typed Capture comes from the stored report's clock on the server. Captures are only inserted or have dismissed / written-by-hand flags updated; the report row, Incidents and blocks are rewritten.
- E saves actions one at a time in order and only settles when nothing is in flight (requests, the drafting delay), so the screen never jumps back and forth. Reset / scene switch drops unsent actions and reseeds after what is in flight. Offline or no database: the screen keeps what it shows.
- Phone Captures from the Live Inbox poll are saved too (only new ones), so Drafts made from them survive a reload; ticket 10 moves them to the database for real.
- Bug fixed on the way: ids for added Incidents, written blocks and typed Captures could repeat after a Delete / Discard (would break the primary key); they now use `freeId`.
