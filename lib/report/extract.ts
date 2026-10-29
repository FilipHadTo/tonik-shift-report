// Extract (ADR 0007): turns New Captures into Drafts, only when the Closing Manager asks,
// for one Capture, one Section or everything New. The model proposes; these rules decide.

import { INCIDENT_TYPES, LOCATIONS, SECTIONS, nightMinutes } from "./catalog"
import { freeId, isNew, pendingSectionsOf } from "./derived"
import type { ExtractRequest, ModelCapture, ReportModel } from "./model"
import type { Block, Field, InboxCapture, Incident, Report, SectionId } from "./types"

export type ExtractScope = { capture: string } | { section: SectionId } | { all: true }

/** Checked Drafts, ready to add to the report (ids are given on apply). */
export type Extracted = {
  incidents: Omit<Incident, "id">[]
  blocks: Omit<Block, "id">[]
  /** Captures sent to the model. */
  read: string[]
  /** Sections the AI found in each Capture it read, drafted now or not (the rest stays New). */
  found: Record<string, SectionId[]>
}

export const EXTRACT_TIMEOUT_MS = 20_000

/** The New Captures a scope covers. Only these are ever sent to the model or cited. */
export function capturesInScope(r: Report, scope: ExtractScope) {
  return r.captures.filter(
    (c) =>
      isNew(c) &&
      ("capture" in scope ? c.id === scope.capture : "section" in scope ? pendingSectionsOf(c).includes(scope.section) : true),
  )
}

export function extractRequest(r: Report, scope: ExtractScope): ExtractRequest {
  return {
    captures: capturesInScope(r, scope).map(toModel),
    sections: SECTIONS.filter((s) => s.id !== "incidents") as ExtractRequest["sections"],
    incidentTypes: INCIDENT_TYPES,
    locations: LOCATIONS,
    focus: "section" in scope ? scope.section : undefined,
  }
}

function toModel({ id, kind, capturedAt, author, text, chatLines }: InboxCapture): ModelCapture {
  return { id, kind, capturedAt, author, text, ...(chatLines && { chatLines }) }
}

/**
 * Asks the model and checks its answer. `null` means the model failed or answered nonsense:
 * the caller keeps the report as it was and flags it degraded.
 */
export async function extract(
  r: Report,
  scope: ExtractScope,
  model: ReportModel,
  { timeoutMs = EXTRACT_TIMEOUT_MS } = {},
): Promise<Extracted | null> {
  const request = extractRequest(r, scope)
  if (!request.captures.length) return { incidents: [], blocks: [], read: [], found: {} }
  try {
    return validateExtract(r, scope, await withTimeout(model.extract(request), timeoutMs))
  } catch {
    return null
  }
}

/** Extract and apply in one go: what the server routes and the tests use. */
export async function runExtract(r: Report, scope: ExtractScope, model: ReportModel, options?: { timeoutMs?: number }) {
  const result = await extract(r, scope, model, options)
  return result ? { report: applyExtract(r, result), degraded: false } : { report: r, degraded: true }
}

export function withTimeout<T>(p: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Timed out")), ms)
    p.then(
      (v) => (clearTimeout(t), resolve(v)),
      (e) => (clearTimeout(t), reject(e)),
    )
  })
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/
const GAP_HINT = { location: "No Capture says where.", type: "No Capture says what kind of Incident it was." }

/** The rules, whatever the model returned. Pure, so the seed can run recorded answers through it. */
export function validateExtract(r: Report, scope: ExtractScope, output: unknown): Extracted | null {
  if (typeof output === "string") {
    try {
      output = JSON.parse(output)
    } catch {
      return null
    }
  }
  if (!isObject(output) || !Array.isArray(output.drafts)) return null

  const inScope = new Map(capturesInScope(r, scope).map((c) => [c.id, c]))
  const focus = "section" in scope ? scope.section : undefined
  const out: Extracted = { incidents: [], blocks: [], read: [...inScope.keys()], found: {} }

  for (const raw of output.drafts) {
    if (!isObject(raw)) continue
    // References to Captures outside the scope (or that don't exist) are dropped.
    const sources = [...new Set(Array.isArray(raw.sources) ? raw.sources : [])].filter(
      (s): s is string => typeof s === "string" && inScope.has(s),
    )
    if (!sources.length) continue

    let section: SectionId
    let incident: Omit<Incident, "id"> | null = null
    let text = ""
    if (raw.kind === "incident") {
      section = "incidents"
      incident = toIncident(raw, sources, inScope)
    } else if (raw.kind === "section" && typeof raw.text === "string" && raw.text.trim()) {
      text = raw.text.trim()
      section = sectionOf(raw.section)
      // Incident-looking content is an Incident, never Section text.
      if (section === "incidents") incident = toIncident({ title: firstSentence(text), description: text }, sources, inScope)
    } else continue

    for (const s of sources) out.found[s] = union(out.found[s] ?? [], [section])
    if (focus && section !== focus) continue

    // A Capture is drafted into a Section once: never duplicate what already cites it.
    const fresh = sources.filter((s) => !alreadyIn(r, s, section) && (incident || !out.blocks.some((b) => b.section === section && b.sources.includes(s))))
    if (!fresh.length) continue

    if (incident) out.incidents.push({ ...incident, sources: fresh })
    else out.blocks.push({ section: section as Exclude<SectionId, "incidents">, text, status: "draft", sources: fresh })
  }
  return out
}

