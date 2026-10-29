// PROTOTYPE — E's view of the report. The rules live in the report domain module
// (lib/report); this file adds only what belongs to the browser demo.

export * from "@/lib/report"

/** This browser's demo report, stored in Neon (./report/route.ts). */
export const REPORT_API = "/prototype/report-editor/report"

/** Live Inbox endpoint shared by the desktop and the capture page (./captures/route.ts). */
export const CAPTURES_API = "/prototype/report-editor/captures"

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
