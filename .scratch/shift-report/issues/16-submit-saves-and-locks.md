# 16: Submit saves and locks the report

**What to build:** Stories 53–56. Submit in the Submit sheet goes to the server. The server checks Submission readiness (03) and the reviewer statement, then saves the statement, who submitted and when, and marks the report AI-assisted. After that the server refuses every change to Captures, Drafts and Incidents; E's locked state shows on reload. The Addendum stays an entry point only (out of scope).

**Blocked by:** 09

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [ ] Submit with blockers left is refused by the server, even if the button is forced
- [ ] After Submit and a reload, the report is locked and says "Submitted HH:MM by …"
- [ ] Any change after Submit is refused by the server
- [ ] Reset brings the scene back to open
- [ ] Looks and works like prototype E, per `docs/design-system.md`
