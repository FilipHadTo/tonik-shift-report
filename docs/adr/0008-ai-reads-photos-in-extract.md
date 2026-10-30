# The AI reads photos in Extract

Supersedes the "AI never reads photo contents" consequence of ADR-0007 and Filip's 2026-10-29 cut. When a Staff Member photographs a broken stool and sends it with no caption, or with "found in smoking room", Draft should turn it into the right Incident or Section Draft; a photo the AI can't see only ever produced "Photo from Kasia, no caption". Since ticket 18 a photo sent from the phone is stored with its Capture, so Extract on Gemini sends the image alongside the Capture's words (Gemini Flash is multimodal). The domain stays pure: the route loads the stored images of the photo Captures in scope and passes them in with the model input; `lib/report` never fetches them.

What the AI reads from a photo is an ordinary AI Draft with that Capture as its source, so provenance is unchanged: the manager sees where it came from and has to Keep or Confirm it like any other Draft. The risk of misreading an image is covered by that review, the same as a misread note.

## Considered Options

- Keep the cut (the AI reads captions only): a captionless photo, the most natural thing to send at 1am, drafts nothing useful.
- Read photos but leave them out of Incidents: the demo case (broken furniture) is exactly Property damage, so the split would be arbitrary.

## Consequences

- Location still comes only from words: a location must quote a Capture's text, so one read off an image alone is a Gap. A caption like "found in smoking room" fills it. Occurred-at is still the time a Capture states, otherwise its Captured-at. The Incident type and the description may come from the image.
- Seeded photo Captures have no stored image (stock placeholders) and keep their recorded answers. The fake model and the fallback can't see images; tests use recorded answers and never call Gemini.
- Same rate limit, fallback and calm message as any Extract: when Gemini fails, a phone photo stays New.
