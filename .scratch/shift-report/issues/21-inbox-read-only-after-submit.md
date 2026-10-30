# 21: Inbox read-only after Submit

**What to build:** Filip picked option C (open-questions, ticket 16): after Submit the Inbox stays visible so the manager can see what went into the report, but it is read-only. Draft into report, Draft all, Dismiss/Restore and the composer (text, attach, dictation) are gone, and a short quiet note in the Inbox says the report is locked. Copy in E's voice, e.g. "Report sent. The Inbox is locked." Server refusals stay as built in 16. Code: `app/prototype/report-editor/inbox.tsx`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet, high effort (UI)

- [ ] After Submit no Inbox control can change the report; Captures and their statuses stay readable
- [ ] A quiet locked note in the Inbox; Reset brings the controls back
- [ ] Looks and works like prototype E, per `docs/design-system.md`
