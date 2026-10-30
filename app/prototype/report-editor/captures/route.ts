// Live Inbox (stories 11, 13, 61), stored in Neon. The capture page POSTs here and the desktop polls.
// Everything is scoped by report id (`r`, carried by the report's QR link, story 66): a phone writes into
// that report and no other. Reset or a scene switch reseeds the demo report, which empties its phone Captures.
// Links from before ticket 24 carry `d`, the demo id, which is also the demo report's id.

import { addPhoneCapture, deviceCaptures, phoneCaptures, reportIdOf } from "@/lib/db"
import { parsePhoneCapture } from "@/lib/report"

const DEVICE = /^[a-z0-9]{1,40}$/
const noStore = { "Cache-Control": "no-store" }
/** A downsized photo (≤ 600 KB, about 800 KB as base64) plus the rest; anything bigger is refused unread. */
const MAX_BODY = 1024 * 1024

const reportOf = (v: { r?: unknown; d?: unknown } | null) => reportIdOf(v?.r ?? v?.d)
const notFound = () => Response.json({ error: "No such report" }, { status: 404 })

/**
 * Desktop: ?r=… returns every phone Capture in that report.
 * Phone: ?r=…&device=… returns the report's Night and only that phone's Captures (story 11).
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const reportId = reportOf({ r: params.get("r"), d: params.get("d") })
  if (!reportId) return notFound()
  const device = params.get("device")
  if (device === null) return Response.json({ captures: await phoneCaptures(reportId) }, { headers: noStore })
  if (!DEVICE.test(device)) return Response.json({ error: "Invalid device" }, { status: 400 })
  const mine = await deviceCaptures(reportId, device)
  return mine ? Response.json(mine, { headers: noStore }) : notFound()
}

/**
 * A phone sends a Capture, a photo with its downsized image (ticket 18). Validated here; Captured-at
 * is set by the server (story 10), on the report's clock.
 */
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY) return tooLarge()
  const raw = await request.text().catch(() => "")
  if (raw.length > MAX_BODY) return tooLarge()
  let body: { r?: unknown; d?: unknown } | null = null
  try {
    body = JSON.parse(raw)
  } catch {}
  const input = parsePhoneCapture(body)
  if (!input) return Response.json({ error: "Invalid Capture" }, { status: 400 })
  const reportId = reportOf(body)
  if (!reportId) return notFound()
  const capture = await addPhoneCapture(reportId, input, new Date())
  if (capture === "missing") return notFound()
  if (capture === "submitted") return Response.json({ error: "This report is submitted" }, { status: 409 })
  return Response.json(capture, { status: 201 })
}

const tooLarge = () => Response.json({ error: "Photo too large" }, { status: 413 })
