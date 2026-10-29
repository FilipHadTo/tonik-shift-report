// The reviewer's report, stored in Neon (ticket 08). Everything is scoped by demo id (`d`, one per
// desktop browser), so a scene switch or Reset never touches another reviewer's demo (story 60).

import { demoIdOf, loadReport, openReport, saveReport, seedScene } from "@/lib/db"
import { applySaved, fakeModel, parseSaveAction, type Scene } from "@/lib/report"

const sceneOf = (v: unknown): Scene => (v === "start" ? "start" : "end")

/** Opening the Report screen: the saved report, or the URL's scene seeded for a new demo id. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const report = await openReport(demoIdOf(params.get("d")), sceneOf(params.get("scene")))
  return Response.json(report, { headers: { "Cache-Control": "no-store" } })
}

/** Scene switch or Reset: reseed that scene for this demo id only. */
export async function PUT(request: Request) {
  const body = await request.json().catch(() => null)
  const report = await seedScene(demoIdOf(body?.d), sceneOf(body?.scene))
  return Response.json(report)
}

/**
 * A manager action (ticket 09): applied with the report domain's rules to the stored report, then saved.
 * Answers with the saved report either way; 409 when the rules refuse the action, so the screen shows what is saved.
 * Draft and Enhance run the fake model here until tickets 14 and 15 bring in Gemini.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const action = parseSaveAction(body?.action)
  if (!action) return Response.json({ error: "Unknown action" }, { status: 400 })
  const demoId = demoIdOf(body?.d)
  const stored = await loadReport(demoId)
  if (!stored) return Response.json({ error: "No report for this demo" }, { status: 404 })
  const out = await applySaved(stored, action, fakeModel)
  if (!out.ok) return Response.json(stored, { status: 409 })
  await saveReport(demoId, stored, out.report)
  return Response.json(out.report)
}
