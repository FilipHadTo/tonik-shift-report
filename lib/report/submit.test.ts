import { describe, expect, test } from "vitest"
import { REVIEW_STATEMENT, applySaved, fakeModel, parseSaveAction, reducer, seedReport, type Action, type Report, type SaveAction } from "."

const run = (r: Report, ...actions: Action[]) => actions.reduce(reducer, r)

/** The 02:15 scene with nothing left to do but tick the statement. */
const ready = () =>
  run(
    seedReport("end"),
    { type: "setField", incident: "i-c1", field: "location", value: null },
    { type: "confirm", incident: "i-c1" },
    { type: "discard", block: "b-c1-maintenance" },
  )

async function submitted() {
  const out = await applySaved(ready(), { type: "submit", statement: true }, fakeModel)
  if (!out.ok) throw new Error("submit refused")
  return out.report
}

describe("Submission (stories 53–56)", () => {
  test("the browser sends whether the statement is ticked; anything else counts as not ticked", () => {
    expect(parseSaveAction({ type: "submit", statement: true })).toEqual({ type: "submit", statement: true })
    expect(parseSaveAction({ type: "submit" })).toEqual({ type: "submit", statement: false })
    expect(parseSaveAction({ type: "submit", statement: "yes" })).toEqual({ type: "submit", statement: false })
  })

  test("refused with blockers left, even with the statement ticked", async () => {
    expect(await applySaved(seedReport("end"), { type: "submit", statement: true }, fakeModel)).toEqual({ ok: false })
  })

  test("refused without the statement, even when nothing else blocks", async () => {
    expect(await applySaved(ready(), { type: "submit", statement: false }, fakeModel)).toEqual({ ok: false })
  })

  test("saves the statement, who submitted and when, and marks the report AI-assisted", async () => {
    const r = await submitted()
    expect(r).toMatchObject({
      submittedAt: "02:16", // the demo clock moved on with the Confirm
      submittedBy: r.manager,
      statement: REVIEW_STATEMENT,
      aiAssisted: true,
    })
  })

  test("an open report carries none of it", () => {
    const r = ready()
    expect([r.submittedAt, r.submittedBy, r.statement, r.aiAssisted]).toEqual([undefined, undefined, undefined, undefined])
  })

  test.each<SaveAction>([
    { type: "addCapture", text: "Fridge 2 is warm" },
    { type: "dismiss", id: "c6" },
    { type: "handled", id: "c2" },
    { type: "draft", scope: { all: true } },
    { type: "enhance", target: { block: "b-sec-1" } },
    { type: "editBlock", block: "b-sec-1", text: "x" },
    { type: "write", section: "bar", text: "x" },
    { type: "keepAll" },
    { type: "confirm", incident: "i-c3", undo: true },
    { type: "setField", incident: "i-c1", field: "location", value: "Front door" },
    { type: "editIncident", incident: "i-c1", patch: { title: "x" } },
    { type: "deleteIncident", incident: "i-c1" },
    { type: "addIncident" },
    { type: "toggleSection", section: "kitchen" },
    { type: "invited" },
    { type: "submit", statement: true },
  ])("after Submit the server refuses $type", async (a) => {
    expect(await applySaved(await submitted(), a, fakeModel)).toEqual({ ok: false })
  })

  test("after Submit the reducer changes nothing either, so the screen can't drift from the record", async () => {
    const r = await submitted()
    expect(run(r, { type: "addIncident" }, { type: "confirm", incident: "i-c3", undo: true }, { type: "keepAll" })).toBe(r)
  })

  test("Reset brings the scene back to open", async () => {
    const r = reducer(await submitted(), { type: "reset", scene: "end" })
    expect(r.submittedAt).toBeUndefined()
    expect(r).toEqual(seedReport("end"))
  })
})
