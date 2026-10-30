import { describe, expect, test } from "vitest"
import { extractRequest, seedReport } from "../report"
import { extractPrompt, extractSchema } from "./extract-prompt"

describe("Gemini Extract prompt", () => {
  const request = extractRequest(seedReport("end"), { all: true })

  test("sends a Capture's words, author and time, never a photo", () => {
    const prompt = extractPrompt(request)
    expect(prompt).toContain('"author": "Alex Morgan (Closing Manager)"')
    expect(prompt).not.toMatch(/"photo"|window\.jpg/)
    // The pasted chat keeps its line timestamps, so Occurred-at can come from them.
    expect(prompt).toContain('"at": "01:42"')
  })

  test("the schema only allows this request's Captures as sources", () => {
    const schema = JSON.stringify(extractSchema(request))
    for (const c of request.captures) expect(schema).toContain(`"${c.id}"`)
    expect(schema).not.toContain('"m6"')
  })
})
