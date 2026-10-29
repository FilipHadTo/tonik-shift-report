import { describe, expect, test } from "vitest"
import { fakeModel, reducer, runExtract, seedReport, statusOf, type Action, type Report, type ReportModel } from "."

const run = (r: Report, ...actions: Action[]) => actions.reduce(reducer, r)

/** A model that always answers with one recorded response. */
const answers = (output: unknown): ReportModel => ({
  extract: async () => output,
  enhance: async () => ({ text: "" }),
})

const failing = (error: Error): ReportModel => ({
  extract: async () => {
    throw error
  },
  enhance: async () => {
    throw error
  },
})

/** 02:15 scene with one more Capture the manager typed at 02:15. */
function withTyped(text: string) {
  return run(seedReport("end"), { type: "addCapture", text })
}

const incident = (over: Record<string, unknown> = {}) => ({
  kind: "incident",
  title: "Spilled drink, guest slipped",
  description: "Guest slipped on a spilled drink by the toilets and hurt her wrist.",
  sources: ["m6"],
  occurredAt: { value: "02:00", source: "m6" },
  location: { value: "Toilets", source: "m6", quote: "by the toilets" },
  type: { value: "Injury/medical" },
  ...over,
})

const TYPED = "girl slipped on a spilled drink by the toilets, hurt her wrist, gave her ice"

