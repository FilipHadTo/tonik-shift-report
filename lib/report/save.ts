// Saving manager actions (ticket 09): the browser sends what the Closing Manager did, the server
// checks it here and applies the same rules to the stored report, so nothing can bypass them.

import { SECTIONS, type IncidentField } from "./catalog"
import { gapsIn } from "./derived"
import { canEnhance, runEnhance, type EnhanceSpan, type EnhanceTarget } from "./enhance"
import { capturesInScope, runExtract, type ExtractScope } from "./extract"
import type { ReportModel } from "./model"
import { reducer } from "./reducer"
import type { Action, Report, SectionId } from "./types"

/**
 * An action the browser may ask the server to save. AI results are never taken from the browser:
 * Draft and Enhance are sent as requests and the server runs the model itself. Reset goes through
 * the reseed route; the transient drafting flags are never saved. Phone Captures come in only through the
 * capture route, which stamps them itself (see phone.ts), so `receive` is never taken from the browser.
 */
export type SaveAction =
  | Exclude<Action, { type: "startDrafting" | "draftFailed" | "extracted" | "enhanced" | "receive" | "reset" }>
  | { type: "draft"; scope: ExtractScope }
  | { type: "enhance"; target: EnhanceTarget; text?: string; span?: EnhanceSpan }

export type Saved = { ok: true; report: Report } | { ok: false }

const SECTION_IDS = new Set<string>(SECTIONS.map((s) => s.id))
const FIELDS = new Set<string>(["occurredAt", "location", "type"] satisfies IncidentField[])

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === "string"
const isText = (v: unknown): v is string => isStr(v) && !!v.trim()
const isSection = (v: unknown): v is SectionId => isStr(v) && SECTION_IDS.has(v)
const undo = (o: Obj) => (o.undo === true ? { undo: true } : {})

function scopeOf(v: unknown): ExtractScope | null {
  if (!isObj(v)) return null
  if (isStr(v.capture)) return { capture: v.capture }
  if (isSection(v.section)) return { section: v.section }
  if (v.all === true) return { all: true }
  return null
}

function targetOf(v: unknown): EnhanceTarget | null {
  if (!isObj(v)) return null
  if (isStr(v.block)) return { block: v.block }
  if (isStr(v.incident)) return { incident: v.incident }
  return null
}

/** The action as the browser sent it, checked field by field; null for anything else. */
export function parseSaveAction(raw: unknown): SaveAction | null {
  if (!isObj(raw)) return null
  const a = raw
  switch (a.type) {
    case "dismiss":
      return isStr(a.id) ? { type: "dismiss", id: a.id, ...undo(a) } : null
    case "handled":
      return isStr(a.id) ? { type: "handled", id: a.id } : null
    case "addCapture":
      return isText(a.text) ? { type: "addCapture", text: a.text } : null
    case "setField":
      return isStr(a.incident) && isStr(a.field) && FIELDS.has(a.field) && (a.value === null || isStr(a.value))
        ? { type: "setField", incident: a.incident, field: a.field as IncidentField, value: a.value }
        : null
    case "editIncident": {
      if (!isStr(a.incident) || !isObj(a.patch)) return null
      const keys = Object.keys(a.patch)
      if (!keys.length || keys.some((k) => !["title", "description"].includes(k) || !isStr(a.patch && (a.patch as Obj)[k])))
        return null
      return { type: "editIncident", incident: a.incident, patch: a.patch as { title?: string; description?: string } }
    }
    case "confirm":
      return isStr(a.incident) ? { type: "confirm", incident: a.incident, ...undo(a) } : null
    case "deleteIncident":
    case "keepIncidentDraft":
    case "discardIncidentDraft":
      return isStr(a.incident) ? { type: a.type, incident: a.incident } : null
    case "keep":
    case "discard":
      return isStr(a.block) ? { type: a.type, block: a.block } : null
    case "editBlock":
      return isStr(a.block) && isStr(a.text) ? { type: "editBlock", block: a.block, text: a.text } : null
    case "write":
      return isSection(a.section) && isText(a.text) ? { type: "write", section: a.section, text: a.text } : null
    case "toggleSection":
      return isSection(a.section) ? { type: "toggleSection", section: a.section } : null
    case "addIncident":
    case "keepAll":
    case "invited":
    case "submit":
      return { type: a.type }
    case "draft": {
      const scope = scopeOf(a.scope)
      return scope && { type: "draft", scope }
    }
    case "enhance": {
      const target = targetOf(a.target)
      if (!target) return null
      if (a.text !== undefined && !isStr(a.text)) return null
      if (a.span !== undefined && !(isObj(a.span) && Number.isInteger(a.span.start) && Number.isInteger(a.span.end)))
        return null
      return {
        type: "enhance",
        target,
        ...(isStr(a.text) && { text: a.text }),
        ...(isObj(a.span) && { span: { start: a.span.start as number, end: a.span.end as number } }),
      }
    }
    default:
      return null
  }
}

/** Whether the stored report allows the action. The screen only offers what passes; the server checks again. */
function allowed(r: Report, a: SaveAction): boolean {
  const capture = (id: string) => r.captures.find((c) => c.id === id)
  const incident = (id: string) => r.incidents.find((i) => i.id === id)
  const block = (id: string) => r.blocks.find((b) => b.id === id)
  const open = (id: string) => {
    const i = incident(id)
    return !!i && !i.confirmedAt
  }
  switch (a.type) {
    case "dismiss":
    case "handled":
      return !!capture(a.id)
    case "setField":
    case "editIncident":
    case "deleteIncident":
      return open(a.incident)
    case "confirm": {
      const i = incident(a.incident)
      if (!i) return false
      // Reopen until Submission; Confirm needs every Gap filled and no Enhance Draft pending (glossary, Confirmation).
      return a.undo ? !!i.confirmedAt : !i.confirmedAt && gapsIn(i) === 0 && i.descriptionDraft === undefined
    }
    case "keepIncidentDraft":
    case "discardIncidentDraft":
      return incident(a.incident)?.descriptionDraft !== undefined
    case "keep":
    case "discard":
      return block(a.block)?.status === "draft"
    case "editBlock":
      return !!block(a.block)
    case "draft":
      return capturesInScope(r, a.scope).length > 0
    case "enhance":
      return canEnhance(r, a.target)
    case "submit":
      return reducer(r, a).submittedAt !== undefined
    default:
      return true
  }
}

/** Applies a browser action to the stored report, or refuses it. Draft and Enhance run `model` here. */
export async function applySaved(r: Report, a: SaveAction, model: ReportModel): Promise<Saved> {
  if (!allowed(r, a)) return { ok: false }
  switch (a.type) {
    case "draft": {
      const ids = capturesInScope(r, a.scope).map((c) => c.id)
      const out = await runExtract(reducer(r, { type: "startDrafting", ids }), a.scope, model)
      return out.degraded ? { ok: false } : { ok: true, report: out.report }
    }
    case "enhance": {
      const out = await runEnhance(r, a.target, model, { text: a.text, span: a.span })
      return out.status === "drafted" ? { ok: true, report: out.report } : { ok: false }
    }
    default:
      return { ok: true, report: reducer(r, a) }
  }
}
