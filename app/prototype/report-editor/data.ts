// PROTOTYPE — E's view of the report. The rules live in the report domain module
// (lib/report); this file adds only what belongs to the browser demo.

export * from "@/lib/report"
import type { ExtractScope } from "@/lib/report"

/** Reports, the public link (stories 59, 63): this browser's list (./page.tsx). */
export const REPORTS_PATH = "/prototype/report-editor"

/** A report's own page (ADR 0009): the demo report's id is the demo id, a clean one's `r-…`. */
export const reportPath = (id: string) => `${REPORTS_PATH}/r/${id}`

/** A sent report's Preview (story 68): the same route in document mode. */
export const previewPath = (id: string) => `${reportPath(id)}?view=document`

/** This browser's Reports list and "New report", stored in Neon (./reports/route.ts). */
export const REPORTS_API = "/prototype/report-editor/reports"

/** One report, stored in Neon (./report/route.ts). */
export const REPORT_API = "/prototype/report-editor/report"

/** Draft into report / from inbox / all: Extract with Gemini on the server (./report/draft/route.ts). */
export const DRAFT_API = "/prototype/report-editor/report/draft"

/** Enhance on selected text: Gemini on the server (./report/enhance/route.ts). */
export const ENHANCE_API = "/prototype/report-editor/report/enhance"

/** Story 24: shown on the Draft button that was pressed when the AI failed, was slow or rate limited. */
export const AI_CALM = "AI is catching up, your Captures are safe"
/** Ticket 27: the AI answered, but nothing in the Captures belongs in the report. They stay New. */
export const AI_NOTHING = "Nothing to add to the report from this"

/** Story 24 for Enhance, on its button: it never touches Captures, so the note speaks of the manager's text. */
export const AI_CALM_ENHANCE = "AI is catching up, your text is safe"

/** Which Draft button a scope belongs to, so only that one shows the calm message. */
export function scopeKey(scope: ExtractScope) {
  return "capture" in scope ? `capture:${scope.capture}` : "section" in scope ? `section:${scope.section}` : "all"
}

/** Live Inbox endpoint shared by the desktop and the capture page, stored in Neon (./captures/route.ts). */
export const CAPTURES_API = "/prototype/report-editor/captures"

/** A phone photo's stored image (./captures/photo/route.ts), scoped by report id. */
export const photoSrc = (report: string, capture: string) => `${CAPTURES_API}/photo?r=${report}&id=${capture}`

/**
 * One demo per browser: the id keys this reviewer's Reports list (story 71) and is the id of its demo
 * report, so nobody's Reset wipes anyone else's Captures. The QR link carries the report, not this.
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
