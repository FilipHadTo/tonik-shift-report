// Preview (stories 57, 68): what the submitted report prints beyond its stored content.

import { SECTIONS } from "./catalog"
import { hasContent, orderedIncidents } from "./derived"
import type { Author, InboxCapture, Incident, Report } from "./types"

/**
 * Every Section without content, by name, in the report's order. Incidents is named too when there
 * are none: the report never claims "No Incidents", it only says nobody covered them.
 */
export function notCoveredTonight(r: Report) {
  return SECTIONS.filter((s) => !hasContent(r, s.id)).map((s) => s.name)
}

/** "01:10 (logged 01:15)", or "Time unknown (logged 02:10)". */
export function incidentTime(i: Incident) {
  const f = i.fields.occurredAt
  const at = f.status === "filled" || f.status === "draft" ? f.value : "Time unknown"
  return `${at} (logged ${i.capturedAt})`
}

/** Photo Evidence, once per photo, with the numbers of the Incidents it belongs to, in Incident order. */
export function attachmentsOf(r: Report) {
  const out: { capture: InboxCapture; incidents: number[] }[] = []
  orderedIncidents(r).forEach((i, n) => {
    for (const id of i.evidence) {
      const capture = r.captures.find((c) => c.id === id && c.kind === "photo")
      if (!capture) continue
      const seen = out.find((a) => a.capture.id === id)
      if (seen) seen.incidents.push(n + 1)
      else out.push({ capture, incidents: [n + 1] })
    }
  })
  return out
}

/** The header's counts: Captures per person (dismissed ones left out), Incidents, Sections covered. */
export function tally(r: Report) {
  const kept = r.captures.filter((c) => !c.dismissed)
  const people: { author: Author; count: number }[] = []
  for (const c of kept) {
    const p = people.find((x) => x.author.name === c.author.name)
    if (p) p.count++
    else people.push({ author: c.author, count: 1 })
  }
  return {
    captures: kept.length,
    people,
    incidents: r.incidents.length,
    covered: SECTIONS.filter((s) => hasContent(r, s.id)).length,
    sections: SECTIONS.length,
  }
}
