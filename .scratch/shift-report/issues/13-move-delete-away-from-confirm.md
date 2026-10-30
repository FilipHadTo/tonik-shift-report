# 13: Move Delete away from Confirm on an Incident

**What to build:** Story 45, decided by Filip: Delete must not sit next to Confirm. Today it is an icon on the Incident's label line, right beside the primary Confirm (`app/prototype/report-editor/incident.tsx`, label line). Move it to the end of the Incident's title row as a quiet `IconBtn` (Trash icon, label "Delete Incident"), shown on hover and when focus is inside the Incident, always reachable by keyboard. The label line then holds only Confirm or the next step. Behaviour is unchanged: deleting returns the Capture to New (story 40). Confirmed Incidents have no Delete.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [x] Delete is no longer on the label line; Confirm stands alone there
- [x] Delete appears on hover and on keyboard focus, has a Tip, and works as before
- [x] Looks and works like prototype E, per `docs/design-system.md`; dark first, then light

## Comments

Built: Delete left the label line, which now holds only Confirm or the next step. It is an `IconBtn` (Trash2, "Delete Incident", Tip) at the end of the title row, rendered only while the Incident is editable, so confirmed Incidents and a submitted report have none. It reuses Reopen's reveal: `opacity-0`, shown on `group-hover/incident` and `group-focus-within/incident` with a 150ms opacity fade. It stays in the tab order, so tabbing into the Incident or onto the button shows it. `-my-0.5` keeps the 28px button inside the 24px title line, and `-mr-1` lines the glyph up with the label-line action above it. Behaviour is unchanged: the same `deleteIncident` action, so the Capture goes back to New.

Checked in Chrome on the 02:15 scene, dark then light: hidden at rest, shown on hover with its Tip and on keyboard focus, and Enter deletes (Inbox went from 3 to 4 new). The scene was reset afterwards.
