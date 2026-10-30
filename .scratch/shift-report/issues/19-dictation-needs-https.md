# 19: Desktop dictation on a non-secure page

**What to build:** Found in Filip's demo. Opened over plain http on a LAN IP, the browser refuses the mic without asking, and the Inbox composer says "Mic blocked in site settings", which is wrong: nothing is blocked, the page just isn't a secure context. When `window.isSecureContext` is false, don't show the dictation button (as when speech recognition is missing). Keep "Mic blocked in site settings" for a real denial on https or localhost. Code: `app/prototype/report-editor/dictation.ts`, `inbox.tsx`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet, medium effort (contained change)

- [x] On http via a LAN IP the mic button is hidden; on localhost it shows and works as before
- [x] A real denial still shows "Mic blocked in site settings"

## Comments

`useDictation` now reports `supported` only when `window.isSecureContext` is true and speech recognition exists (`canDictate` in `app/prototype/report-editor/dictation.ts`), so the Inbox composer hides the mic button on plain http via a LAN IP, the same as in a browser without the API. No change to `inbox.tsx` was needed.

- Checked in Chrome: on `http://<LAN IP>:3300` (not a secure context, native recogniser present) the Dictate button is absent; on `localhost:3300` it shows.
- With a stubbed recogniser that fails with `not-allowed` on localhost, the hint line still reads "Mic blocked in site settings".
- No Captures were sent, so nothing to clean up in Neon.
