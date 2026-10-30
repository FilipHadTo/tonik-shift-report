# Process

Create Shift Report — tonik recruitment task (brief: `brief.md`).
Workflow: Matt Pocock's skills (`mattpocock-skills` plugin v1.3.1), plus `better-*` / Emil Kowalski skills for UI polish and motion.

## Phases

| Phase | Skills | Output |
|---|---|---|
| 0. Setup | `/setup-matt-pocock-skills` | git repo, `docs/agents/`, local tracker in `.scratch/` |
| 1. Lock scope | `/grill-with-docs` → `/to-questionnaire` (if blocked) → `/to-spec` | `GLOSSARY.md`, `docs/adr/`, `.scratch/shift-report/spec.md`, questions for Dorota + real user |
| 2a. Shape | `/prototype` for structure, then iteration in prototype E (see Phase 2a plan) | Report screen E as the visual source of truth, design system, empty state, mobile capture page |
| 2b. Build | `/to-tickets` → `/implement` per ticket, `/tdd` only at the AI-extraction seam | E wired to the real backend |
| 2c. Polish | `better-interface`, `animate`, `review-animations` on one screen | one polished screen |
| 2d. Ship | `/code-review`, deploy | shareable link + repo |
| 3. Wrap | `/retro`, Loom | Loom |

## Rules

- Phase boundaries follow Pocock's tree: continue → `/clear` → `/handoff` → subagent → `/compact`. Grilling → spec stays in one session (spec needs the reasoning verbatim).
- Anything blocked on Dorota or a real closing manager goes to `/to-questionnaire` and is sent right away. Don't wait on answers: assume, record the assumption as an ADR, build.
- MVP mindset on testing: elaborate test suites that would drag out the build get cut. Test only what protects the core AI-extraction behavior.
- Filip owns time management. Agents don't estimate durations or plan around time.

## Phase 2a plan

**Deliberate deviation from Pocock.** `/prototype` answered the structure questions (variants A–D in `/prototype/report`, `/prototype/tonight`, `/prototype/night`, now archived and marked as such), but its visual output was generic. From there the Report screen was shaped by hand as prototype E (`/prototype/report-editor`), and E now *is* the front end (ADR 0006). The Shape phase stays, but the tool changes: the remaining UI is iterated in E, not generated as new `/prototype` variants. Phase 2b then wires E to the backend; it doesn't rebuild the UI.

Steps, in order:

1. **Fold back.** `/grill-with-docs` over `design-changelog.md`: GLOSSARY, ADR 0005–0007, `spec.md`, `report-structure.md`, the Gap hint and Occurred-at default in E.
2. **Design system.** Prompt below.
3. **Remaining UI in E.** Prompt below.
4. **Snapshot.** Branch `prototype/report-editor` from the 2a.3 state, then tick 2a.

### Prompt for 2a.2: design system

