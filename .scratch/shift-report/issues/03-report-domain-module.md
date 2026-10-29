# 03: Pull the report rules out of prototype E into the report domain module

**What to build:** Prototype E keeps the whole report in a reducer with its derived state (Capture status, blockers, Section state, Incident order) inside `app/prototype/report-editor/data.ts`. Move the types, the reducer and the derived state into one pure report domain module (no React, Next, DB or network imports), and make E use it. The seed for the two scenes can sit next to it. The module must run in the browser and on the server: ticket 09 replays the same actions on the server.

Add two public functions, test-first with `/tdd` (set up a test runner, e.g. Vitest, with a `test` script):
- **Submission readiness:** given a report, returns ready or the blockers: unconfirmed Incidents (including any with a Gap or a pending Enhance Draft), unchecked Section and Enhance Drafts, missing reviewer statement. E's "Before you submit" and Submit sheet use it.
- **Night assignment:** given a timestamp, returns the Night it belongs to (Captures before 08:00 belong to the previous date).

See spec, "Report domain module" and "Testing Decisions". This is a prefactor: nothing visible changes.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Opus 5.5, medium effort (cross-cutting or rule-heavy)

- [ ] The module imports nothing from React, Next, the DB or the network; E imports its rules from it
- [ ] E looks and works exactly as before in both scenes (compare Chrome screenshots before and after, dark first)
- [ ] Tests: readiness lists the exact blockers, and a pending Section Draft or Enhance Draft blocks; ready when nothing blocks
- [ ] Tests: a Capture at 02:00 belongs to the previous Night; 08:00 starts a new one
- [ ] `pnpm test` passes, deterministic, no network
