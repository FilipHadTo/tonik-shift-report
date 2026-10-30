import { describe, expect, test } from "vitest"
import { fakeModel, fallbackModel, reducer, runExtract, seedReport, statusOf, type Action, type ExtractRequest, type Report, type ReportModel } from "."

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

  test("a location quoted from a photo Capture without that text is a Gap", async () => {
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

  test("a chat line posted at 01:42 saying 'sometime before midnight' doesn't make 01:42 its Occurred-at (ticket 27)", async () => {
    const { report } = await runExtract(seedReport("end"), { capture: "c4" }, fakeModel)
    const theft = report.incidents.find((x) => x.sources.includes("c4"))!
    expect(theft.fields.occurredAt).toMatchObject({ status: "draft", value: "02:10" })
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

describe("Extract fallback (ADR 0001: the demo never dies)", () => {
  const down = failing(new Error("503 Service Unavailable"))

  test("when the model fails, seeded Captures draft from their recorded answers, not degraded", async () => {
    const r = seedReport("end")
    const out = await runExtract(r, { capture: "c2" }, down, { fallback: fallbackModel })
    expect(out.degraded).toBe(false)
    expect(out).toEqual(await runExtract(r, { capture: "c2" }, fakeModel))
  })

  test("bad output from the model also falls back", async () => {
    const r = seedReport("end")
    const out = await runExtract(r, { capture: "c2" }, answers("{ drafts: [ oops"), { fallback: fallbackModel })
    expect(out.degraded).toBe(false)
    expect(out.report.incidents.some((i) => i.sources.includes("c2"))).toBe(true)
  })

  test("a Capture with no recorded answer stays New and the run is degraded, report unchanged", async () => {
    const r = withTyped(TYPED)
    expect(await runExtract(r, { capture: "m6" }, down, { fallback: fallbackModel })).toEqual({ report: r, degraded: true })
  })

  test("Draft all with seeded and typed Captures: seeded ones are drafted, the typed one stays New, degraded", async () => {
    const r = withTyped(TYPED)
    const { report, degraded } = await runExtract(r, { all: true }, down, { fallback: fallbackModel })
    expect(degraded).toBe(true)
    expect(statusOf(report, report.captures.find((c) => c.id === "m6")!)).toBe("new")
    expect(report.blocks.some((b) => b.sources.includes("c4"))).toBe(true)
  })

  test("the fallback is never asked when the model answers", async () => {
    const r = withTyped(TYPED)
    let asked = false
    const spy: ReportModel = { extract: async () => ((asked = true), { drafts: [] }), enhance: async () => ({ text: "" }) }
    await runExtract(r, { capture: "m6" }, answers({ drafts: [incident()] }), { fallback: spy })
    expect(asked).toBe(false)
  })
})

describe("Extract reads photos (ADR 0008)", () => {
  const STOOL = { mime: "image/jpeg", data: "/9j/c3Rvb2w=" }

  /** 02:15 scene with a photo Marek sent from the phone at 01:30. */
  const withPhoto = (text = "") =>
    run(seedReport("end"), {
      type: "receive",
      captures: [{ id: "p-a1", kind: "photo", capturedAt: "01:30", author: { name: "Marek", role: "Door" }, text, photo: true }],
    })

  /** What Gemini answered for a photo of a broken bar stool (recorded, so tests never call it). */
  const stoolAnswer = (location?: unknown) => ({
    drafts: [
      {
        kind: "incident",
        title: "Broken bar stool",
        description: "A bar stool was found broken, with one leg snapped off.",
        sources: ["p-a1"],
        type: { value: "Property damage" },
        ...(location !== undefined && { location }),
      },
      { kind: "section", section: "maintenance", text: "Bar stool broken, one leg snapped off. Needs repair or replacing.", sources: ["p-a1"] },
    ],
  })

  const spying = (output: unknown) => {
    const seen: ExtractRequest[] = []
    const model: ReportModel = { extract: async (req) => (seen.push(req), output), enhance: async () => ({ text: "" }) }
    return { model, seen }
  }

  test("a photo's image goes to the model with its Capture; other Captures carry none", async () => {
    const r = withTyped(TYPED)
    const { model, seen } = spying({ drafts: [] })
    await runExtract(withPhoto(), { all: true }, model, { images: { "p-a1": STOOL, c4: STOOL } })
    const sent = Object.fromEntries(seen[0].captures.map((c) => [c.id, c.image]))
    expect(sent["p-a1"]).toEqual(STOOL)
    // Only photo Captures carry an image, whatever the caller passes.
    expect(sent.c4).toBeUndefined()
    await runExtract(r, { capture: "m6" }, model, { images: { "p-a1": STOOL } })
    expect(seen[1].captures.map((c) => c.id)).toEqual(["m6"])
  })

  test("a photo without a stored image goes as its words only", async () => {
    const { model, seen } = spying({ drafts: [] })
    await runExtract(withPhoto("found in smoking room"), { capture: "p-a1" }, model)
    expect(seen[0].captures[0]).not.toHaveProperty("image")
  })

  test("a captionless photo drafts an ordinary AI Draft from its image, with Gaps for what it can't tell", async () => {
    const { report, degraded } = await runExtract(withPhoto(), { capture: "p-a1" }, answers(stoolAnswer()), { images: { "p-a1": STOOL } })
    expect(degraded).toBe(false)
    const i = report.incidents.find((x) => x.sources.includes("p-a1"))!
    expect(i).toMatchObject({ title: "Broken bar stool", evidence: ["p-a1"], fromStaff: { name: "Marek", role: "Door" } })
    expect(i.fields.type).toMatchObject({ status: "draft", value: "Property damage" })
    expect(i.fields.location.status).toBe("gap")
    expect(i.fields.occurredAt).toMatchObject({ status: "draft", value: "01:30", source: "p-a1" })
    expect(report.blocks.find((b) => b.sources.includes("p-a1"))).toMatchObject({ section: "maintenance", status: "draft" })
  })

  test("a location read off the image alone is a Gap; one quoted from the caption is drafted", async () => {
    const seen = { value: "Smoking area", source: "p-a1", quote: "smoking area" }
    const off = await runExtract(withPhoto(), { capture: "p-a1" }, answers(stoolAnswer(seen)), { images: { "p-a1": STOOL } })
    expect(off.report.incidents.find((x) => x.sources.includes("p-a1"))!.fields.location.status).toBe("gap")

    const said = { value: "Smoking area", source: "p-a1", quote: "smoking room" }
    const on = await runExtract(withPhoto("found in smoking room"), { capture: "p-a1" }, answers(stoolAnswer(said)), { images: { "p-a1": STOOL } })
    expect(on.report.incidents.find((x) => x.sources.includes("p-a1"))!.fields.location).toMatchObject({ status: "draft", value: "Smoking area" })
  })

  test("when the model fails, a phone photo stays New and the run is degraded", async () => {
    const r = withPhoto()
    const down = failing(new Error("503 Service Unavailable"))
    expect(await runExtract(r, { capture: "p-a1" }, down, { fallback: fallbackModel, images: { "p-a1": STOOL } })).toEqual({ report: r, degraded: true })
  })
})
