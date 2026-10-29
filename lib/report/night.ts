// Night assignment: the Night is the date the shift started, so the small hours count
// toward the previous evening (ADR 0005, story 6).

/** Local hour at which a new Night begins. */
export const NIGHT_ENDS_AT = 8

/** The Night (YYYY-MM-DD) a moment belongs to, in the venue's time zone. */
export function nightOf(at: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  )
  const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)))
  if (Number(parts.hour) < NIGHT_ENDS_AT) date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}
