// Database schema (Drizzle, Neon Postgres; ADR 0001). One demo report per reviewer, keyed by
// the demo id the desktop browser keeps. Laid out along the evidence model (ADR 0003):
// Captures are their own rows and their content is never updated; every Incident field and
// Section block keeps its value, provenance and source Captures.

import { boolean, foreignKey, integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core"
import type { Author, Capture, Scene, SectionId } from "../report"

/** Who a value comes from. "confirmed" = AI-drafted, then confirmed by the Closing Manager. */
export type Provenance = "ai-drafted" | "confirmed" | "kept" | "manager-entered"

/** One Incident field as stored: its value (if any), provenance and source Captures. */
export type FieldRecord = {
  state: "value" | "gap" | "empty" | "unknown"
  value?: string
  provenance?: Provenance
  sources: string[]
  /** Gap only: what the picker asks for. */
  hint?: string
}

/** Report-side state about a Capture: where it was drafted into. Not part of the Capture itself. */
export type CaptureUse = { applied: SectionId[]; found?: SectionId[] }

export const reports = pgTable("reports", {
  demoId: text("demo_id").primaryKey(),
  scene: text("scene").$type<Scene>().notNull(),
  venue: text("venue").notNull(),
  night: text("night").notNull(),
  startedAt: text("started_at").notNull(),
  manager: jsonb("manager").$type<Author>().notNull(),
  visible: jsonb("visible").$type<SectionId[]>().notNull(),
  invited: boolean("invited").notNull(),
  drafted: boolean("drafted").notNull(),
  /** Demo clock, minutes on the Night. */
  clock: integer("clock").notNull(),
  submittedAt: text("submitted_at"),
  /** Submission (ticket 16): who submitted, the reviewer statement they ticked, and the AI-assisted mark. */
  submittedBy: jsonb("submitted_by").$type<Author>(),
  statement: text("statement"),
  aiAssisted: boolean("ai_assisted").notNull().default(false),
  captureUse: jsonb("capture_use").$type<Record<string, CaptureUse>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/** Verbatim Captures. Only `dismissed` and `handled` (written by hand) ever change. */
export const captures = pgTable(
  "captures",
  {
    demoId: text("demo_id").notNull(),
    id: text("id").notNull(),
    position: integer("position").notNull(),
    kind: text("kind").$type<Capture["kind"]>().notNull(),
    capturedAt: text("captured_at").notNull(),
    author: jsonb("author").$type<Author>().notNull(),
    text: text("text").notNull(),
    chatLines: jsonb("chat_lines").$type<NonNullable<Capture["chatLines"]>>(),
    photo: text("photo").$type<"window" | "upload">(),
    fromPhone: boolean("from_phone").notNull().default(false),
    /** The phone that sent it: only scopes "your Captures" on the capture page, never shown. */
    device: text("device"),
    dismissed: boolean("dismissed").notNull().default(false),
    handled: boolean("handled").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.demoId, t.id] }), foreignKey({ columns: [t.demoId], foreignColumns: [reports.demoId] }).onDelete("cascade")],
)

export const incidents = pgTable(
  "incidents",
  {
    demoId: text("demo_id").notNull(),
    id: text("id").notNull(),
    position: integer("position").notNull(),
    /** Title and "What happened": manager-entered on a manual Incident, else ai-drafted until confirmed. */
    provenance: text("provenance").$type<Provenance>().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    /** Enhance result for "What happened", waiting for Keep or Discard. */
    descriptionDraft: text("description_draft"),
    occurredAt: jsonb("occurred_at").$type<FieldRecord>().notNull(),
    location: jsonb("location").$type<FieldRecord>().notNull(),
    type: jsonb("type").$type<FieldRecord>().notNull(),
    capturedAt: text("captured_at").notNull(),
    confirmedAt: text("confirmed_at"),
    sources: jsonb("sources").$type<string[]>().notNull(),
    evidence: jsonb("evidence").$type<string[]>().notNull(),
    fromStaff: jsonb("from_staff").$type<Author>(),
    manual: boolean("manual").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.demoId, t.id] }), foreignKey({ columns: [t.demoId], foreignColumns: [reports.demoId] }).onDelete("cascade")],
)

export const blocks = pgTable(
  "blocks",
  {
    demoId: text("demo_id").notNull(),
    id: text("id").notNull(),
    position: integer("position").notNull(),
    section: text("section").$type<SectionId>().notNull(),
    text: text("text").notNull(),
    provenance: text("provenance").$type<Exclude<Provenance, "confirmed">>().notNull(),
    sources: jsonb("sources").$type<string[]>().notNull(),
    /** Set while an Enhance result is a Draft: what Discard restores. */
    original: jsonb("original").$type<{ text: string; provenance: "manager-entered" | "kept" }>(),
  },
  (t) => [primaryKey({ columns: [t.demoId, t.id] }), foreignKey({ columns: [t.demoId], foreignColumns: [reports.demoId] }).onDelete("cascade")],
)

/**
 * Per-IP rate limit on paid AI calls (ticket 14), counted here so it holds across Vercel instances.
 * One row per hashed IP and fixed time window; the raw IP is never stored.
 */
export const aiCalls = pgTable(
  "ai_calls",
  {
    ipHash: text("ip_hash").notNull(),
    /** Start of the window, as a window number (epoch ms / window length). */
    window: integer("window").notNull(),
    count: integer("count").notNull(),
  },
  (t) => [primaryKey({ columns: [t.ipHash, t.window] })],
)
