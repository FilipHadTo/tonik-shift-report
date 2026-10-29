# Shift Report — structure

What a submitted Shift Report contains, shown as one clean example, followed by where each part comes from. Built from the seeded demo Night used in the prototypes.

Legend for the source tags at the end of each section:
- **Brief**: `brief.md`
- **Spec**: `.scratch/shift-report/spec.md`, followed by the user story number
- **ADR**: `docs/adr/`
- **Glossary**: `GLOSSARY.md`
- **Assumption**: our own call, listed in `.scratch/shift-report/open-questions.md`. Stands until Dorota or a real closing manager says otherwise.

---

## 1. Example: a submitted report

> **Shift Report: Halo Club, Night of Sat 24 Oct 2026**
> Closing Manager: Alex Morgan
> Opened 23:40 by Alex's photo · Submitted 02:31 · Locked
> 5 Captures (4 from Alex, 1 from Marek, Door) · 4 Incidents · 4 of 13 Sections filled

### Incidents

**1. Broken window**

| Field | Value | Where it came from |
|---|---|---|
| Occurred at | 23:40 | AI draft from Capture #1 (photo), confirmed by Alex |
| Captured at | 23:40 | System, from the earliest source Capture |
| Location | Side entrance | Entered by Alex (was a Gap) |
| Type | Property damage | AI draft from Capture #1, confirmed |
| What happened | Window found smashed with glass on the floor. Area taped off. | AI draft from Capture #1, confirmed |
| Evidence | Photo, 23:40 | Capture #1 |

Confirmed by Alex Morgan, 02:18

**2. Refused re-entry, bottle thrown**

| Field | Value | Where it came from |
|---|---|---|
| Occurred at | 00:45 | AI draft from Capture #2 ("~00:45"), confirmed |
| Captured at | 00:52 | System |
| Location | Front door | AI draft from Capture #2, confirmed |
| Type | Ejection/refused entry | AI draft from Capture #2, confirmed |
| What happened | Previously ejected guest (grey hoodie) refused re-entry. Became aggressive and threw a bottle at the queue barrier, then left towards the high street. | AI draft from Capture #2, confirmed |
| Reported by | Marek (Door) | Staff Capture via team link |

Confirmed by Alex Morgan, 02:20

**3. Fight at the main bar**

| Field | Value | Where it came from |
|---|---|---|
| Occurred at | 01:10 | AI draft from Capture #3 ("like five minutes ago", logged 01:15), confirmed |
| Captured at | 01:15 | System |
| Location | Main bar | AI draft from Capture #3, confirmed |
| Type | Fight/assault | AI draft from Capture #3, confirmed |
| What happened | Two male guests fought at the main bar. Security (Tom, Kuba) separated them. One had a cut lip, was given ice and left with friends. Police not called. | AI draft from Capture #3, confirmed |

Confirmed by Alex Morgan, 02:22

**4. Phone stolen from cloakroom**

| Field | Value | Where it came from |
|---|---|---|
| Occurred at | Unknown | Marked Unknown by Alex. The chat only says "sometime before midnight she thinks?" |
| Captured at | 02:10 | System |
| Location | Cloakroom | AI draft from Capture #4 (group chat, 01:42 line), confirmed |
| Type | Theft | AI draft from Capture #4, confirmed |
| What happened | Guest reported her phone stolen from her coat in the cloakroom. Manager took her number and advised her to report it to police. | AI draft from Capture #4, confirmed |

Confirmed by Alex Morgan, 02:25

