# The AI drafts only when the Closing Manager asks

Nothing runs in the background. Captures from the Closing Manager and Staff Members land in the Inbox as they are; the AI turns them into Drafts only when the Closing Manager asks: per Capture ("Draft into report"), per Section ("Draft from inbox"), all New Captures at once ("Draft all"), or "Enhance" on text they wrote themselves. This replaces the spec's "the report builds itself" and its extraction triggers (paste, attach, new Capture, typing pause). It is a deliberate product position: AI where it saves time, not everywhere. A report that rewrites itself while you read it is hard to trust on a legal record, and the manager stays the author of what goes in. Mobile capture plus staff contributions mean the material is ready at the end of the shift; turning it into the report is one explicit step.

## Consequences

- Extract takes a scope (which Captures, which Section) and only ever adds Drafts from New Captures, so it never touches content the manager confirmed, kept or wrote.
- The AI never reads photo contents. Location comes only from what a Capture says; Occurred-at is the time a Capture states, otherwise its Captured-at.
- The demo seed ships two states: 20:00, empty, and 02:15, partly drafted and reviewed.
