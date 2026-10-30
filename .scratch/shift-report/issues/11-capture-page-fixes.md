# 11: Capture page: "Send to the manager", Other role, keyboard dictation

**What to build:** Three changes on the mobile capture page (`app/prototype/report-editor/capture/`), decided by Filip:
- Story 12: the heading and the page `<title>` say "Send to the manager", not "Add to tonight's report". No other staff-facing copy promises a report entry.
- Story 8: the role list is Door, Bar, Security, Closing Manager, Other. A fixed list is enough for the demo. Add Other wherever roles are checked (types, server validation).
- Story 9: no simulated voice recording. Remove the mic button, the recording bar and the canned transcript. People dictate with the phone keyboard's own mic, which gives plain text; the composer has a camera button, the growing text field and a Send button. Copy that mentions voice notes changes to match (e.g. intro: "A photo or a line of text. Tap the keyboard mic to talk instead of typing."). The `voice` kind stays in the data for the seeded 01:15 voice note.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [x] Heading and tab title read "Send to the manager"
- [x] Other can be picked, is saved on the phone, and a Capture from it shows "Other" on the desktop
- [x] No mic or recording UI on the page; text and photo still send
- [x] Looks and works like prototype E, per `docs/design-system.md`; checked at phone width in Chrome, dark first, then light (touch sizes `h-11`, 16px input text)

## Comments

Built:
- Heading and page `<title>` now read "Send to the manager"; intro and empty-state copy no longer mention voice notes (empty state: "A photo or a line of text. Tap the keyboard mic to talk instead of typing.").
- Roles: `ROLES` is now one fixed list in `lib/report/catalog.ts` (Door, Bar, Security, Closing Manager, Other); `Author["role"]` derives from it, and both server validation (`parsePhoneCapture`) and the capture page read it. Test added first in `phone.test.ts`.
- Composer: mic button, recording bar and canned transcripts removed. It is camera, growing text field and Send. Send is always visible (disabled until there is text or a photo) instead of swapping with the mic.

Decisions:
- `voice` stays a valid phone kind in `parsePhoneCapture` and in the data (seeded 01:15 voice note); the page just never sends it.
- Manager-facing desktop copy ("Invite staff to tonight's report", Inbox empty state mentioning voice notes) is unchanged: story 12 covers staff-facing copy only.
- With five roles the 2-column grid leaves Other alone on the last row, half width.

Checked in Chrome at 390px, dark then light: picked Other, sent a text and a photo, both showed on the desktop Inbox as "Other". Test report removed from Neon.
