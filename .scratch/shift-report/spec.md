# Spec: Create Shift Report

Status: ready-for-agent

Revised 2026-10-29 after the Report screen design (prototype E, `/prototype/report-editor`, commit 00fd36f). Where this spec and prototype E disagree on look or interaction, E wins. The decisions behind the revision are in `design-changelog.md` and ADR 0005–0007. Stories are renumbered. Revised again after 2a.3 (commit 05811ec: demo switch, onboarding, Enhance, mobile capture page), per the "Phase 2a.3" section of `design-changelog.md`. Revised again 2026-10-31 (Phase 2b.1, Filip's answers in `open-questions.md`): a Reports list for the venue, many reports per demo session, a "Sent" state after Submit, the clean document as a Preview, dark only (ADR 0009). Stories 63–71 are new.

## Problem Statement

A Closing Manager at a bar or nightclub ends a ten-hour shift at 3am and still has to report the night: brief the next team and leave a record that protects the venue legally and with insurers. Today that record is scattered across a staff group chat, phone photos, memory and sometimes a spreadsheet. Writing it up feels like paperwork, so it's rushed or skipped, and the details that matter most for an Incident (when, where, what) are the first to be lost. The people who saw the Incident (door, bar, security) rarely write anything down at all. Nobody wants to start from a blank form at 3am.

## Solution

The Closing Manager starts tonight's Shift Report at the start of the shift and shows the staff a QR code. During the Night, anyone (the Closing Manager or a Staff Member) logs a photo, a voice note or a line of text from their phone in seconds. Every Capture lands in the report's Inbox verbatim, attributed and timed. Nothing runs in the background: at the end of the Night the material is all there, and the Closing Manager decides what goes into the report.

The Report screen is a document with the Inbox on its left and an outline on its right. The Closing Manager can write into any Section directly, or ask the AI to turn Captures into Drafts: one Capture, one Section, or everything new at once. The AI can also enhance text the manager typed. The visual rule: a soft blue wash with an "AI draft" label means Draft, written by the AI and not yet checked. Hovering a Draft highlights the Captures it came from.

When no Capture supports a required Incident field, the AI leaves it empty (a Gap, an amber chip) rather than guessing. The Closing Manager fills it from a picker in one tap or marks it Unknown. Each Incident is confirmed on its own, and every other Draft is kept or discarded. The outline shows what's left before Submit; nothing the AI wrote reaches the record unchecked. Submission takes a short statement and locks the report; the manager sees it as "Sent" and can go home. From the venue's Reports list a sent report opens as a Preview: a clean document marked "AI-assisted, reviewed and submitted by…". After that it can only change through an Addendum.

## User Stories

### Start of the shift — Closing Manager (desktop)

1. As a Closing Manager, I want to start tonight's Shift Report at the start of the shift ("New report" on Reports, story 65), so that my team has somewhere to send what they see.
2. As a Closing Manager, I want the report to say which Night it belongs to and when it was started, so that I never mix up two nights.
3. As a Closing Manager opening an empty report, I want its empty states to explain how the app works, so that I understand it without a tour. Together they say: Captures come from me and my staff (Invite staff, the composer, the phone page); the AI drafts only when I ask (per Capture, per Section, all at once, Enhance); I confirm Incidents one by one and keep or discard Section Drafts; Submit locks the report. The hints are split by column: the Inbox (invite staff, capture from your phone, or type it here), the document (how the report gets written, with a live sample of a Draft) and the outline (what will collect in "Before you submit"). The Invite step opens the real Invite staff popover in the top bar and marks its button with a halo, so I learn where it lives. The same empty states appear every Night; there is no separate first-time tour.
4. As a Closing Manager, I want each onboarding hint in the empty report to go away once its step has happened in this report, so that the screen gets out of my way. Staff invited = the Invite staff popover was opened and closed; the Inbox hint goes with the first Capture; the document hint with the first Draft (from drafting or Enhance); the outline hint once the report has any block or Incident. If Captures arrive before staff are invited, a one-line invite nudge stays above the Inbox list. Hints never come back in that report, even if the first Draft is discarded.
5. As a Closing Manager, I want to show my team a QR code and a copyable link from "Invite staff", so that they can add what they see from their phones. The link and QR belong to this report only (story 66).
6. As a Closing Manager, I want Captures made after midnight to count toward the Night that started the previous evening, so that one shift is one report.

### During the Night — anyone with the link (mobile capture page)

7. As a Staff Member or Closing Manager, I want to open the report's capture link without creating an account, so that contributing costs me nothing.
8. As a Staff Member, I want to enter my name and role (Door, Bar, Security, Closing Manager or Other; a short fixed list is enough for the demo) once, with a way to change them, so that my Captures are attributed without a login. The Closing Manager uses the same page and picks the Closing Manager role.
9. As anyone on the capture page, I want to add a photo (with an optional caption) or a short text from one composer, the way I'd send a message, so that what I saw is recorded while it's fresh. To speak instead of typing I use the phone keyboard's own dictation; the result is a text Capture. The page is laid out like a messaging app: my identity on top, my Captures as sent messages (newest at the bottom), and a composer on the keyboard with a camera button, a growing text field and a Send button.
10. As anyone on the capture page, I want each Capture's Captured-at set automatically, so that I never have to remember when I logged it.
11. As anyone on the capture page, I want to see my own Captures listed as received, so that I don't need to tell the manager separately.
12. As a Staff Member, I don't want to see the report or its Drafts, so that my part stays simple and the Closing Manager stays the author. The capture page never promises a report entry: its heading is "Send to the manager". (Prototype E still says "Add to tonight's report"; fix in the build.)
13. As a Closing Manager at my desk, I want a Capture sent from a phone to appear in my Inbox within seconds, without reloading, so that the report feels live.

### End of the Night — Inbox

14. As a Closing Manager, I want every Capture of the Night in the Inbox verbatim, with author, role, kind, Captured-at and a photo thumbnail, so that I start from what exists and know who to ask about each one.
15. As a Closing Manager, I want New Captures (something of them not in the report yet) apart from processed ones, so that I see at once what still needs my attention. A partly used Capture says where the rest already is ("Already in Maintenance").
16. As a Closing Manager, I want to draft a single Capture into the report, so that I can go one by one when I want control. On a partly used Capture, "Draft into report" drafts only the missing part.
17. As a Closing Manager, I want to draft a Section from the New Captures that concern it, so that I can fill one area at a time.
18. As a Closing Manager, I want to draft all New Captures at once, so that I can start reviewing straight away when I'm tired.
19. As a Closing Manager, I want to mark a Capture as written into the report by hand, so that the Inbox reflects what I already dealt with.
20. As a Closing Manager, I want to dismiss a New Capture that doesn't belong in the report and restore it from the archive, so that the Inbox stays clean and nothing is ever lost. On a partly used Capture, Dismiss covers only the missing part: the Capture goes to In report, the part already in the report stays cited, and the record does not list it as dismissed. (Prototype E still dismisses the whole Capture here; fix in the build.)
21. As a Closing Manager, I want a composer at the bottom of the Inbox where I can type, paste the staff group chat, or attach files, so that I can brain-dump the rest of the Night. One send is one Capture; sending never triggers the AI.
22. As a Closing Manager, I want the AI to use the timestamps in a pasted group chat, so that Incidents from the chat get the right times.
23. As a Closing Manager, I want Drafts to appear only when I ask for them, so that the report never shifts while I read it.
24. As a Closing Manager, I want a calm "AI is catching up, your Captures are safe" message when the AI is slow or down, so that I'm never stuck at 3am.

### Review — the document

25. As a Closing Manager, I want the report as one document, Sections as free text and Incidents as structured blocks, so that reviewing it feels like reading, not filling a form.
26. As a Closing Manager, I want to write directly into any Section, so that I can lean on structure when I prefer it, without ever choosing between a "guided" and a "freeform" mode.
27. As a Closing Manager, I want to select text I typed (or a whole block) and have the AI enhance it from a small bar that appears on the selection, so that a rough brain-dump becomes clean prose. Text I typed means manual Section blocks and "What happened" on an Incident I added by hand; kept AI text, Drafts, confirmed Incidents and Captures can't be enhanced. A partial selection rewrites only that span, and the whole block becomes a Draft I keep or discard; discarding restores exactly the text that was on screen. If nothing would change, I see "Already reads clean. Nothing to change." and no Draft is made.
28. As a Closing Manager, I want every AI-written item to carry a blue wash and an "AI draft from <author> <time>" label (for an Enhance result: "AI draft from your text"), so that I always know what I haven't checked yet, even without relying on colour.
29. As a Closing Manager, I want hovering a Draft to highlight its source Captures in the Inbox, and hovering a Capture to highlight the Drafts that use it, so that I can verify against the source at a glance.
30. As a Closing Manager, I want to keep or discard each Section Draft right on its label line, so that checking low-risk content takes one click, with no Gaps to fill first. Editing a Section Draft keeps it. Every Draft has to be kept or discarded before Submit (story 53). In the document I go one by one; the Submit sheet also offers "Keep all" for the remaining Section and Enhance Drafts (story 53). Incidents never have a bulk action (story 44).
31. As a Closing Manager, I want a Section to hold several blocks (one per drafted Capture, plus what I typed), each traceable to its source, so that I can keep one part and discard another.

### Review — Incidents

32. As a Closing Manager, I want the AI to leave a required Incident field empty when no Capture supports it, so that nothing in my report is made up. The AI reads a photo sent from the phone together with its caption (ADR 0008), so a captionless photo of a broken stool still drafts the right Incident or Section Draft; a location comes only from what someone wrote or said, never from the image.
33. As a Closing Manager, I want each Gap to show as an amber chip inside the Incident that opens a picker (time, location list, type list), so that I fix it in one tap right where it belongs.
34. As a Closing Manager, I want to mark Occurred-at or Location as Unknown, so that I can be honest that I don't know without being blocked.
35. As a Closing Manager, I want Occurred-at to be the time a Capture states, otherwise the Capture's Captured-at, with quick options for "earlier" around it, so that the common case costs nothing and the rare one costs one tap.
36. As a Closing Manager, I want the AI to propose an Incident type from a fixed list, to change it, and to pick "Other" with my own description, so that classification is consistent and the final call is mine.
37. As a Closing Manager, I want Captured-at visible on demand while reviewing (on the time chip and in the time picker) and always in the submitted report, so that the record shows when it happened and when it was written down.
38. As a Closing Manager, I want photos linked to an Incident as Evidence, shown as thumbnails I can enlarge, and to move or detach them, so that evidence sits with the Incident and a wrong link can be fixed.
39. As a Closing Manager, I want to edit an Incident's title and "What happened" without confirming it, so that fixing the wording and signing it off stay separate steps.
40. As a Closing Manager, I want to delete an Incident the AI got wrong (before confirming it); its Capture goes back to New even if another part of it stays in a Section, so that false Incidents never reach the record and nothing of the Capture is silently lost.
41. As a Closing Manager, I want to add an Incident by hand; its empty fields count as Gaps, so that I'm not dependent on the AI catching it.
42. As a Closing Manager, I want to see "by <Staff Member>" on Incidents that came from a Staff Member's Capture, so that I can ask a follow-up in person.
43. As a Closing Manager, I want Incidents numbered in the order they were captured, so that numbers stay stable while I review.

### Review — Confirmation

44. As a Closing Manager, I want to confirm each Incident on its own, with no "approve all", so that skimming can't sneak something unchecked into a legal record.
45. As a Closing Manager, I want an Incident that can't be confirmed yet to offer the next step instead of a disabled Confirm ("Add time / location / type to confirm" opens that picker; "Keep or discard the AI draft to confirm" when an Enhance Draft is pending in "What happened"), so that I always know what to do. Confirm and the next step sit right-aligned on the Incident's label line above its title, the same place as Keep / Discard on a Section Draft; the line folds away on Confirm. Delete does not sit next to Confirm: it is a quiet icon at the end of the Incident's title row, so a deleted Incident can't be a mis-click on Confirm.
46. As a Closing Manager, I want a confirmed Incident to settle into the document as plain content with "Confirmed HH:MM", so that I can see my progress.
47. As a Closing Manager, I want to reopen a confirmed Incident until I submit, so that a late correction is still possible.

### Outline (right column)

48. As a Closing Manager, I want a "Before you submit" list at the top of the outline: one row per unconfirmed Incident saying what's missing or "Ready to confirm", plus a required row "N AI drafts · Keep or discard" for Section and Enhance Drafts not yet checked, and "Ready to submit. Every Incident confirmed, every AI draft checked." when nothing blocks, so that I know how far I am from done. Each row jumps to its item.
49. As a Closing Manager, I want the outline to list the visible Sections with their status (Gap, to confirm, Draft, empty) and highlight where I am, so that I can move around a long report.
50. As a Closing Manager, I want General overview, Incidents, Security and Maintenance / equipment shown by default, and the other Sections under a collapsed "More sections" I can add from, so that the report starts short but reminds me of areas I may have forgotten.
51. As a Closing Manager, I want to hide a Section only when it's empty (Incidents only when every Incident is confirmed or deleted), so that hiding never loses content.
52. As a Closing Manager, I want all Sections to be optional, so that the report accepts whatever I have.

### Submission

53. As a Closing Manager, I want Submit to always open the Submit sheet, with a checklist of what's left and the final Submit disabled until every Incident is confirmed and every AI draft is kept or discarded, so that nothing unchecked reaches the record and I always know why. Each checklist row has "Show"; the AI drafts row also has "Keep all", which keeps every remaining Section and Enhance Draft in one step, as an explicit decision at Submission (a tired manager isn't forced through N clicks; Incidents still need their own Confirm). "Back to report" closes the sheet. (Prototype E has no "Keep all" yet; add in the build.)
54. As a Closing Manager, I want to tick a statement that I reviewed the report and it matches my recollection, so that authorship is explicit.
55. As a Closing Manager, I want the submitted report to say "AI-assisted, reviewed and submitted by [me] at [time]", so that the record is transparent about how it was made.
56. As a Closing Manager, I want the report locked after Submission, with only dated, attributed Addenda after that, so that it can't be quietly changed. After Submit I stay on the Report screen in a clear "Sent" state (story 67).
57. As a Closing Manager or the next team, I want the submitted report, opened as a Preview from Reports (story 68), to read like a clean document, not an app screen: header, the Sections with content, Incidents (with Logged time, "Reported by" and "Confirmed by"), a "Not covered tonight" line (naming Incidents too when there are none, never a "No Incidents" claim), attachments at the end as larger photos labelled by Incident, the Captures verbatim, then the statement and footer, so that it can be read, printed or forwarded as is.
58. As a Closing Manager, I want to share the submitted report with the next team, so that they're briefed (stubbed in the prototype).

