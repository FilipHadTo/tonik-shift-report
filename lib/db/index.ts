// Server-only data access for the demo reports. The browser reaches it through route handlers.

import "server-only"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { and, asc, eq, sql } from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
import { receivePhoneCapture, seedReport, type PhoneCapture, type PhoneCaptureInput, type Report, type Scene } from "../report"
import { fromRecords, toRecords } from "./records"
import * as schema from "./schema"

const { reports, captures, incidents, blocks } = schema

let client: ReturnType<typeof drizzle<typeof schema>> | undefined

function db() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return (client ??= drizzle(neon(url), { schema }))
}

/** A demo id as the browser sends it (see demoSession), or the shared "public" demo. */
export function demoIdOf(raw: unknown) {
  return typeof raw === "string" && /^[a-z0-9]{1,16}$/.test(raw) ? raw : "public"
}

export async function loadReport(demoId: string): Promise<Report | null> {
  const [report] = await db().select().from(reports).where(eq(reports.demoId, demoId))
  if (!report) return null
  const [c, i, b] = await Promise.all([
    db().select().from(captures).where(eq(captures.demoId, demoId)).orderBy(asc(captures.position)),
    db().select().from(incidents).where(eq(incidents.demoId, demoId)).orderBy(asc(incidents.position)),
    db().select().from(blocks).where(eq(blocks.demoId, demoId)).orderBy(asc(blocks.position)),
  ])
  return fromRecords({ report, captures: c, incidents: i, blocks: b })
}

/** Replaces this demo id's report with a fresh copy of the scene, in one transaction. Other demo ids are untouched. */
export async function seedScene(demoId: string, scene: Scene): Promise<Report> {
  const report = seedReport(scene)
  const rec = toRecords(report, demoId)
  const d = db()
  const queries: BatchItem<"pg">[] = [
    // Captures, Incidents and blocks go with it (on delete cascade).
    d.delete(reports).where(eq(reports.demoId, demoId)),
    d.insert(reports).values(rec.report),
  ]
  if (rec.captures.length) queries.push(d.insert(captures).values(rec.captures))
  if (rec.incidents.length) queries.push(d.insert(incidents).values(rec.incidents))
  if (rec.blocks.length) queries.push(d.insert(blocks).values(rec.blocks))
  await d.batch(queries as [BatchItem<"pg">, ...BatchItem<"pg">[]])
  return report
}

/**
 * Opening the Report screen: this demo id's saved report. The scene is in the URL, so a demo id seen
 * for the first time, or one whose saved report is another scene, gets that scene freshly seeded.
 */
export async function openReport(demoId: string, scene: Scene): Promise<Report> {
  const saved = await loadReport(demoId)
  return saved && saved.scene === scene ? saved : seedScene(demoId, scene)
}

/**
 * Saves a manager action's result over `before` (the report it was applied to), in one transaction.
 * Captures are only ever added or have their dismissed / written-by-hand flags changed (ADR 0003);
 * the report row, Incidents and blocks are written as they now are.
 */
export async function saveReport(demoId: string, before: Report, after: Report) {
  const rec = toRecords(after, demoId)
  const old = new Map(before.captures.map((c) => [c.id, c]))
  const d = db()
  const queries: BatchItem<"pg">[] = [
    // The clock never goes back: a phone Capture may have moved it on while this action was applied.
    d
      .update(reports)
      .set({ ...rec.report, clock: sql`greatest(${reports.clock}, ${rec.report.clock})`, updatedAt: new Date() })
      .where(eq(reports.demoId, demoId)),
    d.delete(incidents).where(eq(incidents.demoId, demoId)),
    d.delete(blocks).where(eq(blocks.demoId, demoId)),
  ]
  const added = rec.captures.filter((c) => !old.has(c.id))
  if (added.length) queries.push(d.insert(captures).values(added))
  for (const c of rec.captures) {
    const was = old.get(c.id)
    if (was && (!!was.dismissed !== c.dismissed || !!was.handled !== c.handled))
      queries.push(
        d
          .update(captures)
          .set({ dismissed: c.dismissed, handled: c.handled })
          .where(and(eq(captures.demoId, demoId), eq(captures.id, c.id))),
      )
  }
  if (rec.incidents.length) queries.push(d.insert(incidents).values(rec.incidents))
  if (rec.blocks.length) queries.push(d.insert(blocks).values(rec.blocks))
  await d.batch(queries as [BatchItem<"pg">, ...BatchItem<"pg">[]])
}

const asPhoneCapture = (c: typeof captures.$inferSelect): PhoneCapture => ({
  id: c.id,
  kind: c.kind,
  capturedAt: c.capturedAt,
  author: c.author,
  text: c.text,
  ...(c.photo && { photo: true }),
})

/** Live Inbox (story 13): every phone Capture in this demo id's report, oldest first. */
export async function phoneCaptures(demoId: string): Promise<PhoneCapture[]> {
  const rows = await db()
    .select()
    .from(captures)
    .where(and(eq(captures.demoId, demoId), eq(captures.fromPhone, true)))
    .orderBy(asc(captures.position))
  return rows.map(asPhoneCapture)
}

/** The capture page's list (story 11): only what this phone sent. */
export async function deviceCaptures(demoId: string, device: string): Promise<PhoneCapture[]> {
  const rows = await db()
    .select()
    .from(captures)
    .where(and(eq(captures.demoId, demoId), eq(captures.device, device)))
    .orderBy(asc(captures.position))
  return rows.map(asPhoneCapture)
}

/**
 * Files a phone Capture in this demo id's report, opening the default scene if the demo id has none yet.
 * Only the new Capture row and the clock are written, so a manager action saved at the same time is untouched.
 * Null when the report takes no more Captures (submitted).
 */
export async function addPhoneCapture(demoId: string, input: PhoneCaptureInput): Promise<PhoneCapture | null> {
  const stored = (await loadReport(demoId)) ?? (await seedScene(demoId, "end"))
  // Random, so two phones sending at once never collide on the key.
  const id = `p-${Math.random().toString(36).slice(2, 10)}`
  const out = receivePhoneCapture(stored, input, id)
  if (!out) return null
  const row = { ...toRecords(out.report, demoId).captures.at(-1)!, device: input.device }
  const d = db()
  await d.batch([
    d.insert(captures).values(row),
    d
      .update(reports)
      .set({ clock: sql`greatest(${reports.clock}, ${out.report.clock})`, updatedAt: new Date() })
      .where(eq(reports.demoId, demoId)),
  ])
  return asPhoneCapture(row)
}
