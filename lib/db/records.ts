// Report ⇄ table rows. Pure: no DB access, so it is tested like the domain module.
// Provenance is spelled out on the way in (ADR 0003) and folded back into the domain's
// statuses on the way out.

import type { Block, Field, Incident, InboxCapture, IncidentField, Report } from "../report"
import type { blocks, captures, CaptureUse, FieldRecord, incidents, Provenance, reports } from "./schema"

export type Records = {
  report: Omit<typeof reports.$inferInsert, "updatedAt">
  captures: (typeof captures.$inferSelect)[]
  incidents: (typeof incidents.$inferSelect)[]
  blocks: (typeof blocks.$inferSelect)[]
}

const FIELDS: IncidentField[] = ["occurredAt", "location", "type"]

const BLOCK_PROVENANCE = { draft: "ai-drafted", kept: "kept", manual: "manager-entered" } as const satisfies Record<
  Block["status"],
  Provenance
>
const BLOCK_STATUS = { "ai-drafted": "draft", kept: "kept", "manager-entered": "manual" } as const

function fieldRecord(f: Field, confirmed: boolean): FieldRecord {
  switch (f.status) {
    case "draft":
      return { state: "value", value: f.value, provenance: confirmed ? "confirmed" : "ai-drafted", sources: f.source ? [f.source] : [] }
    case "filled":
      return { state: "value", value: f.value, provenance: "manager-entered", sources: [] }
    case "unknown":
      return { state: "unknown", provenance: "manager-entered", sources: [] }
    case "gap":
      return { state: "gap", sources: [], ...(f.hint !== undefined && { hint: f.hint }) }
    case "empty":
      return { state: "empty", sources: [] }
  }
}

function field(rec: FieldRecord): Field {
  switch (rec.state) {
    case "value":
      return rec.provenance === "manager-entered"
        ? { status: "filled", value: rec.value ?? "" }
        : { status: "draft", value: rec.value ?? "", ...(rec.sources[0] && { source: rec.sources[0] }) }
    case "unknown":
      return { status: "unknown" }
    case "gap":
      return { status: "gap", ...(rec.hint !== undefined && { hint: rec.hint }) }
    case "empty":
      return { status: "empty" }
  }
}

export function toRecords(r: Report, demoId = ""): Records {
  return {
    report: {
      demoId,
      scene: r.scene,
      venue: r.venue,
      night: r.night,
      startedAt: r.startedAt,
      manager: r.manager,
      visible: r.visible,
      invited: r.invited,
      drafted: r.drafted,
      clock: r.clock,
      submittedAt: r.submittedAt ?? null,
      submittedBy: r.submittedBy ?? null,
      statement: r.statement ?? null,
      aiAssisted: !!r.aiAssisted,
      captureUse: Object.fromEntries(
        r.captures.map((c): [string, CaptureUse] => [c.id, { applied: c.applied, ...(c.found && { found: c.found }) }]),
      ),
    },
    captures: r.captures.map((c, position) => ({
      demoId,
      id: c.id,
      position,
      kind: c.kind,
      capturedAt: c.capturedAt,
      author: c.author,
      text: c.text,
      chatLines: c.chatLines ?? null,
      photo: c.photo ?? null,
      fromPhone: !!c.fromPhone,
      device: null,
      dismissed: !!c.dismissed,
      handled: !!c.handled,
    })),
    incidents: r.incidents.map((i, position) => {
      const confirmed = !!i.confirmedAt
      const [occurredAt, location, type] = FIELDS.map((f) => fieldRecord(i.fields[f], confirmed))
      return {
        demoId,
        id: i.id,
        position,
        provenance: i.manual ? "manager-entered" : confirmed ? "confirmed" : "ai-drafted",
        title: i.title,
        description: i.description,
        descriptionDraft: i.descriptionDraft ?? null,
        occurredAt,
        location,
        type,
        capturedAt: i.capturedAt,
        confirmedAt: i.confirmedAt ?? null,
        sources: i.sources,
        evidence: i.evidence,
        fromStaff: i.fromStaff ?? null,
        manual: !!i.manual,
      }
    }),
    blocks: r.blocks.map((b, position) => ({
      demoId,
      id: b.id,
      position,
      section: b.section,
      text: b.text,
      provenance: BLOCK_PROVENANCE[b.status],
      sources: b.sources,
      original: b.original
        ? { text: b.original.text, provenance: BLOCK_PROVENANCE[b.original.status] as "manager-entered" | "kept" }
        : null,
    })),
  }
}

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position

export function fromRecords(rec: Records): Report {
  const r = rec.report
  return {
    venue: r.venue,
    night: r.night,
    scene: r.scene,
    startedAt: r.startedAt,
    manager: r.manager,
    captures: [...rec.captures].sort(byPosition).map((c): InboxCapture => {
      const use = r.captureUse[c.id] ?? { applied: [] }
      return {
        id: c.id,
        kind: c.kind,
        capturedAt: c.capturedAt,
        author: c.author,
        text: c.text,
        ...(c.chatLines && { chatLines: c.chatLines }),
        applied: use.applied,
        ...(use.found && { found: use.found }),
        ...(c.dismissed && { dismissed: true }),
        ...(c.handled && { handled: true }),
        ...(c.photo && { photo: c.photo }),
        ...(c.fromPhone && { fromPhone: true }),
      }
    }),
    blocks: [...rec.blocks].sort(byPosition).map(
      (b): Block => ({
        id: b.id,
        section: b.section,
        text: b.text,
        status: BLOCK_STATUS[b.provenance],
        sources: b.sources,
        ...(b.original && {
          original: { text: b.original.text, status: BLOCK_STATUS[b.original.provenance] as "manual" | "kept" },
        }),
      }),
    ),
    incidents: [...rec.incidents].sort(byPosition).map(
      (i): Incident => ({
        id: i.id,
        title: i.title,
        capturedAt: i.capturedAt,
        fields: { occurredAt: field(i.occurredAt), location: field(i.location), type: field(i.type) },
        description: i.description,
        sources: i.sources,
        evidence: i.evidence,
        ...(i.fromStaff && { fromStaff: i.fromStaff }),
        ...(i.manual && { manual: true }),
        ...(i.confirmedAt && { confirmedAt: i.confirmedAt }),
        ...(i.descriptionDraft !== null && { descriptionDraft: i.descriptionDraft }),
      }),
    ),
    visible: r.visible,
    ...(r.submittedAt && { submittedAt: r.submittedAt }),
    ...(r.submittedBy && { submittedBy: r.submittedBy }),
    ...(r.statement && { statement: r.statement }),
    ...(r.aiAssisted && { aiAssisted: true }),
    invited: r.invited,
    drafted: r.drafted,
    clock: r.clock,
  }
}
