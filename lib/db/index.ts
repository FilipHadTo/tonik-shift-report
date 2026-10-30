// Server-only data access for the reports. The browser reaches it through route handlers.
// A report has its own id (ADR 0009); the demo id keys the reviewer's Reports list. The demo report's
// id is the demo id itself, so a demo id always finds its demo report.

import "server-only"
import { createHash } from "node:crypto"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { and, asc, count, desc, eq, inArray, isNull, sql } from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
import {
  cleanReport,
  onClock,
  receivePhoneCapture,
  reportRow,
  seedReport,
  type PhoneCapture,
  type PhoneCaptureInput,
  type Photo,
  type Report,
  type ReportRow,
  type Scene,
} from "../report"
import { fromRecords, toRecords } from "./records"
import * as schema from "./schema"

const { reports, captures, capturePhotos, incidents, blocks, aiCalls } = schema

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

/** A report id from a URL or a capture link: a demo id (the demo report) or `r-…` (a clean one). Null otherwise. */
export function reportIdOf(raw: unknown) {
  return typeof raw === "string" && /^[a-z0-9-]{1,24}$/.test(raw) ? raw : null
}

/** A report by its id; with `demoId`, only if it is in that demo id's Reports list. */
export async function loadReport(reportId: string, demoId?: string): Promise<Report | null> {
  const [report] = await db()
    .select()
    .from(reports)
    .where(demoId === undefined ? eq(reports.id, reportId) : and(eq(reports.id, reportId), eq(reports.demoId, demoId)))
  if (!report) return null
  const [c, i, b] = await Promise.all([
    db().select().from(captures).where(eq(captures.reportId, reportId)).orderBy(asc(captures.position)),
    db().select().from(incidents).where(eq(incidents.reportId, reportId)).orderBy(asc(incidents.position)),
    db().select().from(blocks).where(eq(blocks.reportId, reportId)).orderBy(asc(blocks.position)),
  ])
  return fromRecords({ report, captures: c, incidents: i, blocks: b })
}

/**
 * Replaces this demo id's demo report with a fresh copy of the scene, in one transaction. Only the demo
 * report: the demo id's clean reports and other demo ids are untouched (story 60).
 */
export async function seedScene(demoId: string, scene: Scene): Promise<Report> {
  const report = seedReport(scene)
  const rec = toRecords(report, { id: demoId, demoId })
  const d = db()
  const queries: BatchItem<"pg">[] = [
    // Captures, Incidents and blocks go with it (on delete cascade).
    d.delete(reports).where(and(eq(reports.id, demoId), eq(reports.kind, "demo"))),
    d.insert(reports).values(rec.report),
  ]
  if (rec.captures.length) queries.push(d.insert(captures).values(rec.captures))
  if (rec.incidents.length) queries.push(d.insert(incidents).values(rec.incidents))
  if (rec.blocks.length) queries.push(d.insert(blocks).values(rec.blocks))
  await d.batch(queries as [BatchItem<"pg">, ...BatchItem<"pg">[]])
  return report
}

/**
 * Seeds the scene as this demo id's demo report, only if it has none yet (first visit). Idempotent: two
 * first requests at once both run it, and the second changes nothing (on conflict do nothing).
 */
async function seedIfMissing(demoId: string, scene: Scene) {
  const rec = toRecords(seedReport(scene), { id: demoId, demoId })
  const d = db()
  const queries: BatchItem<"pg">[] = [d.insert(reports).values(rec.report).onConflictDoNothing()]
  if (rec.captures.length) queries.push(d.insert(captures).values(rec.captures).onConflictDoNothing())
  if (rec.incidents.length) queries.push(d.insert(incidents).values(rec.incidents).onConflictDoNothing())
  if (rec.blocks.length) queries.push(d.insert(blocks).values(rec.blocks).onConflictDoNothing())
  await d.batch(queries as [BatchItem<"pg">, ...BatchItem<"pg">[]])
}

/**
 * Opening a report. The demo report: its saved state, whatever its scene; the URL's scene only seeds it on
 * the first visit (only the PUT, scene switch or Reset, reseeds). A clean report: as saved, if it is in
 * this demo id's list.
 */
export async function openReport(demoId: string, reportId: string, scene: Scene): Promise<Report | null> {
  if (reportId !== demoId) return loadReport(reportId, demoId)
  const saved = await loadReport(demoId, demoId)
  if (saved) return saved
  await seedIfMissing(demoId, scene)
  return loadReport(demoId, demoId)
}

