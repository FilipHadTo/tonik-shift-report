# 12: Dictation in the desktop Inbox composer

**What to build:** Story 21. A mic button in the Inbox composer (`app/prototype/report-editor/inbox.tsx`, next to attach) turns speech into text in the composer field using the browser's built-in speech recognition (`SpeechRecognition` / `webkitSpeechRecognition`, English). No audio is sent to our server or stored. Words appear in the field as they are recognised; clicking again stops. Nothing is sent automatically: the manager checks the text and sends it as an ordinary text Capture. Where the browser has no speech recognition, the button is not shown. If the mic is blocked, say so briefly in place.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [ ] In Chrome: click the mic, speak, the text appears in the field; Send makes a text Capture
- [ ] The button has a label and Tip ("Dictate" / "Stop dictation") and a visible listening state that isn't colour alone
- [ ] Hidden where unsupported; a denied mic permission shows a short message, no crash
- [ ] Looks and works like prototype E, per `docs/design-system.md` (`IconBtn`, no new tokens)
