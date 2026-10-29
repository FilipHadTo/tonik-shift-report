# Design changelog

Design decisions from the design phase (Report screen) that differ from the written docs. Input for `/grill-with-docs` when the design is folded back into the spec. Decisions are Filip's; anything inferred is marked "(inferred)". Since 2026-10-29 the design is built as a localhost prototype, not in Paper (see Process).

## Process

### Report screen is mocked as a clickable localhost prototype, not in Paper
- Type: Contradicts
- Decision: The desktop Report screen is mocked as a clickable prototype in the Next.js app instead of being designed in Paper.
- Docs say: `paper-design-plan.md`: the Report screen is "designed by hand in Paper", then folded back; "Coming back" step 1 exports Paper frames and token values to `docs/design/`, step 4 maps Paper styles to `globals.css`, step 5 (rebuild in code) is optional. PROCESS.md 2a status line says "Report screen designed by Filip in Paper". The `spec-diff` agent description and this file's intro also say "Paper".
- Fold back: Rewrite `paper-design-plan.md` (rename, drop Paper export steps; the prototype is the design artifact and its code carries the token values, so "map Paper styles to tokens" becomes "promote prototype tokens"). Update the PROCESS.md 2a line. Keep the click-through, which `paper-design-plan.md` already treated as the answer to Paper's static-canvas limit. Decide where the prototype lives relative to `/prototype/*` and the `prototype/*` branch capture step.
- Date: 2026-10-29

### Stock shadcn dropped for this screen; custom components and a custom token set
- Type: Contradicts
- Decision: Where shadcn doesn't fit the design, components are custom and hand-styled. Theme tokens are still used, but as a custom token set.
- Docs say: Spec, Implementation Decisions, "Platform": "starting from stock shadcn defaults. All styling goes through the theme's CSS variables". Commit 9032ed3 "Spec: stock shadcn, styling via theme tokens only". `paper-design-plan.md`, "Before opening the new chat": custom components are a spec change, write it down.
- Fold back: Edit the "Platform" and "Visual language" decisions: shadcn is optional primitives, not the visual layer; tokens stay the single styling path (the "swap the token block" rationale still holds). Say which parts stay shadcn (inferred: none decided; Filip said "where it doesn't fit"). Settles the "stock vs custom" question in `paper-design-plan.md`. The Report editor entry below no longer has to map onto stock shadcn.
- Date: 2026-10-29

## Layout

### Three columns plus a top bar
- Type: Extends
- Decision: Desktop Report screen = top bar + left sidebar (Captures inbox) + center (the report as a Notion-like document) + right sidebar (table of contents of Sections).
- Docs say: Spec, Implementation Decisions, "One Shift Report, two entry points": Captures and the capture surface on one side, the rail with Sections and Incidents on the other, "stacked or tabbed on mobile". There is no center column that holds the report itself; the report body is not a defined surface in the spec.
- Fold back: Rewrite the Report screen paragraph in the spec. Define the mobile version of a three-column screen (not decided yet). Roles of the left and right columns change, see the entries below.
- Changed 2026-10-29 (second pass): right sidebar is now specified as a table of contents with scroll-spy (was "list of all Sections").
- Changed 2026-10-29 (fourth pass): the right sidebar now opens with a "Before you submit" block above the Sections list (see Section rail). Invite staff and Draft all swapped places (see Top bar, AI scopes).
- Date: 2026-10-29

### More whitespace: taller top bar, wider column gaps, looser Sections and rail rows
- Type: Extends
- Decision: Taller top bar, wider gaps between the three columns, more space between document Sections and between rail rows.
- Docs say: Silent. "Visual language" has no spacing rules; "Platform" only requires styling through theme tokens.
- Fold back: No spec edit. Spacing values go into the token set when prototype tokens are promoted (inferred).
- Date: 2026-10-29

## Captures inbox

