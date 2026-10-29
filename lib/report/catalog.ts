// Report domain: fixed lists and the demo Night's clock.

import type { Scene, SectionId } from "./types"

export type Author = { name: string; role: "Closing Manager" | "Door" | "Bar" | "Security" }

export type Capture = {
  id: string
  kind: "photo" | "voice" | "text" | "chat"
  /** HH:MM on the Night. */
  capturedAt: string
  author: Author
  /** Verbatim; for voice = transcript, for photo = caption. */
  text: string
  chatLines?: { at: string; who: string; text: string }[]
}

export type IncidentField = "occurredAt" | "location" | "type"

export const INCIDENT_TYPES = [
  "Fight/assault",
  "Injury/medical",
  "Ejection/refused entry",
  "Theft",
  "Property damage",
  "Drugs",
  "Intoxication",
  "Harassment",
  "Police called",
  "Other",
]

export const LOCATIONS = [
  "Main bar",
  "Dance floor",
  "Front door",
  "Side entrance",
  "Cloakroom",
  "Smoking area",
  "Toilets",
  "Street outside",
]

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

export const SCENES: Record<Scene, { at: string; label: string }> = {
  start: { at: "20:00", label: "Start of shift" },
  end: { at: "02:15", label: "End of Night" },
}

/** Minutes since 18:00, so times after midnight sort after the evening ones. */
export function nightMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return ((h + 24 - 18) % 24) * 60 + m
}

/** Inverse of nightMinutes. */
export function timeOf(minutes: number) {
  const h = (Math.floor(minutes / 60) + 18) % 24
  return `${String(h).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
}

