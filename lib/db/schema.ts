// Database schema (Drizzle, Neon Postgres; ADR 0001). Every report has its own id (ADR 0009); the
// demo id the desktop browser keeps is the reviewer's Reports list. The demo report's id is the demo id. Laid out along the evidence model (ADR 0003):
// Captures are their own rows and their content is never updated; every Incident field and
// Section block keeps its value, provenance and source Captures.

import { sql } from "drizzle-orm"
import { boolean, foreignKey, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import type { Author, Capture, PhotoMime, ReportKind, Scene, SectionId } from "../report"

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

export const reports = pgTable(
  "reports",
  {
    /** The report's own id: the demo id for the demo report, `r-…` for a clean one. Carried by the capture link. */
    id: text("id").primaryKey(),
    /** Whose Reports list it is in (the browser's demo id). */
    demoId: text("demo_id").notNull(),
    kind: text("kind").$type<ReportKind>().notNull(),
    scene: text("scene").$type<Scene>().notNull(),
    venue: text("venue").notNull(),
    night: text("night").notNull(),
    startedAt: text("started_at").notNull(),
    manager: jsonb("manager").$type<Author>().notNull(),
    visible: jsonb("visible").$type<SectionId[]>().notNull(),
    invited: boolean("invited").notNull(),
    drafted: boolean("drafted").notNull(),
    /** The report's clock, minutes on the Night (demo clock, or the real time on a clean report). */
    clock: integer("clock").notNull(),
    submittedAt: text("submitted_at"),
    /** Submission (ticket 16): who submitted, the reviewer statement they ticked, and the AI-assisted mark. */
    submittedBy: jsonb("submitted_by").$type<Author>(),
    statement: text("statement"),
    aiAssisted: boolean("ai_assisted").notNull().default(false),
    captureUse: jsonb("capture_use").$type<Record<string, CaptureUse>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reports_demo_id_idx").on(t.demoId),
    // One demo report per demo id.
    uniqueIndex("reports_one_demo_idx").on(t.demoId).where(sql`${t.kind} = 'demo'`),
  ],
)

/** Verbatim Captures. Only `dismissed` and `handled` (written by hand) ever change. */
export const captures = pgTable(
  "captures",
  {
    reportId: text("report_id").notNull(),
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
  (t) => [primaryKey({ columns: [t.reportId, t.id] }), foreignKey({ columns: [t.reportId], foreignColumns: [reports.id] }).onDelete("cascade")],
)

/**
 * A phone photo's image (ticket 18), one row per photo Capture, kept apart so polling the Inbox
 * never pulls image bytes. Goes with its Capture (on delete cascade), so Reset removes it too.
 */
export const capturePhotos = pgTable(
  "capture_photos",
  {
    reportId: text("report_id").notNull(),
    captureId: text("capture_id").notNull(),
    mime: text("mime").$type<PhotoMime>().notNull(),
    /** The image bytes in base64, as the phone sent them (downsized to about 150 KB). */
    data: text("data").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.reportId, t.captureId] }),
    foreignKey({ columns: [t.reportId, t.captureId], foreignColumns: [captures.reportId, captures.id] }).onDelete("cascade"),
  ],
)

export const incidents = pgTable(
  "incidents",
  {
    reportId: text("report_id").notNull(),
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
  (t) => [primaryKey({ columns: [t.reportId, t.id] }), foreignKey({ columns: [t.reportId], foreignColumns: [reports.id] }).onDelete("cascade")],
)

export const blocks = pgTable(
  "blocks",
  {
    reportId: text("report_id").notNull(),
    id: text("id").notNull(),
    position: integer("position").notNull(),
    section: text("section").$type<SectionId>().notNull(),
    text: text("text").notNull(),
    provenance: text("provenance").$type<Exclude<Provenance, "confirmed">>().notNull(),
    sources: jsonb("sources").$type<string[]>().notNull(),
    /** Set while an Enhance result is a Draft: what Discard restores. */
    original: jsonb("original").$type<{ text: string; provenance: "manager-entered" | "kept" }>(),
  },
  (t) => [primaryKey({ columns: [t.reportId, t.id] }), foreignKey({ columns: [t.reportId], foreignColumns: [reports.id] }).onDelete("cascade")],
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
