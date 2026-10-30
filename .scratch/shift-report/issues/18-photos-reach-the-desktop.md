# 18: Photos from the phone reach the desktop

**What to build:** Found in Filip's demo (2026-10-31). A photo sent from the capture page shows up on the desktop as a placeholder: the phone sends only a `photo: "upload"` marker (`lib/report/phone.ts`) and keeps the image in its own `previews` map (`app/prototype/report-editor/capture/capture.tsx`). Send the image itself: the phone downsizes it before sending (longest side about 1280 px, JPEG, roughly 150 KB), the server validates and stores it in Neon with the Capture (no new service), and the desktop Inbox and the report show the real photo wherever `PhotoThumb` stands in today. Seeded photo Captures keep their placeholders. Reset and demo isolation behave as for other Captures.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Opus, high effort (phone, server, DB, desktop)

- [x] A photo sent from the phone shows as the real image in the desktop Inbox within the polling interval, and after a reload
- [x] Oversized or non-image payloads are refused by the server; the phone downsizes before sending
- [x] Reset removes the photos with their Captures; another demo id never sees them
- [x] Looks and works like prototype E, per `docs/design-system.md`

## Comments

Done. `parsePhoto` in `lib/report/phone.ts` (test-first): a photo Capture must carry a JPEG/PNG/WebP base64 data URL whose first bytes match its type, ≤ 600 KB; any other kind carrying one is refused. The route refuses bodies over 1 MB unread (413). Images live in a new `capture_photos` table (migration 0004), FK to the Capture with on delete cascade, so Reset and scene switches take them along; kept apart from `captures` so the 2 s Inbox poll never loads bytes. `capturePhoto(demoId, id)` in `lib/db` returns `{ mime, data }` (base64) — ticket 23 can send that to Gemini as is. Served at `captures/photo?d=…&id=…`, scoped by demo id (404 elsewhere). The phone downsizes on a canvas (longest side 1280 px, JPEG, quality stepped down to ~150 KB; a 2880 px screenshot came out at ~80 KB) and shows the stored image after a reload. Desktop: `CapturePhoto` in the Inbox and in Incident Evidence (Evidence now renders from the Incident's evidence Captures instead of the hard-coded `c1`/`c3`); seeded photos keep `PhotoThumb`. New phone copy for an image the browser can't decode: "Couldn't open that photo. Try taking it again."
