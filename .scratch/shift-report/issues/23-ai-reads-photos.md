# 23: The AI reads photos in Extract

**What to build:** Filip reverses the 2026-10-29 cut ("the AI never reads photos") for the demo: a staff member photographs a broken stool, sends it with no caption or a short one ("found in smoking room"), and Draft turns it into the right Section Draft or Incident. Once ticket 18 stores real photos, Extract on Gemini sends the image alongside the Capture's text (Gemini Flash is multimodal). What the AI reads from a photo is an ordinary AI Draft with that Capture as its source, needing Keep / Confirm like any other; required fields the photo and text don't support stay Gaps. Seeded photo Captures (stock images) keep their recorded answers; the fake model gets a recorded answer for a photo Capture so tests never call Gemini. Same rate limit, fallback and calm message as ticket 14.

Docs first, as part of this ticket: a new ADR 0008 (AI reads photos in Extract, superseding the 2026-10-29 cut; why: the demo case, provenance unchanged, risk of misreading is covered by manager review), and update `spec.md` (story 32, the Files bullet: upload is real since 18, the AI now reads image contents), `GLOSSARY.md` if a term changes, and the "Cut:" line in `open-questions.md`.

**Blocked by:** 18

**Status:** ready-for-agent

**Agent:** Opus, high effort (domain + Gemini + docs)

- [x] ADR 0008 written; spec, GLOSSARY and open-questions agree with it
- [x] A captionless photo of a broken stool, sent from the phone, drafts a sensible Maintenance entry or Incident with Gaps for what it can't tell (checked once with real Gemini)
- [x] A photo plus "found in smoking room" uses the caption for the location
- [x] Gemini failure: the Capture stays New with the calm message; tests use the fake model only

## Comments

Done. `ModelCapture` gets an optional `image` (`{ mime, data }`); `runExtract` / `applySaved` take `images` by Capture id and attach them to photo Captures in scope only (test-first in `lib/report/extract.test.ts`). `lib/report` never fetches: the draft route loads `capturePhoto` for the uploaded photos in scope. `extractContents` in `lib/ai/extract-prompt.ts` sends the prompt, then each image as inline data labelled "Image of Capture <id>:"; the JSON only says `"hasImage": true`. The instructions let Gemini draft from what the image clearly shows; location stays words-only (a quote from the text), so a location read off the image alone is a Gap. Fake and fallback models can't see images; the tests use a recorded Gemini answer for a stool photo.

Checked in Chrome with real Gemini (own demo id, rows and test counter removed from Neon), using a drawn image of a toppled bar stool with a snapped leg: captionless → Incident "Damaged stool", Property damage, 02:15 (its Captured-at), location Gap, plus a Maintenance Draft ("A stool was damaged and tipped over… needing repair or replacement"). With "found in smoking room" → "Damaged bar stool", location Smoking area, ready to confirm. Over the rate limit → 409 degraded, the photo stays New.
