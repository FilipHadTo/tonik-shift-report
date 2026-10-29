# Design changelog

Design decisions from the design phase (Report screen) that differ from the written docs. Input for `/grill-with-docs` when the design is folded back into the spec. Decisions are Filip's; anything inferred is marked "(inferred)". Since 2026-10-29 the design is built as a localhost prototype, not in Paper (see Process). Final state: `/prototype/report-editor` at commit 00fd36f (built on branch `AI-Exploration`, now merged into `main`); where this log and the code disagree, the code wins. Screenshots in `docs/design/`.

## Folded back (2026-10-29)

Every entry below up to 00fd36f, plus Filip's decisions from the fold-back grill, is now in the docs. Read those, not this log, for the current rules. New design decisions from phase 2a.3 onward are appended below as before.

- `GLOSSARY.md`: Shift Report (started by the manager), Inbox and Capture states, Dismiss, Draft (AI writes only on request), Confirmation (Incidents only, reversible), Keep / Discard, Occurred-at default.
- ADR 0005 (manager starts the report, supersedes 0002), ADR 0006 (prototype E is the visual layer, on Base UI), ADR 0007 (AI drafts only on request). ADR 0004 edited in place (Inbox, Dorota's answer).
- `spec.md`: rewritten and renumbered stories, including the empty report as onboarding (3, 4), Enhance (27), the mobile capture page only (7–13), and the demo switch 20:00 / 02:15 (60, 61).
- `report-structure.md`: the submitted report as a clean document with Attachments at the end; section 4 closed.
- Grill outcomes not visible elsewhere: the AI never reads photos, and Location comes only from Capture text (the Gap hint no longer mentions the photo). Occurred-at is the stated time, else Captured-at, else for a chat the line's timestamp (seed Incident 4 is now 01:42, not a Gap). Deleting an Incident returns its Capture to New. Incidents are ordered by Captured-at. Dismiss applies to New Captures only. Witnesses are out (Dorota). The Report screen is desktop only. Dark mode comes first.
- Not yet in the prototype at the time (phase 2a.3): the 20:00 empty state and onboarding, Enhance, the demo switch, the mobile capture page, "Started 20:00" instead of "Opened 23:40 by Alex's photo", and a deleted Incident's Capture going back to New. All are now built; see "Phase 2a.3" at the end of this file.

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
- Changed 2026-10-29 (phase 2a.3, second pass): a Capture with a part missing from the report is New again, with "Draft into report" for that part and "Already in Maintenance" on the tile; no "Draft the rest" state (see "Incidents: a Capture with a part missing …"). "New" is therefore no longer "not in the report at all".
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
- Changed 2026-10-29 (fifth pass, 9457441): F picked. Properties are one chip row under the title, icon inside the chip, no labels; the Incident number sits inline before the title. Captured-at is shown only in the Occurred-at chip's tooltip ("Occurred at 23:40 · Captured at 23:40") and in the time picker header ("Before it was captured (23:40)"). Each chip has an accessible name ("Occurred at: 23:40", "Gap, add location"), which closes the label concern. Story 37 is still not met at rest; open.
- Date: 2026-10-29

### Gap is an empty chip with a picker (amber tint, no dashes); Occurred at uses a time picker
- Type: Extends
- Decision: A Gap is an empty chip that opens a picker with "Unknown". Since 2026-10-29 it is an amber tint with an amber hairline ring and a dot, not dashed (see "No dashed outlines"). Occurred at uses a time picker with quick options near the Captured-at time, plus Unknown; it is not typed free-form.
- Docs say: Stories 31 to 33: Gap is an inline empty slot, one tap to fill (location picker, time picker), or Unknown. Spec "Visual language": same. Neither prescribes the chip's look.
- Fold back: Matches stories 31 to 33; the chip and picker forms are new detail, add to "Visual language". Amber is a second signal colour next to the Draft blue: record it as the Gap colour. Define "near the Captured-at time" (quick options around it, inferred). Occurred-at picker: can it set a time earlier than the first Capture, or on the other side of midnight; the Night cut-off (08:00, ADR 0002) matters here.
- Changed 2026-10-29 (third pass): was "dashed empty chip"; dashes removed, amber tint plus hairline ring plus dot.
- Changed 2026-10-29 (fourth pass): the chip form depends on the Incident metadata layout still under review; F is chips, in E, G, H the Gap is an empty value cell (inferred).
- Changed 2026-10-29 (fifth pass, 9457441): F picked, so the Gap is the amber chip ("• Add location"). A Gap that has a reason carries an AI hint at the top of the picker ("The photo shows a window. No Capture says which one."). Time picker quick options are fixed offsets back from Captured-at: at capture, 10 m, 30 m, 1 h, 2 h before, plus an exact time input and "Mark as Unknown". Unknown sits under Location and Occurred at; Type has no Unknown (matches report-structure).
- Date: 2026-10-29

### Per-Incident Confirm in the block; Section Drafts get Keep / Discard inline on the label row
- Type: Contradicts
- Decision: Each Incident has its own Confirm inside the block, disabled until its Gaps are filled. Section Drafts get Keep and Discard, placed inline on the Draft's label row (the "AI draft from <author> <time>" line), not in a footer. Draft look itself: see "No dashed outlines".
- Docs say: Stories 44, 45: per-Incident Confirmation, no approve-all. Story 46 and Glossary, Confirmation: other Sections "take AI Drafts directly" and stay editable and clearable; story 46 says "accept". Glossary Confirmation _Avoid_: "approval, accept, validate". Submission readiness lists "unconfirmed Incidents, remaining Gaps" as two separate blockers. Spec is silent on where Section Draft controls sit.
- Fold back: (1) Confirm disabled while Gaps remain is new. Spec only blocks Submit on Gaps; the Polish priority "confirming an Incident that has a Gap" implies the reverse. Add a story; then the "Gaps" blocker in readiness is always implied by "unconfirmed Incident" unless a confirmed Incident can regain a Gap (e.g. the manager clears a chip, or reopens it, see "Confirmed Incident"); decide. Unknown still counts as filled (Glossary, Unknown). (2) "Keep" replaces "accept" for Section Drafts: add Keep and Discard to the glossary, say whether Keep is a Confirmation (glossary says Sections do not need one). Discard is new (story 46 says clearable). Inline placement is a layout detail for "Visual language". (3) Per-Incident Confirm is the same as the old inline-on-rail confirmation, only moved (see Incidents).
- Changed 2026-10-29 (third pass): Keep / Discard moved from a footer to the label row; the dashed-outline part of this entry moved to "No dashed outlines", so it no longer matches the spec on Draft look.
- Changed 2026-10-29 (sixth pass, 00fd36f): Confirm is no longer a disabled button. While the Incident has a Gap, the footer button is secondary and names the next step, "Add time to confirm" / "Add location to confirm" / "Pick type to confirm", with the field's icon; pressing it opens the first Gap's picker. With no Gaps it becomes the primary Confirm. The "Fill n Gaps to confirm" hint text is gone. The rule is unchanged: an Incident can't be confirmed while it has a Gap.
- Changed 2026-10-29 (phase 2a.3, second pass): the Confirm / "Add … to confirm" button moved from the footer to a label line above the title, next to Delete; the footer is gone (see "Incidents: Delete and Confirm sit on a label line above the title"). The Incident gets a third next step: "Keep or discard the AI draft to confirm" while an Enhance Draft is pending. "Pick type to confirm" is now "Add type to confirm" (inferred from the chip rename, see Copy).
- Changed 2026-10-29 (found in code, not logged before): editing a Section Draft's text keeps it (status becomes kept, the wash and label go); clearing the text removes the block. One Section can hold several blocks, one per drafted Capture plus any typed by the manager, each with its own sources.
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
- Changed 2026-10-29 (fifth pass, 9457441): the blue ring is gone; a pending Draft (Incident or Section text) is the wash plus the label, nothing else. A confirmed Incident drops the card entirely: no ring, no background, no footer. It sits in the document like text; two confirmed Incidents in a row are separated by a hairline centred in the gap. Confirm folds the footer away and fades the wash out. A manager-added Incident (not AI) is a neutral raised card with a hairline ring and an "Added by Alex Morgan" footer, no wash.
- Changed 2026-10-29 (phase 2a.3, second pass): the fifth-pass footers ("Added by Alex Morgan", Confirm) are gone; that text is now the label line above the title.
- Changed 2026-10-29 (sixth pass, 00fd36f): new wash: a long, stretched radial glow from the top-left (180% x 140%, fades out by 72%) over a faint flat blue base, so the block's edge still reads all round without a ring. Light and dark have their own values. This is the token to promote.
- Date: 2026-10-29

## Section rail

### Right sidebar: table of contents with scroll-spy, status, show/hide, "More sections"
- Type: Contradicts
- Decision: The right sidebar is a table of contents with scroll-spy. Each Section shows a status (Gaps, to confirm, draft, empty) and a show/hide toggle. A "More sections" list adds hidden Sections. Visible by default: General overview, Incidents, Security, Maintenance / equipment. Incidents cannot be hidden while it has unconfirmed Incidents. A Section with content can be hidden only after clearing it (inferred: the mock shows hide disabled while there is content).
- Docs say: Story 49 (see every Section on the rail), story 50 (empty Sections collapsed to a single line), story 52 (Sections with content expanded), story 51 (all optional, still holds). Spec, Solution: "a rail shows the report's Sections and Incidents filling in". report-structure.md: 12 other Sections, empty ones "collapse into 'Not covered tonight'". Brief: all 13 Sections named. Glossary, Confirmation: other Sections "can be edited or cleared".
- Fold back: Rewrite 49, 50, 52; replace the word "rail" (it is now a table of contents, not Section/Incident cards). The submitted report: hidden Sections no longer appear, so the "Not covered tonight" line must come from visible empty Sections or be dropped. Clearing before hiding means hiding never loses content silently, but clearing a Section Draft removes its source references; log the clear (inferred). Default set is Filip's: the earlier guess "General overview, Incidents" was too narrow. report-structure.md section 4, "Is the order right?": the default order is General overview, Incidents, Security, Maintenance / equipment, which puts General overview first as the brief does; decide whether this closes that question. Status labels reuse glossary words (Gap, Draft); "to confirm" for Incidents. Is "empty" the same as "hidden"? No: empty is visible without content, hidden is toggled off (inferred).
- Changed 2026-10-29 (second pass): scroll-spy, per-Section status, "More sections", the default four Sections, and the Incidents and hide-with-content rules are new; core Sections were previously inferred.
- Changed 2026-10-29 (fourth pass): the Sections list now sits below a "Before you submit" block (next entry), so the right sidebar is a checklist plus a table of contents.
- Changed 2026-10-29 (sixth pass, 00fd36f): "More sections" is collapsed by default: a disclosure row with a chevron and the count of hidden Sections, opening in place. The hide rule is confirmed in code: the hide control is disabled with a tooltip, "Confirm or delete every Incident first" (Incidents) or "Clear this section to hide it" (any Section with content). Drafting a Capture into a hidden Section unhides it, which closes the routing knock-on in the "AI routes" entry.
- Date: 2026-10-29

### Right sidebar opens with "Before you submit"; Gap and to-confirm counters leave the top bar
- Type: Contradicts
- Decision: The right sidebar opens with a "Before you submit" block: one row per unconfirmed Incident (number, title, then "Gap: add time/location/type" in amber or "Ready to confirm" in blue), plus an optional "n Section drafts to keep" row. Every row scrolls to its item. When nothing blocks: "Ready to submit". The Sections list sits below. The counters are removed from the top bar.
- Docs say: Story 19: "how many Incidents need Confirmation and how many Gaps remain" at a glance (two counts). Stories 53, 54 and Spec, "Submission readiness": blockers are unconfirmed Incidents, remaining Gaps, missing reviewer statement; the checklist is on the Submit step. Story 46 and Glossary, Confirmation: Section Drafts are taken directly and need no Confirmation, so they are not a blocker.
- Fold back: Reword story 19: a per-Incident list of what blocks Submit, not counts (no total Gap count is shown anywhere now; one row names the missing fields, inferred). The block overlaps the Submit sheet checklist (story 54): decide whether both stay or the sheet reuses the block, and keep "Ready to submit" here consistent with the sheet's final Submit being enabled. The "Section drafts to keep" row is optional and does not block Submit (inferred): readiness must not list it, and "Ready to submit" shows while Section Drafts remain. The reviewer statement is not a row (inferred). Rows that scroll replace the old blocker-click jump (see Top bar). Copy: "Keep" matches the glossary additions; "Gap" and "Ready to confirm" are fine. Amber and blue are the Gap and Draft colours.
- Changed 2026-10-29 (sixth pass, 00fd36f): toned down. Row text is neutral ink: "Add time, location" (was "Gap: add …" in amber) and "Ready to confirm" (was blue). Only the small dot stays amber for an Incident with a Gap; a ready Incident gets a neutral dot. The "Section drafts to keep" row has a neutral outline dot and an "Optional" tag. The header shows "n left" (unconfirmed Incidents). The ready state reads "Ready to submit · Every Incident is confirmed." The checklist is a quiet to-do list now, not a second alarm; the amber signal lives on the Gap chip in the document.
- Changed 2026-10-29 (phase 2a.3, second pass): the "Section drafts to keep" row is no longer optional. It reads "N AI drafts · Keep or discard", has no "Optional" tag and is counted in "left". "Ready to submit" now reads "Every Incident confirmed, every AI draft checked." The "does not block Submit" inference above is void (see "Submit is blocked by unchecked AI drafts"). Rows scroll to their item, now via "Show" on the Submit sheet (see Copy).
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

### No AI suggestion for Location; Occurred-at defaults to Captured-at
- Type: Contradicts
- Decision: Filip, 2026-10-29, after 00fd36f, not yet in the prototype: the AI does not suggest a Location; the manager picks it from the list. Occurred-at is prefilled by default with the moment the Capture was added (its Captured-at).
- Docs say: Glossary, Gap: "a required Incident field that no Capture supports. Left empty and flagged, never guessed". report-structure.md: Occurred at and Location are "AI draft or manager"; example Incident 2 takes 00:45 from "~00:45" in the Capture, Incident 3 takes 01:10 from "like five minutes ago" (logged 01:15), Incident 4 is Unknown because the chat says "sometime before midnight". Story 37 and ADR 0003: Occurred-at and Captured-at are separate on purpose. Prototype: Location is AI-drafted where the Capture names it ("Front door", "Main bar", "Cloakroom") and is a Gap with an AI hint otherwise; Occurred-at quick options already sit around Captured-at.
- Fold back: to grill. Open: does "no AI suggestion" mean the AI never fills Location even when a Capture names it, or only that the Gap picker drops the AI hint; does a stated time ("~00:45") still win over the default; is the prefilled time a Draft the manager confirms (and how it reads as "time of capture", not a stated time); how Occurred-at then ever becomes a Gap or Unknown.
- Date: 2026-10-29

### Dark mode first
- Type: Extends
- Decision: Filip, 2026-10-29: the product is designed and built dark-mode first, to the end. Light mode gets polished at the end if there is time.
- Docs say: Spec "Visual language" and `paper-design-plan.md`: "light + dark". The prototype has both.
- Fold back: Spec "Visual language": dark is the primary theme; light is supported through the same tokens but polished last. Screenshots in `docs/design/` lead with dark from now on.
- Date: 2026-10-29

### Manager can add an Incident by hand and delete an unconfirmed one
- Type: Extends
- Decision: Found in code (since 06af231), not logged before. "Add Incident" at the end of the Incidents Section creates an empty Incident written by the manager: no wash, neutral card, "Added by <manager>" footer, all three properties empty. Empty fields count as Gaps for Confirm and Submit. Its Captured-at is the moment it was added. Every unconfirmed Incident (AI or manual) has a "Delete Incident" icon in its footer. Confirmed Incidents can't be deleted, only reopened first. (Second pass: "Added by …" and Delete now sit on the label line above the title, not in a footer.)
- Docs say: Story 26 (write directly into a Section) covers text, not Incidents. Glossary, Gap: "a required Incident field that no Capture supports", which fits a manual Incident with no sources. Glossary, Occurred-at / Captured-at: Captured-at is "when it was recorded (set by the system)"; with no source Capture, the record time is the moment the manager added it. Spec is silent on deleting an Incident. ADR 0003: verbatim Captures kept; deleting an AI-drafted Incident removes only the Draft, the Capture stays.
- Fold back: Add stories for "add an Incident by hand" and "delete an unconfirmed Incident". Decide: what the source Capture tile shows after its only Incident Draft is deleted (code: it reads as In report, since nothing open cites it; inferred it should go back to New); whether a delete is logged; and whether a manual Incident needs a source at all (ADR 0003 says each field records where it came from; "entered by the manager" with no Capture is a valid provenance).
- Date: 2026-10-29

### Incidents are ordered by Captured-at
- Type: Extends
- Decision: Found in code. Incidents in the document, in "Before you submit" and in the tile labels ("Incident 2") are numbered and ordered by Captured-at, earliest first, on the Night clock (after midnight sorts after 23:59). A new Incident can renumber the ones after it.
- Docs say: Silent. report-structure.md example happens to be in Captured-at order.
- Fold back: Spec "Sections" gets one line. Open: order by Occurred-at instead (the event timeline, which the next team reads), now that Occurred-at can be set earlier than Captured-at (inferred to ask).
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
- Changed 2026-10-29 (phase 2a.3): the status pill now reads "Open since 20:00" (was "Open since 23:40"), the same start time as the document byline "Started 20:00"; both scenes start at 20:00. See "Phase 2a.3".
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
- Changed 2026-10-29 (phase 2a.3, second pass): the sheet's "Needed to submit" list now has a third row, "Every AI draft kept or discarded" (see "Submit is blocked by unchecked AI drafts"); its exit button reads "Back to report" (was "Keep editing"), and row actions all read "Show". Story 53 ("final Submit disabled until every Incident is confirmed") is now incomplete: it must also name AI drafts.
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

## Phase 2a.3

Built in prototype E (`/prototype/report-editor`) after the fold-back. Filip tested it on 2026-10-29 at 22:45 and made the calls marked "Changed 2026-10-29 (second pass)"; those are decided, no longer open. Entries still saying "open" have not been reviewed yet. Entries are grouped by area, in this order: Layout, Top bar, Onboarding (Captures inbox, Report editor, Section rail), Report editor (Enhance), Incidents, Submission, Mobile capture page, Live Inbox, Copy. `docs/design-system.md` lists `Btn size="lg"` (no fold-back needed). It no longer mentions `sheet-up-motion`, which is gone from the code too (second pass), so nothing to remove there.

### Layout: Demo pill with two scenes, Reset and theme toggle
- Type: Extends
- Decision: A floating "Demo" pill at the bottom of the Report screen (`demo-bar.tsx`): two scenes, "20:00 Start of shift" (empty report) and "02:15 End of Night" (the seed), a Reset for the current scene and a theme toggle. The scene lives in the URL (`?scene=start`; no parameter = 02:15). Switching always loads the scene fresh. It replaces the generic prototype switcher on E (which also linked to archived routes). It shows in production too, because the public demo needs it.
- Docs say: Story 60 (switch between "20:00, start of shift" and "02:15, end of Night", reset either) and Implementation Decisions, "Demo" ("Two seeded states behind a switch ... Reset restores the chosen state"): matches. Silent on the URL parameter, on "switching always loads fresh" and on a theme control. Implementation Decisions, "Platform" says dark is the primary theme and light is "polished last"; a theme toggle that reviewers can reach is not mentioned.
- Fold back: Story 60: add that the scene is addressable by URL and that a switch is a fresh load. Add the theme toggle to the Demo decision (or drop it from the pill if light is not ready to show). Knock-on (not noticed yet): the pill is a demo control, not product UI, so say that it lives outside the product screens. In the real build (Neon, one seeded venue, no auth) every reviewer on the public link shares one database state; Reset and scene switch would wipe or mix other reviewers' Captures. See "Live Inbox mock" below.
- Changed 2026-10-29 (second pass): the collision knock-on is answered by per-session demo state (see "Live Inbox: in-memory mock, scene-scoped, real QR"): one reviewer's Reset or scene switch no longer touches another reviewer's state.
- Date: 2026-10-29

### Layout: 02:15 seed has a rough manual Security block
- Type: Extends
- Decision: The 02:15 seed's manual Security block is now rough text ("2 security short till 22:00, kuba covered side door") so Enhance has something to show.
- Docs say: Implementation Decisions, "Demo" lists the seeded Captures only; `report-structure.md` section 1 shows the Security Section as clean prose ("Two security short until 22:00. Kuba covered the side door. ...").
- Fold back: Add the rough block to the 02:15 seed in the spec (story 62: "every mechanism visible in one run" now includes Enhance). The clean Security prose in the `report-structure.md` example becomes "the Enhance result, kept"; reword or leave as the example of a submitted report.
- Date: 2026-10-29

### Top bar: "Started 20:00" byline and "Open since 20:00" pill; Capture count wording
- Type: Extends
- Decision: The document byline says "Started 20:00"; the top bar pill says "Open since 20:00". Both scenes start at 20:00. The byline count reads "No Captures yet" or "N Captures from N people" (dismissed Captures not counted, people = distinct author names; the dismissed part is inferred from the code).
- Docs say: Story 2 (report says when it was started), ADR 0005 ("around 20:00"), `report-structure.md` section 1 ("Started 20:00"): matches. The `report-structure.md` header shows "5 Captures (3 from Alex, 1 from Marek, Door, ...) · 4 Incidents · 6 of 13 Sections covered", so the editor byline is shorter than the submitted header. Silent on the empty-state wording.
- Fold back: Spec story 2 can stay. Say in `report-structure.md` that the live byline in the editor shows only the Capture and people counts, or align the two. Knock-on (inferred, check): "people" counts distinct names, so the manager logging from the phone as "Alex" (Closing Manager) and from the desktop as "Alex Morgan" counts as two people. The phone identity needs to match the report's Closing Manager, or the count should key on something else.
- Date: 2026-10-29

### Onboarding: empty states split by column, no tour
- Type: Extends
- Decision: Onboarding is the empty report, split by column. Inbox: "Tonight's Captures land here" with three steps: Invite your staff ("Show QR", which opens the top-bar Invite staff popover, see "Onboarding: Show QR opens Invite staff in the top bar"), "Capture from your phone" (same link, pick Closing Manager) and "Or type it here" (paste the staff group chat; one send, one Capture). Document: a "How this report gets written" box (write into any Section yourself; the AI drafts only when asked, per Capture, per Section or all new; select your own text to Enhance) plus a live sample of the Draft wash saying "Keep or discard Section Drafts; confirm each Incident on its own". Outline: "Before you submit" says "Nothing to check yet. Incidents to confirm and their Gaps collect here. Submit locks the report; after that, only a dated Addendum."
- Docs say: Story 3 (empty states explain how the app works; together they say Captures come from me and my staff, the AI drafts only when I ask, I confirm Incidents and keep or discard Section Drafts, Submit locks the report; no separate tour): matches, split across three columns. The split by column and the live Draft sample are new. ADR 0005 ("A started report with nothing in it is the onboarding") and ADR 0007 hold.
- Fold back: Story 3: name the three surfaces (Inbox, document, outline) and the sample Draft. Copy check: "your staff" and "staff group chat" use "staff" for Staff Members as a group; the glossary _Avoid_ list for Closing Manager contains "staff", but "Invite staff" is already logged and accepted, so only add a glossary note that "staff" in UI copy means Staff Members. "Capture", "Draft", "Confirm", "Keep / Discard", "Gap" and "Addendum" are used as defined; "Submit locks" is fine (glossary _Avoid_ for Submission: send, publish, close).
- Date: 2026-10-29

### Onboarding: when each hint disappears
- Type: Extends
- Decision: The Invite step goes after the Invite popover has been opened and closed (flag `invited`; the top-bar Invite staff popover sets it too). The Inbox box goes with the first Capture; if Captures arrive before staff are invited, a one-line invite nudge ("Invite door, bar and security to add theirs.") stays above the list. The document box goes after the first Draft, from a draft or an Enhance (flag `drafted`). The outline box goes once the report has any block or Incident. The 02:15 seed has both flags set.
- Docs say: Story 4 (each hint goes away once its step has happened in this report: staff invited, first Capture in, first Draft made). Matches for the Inbox and document boxes. The outline trigger (any block or Incident, including one the manager typed) is not in story 4. The invite nudge is not in the docs.
- Fold back: Story 4: "staff invited" is approximated as "the Invite popover was opened and closed". Nobody has actually joined, so say that in the story or change the trigger to the first Staff Member Capture. Add the outline trigger and the nudge. Discarding the only Draft does not bring the hints back (flags are one-way); state it (inferred).
- Changed 2026-10-29 (second pass): the "invited" flag is still set when the top-bar Invite staff popover closes, now also when it was opened from "Show QR" (code: `top-bar.tsx`, on close). The onboarding step stays visible while the popover is open.
- Date: 2026-10-29

### Onboarding: Show QR opens Invite staff in the top bar, with a halo
- Type: Extends
- Decision: Filip: "Show QR" in the Inbox onboarding no longer opens its own popover. It opens the Invite staff popover in the top bar, and the top-bar button gets a halo (a steady ring plus three soft pulses; none under `prefers-reduced-motion`) to teach where Invite staff lives.
- Docs say: Story 3 (empty states explain how the app works, Invite staff named) and story 5 (QR and copyable link from "Invite staff"): silent on where the onboarding step opens it, and on any attention effect. `docs/design-system.md` motion rules: not checked for a halo pattern.
- Fold back: Story 3: the Invite step opens the real Invite staff popover and points at its button. Add the halo to `docs/design-system.md` (token, duration, reduced-motion rule). Knock-on: the earlier "Onboarding: empty states split by column" entry mentions a separate "Show QR" popover; amended. Single source for the QR, so story 5 has one surface only.
- Date: 2026-10-29

### Onboarding: empty and submitted Incidents copy
- Type: Contradicts
- Decision: With no Incidents, the Incidents Section says "No Incidents yet. Draft them from the Inbox or add one by hand; each one needs your Confirm." Once the report is submitted it says "No Incidents tonight." (open: not reviewed by Filip).
- Changed 2026-10-29 (second pass): Filip: a submitted report with no Incidents shows nothing under Incidents. "No Incidents tonight." is gone. Before submit the empty-state copy stays. Whether the Incidents Section heading itself still prints is not stated (inferred: it does not, in line with "only Sections with content are printed").
- Docs say: `report-structure.md` section 2: "Only Sections with content are printed", and "Not covered tonight" is a system-filled line naming every Section without content. Story 51: Incidents can be hidden when every Incident is confirmed or deleted. Glossary, Confirmation: _Avoid_ "approval, accept, validate": "Confirm" is fine.
- Fold back: "No Incidents tonight." is a positive statement in a legal record that the manager never wrote, where `report-structure.md` would list Incidents under "Not covered tonight". Decide which one the submitted report uses, and edit `report-structure.md` sections 1 and 2 to match. The editor copy before submit is only an empty state and needs no spec change. Second pass: the positive claim is gone, which fits `report-structure.md` section 2 ("Only Sections with content are printed"). Remaining gap: that table also says "Not covered tonight" names every Section without content; confirm it lists Incidents when there are none, otherwise a reader can't tell "no Incidents" from "forgot to write them" (inferred, to decide). Not a spec contradiction now, only a `report-structure.md` wording check.
- Date: 2026-10-29

### Report editor: Enhance bar, partial rewrite, Discard restores the text on screen
- Type: Extends
- Decision: Selecting text inside an eligible block shows a small floating bar with one AI button, "Enhance". A partial selection rewrites only that span; the whole block then becomes a Draft; Discard restores the exact text that was on screen (what the manager had typed, committed before the rewrite); Keep keeps the rewrite. While it runs: "Enhancing your text…" with a shimmer. If nothing would change: "Already reads clean. Nothing to change." Open: Enhance on an AI Incident's edited "What happened"; a keyboard shortcut.
- Docs say: Story 27 (select text I wrote, or a whole block, and have the AI enhance it; the result is a Draft I keep or discard; discarding restores my text; Captures can't be enhanced). ADR 0007 ("Enhance" on text the manager wrote). Spec, Implementation Decisions, "Enhance": returns a rewritten Draft that keeps the original for Discard; degraded behaviour as Extract. Matches in substance. New: the floating bar, "partial selection rewrites a span, the whole block becomes the Draft", the two status messages. "Nothing would change" is a no-op result with no Draft; the spec's Enhance contract does not define that case.
- Fold back: Story 27: add the selection bar, span rewrite and the no-change message. Add the no-change result to the Enhance contract in the spec (returns the same text, no Draft). Open for the grill: Enhance on an edited AI Incident description, and a keyboard shortcut.
- Date: 2026-10-29

### Report editor: Enhance only on text the manager typed
- Type: Resolves
- Decision: Filip (second pass): Enhance works only on text the manager typed: manual Section blocks, and "What happened" on manual Incidents. It does not work on kept AI text. This closes the first-pass build, which also allowed kept AI blocks.
- Changed 2026-10-29 (second pass): was "Contradicts, open" (eligible: manual or kept Section blocks). Now matches story 27, ADR 0007 and the Enhance contract ("given manager-written text"), so no reword of those is needed. The provenance chain for an enhanced kept AI block (see below) no longer arises. Open (inferred): an AI block the manager edited counts as kept by story 30; is it "typed by the manager" and so enhanceable? The code decides, ask Filip. Still unsaid: whether an AI Incident whose "What happened" the manager edited is enhanceable (the earlier open point), and the confirmed-Incident rule (inferred: not enhanceable).
- First-pass record (superseded): Eligible: Section blocks that are manual or kept (not unchecked Drafts), and "What happened" only on Incidents the manager added by hand (an AI Incident is a Draft already).
- Docs say: Story 27 ("text I wrote") and ADR 0007 (Enhance on "text they wrote themselves"); spec, Implementation Decisions, "Enhance" ("given manager-written text"). A kept block can still be AI-written (Keep is a decision on an AI Draft, story 30), so it is not manager-written text.
- Fold back: Either reword story 27, ADR 0007 and the Enhance contract to "text I wrote or kept", or limit eligibility to manual blocks and blocks the manager edited (editing keeps a Draft, story 30). Provenance (ADR 0003): a kept AI block that is enhanced goes ai-drafted, then kept, then a new Draft; Discard returns it to kept. State that chain in the evidence model. A confirmed Incident is not enhanceable; say so (inferred).
- Date: 2026-10-29

### Report editor: Enhance label "AI draft from your text"; Keep / Discard and Confirm on an Incident field
- Type: Contradicts
- Decision: The Enhance result is labelled "AI draft from your text" (`DraftLabel` got a `note` prop; the Draft has no source Captures). On an Incident, the Enhance Draft sits inside "What happened" with its own Discard / Keep, on the blue wash, in a card that is otherwise a neutral manager-added Incident. Confirming an Incident with a pending Enhance Draft keeps it.
- Changed 2026-10-29 (second pass): Filip: an Incident with a pending Enhance Draft can't be confirmed. The Confirm spot says "Keep or discard the AI draft to confirm" (same pattern as "Add location to confirm", story 45). Confirm no longer silently keeps it. This resolves the "decide whether Confirm should silently keep" point below: it must not. The Submission-readiness line "a pending Enhance Draft does not block, because Confirm keeps it" is void. Knock-on: Glossary, Keep / Discard covers "a Section Draft" only; extend it to an Enhance Draft inside an Incident. Glossary, Confirmation: "an Incident with a Gap can't be confirmed" gets a second condition, a pending Enhance Draft; add a story or extend story 45. Check the "Before you submit" row for such an Incident (inferred: its text should name the AI draft, not "Ready to confirm"; not stated). Submit's "Every AI draft kept or discarded" row (see "Submit is blocked by unchecked AI drafts") applies too.
- Docs say: Story 28 and spec, "Visual language": every AI-written item carries "AI draft from <author> <time>". Glossary, Keep / Discard: "The Closing Manager's decision on a Section Draft"; Confirmation: Incidents only. Glossary, Draft: Incident Drafts are confirmed, Section Drafts kept. Changelog, "No dashed outlines": a manager-added Incident has no wash.
- Fold back: Story 28: the label for an Enhance result is "AI draft from your text", with no author or time. Glossary, Keep / Discard: extend to "an Enhance Draft, including inside an Incident", or give Incident field Drafts their own rule. Decide whether Confirm should silently keep unchecked AI wording in a legal record; the alternative is Confirm disabled, or a "to keep" row, while an Enhance Draft is pending (inferred). Update the "wash" rule: a manual Incident can contain a Draft. Submission readiness (spec): a pending Enhance Draft in an Incident does not block, because Confirm keeps it; state it.
- Date: 2026-10-29

### Incidents: Delete and Confirm sit on a label line above the title
- Type: Extends
- Decision: Filip (second pass): Incident actions moved to the top. Delete and Confirm (or "Add location to confirm", or "Keep or discard the AI draft to confirm") sit right-aligned on a label line above the title, next to "AI draft from …" or "Added by …": the same place as Keep / Discard on a Section Draft. The line folds away on Confirm. The footer is gone.
- Docs say: Silent on where Incident actions sit. Story 30 puts Keep / Discard "on its label line" for Section Drafts; story 45 names the Confirm label only. Spec "Visual language": confirmed Incident is "flat in the document, no card, 'Confirmed HH:MM', Reopen on hover".
- Fold back: Story 45 and "Visual language": Incident and Section Draft share one label-line pattern. Amends three earlier entries that put Confirm and Delete in the footer: "Per-Incident Confirm in the block", "Manager can add an Incident by hand and delete an unconfirmed one" and "No dashed outlines" (fifth pass, "Added by" footer). Open (inferred): where "Confirmed HH:MM" and Reopen sit once the line folds away; whether Delete next to the primary Confirm needs a safeguard (a deleted Incident can't be restored, story 40 returns only its Capture).
- Date: 2026-10-29

### Incidents: a Capture with a part missing from the report is New again; "Draft into report" drafts only that part
- Type: Resolves
- Decision: Filip (second pass): a Capture that still has a part not in the report (for example its Incident was deleted while a Section Draft from it stays) is New again and sits in the New list with "Draft into report", which drafts only the missing part. The tile shows "Already in Maintenance". "Draft the rest" on processed tiles is removed. This makes story 40 literal and keeps Extract working only on New Captures (ADR 0007).
- Changed 2026-10-29 (second pass): replaces the first-pass rule below ("stays Processed and the tile offers Draft the rest"). Closes the open point "whether story 40 should force it back to New" and the knock-on that "Draft the rest" ran Extract on a non-New Capture (ADR 0007).
- Docs say: Story 40 ("its Capture goes back to New"): now matches. Glossary, Inbox: New is "not in the report yet". Spec, "Evidence model": Inbox state "derived from which Drafts cite it". ADR 0007: Extract "only ever adds Drafts from New Captures". Story 15 (New apart from processed).
- Fold back: Reword Glossary, Inbox: New = a Capture with at least one part not yet in the report, not "not in the report yet". Reword the derived-state rule in the Evidence model: New if any part is missing, whatever else cites it. Add to the Extract contract: it adds Drafts only for the missing parts of a New Capture and never duplicates a Draft that already cites it. Knock-on (not noticed yet): (1) "Draft all" and per-Section "Draft from inbox" take all New Captures, so they must also skip already-drafted parts (inferred); (2) the "n" count and the byline mix untouched and partly drafted Captures; (3) Dismiss applies to New Captures only, so a Capture with a kept Section Draft can now be dismissed; the earlier open point "can a Capture be dismissed after a kept Section cites it" becomes live; (4) "Already in Maintenance" is new tile copy, add it to the Inbox wording; (5) what shows when a missing part is a Section Draft the manager discarded (inferred: also New again, matching the earlier "discarded Draft returns the tile to New" inference).
- Date: 2026-10-29

### Incidents (first pass, superseded): Delete Incident returns its Capture to New only if nothing else of it is in the report
- Type: Contradicts
- Decision: Deleting an Incident removes its "Incidents" mark from the source Capture. If nothing else of the Capture is in the report, it is New again. If it also fed a Section (the 23:40 window photo also drafted Maintenance), it stays Processed and the tile offers "Draft the rest". Open: whether story 40 should force it fully back to New.
- Superseded 2026-10-29 (second pass) by the entry above: the Capture is New again either way and "Draft the rest" is removed.
- Docs say: Story 40 ("its Capture goes back to New"); the earlier fold-back outcome "Deleting an Incident returns its Capture to New". ADR 0003 and the Glossary (Inbox) say a Capture's state is derived from which Drafts cite it, New = "not in the report yet". Spec, Extract, and ADR 0007 say Extract "only reads New Captures".
- Fold back: Reword story 40 to the derived rule: "its Capture goes back to New unless it also feeds a Section". Or, if Filip wants it forced, the Section Drafts from that Capture must be discarded too, which story 40 does not say. Knock-on (not noticed yet): "Draft the rest" runs a draft on a Capture that is not New. That contradicts ADR 0007 ("only ever adds Drafts from New Captures"), the Extract contract and the Glossary (the Inbox states). "Draft the rest" is not in the docs or the changelog; it may predate 2a.3 (not checked in git). Either allow a scoped re-draft of a Processed Capture in the Extract contract, or remove the button and let a Capture be New again only when nothing cites it. A manual Incident has no source Capture, so deleting it changes no tile.
- Date: 2026-10-29

### Incidents: manual Incident with empty required fields counts as Gaps (fix)
- Type: Matches
- Decision: An Incident the manager added by hand with empty required fields now counts them as Gaps: the footer says "Add time to confirm" and "Before you submit" says "Add time, location, type". Before, it showed "Ready to confirm" and a Confirm that did nothing.
- Docs say: Story 41 ("its empty fields count as Gaps"); Story 45; Glossary, Gap. The "Manager can add an Incident by hand" entry above already says empty fields count as Gaps. This fixes a bug against the docs.
- Fold back: None. Logged because Filip asked. A hand-added Incident was already specified to behave this way.
- Date: 2026-10-29

### Submission: Submit is blocked by unchecked AI drafts
- Type: Contradicts
- Decision: Filip (second pass): unchecked AI drafts block Submit. The Submit sheet has a third "Needed to submit" row, "Every AI draft kept or discarded" (Section Drafts and Enhance results), with Show. The outline's "Before you submit" lists "N AI drafts · Keep or discard" (no longer "Optional"), counted in "left"; "Ready to submit" reads "Every Incident confirmed, every AI draft checked."
- Docs say: Story 30: "a Section Draft I never kept is submitted as it is". Story 48: "plus an optional row for Section Drafts not yet kept". Spec, Implementation Decisions, "Submission readiness": "unconfirmed Incidents … missing reviewer statement. Section Drafts not kept never block." Testing Decisions: "readiness lists the exact blockers and ignores Section Drafts". Glossary, Keep / Discard: "A Section Draft nobody kept is submitted as it is." Glossary, Confirmation: "Section Drafts are kept, not confirmed." Story 53: final Submit disabled until every Incident is confirmed. Story 54 (checklist shows exactly what's left).
- Fold back: Rewrite stories 30 (drop the second half; keep "editing keeps it") and 48 (the row is a required row, not optional; new "Ready to submit" wording), story 53 (also AI drafts), the readiness rule in Implementation Decisions (blockers: unconfirmed Incidents, unchecked Section and Enhance Drafts, missing statement) and the readiness test line (it must no longer "ignore Section Drafts"; add a test that a pending Draft blocks). Glossary, Keep / Discard: delete "A Section Draft nobody kept is submitted as it is"; say a Draft must be kept or discarded before Submission. No ADR superseded (0007 is silent on Submit). Knock-on (not noticed yet): (1) story 30's rationale ("low-risk content doesn't slow me down") no longer holds, since Section Drafts now gate Submit like Incidents; the difference from Confirmation is only that Keep has no Gap check, so reword the contrast in the Glossary. (2) "Draft all" can create many Section Drafts, each needing its own Keep or Discard, and there is no bulk Keep (the "no approve-all" rule, story 44, is about Incidents; whether bulk Keep is allowed is unsaid). A tired manager at 3am is the persona; decide. (3) Demo seed (story 62): the 02:15 state includes Section Drafts, so Submit is blocked on first load, which is fine for the demo; no change needed. (4) The captionless-photo Draft ("Photo from <name>, no caption.") now has to be actively kept or discarded; see the mobile capture entry. (5) A manager-edited Draft counts as kept (story 30), so it leaves the "N AI drafts" count; an Enhance Draft in an Incident counts (inferred, matches "Enhance results").
- Date: 2026-10-29

### Mobile capture page: identify once, roles, own Captures, bottom dock
- Type: Extends
- Decision: `/prototype/report-editor/capture`. Identify once with a name and a role chosen from Door, Bar, Security and Closing Manager, stored on the phone, with "Change" to edit it. Then "Your Captures" (own only, newest first, a "Received" tick and the server-set time) and a bottom dock Photo / Voice / Text. Bottom sheets use the new motion class `sheet-up-motion`; `Btn` has `size="lg"` (44px) for this page.
- Changed 2026-10-29 (second pass): Filip redesigned the page like a messaging app. Header: you (name · role, Change). Your Captures are sent messages (bubbles, newest at the bottom, time · Received). A composer sits on the keyboard: camera button (photo, then an optional line as caption), a growing text field, and a mic button that turns into Send once there is text. The bottom sheets and the 3-button dock are gone, and so is `sheet-up-motion`. "Newest first" above is now newest at the bottom. The rest of the entry (identify once, roles, own Captures) stands. Still to fold back: story 11 ("see my own Captures listed as received") still fits; story 9 can say the composer order (photo, text, voice). "Messaging app" is the pattern staff already use mid-shift (code comment); say that in the spec Visual language for the mobile surface (inferred).
- Docs say: Stories 7 to 12 and 61, ADR 0004: matches (no account, name and role once, own Captures only, Captured-at automatic, "received", staff don't see the report). The fixed role list is new: the glossary and ADR 0004 say "door, bar, security" and the spec says "name and role". "Change" and the dock layout are new.
- Fold back: Story 8: list the four roles. Check the list against the Sections (Kitchen, Artist & crew, Third-party vendors and so on have no role, so a kitchen Staff Member cannot identify; inferred, decide whether a free role is needed or the list stays a demo limit). "Own Captures" is scoped per device id, not per name (inferred from `capture.tsx`); ADR 0004 says "the person's own Captures", so state that a person on two phones sees two lists. `docs/design-system.md` already covers `sheet-up-motion` and `size="lg"`.
- Date: 2026-10-29

### Mobile capture page: photo with caption, text, simulated voice
- Type: Extends
- Changed 2026-10-29 (second pass): Filip: the bottom sheets are gone. The camera button picks a photo and then asks for an optional line as caption. A voice note shows a recording bar with a timer, Cancel and Send; the transcript is simulated and not editable ("Recording, demo only"). This closes the open point below: the transcript is not editable, so the Capture text stays the transcript of the audio and matches the spec ("the transcript becomes the Capture's text", Implementation Decisions, "Voice on mobile") and ADR 0003 (verbatim). The "Demo: the transcript is made up" note is now "Recording, demo only", still demo-only. The text composer is the growing text field, so the "Kept exactly as you write it. The time is added for you." note may be gone (inferred, not checked). Captionless photo: the line is optional (as before); the Draft "Photo from <name>, no caption." now also blocks Submit until kept or discarded (see "Submit is blocked by unchecked AI drafts"), which strengthens the earlier question whether a bare photo should draft a line at all.
- Decision (first pass, partly superseded): Photo opens the camera or file picker, then a bottom sheet with a preview and an optional caption. Text: a textarea with "Kept exactly as you write it. The time is added for you." Voice is simulated (a timer, then a canned, editable transcript with "Demo: the transcript is made up"), because plain-http LAN addresses have no microphone and the real transcript comes from Gemini. A captionless photo drafts as "Photo from <name>, no caption." The AI never reads the image.
- Docs say: Story 9, 10, ADR 0004. Implementation Decisions, "Voice on mobile": audio goes to Gemini, the transcript becomes the Capture's text, the audio is kept; "Files": upload is fake, the AI never inspects image contents. Glossary, Capture: "Kept verbatim, never edited by AI". Matches for photo, text and the demo voice. New: the transcript is editable before sending, the captionless-photo line, the demo note.
- Fold back: Voice: the spec says the transcript becomes the Capture's text. If the author can edit it before sending, the text no longer matches the audio that is kept; decide (the edit is the author's own, so it is probably allowed, but say it in the spec and the evidence model). The "Demo: the transcript is made up" note is demo-only. Captionless photo: the Draft "Photo from <name>, no caption." goes to General overview, so by story 30 and Glossary (Keep / Discard) it is submitted as it is if nobody keeps or discards it. Decide whether a bare photo should draft a Section line at all, or only attach as Evidence, which is the point of a photo.
- Date: 2026-10-29

### Live Inbox: in-memory mock, scene-scoped, real QR
- Type: Extends
- Changed 2026-10-29 (second pass): Filip scoped the live Inbox by demo session. Each desktop browser has its own demo id, carried in the QR link (`?d=…`). Phones that scan it write into that desktop's Inbox (any number of phones). One reviewer's Reset or scene switch does not touch another's. This answers the conflict logged below (the link carried no report or scene id; reviewers would collide), so it is Resolved for the prototype. "A phone writes into the scene a desktop last opened" and "each scene keeps its own phone Captures" are void; the key is the demo id. Fold back: Implementation Decisions, "Demo": "One seeded venue, one Closing Manager, no auth" gets "per-reviewer demo state keyed by a demo id in the link"; Reset and scene switch act on that state only. ADR 0004: the link identifies the report, now literally (a demo id stands in for the report id). Story 61 (reviewer scans with their own phone) holds. Real build: Neon store keyed by demo id (an in-memory store still won't hold on Vercel). New open points (inferred, not stated): where the desktop keeps the demo id (a second tab or a cleared browser gets a fresh one?), and how long idle demo sessions live (clean-up). Anyone with a link writes into that Inbox, which matches ADR 0004 (no login).
- Decision (first pass, partly superseded): Story 13 is mocked with an in-memory route handler (`captures/route.ts`). The desktop polls every 2 seconds. Each scene keeps its own phone Captures. A phone writes into the scene a desktop last opened. Reset or a scene switch empties that scene. Captured-at is set on the server on a demo clock (scene time plus one minute per Capture). Invite staff now shows a real, scannable QR (library `uqr`, drawn in E's style), the real URL, an "Open on this computer" link, and on localhost a note that a phone cannot reach it.
- Docs say: Story 13 and Implementation Decisions, "Live Inbox" (polls every few seconds, no websockets): matches. Story 5 (QR and copyable link) and story 61 (reviewer scans the QR with their own phone): matches. ADR 0004: access "through the report's link or QR"; the link is per report. ADR 0001: Neon via Drizzle (the mock is not that).
- Fold back: Conflict (not noticed yet): the QR link carries no report or scene id (`/prototype/report-editor/capture`), so a phone writes into whichever scene a desktop opened last. ADR 0004 and story 7 expect the link to identify the report. With a public demo and a shared database, two reviewers on different scenes would collide, and one reviewer's Reset would wipe the other's Captures. The real build needs a per-report (or per-session) token in the link, and the demo needs per-reviewer state or a stated limit; add this to the Demo decision. The mock is prototype-only and resets on a server restart; on Vercel serverless an in-memory store will not hold across instances, so the live demo needs the Neon store. Add `uqr` to the stack list (ADR 0001 or the spec's Platform decision) if it is kept. Demo clock: the real build uses the server's clock for Captured-at (story 10, Night assignment).
- Date: 2026-10-29

### Copy: one verb per action (second pass)
- Type: Extends
- Decision: Filip's consistency pass. (1) Submit sheet "Keep editing" is now "Back to report": Keep is reserved for Drafts. (2) Checklist actions in the sheet and the outline are all "Show" (were Review / Fill). (3) The type chip "Pick type" is now "Add type": every empty-field chip starts with "Add" ("Add time", "Add location", "Add type").
- Docs say: Silent on these labels. Glossary, Keep / Discard: _Avoid_ "confirm (for Sections)"; Confirmation _Avoid_: approval, accept, validate. Story 45 uses "Add location to confirm", which now matches the chip wording.
- Fold back: Add the rule to `docs/design-system.md` or the glossary note on Keep ("Keep means a Draft decision, nowhere else"). Spec story 45 can list "Add time / location / type to confirm". The "Pick type to confirm" label in the first-pass entries is now "Add type to confirm" (inferred). "Back to report" says "report": fine in the manager's UI (the staff-facing "report" issue is the next entry). "Show" for a row that also scrolls to the item: ok. No _Avoid_ words introduced.
- Date: 2026-10-29

### Copy: the capture page says "report" to Staff Members
- Type: Contradicts
- Decision: Capture page copy (as built): heading "Add to tonight's report", "Send to the report" on the sheet button, "Send this photo", and an intro that says Captures go "straight to the manager".
- Docs say: Story 12 (staff don't see the report or its Drafts). ADR 0007 and Glossary, Inbox: Captures land in the Inbox and nothing goes into the report until the manager asks the AI or writes it. The Inbox empty state (also 2a.3) says "Nothing goes into the report until you say so". Glossary, Capture _Avoid_: note, entry, upload, dump ("voice note" is accepted by the spec; no _Avoid_ word is used in the UI copy of 2a.3).
- Changed 2026-10-29 (second pass, from code): after the messaging-style redesign the heading still reads "Add to tonight's report" (`capture/page.tsx` title and `capture.tsx`), so the issue stands. The "Send to the report" sheet button and "Send this photo" are gone with the sheets; the composer says "Send voice note" and "Send".
- Fold back: Reword to "Add to tonight's Captures" or "Send to the manager" so the mobile copy does not promise a report entry. Check that "Send" is fine for a Capture (the glossary _Avoid_ "send" is for Submission only). Add the capture page wording to the spec only if Filip wants it fixed there; otherwise it stays a copy fix in the build.
- Date: 2026-10-29
