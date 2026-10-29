# 05: Enhance in the report domain module

**What to build:** Enhance as a domain function, test-first with `/tdd`, using the same injected model interface as Extract (04 defines it; if 04 isn't done, define it here and 04 reuses it). Given manager-typed text (a manual Section block, or "What happened" on a manual Incident) and an optional span, it returns a rewritten Draft that keeps the original for Discard. A partial selection rewrites only that span. If nothing would change, it returns the text unchanged and no Draft ("Already reads clean. Nothing to change."). Invalid or unavailable model output returns the previous state, flagged degraded. Kept AI text, Drafts, confirmed Incidents and Captures can't be enhanced (story 27).

E's Enhance bar (`app/prototype/report-editor/enhance.tsx`, today's `enhanceText` in `data.ts` as the fake's behaviour) goes through it.

**Blocked by:** 03

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [ ] Tests: span rewrite, Discard restores exactly the original, no-change gives no Draft, ineligible text is refused, model failure leaves the state unchanged and flagged degraded
- [ ] E's Enhance looks and works like before, per `docs/design-system.md`
- [ ] `pnpm test` passes, deterministic, no network
