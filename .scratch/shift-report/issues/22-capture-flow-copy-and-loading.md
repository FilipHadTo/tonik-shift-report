# 22: Capture flow copy, Other full width, loading skeleton and offline note

**What to build:** Filip's answers (open-questions, tickets 08 and 11):
- Desktop copy: drop the voice-note mention from the Inbox empty state and wherever the desktop still says staff send voice notes (staff dictate with the keyboard mic now).
- Capture page role picker: Other spans the full width of its last row.
- While the report loads from the DB, show a skeleton of the Report screen instead of an empty background (Neon cold starts make this visible on first visit). Quiet, no shimmer that draws the eye; respect reduced motion.
- When the DB is unreachable and E falls back to the local seed, show a small calm note that changes aren't being saved, e.g. "Offline. Changes aren't saved."

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet, high effort (UI)

- [ ] No voice-note mentions left on the desktop
- [ ] Other is full width on the capture page
- [ ] A slow load shows the skeleton; an unreachable DB shows the offline note
- [ ] Looks and works like prototype E, per `docs/design-system.md`
