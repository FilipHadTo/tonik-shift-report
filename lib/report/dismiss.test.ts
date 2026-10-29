import { describe, expect, test } from "vitest"
import { reducer, seedReport, statusOf, targetsOf, type Action, type Report } from "."

const run = (r: Report, ...actions: Action[]) => actions.reduce(reducer, r)
const capture = (r: Report, id: string) => r.captures.find((c) => c.id === id)!

describe("Dismiss", () => {
  test("on a partly used Capture covers only the missing part: In report, still cited, not dismissed", () => {
    // 02:15 scene: the window photo (c1) fed Incident i-c1 and a Maintenance block. Deleting the Incident leaves it partly used.
    const partly = run(seedReport("end"), { type: "deleteIncident", incident: "i-c1" }, { type: "keep", block: "b-c1-maintenance" })
    expect(statusOf(partly, capture(partly, "c1"))).toBe("new")

    const r = run(partly, { type: "dismiss", id: "c1" })
    const c = capture(r, "c1")
    expect(statusOf(r, c)).toBe("in-report")
    expect(c.dismissed).toBeFalsy()
    expect(targetsOf(r, c).map((t) => t.label)).toEqual(["Maintenance"])
    expect(r.blocks.find((b) => b.id === "b-c1-maintenance")?.sources).toContain("c1")
  })

  test("on a partly used Capture whose part is still a Draft, it leaves New and waits for review", () => {
    const r = run(seedReport("end"), { type: "deleteIncident", incident: "i-c1" }, { type: "dismiss", id: "c1" })
    expect(statusOf(r, capture(r, "c1"))).toBe("drafted")
    expect(capture(r, "c1").dismissed).toBeFalsy()
  })

  test("on an unused Capture still dismisses it, and restore brings it back to New", () => {
    const dismissed = run(seedReport("end"), { type: "dismiss", id: "c2" })
    expect(statusOf(dismissed, capture(dismissed, "c2"))).toBe("dismissed")

    const restored = run(dismissed, { type: "dismiss", id: "c2", undo: true })
    expect(statusOf(restored, capture(restored, "c2"))).toBe("new")
  })
})
