# 10: Live Inbox through the database

**What to build:** Stories 11, 13, 61. The mobile capture page saves each Capture to the database for the demo id in its link (`?d=…`), and the desktop Inbox shows it within a few seconds by checking the server every few seconds (no websockets). Captured-at is set by the server; the Capture is assigned to its Night with Night assignment. The phone sees only Captures sent from that device. Input is validated on the server. The in-memory store (`app/prototype/report-editor/captures/route.ts`) goes away.

**Blocked by:** 08

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [x] Scan the Invite staff QR (or open the link) in another tab: a Capture sent there shows in the right desktop Inbox within seconds, and not in another demo id's Inbox
- [x] Reload the phone page: its own Captures are still listed
- [x] Reset or a scene switch on the desktop empties that demo's phone Captures
- [x] Looks and works like prototype E, per `docs/design-system.md`

## Comments

Built: phone Captures are stored in Neon. `captures/route.ts` is now DB-backed (in-memory store removed): POST validates the payload and files the Capture into the demo id's report (`?d=…`); GET `?d=` returns the report's phone Captures for the desktop poll, GET `?d=&device=` only that phone's own. Migration `drizzle/0001_*.sql` adds `captures.device` (applied).

Key decisions:
- Rules in `lib/report/phone.ts` (tested first): `parsePhoneCapture` checks device, name, role, kind (photo / voice / text) and text, trims and clips, and never takes an id or Captured-at from the phone; `receivePhoneCapture` stamps Captured-at from the stored report's clock, moves the clock on, adds the Capture as New and refuses a submitted report (409).
- Captured-at uses the demo clock, like typed Captures in ticket 09, so phone Captures sit inside the seeded Night (Sat 24 Oct). Night assignment (`nightOf`) is therefore implicit: the demo id has one report, one Night. Using the real server clock with `nightOf` would put Captures at today's time into a 24 Oct report; open for Filip.
- The phone POST writes only the new Capture row and the clock (`greatest`), so it never clobbers a manager action saved at the same moment; `saveReport` also never moves the clock back. Ids are random (`p-…`), so two phones can't collide.
- `receive` is no longer a saved manager action (the browser can't inject Captures through the action route); E applies polled Captures locally only. The poll waits while anything is in flight and drops an answer that crossed a Reset / scene switch, so deleted Captures never come back.
- Reset / scene switch reseed the report, which cascades to its Captures: the phone list empties on its next poll.
- Verified in Chrome with two isolated tabs (desktop + phone at 390px): Capture shows in the right Inbox within ~2 s, not in another demo id; phone reload keeps its list; Draft into report on a phone Capture saves; Reset empties both. Test rows removed.
