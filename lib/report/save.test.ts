import { describe, expect, test } from "vitest"
import { applySaved, extract, receivePhoneCapture, fakeModel, fallbackModel, parseSaveAction, reducer, seedReport, statusOf, type Action, type Report, type ReportModel, type SaveAction } from "."

const run = (r: Report, ...actions: Action[]) => actions.reduce(reducer, r)

async function save(r: Report, ...actions: SaveAction[]) {
  for (const a of actions) {
    const out = await applySaved(r, a, fakeModel)
    if (!out.ok) throw new Error(`refused: ${a.type}`)
    r = out.report
  }
  return r
}

describe("parseSaveAction: what the browser may send", () => {
  test.each([
    null,
    "confirm",
    {},
    { type: "nope" },
    { type: "reset", scene: "end" },
    { type: "startDrafting", ids: ["c2"] },
    { type: "draftFailed", ids: ["c2"] },
    { type: "extracted", result: { incidents: [], blocks: [], read: [], found: {} } },
    { type: "enhanced", result: { target: { block: "b-sec-1" }, original: "", text: "x" } },
    { type: "confirm" },
    { type: "confirm", incident: 3 },
    { type: "setField", incident: "i-c1", field: "colour", value: "red" },
    { type: "setField", incident: "i-c1", field: "location", value: 3 },
    { type: "toggleSection", section: "kitchen sink" },
    { type: "editIncident", incident: "i-c1", patch: { confirmedAt: "01:00" } },
    { type: "addCapture", text: "   " },
    { type: "addCapture", text: "Fridge 2 is warm", id: "c2; drop" },
    { type: "addCapture", text: "Fridge 2 is warm", id: 7 },
    { type: "write", section: "security", text: "" },
    { type: "draft", scope: { capture: 2 } },
    { type: "enhance", target: { block: "b-sec-1" }, span: { start: "a", end: 2 } },
    { type: "receive", captures: [{ id: "p1", kind: "fax", capturedAt: "01:00", author: { name: "A", role: "Bar" }, text: "x" }] },
    { type: "receive", captures: [{ id: "p1", kind: "text", capturedAt: "1am", author: { name: "A", role: "Bar" }, text: "x" }] },
  ])("refuses %j", (raw) => {
    expect(parseSaveAction(raw)).toBeNull()
  })

  test.each<SaveAction>([
    { type: "confirm", incident: "i-c1" },
    { type: "confirm", incident: "i-c3", undo: true },
    { type: "setField", incident: "i-c1", field: "location", value: "Front door" },
    { type: "setField", incident: "i-c1", field: "location", value: null },
    { type: "editIncident", incident: "i-c1", patch: { title: "Window", description: "Broken." } },
    { type: "dismiss", id: "c6", undo: true },
    { type: "addCapture", text: "Fridge 2 is warm" },
    { type: "addCapture", text: "Fridge 2 is warm", id: "m-k3x9q2" },
    { type: "toggleSection", section: "kitchen" },
    { type: "draft", scope: { all: true } },
    { type: "draft", scope: { section: "bar" } },
    { type: "enhance", target: { incident: "i-m3" }, text: "abc", span: { start: 0, end: 3 } },
    { type: "keepAll" },
    { type: "invited" },
    { type: "submit", statement: true },
  ])("accepts $type", (a) => {
    expect(parseSaveAction(JSON.parse(JSON.stringify(a)))).toEqual(a)
  })

  test("drops fields it doesn't know", () => {
    expect(parseSaveAction({ type: "keep", block: "b-c1-maintenance", status: "manual" })).toEqual({ type: "keep", block: "b-c1-maintenance" })
  })
})

