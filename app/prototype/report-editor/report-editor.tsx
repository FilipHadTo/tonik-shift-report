"use client"

// PROTOTYPE — Report screen, variant E: Inbox | Document | Sections.
// Loads the reviewer's report from the server and saves every manager action there (ticket 09):
// the screen applies an action at once and settles on the server's result. Also holds the AI
// "drafting" wait, the calm message when the AI is down, and the Capture ↔ report cross-highlight
// shared by all three columns.

import { Suspense, createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CAPTURES_API, DRAFT_API, ENHANCE_API, REPORT_API, capturesInScope, demoSession, reducer, scopeKey, seedReport, type Action, type EnhanceOutcome, type EnhanceSpan, type EnhanceTarget, type ExtractScope, type PhoneCapture, type Report, type SaveAction, type Scene } from "./data"
import { Inbox } from "./inbox"
import { Document } from "./document"
import { Rail } from "./rail"
import { TopBar } from "./top-bar"
import { DemoBar } from "./demo-bar"
import { ReportSkeleton } from "./skeleton"
import "./editor.css"

type Hot = { captures: string[]; from: "inbox" | "doc" } | null

type Ctx = {
  report: Report
  dispatch: React.Dispatch<Action>
  /** Extract on the server (Gemini): one Capture, one Section or everything New (ADR 0007). */
  draft: (scope: ExtractScope) => void
  /** scopeKey of the Draft button showing the calm message (story 24), if any. */
  calm: string | null
  /** Enhance on the server (Gemini): `text` is what's on screen, `span` the selection in it (story 27). */
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
  /** The database couldn't be reached on open: the screen runs on the local seed and nothing is saved. */
  offline: boolean
}

const EditorCtx = createContext<Ctx | null>(null)

/** The screen's reducer: the domain's, plus "saved" to settle on what the server stored. */
type ScreenAction = Action | { type: "saved"; report: Report }
const screenReducer = (r: Report, a: ScreenAction) => (a.type === "saved" ? a.report : reducer(r, a))

/** Actions that carry an AI result or a reset never go to the server as they are (see SaveAction); phone Captures are already stored. */
const LOCAL_ONLY = new Set<Action["type"]>(["startDrafting", "draftFailed", "extracted", "enhanced", "receive", "reset"])

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

  /** Queues a request after everything already sent; dropped if a reset came in between. Resolves once it is done. */
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
    return cur.chain
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

  /**
   * Draft runs Extract on the server, in order with the other saves. Resolves with whether the AI was
   * degraded, or null when the server couldn't be reached.
   */
  const draftOnServer = useCallback(
    async (scope: ExtractScope) => {
      let answer: { degraded: boolean } | null = null
      await queue(async () => {
        const res = await fetch(DRAFT_API, { method: "POST", body: JSON.stringify({ d: demoSession(), scope }) })
        // 409: nothing could be drafted; the answer is the saved report, unchanged.
        if (!res.ok && res.status !== 409) return null
        const out: { report: Report; degraded: boolean } = await res.json()
        answer = { degraded: out.degraded }
        return out.report
      })
      return answer as { degraded: boolean } | null
    },
    [queue],
  )

  /**
   * Enhance runs on the server too, in order with the other saves, so the words it rewrites are the
   * ones typed just before. Resolves with its outcome; "degraded" when the server couldn't be reached.
   */
  const enhanceOnServer = useCallback(
    async (target: EnhanceTarget, text: string, span: EnhanceSpan) => {
      let status: EnhanceOutcome["status"] = "degraded"
      await queue(async () => {
        const res = await fetch(ENHANCE_API, { method: "POST", body: JSON.stringify({ d: demoSession(), target, text, span }) })
        // 409: nothing was saved; the answer is the saved report, unchanged.
        if (!res.ok && res.status !== 409) return null
        const out: { report: Report; status: EnhanceOutcome["status"] } = await res.json()
        status = out.status
        return out.report
      })
      return status
    },
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

  /** The save generation when nothing is in flight, else null: a poll answer is only safe to apply if it is unchanged. */
  const quiet = useCallback(() => (s.current.busy === 0 ? s.current.gen : null), [])

  return { save, draftOnServer, enhanceOnServer, hold, release, reseed, quiet }
}

export function useEditor() {
  const ctx = useContext(EditorCtx)
  if (!ctx) throw new Error("useEditor outside ReportEditor")
  return ctx
}

const DRAFTING_MS = 1100
const CALM_MS = 5000
const POLL_MS = 2000

/**
 * Opening the Report screen loads this browser's demo report from the server (ticket 08).
 * The URL's scene only matters on the way in; later switches go through setScene.
 */