### No background AI processing; the manager curates Captures by hand
- Type: Contradicts
- Decision: Captures that arrive during the Night are not auto-extracted into Drafts. Nothing runs in the background. The left sidebar is an inbox. The manager either rewrites a Capture into the report by hand, or triggers the AI explicitly (per Capture, per Section, whole report; see the AI scopes entry).
- Docs say: Spec, Solution: "the AI has turned them into Drafts of Sections and Incidents" and "The Shift Report builds itself during the Night". Story 18 ("the AI to have already produced Drafts"). Story 25 ("Drafts to update when I paste, attach or pause"). Story 19 (counts of Incidents to confirm and Gaps at a glance, which are zero until the manager acts). Implementation Decisions, "Extraction triggers": runs on paste, attach, new mobile Capture, typing pause. Story 16 still holds (Captures are in the report verbatim).
- Fold back: Rewrite the Solution paragraph. Replace stories 18 and 25 and the "Extraction triggers" decision with explicit, manager-triggered extraction only. Rewrite story 19. Update the "Extraction contract" (one route per report; now also per Capture and per Section, and the per-IP rate limit sees more calls). Update the demo seed (stories 64, 67 and the Polish priority "confirming an Incident that has a Gap"): either the seeded Night ships with Drafts already created, or the reviewer must press the AI button first. Update ADR 0004, which says staff Captures "become Drafts the Closing Manager must confirm"; that is no longer automatic. A new ADR is needed, since "AI-first, builds itself" was a core premise (ADR 0003 and ADR 0002 are not contradicted).
- Changed 2026-10-29 (second pass): Filip stated it as a rule ("nothing runs in the background"), so the decision is firm, no longer an inference from the layout.
- Date: 2026-10-29

### Capture tile states: New, Drafted, In report, Dismissed
- Type: Extends
- Decision: A tile moves New, then Drafted (the AI put it into the report, awaiting review), then In report (muted, shows where it went, e.g. "→ Incident 1 · Maintenance"), or Dismissed at any point. A Capture the manager rewrote by hand is marked In report manually.
- Docs say: Silent. Spec has no per-Capture state; ADR 0003 requires every Section Draft and Incident field to store source Capture references.
- Fold back: Add the four states to the domain model and glossary (replaces the earlier "already in report" wording). "Drafted" ties to the Draft lifecycle: Drafted becomes In report when the Draft is confirmed (Incident) or kept (Section) (inferred). Manual "In report" has no AI-written field to hold a source reference; ADR 0003 needs a manager-entered field that still records the source Capture, or the link is only a tile flag (inferred, to decide). Still open: can one Capture feed several Sections (the tile then shows several destinations); what happens to the tile if the Draft it fed is discarded (back to New, inferred); can the manager undo In report.
- Changed 2026-10-29 (second pass): replaces "AI action per Capture, muted 'already in report' state". Open point 1 (does a manual rewrite mute the tile) is settled: yes, via a manual mark.
- Date: 2026-10-29

### Capture tile content: author, kind, Captured-at, text, thumbnail
- Type: Extends
- Decision: A tile shows author name and role, Capture kind (photo / voice / text / pasted chat), Captured-at, the text, and an Evidence thumbnail.
- Docs say: Story 17 and story 48 need the author (Staff Member name and role) visible per Capture; ADR 0004 says every Capture carries name and role. Glossary, Evidence: a Capture "attached to a specific Incident or Section".
- Fold back: Author and kind now satisfy stories 17 and 48 and ADR 0004, no gap left. Wording: a New Capture's thumbnail is not yet Evidence by the glossary definition (it is Evidence only once linked to an Incident or Section); call it "photo thumbnail" on the tile, or widen the glossary. Date/time on the tile = Captured-at.
- Changed 2026-10-29 (second pass): author and kind were "inferred, not listed"; Filip has now listed them.
- Date: 2026-10-29

### Captures cannot be deleted; Dismiss hides them, with an archive and undo
- Type: Contradicts
- Decision: A Capture cannot be deleted. "Dismiss" hides it from the inbox; it stays in the record. There is an archive of dismissed Captures, with undo.
- Docs say: ADR 0003: raw Captures "are kept verbatim"; Spec, "Evidence model (ADR 0003)": "No step ever modifies a Capture". Story 16 (every Capture is in the report verbatim). Story 61 (nothing I entered is ever lost). report-structure.md: Captures are "System-kept, never edited". Glossary, Capture: "Kept verbatim, never edited by AI".
- Verdict: Settles the earlier open choice in favour of option A (soft delete). This protects ADR 0003 and story 61. The dismissed Capture's content is never changed, only its visibility. It no longer contradicts ADR 0003 or story 16 in substance.
- Fold back: Extend ADR 0003 ("no step ever alters Capture content; Dismiss is a logged visibility change", inferred wording). Add a spec story for Dismiss and undo, and a Dismissed tile state. report-structure.md "Captures" table and the submitted report must still list dismissed Captures, flagged as dismissed (inferred; "stays in the record"). Still open: who and when is logged on a Dismiss (inferred: yes); can the manager dismiss a Staff Member's Capture; can a Capture be dismissed after a confirmed Incident or kept Section cites it (the Extract rule would otherwise turn confirmed content into a Gap); what happens to Drafts that cite a Capture dismissed later; are Evidence photos of a dismissed Capture unlinked from their Incident; is the archive readable after Submission.
- Changed 2026-10-29 (second pass): was "Capture can be deleted from the sidebar", hard or soft not specified; now soft, called Dismiss.
- Date: 2026-10-29