> Phase 2a.2 (see `PROCESS.md`). ADR 0006: prototype E is the visual layer; Base UI/shadcn are primitives only. Goal: extract E's design system so every later UI step builds in this look.
> 1. Move the tokens from `app/prototype/report-editor/editor.css` (`.rx`, dark, `--ai-wash`, gap, ease, shadows, and the motion classes `.fold`, `.disclose`, `.seam`, `.appear`) into the shared theme in `app/globals.css`. Dark is the default theme.
> 2. Move the primitives from `ui.tsx` (Btn, IconBtn, Tip, Pop, Avatar, Kbd, chip, DraftLabel, PhotoThumb, VoiceThumb) into `components/`, on Base UI, in E's style. Keep the stock shadcn files in `components/ui` and don't delete them.
> 3. Point E at those components with zero visual change: compare Chrome screenshots before and after (dark first; check that light doesn't break), same state.
> 4. Write `docs/design-system.md`: tokens, components and when to use which, spacing, typography, motion (curves, durations, reduced motion), the AI / Draft / Gap / Confirmed states, do / don't. Short and LLM-friendly: an agent reads it before building UI.
> 5. Add one line to `CLAUDE.md`: read `docs/design-system.md` before any UI work.
> Use the `better-*` skills and Emil's skills. Don't commit without my OK.

### Prompt for 2a.3: remaining UI in E

> Phase 2a.3 (see `PROCESS.md`). Build in prototype E (`/prototype/report-editor`), using only `docs/design-system.md` and the existing components, so it looks like the rest of E. No `/prototype` skill and no A–D variants: one version, and we iterate the way we did on E. Only `/prototype/report-editor` is live; `/prototype/report`, `/prototype/tonight` and `/prototype/night` are archived, don't open, copy from or edit them. New screens go under `app/prototype/report-editor/` (the mobile capture page as its own route there, not in `/prototype/tonight`). Stories are in `spec.md`.
> 1. Demo switch between 20:00 (report started, empty) and 02:15 (the current seed), each resettable (stories 60, 62). The header says "Started 20:00", not "Opened … by Alex's photo" (ADR 0005).
> 2. Empty report = onboarding (stories 3, 4): each column (Inbox, document, outline) has its own empty state, and together they explain the four points in story 3. Each hint goes away once its step has happened in this report. No tooltip tour.
> 3. Enhance (story 27): select your own text in a Section or in "What happened", then Enhance. The result is a Draft with Keep / Discard; Discard restores the original.
> 4. Mobile capture page (stories 7–12, 61): identify once (name + role), add a photo, voice note or text, see your own Captures. Reachable from the Invite staff QR. A new Capture shows up in the desktop Inbox (mock it with shared in-memory or local state for now).
> 5. Deleting an Incident returns its Capture to New (story 40).
> Dark mode first. Verify in Chrome in your own tab. Log design decisions in `design-changelog.md` via the `spec-diff` agent. Don't commit without my OK.

## Status

Update after every step. Work happens on `main` (`AI-Exploration` was fast-forwarded into it after 2a.2). If the chat is lost: read this, then `deslog.md` (story so far), `CLAUDE.md`, `GLOSSARY.md`, `docs/adr/`, `.scratch/shift-report/`.

- [x] 0. Setup — repo `FilipHadTo/tonik-shift-report` (private), `CLAUDE.md` + `docs/agents/` (local tracker, default labels, single-context)
- [x] 1a. `/grill-with-docs` — `GLOSSARY.md`, ADR 0001–0002, `.scratch/shift-report/open-questions.md`
- [x] 1b. `/to-questionnaire` — Dorota: email sent 2026-10-28, answered 2026-10-29 (minimum Incident criteria: time, date, place, type, description). Closing manager: skipped, nobody available → assumptions. `to-questionnaire-dorota-shift-report.md` is the internal detailed version, not what was sent.
- [x] 1c. `/to-spec` → `.scratch/shift-report/spec.md` (ready-for-agent), ADR 0003–0004. Test seam: one pure report-domain module with a fake LLM.
- [x] 2a. Shape (see Phase 2a plan)
  - [x] `/prototype`: structure variants (`/prototype/report` A–D, `/prototype/tonight` A–C, `/prototype/night`); the Report screen then designed by hand as prototype E (`/prototype/report-editor`, built on branch `AI-Exploration`, commit 00fd36f, since merged into `main`), with diffs logged in `.scratch/shift-report/design-changelog.md`
  - [x] 2a.1 Fold back: `/grill-with-docs`, giving GLOSSARY, ADR 0005–0007, `spec.md`, `report-structure.md`, screenshots in `docs/design/`
  - [x] 2a.2 Design system: tokens and motion in `app/globals.css` (dark default), E's primitives in `components/`, `docs/design-system.md`; E verified unchanged in Chrome (computed styles + pixel diff, dark and light)
  - [x] 2a.3 Remaining UI in E: demo switch (20:00 / 02:15), empty-state onboarding, Enhance, mobile capture page (`/prototype/report-editor/capture`, live Inbox mock scoped by demo session), Delete Incident → Capture back to New; two passes with Filip, decisions in `design-changelog.md` (Phase 2a.3)
  - [x] 2a.4 Fold back 2a.3 into `spec.md`, `GLOSSARY.md`, `report-structure.md` (Submit blocked by unchecked AI drafts, Capture states, Enhance on manager-typed text only, messaging-style capture page, per-session demo); Filip decided: bulk "Keep all" for AI drafts only in the Submit sheet (never for Incidents), Dismiss on a partly used Capture covers only the missing part, "Not covered tonight" names Incidents, mobile heading "Send to the manager". Snapshot on branch `prototype/report-editor`
- [ ] 2b. `/to-tickets` → `/implement` per ticket. Tickets wire E to the backend (domain module, Neon, Gemini, polling); each UI ticket points at E's files and has the AC "looks and works like prototype E, per `docs/design-system.md`". Tickets with UI/UX decisions → `ready-for-human`. Three fixes from the 2a.4 fold-back are spec'd but not yet in E (mobile heading, partial Dismiss, "Keep all" in the Submit sheet).
  - [x] `/to-tickets`: 17 tickets in `.scratch/shift-report/issues/`. Filip's decisions folded into `spec.md`: Other role on the capture page, dictation instead of recorded voice (phone keyboard / browser speech recognition on desktop), Delete moved off the Confirm line; the captionless-photo Draft stays, no Enhance shortcut. 01–02 (Vercel + Neon, Gemini key) and 17 (submitted document design) need Filip.
  - [x] 01 Vercel + Neon: project linked (Framework preset fixed to Next.js; origin/main was 12 commits behind — pushed), Neon added via Marketplace (Free, Auth/Realtime off, `DATABASE_URL` prefix, all environments), `.env.local` pulled
  - [x] 02 Gemini API key: `GEMINI_API_KEY` set in Vercel (all environments) and `.env.local`; spend cap skipped, Filip's call (small top-up caps exposure instead)
  - [ ] `/implement` per ticket  ← **next**: 03–08 done (report domain module, Extract and Enhance with the fake model, partial Dismiss, Keep all, Neon + demo sessions, manager actions saved through the server, live Inbox on Neon, capture page fixes, desktop dictation, Delete off the Confirm line, Extract and Enhance on Gemini); 16 next. 17 waits on Filip (open-questions.md, Phase 2b)
- [ ] 2c. Polish — Report screen first (incident confirmation), then the empty report, then everything; light mode last
- [ ] 2d. `/code-review`, deploy (Vercel + Neon)
- [ ] 3. `/retro`, Loom
