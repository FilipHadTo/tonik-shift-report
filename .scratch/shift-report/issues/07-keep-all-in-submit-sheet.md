# 07: "Keep all" for AI drafts in the Submit sheet

**What to build:** Story 53. The Submit sheet's "Every AI draft kept or discarded" row gets a "Keep all" button next to "Show". It keeps every remaining Section Draft and Enhance Draft in one step, as an explicit decision at Submission. It never touches Incidents: they still need their own Confirm (story 44). Not offered anywhere else (not in the document, not in the outline).

Add a bulk Keep action to the report domain module, with a test. The sheet is in `app/prototype/report-editor/top-bar.tsx`.

**Blocked by:** 03

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [ ] Test: bulk Keep keeps every Section and Enhance Draft, leaves Incidents unconfirmed, and readiness then lists only the Incidents and the statement
- [ ] The button shows only while unchecked AI drafts remain; after it, the row reads as done
- [ ] Looks and works like prototype E, per `docs/design-system.md` (Btn variant and size as the row's "Show")
