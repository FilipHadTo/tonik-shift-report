"use client"

// PROTOTYPE — Enhance (story 27). Select text you wrote yourself (a Section block you
// typed, or "What happened" in an Incident you added) and a small bar offers Enhance.
// Only elements marked data-enhance="block:<id>" or "incident:<id>" qualify, so
// Captures and unchecked Drafts can't be enhanced.

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"
import { Btn } from "@/components/btn"
import { AI_CALM_ENHANCE } from "./data"
import { useEditor } from "./report-editor"

type Sel = { el: HTMLElement; top: number; x: number; start: number; end: number }

const BAR_H = 36
/** How long the calm note stands in for the Enhance button, as on the Draft buttons (ticket 14). */
const CALM_MS = 5000

export function EnhanceBar() {
  const { enhance, enhancing, docRef } = useEditor()
  const [sel, setSel] = useState<Sel | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const calmTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // While the model runs the text loses data-enhance, which would drop the selection and the answer's note with it.
  const running = useRef(false)
  const last = useRef<Pick<Sel, "el" | "start" | "end"> | null>(null)
  useEffect(() => () => clearTimeout(calmTimer.current), [])

  useEffect(() => {
    const clear = () => {
      last.current = null
      setSel(null)
    }
    const update = () => {
      if (running.current) return
      const s = window.getSelection()
      if (!s || s.isCollapsed || !s.rangeCount) return clear()
      const range = s.getRangeAt(0)
      const node = range.commonAncestorContainer
      const el = (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>("[data-enhance]")
      if (!el || !range.toString().trim()) return clear()
      // Offsets in the element's plain text, so the rewrite can be spliced back in.
      const pre = document.createRange()
      pre.selectNodeContents(el)
      pre.setEnd(range.startContainer, range.startOffset)
      const start = pre.toString().length
      const r = range.getBoundingClientRect()
      // Above the selection, or below it when there's no room under the column's top edge.
      const docTop = docRef.current?.getBoundingClientRect().top ?? 0
      const top = r.top - BAR_H - 8 > docTop + 8 ? r.top - BAR_H - 8 : r.bottom + 8
      const end = start + range.toString().length
      // A scroll (or the layout settling after "Enhancing…") only moves the bar; a new selection clears its note.
      const prev = last.current
      if (prev?.el !== el || prev.start !== start || prev.end !== end) {
        clearTimeout(calmTimer.current)
        setNote(null)
      }
      last.current = { el, start, end }
      setSel({ el, top, x: r.left + r.width / 2, start, end })
    }
    const doc = docRef.current
    document.addEventListener("selectionchange", update)
    doc?.addEventListener("scroll", update, { passive: true })
    return () => {
      document.removeEventListener("selectionchange", update)
      doc?.removeEventListener("scroll", update)
    }
  }, [docRef])

  if (!sel || enhancing) return null

  async function run() {
    if (!sel) return
    const { el, start, end } = sel
    const [kind, id] = (el.dataset.enhance ?? "").split(":")
    running.current = true
    const status = await enhance(kind === "block" ? { block: id } : { incident: id }, el.textContent ?? "", { start, end }).finally(
      () => (running.current = false),
    )
    if (status === "unchanged") return setNote("Already reads clean. Nothing to change.")
    // Story 24: the AI and its fallback both failed. The text is as it was; the button comes back after a beat.
    if (status === "degraded") {
      setNote(AI_CALM_ENHANCE)
      calmTimer.current = setTimeout(() => setNote(null), CALM_MS)
      return
    }
    if (status !== "drafted") return
    window.getSelection()?.removeAllRanges()
    el.blur()
  }

  return (
    <div
      role="toolbar"
      aria-label="Selected text"
      // Keep the selection: clicking the bar must not move focus out of the text.
      onMouseDown={(e) => e.preventDefault()}
      // Centred with transform, so the `enter` rise (on translate) doesn't slide it sideways.
      style={{ top: sel.top, left: sel.x, transform: "translateX(-50%)" }}
      className="enter fixed z-40 flex h-9 items-center rounded-xl bg-panel p-1 shadow-pop"
    >
      {note ? (
        <span role="status" className="appear px-2.5 text-xs text-ink-2">
          {note}
        </span>
      ) : (
        <Btn size="sm" variant="ai" onClick={run}>
          <Sparkles strokeWidth={1.75} />
          Enhance
        </Btn>
      )}
    </div>
  )
}

/** Shown on a block while Enhance runs, in place of the Draft label it's about to get. */
export function Enhancing() {
  return (
    <p className="flex h-8 items-center gap-1.5 text-xs text-ai" role="status">
      <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />
      <span className="shimmer font-medium">Enhancing your text…</span>
    </p>
  )
}
