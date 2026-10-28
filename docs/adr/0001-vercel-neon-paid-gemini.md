# Next.js on Vercel + Neon Postgres + paid Gemini Flash key

The prototype must stay publicly reachable for weeks untouched and sync one Shift Report across phone and desktop, so it needs a real DB. We picked Next.js on Vercel Hobby with Neon Postgres (via Vercel Marketplace, Drizzle ORM): Neon auto-suspends but auto-resumes in under a second and never deletes inactive free projects, and setup is env-var-only. Gemini Flash runs on a paid key with a low spend cap, not the free tier: free-tier prompts may be used for training and reviewed by humans, Google's terms forbid serving EEA users from the free tier (reviewers are in Poland), and free rate limits are low and unpublished. Every AI call has a canned fallback so the demo never dies on a 429.

## Considered Options

- Supabase: free projects pause after inactivity.
- Upstash Redis / Turso: archive inactive free databases (30 / 10 days).
- Cloudflare Workers + D1: never sleeps, but Next.js via OpenNext adds config and Workers Free has tight CPU and bundle limits.