describe("Extract", () => {
  test("a field the model fills without a source becomes a Gap", async () => {
    const r = withTyped(TYPED)
    const { report } = await runExtract(r, { capture: "m6" }, answers({ drafts: [incident({ location: null, type: undefined })] }))
    const i = report.incidents.find((x) => x.sources.includes("m6"))!
    expect(i.fields.location.status).toBe("gap")
    expect(i.fields.type.status).toBe("gap")
  })

  test("a location no Capture text supports becomes a Gap", async () => {
    const r = withTyped(TYPED)
    const { report } = await runExtract(
      r,
      { capture: "m6" },
      answers({ drafts: [incident({ location: { value: "Dance floor", source: "m6", quote: "on the dance floor" } })] }),
    )
    expect(report.incidents.find((x) => x.sources.includes("m6"))!.fields.location.status).toBe("gap")
  })

  test("the AI never reads a photo: a location quoted from a photo without that text is a Gap", async () => {
    const r = run(seedReport("end"), { type: "deleteIncident", incident: "i-c1" })
    const { report } = await runExtract(
      r,
      { capture: "c1" },
      answers({
        drafts: [{ kind: "incident", title: "Broken window", description: "Window smashed.", sources: ["c1"], location: { value: "Side entrance", source: "c1", quote: "side entrance" }, type: { value: "Property damage" } }],
      }),
    )
    expect(report.incidents.find((x) => x.sources.includes("c1"))!.fields.location.status).toBe("gap")
  })

  test("a supported location is drafted, matched to the list", async () => {
    const r = withTyped(TYPED)
    const { report } = await runExtract(r, { capture: "m6" }, answers({ drafts: [incident({ location: { value: "toilets", source: "m6", quote: "BY THE TOILETS" } })] }))
    expect(report.incidents.find((x) => x.sources.includes("m6"))!.fields.location).toMatchObject({ status: "draft", value: "Toilets" })
  })

  test("Occurred-at falls back to the Captured-at of the source Capture", async () => {
    const r = withTyped(TYPED)
    for (const occurredAt of [undefined, { value: "around two", source: "m6" }, { value: "02:40", source: "m6" }]) {
      const { report } = await runExtract(r, { capture: "m6" }, answers({ drafts: [incident({ occurredAt })] }))
      const i = report.incidents.find((x) => x.sources.includes("m6"))!
      expect(i.fields.occurredAt).toMatchObject({ status: "draft", value: i.capturedAt })
    }
  })

  test("Occurred-at is the time the Capture states", async () => {
    const r = withTyped(TYPED)
    const { report } = await runExtract(r, { capture: "m6" }, answers({ drafts: [incident()] }))
    expect(report.incidents.find((x) => x.sources.includes("m6"))!.fields.occurredAt).toMatchObject({ status: "draft", value: "02:00" })
  })

  test("a pasted chat's Incident gets Occurred-at from the line's timestamp, never an unstated time", async () => {
    const r = seedReport("end")
    const chatIncident = (value: string) => ({
      drafts: [{ kind: "incident", title: "Phone stolen", description: "Phone stolen from a coat.", sources: ["c4"], occurredAt: { value, source: "c4" }, location: { value: "Cloakroom", source: "c4", quote: "cloakroom" }, type: { value: "Theft" } }],
    })
    const stated = await runExtract(r, { capture: "c4" }, answers(chatIncident("01:42")))
    expect(stated.report.incidents.find((x) => x.sources.includes("c4"))!.fields.occurredAt).toMatchObject({ value: "01:42" })
    const made_up = await runExtract(r, { capture: "c4" }, answers(chatIncident("01:30")))
    expect(made_up.report.incidents.find((x) => x.sources.includes("c4"))!.fields.occurredAt).toMatchObject({ value: "02:10" })
  })

  test("an off-list type becomes Other with the model's text", async () => {
    const r = withTyped(TYPED)
    const { report } = await runExtract(r, { capture: "m6" }, answers({ drafts: [incident({ type: { value: "Slip and fall" } })] }))
    expect(report.incidents.find((x) => x.sources.includes("m6"))!.fields.type).toMatchObject({ status: "draft", value: "Other: Slip and fall" })
  })

  test("references to missing Captures are dropped, and a Draft with none left is dropped", async () => {
    const r = withTyped(TYPED)
    const { report } = await runExtract(
      r,
      { capture: "m6" },
      answers({
        drafts: [
          incident({ sources: ["m6", "c99"] }),
          { kind: "section", section: "bar", text: "Bar ran out of ice.", sources: ["c99"] },
        ],
      }),
    )
    const added = report.incidents.filter((x) => x.sources.includes("m6"))
    expect(added).toHaveLength(1)
    expect(added[0].sources).toEqual(["m6"])
    expect(report.blocks.some((b) => b.section === "bar")).toBe(false)
  })

  test("only adds Drafts from the Captures in scope, and never changes existing content", async () => {
    const r = withTyped(TYPED)
    const { report } = await runExtract(
      r,
      { capture: "m6" },
      answers({
        drafts: [
          incident(),
          { kind: "section", section: "inventory", text: "Out of Aperol.", sources: ["c6"] },
          { kind: "section", section: "security", text: "Rewritten security.", sources: ["c3"] },
        ],
      }),
    )
    expect(report.blocks).toEqual(r.blocks)
    expect(report.incidents.slice(0, r.incidents.length)).toEqual(r.incidents)
    expect(report.incidents).toHaveLength(r.incidents.length + 1)
  })

  test("never sends processed, dismissed or hand-written Captures to the model", async () => {
    const r = run(withTyped(TYPED), { type: "dismiss", id: "c6" }, { type: "handled", id: "c2" })
    let seen: string[] = []
    const spy: ReportModel = {
      extract: async (req) => {
        seen = req.captures.map((c) => c.id)
        return { drafts: [] }
      },
      enhance: async () => ({ text: "" }),
    }
    await runExtract(r, { all: true }, spy)
    expect(seen.sort()).toEqual(["c4", "m6"])
  })

  test("on a partly used Capture, drafts only the missing part, in every scope", async () => {
    const r = run(seedReport("end"), { type: "deleteIncident", incident: "i-c1" })
    expect(statusOf(r, r.captures.find((c) => c.id === "c1")!)).toBe("new")
    for (const scope of [{ capture: "c1" }, { all: true as const }, { section: "incidents" as const }]) {
      const { report } = await runExtract(r, scope, fakeModel)
      expect(report.blocks.filter((b) => b.sources.includes("c1"))).toHaveLength(1)
      expect(report.incidents.filter((i) => i.sources.includes("c1"))).toHaveLength(1)
    }
  })

  test("Draft from inbox for one Section drafts only that Section and leaves the rest New", async () => {
    const r = seedReport("end")
    const { report } = await runExtract(r, { section: "security" }, fakeModel)
    const added = report.blocks.filter((b) => !r.blocks.some((x) => x.id === b.id))
    expect(added.map((b) => b.section)).toEqual(["security"])
    expect(report.incidents).toEqual(r.incidents)
    expect(statusOf(report, report.captures.find((c) => c.id === "c4")!)).toBe("new")
  })

  test("the model picks the Section, falling back to General overview, and a hidden Section is shown", async () => {
    const r = withTyped(TYPED)
    const { report } = await runExtract(
      r,
      { capture: "m6" },
      answers({
        drafts: [
          { kind: "section", section: "Bar staff", text: "Bar out of ice.", sources: ["m6"] },
          { kind: "section", section: "Weather", text: "Raining all night.", sources: ["m6"] },
        ],
      }),
    )
    expect(report.blocks.find((b) => b.text === "Bar out of ice.")?.section).toBe("bar")
    expect(report.blocks.find((b) => b.text === "Raining all night.")?.section).toBe("overview")
    expect(report.visible).toContain("bar")
  })

  test("Incident-looking content sent as Section text becomes an Incident", async () => {
    const r = withTyped(TYPED)
    const { report } = await runExtract(
      r,
      { capture: "m6" },
      answers({ drafts: [{ kind: "section", section: "incidents", text: "Guest slipped by the toilets.", sources: ["m6"] }] }),
    )
    const i = report.incidents.find((x) => x.sources.includes("m6"))!
    expect(i.description).toBe("Guest slipped by the toilets.")
    expect(i.fields.type.status).toBe("gap")
    expect(report.blocks.some((b) => b.sources.includes("m6"))).toBe(false)
  })

  test("an Incident from a Staff Member's Capture says who, and a photo becomes its Evidence", async () => {
    const r = run(seedReport("end"), { type: "deleteIncident", incident: "i-c1" })
    const { report } = await runExtract(r, { all: true }, fakeModel)
    expect(report.incidents.find((i) => i.sources.includes("c2"))!.fromStaff).toEqual({ name: "Marek", role: "Door" })
    expect(report.incidents.find((i) => i.sources.includes("c1"))!.evidence).toEqual(["c1"])
  })

  test.each([
    ["malformed output", answers("{ drafts: [ oops")],
    ["output without drafts", answers({ items: [] })],
    ["a model error", failing(new Error("429 Too Many Requests"))],
    ["a timeout", failing(new Error("Timed out"))],
  ])("%s leaves the report unchanged, flagged degraded", async (_, model) => {
    const r = withTyped(TYPED)
    expect(await runExtract(r, { all: true }, model)).toEqual({ report: r, degraded: true })
  })

  test("a model that never answers times out, degraded", async () => {
    const r = withTyped(TYPED)
    const hanging: ReportModel = { extract: () => new Promise(() => {}), enhance: () => new Promise(() => {}) }
    expect(await runExtract(r, { all: true }, hanging, { timeoutMs: 10 })).toEqual({ report: r, degraded: true })
  })
})
