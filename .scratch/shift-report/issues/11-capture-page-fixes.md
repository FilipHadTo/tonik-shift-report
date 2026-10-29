# 11: Capture page: "Send to the manager", Other role, keyboard dictation

**What to build:** Three changes on the mobile capture page (`app/prototype/report-editor/capture/`), decided by Filip:
- Story 12: the heading and the page `<title>` say "Send to the manager", not "Add to tonight's report". No other staff-facing copy promises a report entry.
- Story 8: the role list is Door, Bar, Security, Closing Manager, Other. A fixed list is enough for the demo. Add Other wherever roles are checked (types, server validation).
- Story 9: no simulated voice recording. Remove the mic button, the recording bar and the canned transcript. People dictate with the phone keyboard's own mic, which gives plain text; the composer has a camera button, the growing text field and a Send button. Copy that mentions voice notes changes to match (e.g. intro: "A photo or a line of text. Tap the keyboard mic to talk instead of typing."). The `voice` kind stays in the data for the seeded 01:15 voice note.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [ ] Heading and tab title read "Send to the manager"
- [ ] Other can be picked, is saved on the phone, and a Capture from it shows "Other" on the desktop
- [ ] No mic or recording UI on the page; text and photo still send
- [ ] Looks and works like prototype E, per `docs/design-system.md`; checked at phone width in Chrome, dark first, then light (touch sizes `h-11`, 16px input text)
