// PROTOTYPE — throwaway. In-memory state for the inbox + editor Report screen mock.
// Nothing runs in the background: a Capture only reaches the report when the
// Closing Manager drafts it (per Capture, per Section or all at once) or marks it
// as added by hand. The "AI" here is a scripted lookup, not a model.

import {
  INCIDENT_TYPES,
  LOCATIONS,
  nightMinutes,
  type Author,
  type Capture,
} from "../_lib/demo-night"

export { INCIDENT_TYPES, LOCATIONS, nightMinutes }
export type { Author, Capture }

export type SectionId =
  | "overview"
  | "incidents"
  | "audience"
  | "security"
  | "artist"
  | "door"
  | "production"
  | "bar"
  | "kitchen"
  | "vendors"
  | "private"
  | "maintenance"
  | "inventory"

export const SECTIONS: { id: SectionId; name: string }[] = [
  { id: "overview", name: "General overview" },
  { id: "incidents", name: "Incidents" },
  { id: "audience", name: "Audience" },
  { id: "security", name: "Security" },
  { id: "artist", name: "Artist & crew" },
  { id: "door", name: "Door staff" },
  { id: "production", name: "Production / run of show" },
  { id: "bar", name: "Bar staff" },
  { id: "kitchen", name: "Kitchen" },
  { id: "vendors", name: "Third-party vendors" },
  { id: "private", name: "Private events" },
  { id: "maintenance", name: "Maintenance / equipment" },
  { id: "inventory", name: "Inventory" },
]

export const DEFAULT_VISIBLE: SectionId[] = ["overview", "incidents", "security", "maintenance"]

export type InboxCapture = Capture & {
  /** Sections this Capture has already been drafted into. */
  applied: SectionId[]
  dismissed?: boolean
  /** Manager rewrote it by hand and marked it as in the report. */
  handled?: boolean
  drafting?: boolean
  photo?: "window"
}

export type Block = {
  id: string
  section: SectionId
  text: string
  /** draft = AI wrote it, unchecked. kept = AI draft the manager kept. manual = typed by the manager. */
  status: "draft" | "kept" | "manual"
  sources: string[]
}

export type Field =
  | { status: "draft"; value: string }
  | { status: "filled"; value: string }
  | { status: "gap"; hint?: string }
  | { status: "empty" }
  | { status: "unknown" }

export type IncidentField = "occurredAt" | "location" | "type"

export type Incident = {
  id: string
  title: string
  capturedAt: string
  fields: Record<IncidentField, Field>
  description: string
  sources: string[]
  evidence: string[]
  fromStaff?: Author
  manual?: boolean
  confirmedAt?: string
}

export type Report = {
  venue: string
  night: string
  openedAt: string
  manager: Author
  captures: InboxCapture[]
  blocks: Block[]
  incidents: Incident[]
  visible: SectionId[]
  submittedAt?: string
  clock: number
}

const alex: Author = { name: "Alex Morgan", role: "Closing Manager" }
const marek: Author = { name: "Marek", role: "Door" }
const jess: Author = { name: "Jess", role: "Bar" }

// What "drafting" a Capture produces, per Section. Scripted for the demo Night.
type Effect =
  | { section: "incidents"; incident: Omit<Incident, "sources"> }
  | { section: Exclude<SectionId, "incidents">; text: string }

