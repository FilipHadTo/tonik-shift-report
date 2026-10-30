import { describe, expect, test } from "vitest"
import { attachmentsOf, cleanReport, incidentTime, notCoveredTonight, reducer, seedReport, tally, type Action, type Report } from "."

const run = (r: Report, ...actions: Action[]) => actions.reduce(reducer, r)

describe("Not covered tonight", () => {
  test("names every Section without content, in the report's order, and leaves out Incidents when there are some", () => {
    // 02:15 scene: General overview is empty, Incidents has two, Security and Maintenance have text.
    expect(notCoveredTonight(seedReport("end"))).toEqual([
      "General overview",
      "Audience",
      "Artist & crew",
      "Door staff",
      "Production / run of show",
      "Bar staff",
      "Kitchen",
      "Third-party vendors",
      "Private events",
      "Inventory",
    ])
  })

  test("names Incidents too when there are none, instead of claiming there were none", () => {
    const r = run(cleanReport(new Date("2026-10-30T20:00:00Z")), { type: "write", section: "security", text: "Quiet night." })
    const line = notCoveredTonight(r)
    expect(line).toContain("Incidents")
    expect(line).not.toContain("Security")
    expect(line).toHaveLength(12)
  })
})

describe("Incident time", () => {
  const i = seedReport("end").incidents.find((x) => x.id === "i-c3")!
  test("shows the Occurred-at and the logged time", () => {
    expect(incidentTime({ ...i, fields: { ...i.fields, occurredAt: { status: "filled", value: "01:10" } } })).toBe("01:10 (logged 01:15)")
  })
  test("says the time is unknown, never guesses it", () => {
    expect(incidentTime({ ...i, fields: { ...i.fields, occurredAt: { status: "unknown" } } })).toBe("Time unknown (logged 01:15)")
  })
})

describe("Attachments", () => {
  test("lists photo Evidence once each, labelled by the Incidents it belongs to, in Incident order", () => {
    const r = seedReport("end")
    const out = attachmentsOf(r)
    expect(out.map((a) => [a.capture.id, a.incidents])).toEqual([["c1", [1]]])
  })

  test("voice Evidence is not an attachment (it is in the Captures)", () => {
    const r = seedReport("end")
    expect(attachmentsOf(r).some((a) => a.capture.kind === "voice")).toBe(false)
  })
})

describe("Tally for the header", () => {
  test("counts Captures per person (dismissed ones left out), Incidents and Sections covered", () => {
    const r = run(seedReport("end"), { type: "dismiss", id: "c6" })
    expect(tally(r)).toEqual({
      captures: 4,
      people: [
        { author: { name: "Alex Morgan", role: "Closing Manager" }, count: 3 },
        { author: { name: "Marek", role: "Door" }, count: 1 },
      ],
      incidents: 2,
      covered: 3,
      sections: 13,
    })
  })
})
