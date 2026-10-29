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

- [ ] Every rule above has a test that drives Extract through its public interface and asserts on the resulting report (no tests on internal functions or prompt wording)
- [ ] Draft into report, Draft from inbox and Draft all in E go through Extract with the fake model
- [ ] E looks and works like before, per `docs/design-system.md` (02:15 scene: draft each kind of Capture, then Draft all)
- [ ] `pnpm test` passes, deterministic, no network
