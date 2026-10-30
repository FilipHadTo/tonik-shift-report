// The real model behind Extract and Enhance (tickets 14, 15): Gemini Flash on the paid key (ADR 0001). Server-only, so
// the key never reaches the browser. Its answers are untrusted: the report domain checks every one.

import "server-only"
import { GoogleGenAI, ThinkingLevel, type GenerateContentResponse } from "@google/genai"
import { ENHANCE_TIMEOUT_MS, EXTRACT_TIMEOUT_MS, type ReportModel } from "../report"
import { ENHANCE_INSTRUCTIONS, ENHANCE_SCHEMA, enhancePrompt } from "./enhance-prompt"
import { EXTRACT_INSTRUCTIONS, extractContents, extractSchema } from "./extract-prompt"

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
      // Text plus any stored photos as inline images (ADR 0008).
      contents: [{ role: "user", parts: extractContents(request) }],
      config: {
        systemInstruction: EXTRACT_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseJsonSchema: extractSchema(request),
        // Drafting is a structured rewrite, not a puzzle: keep the wait short.
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        httpOptions: { timeout: EXTRACT_TIMEOUT_MS },
      },
    })
    // A JSON string: Extract parses it and treats anything malformed as a failed call.
    return answer(res)
  },
  async enhance(request) {
    const res = await gemini().models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      contents: enhancePrompt(request),
      config: {
        systemInstruction: ENHANCE_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseJsonSchema: ENHANCE_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        httpOptions: { timeout: ENHANCE_TIMEOUT_MS },
      },
    })
    // `{ text }` as JSON: Enhance parses it and treats anything else as a failed call.
    return answer(res)
  },
}

function answer(res: GenerateContentResponse) {
  if (!res.text) throw new Error(`No answer (${res.candidates?.[0]?.finishReason ?? res.promptFeedback?.blockReason ?? "empty"})`)
  return res.text
}
