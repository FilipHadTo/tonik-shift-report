# 06: Dismiss on a partly used Capture covers only the missing part

**What to build:** Story 20. Today E dismisses the whole Capture even when part of it is already in the report. Fix: on a partly used Capture, Dismiss covers only the part that isn't in the report. The Capture becomes In report, the part already in the report stays cited, and the record does not list it as dismissed. Restoring works as today. On a Capture with nothing in the report, Dismiss is unchanged.

The rule lives in the report domain module, with a test. The tile is in `app/prototype/report-editor/inbox.tsx`.

**Blocked by:** 03

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [ ] Test: dismissing a partly used Capture gives In report, keeps its citations, and does not mark it dismissed in the record
- [ ] Test: dismissing an unused Capture still gives Dismissed, and restore brings it back to New
- [ ] In E (02:15 scene, delete the window Incident so its Capture is partly used, then Dismiss): looks and works like prototype E, per `docs/design-system.md`
