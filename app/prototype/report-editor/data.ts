// PROTOTYPE — E's view of the report. The rules live in the report domain module
// (lib/report); this file adds only what belongs to the browser demo.

export * from "@/lib/report"
import type { ExtractScope } from "@/lib/report"

/** This browser's demo report, stored in Neon (./report/route.ts). */
export const REPORT_API = "/prototype/report-editor/report"

/** Draft into report / from inbox / all: Extract with Gemini on the server (./report/draft/route.ts). */
export const DRAFT_API = "/prototype/report-editor/report/draft"

/** Enhance on selected text: Gemini on the server (./report/enhance/route.ts). */
export const ENHANCE_API = "/prototype/report-editor/report/enhance"

/** Story 24: shown on the Draft button that was pressed when the AI failed, was slow or rate limited. */
export const AI_CALM = "AI is catching up, your Captures are safe"

/** Story 24 for Enhance, on its button: it never touches Captures, so the note speaks of the manager's text. */
export const AI_CALM_ENHANCE = "AI is catching up, your text is safe"

/** Which Draft button a scope belongs to, so only that one shows the calm message. */
export function scopeKey(scope: ExtractScope) {
  return "capture" in scope ? `capture:${scope.capture}` : "section" in scope ? `section:${scope.section}` : "all"
}

/** Live Inbox endpoint shared by the desktop and the capture page, stored in Neon (./captures/route.ts). */
export const CAPTURES_API = "/prototype/report-editor/captures"

/** A phone photo's stored image (./captures/photo/route.ts), scoped by demo id. */
export const photoSrc = (demo: string, capture: string) => `${CAPTURES_API}/photo?d=${demo}&id=${capture}`

/**
 * One demo per browser: the desktop's id goes into the QR link (`?d=…`), so each reviewer's
 * phones write into their own Report screen and nobody's Reset wipes anyone else's Captures.
 */
export function demoSession() {
  try {
    let id = localStorage.getItem("shift-report:demo")
    if (!id) {
      id = Math.random().toString(36).slice(2, 10)
      localStorage.setItem("shift-report:demo", id)
    }
    return id
  } catch {
    return "public"
  }
}
