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

- [ ] 1–10 fixed, each with a test where it's a rule in lib/report or lib/db mapping
- [ ] Demo on 20:00 survives Preview, list and breadcrumb navigation; a daytime clean report orders Captures correctly across 18:00
