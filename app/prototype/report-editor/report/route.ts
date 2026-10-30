// One report in the reviewer's Reports list, stored in Neon (tickets 08, 24). The browser sends its demo id
// (`d`) and the report's id (`r`): a report outside that demo id's list is not found. Scene switch and Reset
// act on the demo report only (story 60); clean reports run on the real clock (ADR 0009).

import { demoIdOf, loadReport, openReport, reportIdOf, saveReport, seedScene } from "@/lib/db"
import { applySaved, fakeModel, onClock, parseSaveAction, type Scene } from "@/lib/report"

const sceneOf = (v: unknown): Scene => (v === "start" ? "start" : "end")
const notFound = () => Response.json({ error: "No such report" }, { status: 404 })

/** Opening the Report screen: the saved report; for the demo report, the URL's scene seeded when needed. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const reportId = reportIdOf(params.get("r"))
  if (!reportId) return notFound()
  const report = await openReport(demoIdOf(params.get("d")), reportId, sceneOf(params.get("scene")))
  if (!report) return notFound()
  return Response.json(report, { headers: { "Cache-Control": "no-store" } })
}

/** Scene switch or Reset: reseed that scene in this demo id's demo report only. */
export async function PUT(request: Request) {
  const body = await request.json().catch(() => null)
  const report = await seedScene(demoIdOf(body?.d), sceneOf(body?.scene))
  return Response.json(report)
}

/**
 * A manager action (ticket 09): applied with the report domain's rules to the stored report, then saved.
 * Answers with the saved report either way; 409 when the rules refuse the action, so the screen shows what is saved.
 * Draft and Enhance have their own routes (./draft, ./enhance: Gemini). The fake model is only passed
 * because the signature asks for one; no action that reaches it runs a model.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const action = parseSaveAction(body?.action)
  if (!action || action.type === "draft" || action.type === "enhance") return Response.json({ error: "Unknown action" }, { status: 400 })
  const reportId = reportIdOf(body?.r)
  const loaded = reportId && (await loadReport(reportId, demoIdOf(body?.d)))
  if (!reportId || !loaded) return notFound()
  // Anything this action stamps (a typed Capture, Submit) is on the report's clock.
  const stored = onClock(loaded, new Date())
  const out = await applySaved(stored, action, fakeModel)
  if (!out.ok) return Response.json(stored, { status: 409 })
  await saveReport(reportId, stored, out.report)
  return Response.json(out.report)
}
