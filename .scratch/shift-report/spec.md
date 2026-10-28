# Spec: Create Shift Report

Status: ready-for-agent

## Problem Statement

A Closing Manager at a bar or nightclub ends a ten-hour shift at 3am and still has to report the night: brief the next team and leave a record that protects the venue legally and with insurers. Today that record is scattered across a staff group chat, phone photos, memory and sometimes a spreadsheet. Writing it up feels like paperwork, so it's rushed or skipped, and the details that matter most for an Incident — when, where, what, who saw it, proof — are the first to be lost. The people who saw the Incident (door, bar, security) rarely write anything down at all. Nobody wants to start from a blank form at 3am.

## Solution

The Shift Report builds itself during the Night and the Closing Manager finishes it. The first Capture of the Night — a photo, a voice note, a line of text from the Closing Manager or a Staff Member's phone — opens tonight's Shift Report. At the end of the Night the Closing Manager opens a report that is already partly done: every Capture is there verbatim, and the AI has turned them into Drafts of Sections and Incidents.

There is one capture surface for everything: type, dictate, paste the group chat, attach photos. No choice between "form" and "chat" upfront. Next to it, a rail shows the report's Sections and Incidents filling in. Anyone who wants structure clicks a Section and writes into it directly.

There's one visual rule: anything with a dashed outline is a Draft — the AI wrote it and nobody has checked it yet. Clicking a Draft highlights the Capture it came from. When the AI can't find a required Incident field in the Captures, it leaves an empty slot in the Draft (a Gap) rather than guessing. The Closing Manager fills the Gap in one tap or marks it Unknown. Each Incident is confirmed on its own. Once every Incident is confirmed and no Gaps are left, the Closing Manager submits with a short statement. The report then locks and carries an "AI-assisted, reviewed and submitted by…" footer. After that it can only be changed through an Addendum.

## User Stories

### During the Night — Closing Manager (mobile)

1. As a Closing Manager, I want a single big "Log incident" action on my phone, so that I can capture something within seconds while it's still happening.
2. As a Closing Manager, I want to take a photo as a Capture, so that evidence exists before it's cleaned up or forgotten.
3. As a Closing Manager, I want to record a short voice note as a Capture, so that I don't have to type in a loud, dark venue.
4. As a Closing Manager, I want to type a quick text Capture, so that I can log something when speaking isn't possible.
5. As a Closing Manager, I want each Capture's Captured-at time set automatically, so that I never have to remember when I logged it.
6. As a Closing Manager, I want my first Capture of the Night to open tonight's Shift Report automatically, so that I never have to "create a report".
7. As a Closing Manager, I want to see the list of tonight's Captures on my phone, so that I know what's already recorded.
8. As a Closing Manager, I want to see clearly which Night the open Shift Report belongs to and when it was opened, so that an auto-created report never feels like it came from nowhere.
9. As a Closing Manager, I want a Capture made after midnight to land in the Night that started the previous evening, so that one shift is one report.
10. As a Closing Manager, I want to show my team a QR code or link for tonight's Shift Report, so that they can add what they see.

### During the Night — Staff Member (mobile)

11. As a Staff Member, I want to open tonight's capture link without creating an account, so that contributing costs me nothing.
12. As a Staff Member, I want to enter my name and role once, so that my Captures are attributed without a login.
13. As a Staff Member, I want to add a photo, voice note or text Capture, so that what I witnessed reaches the report.
14. As a Staff Member, I want to see that my Capture was received, so that I know I don't need to tell the manager separately.
15. As a Staff Member, I don't want to see or edit the report's Drafts, so that my part stays simple and the Closing Manager stays the author.

### End of Night — opening the report

16. As a Closing Manager, I want to open tonight's Shift Report and find every Capture from the Night already in it, so that I start from what exists, not a blank page.
17. As a Closing Manager, I want to see which Captures came from which Staff Member, so that I know who to ask about each one.
18. As a Closing Manager, I want the AI to have already produced Drafts from tonight's Captures, so that my job is reviewing, not writing.
19. As a Closing Manager, I want to see at a glance how many Incidents need Confirmation and how many Gaps remain, so that I know how far I am from done.

### End of Night — capturing more