/** Adds checked Drafts to the report. Drafting into a hidden Section shows it. */
export function applyExtract(r: Report, ex: Extracted): Report {
  // Checked against the report as it is now: something may have been drafted while the model ran.
  const keep = <T extends { sources: string[] }>(d: T, section: SectionId) => {
    const sources = d.sources.filter((s) => !alreadyIn(r, s, section))
    return sources.length ? [{ ...d, sources }] : []
  }
  ex = {
    ...ex,
    incidents: ex.incidents.flatMap((i) => keep(i, "incidents")),
    blocks: ex.blocks.flatMap((b) => keep(b, b.section)),
  }
  const incidents = [...r.incidents]
  const blocks = [...r.blocks]
  for (const i of ex.incidents) incidents.push({ ...i, id: freeId(`i-${i.sources[0]}`, incidents) })
  for (const b of ex.blocks) blocks.push({ ...b, id: freeId(`b-${b.sources[0]}-${b.section}`, blocks) })

  const sections = [...ex.incidents.map(() => "incidents" as SectionId), ...ex.blocks.map((b) => b.section)]
  const drafted = (id: string) => [
    ...(ex.incidents.some((i) => i.sources.includes(id)) ? ["incidents" as SectionId] : []),
    ...ex.blocks.filter((b) => b.sources.includes(id)).map((b) => b.section),
  ]

  return {
    ...r,
    drafted: r.drafted || sections.length > 0,
    incidents,
    blocks,
    visible: union(r.visible, sections),
    captures: r.captures.map((c) =>
      !ex.read.includes(c.id)
        ? c
        : {
            ...c,
            drafting: false,
            applied: union(c.applied, drafted(c.id)),
            ...(ex.found[c.id] && { found: union(c.found ?? [], ex.found[c.id]) }),
          },
    ),
  }
}

function toIncident(raw: Record<string, unknown>, sources: string[], byId: Map<string, InboxCapture>): Omit<Incident, "id"> {
  const caps = sources.map((s) => byId.get(s)!).sort((a, b) => nightMinutes(a.capturedAt) - nightMinutes(b.capturedAt))
  const first = caps[0]
  const staff = caps.find((c) => c.author.role !== "Closing Manager")
  return {
    title: typeof raw.title === "string" ? raw.title.trim() : "",
    description: typeof raw.description === "string" ? raw.description.trim() : "",
    capturedAt: first.capturedAt,
    fields: {
      occurredAt: occurredAt(raw.occurredAt, sources, byId) ?? { status: "draft", value: first.capturedAt, source: first.id },
      location: location(raw.location, sources, byId) ?? { status: "gap", hint: GAP_HINT.location },
      type: incidentType(raw.type) ?? { status: "gap", hint: GAP_HINT.type },
    },
    sources,
    // Photos and voice notes travel with their Incident as Evidence.
    evidence: caps.filter((c) => c.kind === "photo" || c.kind === "voice").map((c) => c.id),
    ...(staff && { fromStaff: staff.author }),
  }
}

/** The time a Capture states: never after it was captured, and for a pasted chat, one of its lines. */
function occurredAt(raw: unknown, sources: string[], byId: Map<string, InboxCapture>): Field | null {
  if (!isObject(raw) || typeof raw.value !== "string" || !HHMM.test(raw.value)) return null
  if (typeof raw.source !== "string" || !sources.includes(raw.source)) return null
  const c = byId.get(raw.source)!
  const value = raw.value
  if (nightMinutes(value) > nightMinutes(c.capturedAt)) return null
  if (c.kind === "chat" && !(c.chatLines ?? []).some((l) => l.at === value || l.text.includes(value))) return null
  return { status: "draft", value, source: c.id }
}

/** Only from words in a Capture: the AI never reads a photo. */
function location(raw: unknown, sources: string[], byId: Map<string, InboxCapture>): Field | null {
  if (!isObject(raw) || typeof raw.value !== "string" || !raw.value.trim()) return null
  if (typeof raw.source !== "string" || !sources.includes(raw.source)) return null
  const quote = typeof raw.quote === "string" ? raw.quote.trim().toLowerCase() : ""
  const c = byId.get(raw.source)!
  const words = [c.text, ...(c.chatLines ?? []).map((l) => l.text)].join("\n").toLowerCase()
  if (quote.length < 3 || !words.includes(quote)) return null
  const value = raw.value.trim()
  return { status: "draft", value: LOCATIONS.find((l) => l.toLowerCase() === value.toLowerCase()) ?? value, source: c.id }
}

/** From the fixed list; anything else is Other, in the model's words. */
function incidentType(raw: unknown): Field | null {
  if (!isObject(raw) || typeof raw.value !== "string" || !raw.value.trim()) return null
  const value = raw.value.trim()
  const listed = INCIDENT_TYPES.find((t) => t.toLowerCase() === value.toLowerCase())
  const other = typeof raw.other === "string" ? raw.other.trim() : ""
  if (listed === "Other") return other ? { status: "draft", value: `Other: ${other}` } : null
  return { status: "draft", value: listed ?? `Other: ${value}` }
}

function sectionOf(raw: unknown): SectionId {
  const key = typeof raw === "string" ? raw.trim().toLowerCase() : ""
  return SECTIONS.find((s) => s.id === key || s.name.toLowerCase() === key)?.id ?? "overview"
}

function alreadyIn(r: Report, captureId: string, section: SectionId) {
  const c = r.captures.find((x) => x.id === captureId)
  if (c?.applied.includes(section)) return true
  return section === "incidents"
    ? r.incidents.some((i) => i.sources.includes(captureId))
    : r.blocks.some((b) => b.section === section && b.sources.includes(captureId))
}

function firstSentence(t: string) {
  const s = t.split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, "")
  return s.length > 60 ? `${s.slice(0, 57).trimEnd()}…` : s
}

function union<T>(a: T[], b: T[]) {
  return [...new Set([...a, ...b])]
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}
