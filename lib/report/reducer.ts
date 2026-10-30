// The report reducer: every change the Closing Manager makes is one Action.

import { applyEnhance } from "./enhance"
import { applyExtract } from "./extract"
import { clockLabel, freeId, gapsIn } from "./derived"
import { readiness } from "./readiness"
import { seedReport } from "./seed"
import { nightMinutes } from "./catalog"
import type { Action, Incident, InboxCapture, Report } from "./types"

/**
 * Dismiss hides a New Capture (story 20). If part of it is already in the report, Dismiss covers only the rest:
 * what was left to draft is dropped, so it counts as In report, stays cited and is never marked dismissed.
 */
function dismiss(c: InboxCapture, undo?: boolean): InboxCapture {
  if (undo) return { ...c, dismissed: false }
  if (c.applied.length > 0) return { ...c, found: [...c.applied] }
  return { ...c, dismissed: true }
}

const tick = (r: Report): Report => ({ ...r, clock: r.clock + 1 })

/** The reviewer statement the Closing Manager ticks at Submission (story 54). */
export const REVIEW_STATEMENT = "I reviewed this report and it matches what I remember."

export function reducer(r: Report, a: Action): Report {
  // A submitted report is locked (story 56): only Reset (a fresh demo scene) changes it.
  if (r.submittedAt && a.type !== "reset") return r
  switch (a.type) {
    case "startDrafting":
      return { ...r, drafted: true, captures: r.captures.map((c) => (a.ids.includes(c.id) ? { ...c, drafting: true } : c)) }
    case "extracted":
      return applyExtract(r, a.result)
    case "draftFailed":
      return { ...r, captures: r.captures.map((c) => (a.ids.includes(c.id) ? { ...c, drafting: false } : c)) }
    case "dismiss":
      return { ...r, captures: r.captures.map((c) => (c.id === a.id ? dismiss(c, a.undo) : c)) }
    case "handled":
      return { ...r, captures: r.captures.map((c) => (c.id === a.id ? { ...c, handled: true } : c)) }
    case "addCapture": {
      const id = freeId(`m${r.captures.length + 1}`, r.captures)
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
              : // An unchecked Enhance result must be kept or discarded before the Incident can be confirmed.
                gapsIn(i) === 0 && i.descriptionDraft === undefined
                ? { ...i, confirmedAt: clockLabel(r) }
                : i,
        ),
      })
    case "deleteIncident": {
      // Its Capture goes back to New (story 40), or to "Draft the rest" if it also fed a Section.
      const gone = r.incidents.find((i) => i.id === a.incident)
      return {
        ...r,
        incidents: r.incidents.filter((i) => i.id !== a.incident),
        captures: r.captures.map((c) =>
          gone?.sources.includes(c.id) ? { ...c, applied: c.applied.filter((s) => s !== "incidents") } : c,
        ),
      }
    }
    case "addIncident": {
      const incident: Incident = {
        id: freeId(`i-m${r.incidents.length + 1}`, r.incidents),
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
    case "keepAll":
      return {
        ...r,
        blocks: r.blocks.map((b) => (b.status === "draft" ? { ...b, status: "kept" } : b)),
        incidents: r.incidents.map((i) =>
          i.descriptionDraft !== undefined ? { ...i, description: i.descriptionDraft, descriptionDraft: undefined } : i,
        ),
      }
    case "discard":
      return {
        ...r,
        blocks: r.blocks.flatMap((b) =>
          b.id !== a.block ? [b] : b.original ? [{ ...b, ...b.original, original: undefined }] : [],
        ),
      }
    case "enhanced":
      return applyEnhance(r, a.result)
    case "keepIncidentDraft":
      return {
        ...r,
        incidents: r.incidents.map((i) =>
          i.id === a.incident && i.descriptionDraft !== undefined
            ? { ...i, description: i.descriptionDraft, descriptionDraft: undefined }
            : i,
        ),
      }
    case "discardIncidentDraft":
      return {
        ...r,
        incidents: r.incidents.map((i) => (i.id === a.incident ? { ...i, descriptionDraft: undefined } : i)),
      }
    case "receive": {
      const fresh = a.captures.filter((p) => !r.captures.some((c) => c.id === p.id))
      if (!fresh.length) return r
      const added: InboxCapture[] = fresh.map(({ photo, ...p }) => ({
        ...p,
        applied: [],
        fromPhone: true,
        ...(photo && { photo: "upload" as const }),
      }))
      const latest = Math.max(r.clock, ...fresh.map((p) => nightMinutes(p.capturedAt) + 1))
      return { ...r, captures: [...r.captures, ...added], clock: latest }
    }
    case "invited":
      return r.invited ? r : { ...r, invited: true }
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
        blocks: [...r.blocks, { id: freeId(`b-w${r.blocks.length + 1}`, r.blocks), section: a.section, text: a.text, status: "manual", sources: [] }],
      }
    case "toggleSection":
      return {
        ...r,
        visible: r.visible.includes(a.section) ? r.visible.filter((s) => s !== a.section) : [...r.visible, a.section],
      }
    case "submit":
      return readiness(r, { statement: a.statement }).ready
        ? { ...r, submittedAt: clockLabel(r), submittedBy: r.manager, statement: REVIEW_STATEMENT, aiAssisted: true }
        : r
    case "reset":
      return seedReport(a.scene)
  }
}
