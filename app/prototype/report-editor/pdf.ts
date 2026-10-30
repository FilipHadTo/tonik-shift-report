// PROTOTYPE — "Download PDF" (ticket 26): the Preview's document as it looks on screen (dark), as an
// image-based A4 PDF. Client-side; the libraries load on the first press, never with the page.

import { pageBreaks, type Block } from "@/lib/page-breaks"

const A4 = { w: 210, h: 297 } // mm
/** Page margins in CSS px, the panel's own padding (px-14, pt-16). */
const MARGIN = { x: 56, y: 64 }
/** Blocks a page edge shouldn't cut through; `break-after-avoid` headings stay with what follows. */
const BLOCKS = "h1, h2, h3, p, li, tr, figure, dt, dd, .break-inside-avoid, .break-after-avoid"
/** Keeps the capture canvas under browsers' size limits on a very long report. */
const MAX_CANVAS = 30000

/** "Halo Club", "Sat 24 Oct" → "halo-club-shift-report-sat-24-oct.pdf" */
export function pdfName(venue: string, night: string) {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return `${slug(venue)}-shift-report-${slug(night)}.pdf`
}

export async function downloadPdf(doc: HTMLElement, fileName: string) {
  const [{ domToCanvas }, { jsPDF }] = await Promise.all([import("modern-screenshot"), import("jspdf")])

  const box = doc.getBoundingClientRect()
  const blocks: Block[] = [...doc.querySelectorAll<HTMLElement>(BLOCKS)].map((el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top - box.top, bottom: r.bottom - box.top, keepWithNext: el.matches(".break-after-avoid") }
  })
  // The page is the panel: its colour, the document's width plus the panel's side padding, A4 tall.
  const background = getComputedStyle(doc.parentElement ?? doc).backgroundColor
  const pageW = box.width + MARGIN.x * 2
  const pageH = (pageW * A4.h) / A4.w
  const scale = Math.min(2, MAX_CANVAS / box.height)

  const shot = await domToCanvas(doc, { scale, backgroundColor: background })
  const cuts = [0, ...pageBreaks(box.height, pageH - MARGIN.y * 2, blocks), box.height]

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true })
  const page = document.createElement("canvas")
  page.width = Math.round(pageW * scale)
  page.height = Math.round(pageH * scale)
  const ctx = page.getContext("2d")
  if (!ctx) throw new Error("No 2D canvas")

  for (let n = 0; n < cuts.length - 1; n++) {
    const sy = Math.round(cuts[n] * scale)
    const sh = Math.round(cuts[n + 1] * scale) - sy
    ctx.fillStyle = background
    ctx.fillRect(0, 0, page.width, page.height)
    ctx.drawImage(shot, 0, sy, shot.width, sh, Math.round(MARGIN.x * scale), Math.round(MARGIN.y * scale), shot.width, sh)
    if (n > 0) pdf.addPage()
    pdf.addImage(page.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, A4.w, A4.h)
  }
  pdf.save(fileName)
}
