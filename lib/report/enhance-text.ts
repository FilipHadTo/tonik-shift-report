// Rule-based Enhance: the scripted stand-in for the model (and its fallback).

const REWRITES: [RegExp, string][] = [
  [/\b(pls|plz)\b/gi, "please"],
  [/\bppl\b/gi, "people"],
  [/\btill\b/gi, "until"],
  [/\bw\/o\b/gi, "without"],
  [/\bw\/\s?/gi, "with "],
  [/\b(bc|cos|cuz)\b/gi, "because"],
  [/\bapprox\.?\s?|~\s?/gi, "around "],
  [/\b(\d+)\s?mins?\b/gi, "$1 minutes"],
  [/\bu\b/gi, "you"],
  [/\bthru\b/gi, "through"],
  [/\bgonna\b/gi, "going to"],
  [/\btbh,?\s?|\blol\b\s?/gi, ""],
  [/\s*&\s*/g, " and "],
  [/\b(security|bar|door)\s+short\b/gi, "$1 staff short"],
  [/\bcovered (side|front|back) door\b/gi, "covered the $1 door"],
  [/\bdj\b/gi, "DJ"],
]
const NUMBERS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
const NAMES = /\b(kuba|tom|jess|marek|alex)\b/gi

/**
 * Rewrites a rough span of the manager's own text into clean prose. `start` / `end` say whether
 * the span begins or ends a sentence, so a selection inside a sentence isn't capitalised or closed.
 * Returns the same string when there's nothing to improve.
 */
export function enhanceText(text: string, { start = true, end = true } = {}) {
  let t = text.replace(/\s+/g, " ").trim()
  for (const [re, to] of REWRITES) t = t.replace(re, to)
  t = t.replace(NAMES, (n) => n[0].toUpperCase() + n.slice(1).toLowerCase())
  t = t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/^(\d)\s/, (_, d) => `${NUMBERS[Number(d)]} `))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim()
  if (!start && /^[a-z]/.test(text.trim())) t = t.charAt(0).toLowerCase() + t.slice(1)
  if (end && !/[.!?]$/.test(t)) t += "."
  return t
}
