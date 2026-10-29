"use client"

// PROTOTYPE — Report screen, variant E: Inbox | Document | Sections.
// Holds the in-memory report, the AI "drafting" delay and the
// Capture ↔ report cross-highlight shared by all three columns.

import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState } from "react"
import { PrototypeSwitcher, useVariant } from "@/components/prototype/prototype-switcher"
import { reducer, seedReport, type Action, type Report, type SectionId } from "./data"
import { Inbox } from "./inbox"
import { Document } from "./document"
import { Rail } from "./rail"
import { TopBar } from "./top-bar"
import "./editor.css"

type Hot = { captures: string[]; from: "inbox" | "doc" } | null

/** Incident metadata layouts under review, switched with the prototype bar. */
export type MetaLayout = "table" | "chips" | "side" | "strip"
const VARIANTS: { key: string; name: string; meta: MetaLayout }[] = [
  { key: "E", name: "Incident meta: table", meta: "table" },
  { key: "F", name: "Incident meta: chip row", meta: "chips" },
  { key: "G", name: "Incident meta: side column", meta: "side" },
  { key: "H", name: "Incident meta: strip", meta: "strip" },
]

type Ctx = {
  report: Report
  dispatch: React.Dispatch<Action>
  draft: (ids: string[], only?: SectionId) => void
  hot: Hot
  setHot: (h: Hot) => void
  flash: string | null
  reveal: (anchor: string) => void
  docRef: React.RefObject<HTMLDivElement | null>
  meta: MetaLayout
}

const EditorCtx = createContext<Ctx | null>(null)

export function useEditor() {
  const ctx = useContext(EditorCtx)
  if (!ctx) throw new Error("useEditor outside ReportEditor")
  return ctx
}

const DRAFTING_MS = 1100

export function ReportEditor() {
  const variant = useVariant(VARIANTS)
  const meta = VARIANTS.find((v) => v.key === variant.key)!.meta
  const [report, dispatch] = useReducer(reducer, undefined, seedReport)
  const [hot, setHot] = useState<Hot>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const docRef = useRef<HTMLDivElement>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const draft = useCallback((ids: string[], only?: SectionId) => {
    if (!ids.length) return
    dispatch({ type: "startDrafting", ids })
    setTimeout(() => dispatch({ type: "draft", ids, only }), DRAFTING_MS)
  }, [])

  const reveal = useCallback((anchor: string) => {
    const el = document.getElementById(anchor)
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" })
    setFlash(anchor)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 1400)
  }, [])

  const value = useMemo(
    () => ({ report, dispatch, draft, hot, setHot, flash, reveal, docRef, meta }),
    [report, draft, hot, flash, reveal, meta],
  )

  return (
    <EditorCtx.Provider value={value}>
      <div className="rx flex h-dvh bg-(--canvas) min-h-[640px] min-w-[1180px] flex-col text-[14px]">
        <TopBar />
        <div className="grid min-h-0 flex-1 grid-cols-[336px_minmax(0,1fr)_280px] gap-3 px-3 pb-3">
          <Inbox />
          <Document />
          <Rail />
        </div>
      </div>
      <PrototypeSwitcher
        variants={VARIANTS}
        current={variant}
        onReset={() => dispatch({ type: "reset" })}
        links={[
          { href: "/prototype/report", label: "Report A–D" },
          { href: "/prototype/tonight", label: "Tonight" },
        ]}
      />
    </EditorCtx.Provider>
  )
}