const EFFECTS: Record<string, Effect[]> = {
  c1: [
    {
      section: "incidents",
      incident: {
        id: "i-c1",
        title: "Broken window",
        capturedAt: "23:40",
        fields: {
          occurredAt: { status: "draft", value: "23:40" },
          location: { status: "gap", hint: "The photo shows a window. No Capture says which one." },
          type: { status: "draft", value: "Property damage" },
        },
        description: "Window found smashed with glass on the floor. Area taped off.",
        evidence: ["c1"],
      },
    },
    { section: "maintenance", text: "Window smashed, glass on the floor. Taped off, needs a glazier." },
  ],
  c2: [
    {
      section: "incidents",
      incident: {
        id: "i-c2",
        title: "Refused re-entry, bottle thrown",
        capturedAt: "00:52",
        fields: {
          occurredAt: { status: "draft", value: "00:45" },
          location: { status: "draft", value: "Front door" },
          type: { status: "draft", value: "Ejection/refused entry" },
        },
        description:
          "Previously ejected guest (grey hoodie) refused re-entry. Became aggressive and threw a bottle at the queue barrier, then left towards the high street.",
        evidence: [],
        fromStaff: marek,
      },
    },
  ],
  c3: [
    {
      section: "incidents",
      incident: {
        id: "i-c3",
        title: "Fight at the main bar",
        capturedAt: "01:15",
        fields: {
          occurredAt: { status: "draft", value: "01:10" },
          location: { status: "draft", value: "Main bar" },
          type: { status: "draft", value: "Fight/assault" },
        },
        description:
          "Two male guests fought at the main bar. Security (Tom, Kuba) separated them. One had a cut lip, was given ice and left with friends. Police not called.",
        evidence: ["c3"],
      },
    },
  ],
  c4: [
    {
      section: "incidents",
      incident: {
        id: "i-c4",
        title: "Phone stolen from cloakroom",
        capturedAt: "02:10",
        fields: {
          occurredAt: { status: "gap", hint: "The chat says “sometime before midnight she thinks?” That isn't a time." },
          location: { status: "draft", value: "Cloakroom" },
          type: { status: "draft", value: "Theft" },
        },
        description:
          "Guest reported her phone stolen from her coat in the cloakroom. Manager took her number and advised her to report it to police.",
        evidence: [],
      },
    },
    {
      section: "overview",
      text: "Busy night, front of stage at capacity around midnight. DJ started 20 minutes late. No police attendance.",
    },
    { section: "security", text: "Second barrier opened at 00:12 for the crowd at the front of stage. Building clear by 02:05." },
    { section: "production", text: "DJ running 20 minutes late." },
    { section: "maintenance", text: "Ice machine leaking again (Jess, 22:58)." },
  ],
  c6: [{ section: "inventory", text: "Aperol ran out around 01:00. Two cases needed before Friday." }],
}

// Typed Captures without a script land in the Section their words point to.
const KEYWORDS: [Exclude<SectionId, "incidents">, RegExp][] = [
  ["kitchen", /kitchen|chef|food/i],
  ["bar", /\bbar\b|bartender|till/i],
  ["door", /door|queue|entry|guest ?list/i],
  ["security", /security|barrier|bouncer/i],
  ["artist", /\bdj\b|artist|band|crew|rider/i],
  ["maintenance", /leak|broken|repair|machine|light|toilet/i],
  ["inventory", /stock|ran out|run out|cases|crates|keg/i],
]

export function effectsOf(c: InboxCapture): Effect[] {
  if (EFFECTS[c.id]) return EFFECTS[c.id]
  const section = KEYWORDS.find(([, re]) => re.test(c.text))?.[0] ?? "overview"
  return [{ section, text: sentence(c.text) }]
}

function sentence(t: string) {
  const s = t.trim()
  return s.charAt(0).toUpperCase() + s.slice(1) + (/[.!?]$/.test(s) ? "" : ".")
}

