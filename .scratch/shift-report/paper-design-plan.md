# Report screen in Paper → back to spec

The code variants in `/prototype/report`, `/prototype/tonight` and `/prototype/night` answered the structure questions. The visual direction and final layout of the Report screen are now designed by hand in Paper, then folded back into the domain docs before tickets.

## Does the Pocock flow cover it?

Mostly. It fits inside phase 2a (Shape), and nothing in the order changes:

```
2a  /prototype (code variants, done)
    → Paper design of the Report screen        ← new, design-led part of 2a
    → fold changes back: /grill-with-docs       (GLOSSARY, ADRs, spec)
    → optional: rebuild the Paper design as one code variant to test interaction
    → capture on prototype/* branch, tick 2a
2b  /to-tickets → /implement
```

What Pocock doesn't cover: the design tool itself. Paper is a static canvas, so interaction questions (Gap filling, Unknown, source reveal, Confirm, drafting state) still need either a click-through in code or a written state list next to the frames.

## Before opening the new chat

- Decide whether the design stays within stock shadcn + theme tokens (the spec says so). If the Paper design needs custom components or styling, that is a spec change, so write it down when you come back.
- Inputs to bring to the Paper chat: inspo, sketches, `report-structure.md` (what the report contains), `GLOSSARY.md` (names on screen must match: Capture, Draft, Gap, Unknown, Confirmation, Submission, Addendum).

Starter prompt for the new chat:

> Design the Shift Report "Report" screen in Paper. Context: read `brief.md`, `GLOSSARY.md`, `.scratch/shift-report/report-structure.md`, `.scratch/shift-report/spec.md`. Moment: Closing Manager at ~02:15 reviewing AI Drafts, one Incident has a Gap. Constraints: dashed = Draft, inline Gap with "Unknown", Draft → its source Capture, per-Incident Confirm (no approve-all), empty Sections collapsed, light + dark. Target stack is shadcn/ui + Tailwind with theme tokens. My inspo and sketches: [attach]. Don't touch repo code or docs.

## While designing, keep a change log

One line per decision that contradicts or adds to the current docs. This is the input for the way back. For example:

- Section order changed (Incidents not first)
- Provenance shown only on expand
- New field on Incident (witnesses)
- Captures not shown as a separate tab

## Coming back

1. Export from Paper into the repo: screenshots of the key frames (light/dark, Gap state, confirmed state) into `docs/design/`, plus the token values (colors, radius, type scale).
2. `/grill-with-docs` with the change log and the frames. It walks each change against GLOSSARY and ADRs. Changed decisions get a new ADR that supersedes the old one; don't edit accepted ADRs in place.
3. Update `spec.md` user stories and `report-structure.md` to match. Close the 4 open decisions in `report-structure.md` section 4.
4. Map Paper styles to `globals.css` theme tokens. This becomes the first ticket in 2b.
5. Optional: rebuild the design as variant E in `/prototype/report` to click through the interaction states.
6. Tick 2a in `PROCESS.md`, then `/to-tickets`.
