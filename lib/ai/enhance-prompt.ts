// What Gemini is told for Enhance: the rewrite rules as instructions, the manager's words as data, and the
// answer's shape as a JSON schema. Pure. The domain still checks the answer (lib/report/enhance.ts).

import type { EnhanceRequest } from "../report"

export const ENHANCE_INSTRUCTIONS = `You tidy text a nightclub's Closing Manager typed into their end-of-night Shift Report, usually in a hurry at 3am.

Rewrite it as clean, plain, factual English:
- Expand shorthand and slang ("2 security short till 22:00" -> "Two security staff short until 22:00"), fix spelling, grammar and punctuation, capitalise names.
- Keep the meaning, every fact, name, number and time, and the manager's tense and point of view. Never add, guess or drop facts. Never add a greeting, heading or comment.
- Keep it about as long as the original. It is one span of a longer text: don't merge it with anything else.
- "start" false: the span continues a sentence, so don't capitalise its first word. "end" false: the sentence goes on after it, so don't end it with punctuation.
- If it already reads clean, return it exactly as given, character for character.`

/** The span and where it sits in its sentence, as the data part of the prompt. */
export function enhancePrompt({ text, start, end }: EnhanceRequest) {
  return `Rewrite this text.\n\n${JSON.stringify({ text, start, end }, null, 2)}`
}

/** EnhanceOutput in lib/report/model.ts. */
export const ENHANCE_SCHEMA = {
  type: "object",
  properties: { text: { type: "string", description: "The rewritten text, or the original if it already reads clean" } },
  required: ["text"],
}