export function seedReport(): Report {
  const captures: InboxCapture[] = [
    {
      id: "c1",
      kind: "photo",
      capturedAt: "23:40",
      author: alex,
      text: "window smashed, glass on the floor, taped it off",
      photo: "window",
      applied: [],
    },
    {
      id: "c2",
      kind: "text",
      capturedAt: "00:52",
      author: marek,
      text: "Refused re-entry to guy in grey hoodie, already thrown out once. Very aggressive, threw a bottle at the queue barrier. Walked off towards the high street ~00:45",
      applied: [],
    },
    {
      id: "c6",
      kind: "text",
      capturedAt: "01:05",
      author: jess,
      text: "we're out of aperol since about 1. need 2 cases before friday pls",
      applied: [],
    },
    {
      id: "c3",
      kind: "voice",
      capturedAt: "01:15",
      author: alex,
      text: "Fight at the main bar like five minutes ago, two guys, Tom and Kuba split them up. One had a cut lip, we gave him ice, he left with his mates. No police.",
      applied: [],
    },
    {
      id: "c4",
      kind: "chat",
      capturedAt: "02:10",
      author: alex,
      text: "Halo staff group",
      chatLines: [
        { at: "22:58", who: "Jess", text: "ice machine leaking again 🙃" },
        { at: "00:12", who: "Tom", text: "front of stage is packed, opening 2nd barrier" },
        { at: "00:31", who: "Alex", text: "ok. dj running 20 min late btw" },
        { at: "01:42", who: "Jess", text: "girl at cloakroom says her phone got nicked from her coat. sometime before midnight she thinks?" },
        { at: "01:44", who: "Alex", text: "took her number, told her to report it" },
        { at: "02:05", who: "Tom", text: "all clear inside, last ones out" },
      ],
      applied: [],
    },
  ]

  let r: Report = {
    venue: "Halo Club",
    night: "Sat 24 Oct",
    openedAt: "23:40",
    manager: alex,
    captures,
    blocks: [
      {
        id: "b-sec-1",
        section: "security",
        text: "Two security short until 22:00. Kuba covered the side door.",
        status: "manual",
        sources: [],
      },
    ],
    incidents: [],
    visible: [...DEFAULT_VISIBLE],
    clock: 15,
  }
  // State at 02:15: Alex already drafted two Captures and confirmed one Incident.
  r = applyCapture(r, "c1")
  r = applyCapture(r, "c3")
  r = { ...r, incidents: r.incidents.map((i) => (i.id === "i-c3" ? { ...i, confirmedAt: "02:09" } : i)) }
  return r
}

// --- derived ---

export type CaptureStatus = "new" | "drafting" | "drafted" | "in-report" | "dismissed"

export function statusOf(r: Report, c: InboxCapture): CaptureStatus {
  if (c.dismissed) return "dismissed"
  if (c.drafting) return "drafting"
  if (c.handled) return "in-report"
  if (c.applied.length === 0) return "new"
  const open =
    r.incidents.some((i) => i.sources.includes(c.id) && !i.confirmedAt) ||
    r.blocks.some((b) => b.sources.includes(c.id) && b.status === "draft")
  return open ? "drafted" : "in-report"
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

export function pendingSectionsOf(c: InboxCapture) {
  return effectsOf(c)
    .map((e) => e.section)
    .filter((s) => !c.applied.includes(s))
}

export function orderedIncidents(r: Report) {
  return [...r.incidents].sort((a, b) => nightMinutes(a.capturedAt) - nightMinutes(b.capturedAt))
}

export function gapsIn(i: Incident) {
  return (Object.values(i.fields) as Field[]).filter((f) => f.status === "gap" || f.status === "empty").length
}

export function blockers(r: Report) {
  const unconfirmed = r.incidents.filter((i) => !i.confirmedAt)
  const gaps = r.incidents.reduce((n, i) => n + gapsIn(i), 0)
  return { unconfirmed: unconfirmed.length, gaps, ready: unconfirmed.length === 0 && gaps === 0 }
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
    (c) => !c.dismissed && !c.handled && !c.drafting && pendingSectionsOf(c).includes(id),
  )
}

export function clockLabel(r: Report) {
  return `02:${String(r.clock).padStart(2, "0")}`
}

// --- actions ---

export type Action =
  | { type: "startDrafting"; ids: string[] }
  | { type: "draft"; ids: string[]; only?: SectionId }
  | { type: "dismiss"; id: string; undo?: boolean }
  | { type: "handled"; id: string }
  | { type: "addCapture"; text: string }
  | { type: "setField"; incident: string; field: IncidentField; value: string | null }
  | { type: "editIncident"; incident: string; patch: Partial<Pick<Incident, "title" | "description">> }
  | { type: "confirm"; incident: string; undo?: boolean }
  | { type: "deleteIncident"; incident: string }
  | { type: "addIncident" }
  | { type: "keep"; block: string }
  | { type: "discard"; block: string }
  | { type: "editBlock"; block: string; text: string }
  | { type: "write"; section: SectionId; text: string }
  | { type: "toggleSection"; section: SectionId }
  | { type: "submit" }
  | { type: "reset" }