/** "New report" (story 65): a clean, empty report on the real clock, in this demo id's list. Answers its id. */
export async function createReport(demoId: string, now: Date): Promise<string> {
  // `r-` keeps clean ids apart from demo ids, which never contain a dash.
  const id = `r-${Math.random().toString(36).slice(2, 12).padEnd(10, "0")}`
  await db().insert(reports).values(toRecords(cleanReport(now), { id, demoId }).report)
  return id
}

/** Reports (stories 63–64): the demo report first (seeded on the first visit), then the newest clean report first. */
export async function listReports(demoId: string): Promise<(ReportRow & { id: string })[]> {
  const d = db()
  const [demo] = await d.select({ id: reports.id }).from(reports).where(and(eq(reports.id, demoId), eq(reports.demoId, demoId)))
  if (!demo) await seedIfMissing(demoId, "end")
  const rows = await d
    .select({
      id: reports.id,
      kind: reports.kind,
      night: reports.night,
      startedAt: reports.startedAt,
      submittedAt: reports.submittedAt,
      submittedBy: reports.submittedBy,
    })
    .from(reports)
    .where(eq(reports.demoId, demoId))
    .orderBy(desc(sql`${reports.kind} = 'demo'`), desc(reports.createdAt))
  const counts = rows.length
    ? await d
        .select({ reportId: incidents.reportId, n: count() })
        .from(incidents)
        .where(inArray(incidents.reportId, rows.map((r) => r.id)))
        .groupBy(incidents.reportId)
    : []
  const n = new Map(counts.map((c) => [c.reportId, c.n]))
  return rows.map((r) =>
    Object.assign(
      { id: r.id },
      reportRow({
        kind: r.kind,
        night: r.night,
        startedAt: r.startedAt,
        submittedAt: r.submittedAt ?? undefined,
        submittedBy: r.submittedBy ?? undefined,
        incidents: { length: n.get(r.id) ?? 0 },
      }),
    ),
  )
}

/**
 * Saves a manager action's result over `before` (the report it was applied to), in one transaction.
 * Captures are only ever added or have their dismissed / written-by-hand flags changed (ADR 0003);
 * the report row, Incidents and blocks are written as they now are.
 */
