# 18: Photos from the phone reach the desktop

**What to build:** Found in Filip's demo (2026-10-31). A photo sent from the capture page shows up on the desktop as a placeholder: the phone sends only a `photo: "upload"` marker (`lib/report/phone.ts`) and keeps the image in its own `previews` map (`app/prototype/report-editor/capture/capture.tsx`). Send the image itself: the phone downsizes it before sending (longest side about 1280 px, JPEG, roughly 150 KB), the server validates and stores it in Neon with the Capture (no new service), and the desktop Inbox and the report show the real photo wherever `PhotoThumb` stands in today. Seeded photo Captures keep their placeholders. Reset and demo isolation behave as for other Captures.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Opus, high effort (phone, server, DB, desktop)

- [ ] A photo sent from the phone shows as the real image in the desktop Inbox within the polling interval, and after a reload
- [ ] Oversized or non-image payloads are refused by the server; the phone downsizes before sending
- [ ] Reset removes the photos with their Captures; another demo id never sees them
- [ ] Looks and works like prototype E, per `docs/design-system.md`
