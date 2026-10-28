# Process

Create Shift Report — tonik recruitment task (brief: `brief.md`).
Workflow: Matt Pocock's skills (`mattpocock-skills` plugin v1.3.1), plus `better-*` / Emil Kowalski skills for UI polish and motion.

## Phases

| Phase | Skills | Output |
|---|---|---|
| 0. Setup | `/setup-matt-pocock-skills` | git repo, `docs/agents/`, local tracker in `.scratch/` |
| 1. Lock scope | `/grill-with-docs` → `/to-questionnaire` (if blocked) → `/to-spec` | `GLOSSARY.md`, `docs/adr/`, `.scratch/shift-report/spec.md`, questions for Dorota + real user |
| 2a. Shape | `/prototype` (UI branch) | radically different capture-screen variants, one picked |
| 2b. Build | `/to-tickets` → `/implement` per ticket, `/tdd` only at the AI-extraction seam | working prototype |
| 2c. Polish | `better-interface`, `animate`, `review-animations` on one screen | one polished screen |
| 2d. Ship | `/code-review`, deploy | shareable link + repo |
| 3. Wrap | `/retro`, Loom | Loom |

## Rules

- Phase boundaries follow Pocock's tree: continue → `/clear` → `/handoff` → subagent → `/compact`. Grilling → spec stays in one session (spec needs the reasoning verbatim).
- Anything blocked on Dorota or a real closing manager goes to `/to-questionnaire` and is sent right away. Don't wait on answers: assume, record the assumption as an ADR, build.
- MVP mindset on testing: elaborate test suites that would drag out the build get cut. Test only what protects the core AI-extraction behavior.
- Filip owns time management. Agents don't estimate durations or plan around time.

## Status

Update after every step. If the chat is lost: read this, then `CLAUDE.md`, `GLOSSARY.md`, `docs/adr/`, `.scratch/shift-report/`.

- [x] 0. Setup — repo `FilipHadTo/tonik-shift-report` (private), `CLAUDE.md` + `docs/agents/` (local tracker, default labels, single-context)
- [x] 1a. `/grill-with-docs` — `GLOSSARY.md`, ADR 0001–0002, `.scratch/shift-report/open-questions.md`
- [x] 1b. `/to-questionnaire` — Dorota: email sent 2026-10-28 (one open legal question; silence = our assumptions stand). Closing manager: skipped, nobody available → assumptions. `to-questionnaire-dorota-shift-report.md` is the internal detailed version, not what was sent.
- [ ] 1c. `/to-spec` → `.scratch/shift-report/spec.md`, open questions recorded as ADRs  ← **next**
- [ ] 2a. `/prototype` — capture-screen variants, pick one
- [ ] 2b. `/to-tickets` → `/implement` per ticket
- [ ] 2c. Polish — Report screen first (incident confirmation), then everything
- [ ] 2d. `/code-review`, deploy (Vercel + Neon)
- [ ] 3. `/retro`, Loom
