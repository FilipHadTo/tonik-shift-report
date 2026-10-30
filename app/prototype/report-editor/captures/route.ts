// Live Inbox (stories 11, 13, 61), stored in Neon. The capture page POSTs here and the desktop polls.
// Everything is scoped by demo id (`d`, carried by the QR link): a phone writes into that reviewer's
// report and nobody else's. Reset or a scene switch reseeds the report, which empties its phone Captures.

import { addPhoneCapture, demoIdOf, deviceCaptures, phoneCaptures } from "@/lib/db"
import { parsePhoneCapture } from "@/lib/report"

const DEVICE = /^[a-z0-9]{1,40}$/
const noStore = { "Cache-Control": "no-store" }

/**
 * Desktop: ?d=… returns every phone Capture in that demo's report.
 * Phone: ?d=…&device=… returns only that phone's Captures (story 11).
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const demoId = demoIdOf(params.get("d"))
  const device = params.get("device")
  if (device !== null && !DEVICE.test(device)) return Response.json({ error: "Invalid device" }, { status: 400 })
  const captures = device === null ? await phoneCaptures(demoId) : await deviceCaptures(demoId, device)
  return Response.json({ captures }, { headers: noStore })
}

/** A phone sends a Capture. Validated here; Captured-at is set by the server (story 10). */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const input = parsePhoneCapture(body)
  if (!input) return Response.json({ error: "Invalid Capture" }, { status: 400 })
  const capture = await addPhoneCapture(demoIdOf(body?.d), input)
  if (!capture) return Response.json({ error: "This report is submitted" }, { status: 409 })
  return Response.json(capture, { status: 201 })
}
