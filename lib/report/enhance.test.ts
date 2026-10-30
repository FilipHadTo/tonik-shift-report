import { describe, expect, test } from "vitest"
import { fakeModel, fallbackModel, reducer, runEnhance, seedReport, type Action, type Report, type ReportModel } from "."

const run = (r: Report, ...actions: Action[]) => actions.reduce(reducer, r)

/** A model that always answers with one recorded response. */
const answers = (output: unknown): ReportModel => ({
  extract: async () => ({ drafts: [] }),
  enhance: async () => output,
})

const failing: ReportModel = {
  extract: async () => {
    throw new Error("down")
  },
  enhance: async () => {
    throw new Error("down")
  },
}

const ROUGH = "2 security short till 22:00, kuba covered side door"
const block = (r: Report, id = "b-sec-1") => r.blocks.find((b) => b.id === id)!

/** 02:15 scene plus an Incident the manager added and described in their own words. */
function withManualIncident(description: string) {
  return run(seedReport("end"), { type: "addIncident" }, { type: "editIncident", incident: "i-m3", patch: { description } })
}

describe("Enhance", () => {
  test("a whole manual block becomes a Draft from the manager's text", async () => {
    const { report, status } = await runEnhance(seedReport("end"), { block: "b-sec-1" }, fakeModel)
    expect(status).toBe("drafted")
    expect(block(report)).toMatchObject({
      text: "Two security staff short until 22:00, Kuba covered the side door.",
      status: "draft",
      original: { text: ROUGH, status: "manual" },
    })
  })

  test("a partial selection rewrites only that span", async () => {
    const start = ROUGH.indexOf("kuba")
    const { report } = await runEnhance(seedReport("end"), { block: "b-sec-1" }, fakeModel, {
      span: { start, end: ROUGH.length },
    })
    expect(block(report).text).toBe("2 security short till 22:00, kuba covered the side door.")
  })

  test("the span is rewritten against the text on screen, which becomes the original", async () => {
    const onScreen = "bar short till 23:00"
    const { report } = await runEnhance(seedReport("end"), { block: "b-sec-1" }, fakeModel, { text: onScreen })
    expect(block(report)).toMatchObject({ text: "Bar staff short until 23:00.", original: { text: onScreen } })
  })

  test("Discard restores exactly the original", async () => {
    const { report } = await runEnhance(seedReport("end"), { block: "b-sec-1" }, fakeModel)
    const back = block(run(report, { type: "discard", block: "b-sec-1" }))
    expect(back).toEqual(block(seedReport("end")))
  })

  test("an Incident's What happened gets a Draft inside it, and Discard keeps the original", async () => {
    const rough = "guy fell down stairs approx 1am, ppl helped him up"
    const { report, status } = await runEnhance(withManualIncident(rough), { incident: "i-m3" }, fakeModel)
    expect(status).toBe("drafted")
    const i = report.incidents.find((x) => x.id === "i-m3")!
    expect(i.description).toBe(rough)
    expect(i.descriptionDraft).toBe("Guy fell down stairs around 1am, people helped him up.")
    const back = run(report, { type: "discardIncidentDraft", incident: "i-m3" }).incidents.find((x) => x.id === "i-m3")!
    expect(back).toEqual(withManualIncident(rough).incidents.find((x) => x.id === "i-m3"))
  })

  test("no change gives no Draft", async () => {
    const r = run(seedReport("end"), { type: "editBlock", block: "b-sec-1", text: "Two security staff short until 22:00." })
    const { report, status } = await runEnhance(r, { block: "b-sec-1" }, fakeModel)
    expect(status).toBe("unchanged")
    expect(report).toBe(r)
  })

  test.each([
    ["an AI Draft", (r: Report) => r, { block: "b-c1-maintenance" }],
    ["kept AI text", (r: Report) => run(r, { type: "keep", block: "b-c1-maintenance" }), { block: "b-c1-maintenance" }],
    ["an AI Incident", (r: Report) => r, { incident: "i-c1" }],
    [
      "a confirmed Incident, even one the manager added",
      (r: Report) =>
        run(
          r,
          { type: "addIncident" },
          { type: "editIncident", incident: "i-m3", patch: { description: "guy fell down stairs" } },
          { type: "setField", incident: "i-m3", field: "occurredAt", value: "01:00" },
          { type: "setField", incident: "i-m3", field: "location", value: "Toilets" },
          { type: "setField", incident: "i-m3", field: "type", value: "Injury/medical" },
          { type: "confirm", incident: "i-m3" },
        ),
      { incident: "i-m3" },
    ],
    ["a Capture", (r: Report) => r, { block: "c4" }],
    [
      "a manual Incident with an Enhance Draft pending",
      (r: Report) => run(r, { type: "addIncident" }, { type: "editIncident", incident: "i-m3", patch: { description: "x y" } }, { type: "enhanced", result: { target: { incident: "i-m3" }, original: "x y", text: "X y." } }),
      { incident: "i-m3" },
    ],
    ["a submitted report", (r: Report) => ({ ...r, submittedAt: "05:00" }), { block: "b-sec-1" }],
  ] as const)("%s can't be enhanced", async (_, setup, target) => {
    const r = setup(seedReport("end"))
    const { report, status } = await runEnhance(r, target, fakeModel)
    expect(status).toBe("refused")
    expect(report).toBe(r)
  })

  test.each([
    ["the model fails", failing],
    ["the model answers nonsense", answers({ nope: true })],
    ["the model answers empty text", answers({ text: "  " })],
    ["the model answers malformed JSON", answers("{text: ")],
  ])("%s: the state is unchanged and flagged degraded", async (_, model) => {
    const r = seedReport("end")
    const { report, status } = await runEnhance(r, { block: "b-sec-1" }, model)
    expect(status).toBe("degraded")
    expect(report).toBe(r)
  })

  test("a model that never answers times out as degraded", async () => {
    const r = seedReport("end")
    const hanging: ReportModel = { ...failing, enhance: () => new Promise(() => {}) }
    const { report, status } = await runEnhance(r, { block: "b-sec-1" }, hanging, { timeoutMs: 10 })
    expect(status).toBe("degraded")
    expect(report).toBe(r)
  })
})

