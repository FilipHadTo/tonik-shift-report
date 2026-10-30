// The fake model: recorded answers for the demo Night's Captures, a keyword router for
// anything typed during the demo, and the rule-based Enhance. E runs on it until Gemini
// (tickets 14, 15), and it stays as the canned fallback when Gemini fails (ADR 0001).

import { enhanceText } from "./enhance-text"
import type { ModelCapture, ReportModel } from "./model"
import type { SectionId } from "./types"

type Recorded = { kind: "incident" | "section"; section?: string; sources: string[] } & Record<string, unknown>

/** What the model answers for each seeded Capture, in the shape Extract asks for. */
export const RECORDED: Record<string, Recorded[]> = {
  c1: [
    {
      kind: "incident",
      title: "Broken window",
      description: "Window found smashed with glass on the floor. Area taped off.",
      sources: ["c1"],
      occurredAt: { value: "23:40", source: "c1" },
      type: { value: "Property damage" },
    },
    { kind: "section", section: "maintenance", text: "Window smashed, glass on the floor. Taped off, needs a glazier.", sources: ["c1"] },
  ],
  c2: [
    {
      kind: "incident",
      title: "Refused re-entry, bottle thrown",
      description:
        "Previously ejected guest (grey hoodie) refused re-entry. Became aggressive and threw a bottle at the queue barrier, then left towards the high street.",
      sources: ["c2"],
      occurredAt: { value: "00:45", source: "c2" },
      location: { value: "Front door", source: "c2", quote: "queue barrier" },
      type: { value: "Ejection/refused entry" },
    },
  ],
  c3: [
    {
      kind: "incident",
      title: "Fight at the main bar",
      description:
        "Two male guests fought at the main bar. Security (Tom, Kuba) separated them. One had a cut lip, was given ice and left with friends. Police not called.",
      sources: ["c3"],
      occurredAt: { value: "01:10", source: "c3" },
      location: { value: "Main bar", source: "c3", quote: "main bar" },
      type: { value: "Fight/assault" },
    },
  ],
  c4: [
    {
      kind: "incident",
      title: "Phone stolen from cloakroom",
      description:
        "Guest reported her phone stolen from her coat in the cloakroom. Manager took her number and advised her to report it to police.",
      sources: ["c4"],
      // "Before midnight" isn't a time, so Occurred-at is the line that reported it.
      occurredAt: { value: "01:42", source: "c4" },
      location: { value: "Cloakroom", source: "c4", quote: "cloakroom" },
      type: { value: "Theft" },
    },
    {
      kind: "section",
      section: "overview",
      text: "Busy night, front of stage at capacity around midnight. DJ started 20 minutes late. No police attendance.",
      sources: ["c4"],
    },
    { kind: "section", section: "security", text: "Second barrier opened at 00:12 for the crowd at the front of stage. Building clear by 02:05.", sources: ["c4"] },
    { kind: "section", section: "production", text: "DJ running 20 minutes late.", sources: ["c4"] },
    { kind: "section", section: "maintenance", text: "Ice machine leaking again (Jess, 22:58).", sources: ["c4"] },
  ],
  c6: [{ kind: "section", section: "inventory", text: "Aperol ran out around 01:00. Two cases needed before Friday.", sources: ["c6"] }],
}

// Typed Captures without a recording land in the Section their words point to.
const KEYWORDS: [Exclude<SectionId, "incidents">, RegExp][] = [
  ["kitchen", /kitchen|chef|food/i],
  ["bar", /\bbar\b|bartender|till/i],
  ["door", /door|queue|entry|guest ?list/i],
  ["security", /security|barrier|bouncer/i],
  ["artist", /\bdj\b|artist|band|crew|rider/i],
  ["maintenance", /leak|broken|repair|machine|light|toilet/i],
  ["inventory", /stock|ran out|run out|cases|crates|keg/i],
]

function routed(c: ModelCapture): Recorded[] {
  const section = KEYWORDS.find(([, re]) => re.test(c.text))?.[0] ?? "overview"
  // The AI never looks inside a photo, so a bare one only says that it exists.
  return [{ kind: "section" as const, section, text: sentence(c.text || `Photo from ${c.author.name}, no caption`), sources: [c.id] }]
}

function sentence(t: string) {
  const s = t.trim()
  return s.charAt(0).toUpperCase() + s.slice(1) + (/[.!?]$/.test(s) ? "" : ".")
}

/** The fake's answer for some Captures. Synchronous, so the seed can use it too. */
export function recordedExtract(captures: ModelCapture[]) {
  return { drafts: captures.flatMap((c) => RECORDED[c.id] ?? routed(c)) }
}

/**
 * Where a never-drafted Capture is likely to go, so a Section can offer "Draft from inbox"
 * before anything ran. A hint only: Extract decides.
 */
export function likelySections(c: ModelCapture): SectionId[] {
  return [...new Set(recordedExtract([c]).drafts.map((d) => (d.kind === "incident" ? "incidents" : (d.section as SectionId))))]
}

export const fakeModel: ReportModel = {
  extract: async (request) => recordedExtract(request.captures),
  enhance: async ({ text, start, end }) => ({ text: enhanceText(text, { start, end }) }),
}

/**
 * The canned fallback when the real model fails (ADR 0001): recorded answers for the seeded
 * Captures only, so anything typed during the demo stays New instead of getting a made-up Draft.
 */
export const fallbackModel: ReportModel = {
  extract: async (request) => ({ drafts: request.captures.flatMap((c) => RECORDED[c.id] ?? []) }),
  enhance: fakeModel.enhance,
}