20. As a Closing Manager, I want one capture surface where I can type freely, so that I can brain-dump the rest of the Night in my own words.
21. As a Closing Manager, I want to paste our staff group chat into the capture surface, so that what we already wrote tonight becomes part of the report.
22. As a Closing Manager, I want the AI to use the timestamps in a pasted group chat, so that Incidents get realistic Occurred-at times.
23. As a Closing Manager, I want to attach photos, videos and documents to the report, so that evidence sits with the record (stubbed upload in the prototype).
24. As a Closing Manager, I want to dictate using my device's built-in dictation on desktop, so that I can talk instead of type.
25. As a Closing Manager, I want the Drafts to update when I paste, attach or pause, not on every keystroke, so that the screen doesn't keep shifting while I think.
26. As a Closing Manager, I want to click a Section on the rail and write directly into it, so that I can lean on structure when I prefer it.
27. As a Closing Manager, I want to never have to pick between a "guided" and "freeform" mode, so that I can switch between them as the Night demands.

### Review — Drafts, Gaps, evidence

28. As a Closing Manager, I want every AI-written item to look visibly different (dashed outline), so that I always know what I haven't checked yet.
29. As a Closing Manager, I want clicking a Draft to highlight the Capture it came from, so that I can verify it against the source in one click.
30. As a Closing Manager, I want the AI to leave a required Incident field empty when no Capture supports it, so that nothing in my report is made up.
31. As a Closing Manager, I want each Gap to appear as an empty slot inside the Draft, so that I can fill it right where it belongs.
32. As a Closing Manager, I want to fill a Gap with one tap (e.g. a location picker, a time picker), so that fixing it costs seconds.
33. As a Closing Manager, I want to mark a Gap as Unknown, so that I can be honest that I don't know without being blocked.
34. As a Closing Manager, I want the AI to propose an Incident type from a fixed list, so that classification is consistent and quick.
35. As a Closing Manager, I want to change the proposed Incident type, so that the final call is mine.
36. As a Closing Manager, I want to pick "Other" and describe the type myself, so that unusual Incidents still fit.
37. As a Closing Manager, I want every Incident to show both Occurred-at and Captured-at, so that the record shows when it happened and when it was written down.
38. As a Closing Manager, I want photos linked to an Incident as Evidence based on when they were taken and what was written around them, so that I don't have to sort them by hand.
39. As a Closing Manager, I want to move or detach Evidence from an Incident, so that a wrong link can be fixed.
40. As a Closing Manager, I want to edit any Draft's text, so that it says what actually happened.
41. As a Closing Manager, I want an edited Draft to count as confirmed, so that I don't have to confirm my own words separately.
42. As a Closing Manager, I want to delete an Incident Draft the AI got wrong, so that false Incidents never reach the record.
43. As a Closing Manager, I want to add an Incident manually, so that I'm not dependent on the AI catching it.

### Review — Confirmation

44. As a Closing Manager, I want to confirm each Incident individually, so that I genuinely look at every one.
45. As a Closing Manager, I don't want an "approve all" button for Incidents, so that skimming can't sneak something unchecked into a legal record.
46. As a Closing Manager, I want non-Incident Sections (bar, inventory, maintenance…) to accept Drafts directly while staying editable and clearable, so that low-risk content doesn't slow me down.
47. As a Closing Manager, I want a Confirmation to visibly turn the Draft into plain, settled content, so that I can see my progress.
48. As a Closing Manager, I want to see which Incidents came from a Staff Member's Capture, so that I can weigh them or ask a follow-up in person.

### Sections

49. As a Closing Manager, I want to see every Section of the report on the rail, so that I'm reminded of areas I may have forgotten.
50. As a Closing Manager, I want empty Sections collapsed to a single line, so that an incomplete report doesn't look like failure.
51. As a Closing Manager, I want all Sections to be optional, so that the report accepts whatever I have.
52. As a Closing Manager, I want Sections with content expanded, so that I can review what the AI put there.

### Submission

