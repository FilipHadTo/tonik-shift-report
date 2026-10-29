"use client"

// PROTOTYPE — Report screen, variant E: Inbox | Document | Sections.
// Holds the in-memory report, the AI "drafting" delay and the
// Capture ↔ report cross-highlight shared by all three columns.

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CAPTURES_API, capturesInScope, demoSession, enhance as enhanceWith, extract, fakeModel, reducer, seedReport, type Action, type EnhanceOutcome, type EnhanceSpan, type EnhanceTarget, type ExtractScope, type PhoneCapture, type Report, type Scene } from "./data"
import { Inbox } from "./inbox"
import { Document } from "./document"
import { Rail } from "./rail"
import { TopBar } from "./top-bar"
import { DemoBar } from "./demo-bar"
import "./editor.css"

type Hot = { captures: string[]; from: "inbox" | "doc" } | null

type Ctx = {
  report: Report
  dispatch: React.Dispatch<Action>
  /** Extract with the fake model: one Capture, one Section or everything New (ADR 0007). */
  draft: (scope: ExtractScope) => void
  /** Enhance with the fake model: `text` is what's on screen, `span` the selection in it (story 27). */
  enhance: (target: EnhanceTarget, text: string, span: EnhanceSpan) => Promise<EnhanceOutcome["status"]>
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

  const latest = useRef(report)
  useEffect(() => {
    latest.current = report
  }, [report])

  const draft = useCallback(async (scope: ExtractScope) => {
    const r = latest.current
    const ids = capturesInScope(r, scope).map((c) => c.id)
    if (!ids.length) return
    dispatch({ type: "startDrafting", ids })
    const [result] = await Promise.all([extract(r, scope, fakeModel), new Promise((ok) => setTimeout(ok, DRAFTING_MS))])
    dispatch(result ? { type: "extracted", result } : { type: "draftFailed", ids })
  }, [])

  const enhance = useCallback(async (target: EnhanceTarget, text: string, span: EnhanceSpan) => {
    // The fake answers at once, so "Already reads clean" shows without a wait, as in E.
    // A real model (ticket 15) will want the Enhancing state in front of this call.
    const outcome = await enhanceWith(latest.current, target, fakeModel, { text, span })
    if (outcome.status !== "drafted") return outcome.status
    setEnhancing("block" in target ? target.block : target.incident)
    setTimeout(() => {
      dispatch({ type: "enhanced", result: outcome.result })
      setEnhancing(null)
    }, DRAFTING_MS)
    return outcome.status
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
