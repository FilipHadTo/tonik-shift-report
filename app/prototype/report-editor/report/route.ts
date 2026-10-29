// The reviewer's report, stored in Neon (ticket 08). Everything is scoped by demo id (`d`, one per
// desktop browser), so a scene switch or Reset never touches another reviewer's demo (story 60).

import { demoIdOf, openReport, seedScene } from "@/lib/db"
import type { Scene } from "@/lib/report"

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
