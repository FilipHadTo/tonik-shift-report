# 09: Save every manager action

**What to build:** Every change the Closing Manager makes on the Report screen is saved: Keep / Discard, Confirm and Reopen, filling a Gap or marking Unknown, editing an Incident or a block, writing into a Section, adding or deleting an Incident, showing or hiding a Section, Dismiss and restore, marking a Capture as written by hand, the Invite staff flag, Captures typed in the Inbox composer (Captured-at set by the server). The server applies the same report domain action to the stored report and saves it, so the rules can't be bypassed from the browser. The screen updates at once and settles on the server's result. A reload shows exactly what was there.

**Blocked by:** 08

**Status:** ready-for-agent

**Agent:** Opus 5.5, medium effort (cross-cutting or rule-heavy)

- [ ] Do each action above in the 02:15 scene, reload: everything is still there
- [ ] An invalid action (e.g. Confirm on an Incident with a Gap) is refused by the server and the screen shows the saved state
- [ ] No visible delay or flicker on actions; looks and works like prototype E, per `docs/design-system.md`
