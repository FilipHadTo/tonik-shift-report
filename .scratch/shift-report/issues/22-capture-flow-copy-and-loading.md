# 22: Capture flow copy, Other full width, loading skeleton and offline note

**What to build:** Filip's answers (open-questions, tickets 08 and 11):
- Desktop copy: drop the voice-note mention from the Inbox empty state and wherever the desktop still says staff send voice notes (staff dictate with the keyboard mic now).
- Capture page role picker: Other spans the full width of its last row.
- While the report loads from the DB, show a skeleton of the Report screen instead of an empty background (Neon cold starts make this visible on first visit). Quiet, no shimmer that draws the eye; respect reduced motion.
- When the DB is unreachable and E falls back to the local seed, show a small calm note that changes aren't being saved, e.g. "Offline. Changes aren't saved."

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet, high effort (UI)

- [x] No voice-note mentions left on the desktop
- [x] Other is full width on the capture page
- [x] A slow load shows the skeleton; an unreachable DB shows the offline note
- [x] Looks and works like prototype E, per `docs/design-system.md`

## Comments

Built:
- Desktop copy: the Inbox empty state no longer mentions voice notes ("Photos and lines of text from you and your staff…"; phone step: "A photo or a line of text in seconds."). The "Voice note" kind label stays for the seeded 01:15 Capture.
- Capture page: the last role in an odd row spans both columns (`odd:last:col-span-2`), so Other is full width.
- Loading skeleton (`skeleton.tsx`): the Report screen's shape (top bar, three columns, static bars in `raise`), no shimmer. It fades in after 300ms (200ms `ease-out`, opacity only), so a fast load never flashes it; reduced motion keeps the fade. `ReportEditor` reads the scene from `window.location` instead of `useSearchParams`, so the skeleton is in the prerendered HTML and shows before hydration; `Editor` sits in a Suspense with the same fallback. New `skeleton` row in the design-system motion table.
- Offline note: when the report GET fails and E falls back to the seed, the top bar shows "Offline. Changes aren't saved." with a CloudOff icon in `ink-2`, beside the Open since pill (`role="status"`, `appear`). Only on open; later failed saves stay silent as before.

Checked in Chrome: a delayed report request and Slow 3G both show the skeleton, then the report with no note; a failed report request shows the seed with the offline note; capture page at 390px has Other full width. Test reports removed from Neon.
