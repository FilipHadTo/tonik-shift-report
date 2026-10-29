# 08: Database: one demo report per reviewer, two scenes, Reset

**What to build:** The report lives in Neon (Drizzle ORM, ADR 0001), keyed by the demo id the desktop browser already keeps (`demoSession()` in E). Opening the Report screen loads that reviewer's report from the server. Switching scene (20:00 / 02:15, in the URL) or Reset reseeds that scene into the database for this demo id only; another demo id is never touched (story 60). A demo id seen for the first time gets the scene from the URL.

Storage follows the evidence model (ADR 0003, spec "Evidence model"): Captures are stored separately and their content is never updated (only the dismissed and written-by-hand flags change); every Incident field and Section block stores its value, provenance (ai-drafted / confirmed / kept / manager-entered) and source Captures; Incidents store Occurred-at, Captured-at and confirmed-at. Tables vs a JSON column for the report body is your call, as long as that information is stored. Migrations are in the repo.

In this ticket the manager's actions may still live only in the browser; ticket 09 saves them.

**Blocked by:** 01, 03

**Status:** ready-for-agent

**Agent:** Opus 5.5, medium effort (cross-cutting or rule-heavy)

- [x] Fresh browser: the 02:15 scene loads from the database; `?scene=start` loads 20:00
- [x] Two browsers (two demo ids) have separate reports; Reset in one leaves the other alone
- [x] The database is reached only from server code; `DATABASE_URL` comes from the environment
- [x] Looks and works like prototype E, per `docs/design-system.md`

## Comments

Built: Drizzle + Neon (`@neondatabase/serverless`, HTTP driver). Schema in `lib/db/schema.ts`, migration `drizzle/0000_init.sql` (applied; `pnpm db:generate` / `pnpm db:migrate`, `drizzle.config.ts` reads `DATABASE_URL` from the environment or `.env.local`). Route `app/prototype/report-editor/report/route.ts`: GET opens this demo id's report, PUT reseeds a scene for this demo id only. E loads the report on open and reseeds on scene switch / Reset.

Key decisions:
- Tables, not a JSON body: `reports` (one row per demo id), `captures` (verbatim; only `dismissed` / `handled` are meant to change), `incidents`, `blocks`. Each Incident field is a record `{ state, value, provenance, sources }`; Incidents also store `provenance` for title / "What happened", Captured-at, confirmed-at. Blocks store provenance (ai-drafted / kept / manager-entered), sources and the Enhance original. "confirmed" is written for AI-drafted values of a confirmed Incident.
- Where a Capture was drafted into (`applied` / `found`) is report state, not Capture content, so it lives on `reports.capture_use`. The transient `drafting` flag is never stored.
- Report ⇄ rows mapping is pure (`lib/db/records.ts`) with a light round-trip test; DB access is `server-only` (`lib/db/index.ts`), reached only from the route handler. `lib/report` is untouched.
- Reseed is one transaction (Neon batch): delete the demo id's report (cascades) and insert the scene. A demo id seen for the first time, or whose stored scene differs from the URL, gets the URL's scene.
- The screen shows only the canvas until the report arrives (no stale scene flash); if the database is unreachable it falls back to the local seed so the demo still opens. Scene switch / Reset reset the screen at once (the seed is deterministic) and reseed the database in the background.
- Phone Captures still go through the in-memory captures route (ticket 10); manager actions still live in the browser (ticket 09).
