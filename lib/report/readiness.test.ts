import { describe, expect, test } from "vitest"
import { fakeModel, readiness, reducer, runExtract, seedReport, type Action, type Report } from "."

const run = (r: Report, ...actions: Action[]) => actions.reduce(reducer, r)

describe("Submission readiness", () => {
  test("lists each unconfirmed Incident with what it's missing, the open Drafts and the statement", async () => {
    const { report: r } = await runExtract(seedReport("end"), { capture: "c6" }, fakeModel)
    expect(readiness(r, { statement: false })).toEqual({
      ready: false,
      blockers: [
        { kind: "incident", id: "i-c1", missing: ["location"], pendingEnhance: false },
        { kind: "drafts", ids: ["b-c1-maintenance", "b-c6-inventory"] },
        { kind: "statement" },
      ],
    })
  })

  test("a pending Section Draft alone blocks", () => {
    const r = run(
      seedReport("end"),
      { type: "setField", incident: "i-c1", field: "location", value: "Front door" },
      { type: "confirm", incident: "i-c1" },
    )
    expect(readiness(r, { statement: true })).toEqual({
      ready: false,
      blockers: [{ kind: "drafts", ids: ["b-c1-maintenance"] }],
    })
  })

  test("a pending Enhance Draft blocks, on a block and inside an Incident", () => {
    let r = run(
      seedReport("end"),
      { type: "setField", incident: "i-c1", field: "location", value: "Front door" },
      { type: "confirm", incident: "i-c1" },
      { type: "keep", block: "b-c1-maintenance" },
      { type: "enhance", block: "b-sec-1", text: "Two security staff short until 22:00." },
    )
    expect(readiness(r, { statement: true })).toEqual({ ready: false, blockers: [{ kind: "drafts", ids: ["b-sec-1"] }] })

    r = run(
      r,
      { type: "keep", block: "b-sec-1" },
      { type: "addIncident" },
      { type: "setField", incident: "i-m3", field: "occurredAt", value: "01:00" },
      { type: "setField", incident: "i-m3", field: "location", value: "Toilets" },
      { type: "setField", incident: "i-m3", field: "type", value: "Drugs" },
      { type: "enhanceIncident", incident: "i-m3", text: "Clean text." },
    )
    expect(readiness(r, { statement: true })).toEqual({
      ready: false,
      blockers: [
        { kind: "incident", id: "i-m3", missing: [], pendingEnhance: true },
        { kind: "drafts", ids: ["i-m3"] },
      ],
    })
  })

  test("ready when every Incident is confirmed, every Draft checked and the statement ticked", () => {
    const r = run(
      seedReport("end"),
      { type: "setField", incident: "i-c1", field: "location", value: null },
      { type: "confirm", incident: "i-c1" },
      { type: "discard", block: "b-c1-maintenance" },
    )
    expect(readiness(r, { statement: true })).toEqual({ ready: true })
  })
})
