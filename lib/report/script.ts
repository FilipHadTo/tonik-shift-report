// Scripted drafting for the demo Night: what "drafting" a Capture produces, per Section.
// Stands in for the model until Extract (ticket 04) puts a real one behind an interface.

import type { Author, Incident, InboxCapture, SectionId } from "./types"

export const alex: Author = { name: "Alex Morgan", role: "Closing Manager" }
export const marek: Author = { name: "Marek", role: "Door" }
export const jess: Author = { name: "Jess", role: "Bar" }

// What "drafting" a Capture produces, per Section. Scripted for the demo Night.
export type Effect =
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
          location: { status: "gap", hint: "No Capture says where." },
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
          // "Before midnight" isn't a time, so Occurred-at falls back to when the line was logged.
          occurredAt: { status: "draft", value: "01:42" },
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
  // The AI never looks inside a photo, so a bare one only says that it exists.
  return [{ section, text: sentence(c.text || `Photo from ${c.author.name}, no caption`) }]
}

function sentence(t: string) {
  const s = t.trim()
  return s.charAt(0).toUpperCase() + s.slice(1) + (/[.!?]$/.test(s) ? "" : ".")
}
