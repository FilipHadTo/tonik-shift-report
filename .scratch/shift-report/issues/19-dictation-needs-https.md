# 19: Desktop dictation on a non-secure page

**What to build:** Found in Filip's demo. Opened over plain http on a LAN IP, the browser refuses the mic without asking, and the Inbox composer says "Mic blocked in site settings", which is wrong: nothing is blocked, the page just isn't a secure context. When `window.isSecureContext` is false, don't show the dictation button (as when speech recognition is missing). Keep "Mic blocked in site settings" for a real denial on https or localhost. Code: `app/prototype/report-editor/dictation.ts`, `inbox.tsx`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet, medium effort (contained change)

- [ ] On http via a LAN IP the mic button is hidden; on localhost it shows and works as before
- [ ] A real denial still shows "Mic blocked in site settings"
