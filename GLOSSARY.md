# Shift Report

The end-of-night record a closing manager produces for a bar or nightclub: it briefs the next team and builds the venue's evidence trail for legal and insurance purposes.

## People

**Closing Manager**:
The person running the venue at close who authors and submits the Shift Report.
_Avoid_: user, staff, operator

**Staff Member**:
Anyone else working the night (door, bar, security) who can add Captures to tonight's Shift Report via that report's shared link. Cannot see Drafts, confirm, or submit. In UI copy, "staff" means the Staff Members as a group ("Invite staff").
_Avoid_: employee, worker, contributor

**Owner**:
A venue owner or operator who reads submitted Shift Reports. Not an author.
_Avoid_: admin, client

## Report

**Shift Report**:
One venue's record of one Night, authored by the Closing Manager. Started by the Closing Manager at the start of the shift, open until Submission, then locked. In UI copy its status is "Open" before Submission and "Sent" after.
_Avoid_: log, form, summary

**Reports**:
The venue's list of its Shift Reports, where the Closing Manager starts a new one ("New report"), continues an open one, or opens a submitted one as a Preview. Each row shows the Night, its status (Open / Sent), the number of Incidents, and when and by whom it was submitted.
_Avoid_: dashboard, history, archive

**Preview**:
A submitted Shift Report shown as a clean, read-only document, the way the next team or an Owner reads it. Not an editing mode.
_Avoid_: print view, export, read-only mode

**Capture**:
A raw input the Closing Manager or a Staff Member adds to a Shift Report, attributed to its author — typed or dictated text, a photo/video/document, or a pasted group chat. Kept verbatim, never edited by AI.
_Avoid_: note, entry, upload, dump

**Inbox**:
The list of a Shift Report's Captures waiting for the Closing Manager. Each Capture in it is New (something of it is not in the report yet, even if another part already is), Drafted (the AI used it and the result is not yet confirmed or kept), In report, or Dismissed.
_Avoid_: feed, queue, quick notes

**Dismiss**:
Hiding a New Capture from the Inbox. The Capture stays in the record unchanged and can be restored. If part of it is already in the report, Dismiss covers only the rest, and the Capture counts as In report.
_Avoid_: delete, remove

**Section**:
One optional topical part of a Shift Report (e.g. Security, Bar Staff, Maintenance). Incidents are the special Section.
_Avoid_: category, tab, step

**Incident**:
A single event that could matter legally or for insurance. Requires an occurred-at time, location, type, and description; may carry evidence.
_Avoid_: issue, event, problem

**Evidence**:
A Capture (photo, video, document) attached to a specific Incident or Section.
_Avoid_: attachment, file, media

## Lifecycle

**Draft**:
Content the AI wrote that the Closing Manager has not yet confirmed (Incident) or kept (Section Draft, Enhance result). The AI writes only when the Closing Manager asks it to. No Draft can be left unchecked at Submission.
_Avoid_: suggestion, prediction

**Confirmation**:
The Closing Manager's explicit approval of an Incident, making them its author. Every Incident needs its own before the Shift Report can be submitted. An Incident with a Gap, or with an Enhance Draft still pending inside it, can't be confirmed. Can be undone (reopened) until Submission. Applies to Incidents only; Section Drafts are kept, not confirmed.
_Avoid_: approval, accept, validate

**Keep / Discard**:
The Closing Manager's decision on a Draft that isn't an Incident (a Section Draft, or an Enhance result, including one inside an Incident's description): keep it as part of the report, or throw it away. Discarding an Enhance result restores the text it replaced. Editing a Section Draft keeps it. Every such Draft must be kept or discarded before Submission; at Submission the remaining ones can be kept all at once. Unlike Confirmation, Keep has no Gap check and can be done in bulk. "Keep" means this decision and nothing else.
_Avoid_: accept, approve, confirm (for Sections)

**Gap**:
A required Incident field that no Capture supports. Left empty and flagged, never guessed.
_Avoid_: error, missing data

**Unknown**:
A required Incident field the Closing Manager has explicitly marked as not knowable. Unlike a Gap, it does not block Submission.
_Avoid_: N/A, blank

**Night**:
The business date a Shift Report belongs to: the date the shift started, so Captures after midnight still count toward the previous Night.
_Avoid_: day, shift date

**Submission**:
The Closing Manager's act of finalising a Shift Report, including a statement that they reviewed it, after which it is locked and marked as AI-assisted. UI copy calls a submitted report "Sent"; in the domain and the docs it is submitted.
_Avoid_: send, publish, close

**Addendum**:
A dated, attributed addition to a submitted Shift Report. The only way to change it after Submission.
_Avoid_: edit, amendment, revision

**Occurred-at / Captured-at**:
The two times on an Incident: when it happened and when it was recorded (set by the system). Occurred-at is the time a Capture states; if none states one, it starts as the Captured-at of the source Capture, and the Closing Manager can change it.
_Avoid_: timestamp (ambiguous)
