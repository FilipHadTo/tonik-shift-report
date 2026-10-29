# 08: Database: one demo report per reviewer, two scenes, Reset

**What to build:** The report lives in Neon (Drizzle ORM, ADR 0001), keyed by the demo id the desktop browser already keeps (`demoSession()` in E). Opening the Report screen loads that reviewer's report from the server. Switching scene (20:00 / 02:15, in the URL) or Reset reseeds that scene into the database for this demo id only; another demo id is never touched (story 60). A demo id seen for the first time gets the scene from the URL.

Storage follows the evidence model (ADR 0003, spec "Evidence model"): Captures are stored separately and their content is never updated (only the dismissed and written-by-hand flags change); every Incident field and Section block stores its value, provenance (ai-drafted / confirmed / kept / manager-entered) and source Captures; Incidents store Occurred-at, Captured-at and confirmed-at. Tables vs a JSON column for the report body is your call, as long as that information is stored. Migrations are in the repo.

In this ticket the manager's actions may still live only in the browser; ticket 09 saves them.

**Blocked by:** 01, 03

**Status:** ready-for-agent

**Agent:** Opus 5.5, medium effort (cross-cutting or rule-heavy)

- [ ] Fresh browser: the 02:15 scene loads from the database; `?scene=start` loads 20:00
- [ ] Two browsers (two demo ids) have separate reports; Reset in one leaves the other alone
- [ ] The database is reached only from server code; `DATABASE_URL` comes from the environment
- [ ] Looks and works like prototype E, per `docs/design-system.md`
