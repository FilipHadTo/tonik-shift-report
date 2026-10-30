# Many Shift Reports per demo session: a pinned demo report and clean real-clock reports

Supersedes the "one report per venue per Night" and "no report list or New report screen" parts of ADR-0005. Until now each browser's demo id held exactly one Shift Report, seeded on a fixed Night (Sat 24 Oct) and driven by a demo clock, and the invite QR carried the demo id. That was enough to show one Night, but not where a sent report goes, and a reviewer couldn't try the flow from a blank page at today's time. The venue (Halo Club) now has a Reports list: any number of Shift Reports, open or sent, created with "New report" by anyone on any device. Each report has its own id and its own capture link and QR, so a phone writes into that report only. The first row is the demo report: the only one with the Demo controller (scenes 20:00 / 02:15, Reset) and the demo clock, kept stable so the Loom can be recorded on it. A clean report starts empty and uses the real clock: Captured-at is the server time and its Night comes from Night assignment (`nightOf`), so its Night is today's business date. The demo id per browser stays (ADR-0005's per-reviewer isolation, spec story 60): it now keys the reviewer's Reports list instead of a single report, so reviewers never see each other's reports.

## Considered Options

- Keep one report per demo id and add Preview as a separate route (open-questions, ticket 17 option B): no place for the manager to go after Submit, and the 02:15 scene would be the only report a reviewer ever sees.
- Every report on the demo clock: clean reports would all land on the seeded Night and the "Night" column would mean nothing.
- One report per Night, enforced: a reviewer creating a second report today would be blocked for no demo benefit. The domain rule (one report per venue per Night) is relaxed in the demo; a real product would enforce it.

## Consequences

- The capture link and QR carry the report, not the demo id; reports, not demo ids, own Captures.
- Scene switch and Reset act on the demo report only; clean reports in the same session are left alone.
- After Submit the manager stays on the Report screen in a "Sent" state; the clean document (stories 57–58) is a Preview opened from the Reports list, on the same route in a document mode.
