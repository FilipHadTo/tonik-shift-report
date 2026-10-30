# 15: Real AI for Enhance (Gemini)

**What to build:** Enhance (05) uses Gemini through its own server route, with the same client, rate limit, calm message and fallback as ticket 14. It loads the report, runs Enhance with the real model and saves the Draft. Fallback when Gemini fails: today's rule-based rewrite from prototype E.

**Blocked by:** 05, 14

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [x] Selecting the seeded rough Security block and Enhance gives a clean rewrite as a Draft; Discard restores the original
- [x] Clean text gives "Already reads clean. Nothing to change." and no Draft
- [x] With a broken key: the fallback rewrite or the calm message, never an error; the report is unchanged on failure
- [x] Looks and works like prototype E, per `docs/design-system.md`

## Comments

Built: Enhance has its own route, `POST /prototype/report-editor/report/enhance` (`{ d, target, text, span }`). It loads the stored report, runs Enhance with Gemini behind the same per-IP rate limit as Draft (shared in `lib/ai/limited.ts`), saves and answers `{ report, status }` (409 + the stored report when nothing was saved). The generic report route no longer takes `enhance`. Gemini client: `geminiModel.enhance` in `lib/ai/gemini.ts`, prompt and `{ text }` JSON schema in `lib/ai/enhance-prompt.ts`; same model, thinking level and 20s timeout as Extract.

Key decisions:
- Fallback (ADR 0001, tested first in `lib/report`): `runEnhance(..., { fallback })` uses the rule-based rewrite from E when Gemini fails, times out, is rate limited or answers nonsense. If the fallback would change nothing, the run stays `degraded`: Gemini never said the text reads clean, so it shows the calm message, not "Already reads clean". A clean answer from Gemini itself is trusted (no fallback).
- "Enhancing your text…" shows for the whole wait (at least the old 1.1s beat), then the Draft, "Already reads clean. Nothing to change." or the calm message appear (open question 1, option A).
- Calm message: ticket 14's "AI is catching up, your Captures are safe" doesn't fit, since Enhance never touches Captures, so the Enhance bar says "AI is catching up, your text is safe". It replaces the Enhance button for 5s, `role="status"`, same style as "Already reads clean". Filip to eyeball the wording.
- Bar fix: with a real wait, the selection listener dropped the bar while "Enhancing…" was up, and a scroll fired when that line went away cleared the note. The bar now ignores selection changes while Enhance runs and clears its note only when the selection itself changes.

Checked in Chrome (02:15 scene, own demo id, rows cleaned up): the rough Security block got a Gemini Draft in ~3.8s, and Discard restored the original (also in the database). Clean text showed "Already reads clean." after the wait, with no Draft. With the rate-limit counter over the limit, the rough block got the fallback rewrite and clean text got the calm message with the report unchanged. A broken key goes down the same path as the rate limit (any thrown error), as in ticket 14. Key absent from the client chunks.
Note: the dev server on :3300 kept a stale in-memory `lib/ai/gemini.ts` after edits. Touching `next.config.ts` made Next reload it.
