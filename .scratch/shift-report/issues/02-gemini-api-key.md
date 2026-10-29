# 02: Gemini API key with a spend cap

**What to build:** A paid Gemini API key the server can use, with a low spend cap so a public demo can't run up a bill (ADR 0001: paid key, not the free tier). This needs Filip's Google account, so an agent can't do it.

Steps:
1. In Google AI Studio, create a key on a project with billing on.
2. Set a low budget / spend cap on that project.
3. Add `GEMINI_API_KEY` to Vercel (all environments) and to `.env.local`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

**Agent:** none, Filip does this

- [x] `GEMINI_API_KEY` is set in Vercel and in `.env.local`
- [x] ~~The project has a spend cap~~ — skipped, Filip's call: the Google Cloud billing project was topped up with a small amount instead, which caps exposure the same way
- [x] The key is not committed anywhere (`git grep` finds nothing)