export async function saveReport(reportId: string, before: Report, after: Report) {
  const rec = toRecords(after, { id: reportId, demoId: "" })
  // Which list it is in and what kind it is never change.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, demoId, kind, ...row } = rec.report
  const old = new Map(before.captures.map((c) => [c.id, c]))
  const d = db()
  const queries: BatchItem<"pg">[] = [
    // The clock never goes back: a phone Capture may have moved it on while this action was applied.
    d
      .update(reports)
      .set({ ...row, clock: sql`greatest(${reports.clock}, ${row.clock})`, updatedAt: new Date() })
      .where(eq(reports.id, reportId)),
    d.delete(incidents).where(eq(incidents.reportId, reportId)),
    d.delete(blocks).where(eq(blocks.reportId, reportId)),
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
          .where(and(eq(captures.reportId, reportId), eq(captures.id, c.id))),
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

/** Live Inbox (story 13): every phone Capture in this report, oldest first. */
export async function phoneCaptures(reportId: string): Promise<PhoneCapture[]> {
  const rows = await db()
    .select()
    .from(captures)
    .where(and(eq(captures.reportId, reportId), eq(captures.fromPhone, true)))
    .orderBy(asc(captures.position))
  return rows.map(asPhoneCapture)
}

/** The capture page (story 11): the report's Night, whether it was submitted, and only what this phone sent. Null when there is no such report. */
export async function deviceCaptures(
  reportId: string,
  device: string,
): Promise<{ night: string; submitted: boolean; captures: PhoneCapture[] } | null> {
  const d = db()
  const [[report], rows] = await Promise.all([
    d.select({ night: reports.night, submittedAt: reports.submittedAt }).from(reports).where(eq(reports.id, reportId)),
    d
      .select()
      .from(captures)
      .where(and(eq(captures.reportId, reportId), eq(captures.device, device)))
      .orderBy(asc(captures.position)),
  ])
  return report
    ? { night: report.night, submitted: report.submittedAt !== null, captures: rows.map(asPhoneCapture) }
    : null
}

/**
 * Files a phone Capture in this report (the capture link carries it, story 66), stamped on the report's
 * clock: the demo clock, or `now` on a clean report. Only the new Capture row and the clock are written,
 * so a manager action saved at the same time is untouched. The insert itself checks the report is still
 * open, so a Capture can't slip in just after Submit (ticket 28).
 */
export async function addPhoneCapture(
  reportId: string,
  input: PhoneCaptureInput,
  now: Date,
): Promise<PhoneCapture | "missing" | "submitted"> {
  const d = db()
  // The report row only: stamping needs its clock, not its Captures.
  const [stored] = await d.select().from(reports).where(eq(reports.id, reportId))
  if (!stored) return "missing"
  // Random, so two phones sending at once never collide on the key.
  const id = `p-${Math.random().toString(36).slice(2, 10)}`
  const out = receivePhoneCapture(onClock(fromRecords({ report: stored, captures: [], incidents: [], blocks: [] }), now), input, id)
  if (!out) return "submitted"
  const c = { ...toRecords(out.report, { id: reportId, demoId: "" }).captures[0], device: input.device }
  const open = and(eq(reports.id, reportId), isNull(reports.submittedAt))
  const queries: BatchItem<"pg">[] = [
    // One statement: the row goes in only while the report is not submitted, after every Capture already in it.
    d
      .insert(captures)
      .select(
        sql`select ${reportId}, ${id}, (select coalesce(max(${captures.position}), -1) + 1 from ${captures} where ${captures.reportId} = ${reportId}),
          ${c.kind}, ${c.capturedAt}, ${JSON.stringify(c.author)}::jsonb, ${c.text}, null, ${c.photo}, true, ${c.device}, false, false
          from ${reports} where ${open}`,
      )
      .returning({ id: captures.id }),
    d
      .update(reports)
      .set({ clock: sql`greatest(${reports.clock}, ${out.report.clock})`, updatedAt: new Date() })
      .where(open),
  ]
  // Only next to a Capture that went in.
  if (input.photo)
    queries.push(
      d
        .insert(capturePhotos)
        .select(
          sql`select ${captures.reportId}, ${captures.id}, ${input.photo.mime}, ${input.photo.data} from ${captures}
            where ${captures.reportId} = ${reportId} and ${captures.id} = ${id}`,
        ),
    )
  const [inserted] = (await d.batch(queries as [BatchItem<"pg">, ...BatchItem<"pg">[]])) as unknown as [{ id: string }[]]
  return inserted.length ? asPhoneCapture(c) : "submitted"
}

/**
 * A phone photo's image (ticket 18): its type and base64 bytes, for the desktop to show and for Extract
 * to send to the AI. Only within this report; null for seeded photos, which have no stored image.
 */
export async function capturePhoto(reportId: string, captureId: string): Promise<Photo | null> {
  const [row] = await db()
    .select({ mime: capturePhotos.mime, data: capturePhotos.data })
    .from(capturePhotos)
    .where(and(eq(capturePhotos.reportId, reportId), eq(capturePhotos.captureId, captureId)))
  return row ?? null
}

/** The stored images of these phone photos, in one query (Extract, ticket 18). Seeded photos have none. */
export async function capturePhotosOf(reportId: string, captureIds: string[]): Promise<Record<string, Photo>> {
  if (!captureIds.length) return {}
  const rows = await db()
    .select({ id: capturePhotos.captureId, mime: capturePhotos.mime, data: capturePhotos.data })
    .from(capturePhotos)
    .where(and(eq(capturePhotos.reportId, reportId), inArray(capturePhotos.captureId, captureIds)))
  return Object.fromEntries(rows.map((r) => [r.id, { mime: r.mime, data: r.data }]))
}

/** Paid AI calls allowed per IP and window (ticket 14). AI_RATE_LIMIT overrides the count. */
export const AI_WINDOW_MS = 10 * 60_000
const aiLimit = () => Number(process.env.AI_RATE_LIMIT) || 20

/**
 * Counts one paid AI call for this IP and says whether it is within the limit. One atomic upsert, so
 * it holds across Vercel instances. The IP is stored only as a hash.
 */
export async function takeAiCall(ip: string): Promise<boolean> {
  const ipHash = createHash("sha256").update(`shift-report:${ip}`).digest("hex")
  const window = Math.floor(Date.now() / AI_WINDOW_MS)
  const d = db()
  const [row] = await d
    .insert(aiCalls)
    .values({ ipHash, window, count: 1 })
    .onConflictDoUpdate({ target: [aiCalls.ipHash, aiCalls.window], set: { count: sql`${aiCalls.count} + 1` } })
    .returning({ count: aiCalls.count })
  // Old windows are never read again; clear them now and then so the table stays tiny.
  if (row.count === 1) await d.delete(aiCalls).where(sql`${aiCalls.window} < ${window - 1}`)
  return row.count <= aiLimit()
}