53. As a Closing Manager, I want Submit disabled until every Incident is confirmed and no Gaps remain, so that I can't accidentally file an incomplete Incident.
54. As a Closing Manager, I want a short checklist on the Submit step showing exactly what's left, so that I know what blocks me.
55. As a Closing Manager, I want to tick a statement that I reviewed the report and it matches my recollection, so that authorship is explicit.
56. As a Closing Manager, I want the submitted report to say "AI-assisted, reviewed and submitted by [me] at [time]", so that the record is transparent about how it was made.
57. As a Closing Manager, I want the report locked after Submission, so that it can't be quietly changed later.
58. As a Closing Manager, I want to add an Addendum to a submitted report, so that new information can still be recorded with its own date and author.
59. As a Closing Manager, I want to share the submitted report with the next team, so that they're briefed (stubbed in the prototype).
60. As a Closing Manager, I want my next Capture after Submission to open a new Night, so that a new shift starts clean.

### Resilience

61. As a Closing Manager, I want my Captures saved even if the AI fails, so that nothing I entered is ever lost.
62. As a Closing Manager, I want the report to still work if the AI is slow or unavailable, so that I'm never stuck at 3am because of a service outage.
63. As a Closing Manager, I want to switch from phone to laptop mid-report and see the same Shift Report, so that I can finish on whichever device is at hand.

### Demo / reviewer

64. As a reviewer, I want to open a public link with a pre-seeded Night, so that I can experience the end-of-night flow immediately.
65. As a reviewer, I want a "Reset demo" control, so that I can run the flow again from the start.
66. As a reviewer, I want to switch between Closing Manager and Staff Member on the mobile screen, so that I can see both sides without two devices.
67. As a reviewer, I want the seeded Night to include a Gap, an unclear time, a Staff Member Capture, a photo and a pasted group chat, so that every mechanism is visible in one run.

## Implementation Decisions

- **Platform.** One responsive Next.js app on Vercel, Neon Postgres via Drizzle, Gemini Flash on a paid key with a spend cap (ADR 0001). The visual layer uses shadcn/Tailwind defaults, plus one typeface and one accent colour.
- **One Shift Report, two entry points.** Mobile opens on the "Tonight" screen: log a Capture plus the list of tonight's Captures, with a Closing Manager / Staff Member demo switch. The Report screen is the main surface on every device: Captures and the capture surface on one side, the rail with Sections and Incidents on the other (stacked or tabbed on mobile). Two more screens: Submit (a sheet) and Submitted (locked view). Incident Confirmation happens inline on the rail, never on its own screen.
- **Report lifecycle (ADR 0002).** A Shift Report is keyed by venue and Night. The Night is the date the shift started: Captures before 08:00 belong to the previous date. Each report has a state: open → submitted. Submission blocks edits to Captures, Drafts and Incidents; only Addenda can be appended.
- **Evidence model (ADR 0003).** No step ever modifies a Capture. Every Incident field and Section Draft stores a value, a provenance (ai-drafted / confirmed / manager-entered), and references to the source Captures. Every Incident stores Occurred-at (may be Unknown) and Captured-at (system-set, taken from its earliest source Capture).
- **Staff Members (ADR 0004).** Access goes through a per-Night link or QR without login. The client stores the name and role, and every Capture carries them. Staff Members can only create Captures and see their own.
- **Report domain module — the single deep module and the only test seam.** It's pure, with no UI, DB or network access, and it receives the LLM client as an injected dependency. Its interface:
  - **Extract:** given the Night's Captures and the current report state, it calls the injected model with a strict structured-output schema and returns updated Drafts for Sections and Incidents. It enforces product rules no matter what the model returns. A required Incident field with no supporting Capture reference becomes a Gap, never a value. Any source reference pointing to a Capture that doesn't exist is dropped and, if needed, the field becomes a Gap. Incident type must come from the fixed list, otherwise it becomes "Other" with the model's text as the description. Content the Closing Manager has already confirmed or edited is never overwritten by a new extraction. When the model output is invalid or unavailable, extraction returns the previous state unchanged, flagged as degraded.
  - **Submission readiness:** given a report, it returns either ready or the list of blockers (unconfirmed Incidents, remaining Gaps, missing reviewer statement).
  - **Night assignment:** given a timestamp, it returns the Night it belongs to.
