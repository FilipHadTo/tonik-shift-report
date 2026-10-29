"use client"

// PROTOTYPE — Report screen, variant E: Inbox | Document | Sections.
// Holds the in-memory report, the AI "drafting" delay and the
// Capture ↔ report cross-highlight shared by all three columns.

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CAPTURES_API, demoSession, reducer, seedReport, type Action, type PhoneCapture, type Report, type Scene, type SectionId } from "./data"
import { Inbox } from "./inbox"
import { Document } from "./document"
import { Rail } from "./rail"
import { TopBar } from "./top-bar"
import { DemoBar } from "./demo-bar"
import "./editor.css"

type Hot = { captures: string[]; from: "inbox" | "doc" } | null

/** What Enhance rewrites: a Section block or an Incident's "What happened". */
export type EnhanceTarget = { block: string } | { incident: string }

type Ctx = {
  report: Report
  dispatch: React.Dispatch<Action>
  draft: (ids: string[], only?: SectionId) => void
  enhance: (target: EnhanceTarget, text: string) => void
  /** Id of the block or Incident being enhanced right now. */
  enhancing: string | null
  hot: Hot
  setHot: (h: Hot) => void
  flash: string | null
  reveal: (anchor: string) => void
  docRef: React.RefObject<HTMLDivElement | null>
  setScene: (scene: Scene) => void
  /** Invite staff popover in the top bar. `halo` when the onboarding opened it, to show where it lives. */
  invite: { open: boolean; halo: boolean }
  setInvite: (v: { open: boolean; halo: boolean }) => void
}

const EditorCtx = createContext<Ctx | null>(null)

export function useEditor() {
  const ctx = useContext(EditorCtx)
  if (!ctx) throw new Error("useEditor outside ReportEditor")
  return ctx
}

const DRAFTING_MS = 1100
const POLL_MS = 2000

export function ReportEditor() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const scene: Scene = params.get("scene") === "start" ? "start" : "end"
  const [report, dispatch] = useReducer(reducer, scene, seedReport)
  const [hot, setHot] = useState<Hot>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [enhancing, setEnhancing] = useState<string | null>(null)
  const [invite, setInvite] = useState({ open: false, halo: false })
  const docRef = useRef<HTMLDivElement>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const draft = useCallback((ids: string[], only?: SectionId) => {
    if (!ids.length) return
    dispatch({ type: "startDrafting", ids })
    setTimeout(() => dispatch({ type: "draft", ids, only }), DRAFTING_MS)
  }, [])

  const enhance = useCallback((target: EnhanceTarget, text: string) => {
    const id = "block" in target ? target.block : target.incident
    setEnhancing(id)
    setTimeout(() => {
      dispatch(
        "block" in target
          ? { type: "enhance", block: target.block, text }
          : { type: "enhanceIncident", incident: target.incident, text },
      )
      setEnhancing(null)
    }, DRAFTING_MS)
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

  // Switching or resetting a scene starts it fresh, phone Captures included.
  const setScene = useCallback(
    (s: Scene) => {
      dispatch({ type: "reset", scene: s })
      fetch(CAPTURES_API, { method: "PUT", body: JSON.stringify({ d: demoSession(), scene: s, reset: true }) }).catch(
        () => {},
      )
      const sp = new URLSearchParams(params.toString())
      if (s === "end") sp.delete("scene")
      else sp.set("scene", s)
      router.replace(sp.size ? `${pathname}?${sp}` : pathname, { scroll: false })
    },
    [params, pathname, router],
  )

  // Live Inbox (story 13): point phones at this scene, then poll for the Captures they send.
  // A reload keeps the scene's phone Captures; only Reset or a switch empties them.
  useEffect(() => {
    let stop = false
    const d = demoSession()
    fetch(CAPTURES_API, { method: "PUT", body: JSON.stringify({ d, scene: report.scene }) }).catch(() => {})
    async function poll() {
      try {
        const res = await fetch(`${CAPTURES_API}?d=${d}&scene=${report.scene}`, { cache: "no-store" })
        const data: { captures: PhoneCapture[] } = await res.json()
        if (!stop && data.captures.length) dispatch({ type: "receive", captures: data.captures })
      } catch {}
    }
    poll()
    const t = setInterval(poll, POLL_MS)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [report.scene])

  const value = useMemo(
    () => ({ report, dispatch, draft, enhance, enhancing, hot, setHot, flash, reveal, docRef, setScene, invite, setInvite }),
    [report, draft, enhance, enhancing, hot, flash, reveal, setScene, invite],
  )

  return (
    <EditorCtx.Provider value={value}>
      <div className="rx flex h-dvh bg-canvas min-h-[640px] min-w-[1180px] flex-col text-[14px]">
        <TopBar />
        <div className="grid min-h-0 flex-1 grid-cols-[336px_minmax(0,1fr)_280px] gap-3 px-3 pb-3">
          <Inbox />
          <Document />
          <Rail />
        </div>
      </div>
      <DemoBar />
    </EditorCtx.Provider>
  )
}
