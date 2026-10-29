# 13: Move Delete away from Confirm on an Incident

**What to build:** Story 45, decided by Filip: Delete must not sit next to Confirm. Today it is an icon on the Incident's label line, right beside the primary Confirm (`app/prototype/report-editor/incident.tsx`, label line). Move it to the end of the Incident's title row as a quiet `IconBtn` (Trash icon, label "Delete Incident"), shown on hover and when focus is inside the Incident, always reachable by keyboard. The label line then holds only Confirm or the next step. Behaviour is unchanged: deleting returns the Capture to New (story 40). Confirmed Incidents have no Delete.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [ ] Delete is no longer on the label line; Confirm stands alone there
- [ ] Delete appears on hover and on keyboard focus, has a Tip, and works as before
- [ ] Looks and works like prototype E, per `docs/design-system.md`; dark first, then light