- **Extraction contract.** A single server route takes a report id, loads the Captures, runs Extract with the real Gemini client and persists the result. A per-IP rate limit protects the paid key. When Gemini fails, the route returns the previous state plus a degraded flag. The UI shows a calm "AI is catching up — your Captures are safe" message, never an error wall.
- **Extraction triggers.** Extraction runs on paste, on attach, on a new mobile Capture arriving, and after a typing pause. It never runs per keystroke. When Drafts update on the rail, they animate gently in one batch.
- **Voice on mobile.** The audio from the "Log incident" voice note goes to Gemini, which returns a transcript. The transcript becomes the Capture's text and the audio is kept as the Capture. On desktop we rely on the operating system's built-in dictation.
- **Incident types (fixed list).** Fight/assault, Injury/medical, Ejection/refused entry, Theft, Property damage, Drugs, Intoxication, Harassment, Police called, Other (Other requires a description).
- **Sections.** General overview; Incidents; Audience; Security; Artist & crew; Door staff; Production / run of show; Bar staff; Kitchen; Third-party vendors; Private events; Maintenance / equipment; Inventory. Only Incidents get structured fields. All other Sections hold a single text Draft.
- **Visual language.** A dashed outline with a light accent tint means Draft. A Gap is an inline empty slot inside a Draft, and it opens a one-tap picker or an "Unknown" option. Confirmed or edited content renders as plain content. Selecting a Draft highlights its source Captures.
- **Files.** Upload is fake: chips, a short fake progress state, stock thumbnails. The AI never inspects image contents. Photos are linked as Evidence based on Captured-at and the surrounding text.
- **Demo.** One seeded venue and one Closing Manager, no auth. "Reset demo" restores the seeded Night. The seed contains:
  - a 23:40 photo of a broken window,
  - a 01:15 voice note about a fight at the bar,
  - a Staff Member (door) Capture about an aggressive guest being ejected,
  - a pasted group-chat thread,
  - one Incident without a location and one with an unclear time.

## Testing Decisions

- A good test drives the report domain module through its public interface (Extract, Submission readiness, Night assignment) and asserts on the resulting report state. It never asserts on internal functions or prompt wording.
- The model is a fake with recorded responses: realistic structured outputs, including deliberately bad ones (a field with no source, an unknown Incident type, a reference to a missing Capture, malformed JSON, a timeout). Tests never call real Gemini. They must be deterministic and free.
- Covered behaviours:
  - unsupported fields become Gaps,
  - invalid references are dropped,
  - an off-list type becomes Other,
  - confirmed or edited content survives re-extraction,
  - a model failure leaves the state unchanged and flagged degraded,
  - readiness lists the exact blockers,
  - a Capture at 02:00 belongs to the previous Night.
- Not tested: UI, the DB layer, the real model's quality, styling and animation. This is the MVP choice from PROCESS.md: only the AI-extraction rules are protected.
- Prior art: none (greenfield). Pocock's `/tdd` drives this module test-first.

## Out of Scope

- Flows outside the Shift Report: venue setup, user management, Owner dashboards, analytics.
- Real authentication and real file storage or upload.
- AI analysis of image contents (nice-to-have, see below).
- Push notifications of any kind.
- Offline mode.
- A dedicated structured form for any Section other than Incidents.
- Editing a submitted report beyond the Addendum entry point.

## Further Notes

- **Assumptions standing in for answers.** Dorota was emailed 2026-10-28 with one open legal question; silence means we proceed. No closing manager was available, so these stay as assumptions:
  - managers and staff do use their phones mid-shift,
  - the group chat is today's de facto log,
  - the Night ends at 08:00,
  - staff carry phones.

  Full list: `.scratch/shift-report/open-questions.md`.
- **Nice-to-have, in priority order:**
  1. a Gap routed back to the Staff Member who authored the Capture, as a one-tap question on their Tonight screen,
  2. a department check-out ("Anything from the bar tonight?") that becomes that Section's Draft,
  3. "I saw it too" witness joins on an Incident,
  4. AI photo analysis suggesting an Incident type, always confirmed,
  5. a QR handoff from desktop to phone for photos,
  6. a read-only Owner view,
  7. a full Addendum flow.
- **Polish priority:** first the Report screen at the moment of confirming an Incident that has a Gap, then everything else.
- **Vocabulary:** see `GLOSSARY.md`. Use Capture, Draft, Gap, Unknown, Confirmation, Submission and Addendum exactly as defined there.
