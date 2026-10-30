# 27: Final fixes from the production test

**What to build:** Found in the 2d production test and the 2c pass (2026-10-30). Small fixes only, no redesigns:
1. Capture page after Submit: on load (and on a 409 from Send) show a calm closed state, e.g. "This report was sent. The link is closed.", and hide the composer. No "try again" message for a sent report.
2. Draft that finds nothing (e.g. a photo with nothing reportable): today it returns 200, no change, no message, and the click looks dead. Show a calm in-place note in E's existing style, e.g. "Nothing to add to the report from this." The Capture stays New.
3. Extract prompt: Occurred-at vs posted/Captured-at. A chat line posted at 01:42 saying "sometime before midnight" was drafted as occurred 01:42. Tighten the prompt so Occurred-at comes only from what the text says about when it happened; otherwise leave it as a Gap / approximate per the existing rules. Add a recorded-answer test case if the domain validation is involved.
4. "Add Evidence" on an Incident does nothing: hide it (no new feature).
5. The outline rail says "None" for no Incidents: use an en dash or the existing empty treatment, never a "No Incidents"/"None" claim (GLOSSARY).

**Blocked by:** None

**Status:** ready-for-agent

**Agent:** Opus, high effort (small fixes across phone, Inbox, prompt)

- [ ] Sent report: the phone shows the closed state on load and after a refused Send
- [ ] Draft with nothing found shows the calm note
- [ ] Occurred-at follows the text, not the posting time (checked once with real Gemini on the pasted chat)
- [ ] No dead "Add Evidence"; no "None" for Incidents in the rail
