# 28: Fixes from the 2d code review

**What to build:** `/code-review` (high) over e0dced8..HEAD found these. Small, targeted fixes; no redesigns. Priority order:
1. `lib/db/index.ts:89` openReport reseeds the demo report when the GET's scene differs from the stored scene; Preview, the list row, "Open in editor" and the breadcrumb send no scene, so a demo report on 20:00 gets wiped (incl. a submitted one and its photos). GET must never reseed an existing report; only the PUT (scene switch / Reset) does. Old `?scene=` links on first visit still seed that scene.
2. `lib/report/clock.ts:57` a clean report's clock uses nightMinutes (from 18:00) but a Night starts at 08:00 (NIGHT_ENDS_AT); daytime reports wrap at 18:00, breaking ordering, Occurred-at validation and the stored clock. Count minutes from the Night's start (08:00) for clean reports; keep the demo's behaviour. Test-first.
3. `lib/db/index.ts:102` first-visit seed race: concurrent requests both seed the demo report and one 500s. Make seeding idempotent (insert … on conflict do nothing / conditional), same for openReport's seed path.
4. `capture/capture.tsx:270` a 409 on Send clears the staff member's text and photo silently. Keep the unsent content visible (read-only) with the closed note, or say it wasn't sent.
5. `lib/report/reducer.ts:41` typed Capture ids come from captures.length on each side and diverge when phone Captures are unpolled. Use one id for both sides (e.g. the client generates a unique id and sends it with the action; the server validates uniqueness). Test-first.
6. `lib/db/index.ts:225` phone Capture can slip into a just-submitted report: make the insert conditional on `submitted_at IS NULL` (single statement), and don't load the whole report for that check.
7. `inbox.tsx:453` typing during dictation: the closing recogniser's final result overwrites typed text. Ignore results from a stopped session once the user has typed.
8. `report-editor.tsx:230` offline mode still POSTs actions; while offline, keep actions local only (no POST, no adopting a server result).
9. Efficiency: listReports should check the demo report's existence with a cheap query, not loadReport; draft/route.ts photosInScope should load photos in one `inArray` query.
10. `captures/route.ts:9` import the device-id regex from lib/report/phone.ts instead of redefining it.

**Blocked by:** None

**Status:** ready-for-agent

**Agent:** Opus, high effort

- [x] 1–10 fixed, each with a test where it's a rule in lib/report or lib/db mapping
- [x] Demo on 20:00 survives Preview, list and breadcrumb navigation; a daytime clean report orders Captures correctly across 18:00

## Comments

All ten were real; each fixed.

1. `openReport` returns the saved demo report whatever its scene; the URL's scene only seeds it when there is none yet (old `?scene=` links on a first visit). Only the PUT reseeds.
2. The Night now counts from 08:00 (`NIGHT_ENDS_AT`): `nightMinutes` / `timeOf` in `lib/report/catalog.ts`, so ordering, Occurred-at validation and the stored clock no longer wrap at 18:00. Demo times are unchanged. Test-first in `clock.test.ts` (daytime clean report across 18:00). Migration `drizzle/0006_clock_from_night_start.sql` (applied to Neon) moves every stored clock to the new count, `(clock + 600) % 1440`: same time of day for every row.
3. First-visit seed is idempotent: `seedIfMissing` inserts the report and its rows with `on conflict do nothing`, used by `listReports` and `openReport`. Four concurrent first `reports` GETs and three concurrent first `report` GETs all answered 200, three runs.
4. A 409 on Send keeps what was being sent, read-only under a "Not sent" label above the closed note ("This report was sent before this went through. The link is closed."), photo thumbnail included.
5. The screen names a typed Capture (`m-` + random, `TYPED_CAPTURE_ID`) and sends the id with `addCapture`; the server validates the format and refuses a taken id. Test-first in `save.test.ts`, including a server that has an unpolled phone Capture.
6. `addPhoneCapture` reads only the report row, and the Capture insert is one `insert … select … from reports where submitted_at is null` (photo and clock writes are conditional too); no row inserted answers 409.
7. Typing in the composer cancels dictation (both the live and a closing session), so a late final result can't overwrite typed text.
8. Offline (report opened on the local seed): actions, Draft, Enhance and scene switch stay on the screen; nothing is POSTed or adopted.
9. `listReports` checks the demo report with a one-column select; Draft loads photos with one `inArray` query (`capturePhotosOf`).
10. `captures/route.ts` uses `DEVICE_ID` from `lib/report/phone.ts`.

Checked in Chrome (own isolated contexts; test rows removed from Neon): a `?scene=start` first visit seeds 20:00; a typed Capture (`m-…` id, same on the server) survives breadcrumb → Reports → row and the Preview link, still on 20:00. Phone at 390px: report submitted behind it, Send shows the unsent text with the closed note. tsc, eslint, `pnpm test` (219), `pnpm build` pass.

