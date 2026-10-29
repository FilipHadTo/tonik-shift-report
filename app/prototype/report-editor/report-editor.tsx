"use client"

// PROTOTYPE — Report screen, variant E: Inbox | Document | Sections.
// Loads the reviewer's report from the server and saves every manager action there (ticket 09):
// the screen applies an action at once and settles on the server's result. Also holds the AI
// "drafting" delay and the Capture ↔ report cross-highlight shared by all three columns.

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CAPTURES_API, REPORT_API, capturesInScope, demoSession, enhance as enhanceWith, extract, fakeModel, reducer, seedReport, type Action, type EnhanceOutcome, type EnhanceSpan, type EnhanceTarget, type ExtractScope, type PhoneCapture, type Report, type SaveAction, type Scene } from "./data"
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

/** The screen's reducer: the domain's, plus "saved" to settle on what the server stored. */
type ScreenAction = Action | { type: "saved"; report: Report }
const screenReducer = (r: Report, a: ScreenAction) => (a.type === "saved" ? a.report : reducer(r, a))

/** Actions that carry an AI result or a reset never go to the server as they are (see SaveAction). */
const LOCAL_ONLY = new Set<Action["type"]>(["startDrafting", "draftFailed", "extracted", "enhanced", "reset"])

/**
 * Saves manager actions one at a time, in order, and settles the screen on the server's answer once
 * nothing is in flight. Anything still pending (a request, a drafting delay) holds the settle back,
 * so the screen never jumps back to an older state and then forward again.
 */
function useSaving(apply: React.Dispatch<ScreenAction>) {
  const s = useRef({ busy: 0, gen: 0, chain: Promise.resolve(), saved: null as Report | null })

  const settle = useCallback(() => {
    const { busy, saved } = s.current
    if (busy || !saved) return
    s.current.saved = null
    apply({ type: "saved", report: saved })
  }, [apply])

  const hold = useCallback(() => {
    s.current.busy++
  }, [])
  const release = useCallback(() => {
    s.current.busy--
    settle()
  }, [settle])

  /** Queues a request after everything already sent; dropped if a reset came in between. */
  const queue = useCallback((send: () => Promise<Report | null>) => {
    const cur = s.current
    const gen = cur.gen
    cur.busy++
    cur.chain = cur.chain
      .then(async () => {
        if (gen !== cur.gen) return
        const report = await send()
        if (report && gen === cur.gen) cur.saved = report
      })
      // Offline or the database is down: the screen keeps what it shows, so the demo goes on.
      .catch(() => {})
      .finally(release)
  }, [release])

  const save = useCallback(
    (action: SaveAction) =>
      queue(async () => {
        const res = await fetch(REPORT_API, { method: "POST", body: JSON.stringify({ d: demoSession(), action }) })
        // 409: the rules refused it; the answer is the saved report, and the screen shows that.
        return res.ok || res.status === 409 ? ((await res.json()) as Report) : null
      }),
    [queue],
  )

  /** Scene switch / Reset: drops anything not yet sent, then reseeds after what is in flight. */
  const reseed = useCallback(
    (scene: Scene) => {
      s.current.gen++
      s.current.saved = null
      queue(async () => {
        await fetch(REPORT_API, { method: "PUT", body: JSON.stringify({ d: demoSession(), scene }) })
        return null
      })
    },
    [queue],
  )

  return { save, hold, release, reseed }
}

export function useEditor() {
  const ctx = useContext(EditorCtx)
  if (!ctx) throw new Error("useEditor outside ReportEditor")
  return ctx
}

const DRAFTING_MS = 1100
const POLL_MS = 2000

/**
 * Opening the Report screen loads this browser's demo report from the server (ticket 08).
 * The URL's scene only matters on the way in; later switches go through setScene.
 */
export function ReportEditor() {
  const params = useSearchParams()
  const [initial, setInitial] = useState<Report | null>(null)

  useEffect(() => {
    let stop = false
    const scene: Scene = params.get("scene") === "start" ? "start" : "end"
    fetch(`${REPORT_API}?d=${demoSession()}&scene=${scene}`, { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<Report>) : Promise.reject(res.status)))
      // The demo must never die: without the database the scene still opens, just not saved.
      .catch(() => seedReport(scene))
      .then((r) => !stop && setInitial(r))
    return () => {
      stop = true
    }
    // Loaded once per visit, so a scene switch (which rewrites the URL) doesn't reload it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Until the report arrives, only the app background: no stale scene flashes in first.
  if (!initial) return <div className="h-dvh min-h-[640px] min-w-[1180px] bg-canvas" />
  return <Editor initial={initial} />
}

function Editor({ initial }: { initial: Report }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [report, apply] = useReducer(screenReducer, initial)
  const { save, hold, release, reseed } = useSaving(apply)
  /** What the components dispatch: shown at once, saved on the server. */
  const dispatch = useCallback(
    (a: Action) => {
      apply(a)
      if (!LOCAL_ONLY.has(a.type)) save(a as SaveAction)
    },
    [save],
  )
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
    hold()
    apply({ type: "startDrafting", ids })
    const [result] = await Promise.all([extract(r, scope, fakeModel), new Promise((ok) => setTimeout(ok, DRAFTING_MS))])
    apply(result ? { type: "extracted", result } : { type: "draftFailed", ids })
    // The server runs Extract itself on the stored report; it never takes the result from here.
    if (result) save({ type: "draft", scope })
    release()
  }, [hold, release, save])

  const enhance = useCallback(async (target: EnhanceTarget, text: string, span: EnhanceSpan) => {
    // The fake answers at once, so "Already reads clean" shows without a wait, as in E.
    // A real model (ticket 15) will want the Enhancing state in front of this call.
    const outcome = await enhanceWith(latest.current, target, fakeModel, { text, span })
    if (outcome.status !== "drafted") return outcome.status
    setEnhancing("block" in target ? target.block : target.incident)
    hold()
    setTimeout(() => {
      apply({ type: "enhanced", result: outcome.result })
      save({ type: "enhance", target, text, span })
      setEnhancing(null)
      release()
    }, DRAFTING_MS)
    return outcome.status
  }, [hold, release, save])

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
      apply({ type: "reset", scene: s })
      const d = demoSession()
      // Reseeds this demo id only; the seed is deterministic, so the screen doesn't wait for it.
      reseed(s)
      fetch(CAPTURES_API, { method: "PUT", body: JSON.stringify({ d, scene: s, reset: true }) }).catch(
        () => {},
      )
      const sp = new URLSearchParams(params.toString())
      if (s === "end") sp.delete("scene")
      else sp.set("scene", s)
      router.replace(sp.size ? `${pathname}?${sp}` : pathname, { scroll: false })
    },
    [params, pathname, router, reseed],
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
        // Only Captures the report doesn't have yet are applied and saved.
        const fresh = data.captures.filter((p) => !latest.current.captures.some((c) => c.id === p.id))
        if (!stop && fresh.length) dispatch({ type: "receive", captures: fresh })
      } catch {}
    }
    poll()
    const t = setInterval(poll, POLL_MS)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [report.scene, dispatch])

  const value = useMemo(
    () => ({ report, dispatch, draft, enhance, enhancing, hot, setHot, flash, reveal, docRef, setScene, invite, setInvite }),
    [report, dispatch, draft, enhance, enhancing, hot, flash, reveal, setScene, invite],
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
