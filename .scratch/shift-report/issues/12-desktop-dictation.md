# 12: Dictation in the desktop Inbox composer

**What to build:** Story 21. A mic button in the Inbox composer (`app/prototype/report-editor/inbox.tsx`, next to attach) turns speech into text in the composer field using the browser's built-in speech recognition (`SpeechRecognition` / `webkitSpeechRecognition`, English). No audio is sent to our server or stored. Words appear in the field as they are recognised; clicking again stops. Nothing is sent automatically: the manager checks the text and sends it as an ordinary text Capture. Where the browser has no speech recognition, the button is not shown. If the mic is blocked, say so briefly in place.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [x] In Chrome: click the mic, speak, the text appears in the field; Send makes a text Capture
- [x] The button has a label and Tip ("Dictate" / "Stop dictation") and a visible listening state that isn't colour alone
- [x] Hidden where unsupported; a denied mic permission shows a short message, no crash
- [x] Looks and works like prototype E, per `docs/design-system.md` (`IconBtn`, no new tokens)

## Comments

Built `useDictation` in `app/prototype/report-editor/dictation.ts` (browser `SpeechRecognition` / `webkitSpeechRecognition`, `en-US`, continuous with interim results; no audio touches our server) and a mic `IconBtn` after attach in the Inbox composer.

- Spoken words are appended to whatever was already typed (`joinDictation`) and update live as they are recognised. Nothing is sent automatically; Send / Enter stops dictation and adds an ordinary text Capture.
- Listening state: filled button, the icon becomes a stop square, the Tip/label switches to "Stop dictation", and the hint line reads "Listening…" (a `role="status"` region). No motion added.
- Typing while dictating stops dictation and keeps the words. Errors show in place in the hint line: "Mic blocked in site settings" (not-allowed), "No microphone found", or a generic retry line; no-speech just stops.
- Support is read after hydration (`useSyncExternalStore`), so the button is absent on the server and in browsers without speech recognition.
- Checked in Chrome with a stubbed recogniser (real mic input can't be driven headless): text flows into the field and Send creates a text Capture that persists in Neon; the denied path shows the message without errors; with the API removed the button is hidden.