### Demo / reviewer

59. As a reviewer, I want the public link to open the Reports list with the pre-seeded demo report pinned on top, so that I see the product's front door and can open the demo Night (or start a clean report) in one click.
60. As a reviewer, I want to switch between "20:00, start of shift" (an empty report) and "02:15, end of Night" (Captures in, some drafted, one Incident confirmed), and reset either, so that I can see both onboarding and review. The switch is a floating "Demo" pill outside the product UI, with the two scenes and Reset, shown on the demo report only (story 70). The scene is in the URL and switching always loads it fresh. My Reset or scene switch never touches another reviewer's demo, nor my own clean reports.
61. As a reviewer, I want to scan the Invite staff QR with my own phone, add a Capture as a Staff Member, and see it arrive on the desktop, so that I experience the staff side for real. The QR carries the report, so any number of phones write into that report's Inbox and nobody else's.
62. As a reviewer, I want the 02:15 state to include a Gap, a Staff Member Capture, a photo, a voice note, a pasted group chat, Section Drafts and a rough block I typed myself (for Enhance), so that every mechanism is visible in one run.

### Reports — Closing Manager (desktop)

63. As a Closing Manager, I want a Reports screen for my venue (Halo Club in the demo) listing its Shift Reports, so that I can find any Night's report, start a new one or look back at a sent one. A simple list, styled like the rest of prototype E.
64. As a Closing Manager, I want each row to show the Night, its status (Open or Sent), the number of Incidents, and for a sent report when and by whom it was sent, so that I see at a glance what's done.
65. As a Closing Manager, I want "New report" to start a clean, empty Shift Report and open it, so that I can begin any Night from scratch. There is no limit: any number of reports, open or sent, started by anyone on any device. A clean report runs on the real clock: Captured-at is the server time and the Night comes from Night assignment, so after midnight it still belongs to the previous date (story 6). Its empty states are the onboarding (stories 3–4).
66. As a Closing Manager, I want each report to have its own capture link and QR, so that a Capture always lands in the report it was meant for.
67. As a Closing Manager who just submitted, I want to stay on the Report screen with a clear "Sent" state and a way back to Reports, so that I know it's done and can go home. The report is locked and the Inbox stays visible but read-only, with a quiet locked note.
68. As a Closing Manager, I want to open a sent report from Reports as a Preview, the clean document of stories 57–58, so that I can read, print or forward the final record. The Preview is the Report screen's route in a document mode, not a separate page.
69. As a Closing Manager, I want to open an open report from Reports and carry on where I left off, so that a report started at 20:00 is finished at close.

