# 25: Reports list design (MVP)

**What to build:** Stories 59, 63–65, 69–71, ADR 0009. Design the Reports screen on top of ticket 24's bare scaffold, so it visibly belongs to prototype E. Filip delegated the UI calls for this screen (2026-10-31): "an MVP Reports screen that fits the app and meets the requirements, without unnecessary extras — small enhancements OK, but don't overdo it."
- Venue Halo Club; one row per report: Night, Open / Sent, Incident count, and for a sent report when and by whom.
- The demo report pinned first with its "Demo" label; "New report" creates a clean report and opens it; a row opens its report.
- Fix the too-wide container: a readable width consistent with E.
- An empty state (only the demo report) that still looks intentional; loading and error states.
- Leave a sensible place for the Preview of a sent report (ticket 17) without building it.

Out of scope: the "Sent" state on the Report screen, the document Preview, search / filter / sort, delete, pagination, settings.

**Blocked by:** 24

**Status:** ready-for-agent

**Agent:** Opus (UI, autonomous design calls)

- [x] Rows show Night, Open / Sent with when and by whom, and Incidents; the demo report is pinned with "Demo"
- [x] "New report" opens a clean report; every row opens its report
- [x] The list sits at E's document width; the demo-only, loading and error states look intentional
- [x] Looks and works like prototype E, per `docs/design-system.md`; checked at 1440px and 1024px

## Comments

Built in `app/prototype/report-editor/reports.tsx`. Decisions and why:

- **Width.** One `panel` card centred at `max-w-[832px]` with `px-14`, so the text column is 720px: the same measure and padding as the Report screen's document. The list reads as a page of the same app, not a stretched table. No min width, so 1024px fits without horizontal scroll.
- **Header.** E's top bar unchanged (SR mark, breadcrumb), with "Halo Club" as the current crumb. Inside the panel the document's own pattern: overline "Halo Club", title "Reports" in the Report title role (32px). "New report" is the one `primary` button, beside the title rather than in the top bar: on a centred page the far-right corner is a long way from the list it adds to.
- **Rows.** One `ul` on a CSS grid with subgrid rows, so columns line up across rows without fixed widths: Night (medium) + "Demo" pill | status | Incidents | chevron. `h-12`, `rounded-lg` hover in `raise` bleeding into the gutter (`-mx-3 px-3`) so text stays on the column edge, like the rail. No separators between rows; space does the grouping.
- **Status.** Reuses the top bar's language: green dot + "Open since 20:00", lock + "Sent 05:12 by Alex Morgan" (time and name in `ink-3`). State is a word plus an icon, never colour alone. "Open since" is the one small enhancement: two clean reports on the same Night (the demo allows it, ADR 0009) were otherwise identical rows. It needed `startedAt` on `ReportRow` (`lib/report/clock.ts`, test updated first) and one more column in `listReports`.
- **Incidents.** "No Incidents" / "1 Incident" / "n Incidents", tabular; zero in `ink-3` so the eye goes to reports that have some.
- **Pinned demo.** The demo row first, then one hairline (`border-t`, the allowed separator inside a block), then clean reports newest first. The "Demo" pill is the top bar's pill shape on a panel (`raise` + `line` ring).
- **Empty state.** Under the demo row, a dashed `line-2` block (the system's empty affordance): "No other reports yet" / "New report starts a clean one for tonight on the real clock. The demo report stays as it is." No second button: the primary is right above.
- **Loading and errors.** Two static skeleton rows reusing E's `.rx.skeleton` (fades in only after 300ms, no shimmer). Load error: "Unable to load your reports. Check your connection and reload the page." A failed "New report" no longer hides the list: its own note under the button, "Unable to start a report. Check your connection and try again."
- **Preview.** Sent rows open the report today. `rowHref` is the single place ticket 17 changes so a sent row opens its Preview (the same route in a document mode, story 68); the chevron column is where a "Preview" hint would sit if 17 wants one.
- **Motion.** Only existing classes: the list mounts with `appear` (fade, has a reduced-motion fallback); row hover is `transition-colors duration-150`. No press scale on rows: a 720px row scaling is decoration on a high-frequency action.

Checked in Chrome (own isolated context, own tab): 1440px and 1024px, no horizontal scroll; the demo-only empty state; the skeleton during a slow load; "New report" opened a clean Fri 30 Oct report; an empty clean report submitted shows "Sent hh:mm by Alex Morgan"; link names read "Night of Fri 30 Oct Open since 12:36 No Incidents". Test reports deleted from Neon afterwards. `tsc`, `eslint`, `pnpm test` (196) pass.
