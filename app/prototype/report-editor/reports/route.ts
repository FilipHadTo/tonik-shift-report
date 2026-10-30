// Reports (stories 59, 63–65, 71): the reviewer's list of Shift Reports, kept per demo id, so nobody sees
// another reviewer's reports. The demo report is seeded on the first visit and pinned first.

import { createReport, demoIdOf, listReports } from "@/lib/db"

/** ?d=… answers { reports }: one row per report, the demo report first, then the newest first. */
export async function GET(request: Request) {
  const reports = await listReports(demoIdOf(new URL(request.url).searchParams.get("d")))
  return Response.json({ reports }, { headers: { "Cache-Control": "no-store" } })
}

/** "New report": body { d }. Starts a clean report on the real clock and answers { id }. No limit on how many. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const id = await createReport(demoIdOf(body?.d), new Date())
  return Response.json({ id }, { status: 201 })
}
