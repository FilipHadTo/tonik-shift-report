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

- [x] Sent report: the phone shows the closed state on load and after a refused Send
- [x] Draft with nothing found shows the calm note
- [x] Occurred-at follows the text, not the posting time (checked once with real Gemini on the pasted chat)
- [x] No dead "Add Evidence"; no "None" for Incidents in the rail

## Comments

Built:
1. Phone: the capture GET now also answers `submitted`; on load, and on a 409 from Send, the composer is replaced by a quiet locked note, "This report was sent. The link is closed." (lock icon, like the Inbox's locked note). No "try again" for a sent report.
2. Draft with nothing found: `applySaved` returns `empty: true` when the model answered but added no Incident or block (test-first in `save.test.ts`); the draft route passes it on, and the pressed Draft button shows "Nothing to add to the report from this" for 5s in the calm note's slot. The Capture stays New.
3. Extract prompt: Occurred-at only from words saying when it happened; a chat line's posting time counts only for "just now"-style lines, vague times ("before midnight") give none, so the domain's Captured-at rule applies. The recorded fallback answer for the pasted chat no longer uses 01:42 (test in `extract.test.ts`).
4. "Add Evidence" removed from Incidents without Evidence.
5. Outline rail: Incidents with none read "Empty", like every other empty Section (test in `readiness.test.ts`).

Checked in Chrome (own isolated context, 390px phone; test rows removed from Neon), 2 real Gemini calls: "lol 😂" drafted → calm note, still 1 new; pasted chat c4 → "Phone stolen from coat", Occurred-at 02:10 (its Captured-at), not 01:42. Phone: refused Send (409) and reload both show the closed note, no composer.
