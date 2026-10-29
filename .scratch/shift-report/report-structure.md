# Shift Report — structure

What a submitted Shift Report contains, shown as one clean example, followed by where each part comes from. Built from the seeded demo Night (the 02:15 state, then submitted).

Legend for the source tags at the end of each section:
- **Brief**: `brief.md`
- **Spec**: `.scratch/shift-report/spec.md`, followed by the user story number
- **ADR**: `docs/adr/`
- **Glossary**: `GLOSSARY.md`
- **Assumption**: our own call, listed in `.scratch/shift-report/open-questions.md`. Stands until a real closing manager says otherwise.

---

## 1. Example: a submitted report

The submitted report reads like a document, not an app screen (Spec 57). Provenance is stored for every field but not printed; the footer says the report is AI-assisted.

> **Shift Report: Halo Club, Night of Sat 24 Oct 2026**
> Closing Manager: Alex Morgan
> Started 20:00 · Submitted 02:31 · Locked
> 5 Captures (3 from Alex, 1 from Marek, Door, 1 from Jess, Bar) · 4 Incidents · 6 of 13 Sections covered

### General overview
Busy night, front of stage at capacity around midnight. DJ started 20 minutes late. No police attendance.

### Incidents

**1. Broken window**
23:40 (logged 23:40) · Side entrance · Property damage
Window found smashed with glass on the floor. Area taped off.
Evidence: photo, see Attachments. Confirmed by Alex Morgan, 02:18.

**2. Refused re-entry, bottle thrown**
00:45 (logged 00:52) · Front door · Ejection/refused entry · Reported by Marek (Door)
Previously ejected guest (grey hoodie) refused re-entry. Became aggressive and threw a bottle at the queue barrier, then left towards the high street.
Confirmed by Alex Morgan, 02:20.

**3. Fight at the main bar**
01:10 (logged 01:15) · Main bar · Fight/assault
Two male guests fought at the main bar. Security (Tom, Kuba) separated them. One had a cut lip, was given ice and left with friends. Police not called.
Evidence: voice note, see Captures. Confirmed by Alex Morgan, 02:09.

**4. Phone stolen from cloakroom**
Time unknown (logged 02:10) · Cloakroom · Theft
Guest reported her phone stolen from her coat in the cloakroom. Manager took her number and advised her to report it to police.
Confirmed by Alex Morgan, 02:25.

### Security
Two security short until 22:00. Kuba covered the side door. Second barrier opened at 00:12 for the crowd at the front of stage. Building clear by 02:05.

### Production / run of show
DJ running 20 minutes late.

### Maintenance / equipment
Ice machine leaking again (Jess, 22:58). Window smashed at the side entrance, taped off, needs a glazier.

### Inventory
Aperol ran out around 01:00. Two cases needed before Friday.

### Not covered tonight
Audience · Artist & crew · Door staff · Bar staff · Kitchen · Third-party vendors · Private events

### Attachments
Photo, 23:40, Alex Morgan: broken window (Incident 1), shown large.

### Captures (verbatim, never edited)

| # | Captured at | By | Kind | Content |
|---|---|---|---|---|
| 1 | 23:40 | Alex Morgan | Photo | "window smashed, glass on the floor, taped it off" + photo |
| 2 | 00:52 | Marek (Door) | Text | "Refused re-entry to guy in grey hoodie, already thrown out once. Very aggressive, threw a bottle at the queue barrier. Walked off towards the high street ~00:45" |
| 3 | 01:05 | Jess (Bar) | Text | "we're out of aperol since about 1. need 2 cases before friday pls" |
| 4 | 01:15 | Alex Morgan | Voice note, 0:14 | "Fight at the main bar like five minutes ago, two guys, Tom and Kuba split them up. One had a cut lip, we gave him ice, he left with his mates. No police." + audio |
| 5 | 02:10 | Alex Morgan | Pasted group chat | 6 messages, 22:58 to 02:05 (kept in full) |

Dismissed Captures, if any, are listed here too, marked "dismissed".

### Submission
- [x] I reviewed this report and it matches what I remember.

AI-assisted. Reviewed and submitted by Alex Morgan at 02:31. Locked: changes only as a dated, attributed Addendum.

### Addenda
None.

---

## 2. Structure

