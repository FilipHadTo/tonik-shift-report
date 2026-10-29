// Derived state: Capture status, Section state, Incident order, what blocks Submit.

import { SECTIONS, nightMinutes, timeOf } from "./catalog"
import { likelySections } from "./fake-model"
import type { Field, Incident, InboxCapture, Report, SectionId } from "./types"

export type CaptureStatus = "new" | "drafting" | "drafted" | "in-report" | "dismissed"

export function statusOf(r: Report, c: InboxCapture): CaptureStatus {
  if (c.dismissed) return "dismissed"
  if (c.drafting) return "drafting"
  if (c.handled) return "in-report"
  // Anything of it still outside the report (e.g. its Incident was deleted, story 40) makes it New again.
  if (isNew(c)) return "new"
  const open =
    r.incidents.some((i) => i.sources.includes(c.id) && !i.confirmedAt) ||
    r.blocks.some((b) => b.sources.includes(c.id) && b.status === "draft")
  return open ? "drafted" : "in-report"
}

/** Something of it is not in the report yet: never drafted, or drafted only in part. */
export function isNew(c: InboxCapture) {
  return !c.dismissed && !c.handled && (c.found === undefined || pendingSectionsOf(c).length > 0)
}

/** Where a Capture landed, for the tile label: "Incident 2", "Maintenance". */
export function targetsOf(r: Report, c: InboxCapture) {
  const out: { label: string; anchor: string }[] = []
  const incidents = orderedIncidents(r)
  incidents.forEach((i, n) => {
    if (i.sources.includes(c.id)) out.push({ label: `Incident ${n + 1}`, anchor: i.id })
  })
  for (const s of SECTIONS) {
    if (s.id === "incidents") continue
    if (r.blocks.some((b) => b.section === s.id && b.sources.includes(c.id)))
      out.push({ label: s.name.split(" /")[0], anchor: `section-${s.id}` })
  }
  return out
}

/** Sections a Capture still has to go into: what the AI found but didn't draft, or a guess before the first draft. */
export function pendingSectionsOf(c: InboxCapture) {
  return (c.found ?? likelySections(c)).filter((s) => !c.applied.includes(s))
}

export function orderedIncidents(r: Report) {
  return [...r.incidents].sort((a, b) => nightMinutes(a.capturedAt) - nightMinutes(b.capturedAt))
}

export function gapsIn(i: Incident) {
  return (Object.values(i.fields) as Field[]).filter((f) => f.status === "gap" || f.status === "empty").length
}

/** AI Drafts nobody kept or discarded yet: Section blocks and Enhance results in "What happened". */
export function openDrafts(r: Report) {
  return [
    ...r.blocks.filter((b) => b.status === "draft").map((b) => b.id),
    ...r.incidents.filter((i) => i.descriptionDraft !== undefined).map((i) => i.id),
  ]
}

export type SectionState = "gap" | "confirm" | "draft" | "done" | "empty"

export function sectionState(r: Report, id: SectionId): { state: SectionState; label: string } {
  if (id === "incidents") {
    const gaps = r.incidents.reduce((n, i) => n + gapsIn(i), 0)
    const open = r.incidents.filter((i) => !i.confirmedAt).length
    if (gaps) return { state: "gap", label: gaps === 1 ? "1 Gap" : `${gaps} Gaps` }
    if (open) return { state: "confirm", label: `${open} to confirm` }
    if (r.incidents.length) return { state: "done", label: `${r.incidents.length}` }
    return { state: "empty", label: "None" }
  }
  const blocks = r.blocks.filter((b) => b.section === id)
  if (blocks.some((b) => b.status === "draft")) return { state: "draft", label: "Draft" }
  if (blocks.length) return { state: "done", label: "" }
  return { state: "empty", label: "Empty" }
}

export function hasContent(r: Report, id: SectionId) {
  return id === "incidents" ? r.incidents.length > 0 : r.blocks.some((b) => b.section === id)
}

export function newCapturesFor(r: Report, id: SectionId) {
  return r.captures.filter(
    (c) => isNew(c) && !c.drafting && pendingSectionsOf(c).includes(id),
  )
}

export function clockLabel(r: Report) {
  return timeOf(r.clock)
}

/** Anything for the reviewer's eyes before Submit: a Section block or an Incident. */
export function isEmpty(r: Report) {
  return r.blocks.length === 0 && r.incidents.length === 0
}

/** `base`, or `base-2`, `base-3`… if that id is taken: ids are never reused, even after a Delete. */
export function freeId(base: string, taken: { id: string }[]) {
  let id = base
  for (let n = 2; taken.some((t) => t.id === id); n++) id = `${base}-${n}`
  return id
}
