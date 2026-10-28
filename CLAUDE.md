# tonik-shift-report

Create Shift Report — tonik Senior Product Designer recruitment task. Brief: `brief.md`. Process: `PROCESS.md`.

## Workflow guidance

Guide Filip through `PROCESS.md` step by step — he relies on you for the order. At the start of every session, read the `## Status` section of `PROCESS.md` and tell him which phase is next and which slash command to run (most Pocock skills are user-invoked only). Never skip or merge phases: `/prototype` comes before `/to-tickets`, `/to-tickets` before `/implement`. If he asks to jump ahead, point out the skipped step first. After each step, tick it off in `## Status`.

UI/UX is Filip's call: in `/prototype` show variants and let him pick; in `/to-tickets` mark tickets carrying UI/UX decisions as `ready-for-human`.

## Agent skills

### Issue tracker

Issues and specs live as local markdown under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