### Reports — demo / reviewer

70. As a reviewer, I want the first row of Reports to be the demo report, the only one with the Demo controller (scenes 20:00 / 02:15, Reset) and the demo clock, so that the seeded walkthrough stays stable (the Loom is recorded on it) while I try clean reports beside it.
71. As a reviewer, I want my Reports list to be mine alone, kept per browser like the rest of my demo session, so that reports I create never show up for another reviewer.

## Implementation Decisions

- **Platform (ADR 0001, 0006).** One Next.js app on Vercel, Neon Postgres via Drizzle, Gemini Flash on a paid key with a spend cap. The front end is prototype E: its tokens move into the shared theme and its primitives into `components/`, on Base UI (behaviour, accessibility). shadcn stays available as primitives, never as the look. All styling goes through theme tokens. Dark only: light mode is cut (2026-10-31), which overrides ADR 0006's light-theme line. Agents read `docs/design-system.md` before building UI.
- **Two surfaces.** Desktop: Reports (the venue's list), the Report screen (top bar; Inbox | document | outline) with its "Sent" state, the Submit sheet, and the Preview of a sent report (the Report screen's route in a document mode). All under `app/prototype/report-editor/`. The look of Reports, the "Sent" state and the Preview is Filip's to design in prototype E before they are built. Mobile: only the capture page, laid out like a messaging app because that's what staff already use mid-shift (identify once, my Captures as sent messages, one composer for photo / text / voice). No Report screen on mobile.
- **Report lifecycle (ADR 0005, 0009).** The Closing Manager starts the report with "New report". In the demo there is no one-per-Night rule: any number of reports, even on the same Night. The Night is the date the shift started; Captures before 08:00 belong to the previous date. States: open → submitted, shown as Open / Sent. Submission blocks edits to Captures, Drafts and Incidents; only Addenda can be appended.
- **Evidence model (ADR 0003).** No step ever modifies a Capture. A Capture has a visibility flag (dismissed) and a "written by hand" flag; its Inbox state (New, Drafted, In report, Dismissed) is derived from which Drafts cite it: New whenever any part of it is not in the report yet, whatever else cites it. Every Incident field and Section block stores a value, a provenance (ai-drafted / confirmed / kept / manager-entered) and its source Captures. Every Incident stores Occurred-at (may be Unknown), Captured-at (system-set, from its earliest source Capture, or the moment a manager added it by hand) and confirmed-at.
- **Staff Members (ADR 0004).** Access through the report's link or QR without login; the link is scoped to that one report. The client stores name and role, and every Capture carries them. The capture page shows only the person's own Captures, scoped per device (one person on two phones sees two lists).
- **Live Inbox.** The desktop polls for new Captures every few seconds. No websockets. Captured-at is set by the server.
- **Report domain module: the single deep module and the only test seam.** Pure, with no UI, DB or network; the LLM client is injected. Interface:
  - **Extract (scoped, ADR 0007):** given the report state, a scope (one Capture, one Section, or all New Captures) and the model, it returns new Drafts and leaves everything else untouched. It only reads New Captures and only adds Drafts, so confirmed, kept or manager-written content is never changed. For a partly used Capture it drafts only the missing parts and never duplicates a Draft that already cites it (this holds for every scope, including "Draft all"). Rules enforced whatever the model returns: a required Incident field with no supporting Capture reference becomes a Gap; references to missing Captures are dropped; Location comes only from Capture text; Occurred-at is the time a Capture states, else its Captured-at (for a pasted chat, the line's timestamp); type must come from the fixed list, otherwise "Other" with the model's text; a Section is matched by the model, falling back to General overview; Incident-looking content becomes an Incident, not Section text. Drafting into a hidden Section shows it. Invalid or unavailable model output returns the previous state, flagged degraded.
  - **Enhance:** given manager-typed text (a manual Section block, or "What happened" on a manual Incident) and an optional span, it returns a rewritten Draft that keeps the original for Discard. If the rewrite would change nothing, it returns the text unchanged and no Draft. Same degraded behaviour.
  - **Submission readiness:** given a report, it returns ready or the blockers: unconfirmed Incidents (which already include any with a Gap or a pending Enhance Draft), unchecked AI Drafts (Section Drafts and Enhance results), missing reviewer statement.
  - **Night assignment:** given a timestamp, it returns the Night it belongs to.
- **AI routes.** One route per action (Extract with its scope, Enhance). Each loads the report, runs the module with the real Gemini client and persists the result. A per-IP rate limit protects the paid key. On failure: previous state plus the degraded flag, shown as a calm message on the button that triggered it.
- **Voice.** No audio is recorded or stored. On the phone, people dictate with the keyboard's own mic; on desktop, the Inbox composer has no mic button. The result is ordinary text the author can check before sending, so the Capture is a text Capture. The seeded 01:15 voice note stays as demo data. (Changed 2026-10-29, Phase 2b: replaces Gemini transcription of recorded audio.) Desktop dictation hidden 2026-10-30: the browser's speech recognition didn't work reliably on production.
- **Incident types (fixed list).** Fight/assault, Injury/medical, Ejection/refused entry, Theft, Property damage, Drugs, Intoxication, Harassment, Police called, Other (Other requires a description).
- **Sections.** Order: General overview, Incidents, Audience, Security, Artist & crew, Door staff, Production / run of show, Bar staff, Kitchen, Third-party vendors, Private events, Maintenance / equipment, Inventory. Visible by default: General overview, Incidents, Security, Maintenance / equipment. Only Incidents get structured fields; other Sections hold free-text blocks. Incidents are ordered by Captured-at.
- **Visual language.** As in prototype E and `docs/design-system.md`: Draft = soft blue wash plus an "AI draft from <author> <time>" label, no outline. Gap = amber chip with a dot that opens a picker with "Mark as Unknown". Confirmed Incident = flat in the document, no card, "Confirmed HH:MM", Reopen on hover. Section Drafts and unconfirmed Incidents share one label-line pattern: the label on the left, the actions (Keep / Discard, or Delete and Confirm) on the right. A manual Incident has no wash, but an Enhance Draft inside its "What happened" does. "Keep" means a Draft decision and nothing else; empty-field chips all start with "Add". Amber is used only for Gaps and blue only for AI. The "Before you submit" list is neutral; the amber signal lives on the chip.
- **Files.** Photos sent from the phone are real since ticket 18: downsized on the phone and stored with their Capture in Neon. Files attached in the desktop composer are still fake (chips, a short fake progress state, stock thumbnails), and seeded photos keep stock thumbnails. Extract sends a stored photo's image to the AI with its Capture (ADR 0008). Photos become Evidence of the Incident drafted from their Capture.
- **Demo (ADR 0009).** One seeded venue (Halo Club), one Closing Manager, no auth. State is per reviewer: a demo id, kept by the desktop browser, keys that reviewer's Reports list, so a public link never mixes reviewers. The public link lands on the Reports list (Filip, 2026-10-31). Each report has its own id, and the capture link carries the report, not the demo id. The first report is the demo report, pinned to the top: the only one with the Demo controller and the demo clock (its Captures land on the seeded Night). Two seeded states behind the controller: 20:00 (report started, empty) and 02:15 (the Night below, partly reviewed). The scene is in the URL; switching loads it fresh, Reset restores it, both only for the demo report of that demo id. Clean reports from "New report" start empty and use the real clock and Night assignment. No theme toggle. Invite staff shows a real, scannable QR of the report's capture link. In the real build the store is Neon (an in-memory store doesn't hold across Vercel instances). The 02:15 seed:
  - a 23:40 photo of a broken window (location not stated, so a Gap),
  - a 00:52 door Staff Member Capture about a guest refused re-entry,
  - a 01:05 bar Staff Member Capture about stock,
  - a 01:15 voice note about a fight at the bar, already drafted and confirmed,
  - a 02:10 pasted group chat covering several Sections and one Incident,
  - a rough Security block the manager typed ("2 security short till 22:00, kuba covered side door"), to show Enhance.
  Demo Capture texts avoid explicit times unless the time is the point.

## Testing Decisions

- A good test drives the report domain module through its public interface (Extract, Enhance, Submission readiness, Night assignment) and asserts on the resulting report state. It never asserts on internal functions or prompt wording.
- The model is a fake with recorded responses: realistic structured outputs, including deliberately bad ones (a field with no source, an unknown Incident type, a reference to a missing Capture, a location with no text support, malformed JSON, a timeout). Tests never call real Gemini. They must be deterministic and free.
- Covered behaviours:
  - unsupported fields become Gaps,
  - Occurred-at falls back to Captured-at,
  - invalid references are dropped,
  - an off-list type becomes Other,
  - Extract only adds Drafts from the Captures in scope and never changes existing content,
  - Extract on a partly used Capture drafts only the missing part,
  - a model failure leaves the state unchanged and flagged degraded,
  - readiness lists the exact blockers, and a pending Section or Enhance Draft blocks,
  - a Capture at 02:00 belongs to the previous Night.
- Not tested: UI, the DB layer, the real model's quality, styling and animation. This is the MVP choice from PROCESS.md: only the AI rules are protected.
- Prior art: none (greenfield). Pocock's `/tdd` drives this module test-first.

## Out of Scope

- Flows outside the Shift Report: venue setup, user management, Owner dashboards, analytics. Reports is a plain list: no search, filters or deleting reports.
- The Report screen, Reports and the Preview on mobile; mobile is the capture page only.
- Light mode.
- Real authentication, and file storage or upload beyond phone photos (stored in Neon since ticket 18).
- Witness fields. Dorota (2026-10-29): the minimum is time, date, place, type and description.
- Push notifications of any kind.
- Offline mode.
- A dedicated structured form for any Section other than Incidents.
- Editing a submitted report beyond the Addendum entry point.

## Further Notes

- **Assumptions standing in for answers.** Dorota answered on 2026-10-29 (minimum Incident criteria: time, date, place, type, description). No closing manager was available, so these stay as assumptions:
  - managers and staff do use their phones mid-shift,
  - the group chat is today's de facto log,
  - the Night ends at 08:00,
  - staff carry phones.

  Full list: `.scratch/shift-report/open-questions.md`.
- **Nice-to-have, in priority order:**
  1. a Gap routed back to the Staff Member who authored the Capture, as a one-tap question on their capture page,
  2. a department check-out ("Anything from the bar tonight?") that becomes that Section's Draft,
  3. the report starting by itself on the Night's first Capture (the story to tell instead of ADR 0005),
  4. a read-only Owner view,
  5. a full Addendum flow.
- **Polish priority:** first the Report screen at the moment of confirming an Incident that has a Gap, then the empty report (onboarding), then everything else.
- **Vocabulary:** see `GLOSSARY.md`. Use Capture, Inbox, Draft, Gap, Unknown, Confirmation, Keep / Discard, Dismiss, Submission and Addendum exactly as defined there.
