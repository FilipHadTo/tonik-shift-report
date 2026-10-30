// The real model behind Extract (ticket 14): Gemini Flash on the paid key (ADR 0001). Server-only, so
// the key never reaches the browser. Its answers are untrusted: the report domain checks every one.

import "server-only"
import { GoogleGenAI, ThinkingLevel } from "@google/genai"
import { EXTRACT_TIMEOUT_MS, type ReportModel } from "../report"
import { EXTRACT_INSTRUCTIONS, extractPrompt, extractSchema } from "./extract-prompt"

/** A current Flash model; GEMINI_MODEL overrides it without a deploy of new code. */
export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash"

let client: GoogleGenAI | undefined

function gemini() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set")
  return (client ??= new GoogleGenAI({ apiKey }))
}

export const geminiModel: ReportModel = {
  async extract(request) {
    const res = await gemini().models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      contents: extractPrompt(request),
      config: {
        systemInstruction: EXTRACT_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseJsonSchema: extractSchema(request),
        // Drafting is a structured rewrite, not a puzzle: keep the wait short.
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        httpOptions: { timeout: EXTRACT_TIMEOUT_MS },
      },
    })
    if (!res.text) throw new Error(`No answer (${res.candidates?.[0]?.finishReason ?? res.promptFeedback?.blockReason ?? "empty"})`)
    // A JSON string: Extract parses it and treats anything malformed as a failed call.
    return res.text
  },
  // Enhance moves to Gemini in ticket 15; until then the routes use the rule-based one.
  async enhance() {
    throw new Error("Enhance doesn't run on Gemini yet")
  },
}
