# 14: Real AI for Drafts (Gemini)

**What to build:** Draft into report, Draft from inbox and Draft all use Gemini Flash. One server route per action: it loads the report, runs Extract (04) with a real Gemini client that implements the model interface, and saves the result. The prompt gets Capture text, authors and times, never image contents. Ask for structured output; the domain rules still clean whatever comes back. Model id from an env variable with a current Flash model as default.

Protect the paid key: a per-IP rate limit, counted in the database (works across Vercel instances). On any failure (timeout, 429, rate limit, bad output) the report stays as it was and the button that triggered it shows the calm message "AI is catching up, your Captures are safe" (story 24). Every AI call has a canned fallback so the demo never dies (ADR 0001): for the seeded Captures, fall back to the fake model's recorded responses.

**Blocked by:** 02, 04, 09

**Status:** ready-for-agent

**Agent:** Opus 5.5, medium effort (cross-cutting or rule-heavy)

- [x] With the key in `.env.local`: drafting a Capture you typed yourself gives a Draft that follows the rules (Gap where nothing supports a field)
- [x] The pasted group chat gets Occurred-at from its line timestamps
- [x] The key never reaches the browser (search the client bundle)
- [x] Rate limit: repeated calls from one IP get the calm message, not an error
- [x] With a broken key: seeded Captures still draft from the fallback, others show the calm message, the report is unchanged
- [x] "Drafting…" and the result look and work like prototype E, per `docs/design-system.md`

## Comments

Built: Draft into report / Draft from inbox / Draft all go to their own route, `POST /prototype/report-editor/report/draft` (`{ d, scope }`). It loads the stored report, runs Extract with Gemini, saves and answers `{ report, degraded }` (409 + the stored report when nothing could be drafted). The generic report route no longer takes `draft`. The screen keeps "Drafting into the report…" until the server answers (at least the old 1.1s beat) and settles on the saved report.

Key decisions:
- Model: `gemini-3.8-flash` (current stable Flash on the key), overridable with `GEMINI_MODEL`. Official SDK `@google/genai` 2.31.0, server-only client in `lib/ai/gemini.ts`; thinking level low, 20s timeout. Answers are typically ~5s.
- Prompt (`lib/ai/extract-prompt.ts`, pure): the rules as system instructions, Captures as JSON (id, kind, Captured-at, author, text, chat lines with timestamps; never a photo). Structured output via a JSON schema that pins source ids, Section ids and Incident types to the request. The domain still validates everything.
- Fallback (ADR 0001, tested first in `lib/report`): `runExtract(..., { fallback })` asks `fallbackModel` when Gemini fails, times out, is rate limited or answers nonsense. It has recorded answers for the seeded Captures only, so typed / phone Captures stay New and the run is `degraded`. Partial runs (Draft all with both) keep what the fallback drafted and still show the calm message.
- Rate limit: per hashed IP (raw IP never stored), 20 Gemini calls per 10 min (`AI_RATE_LIMIT` overrides), one atomic upsert in the new `ai_calls` table (migration 0002, applied to Neon). Only real Gemini calls count.
- Calm message: "AI is catching up, your Captures are safe" shows for 5s in place of the Draft button that was pressed (the Capture's action row, the Inbox header, a Section's heading row), `text-xs text-ink-2`, `role="status"`, like E's other in-place failure notes (dictation, capture send). In the Inbox header it wraps to two right-aligned lines. Filip to eyeball.
- Enhance stays on the rule-based model (ticket 15).

Checked in Chrome (02:15 scene, own demo id, rows cleaned up): typed "girl slipped…" → Gemini Incident with a location Gap; pasted chat → theft Incident with Occurred-at 01:42; counter pushed over the limit → typed Capture shows the calm message and stays New, Draft all drafts c2 / c6 from the fallback and shows the calm message for the typed one; reload keeps everything. Broken key: the SDK throws `API_KEY_INVALID`, the same failure path as the rate limit (dev server not restarted). Key absent from dev chunks and the production `.next/static`.
