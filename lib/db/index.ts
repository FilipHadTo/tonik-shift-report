// Server-only data access for the demo reports. The browser reaches it through route handlers.

import "server-only"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { asc, eq } from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
import { seedReport, type Report, type Scene } from "../report"
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
