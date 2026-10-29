# 07: "Keep all" for AI drafts in the Submit sheet

**What to build:** Story 53. The Submit sheet's "Every AI draft kept or discarded" row gets a "Keep all" button next to "Show". It keeps every remaining Section Draft and Enhance Draft in one step, as an explicit decision at Submission. It never touches Incidents: they still need their own Confirm (story 44). Not offered anywhere else (not in the document, not in the outline).

Add a bulk Keep action to the report domain module, with a test. The sheet is in `app/prototype/report-editor/top-bar.tsx`.

**Blocked by:** 03

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [x] Test: bulk Keep keeps every Section and Enhance Draft, leaves Incidents unconfirmed, and readiness then lists only the Incidents and the statement
- [x] The button shows only while unchecked AI drafts remain; after it, the row reads as done
- [x] Looks and works like prototype E, per `docs/design-system.md` (Btn variant and size as the row's "Show")

## Comments

Built: `keepAll` reducer action in `lib/report` (types + reducer), tested in `lib/report/keep-all.test.ts`. It does exactly what a one-by-one Keep does on every open Draft: Section Drafts and block Enhance results become kept, an Incident's Enhance Draft becomes its description. Incidents are never confirmed, so readiness afterwards lists only the unconfirmed Incidents and the statement. The only UI entry point is the Submit sheet in `top-bar.tsx`.

UI: "Keep all" is `Btn size="sm" variant="secondary"` like "Show", placed left of "Show" so the Show buttons stay lined up on the right across rows. Both buttons disappear once no drafts remain, and the row turns into a done tick. Focus moves back to the sheet so it isn't lost when the button unmounts. The longer row wrapped badly ("1 / left" split), so the checklist row's meta now flows inline with the label and never breaks, and the row is `min-h-9` instead of `h-9`. Other rows look unchanged.

