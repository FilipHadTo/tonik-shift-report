# Open questions

Collected during grilling. Each one carries the assumption we build on until answered. Silence = accepted.

## For Dorota (PO — product / legal / compliance)

Dorota answered on 2026-10-29: "W zadaniu mamy minimalne kryteria: czas, datę, miejsce, typ zdarzenia i opis." (The task's minimum criteria: time, date, place, type of event and description.) That closes 1 and 4: our Incident fields cover the minimum, and witness fields and signatures are out of scope. 2 and 3 got no answer, so our assumptions stand.

1. **Legal defensibility primitives.** _Answered: minimum is time, date, place, type, description._ We assume a report holds up legally if it has: verbatim raw Captures kept alongside AI Drafts; Occurred-at vs Captured-at on every Incident; per-field provenance (AI-derived + confirmed vs manager-entered); lock on Submission with Addenda for later changes. Is anything missing (witnesses, injured-party details, police report number, CCTV reference, signatures)?
2. **AI disclosure.** Submitted reports carry "AI-assisted, reviewed and submitted by [manager] at [time]" plus a reviewer statement checkbox. Is disclosing AI assistance OK for the client and their insurers, or a liability?
3. **Incident taxonomy.** We use a fixed list: Fight/assault, Injury/medical, Ejection/refused entry, Theft, Property damage, Drugs, Intoxication, Harassment, Police called, Other. Does the client (or their insurance policy) already have one?
4. **Staff accounts as witness statements.** _Answered: out of scope, attribution is enough._ Staff Members add attributed Captures (name + role, no login). Does a staff Capture need to count as a witness statement (full name, signature), or is attribution enough?

## For a real closing manager

No closing manager available to ask — these stay as assumptions for the build.

1. **Phone during the shift.** Can/do you use your phone mid-shift to log incidents, or is it end-of-night only?
2. **"Group texts" today.** What does the current group chat look like — who's in it, what gets posted, is it the de facto incident log?
3. **End of night.** When does your night actually end? We assume anything before 8am belongs to the previous night.
4. **Staff phones.** Do door/bar/security staff carry their phones on shift, and would they log something if asked?

## Nice-to-have (if time allows)

- Owner view: a read-only page of the submitted Shift Report as the next team / Owner sees it.
- Full Addendum flow (beyond the button on the Submitted screen).
- Gap routed to its author: a Staff Member's Capture with a Gap asks *them* (one-tap answer on their capture page), not the Closing Manager.
- Department check-out: when leaving, a Staff Member gets "Anything from the bar tonight?" — a short voice/text Capture the AI turns into that Section's Draft. Strong Loom "what's next" story even if unbuilt.

Cut: AI photo analysis (Filip, 2026-10-29: the AI never reads photos), the desktop-to-phone QR handoff (the capture page covers it), "I saw it too" witness joins (no witness fields). Also cut: push notifications asking staff for their version of an Incident (would be pure fake in a prototype).

## Phase 2b

### 2026-10-30 — Ticket 17: layout of the submitted report document

Blocks: 17 (ready-for-human, also blocked by 16). New screen, Filip designs it in E before it can be built.

Question: how should the submitted Shift Report read as a document (header, Sections, Incidents, "Not covered tonight", attachments, verbatim Captures, statement + footer, Share stub)?

Options:
- A. Same route as the editor, locked view swaps to a document layout (single column, print stylesheet).
- B. Separate read-only route under `app/prototype/report-editor/` (e.g. `/submitted`), the editor links to it after Submit; doubles as the Owner view.
- C. Filip sketches it in E by hand first (as with the Report screen), then an agent builds it.

### 2026-10-30 — Ticket 15: "Enhancing…" timing and failed Enhance message

Blocks: 15 (only these two details; the rest can be built). Raised by ticket 05.

Question 1: with the fake model "Enhancing…" only shows after the answer (instant). With Gemini there is a real wait.
- A. Show "Enhancing…" before the call; "Already reads clean." appears after the wait.
- B. Keep the current order (nothing visible until the model answers).

Question 2: what does the manager see when Enhance fails (degraded)? Today in E nothing happens.
- A. Calm inline note under the block, e.g. "Couldn't enhance right now. Your text is unchanged."
- B. Silent no-op (current behaviour).

### 2026-10-30 — Ticket 06: status of a partly dismissed Capture

Not blocking (built with A; easy to flip). Ticket says a partly dismissed Capture "becomes In report".
- A. (built) Keep the normal derived status: shows Drafted ("to review") while its AI draft is unchecked, In report once kept.
- B. Force In report right away, even with an unchecked draft.

### 2026-10-30 — Ticket 07: Submit sheet checklist row layout (review)

Not blocking. To fit "Keep all" next to "Show", the checklist meta now sits inline with the label (no wrap) and the row is `min-h-9` instead of `h-9`. Other rows look the same. Filip to eyeball the Submit sheet in E (02:15 scene) and keep or revert.

### 2026-10-30 — Ticket 08: loading and fallback behaviour (review)

Not blocking, built with A in each case.
1. While the report loads from the DB: A. (built) empty background only; B. skeleton of the Report screen.
2. DB unreachable: A. (built) fall back to the local seed, demo opens but nothing saves; B. show a calm "Can't reach the server" state instead.
3. Stored scene differs from `?scene=` in the URL: A. (built) URL wins and that scene is reseeded; B. stored report wins.

### 2026-10-30 — Ticket 10: Night assignment for phone Captures

Not blocking, built with A. Each demo id has one report and one Night (Sat 24 Oct, seeded).
- A. (built) Captured-at comes from the report's demo clock, so phone Captures always land in the seeded Night; `nightOf` not called.
- B. Real server clock + `nightOf`: Captures at today's real time; the demo would need a report per Night.
