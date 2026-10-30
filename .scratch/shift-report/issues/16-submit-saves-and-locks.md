# 16: Submit saves and locks the report

**What to build:** Stories 53–56. Submit in the Submit sheet goes to the server. The server checks Submission readiness (03) and the reviewer statement, then saves the statement, who submitted and when, and marks the report AI-assisted. After that the server refuses every change to Captures, Drafts and Incidents; E's locked state shows on reload. The Addendum stays an entry point only (out of scope).

**Blocked by:** 09

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [x] Submit with blockers left is refused by the server, even if the button is forced
- [x] After Submit and a reload, the report is locked and says "Submitted HH:MM by …"
- [x] Any change after Submit is refused by the server
- [x] Reset brings the scene back to open
- [x] Looks and works like prototype E, per `docs/design-system.md`

## Comments

Built: Submit sends `{ type: "submit", statement }` (whether the reviewer statement is ticked). The server checks Submission readiness with that statement and refuses (409 + saved report) with any blocker left, so a forced button changes nothing. On success it saves `submittedAt`, `submittedBy` (the Closing Manager), the statement as worded (`REVIEW_STATEMENT`) and `aiAssisted: true` (migration `0003`: `submitted_by`, `statement`, `ai_assisted` on `reports`).

Key decisions:
- Lock lives in the domain module: `applySaved` refuses every action on a submitted report (Captures, Drafts, Incidents, Draft / Enhance requests, Section toggles, a second Submit); the reducer also ignores everything but Reset, so the screen can't drift from the record. Phone Captures were already refused. Tested first in `lib/report/submit.test.ts`.
- Reset reseeds the scene, which comes back open.
- UI unchanged apart from the statement text coming from the domain and "Submitted HH:MM by" using `submittedBy`. The Inbox still shows its Draft / Dismiss buttons and the composer after Submit, as in E before this ticket; they do nothing (server refuses). Hiding them is left to ticket 17 / Filip.
