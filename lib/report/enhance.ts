// Enhance (story 27, ADR 0007): rewrites text the Closing Manager typed into clean prose,
// only when they ask. The result is a Draft they keep or discard; Discard restores the original.

import { withTimeout } from "./extract"
import type { ReportModel } from "./model"
import type { Report } from "./types"

/** What Enhance rewrites: a manual Section block, or "What happened" on a manual Incident. */
export type EnhanceTarget = { block: string } | { incident: string }

/** Character offsets of the selection inside the target's text. Unset means the whole text. */
export type EnhanceSpan = { start: number; end: number }

/** A checked Enhance result, ready to apply. */
export type Enhanced = { target: EnhanceTarget; original: string; text: string }

export type EnhanceOutcome =
  | { status: "drafted"; result: Enhanced }
  /** The rewrite would change nothing: no Draft ("Already reads clean."). */
  | { status: "unchanged" }
  /** Not the manager's own text: kept AI text, Drafts, confirmed Incidents, Captures. */
  | { status: "refused" }
  /** The model failed or answered nonsense: keep the report as it was. */
  | { status: "degraded" }

export const ENHANCE_TIMEOUT_MS = 20_000

/** Only words the manager typed, still open for editing, can be enhanced. */
export function canEnhance(r: Report, target: EnhanceTarget) {
  if (r.submittedAt) return false
  if ("block" in target) return r.blocks.find((b) => b.id === target.block)?.status === "manual"
  const i = r.incidents.find((x) => x.id === target.incident)
  return !!i?.manual && !i.confirmedAt && i.descriptionDraft === undefined
}

function textOf(r: Report, target: EnhanceTarget) {
  return "block" in target
    ? r.blocks.find((b) => b.id === target.block)!.text
    : r.incidents.find((i) => i.id === target.incident)!.description
}

/**
 * Asks the model to rewrite the span (or the whole text) and checks its answer.
 * `text` is what's on screen when it differs from the report (typed but not yet saved);
 * it is what Discard restores.
 */
export async function enhance(
  r: Report,
  target: EnhanceTarget,
  model: ReportModel,
  { text, span, timeoutMs = ENHANCE_TIMEOUT_MS }: { text?: string; span?: EnhanceSpan; timeoutMs?: number } = {},
): Promise<EnhanceOutcome> {
  if (!canEnhance(r, target)) return { status: "refused" }
  const full = text ?? textOf(r, target)
  const { start, end } = span && span.start >= 0 && span.start < span.end && span.end <= full.length ? span : { start: 0, end: full.length }
  const before = full.slice(0, start)
  const picked = full.slice(start, end)
  const after = full.slice(end)
  if (!picked.trim()) return { status: "unchanged" }

  let rewritten: string | null
  try {
    rewritten = textFrom(
      await withTimeout(
        model.enhance({
          text: picked.trim(),
          // A span inside a sentence isn't capitalised; one that stops mid-sentence isn't closed.
          start: !before.trim() || /[.!?]\s*$/.test(before),
          end: !after.trim(),
        }),
        timeoutMs,
      ),
    )
  } catch {
    rewritten = null
  }
  if (rewritten === null) return { status: "degraded" }

  // Spliced back with the selection's own surrounding whitespace.
  const next = (before + picked.match(/^\s*/)![0] + rewritten + picked.match(/\s*$/)![0] + after).trim()
  if (next === full.trim()) return { status: "unchanged" }
  return { status: "drafted", result: { target, original: full, text: next } }
}

/** Turns the result into a Draft. Checked again: the report may have changed while the model ran. */
export function applyEnhance(r: Report, { target, original, text }: Enhanced): Report {
  if (!canEnhance(r, target)) return r
  if ("block" in target)
    return {
      ...r,
      drafted: true,
      blocks: r.blocks.map((b) =>
        b.id === target.block ? { ...b, text, status: "draft", original: { text: original, status: "manual" } } : b,
      ),
    }
  return {
    ...r,
    drafted: true,
    incidents: r.incidents.map((i) =>
      i.id === target.incident ? { ...i, description: original, descriptionDraft: text } : i,
    ),
  }
}

/** Enhance and apply in one go: what the server route and the tests use. */
export async function runEnhance(
  r: Report,
  target: EnhanceTarget,
  model: ReportModel,
  options?: Parameters<typeof enhance>[3],
): Promise<{ report: Report; status: EnhanceOutcome["status"] }> {
  const outcome = await enhance(r, target, model, options)
  return { report: outcome.status === "drafted" ? applyEnhance(r, outcome.result) : r, status: outcome.status }
}

/** The model's answer, if it is usable: `{ text }` with some words in it (or that as JSON). */
function textFrom(output: unknown): string | null {
  if (typeof output === "string") {
    try {
      output = JSON.parse(output)
    } catch {
      return null
    }
  }
  if (typeof output !== "object" || output === null || !("text" in output)) return null
  const text = (output as { text: unknown }).text
  return typeof text === "string" && text.trim() ? text.replace(/\s+/g, " ").trim() : null
}
