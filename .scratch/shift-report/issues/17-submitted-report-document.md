# 17: The submitted report as a clean document

**What to build:** Stories 57–58. After Submit, prototype E only shows the locked editor. The submitted report should read like a clean document, not an app screen, so it can be read, printed or forwarded as is: header, the Sections with content, Incidents (with Logged time, "Reported by" and "Confirmed by"), a "Not covered tonight" line (naming Incidents too when there are none, never a "No Incidents" claim), attachments at the end as larger photos labelled by Incident, the Captures verbatim, then the statement and footer ("AI-assisted, reviewed and submitted by …"). A Share action for the next team is a stub. Content order is in `.scratch/shift-report/report-structure.md`.

New screen, so Filip designs it first (in E, with `better-*` skills, from `docs/design-system.md`); then it can be built.

**Blocked by:** 16, the reports list shaping (PROCESS.md 2b.1)

**Status:** ready-for-agent

**Agent:** Opus, high effort; Filip delegated the design (2026-10-31), brainstorm autonomously

- [ ] Filip has picked the layout
- [ ] Opening a submitted report shows the document; it prints cleanly
- [ ] Share is a stub
- [ ] Looks like it belongs to prototype E, per `docs/design-system.md`; dark first, then light

## Comments

2026-10-31, Filip: same route (option A). After Submit the manager stays on the Report screen, sees it's sent and goes home; the clean document opens as a Preview of a closed report from the reports list (shaping in PROCESS.md 2b.1). Light mode is out of scope.

2026-10-31, Filip (delegated to an agent, no hand design): a sent report has two ways in from the Reports list: (1) open the editor, locked (as today after Submit, Inbox read-only per ticket 21), and (2) open the final report as a clean document (Preview). The document has a placeholder "Download PDF" action (stub; may call `window.print()` with a print stylesheet, or just be a stub) instead of Share. On the Report screen, after Submit, the manager sees a clear "Sent" state and a way into the document. MVP, fits prototype E, no extras.
