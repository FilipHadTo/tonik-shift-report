"use client"

// PROTOTYPE — Enhance (story 27). Select text you wrote yourself (a Section block you
// typed, or "What happened" in an Incident you added) and a small bar offers Enhance.
// Only elements marked data-enhance="block:<id>" or "incident:<id>" qualify, so
// Captures and unchecked Drafts can't be enhanced.

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Btn } from "@/components/btn"
import { useEditor } from "./report-editor"

type Sel = { el: HTMLElement; top: number; x: number; start: number; end: number }

const BAR_H = 36

export function EnhanceBar() {
  const { enhance, enhancing, docRef } = useEditor()
  const [sel, setSel] = useState<Sel | null>(null)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    const update = () => {
      const s = window.getSelection()
      if (!s || s.isCollapsed || !s.rangeCount) return setSel(null)
      const range = s.getRangeAt(0)
      const node = range.commonAncestorContainer
      const el = (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>("[data-enhance]")
      if (!el || !range.toString().trim()) return setSel(null)
      // Offsets in the element's plain text, so the rewrite can be spliced back in.
      const pre = document.createRange()
      pre.selectNodeContents(el)
      pre.setEnd(range.startContainer, range.startOffset)
      const start = pre.toString().length
      const r = range.getBoundingClientRect()
      // Above the selection, or below it when there's no room under the column's top edge.
      const docTop = docRef.current?.getBoundingClientRect().top ?? 0
      const top = r.top - BAR_H - 8 > docTop + 8 ? r.top - BAR_H - 8 : r.bottom + 8
      setSel({ el, top, x: r.left + r.width / 2, start, end: start + range.toString().length })
      setNote(null)
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
    const status = await enhance(kind === "block" ? { block: id } : { incident: id }, el.textContent ?? "", { start, end })
    if (status === "unchanged") return setNote("Already reads clean. Nothing to change.")
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
        <span className="px-2.5 text-xs text-ink-2">{note}</span>
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
