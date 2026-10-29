# 15: Real AI for Enhance (Gemini)

**What to build:** Enhance (05) uses Gemini through its own server route, with the same client, rate limit, calm message and fallback as ticket 14. It loads the report, runs Enhance with the real model and saves the Draft. Fallback when Gemini fails: today's rule-based rewrite from prototype E.

**Blocked by:** 05, 14

**Status:** ready-for-agent

**Agent:** Sonnet 5.5, high effort (contained change)

- [ ] Selecting the seeded rough Security block and Enhance gives a clean rewrite as a Draft; Discard restores the original
- [ ] Clean text gives "Already reads clean. Nothing to change." and no Draft
- [ ] With a broken key: the fallback rewrite or the calm message, never an error; the report is unchanged on failure
- [ ] Looks and works like prototype E, per `docs/design-system.md`
