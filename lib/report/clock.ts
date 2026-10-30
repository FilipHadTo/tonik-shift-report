// The report's clock (ADR 0009). The demo report runs on the demo clock, so its Captures land on the
// seeded Night. A clean report from "New report" runs on the real clock: Captured-at is the server time
// in the venue's time zone and its Night comes from Night assignment (nightOf).

import { DEFAULT_VISIBLE, nightMinutes } from "./catalog"
import { nightOf } from "./night"
import { VENUE, alex } from "./seed"
import type { Report } from "./types"

/** Where Halo Club is. The demo has one venue, so one time zone. */
export const VENUE_TIME_ZONE = "Europe/Warsaw"

/** The local time (HH:MM, 24h) of a moment in the venue's time zone. */
export function localTime(at: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  )
  return `${parts.hour}:${parts.minute}`
}

/** A Night (YYYY-MM-DD) as the report shows it: "Sat 24 Oct". */
export function nightLabel(night: string) {
  const date = new Date(`${night}T12:00:00Z`)
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...o }).format(date)
  return `${part({ weekday: "short" })} ${part({ day: "numeric" })} ${part({ month: "short" })}`
}

/** "New report" (story 65): an empty Shift Report for the venue, started now, on the Night now belongs to. */
export function cleanReport(now: Date, timeZone = VENUE_TIME_ZONE): Report {
  const at = localTime(now, timeZone)
  return {
    kind: "clean",
    venue: VENUE,
    night: nightLabel(nightOf(now, timeZone)),
    // Unused on a clean report (no Demo controller); "start" is the empty one.
    scene: "start",
    startedAt: at,
    manager: alex,
    captures: [],
    blocks: [],
    incidents: [],
    visible: [...DEFAULT_VISIBLE],
    invited: false,
    drafted: false,
    clock: nightMinutes(at),
  }
}

/**
 * The report as of `now`, before anything is stamped on it: a clean report's clock is set to the real
 * time; the demo report keeps its demo clock (returned as is).
 */
export function onClock(r: Report, now: Date, timeZone = VENUE_TIME_ZONE): Report {
  if (r.kind !== "clean") return r
  const clock = nightMinutes(localTime(now, timeZone))
  return clock === r.clock ? r : { ...r, clock }
}

/** A row of Reports (story 64). */
export type ReportRow = {
  night: string
  status: "open" | "sent"
  incidents: number
  demo: boolean
  sentAt?: string
  sentBy?: string
}

/** Takes a whole Report, or just what a row needs (the list never loads Captures or blocks). */
export function reportRow(
  r: Pick<Report, "kind" | "night" | "submittedAt" | "submittedBy"> & { incidents: { length: number } },
): ReportRow {
  return {
    night: r.night,
    status: r.submittedAt ? "sent" : "open",
    incidents: r.incidents.length,
    demo: r.kind === "demo",
    ...(r.submittedAt && { sentAt: r.submittedAt }),
    ...(r.submittedBy && { sentBy: r.submittedBy.name }),
  }
}