### Desktop composer at the bottom of the inbox is the braindump surface
- Type: Extends
- Decision: The manager adds a Capture from a composer at the bottom of the inbox, like a Figma comment. It grows on focus and is the braindump surface. There is no separate braindump textarea in the report editor.
- Docs say: Story 20: "one capture surface where I can type freely", story 21 (paste group chat), story 23 (attach photos), story 24 (dictation). Implementation Decisions put "Captures and the capture surface on one side". The placement matches; the comment-style composer producing one tile per Capture is new.
- Fold back: Reword story 20: the braindump is now a Capture composer, one Capture per send, no AI on send. Stories 21, 23, 24 must be reachable from the composer (paste a chat, attach photos, dictate); check each. Story 26 (write directly into a Section) now means typing in the document; story 27 (no guided/freeform choice) still holds. Adding a Capture does not trigger extraction (see no-background-AI entry). Open: a pasted group chat becomes one tile (as in report-structure Capture #4), not one per message (inferred).
- Changed 2026-10-29 (second pass): composer is now the braindump surface and grows on focus; separate braindump textarea in the editor is ruled out.
- Date: 2026-10-29

### Hovering a Draft highlights its source Captures, and the reverse
- Type: Contradicts
- Decision: Hovering a Draft in the document highlights its source Capture tiles in the inbox, and hovering a tile highlights the Drafts that cite it.
- Docs say: Story 29: "clicking a Draft highlights the Capture it came from". Spec, Solution and "Visual language": "Clicking a Draft highlights" / "Selecting a Draft highlights its source Captures". One direction only, on click.
- Fold back: Reword story 29 and "Visual language": hover, both directions. Hover is not available on touch, so decide the mobile equivalent (tap, inferred). Capture tile highlight needs the inbox and the Draft in view at once; the inbox may need to scroll to the source.
- Date: 2026-10-29

## Report editor

### Report is a Notion-like document in the center column
- Type: Contradicts
- Decision: The center column is the report as a Notion-like document. Sections other than Incidents are free text blocks. An Incident is a structured block inside the document.
- Docs say: Implementation Decisions, "Platform": stock shadcn + Tailwind (now dropped, see Process). "Sections": only Incidents get structured fields, all other Sections hold a single text Draft (matches free text blocks). ADR 0003: provenance is stored per Incident field and per Section Draft. paper-design-plan.md: a custom component is a spec change.
- Fold back: Document how a Section maps to the data model: one block group per Section with one text Draft and one provenance (keeps ADR 0003), or per-block provenance (would change ADR 0003); one text Draft per Section is the inference. Update the spec "Sections" and "Visual language" decisions. The mock does not need a real editor library; if the build does, it is custom, not stock shadcn.
- Changed 2026-10-29 (second pass): "block editor" now "Notion-like document"; Incident as a structured block is decided (was inferred); the stock-shadcn conflict moved to the Process entry.
- Date: 2026-10-29

### Incident block layout: metadata layout under review (E, F, G, H), then What happened, Evidence
- Type: Extends
- Decision: An Incident is a structured block, not free text: metadata (Occurred at, Location, Type, Reported by), then What happened, then Evidence. The metadata has four layouts in the prototype switcher; Filip has not picked one. E table: label column. F chip row under the title: icon in the chip, no labels, Captured-at only inside the time picker. G side column: story on the left, properties stacked on the right. H strip: equal cells, label over value.
- Docs say: report-structure.md section 2: Incident fields are Occurred at, Captured at, Location, Type, What happened, Evidence, Reported by, Confirmation. Story 37: "every Incident to show both Occurred-at and Captured-at". ADR 0003: both times stored.
- Fold back: Captured-at is missing from Filip's list of property rows. Confirm where it shows (inferred: read-only, system-set, beside the Occurred-at quick options, or in the provenance view), otherwise story 37 is not met. Add the block layout to the spec "Visual language". "Reported by" only appears when the source is a Staff Member (report-structure); chip is conditional (inferred).
- Open until Filip picks: story 37 needs both times shown, and F shows Captured-at only inside the time picker, so F fails the story at rest unless story 37 is reworded or Captured-at gets another home. Whether E, G, H show Captured-at is not stated. F has no visible labels, so Occurred at / Location / Type (glossary and report-structure terms) are readable only by icon, and an empty Gap chip has no label; it needs an accessible name or the picker header must name the field. Add the chosen layout to "Visual language".
- Changed 2026-10-29 (fourth pass): was "property rows as chips"; now four layouts, undecided.
- Date: 2026-10-29

### Gap is an empty chip with a picker (amber tint, no dashes); Occurred at uses a time picker
- Type: Extends
- Decision: A Gap is an empty chip that opens a picker with "Unknown". Since 2026-10-29 it is an amber tint with an amber hairline ring and a dot, not dashed (see "No dashed outlines"). Occurred at uses a time picker with quick options near the Captured-at time, plus Unknown; it is not typed free-form.
- Docs say: Stories 31 to 33: Gap is an inline empty slot, one tap to fill (location picker, time picker), or Unknown. Spec "Visual language": same. Neither prescribes the chip's look.
- Fold back: Matches stories 31 to 33; the chip and picker forms are new detail, add to "Visual language". Amber is a second signal colour next to the Draft blue: record it as the Gap colour. Define "near the Captured-at time" (quick options around it, inferred). Occurred-at picker: can it set a time earlier than the first Capture, or on the other side of midnight; the Night cut-off (08:00, ADR 0002) matters here.
- Changed 2026-10-29 (third pass): was "dashed empty chip"; dashes removed, amber tint plus hairline ring plus dot.
- Changed 2026-10-29 (fourth pass): the chip form depends on the Incident metadata layout still under review; F is chips, in E, G, H the Gap is an empty value cell (inferred).
- Date: 2026-10-29

### Per-Incident Confirm in the block; Section Drafts get Keep / Discard inline on the label row
- Type: Contradicts
- Decision: Each Incident has its own Confirm inside the block, disabled until its Gaps are filled. Section Drafts get Keep and Discard, placed inline on the Draft's label row (the "AI draft from <author> <time>" line), not in a footer. Draft look itself: see "No dashed outlines".
- Docs say: Stories 44, 45: per-Incident Confirmation, no approve-all. Story 46 and Glossary, Confirmation: other Sections "take AI Drafts directly" and stay editable and clearable; story 46 says "accept". Glossary Confirmation _Avoid_: "approval, accept, validate". Submission readiness lists "unconfirmed Incidents, remaining Gaps" as two separate blockers. Spec is silent on where Section Draft controls sit.
- Fold back: (1) Confirm disabled while Gaps remain is new. Spec only blocks Submit on Gaps; the Polish priority "confirming an Incident that has a Gap" implies the reverse. Add a story; then the "Gaps" blocker in readiness is always implied by "unconfirmed Incident" unless a confirmed Incident can regain a Gap (e.g. the manager clears a chip, or reopens it, see "Confirmed Incident"); decide. Unknown still counts as filled (Glossary, Unknown). (2) "Keep" replaces "accept" for Section Drafts: add Keep and Discard to the glossary, say whether Keep is a Confirmation (glossary says Sections do not need one). Discard is new (story 46 says clearable). Inline placement is a layout detail for "Visual language". (3) Per-Incident Confirm is the same as the old inline-on-rail confirmation, only moved (see Incidents).
- Changed 2026-10-29 (third pass): Keep / Discard moved from a footer to the label row; the dashed-outline part of this entry moved to "No dashed outlines", so it no longer matches the spec on Draft look.
- Date: 2026-10-29

### AI scopes: per Capture, per Section, whole report
- Type: Extends
- Decision: Three explicit scopes. Per Capture: "Draft into report" on a tile. Per Section: "Draft from inbox" in the Section header, using New Captures relevant to that Section. Whole report: "Draft all" in the Inbox header, shown only while there are New Captures. Nothing runs in the background.
- Docs say: Silent on manual AI actions (the AI always ran by itself). Extract takes "the Night's Captures and the current report state".
- Fold back: Extract needs a scope input (which Captures, which Section). Rules to keep: confirmed or edited content is never overwritten; fields without a source stay Gaps; no approve-all for Incidents (story 45) even after a whole-report draft. New stories needed, and the "Extraction contract" route changes (see no-background-AI entry). The degraded-AI message ("AI is catching up") now shows on a button press. Settled: per-Section uses only New Captures (Drafted and In report do not take part); the count (n) is the number of New Captures (inferred). Open: how "relevant to that Section" is decided (the model, with possible mismatch, inferred); whether the Incidents Section has its own "Draft from inbox" (not stated); whether a per-Capture draft may target several Sections.
- Changed 2026-10-29 (third pass): see the routing entry below; in the prototype a typed Capture with no scripted draft is routed to the Section its words point to.
- Changed 2026-10-29 (second pass): button labels fixed and "use only unused Captures" answered; replaces "One AI button fills the whole report; a per-Section AI button fills one Section".
- Changed 2026-10-29 (fourth pass): whole-report button moved from the top bar to the Inbox header, renamed "Draft all" (was "Draft all from inbox (n)"), hidden when there are no New Captures. Now it sits next to the Captures it acts on, so it reads as "all New Captures" rather than a report-level action; the earlier "whole report" name still fits because Draft all only takes New Captures anyway. Whether it still shows the (n) count is not stated.
- Date: 2026-10-29

### AI routes a typed Capture to the Section its words point to, falling back to General overview
- Type: Extends
- Decision: A typed Capture with no scripted draft is routed by the AI to the Section its words point to (kitchen text goes to Kitchen, and so on). If no Section matches, it lands in General overview. Seen in prototype behaviour; (inferred) as the intended product behaviour, Filip has not stated it as a rule.
- Docs say: Silent. "Sections": the AI fills Section Drafts but no rule says how a Capture is matched to a Section, and no fallback is named. The "AI scopes" entry already lists "how 'relevant to that Section' is decided" as open.
- Fold back: Close that open point: the model picks the Section, with General overview as the catch-all. Add the fallback to the Extraction contract. Knock-on: if the matched Section is hidden in the right sidebar, either unhide it or fall back to General overview (decide; General overview is a default-visible Section). Incident-looking text (a fight, an injury) should create an Incident, not a Section Draft; the routing rule must say Incident wins (inferred). A Capture that feeds an Incident Draft and a Section may need several destinations (open point in the Capture tile states entry). Wrong routing is only a Draft until Keep / Discard, so the cost is low; the tile's "In report" destination label should show the Section so the manager can spot a mismatch.
- Date: 2026-10-29

### No dashed outlines; Draft is a blue wash with a label, Confirmed is flat, Gap is amber
- Type: Contradicts
- Decision: No dashed outlines anywhere; Filip: dashed lines look low-end. A Draft (Section text or Incident) is a soft blue wash (diagonal, radial from the top-left corner) with a hairline blue ring and an "AI draft from <author> <time>" label on top. A confirmed Incident is flat and quiet: hairline neutral ring, no background, no footer. A Gap chip is an amber tint with an amber hairline ring and a dot.
- Docs say: Spec, Solution: "There's one visual rule: anything with a dashed outline is a Draft". Story 28: "every AI-written item to look visibly different (dashed outline)". Implementation Decisions, "Visual language": "A dashed outline with a light accent tint means Draft ... Confirmed or edited content renders as plain content." `paper-design-plan.md` starter prompt: "dashed = Draft". Story 47 (Confirmation turns a Draft into plain, settled content) still holds. The tint part of the spec rule is kept.
- Fold back: Rewrite the Solution sentence, story 28 and "Visual language": the rule is now "a blue wash with a label means Draft". Drop "dashed" from the `paper-design-plan.md` prompt. Remove "outline" as the signal, so the rule must not rely on outline alone: the wash and the label carry it (accessibility: the label text makes Draft readable without colour, keep it). "Plain content" in the spec now has a hairline neutral ring for confirmed Incidents; reword to "flat and quiet". The label shows the Capture author ("AI draft from <author> <time>"): ties to ADR 0003 provenance, which stores source Capture references but the spec does not say a Draft shows its author and time on screen; decide which Capture the label names when a Draft has several sources (inferred: the first or the latest). Section Drafts that the manager edits: does the label go away and the block turn plain (the spec says edited content renders as plain). Amber for Gaps is a second signal colour, add to the token set.
- Changed 2026-10-29 (fourth pass): the wash is softer and diagonal (radial from the top-left corner) instead of a flat top-to-bottom gradient, and the blue hairline ring is slightly lighter. A softer wash and ring weaken the Draft signal further, so the label has to carry it (already required above). Token set needs the radial wash and the lighter ring values.
- Date: 2026-10-29

## Section rail

### Right sidebar: table of contents with scroll-spy, status, show/hide, "More sections"
- Type: Contradicts
- Decision: The right sidebar is a table of contents with scroll-spy. Each Section shows a status (Gaps, to confirm, draft, empty) and a show/hide toggle. A "More sections" list adds hidden Sections. Visible by default: General overview, Incidents, Security, Maintenance / equipment. Incidents cannot be hidden while it has unconfirmed Incidents. A Section with content can be hidden only after clearing it (inferred: the mock shows hide disabled while there is content).
- Docs say: Story 49 (see every Section on the rail), story 50 (empty Sections collapsed to a single line), story 52 (Sections with content expanded), story 51 (all optional, still holds). Spec, Solution: "a rail shows the report's Sections and Incidents filling in". report-structure.md: 12 other Sections, empty ones "collapse into 'Not covered tonight'". Brief: all 13 Sections named. Glossary, Confirmation: other Sections "can be edited or cleared".
- Fold back: Rewrite 49, 50, 52; replace the word "rail" (it is now a table of contents, not Section/Incident cards). The submitted report: hidden Sections no longer appear, so the "Not covered tonight" line must come from visible empty Sections or be dropped. Clearing before hiding means hiding never loses content silently, but clearing a Section Draft removes its source references; log the clear (inferred). Default set is Filip's: the earlier guess "General overview, Incidents" was too narrow. report-structure.md section 4, "Is the order right?": the default order is General overview, Incidents, Security, Maintenance / equipment, which puts General overview first as the brief does; decide whether this closes that question. Status labels reuse glossary words (Gap, Draft); "to confirm" for Incidents. Is "empty" the same as "hidden"? No: empty is visible without content, hidden is toggled off (inferred).
- Changed 2026-10-29 (second pass): scroll-spy, per-Section status, "More sections", the default four Sections, and the Incidents and hide-with-content rules are new; core Sections were previously inferred.
- Changed 2026-10-29 (fourth pass): the Sections list now sits below a "Before you submit" block (next entry), so the right sidebar is a checklist plus a table of contents.
- Date: 2026-10-29

### Right sidebar opens with "Before you submit"; Gap and to-confirm counters leave the top bar
- Type: Contradicts
- Decision: The right sidebar opens with a "Before you submit" block: one row per unconfirmed Incident (number, title, then "Gap: add time/location/type" in amber or "Ready to confirm" in blue), plus an optional "n Section drafts to keep" row. Every row scrolls to its item. When nothing blocks: "Ready to submit". The Sections list sits below. The counters are removed from the top bar.
- Docs say: Story 19: "how many Incidents need Confirmation and how many Gaps remain" at a glance (two counts). Stories 53, 54 and Spec, "Submission readiness": blockers are unconfirmed Incidents, remaining Gaps, missing reviewer statement; the checklist is on the Submit step. Story 46 and Glossary, Confirmation: Section Drafts are taken directly and need no Confirmation, so they are not a blocker.
- Fold back: Reword story 19: a per-Incident list of what blocks Submit, not counts (no total Gap count is shown anywhere now; one row names the missing fields, inferred). The block overlaps the Submit sheet checklist (story 54): decide whether both stay or the sheet reuses the block, and keep "Ready to submit" here consistent with the sheet's final Submit being enabled. The "Section drafts to keep" row is optional and does not block Submit (inferred): readiness must not list it, and "Ready to submit" shows while Section Drafts remain. The reviewer statement is not a row (inferred). Rows that scroll replace the old blocker-click jump (see Top bar). Copy: "Keep" matches the glossary additions; "Gap" and "Ready to confirm" are fine. Amber and blue are the Gap and Draft colours.
- Date: 2026-10-29

## Incidents

### Incident Confirmation and Gap filling move from the rail into the center document
- Type: Contradicts
- Decision: Incident Confirmation moves from the rail into the center document, inside the Incident block.
- Docs say: Implementation Decisions, "One Shift Report, two entry points": "Incident Confirmation happens inline on the rail, never on its own screen". Stories 44, 47 and 48 assume Incidents are on the rail. Stories 49 to 52 treat the rail as the place where Sections and Incidents appear.
- Fold back: Reword to "inline in the report"; this keeps the "never on its own screen" intent and per-Incident Confirmation (stories 44, 45). Gap picker (stories 31 to 33) also lives in the block. Story 19 (counts of Incidents and Gaps) lands in the right sidebar "Before you submit" block, see Section rail. Stories 47, 48 need rewording for the document.
- Changed 2026-10-29 (second pass): decision was inferred from the layout; Filip has now stated it.
- Changed 2026-10-29 (fourth pass): story 19 moved from the top bar to the right sidebar block.
- Date: 2026-10-29

### Confirmed Incident shows "Confirmed HH:MM" and a hover-only Reopen; reopening returns it to Draft
- Type: Contradicts
- Decision: A confirmed Incident shows "Confirmed HH:MM" and, on hover only, a "Reopen" action. Reopening returns the Incident to Draft.
- Docs say: Silent on undoing a Confirmation. Story 47: Confirmation visibly turns the Draft into settled content. Glossary, Confirmation: the manager's "explicit approval of a Draft, making them its author"; Draft: "content the AI derived from Captures that the Closing Manager has not yet confirmed". ADR 0003 / spec "Evidence model": provenance is one of ai-drafted / confirmed / manager-entered per field, no "reopened" state. Story 57 and ADR 0002: locked after Submission, so Reopen can only exist while the report is open. The Extract rule says confirmed or edited content is never overwritten.
- Fold back: Add a story (Reopen a confirmed Incident) and a Glossary note: Confirmation is reversible before Submission. Define the provenance after a Reopen: a reopened Incident holds ai-drafted and manager-entered fields, so it is not purely an "AI draft"; the Draft label "AI draft from <author> <time>" would be wrong for it (inferred: show a different label, or keep the label and the provenance per field). Decide whether Extract may overwrite a reopened Incident (it is a Draft again, so by the current rule yes; probably should not) and whether Gaps filled before Confirm stay filled. Submission readiness: a Reopen after the last Confirm brings back the "unconfirmed Incident" blocker, and the Incident returns to the "Before you submit" block (inferred). Log who reopened and when (inferred, matches the Dismiss logging question). "Confirmed HH:MM" is the Confirmation time: the spec stores no confirmed-at timestamp, add it to the data model. Hover-only has no touch equivalent, decide the mobile version (same issue as hover highlight in the Captures inbox entries).
- Date: 2026-10-29

### Photo Evidence shows an icon placeholder, not a fake photo (prototype only)
- Type: Contradicts
- Decision: Photo Evidence in an Incident shows an icon placeholder instead of the fake rendered photo. Prototype only.
- Docs say: Spec, "Files": "Upload is fake: chips, a short fake progress state, stock thumbnails."
- Fold back: Nothing if it stays prototype-only; the build still follows "stock thumbnails" unless Filip says otherwise. Inbox tile thumbnails are not mentioned (inferred: unchanged).
- Date: 2026-10-29

## Top bar

### Top bar: breadcrumb, Open status, Invite staff, Submit
- Type: Extends
- Decision: The top bar holds the breadcrumb "Halo Club / Night of Sat 24 Oct", an "Open since 23:40" status, "Invite staff" and Submit. No Gap or to-confirm counters (moved to the right sidebar), no AI action (Draft all moved to the Inbox header). The report name is derived from venue and Night and is not editable.
- Docs say: Header is system-filled ("Shift Report: Halo Club, Night of ..."), report-structure.md section 2. ADR 0002 and story 8: the report must show which Night it belongs to and when it opened. Story 19: counts of Incidents to confirm and Gaps at a glance.
- Fold back: Closes the earlier questions: the name is derived (matches ADR 0002, report is keyed by venue and Night); story 8 and ADR 0002's "UI must make this obvious" are met by the breadcrumb and "Open since"; story 19 no longer lives here, see "Before you submit" (Section rail). Check "opened by which Capture" (report-structure header) is not shown, fine for the top bar. No "actions" menu was decided.
- Changed 2026-10-29 (second pass): the earlier "report name editable or derived" and "where do the counts live" questions are answered.
- Changed 2026-10-29 (fourth pass): blocker summary removed (now the right sidebar block); "Draft all from inbox" moved out to the Inbox header; Invite staff moved in from the Inbox header.
- Date: 2026-10-29

### "Invite staff" popover (link and QR) sits in the top bar next to Submit
- Type: Extends
- Decision: "Invite staff" is a popover with a copyable link and a QR code for Staff Members, placed in the top bar next to Submit. Not called "Share".
- Docs say: Story 10 (show a QR code or link on the phone), ADR 0004 (per-Night link or QR, no login). Nice-to-have 5 is a different thing: QR handoff from desktop to the manager's own phone for photos. Story 59 uses "share" for the submitted report.
- Fold back: Update story 10 to cover desktop. Keep nice-to-have 5 separate. ADR 0004 is silent on when the link stops working (after Submission, report locked); worth stating (inferred), and the top bar button should then be hidden or disabled on a submitted report (inferred). The name "Invite staff" removes the collision with story 59 "share". Placement next to Submit is a layout detail, no doc conflict.
- Changed 2026-10-29 (fourth pass): moved from the Inbox header to the top bar. Earlier changes: renamed from "Share", popover form decided (second pass).
- Date: 2026-10-29

## Submission

### Submit is always clickable; the sheet holds the checklist and the statement
- Type: Resolves
- Decision: Submit in the top bar is always clickable and opens a sheet with the blocker checklist and the reviewer statement. The final Submit inside the sheet is disabled until the report is ready.
- Docs say: Story 53: "Submit disabled until every Incident is confirmed and no Gaps remain". Story 54: "a short checklist on the Submit step showing exactly what's left". Stories 55, 56: reviewer statement, AI-assisted footer. Spec: Submit is a sheet. Submission readiness returns the exact blockers.
- Fold back: Rewrite story 53 so the disabled control is the final Submit in the sheet, not the top bar button; story 54 then holds as written. Resolves the conflict between 53 and 54 noted in the earlier Top bar entry. Spec wording "Submit (a sheet)" stays as is.
- Date: 2026-10-29

## Copy

### "Inbox" and "Captures"; no "Quick Notes"
- Type: Resolves
- Decision: The sidebar header is "Inbox" and its items are Captures. "Quick Notes" is not used.
- Docs say: Glossary, Capture: _Avoid_: note, entry, upload, dump. Glossary has no entry for "Inbox".
- Fold back: The glossary term Capture stays. Add "Inbox" to the glossary as a UI label for the list of tonight's Captures, with In report tiles muted and Dismissed ones moved to the archive (inferred). Watch for "note": "voice note" as a Capture kind is fine (spec already uses it); "Draft into report", "Draft all" and the per-Section "Draft from inbox" use "Draft" as a verb (Glossary defines it as a noun, content); acceptable, note it.
- Changed 2026-10-29 (second pass): was Contradicts ("Quick Notes" as the name of Captures); Filip dropped it.
- Date: 2026-10-29

### Terms that need a glossary check: "Keep / Discard", "Dismiss", "Drafted", "In report", "Inbox"
- Type: Extends
- Decision: UI wording now includes Keep and Discard (Section Drafts), Reopen and "Confirmed HH:MM" (Incidents), the Draft label "AI draft from <author> <time>", Dismiss and Dismissed (Captures), the tile states New, Drafted, In report, and "Inbox". "Invite staff" replaces "Share"; the tile says "photo" or the Capture kind, not "attachment".
- Docs say: Glossary, Confirmation: _Avoid_ "approval, accept, validate" (Keep/Discard avoids the list; spec story 46 and report-structure.md already say "accept" for Sections). Glossary, Evidence: _Avoid_ "attachment, file, media". Glossary, Draft: content the AI derived, not yet confirmed. No glossary entry for tile states or Dismiss.
- Fold back: Add to GLOSSARY.md: Inbox, Dismiss (soft hide, logged, undoable), the Capture states, Keep and Discard. For Incidents the UI must say Confirm, never Accept. Replace "accept" in story 46, report-structure.md ("AI draft, accepted") and the Confirmation definition with Keep. "Evidence thumbnail" on a tile: see tile content entry. "Invite staff" avoids the "Share" collision with story 59.
- Changed 2026-10-29 (second pass): "Share" and "already in report" are settled (Invite staff, In report); "accepted" becomes Keep.
- Date: 2026-10-29
