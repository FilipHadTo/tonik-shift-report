// Report domain: types. Pure data, shared by the browser, the server and the tests.

import type { Author, Capture, IncidentField } from "./catalog"
import type { Extracted } from "./extract"
import type { Enhanced } from "./enhance"

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
  /** Sections the AI found in it so far. Unset until it was first drafted; anything found but not applied keeps it New. Dismiss on a partly used Capture narrows it to what is applied. */
  found?: SectionId[]
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
  | { status: "draft"; value: string; source?: string }
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

/** The demo report (seeded scenes, demo clock, Demo controller) or a clean one from "New report" (ADR 0009). */
export type ReportKind = "demo" | "clean"

export type Report = {
  kind: ReportKind
  venue: string
  night: string
  scene: Scene
  startedAt: string
  manager: Author
  captures: InboxCapture[]
  blocks: Block[]
  incidents: Incident[]
  visible: SectionId[]
  /** Submission (stories 54–56): set together, once, by Submit; after that the report is locked. */
  submittedAt?: string
  submittedBy?: Author
  /** The reviewer statement the Closing Manager ticked, as worded at Submission. */
  statement?: string
  /** Every report made in this app is AI-assisted; the flag records that the submitted report says so. */
  aiAssisted?: boolean
  /** Onboarding steps that happened in this report (story 4). The first Capture is derived. */
  invited: boolean
  drafted: boolean
  /** The report's clock, in minutes on the Night (see nightMinutes): the demo clock, or for a clean report the real time (see onClock). */
  clock: number
}

// --- actions ---

export type Action =
  | { type: "startDrafting"; ids: string[] }
  | { type: "extracted"; result: Extracted }
  | { type: "draftFailed"; ids: string[] }
  | { type: "dismiss"; id: string; undo?: boolean }
  | { type: "handled"; id: string }
  | { type: "addCapture"; text: string }
  | { type: "setField"; incident: string; field: IncidentField; value: string | null }
  | { type: "editIncident"; incident: string; patch: Partial<Pick<Incident, "title" | "description">> }
  | { type: "confirm"; incident: string; undo?: boolean }
  | { type: "deleteIncident"; incident: string }
  | { type: "addIncident" }
  | { type: "keep"; block: string }
  /** Submit sheet only (story 53): keeps every remaining Section and Enhance Draft. Never confirms Incidents. */
  | { type: "keepAll" }
  | { type: "discard"; block: string }
  | { type: "editBlock"; block: string; text: string }
  | { type: "write"; section: SectionId; text: string }
  | { type: "toggleSection"; section: SectionId }
  | { type: "enhanced"; result: Enhanced }
  | { type: "keepIncidentDraft"; incident: string }
  | { type: "discardIncidentDraft"; incident: string }
  | { type: "receive"; captures: PhoneCapture[] }
  | { type: "invited" }
  /** `statement`: the reviewer statement is ticked (story 54). */
  | { type: "submit"; statement: boolean }
  | { type: "reset"; scene: Scene }


/** A Capture as the mobile capture page sends it (see the capture route). */
export type PhoneCapture = Pick<Capture, "id" | "kind" | "capturedAt" | "author" | "text"> & { photo?: boolean }
