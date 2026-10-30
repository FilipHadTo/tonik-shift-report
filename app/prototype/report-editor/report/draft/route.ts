// Draft into report / Draft from inbox / Draft all (ticket 14, ADR 0007): Extract with Gemini on the
// stored report, then saved. The result never comes from the browser. Gemini is behind a per-IP rate
// limit; when it fails, is slow or is rate limited, seeded Captures draft from the fake model's
// recorded answers (ADR 0001) and anything else stays New, with `degraded` for the calm message.
// Photos sent from the phone go to Gemini with their Capture (ADR 0008); seeded photos have no stored image.

import { capturePhoto, demoIdOf, loadReport, saveReport } from "@/lib/db"
import { rateLimitedGemini } from "@/lib/ai/limited"
import { applySaved, capturesInScope, fallbackModel, parseSaveAction, type CaptureImages, type ExtractScope, type Report } from "@/lib/report"

// Gemini's own timeout is 20s (EXTRACT_TIMEOUT_MS); leave room for the database around it.
export const maxDuration = 30

/** Body: { d, scope }. Answers { report, degraded } with the saved report; 409 when nothing was drafted. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const action = parseSaveAction({ type: "draft", scope: body?.scope })
  if (!action) return Response.json({ error: "Unknown scope" }, { status: 400 })
  const demoId = demoIdOf(body?.d)
  const stored = await loadReport(demoId)
  if (!stored) return Response.json({ error: "No report for this demo" }, { status: 404 })

  const images = action.type === "draft" ? await photosInScope(demoId, stored, action.scope) : {}
  const out = await applySaved(stored, action, rateLimitedGemini(request), { fallback: fallbackModel, images })
  if (!out.ok) return Response.json({ report: stored, degraded: !!out.degraded }, { status: 409 })
  await saveReport(demoId, stored, out.report)
  return Response.json({ report: out.report, degraded: !!out.degraded })
}

/** The stored images of the uploaded photos this Draft covers, for Gemini to read. */
async function photosInScope(demoId: string, r: Report, scope: ExtractScope): Promise<CaptureImages> {
  const photos = capturesInScope(r, scope).filter((c) => c.kind === "photo" && c.photo === "upload")
  const loaded = await Promise.all(photos.map(async (c) => ({ id: c.id, image: await capturePhoto(demoId, c.id) })))
  return Object.fromEntries(loaded.flatMap(({ id, image }) => (image ? [[id, image]] : [])))
}