| Part | Contents | Required? |
|---|---|---|
| Header | Venue, Night (business date), Closing Manager, started at, submitted at, counts | System-filled |
| Sections | General overview, Incidents, then the other 11 in the brief's order. Each non-Incident Section is free-text blocks (AI Draft, kept, or written by the manager). | All optional. Only Sections with content are printed. |
| Incidents | 0..n Incidents, each with the fields below, ordered by Captured-at | Optional as a Section. Every Incident in it must be confirmed. |
| Not covered tonight | One line naming every Section without content (hidden or empty) | System-filled |
| Attachments | Evidence photos, larger, labelled by Incident | Only if there is Evidence |
| Captures | Every raw input, verbatim, attributed, timed; dismissed ones marked | System-kept, never edited |
| Submission | Reviewer statement + AI disclosure footer + lock | Required to submit |
| Addenda | Dated, attributed additions after the lock | Only after Submission |

Incident fields:

| Field | Required | Can be Unknown | Who sets it |
|---|---|---|---|
| Occurred at | Yes | Yes | The time a Capture states, else the source Capture's Captured-at; the manager can change it |
| Captured at | Yes | No | System |
| Location | Yes | Yes | AI only from Capture text (never from a photo), or the manager from a list |
| Type | Yes, from a fixed list | No ("Other" + description instead) | AI draft or manager |
| What happened | Yes | No | AI draft or manager |
| Evidence | No | n/a | Photos from the Incident's source Captures |
| Reported by | No | n/a | Shown when the source is a Staff Member |
| Confirmation | Yes, per Incident | n/a | Manager only; reversible until Submission |

Every field and Section block also stores its provenance (ai-drafted, confirmed, kept, or manager-entered) and its source Captures. It is stored, not printed.

Fixed Incident types: Fight/assault, Injury/medical, Ejection/refused entry, Theft, Property damage, Drugs, Intoxication, Harassment, Police called, Other.

---

## 3. Where each part comes from

| Element | Source | Firm or assumed |
|---|---|---|
| Report exists to brief the next team + build an evidence trail for legal/insurance | Brief ("What's the task", "Broader product context") | Firm |
| The 13 Sections and their names | Brief ("What the full report covers") | Firm |
| All Sections optional | Brief, Spec 52 | Firm |
| Incident minimum: time, date, place, type, description | Brief; Dorota, 2026-10-29 | Firm |
| Photos/videos/documents attachable | Brief. Upload is stubbed (Spec, Implementation: Files). | Firm, stubbed |
| Under 10 minutes, guided + freeform without choosing | Brief (tensions, user goal), Spec 26 | Firm |
| Captures kept verbatim next to AI Drafts | ADR 0003, Spec 14, 57 | Assumption (legal defensibility) |
| Occurred-at vs Captured-at | ADR 0003, Glossary, Spec 35, 37 | Assumption |
| Per-field provenance + source Capture, stored not printed | ADR 0003, Spec (Evidence model) | Assumption |
| Lock on Submission, Addenda only | ADR 0003, Glossary, Spec 56 | Assumption |
| Gap = never guess, leave blank | Glossary, Spec 32–33 | Our decision (brief: "forgiving", "smart") |
| Unknown = honest "can't know", doesn't block | Glossary, Spec 34 | Our decision ("without requiring perfection", brief) |
| Confirmation per Incident, no approve-all | Glossary, Spec 44 | Our decision (skimming risk on a legal record) |
| Section Drafts kept or discarded, not confirmed | Glossary (Keep / Discard), Spec 30 | Our decision (low risk, saves time) |
| AI drafts only on request | ADR 0007, Spec 23 | Our decision (AI where it helps, not everywhere) |
| Fixed Incident type list | Spec (Implementation: Incident types) | Assumption (open question 3 for Dorota, unanswered) |
| Reviewer statement checkbox + "AI-assisted…" footer | Spec 54–55 | Assumption (open question 2 for Dorota, unanswered) |
| Staff Captures attributed by name + role, no login | ADR 0004, Spec 7–8 | Our decision; witness statements out of scope |
| Manager starts the report at the start of the shift | ADR 0005, Spec 1 | Our decision (demo simplicity) |
| Night = date the shift started, cut-off 08:00 | Glossary, Spec 6 | Assumption (closing manager question 3) |

---

## 4. Decisions taken (closed 2026-10-29)

- **Provenance in the submitted report:** stored for every field, not printed. The document shows "Confirmed by", "Reported by", the logged time and the AI-assisted footer; the Captures table carries the sources. Reason: the next team reads it as a document, and defensibility comes from what is stored.
- **Witnesses:** no witness field. Dorota (2026-10-29) named the minimum as time, date, place, type and description; "Reported by" stays for Staff Member Captures.
- **Marker on kept Section Drafts:** none. The footer disclosure covers the whole report.
- **Order:** General overview first, then Incidents, then the brief's order (prototype E).
