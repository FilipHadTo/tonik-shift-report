// What Gemini is told for Extract: the rules as instructions, the Captures as data, and the answer's
// shape as a JSON schema. Pure, so it can be tested without the network. The domain still checks
// every answer (lib/report/extract.ts); this only makes good answers likely.

import type { ExtractRequest } from "../report"

export const EXTRACT_INSTRUCTIONS = `You draft a nightclub's end-of-night Shift Report from Captures: short notes, photo captions, voice notes and pasted group chats written by the Closing Manager and staff during the Night.

Turn the Captures into Drafts the Closing Manager will review:
- "incident": something that happened to people or property that the venue must record (fight, injury, theft, ejection or refused entry, damage, drugs, intoxication, harassment, police called). One Incident per event, even if several Captures mention it.
- "section": operational notes for one Section of the report (staffing, stock, maintenance, music, door, bar, kitchen, security, general overview). Group a Capture's notes for the same Section into one short paragraph.
A Capture can give both, e.g. a smashed window is an Incident and a maintenance note.

Rules:
- Use only what the Captures say. Never invent people, numbers, times, places or outcomes. Nothing in a photo is visible to you: a photo Capture is only its caption.
- Every Draft lists in "sources" the ids of the Captures it comes from.
- Write plain, neutral, factual English in the past tense, third person. Fix spelling and slang, keep names. Incident "title" is a few words; "description" says what happened, who was involved and how it ended.
- "occurredAt" is the time the event happened as HH:MM (24h), only if a Capture states it: an explicit time ("~00:45"), a relative one from its Captured-at ("five minutes ago"), or, in a pasted chat, the timestamp of the line that reports it. Never later than the Capture's Captured-at. Leave it out when nothing says when.
- "location": only if a Capture's words say where. "quote" is those exact words copied from the Capture; "value" is the matching place from the venue's locations, or a short name if none matches. Leave it out when no words say where.
- "type": one of the Incident types. Use "Other" with "other" in a few words if none fits. Leave it out when nothing says what kind of Incident it was.
- Leave out any field you are unsure of: the report shows it as a gap for the manager to fill. A missing field is better than a guess.
- "section" is one of the Section ids given.`

/** The request as the data part of the prompt. Captures carry their words, author and time only. */
export function extractPrompt(request: ExtractRequest) {
  const data = {
    sections: request.sections,
    incidentTypes: request.incidentTypes,
    locations: request.locations,
    captures: request.captures.map((c) => ({
      id: c.id,
      kind: c.kind,
      capturedAt: c.capturedAt,
      author: `${c.author.name} (${c.author.role})`,
      text: c.text,
      ...(c.chatLines && { chatLines: c.chatLines.map((l) => ({ at: l.at, who: l.who, text: l.text })) }),
    })),
  }
  const focus = !request.focus
    ? ""
    : request.focus === "incidents"
      ? "\n\nOnly Incidents are needed now."
      : `\n\nOnly Drafts for the "${request.focus}" Section are needed now.`
  return `Draft the report from these Captures.${focus}\n\n${JSON.stringify(data, null, 2)}`
}

/** The answer's shape (ExtractOutput in lib/report/model.ts), with ids and lists pinned to this request. */
export function extractSchema(request: ExtractRequest) {
  const captureIds = request.captures.map((c) => c.id)
  const source = { type: "string", enum: captureIds }
  return {
    type: "object",
    properties: {
      drafts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["incident", "section"] },
            sources: { type: "array", items: source, minItems: 1 },
            section: { type: "string", enum: request.sections.map((s) => s.id), description: "Section Drafts only" },
            text: { type: "string", description: "Section Drafts only" },
            title: { type: "string", description: "Incidents only" },
            description: { type: "string", description: "Incidents only" },
            occurredAt: {
              type: "object",
              properties: { value: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }, source },
              required: ["value", "source"],
            },
            location: {
              type: "object",
              properties: { value: { type: "string" }, source, quote: { type: "string" } },
              required: ["value", "source", "quote"],
            },
            type: {
              type: "object",
              properties: { value: { type: "string", enum: request.incidentTypes }, other: { type: "string" } },
              required: ["value"],
            },
          },
          required: ["kind", "sources"],
        },
      },
    },
    required: ["drafts"],
  }
}