export function ReportEditor() {
  const [loaded, setLoaded] = useState<{ report: Report; offline: boolean } | null>(null)

  useEffect(() => {
    let stop = false
    // Read from the URL here rather than with useSearchParams, so the skeleton is part of the prerendered page.
    const scene: Scene = new URLSearchParams(window.location.search).get("scene") === "start" ? "start" : "end"
    fetch(`${REPORT_API}?d=${demoSession()}&scene=${scene}`, { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<Report>) : Promise.reject(res.status)))
      .then((report) => ({ report, offline: false }))
      // The demo must never die: without the database the scene still opens, just not saved.
      .catch(() => ({ report: seedReport(scene), offline: true }))
      .then((r) => !stop && setLoaded(r))
    return () => {
      stop = true
    }
  }, [])

  // Until the report arrives, the screen's shape: no stale scene flashes in first.
  if (!loaded) return <ReportSkeleton />
  return (
    <Suspense fallback={<ReportSkeleton />}>
      <Editor initial={loaded.report} offline={loaded.offline} />
    </Suspense>
  )
}

function Editor({ initial, offline }: { initial: Report; offline: boolean }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [report, apply] = useReducer(screenReducer, initial)
  const { save, draftOnServer, enhanceOnServer, hold, release, reseed, quiet } = useSaving(apply)
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
  const [calm, setCalm] = useState<string | null>(null)
  const calmTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
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
    const key = scopeKey(scope)
    setCalm((k) => (k === key ? null : k))
    // Held for at least the drafting beat, so a fast answer doesn't flash "Drafting…".
    hold()
    apply({ type: "startDrafting", ids })
    // The server runs Extract on the stored report and the screen settles on its answer.
    const [answer] = await Promise.all([draftOnServer(scope), new Promise((ok) => setTimeout(ok, DRAFTING_MS))])
    // Unreachable server: nothing changed, the Captures go back to New.
    if (!answer) apply({ type: "draftFailed", ids })
    if (!answer || answer.degraded) {
      setCalm(key)
      clearTimeout(calmTimer.current)
      calmTimer.current = setTimeout(() => setCalm(null), CALM_MS)
    }
    release()
  }, [hold, release, draftOnServer])

  const enhance = useCallback(async (target: EnhanceTarget, text: string, span: EnhanceSpan) => {
    // "Enhancing…" for the whole wait, at least the drafting beat so a fast answer doesn't flash it;
    // "Already reads clean" or the calm note come after it. The screen settles on the saved report.
    setEnhancing("block" in target ? target.block : target.incident)
    hold()
    const [status] = await Promise.all([enhanceOnServer(target, text, span), new Promise((ok) => setTimeout(ok, DRAFTING_MS))])
    setEnhancing(null)
    release()
    return status
  }, [hold, release, enhanceOnServer])

  const reveal = useCallback((anchor: string) => {
    const el = document.getElementById(anchor)
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" })
    setFlash(anchor)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 1400)
  }, [])

  // Switching or resetting a scene starts it fresh, phone Captures included (the reseed deletes them).
  const setScene = useCallback(
    (s: Scene) => {
      apply({ type: "reset", scene: s })
      // Reseeds this demo id only; the seed is deterministic, so the screen doesn't wait for it.
      reseed(s)
      const sp = new URLSearchParams(params.toString())
      if (s === "end") sp.delete("scene")
      else sp.set("scene", s)
      router.replace(sp.size ? `${pathname}?${sp}` : pathname, { scroll: false })
    },
    [params, pathname, router, reseed],
  )

  // Live Inbox (story 13): phones write into this demo id's stored report; poll for what they sent.
  // Polls wait while anything is in flight, and an answer that crossed a Reset or scene switch is dropped,
  // so Captures the reseed just deleted never come back.
  useEffect(() => {
    let stop = false
    const d = demoSession()
    async function poll() {
      const gen = quiet()
      if (gen === null) return
      try {
        const res = await fetch(`${CAPTURES_API}?d=${d}`, { cache: "no-store" })
        if (!res.ok) return
        const data: { captures: PhoneCapture[] } = await res.json()
        // Already stored on the server: shown here only, never saved again.
        const fresh = data.captures.filter((p) => !latest.current.captures.some((c) => c.id === p.id))
        if (!stop && fresh.length && quiet() === gen) apply({ type: "receive", captures: fresh })
      } catch {}
    }
    poll()
    const t = setInterval(poll, POLL_MS)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [quiet])

  const value = useMemo(
    () => ({ report, dispatch, draft, calm, enhance, enhancing, hot, setHot, flash, reveal, docRef, setScene, invite, setInvite, offline }),
    [report, dispatch, draft, calm, enhance, enhancing, hot, flash, reveal, setScene, invite, offline],
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
