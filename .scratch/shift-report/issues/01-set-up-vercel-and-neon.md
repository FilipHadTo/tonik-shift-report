# 01: Set up Vercel and Neon

**What to build:** The app has a home on Vercel and a Neon Postgres database it can reach, locally and on Vercel (ADR 0001). This needs Filip's accounts, so an agent can't do it.

Steps:
1. `gh auth status` shows `FilipHadTo`.
2. Create a Vercel project (Hobby) from `FilipHadTo/tonik-shift-report`.
3. Add Neon through the Vercel Marketplace (Storage → Neon) and connect it to the project for all environments.
4. Locally: `vercel link`, then `vercel env pull .env.local`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

**Agent:** none, Filip does this

- [ ] The Vercel project is linked to the repo
- [ ] A Neon database exists and `DATABASE_URL` is set in Vercel (all environments) and in `.env.local`
- [ ] `.env.local` is ignored by git (`git check-ignore .env.local` prints it)
