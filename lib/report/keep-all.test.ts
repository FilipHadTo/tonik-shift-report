import { describe, expect, test } from "vitest"
import { openDrafts, readiness, reducer, seedReport, type Action, type Report } from "."

const run = (r: Report, ...actions: Action[]) => actions.reduce(reducer, r)

describe("Keep all", () => {
  test("keeps every Section and Enhance Draft, leaves Incidents unconfirmed; readiness then lists only the Incidents and the statement", () => {
    // 02:15 scene: i-c1 has a Gap and b-c1-maintenance is a Section Draft. Add an Enhance Draft on a block and inside an Incident.
    const before = run(
      seedReport("end"),
      {
        type: "enhanced",
        result: { target: { block: "b-sec-1" }, original: "2 security short till 22:00, kuba covered side door", text: "Two security staff short until 22:00." },
      },
      { type: "addIncident" },
      { type: "enhanced", result: { target: { incident: "i-m3" }, original: "", text: "Clean text." } },
    )
    expect(openDrafts(before)).toEqual(["b-sec-1", "b-c1-maintenance", "i-m3"])

    const r = run(before, { type: "keepAll" })

    expect(openDrafts(r)).toEqual([])
    expect(r.blocks.find((b) => b.id === "b-c1-maintenance")?.status).toBe("kept")
    expect(r.blocks.find((b) => b.id === "b-sec-1")).toMatchObject({ status: "kept", text: "Two security staff short until 22:00." })
    const enhanced = r.incidents.find((i) => i.id === "i-m3")!
    expect(enhanced.description).toBe("Clean text.")
    expect(enhanced.descriptionDraft).toBeUndefined()
    expect(r.incidents.map((i) => i.confirmedAt)).toEqual(before.incidents.map((i) => i.confirmedAt))

    const check = readiness(r, { statement: false })
    expect(check.ready).toBe(false)
    expect(!check.ready && check.blockers.map((b) => b.kind + ("id" in b ? `:${b.id}` : ""))).toEqual([
      "incident:i-c1",
      "incident:i-m3",
      "statement",
    ])
  })

  test("leaves manual and already kept blocks as they are", () => {
    const r = seedReport("end")
    const settled = r.blocks.filter((b) => b.status !== "draft")
    expect(run(r, { type: "keepAll" }).blocks.filter((b) => settled.some((s) => s.id === b.id))).toEqual(settled)
  })
})
