# 06: Dismiss on a partly used Capture covers only the missing part

**What to build:** Story 20. Today E dismisses the whole Capture even when part of it is already in the report. Fix: on a partly used Capture, Dismiss covers only the part that isn't in the report. The Capture becomes In report, the part already in the report stays cited, and the record does not list it as dismissed. Restoring works as today. On a Capture with nothing in the report, Dismiss is unchanged.

The rule lives in the report domain module, with a test. The tile is in `app/prototype/report-editor/inbox.tsx`.

**Blocked by:** 03

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [x] Test: dismissing a partly used Capture gives In report, keeps its citations, and does not mark it dismissed in the record
- [x] Test: dismissing an unused Capture still gives Dismissed, and restore brings it back to New
- [x] In E (02:15 scene, delete the window Incident so its Capture is partly used, then Dismiss): looks and works like prototype E, per `docs/design-system.md`

## Comments

Built: the rule lives in `lib/report/reducer.ts` (`dismiss`), tests in `lib/report/dismiss.test.ts`. On a Capture with something already applied, Dismiss narrows `found` to the applied Sections, so nothing is left to draft: it leaves New, keeps its citations and `dismissed` stays unset (so it is not in the Dismissed list and still counts in "N Captures from M people"). On an unused Capture Dismiss and Restore are unchanged. No UI change was needed in `inbox.tsx`: the tile moves to Processed with its existing look.

Decision: after a partial Dismiss the Capture's state is still derived as usual, so if the part already in the report is an unchecked Draft it shows as Drafted ("Maintenance · to review") until that Draft is kept, then In report. Verified in E at 02:15: delete the window Incident, Dismiss the window Capture, Keep the Maintenance draft.
