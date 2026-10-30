import { describe, expect, test } from "vitest"
import { extractRequest, reducer, seedReport } from "../report"
import { EXTRACT_INSTRUCTIONS, extractContents, extractPrompt, extractSchema } from "./extract-prompt"

describe("Gemini Extract prompt", () => {
  const request = extractRequest(seedReport("end"), { all: true })

  test("sends a Capture's words, author and time, and no image for a seeded photo", () => {
    const prompt = extractPrompt(request)
    expect(prompt).toContain('"author": "Alex Morgan (Closing Manager)"')
    expect(prompt).not.toMatch(/"photo"|window\.jpg/)
    // The pasted chat keeps its line timestamps; a line saying "just now" gives Occurred-at, its posting time alone never does.
    expect(prompt).toContain('"at": "01:42"')
  })

  test("tells the model a chat line's posting time isn't when the event happened (ticket 27)", () => {
    expect(EXTRACT_INSTRUCTIONS).toContain("is not when the event happened")
  })

  test("the schema only allows this request's Captures as sources", () => {
    const schema = JSON.stringify(extractSchema(request))
    for (const c of request.captures) expect(schema).toContain(`"${c.id}"`)
    expect(schema).not.toContain('"m6"')
  })

  test("a stored photo goes as an image part labelled with its Capture id, never inside the JSON", () => {
    const r = reducer(seedReport("end"), {
      type: "receive",
      captures: [{ id: "p-a1", kind: "photo", capturedAt: "01:30", author: { name: "Marek", role: "Door" }, text: "", photo: true }],
    })
    const withImage = extractRequest(r, { capture: "p-a1" }, { "p-a1": { mime: "image/jpeg", data: "/9j/c3Rvb2w=" } })
    const parts = extractContents(withImage)
    expect(parts[0].text).toContain('"hasImage": true')
    expect(parts[0].text).not.toContain("/9j/")
    expect(parts.slice(1)).toEqual([{ text: "Image of Capture p-a1:" }, { inlineData: { mimeType: "image/jpeg", data: "/9j/c3Rvb2w=" } }])
    expect(extractContents(extractRequest(r, { capture: "p-a1" }))).toHaveLength(1)
  })
})