### General overview
Busy night, front of stage at capacity around midnight. DJ started 20 min late. Four Incidents, no police attendance.
*(AI draft from Captures #3, #4, accepted)*

### Security
Second barrier opened at 00:12 due to crowd at the front of stage. Building clear by 02:05.
*(AI draft from Capture #4, accepted)*

### Production / run of show
DJ running 20 minutes late.
*(AI draft from Capture #4, accepted)*

### Maintenance / equipment
Ice machine leaking again (reported 22:58). Window smashed at side entrance, taped off, needs glazier.
*(AI draft from Captures #1, #4, edited by Alex)*

### Not covered tonight
Audience · Artist & crew · Door staff · Bar staff · Kitchen · Third-party vendors · Private events · Inventory

### Captures (verbatim, never edited)

| # | Captured at | By | Kind | Content |
|---|---|---|---|---|
| 1 | 23:40 | Alex Morgan | Photo | "window smashed, glass on the floor, taped it off" + photo |
| 2 | 00:52 | Marek (Door) | Text | "Refused re-entry to guy in grey hoodie, already thrown out once. Very aggressive, threw a bottle at the queue barrier. Walked off towards the high street ~00:45" |
| 3 | 01:15 | Alex Morgan | Voice note, 0:14 | "Fight at the main bar like five minutes ago, two guys, Tom and Kuba split them up. One had a cut lip, we gave him ice, he left with his mates. No police." + audio |
| 4 | 02:10 | Alex Morgan | Pasted group chat | 6 messages, 22:58 to 02:05 (kept in full) |

### Submission
- [x] I reviewed this report and it matches what I remember.

AI-assisted. Reviewed and submitted by Alex Morgan at 02:31. Locked: changes only as a dated, attributed Addendum.

### Addenda
None.

---

## 2. Structure

| Part | Contents | Required? |
|---|---|---|
| Header | Venue, Night (business date), Closing Manager, opened at + by which Capture, submitted at, counts | System-filled |
| Incidents | 0..n Incidents, each with the fields below | Optional as a Section. Every Incident in it must be confirmed. |
| 12 other Sections | One free-text block each, AI draft or written by the manager | All optional. Empty ones collapse into "Not covered tonight". |
| Captures | Every raw input, verbatim, attributed, timestamped | System-kept, never edited |
| Submission | Reviewer statement + AI disclosure footer + lock | Required to submit |
| Addenda | Dated, attributed additions after the lock | Only after Submission |

Incident fields:

| Field | Required | Can be Unknown | Who sets it |
|---|---|---|---|
| Occurred at | Yes | Yes | AI draft or manager |
| Captured at | Yes | No | System |
| Location | Yes | Yes | AI draft or manager |
| Type | Yes, from a fixed list | No ("Other" + description instead) | AI draft or manager |
| What happened | Yes | No | AI draft or manager |
| Evidence | No | n/a | Linked Captures |
| Reported by | No | n/a | Shown when the source is a Staff Member |
| Confirmation | Yes, per Incident | n/a | Manager only |

Every field also records its provenance: AI-drafted then confirmed, or entered by the manager, plus the source Capture(s).

Fixed Incident types: Fight/assault, Injury/medical, Ejection/refused entry, Theft, Property damage, Drugs, Intoxication, Harassment, Police called, Other.

---

## 3. Where each part comes from

| Element | Source | Firm or assumed |
|---|---|---|
| Report exists to brief the next team + build an evidence trail for legal/insurance | Brief ("What's the task", "Broader product context") | Firm |
| The 13 Sections and their names | Brief ("What the full report covers") | Firm |
| All Sections optional | Brief ("All sections are optional…") | Firm |
| Incident minimum: time, location, type, description | Brief ("Incidents are the special case") | Firm |
| Photos/videos/documents attachable to report or Section | Brief. Upload is stubbed in the prototype (Spec, Implementation: Files). | Firm, stubbed |
| Under 10 minutes, guided + freeform without choosing | Brief (tensions, user goal) | Firm |
| Captures kept verbatim next to AI Drafts | ADR 0003, Spec 16 | Assumption (legal defensibility) |
| Occurred-at vs Captured-at | ADR 0003, Glossary, Spec 37 | Assumption |
| Per-field provenance + source Capture | ADR 0003, Spec (Evidence model) | Assumption |
| Lock on Submission, Addenda only | ADR 0003, Glossary, Spec 57–58 | Assumption |
| Gap = never guess, leave blank | Glossary, Spec 30–31 | Our decision (brief: "forgiving", "smart") |
| Unknown = honest "can't know", doesn't block | Glossary, Spec 33 | Our decision ("without requiring perfection", brief) |
| Confirmation per Incident, no approve-all | Glossary, Spec 44–45 | Our decision (skimming risk on a legal record) |
| Other Sections take AI drafts without Confirmation | Glossary, Spec 46 | Our decision (low risk, saves time) |
| Fixed Incident type list | Spec (Implementation: Incident types) | Assumption, open question 3 for Dorota |
| Reviewer statement checkbox + "AI-assisted…" footer | Spec 55–56 | Assumption, open question 2 for Dorota |
| Staff Captures attributed by name + role, no login | ADR 0004, Spec 11–15 | Assumption, open question 4 for Dorota (witness statement?) |
| Report opens on first Capture, no "create" step | ADR 0002, Spec 6 | Our decision |
| Night = date the shift started, cut-off 08:00 | Glossary, Spec 9 | Assumption (closing manager question 3) |
| Missing from the record, maybe needed: witnesses, injured party, police report number, CCTV reference, signature | Open question 1 for Dorota | Unanswered |

---

## 4. Worth deciding while you read this

- Does the submitted report show provenance on every field (as above), or only on hover/expand? Full provenance is the defensible version but heavy to read for the next team.
- Should "Reported by" also list witnesses named in a Capture (Tom, Kuba in Incident 3), or wait for Dorota's answer on witness fields?
- Do accepted Section drafts need any marker in the final report (as above, "AI draft, accepted"), or is the footer disclosure enough?
- Is the order right: Incidents first, then the brief's Section order? The brief lists General overview first.
