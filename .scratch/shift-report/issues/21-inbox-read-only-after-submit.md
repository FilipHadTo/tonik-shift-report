# 21: Inbox read-only after Submit

**What to build:** Filip picked option C (open-questions, ticket 16): after Submit the Inbox stays visible so the manager can see what went into the report, but it is read-only. Draft into report, Draft all, Dismiss/Restore and the composer (text, attach, dictation) are gone, and a short quiet note in the Inbox says the report is locked. Copy in E's voice, e.g. "Report sent. The Inbox is locked." Server refusals stay as built in 16. Code: `app/prototype/report-editor/inbox.tsx`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet, high effort (UI)

- [x] After Submit no Inbox control can change the report; Captures and their statuses stay readable
- [x] A quiet locked note in the Inbox; Reset brings the controls back
- [x] Looks and works like prototype E, per `docs/design-system.md`

## Comments

Built in `inbox.tsx`, read off `report.submittedAt` (Reset reseeds an open report, so the controls come back on their own). After Submit: no Draft all, no Draft into report / Dismiss / "I wrote it myself" on new Captures (they read "Not in the report" instead), no Restore on dismissed ones, and the composer is replaced by a quiet locked note in its slot: a lock icon and "Report sent. The Inbox is locked." The onboarding / "You're through the inbox" cards and the invite nudge are hidden. Still there: every Capture with its status, the "Incident 2" / "Maintenance" links that scroll to the block, hover linking, and the Dismissed fold-out. Server refusals unchanged from 16.

Checked in the browser (02:15 scene, isolated context): submitted, then the Inbox had no control that changes the report; Reset brought the composer and Draft buttons back. Test rows removed from Neon.
