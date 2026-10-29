# 10: Live Inbox through the database

**What to build:** Stories 11, 13, 61. The mobile capture page saves each Capture to the database for the demo id in its link (`?d=…`), and the desktop Inbox shows it within a few seconds by checking the server every few seconds (no websockets). Captured-at is set by the server; the Capture is assigned to its Night with Night assignment. The phone sees only Captures sent from that device. Input is validated on the server. The in-memory store (`app/prototype/report-editor/captures/route.ts`) goes away.

**Blocked by:** 08

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [ ] Scan the Invite staff QR (or open the link) in another tab: a Capture sent there shows in the right desktop Inbox within seconds, and not in another demo id's Inbox
- [ ] Reload the phone page: its own Captures are still listed
- [ ] Reset or a scene switch on the desktop empties that demo's phone Captures
- [ ] Looks and works like prototype E, per `docs/design-system.md`
