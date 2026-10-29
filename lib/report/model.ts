// The model behind Extract and Enhance, injected so the rules can be tested with a fake
// (spec, "Report domain module"). Its answers are untrusted: the domain checks every one.

import type { Capture, SectionId } from "./types"

/** What the model sees of a Capture: its words, author and time. Never a photo's contents. */
export type ModelCapture = Pick<Capture, "id" | "kind" | "capturedAt" | "author" | "text" | "chatLines">

export type ExtractRequest = {
  captures: ModelCapture[]
  sections: { id: Exclude<SectionId, "incidents">; name: string }[]
  incidentTypes: string[]
  locations: string[]
  /** Set when the Closing Manager drafts one Section: only its Drafts are kept. */
  focus?: SectionId
}

export type EnhanceRequest = {
  /** The span to rewrite, in the manager's own words. */
  text: string
  /** Whether the span starts / ends a sentence, so a mid-sentence span isn't capitalised or closed. */
  start: boolean
  end: boolean
}

/**
 * The answer Extract asks for. Anything else (missing fields, unknown ids, off-list values)
 * is cleaned up or dropped by the rules in extract.ts.
 *
 * { drafts: [
 *   { kind: "section", section: "<id or name>", text, sources: [captureId] },
 *   { kind: "incident", title, description, sources: [captureId],
 *     occurredAt?: { value: "HH:MM", source },
 *     location?: { value, source, quote: "<the words in the Capture that say where>" },
 *     type?: { value: "<one of incidentTypes>", other?: "<own words when Other>" } },
 * ] }
 */
export type ExtractOutput = { drafts: unknown[] }

export type EnhanceOutput = { text: string }

export interface ReportModel {
  extract(request: ExtractRequest): Promise<unknown>
  enhance(request: EnhanceRequest): Promise<unknown>
}
