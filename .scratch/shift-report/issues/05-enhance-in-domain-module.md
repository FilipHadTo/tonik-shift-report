# 05: Enhance in the report domain module

**What to build:** Enhance as a domain function, test-first with `/tdd`, using the same injected model interface as Extract (04 defines it; if 04 isn't done, define it here and 04 reuses it). Given manager-typed text (a manual Section block, or "What happened" on a manual Incident) and an optional span, it returns a rewritten Draft that keeps the original for Discard. A partial selection rewrites only that span. If nothing would change, it returns the text unchanged and no Draft ("Already reads clean. Nothing to change."). Invalid or unavailable model output returns the previous state, flagged degraded. Kept AI text, Drafts, confirmed Incidents and Captures can't be enhanced (story 27).

E's Enhance bar (`app/prototype/report-editor/enhance.tsx`, today's `enhanceText` in `data.ts` as the fake's behaviour) goes through it.

**Blocked by:** 03

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [x] Tests: span rewrite, Discard restores exactly the original, no-change gives no Draft, ineligible text is refused, model failure leaves the state unchanged and flagged degraded
- [x] E's Enhance looks and works like before, per `docs/design-system.md`
- [x] `pnpm test` passes, deterministic, no network

## Comments

Done. `lib/report/enhance.ts`: `canEnhance`, `enhance` / `applyEnhance` / `runEnhance` behind the same `ReportModel` as Extract (20s timeout). Target is `{ block } | { incident }`, with an optional `span` (offsets in the text) and `text` (what's on screen, if not yet saved); that text becomes the original Discard restores. Outcome is `drafted`, `unchanged` (no Draft), `refused` (not a manual block or an open manual Incident without a pending Draft, or the report is submitted) or `degraded` (report untouched). The span splicing and sentence-start/end flags moved from E into the domain. The reducer's `enhance` / `enhanceIncident` actions became one `enhanced` action that re-checks eligibility on apply. E's Enhance bar goes through it with the fake model; with the fake answering at once, "Already reads clean" still shows instantly and the Enhancing state only runs for a real rewrite (ticket 15 should move it in front of the model call, and add the calm degraded message). Verified in Chrome: span rewrite, Discard, whole-block rewrite, Keep (kept text no longer enhanceable), clean text note, manual Incident rewrite of unsaved text and Discard.
