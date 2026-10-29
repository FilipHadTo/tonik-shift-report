// Report domain: types. Pure data, shared by the browser, the server and the tests.

import type { Author, Capture, IncidentField } from "./catalog"

export type { Author, Capture, IncidentField }

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

/** The two demo moments the reviewer can switch between (story 60). */
export type Scene = "start" | "end"

export type InboxCapture = Capture & {
  /** Sections this Capture has already been drafted into. */
  applied: SectionId[]
  dismissed?: boolean
  /** Manager rewrote it by hand and marked it as in the report. */
  handled?: boolean
  drafting?: boolean
  photo?: "window" | "upload"
  /** Sent from the mobile capture page. */
  fromPhone?: boolean
}

export type Block = {
  id: string
  section: SectionId
  text: string
  /** draft = AI wrote it, unchecked. kept = AI draft the manager kept. manual = typed by the manager. */
  status: "draft" | "kept" | "manual"
  sources: string[]
  /** Set while an Enhance result is a Draft: what Discard restores. */
  original?: { text: string; status: "manual" | "kept" }
}

export type Field =
  | { status: "draft"; value: string }
  | { status: "filled"; value: string }
  | { status: "gap"; hint?: string }
  | { status: "empty" }
  | { status: "unknown" }


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
  /** Enhance result for "What happened", waiting for Keep or Discard. */
  descriptionDraft?: string
}

export type Report = {
  venue: string
  night: string
  scene: Scene
  startedAt: string
  manager: Author
  captures: InboxCapture[]
  blocks: Block[]
  incidents: Incident[]
  visible: SectionId[]
  submittedAt?: string
  /** Onboarding steps that happened in this report (story 4). The first Capture is derived. */
  invited: boolean
  drafted: boolean
  /** Demo clock, in minutes on the Night (see nightMinutes). */
  clock: number
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
  | { type: "enhance"; block: string; text: string }
  | { type: "enhanceIncident"; incident: string; text: string }
  | { type: "keepIncidentDraft"; incident: string }
  | { type: "discardIncidentDraft"; incident: string }
  | { type: "receive"; captures: PhoneCapture[] }
  | { type: "invited" }
  | { type: "submit" }
  | { type: "reset"; scene: Scene }


/** A Capture as the mobile capture page sends it (see the capture route). */
export type PhoneCapture = Pick<Capture, "id" | "kind" | "capturedAt" | "author" | "text"> & { photo?: boolean }