describe("Enhance fallback (ADR 0001: the demo never dies)", () => {
  test("when the model fails, the rule-based rewrite becomes the Draft, not degraded", async () => {
    const { report, status } = await runEnhance(seedReport("end"), { block: "b-sec-1" }, failing, { fallback: fallbackModel })
    expect(status).toBe("drafted")
    expect(block(report)).toMatchObject({
      text: "Two security staff short until 22:00, Kuba covered the side door.",
      status: "draft",
      original: { text: ROUGH, status: "manual" },
    })
  })

  test("a model answering nonsense also falls back", async () => {
    const { status } = await runEnhance(seedReport("end"), { block: "b-sec-1" }, answers({ nope: true }), { fallback: fallbackModel })
    expect(status).toBe("drafted")
  })

  test("when the fallback would change nothing either, it stays degraded: the model never said the text is clean", async () => {
    const r = run(seedReport("end"), { type: "editBlock", block: "b-sec-1", text: "Two security staff short until 22:00." })
    const { report, status } = await runEnhance(r, { block: "b-sec-1" }, failing, { fallback: fallbackModel })
    expect(status).toBe("degraded")
    expect(report).toBe(r)
  })

  test("when the fallback fails too, degraded and unchanged", async () => {
    const r = seedReport("end")
    const { report, status } = await runEnhance(r, { block: "b-sec-1" }, failing, { fallback: failing })
    expect(status).toBe("degraded")
    expect(report).toBe(r)
  })

  test("a working model is used as it is, never the fallback", async () => {
    const { report } = await runEnhance(seedReport("end"), { block: "b-sec-1" }, answers({ text: "Security was two short." }), { fallback: fallbackModel })
    expect(block(report).text).toBe("Security was two short.")
  })

  test("a model saying the text is clean is trusted: no Draft, no fallback", async () => {
    const r = seedReport("end")
    const { report, status } = await runEnhance(r, { block: "b-sec-1" }, answers({ text: ROUGH }), { fallback: fallbackModel })
    expect(status).toBe("unchanged")
    expect(report).toBe(r)
  })
})
