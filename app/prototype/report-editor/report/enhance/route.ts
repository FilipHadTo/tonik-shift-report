// Enhance (ticket 15, story 27): the manager's own words rewritten by Gemini on the stored report, then
// saved as a Draft. The rewrite never comes from the browser. Same rate limit as Draft; when Gemini fails,
// is slow or is rate limited, the rule-based rewrite stands in (ADR 0001), and if that changes nothing
// either the report stays as it was and `degraded` asks for the calm message.

import { demoIdOf, loadReport, saveReport } from "@/lib/db"
import { rateLimitedGemini } from "@/lib/ai/limited"
import { applySaved, fallbackModel, parseSaveAction } from "@/lib/report"

// Gemini's own timeout is 20s (ENHANCE_TIMEOUT_MS); leave room for the database around it.
export const maxDuration = 30

/**
 * Body: { d, target, text?, span? } (`text` is what's on screen, `span` the selection in it).
 * Answers { report, status }: the saved report and Enhance's outcome. 409 + the stored report when nothing was saved.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const action = parseSaveAction({ type: "enhance", target: body?.target, text: body?.text, span: body?.span })
  if (!action) return Response.json({ error: "Unknown target" }, { status: 400 })
  const demoId = demoIdOf(body?.d)
  const stored = await loadReport(demoId)
  if (!stored) return Response.json({ error: "No report for this demo" }, { status: 404 })

  const out = await applySaved(stored, action, rateLimitedGemini(request), { fallback: fallbackModel })
  if (!out.ok) return Response.json({ report: stored, status: out.status ?? "refused" }, { status: 409 })
  await saveReport(demoId, stored, out.report)
  return Response.json({ report: out.report, status: out.status })
}
