# 04: Extract (scoped) in the report domain module

**What to build:** The rule set that turns Captures into Drafts, test-first with `/tdd`, behind an injected model. Given the report, a scope (one Capture, one Section, or all New Captures) and a model, Extract returns new Drafts and leaves everything else untouched (spec, "Extract", ADR 0007).

Rules enforced whatever the model returns:
- reads only New Captures, only adds Drafts; never changes confirmed, kept or manager-written content
- on a partly used Capture, drafts only the missing part and never duplicates a Draft that already cites it (every scope, including Draft all)
- a required Incident field with no supporting Capture becomes a Gap; references to missing Captures are dropped
- Location only from Capture text (the AI never reads photos); Occurred-at is the time a Capture states (for a pasted chat, the line's timestamp), else its Captured-at
- Incident type from the fixed list, otherwise Other with the model's text
- the model picks the Section, falling back to General overview; drafting into a hidden Section shows it; Incident-looking content becomes an Incident
- invalid or unavailable model output returns the previous state, flagged degraded

Define the model interface here. Write a fake model with recorded responses, including bad ones (a field with no source, an off-list type, a missing Capture reference, a location with no text support, malformed output, a timeout). E's scripted drafts (`EFFECTS` in `data.ts`) become the fake's recorded responses, so E's Draft buttons go through Extract and keep showing what they show today. Ticket 14 swaps in Gemini.

**Blocked by:** 03

**Status:** ready-for-agent

**Agent:** Opus 5.5, medium effort (cross-cutting or rule-heavy)

- [x] Every rule above has a test that drives Extract through its public interface and asserts on the resulting report (no tests on internal functions or prompt wording)
- [x] Draft into report, Draft from inbox and Draft all in E go through Extract with the fake model
- [x] E looks and works like before, per `docs/design-system.md` (02:15 scene: draft each kind of Capture, then Draft all)
- [x] `pnpm test` passes, deterministic, no network

## Comments

Done. `lib/report/model.ts` defines `ReportModel` (`extract`, `enhance`; answers are `unknown` and checked by the domain). `lib/report/extract.ts`: `extract` / `validateExtract` / `applyExtract` / `runExtract`, scope `{ capture } | { section } | { all: true }`, 20s timeout. Location needs a `quote` that appears in the source Capture's words (never a photo); Occurred-at must not be after Captured-at and, for a pasted chat, must be one of its line times, else Captured-at. Captures get `found` (Sections the AI saw in them); New = never drafted, or found but not yet applied. `lib/report/fake-model.ts` holds E's former `EFFECTS` as recorded answers, the keyword router, `likelySections` (hint for "Draft from inbox") and the rule-based Enhance; the seed runs through the same rules. E's three Draft buttons go through `extract` with the fake; verified in Chrome (02:15: draft Marek, Draft all, delete the window Incident and redraft: same Incidents and blocks as before, no duplicate).