function applyCapture(r: Report, id: string, only?: SectionId): Report {
  const c = r.captures.find((x) => x.id === id)
  if (!c) return r
  const todo = effectsOf(c).filter((e) => !c.applied.includes(e.section) && (!only || e.section === only))
  let next = r
  for (const e of todo) {
    if (e.section === "incidents") {
      next = { ...next, incidents: [...next.incidents, { ...e.incident, sources: [c.id] }] }
    } else {
      const block: Block = { id: `b-${c.id}-${e.section}`, section: e.section, text: e.text, status: "draft", sources: [c.id] }
      next = { ...next, blocks: [...next.blocks, block] }
    }
    if (!next.visible.includes(e.section)) next = { ...next, visible: [...next.visible, e.section] }
  }
  const applied = [...c.applied, ...todo.map((e) => e.section)]
  return {
    ...next,
    captures: next.captures.map((x) => (x.id === id ? { ...x, applied, drafting: false } : x)),
  }
}

const tick = (r: Report): Report => ({ ...r, clock: r.clock + 1 })

export function reducer(r: Report, a: Action): Report {
  switch (a.type) {
    case "startDrafting":
      return { ...r, captures: r.captures.map((c) => (a.ids.includes(c.id) ? { ...c, drafting: true } : c)) }
    case "draft":
      return a.ids.reduce((acc, id) => applyCapture(acc, id, a.only), r)
    case "dismiss":
      return { ...r, captures: r.captures.map((c) => (c.id === a.id ? { ...c, dismissed: !a.undo } : c)) }
    case "handled":
      return { ...r, captures: r.captures.map((c) => (c.id === a.id ? { ...c, handled: true } : c)) }
    case "addCapture": {
      const id = `m${r.captures.length + 1}`
      const capture: InboxCapture = { id, kind: "text", capturedAt: clockLabel(r), author: r.manager, text: a.text, applied: [] }
      return tick({ ...r, captures: [...r.captures, capture] })
    }
    case "setField":
      return {
        ...r,
        incidents: r.incidents.map((i) =>
          i.id !== a.incident
            ? i
            : {
                ...i,
                fields: {
                  ...i.fields,
                  [a.field]: a.value === null ? { status: "unknown" } : { status: "filled", value: a.value },
                },
              },
        ),
      }
    case "editIncident":
      return { ...r, incidents: r.incidents.map((i) => (i.id === a.incident ? { ...i, ...a.patch } : i)) }
    case "confirm":
      return tick({
        ...r,
        incidents: r.incidents.map((i) =>
          i.id !== a.incident
            ? i
            : a.undo
              ? { ...i, confirmedAt: undefined }
              : gapsIn(i) === 0
                ? { ...i, confirmedAt: clockLabel(r) }
                : i,
        ),
      })
    case "deleteIncident":
      return { ...r, incidents: r.incidents.filter((i) => i.id !== a.incident) }
    case "addIncident": {
      const incident: Incident = {
        id: `i-m${r.incidents.length + 1}`,
        title: "",
        capturedAt: clockLabel(r),
        fields: { occurredAt: { status: "empty" }, location: { status: "empty" }, type: { status: "empty" } },
        description: "",
        sources: [],
        evidence: [],
        manual: true,
      }
      return { ...r, incidents: [...r.incidents, incident] }
    }
    case "keep":
      return { ...r, blocks: r.blocks.map((b) => (b.id === a.block ? { ...b, status: "kept" } : b)) }
    case "discard":
      return { ...r, blocks: r.blocks.filter((b) => b.id !== a.block) }
    case "editBlock":
      return {
        ...r,
        blocks: a.text.trim()
          ? r.blocks.map((b) =>
              b.id === a.block ? { ...b, text: a.text, status: b.status === "draft" ? "kept" : b.status } : b,
            )
          : r.blocks.filter((b) => b.id !== a.block),
      }
    case "write":
      return {
        ...r,
        blocks: [...r.blocks, { id: `b-w${r.blocks.length + 1}`, section: a.section, text: a.text, status: "manual", sources: [] }],
      }
    case "toggleSection":
      return {
        ...r,
        visible: r.visible.includes(a.section) ? r.visible.filter((s) => s !== a.section) : [...r.visible, a.section],
      }
    case "submit":
      return blockers(r).ready ? { ...r, submittedAt: clockLabel(r) } : r
    case "reset":
      return seedReport()
  }
}