describe("applySaved: the server applies the same rules as the screen", () => {
  test("refuses Confirm on an Incident with a Gap, accepts it once the Gap is filled", async () => {
    const r = seedReport("end")
    expect(await applySaved(r, { type: "confirm", incident: "i-c1" }, fakeModel)).toEqual({ ok: false })

    const filled = await save(r, { type: "setField", incident: "i-c1", field: "location", value: "Front door" })
    const out = await applySaved(filled, { type: "confirm", incident: "i-c1" }, fakeModel)
    expect(out.ok && out.report.incidents.find((i) => i.id === "i-c1")?.confirmedAt).toBe("02:15")
  })

  test("refuses Confirm while an Enhance Draft is pending in the Incident", async () => {
    const r = await save(
      seedReport("end"),
      { type: "addIncident" },
      { type: "setField", incident: "i-m3", field: "occurredAt", value: "01:00" },
      { type: "setField", incident: "i-m3", field: "location", value: "Bar" },
      { type: "setField", incident: "i-m3", field: "type", value: "Theft" },
      { type: "enhance", target: { incident: "i-m3" }, text: "someone took a bag from the bar" },
    )
    expect(r.incidents.find((i) => i.id === "i-m3")?.descriptionDraft).toBeDefined()
    expect((await applySaved(r, { type: "confirm", incident: "i-m3" }, fakeModel)).ok).toBe(false)
  })

  test("refuses edits and Delete on a confirmed Incident; Reopen first", async () => {
    const r = seedReport("end")
    for (const a of [
      { type: "setField", incident: "i-c3", field: "location", value: "Bar" },
      { type: "editIncident", incident: "i-c3", patch: { title: "x" } },
      { type: "deleteIncident", incident: "i-c3" },
    ] satisfies SaveAction[])
      expect((await applySaved(r, a, fakeModel)).ok).toBe(false)

    const reopened = await save(r, { type: "confirm", incident: "i-c3", undo: true })
    expect((await applySaved(reopened, { type: "deleteIncident", incident: "i-c3" }, fakeModel)).ok).toBe(true)
  })

  test("Keep and Discard only apply to Drafts", async () => {
    const r = seedReport("end")
    expect((await applySaved(r, { type: "keep", block: "b-sec-1" }, fakeModel)).ok).toBe(false)
    expect((await applySaved(r, { type: "discard", block: "b-sec-1" }, fakeModel)).ok).toBe(false)
    expect((await applySaved(r, { type: "keep", block: "b-c1-maintenance" }, fakeModel)).ok).toBe(true)
    expect((await applySaved(r, { type: "keepIncidentDraft", incident: "i-c1" }, fakeModel)).ok).toBe(false)
  })

  test("refuses actions on things that don't exist", async () => {
    const r = seedReport("end")
    for (const a of [
      { type: "dismiss", id: "nope" },
      { type: "handled", id: "nope" },
      { type: "confirm", incident: "nope" },
      { type: "editBlock", block: "nope", text: "x" },
      { type: "draft", scope: { capture: "nope" } },
    ] satisfies SaveAction[])
      expect((await applySaved(r, a, fakeModel)).ok).toBe(false)
  })

  test("refuses Submit while blockers are left", async () => {
    expect((await applySaved(seedReport("end"), { type: "submit", statement: true }, fakeModel)).ok).toBe(false)
  })

  test("a typed Capture keeps the id the screen gave it, even when the screen hasn't seen every phone Capture (ticket 28)", async () => {
    const r = seedReport("end")
    const phone = receivePhoneCapture(r, { device: "phone1", kind: "text", text: "queue is huge", author: { name: "Marek", role: "Door" } }, "p-1")!.report
    // The screen hasn't polled p-1 yet; the server has it. Both must name the typed Capture the same.
    const screen = run(r, { type: "addCapture", text: "Fridge 2 is warm", id: "m-k3x9q2" })
    const server = await save(phone, { type: "addCapture", text: "Fridge 2 is warm", id: "m-k3x9q2" })
    expect(screen.captures.at(-1)?.id).toBe("m-k3x9q2")
    expect(server.captures.at(-1)?.id).toBe("m-k3x9q2")
  })

  test("refuses a typed Capture whose id is already taken", async () => {
    const r = await save(seedReport("end"), { type: "addCapture", text: "Fridge 2 is warm", id: "m-k3x9q2" })
    expect((await applySaved(r, { type: "addCapture", text: "again", id: "m-k3x9q2" }, fakeModel)).ok).toBe(false)
    expect((await applySaved(r, { type: "addCapture", text: "again", id: "c2" }, fakeModel)).ok).toBe(false)
  })

  test("a typed Capture gets its Captured-at from the stored report's clock", async () => {
    const r = await save(seedReport("end"), { type: "addCapture", text: "Fridge 2 is warm" })
    expect(r.captures.at(-1)).toMatchObject({ id: "m6", capturedAt: "02:15", text: "Fridge 2 is warm", author: r.manager })
  })

  test("Draft runs Extract on the stored report and gives what the screen showed", async () => {
    const r = seedReport("end")
    const scope = { capture: "c2" }
    const local = run(r, { type: "startDrafting", ids: ["c2"] })
    const result = await extract(local, scope, fakeModel)
    const screen = run(local, { type: "extracted", result: result! })

    const saved = await save(r, { type: "draft", scope })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const strip = (x: Report) => ({ ...x, captures: x.captures.map(({ drafting, ...c }) => c) })
    expect(strip(saved)).toEqual(strip(screen))
    expect(saved.blocks.length + saved.incidents.length).toBeGreaterThan(r.blocks.length + r.incidents.length)
  })

  test("Draft when the model fails: seeded Captures save from the fallback, a typed one is refused as degraded", async () => {
    const down: ReportModel = { extract: async () => Promise.reject(new Error("429")), enhance: async () => ({ text: "" }) }
    const r = seedReport("end")
    const seeded = await applySaved(r, { type: "draft", scope: { capture: "c2" } }, down, { fallback: fallbackModel })
    expect(seeded).toMatchObject({ ok: true, degraded: false })
    expect(seeded.ok && seeded.report.incidents.some((i) => i.sources.includes("c2"))).toBe(true)

    const typed = await save(r, { type: "addCapture", text: "Fridge 2 is warm" })
    expect(await applySaved(typed, { type: "draft", scope: { capture: "m6" } }, down, { fallback: fallbackModel })).toEqual({
      ok: false,
      degraded: true,
    })
  })

  test("Draft that finds nothing says so, and the Capture stays New (ticket 27)", async () => {
    const blank: ReportModel = { extract: async () => ({ drafts: [] }), enhance: async () => ({ text: "" }) }
    const typed = await save(seedReport("end"), { type: "addCapture", text: "Nothing much happened" })
    const out = await applySaved(typed, { type: "draft", scope: { capture: "m6" } }, blank)
    expect(out).toMatchObject({ ok: true, empty: true })
    expect(out.ok && statusOf(out.report, out.report.captures.find((c) => c.id === "m6")!)).toBe("new")

    const found = await applySaved(seedReport("end"), { type: "draft", scope: { capture: "c2" } }, fakeModel)
    expect(found.ok && found.empty).toBeFalsy()
  })

  test("Enhance runs on the stored report and only on the manager's own words", async () => {
    const r = seedReport("end")
    const out = await applySaved(r, { type: "enhance", target: { block: "b-sec-1" } }, fakeModel)
    expect(out.ok && out.report.blocks[0]).toMatchObject({ status: "draft", original: { status: "manual" } })
    expect((await applySaved(r, { type: "enhance", target: { block: "b-c1-maintenance" } }, fakeModel)).ok).toBe(false)
  })

  test("Enhance says why nothing was saved: clean text, a refused target, or a failed model", async () => {
    const r = seedReport("end")
    const clean = run(r, { type: "editBlock", block: "b-sec-1", text: "Two security staff short until 22:00." })
    const down: ReportModel = { extract: async () => ({ drafts: [] }), enhance: async () => Promise.reject(new Error("429")) }
    expect(await applySaved(clean, { type: "enhance", target: { block: "b-sec-1" } }, fakeModel)).toEqual({ ok: false, status: "unchanged" })
    expect(await applySaved(r, { type: "enhance", target: { block: "b-c1-maintenance" } }, fakeModel)).toEqual({ ok: false })
    expect(await applySaved(r, { type: "enhance", target: { block: "b-sec-1" } }, down)).toEqual({ ok: false, status: "degraded", degraded: true })
    const fell = await applySaved(r, { type: "enhance", target: { block: "b-sec-1" } }, down, { fallback: fallbackModel })
    expect(fell).toMatchObject({ ok: true, status: "drafted" })
    expect(fell.ok && fell.report.blocks[0]).toMatchObject({ status: "draft", original: { status: "manual" } })
  })
})

describe("ids stay unique", () => {
  test("an Incident added after a Delete never reuses an id", () => {
    const r = run(seedReport("end"), { type: "addIncident" }, { type: "confirm", incident: "i-c3", undo: true }, { type: "deleteIncident", incident: "i-c3" }, { type: "addIncident" })
    const ids = r.incidents.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test("a block written after a Discard never reuses an id", () => {
    const r = run(
      seedReport("end"),
      { type: "write", section: "bar", text: "one" },
      { type: "discard", block: "b-c1-maintenance" },
      { type: "write", section: "bar", text: "two" },
    )
    const ids = r.blocks.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
