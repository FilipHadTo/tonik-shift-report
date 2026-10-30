import { describe, expect, it } from "vitest"
import { cleanReport, reducer, seedReport, type Action, type Report } from "../report"
import { fromRecords, toRecords } from "./records"

/** `drafting` is a transient UI flag and is never stored. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stored = (r: Report): Report => ({ ...r, captures: r.captures.map(({ drafting, ...c }) => c) })

describe("report records", () => {
  it.each(["start", "end"] as const)("round-trip the %s scene unchanged", (scene) => {
    const r = seedReport(scene)
    expect(fromRecords(toRecords(r))).toEqual(stored(r))
  })

  it("round-trip a clean report, keyed by its own id in the demo id's list", () => {
    const r = cleanReport(new Date("2026-10-30T21:40:00Z"))
    const rec = toRecords(r, { id: "r-abc", demoId: "demo1" })
    expect(rec.report).toMatchObject({ id: "r-abc", demoId: "demo1", kind: "clean" })
    expect(fromRecords(rec)).toEqual(r)
  })

  it("key every Capture, Incident and block by the report id", () => {
    const rec = toRecords(seedReport("end"), { id: "demo1", demoId: "demo1" })
    for (const row of [...rec.captures, ...rec.incidents, ...rec.blocks]) expect(row.reportId).toBe("demo1")
  })

  it("round-trip manager edits, kept and Enhance Drafts, dismissed and handled Captures", () => {
    let r = seedReport("end")
    r = reducer(r, { type: "addIncident" })
    r = reducer(r, { type: "setField", incident: "i-c1", field: "location", value: "Front door" })
    r = reducer(r, { type: "setField", incident: "i-c1", field: "type", value: null })
    r = reducer(r, { type: "dismiss", id: "c6" })
    r = reducer(r, { type: "handled", id: "c2" })
    r = reducer(r, {
      type: "enhanced",
      result: { target: { block: "b-sec-1" }, original: r.blocks[0].text, text: "Security was two short until 22:00." },
    })
    expect(fromRecords(toRecords(r))).toEqual(stored(r))
  })

  it("record provenance and source Captures per Incident field and block", () => {
    const rec = toRecords(seedReport("end"))
    const fight = rec.incidents.find((i) => i.id === "i-c3")!
    expect(fight.provenance).toBe("confirmed")
    expect(fight.occurredAt).toMatchObject({ state: "value", provenance: "confirmed", sources: ["c3"] })
    const window = rec.incidents.find((i) => i.id === "i-c1")!
    expect(window.provenance).toBe("ai-drafted")
    expect(window.location).toMatchObject({ state: "gap", sources: [] })
    expect(window.confirmedAt).toBeNull()
    expect(rec.blocks.find((b) => b.id === "b-sec-1")).toMatchObject({ provenance: "manager-entered", sources: [] })
  })

  it("round-trip a submitted report: who, when, the statement and the AI-assisted mark", () => {
    const r = [
      { type: "setField", incident: "i-c1", field: "location", value: null },
      { type: "confirm", incident: "i-c1" },
      { type: "discard", block: "b-c1-maintenance" },
      { type: "submit", statement: true },
    ].reduce((x, a) => reducer(x, a as Action), seedReport("end"))
    expect(r.submittedBy).toBeDefined()
    expect(fromRecords(toRecords(r))).toEqual(stored(r))
  })

  it("never store the transient drafting flag", () => {
    const r = reducer(seedReport("end"), { type: "startDrafting", ids: ["c2"] })
    expect(fromRecords(toRecords(r)).captures.find((c) => c.id === "c2")?.drafting).toBeUndefined()
  })
})
