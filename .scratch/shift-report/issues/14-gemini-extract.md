# 14: Real AI for Drafts (Gemini)

**What to build:** Draft into report, Draft from inbox and Draft all use Gemini Flash. One server route per action: it loads the report, runs Extract (04) with a real Gemini client that implements the model interface, and saves the result. The prompt gets Capture text, authors and times, never image contents. Ask for structured output; the domain rules still clean whatever comes back. Model id from an env variable with a current Flash model as default.

Protect the paid key: a per-IP rate limit, counted in the database (works across Vercel instances). On any failure (timeout, 429, rate limit, bad output) the report stays as it was and the button that triggered it shows the calm message "AI is catching up, your Captures are safe" (story 24). Every AI call has a canned fallback so the demo never dies (ADR 0001): for the seeded Captures, fall back to the fake model's recorded responses.

**Blocked by:** 02, 04, 09

**Status:** ready-for-agent

**Agent:** Opus 5.5, medium effort (cross-cutting or rule-heavy)

- [ ] With the key in `.env.local`: drafting a Capture you typed yourself gives a Draft that follows the rules (Gap where nothing supports a field)
- [ ] The pasted group chat gets Occurred-at from its line timestamps
- [ ] The key never reaches the browser (search the client bundle)
- [ ] Rate limit: repeated calls from one IP get the calm message, not an error
- [ ] With a broken key: seeded Captures still draft from the fallback, others show the calm message, the report is unchanged
- [ ] "Drafting…" and the result look and work like prototype E, per `docs/design-system.md`
