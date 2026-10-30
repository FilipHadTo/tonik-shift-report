// Draft into report / Draft from inbox / Draft all (ticket 14, ADR 0007): Extract with Gemini on the
// stored report, then saved. The result never comes from the browser. Gemini is behind a per-IP rate
// limit; when it fails, is slow or is rate limited, seeded Captures draft from the fake model's
// recorded answers (ADR 0001) and anything else stays New, with `degraded` for the calm message.

import { demoIdOf, loadReport, saveReport, takeAiCall } from "@/lib/db"
import { geminiModel } from "@/lib/ai/gemini"
import { applySaved, fallbackModel, parseSaveAction, type ReportModel } from "@/lib/report"

// Gemini's own timeout is 20s (EXTRACT_TIMEOUT_MS); leave room for the database around it.
export const maxDuration = 30

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip") || "unknown"
}

/** Body: { d, scope }. Answers { report, degraded } with the saved report; 409 when nothing was drafted. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const action = parseSaveAction({ type: "draft", scope: body?.scope })
  if (!action) return Response.json({ error: "Unknown scope" }, { status: 400 })
  const demoId = demoIdOf(body?.d)
  const stored = await loadReport(demoId)
  if (!stored) return Response.json({ error: "No report for this demo" }, { status: 404 })

  const ip = clientIp(request)
  const limited: ReportModel = {
    ...geminiModel,
    // Counted only when Gemini is really asked; over the limit counts as a failed call.
    extract: async (req) => {
      if (!(await takeAiCall(ip))) throw new Error("Rate limited")
      return geminiModel.extract(req)
    },
  }
  const out = await applySaved(stored, action, limited, { fallback: fallbackModel })
  if (!out.ok) return Response.json({ report: stored, degraded: !!out.degraded }, { status: 409 })
  await saveReport(demoId, stored, out.report)
  return Response.json({ report: out.report, degraded: !!out.degraded })
}
