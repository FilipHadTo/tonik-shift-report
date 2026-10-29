// Submission readiness: what still stands between the report and Submit.

import { orderedIncidents, openDrafts } from "./derived"
import type { IncidentField, Report } from "./types"

export type Blocker =
  /** Not confirmed yet, with the Gaps that stop the Confirm and any Enhance Draft pending inside. */
  | { kind: "incident"; id: string; missing: IncidentField[]; pendingEnhance: boolean }
  /** Section Drafts and Enhance results nobody kept or discarded. */
  | { kind: "drafts"; ids: string[] }
  /** The reviewer statement isn't ticked. */
  | { kind: "statement" }

export type Readiness = { ready: true } | { ready: false; blockers: Blocker[] }

export function readiness(r: Report, { statement }: { statement: boolean }): Readiness {
  const blockers: Blocker[] = orderedIncidents(r)
    .filter((i) => !i.confirmedAt)
    .map((i) => ({
      kind: "incident",
      id: i.id,
      missing: (Object.keys(i.fields) as IncidentField[]).filter((f) => ["gap", "empty"].includes(i.fields[f].status)),
      pendingEnhance: i.descriptionDraft !== undefined,
    }))
  const drafts = openDrafts(r)
  if (drafts.length) blockers.push({ kind: "drafts", ids: drafts })
  if (!statement) blockers.push({ kind: "statement" })
  return blockers.length ? { ready: false, blockers } : { ready: true }
}
