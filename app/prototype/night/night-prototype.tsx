"use client"

// PROTOTYPE — "Night walkthrough". One calm column: the report writes itself as Captures
// arrive; raw Captures sit behind a toggle; sources are citation chips, not a second panel.
// Scenario bar (top) is prototype chrome: ← → move through the Night.

import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { Check, ChevronLeft, ChevronRight, Lock, Mic, Moon, Paperclip, Plus, SendHorizontal, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  LOCATIONS,
  gapsIn,
  nightReducer,
  nowHHMM,
  seedNight,
  totals,
  type Action,
  type Capture,
  type Incident,
  type IncidentField,
  type Night,
} from "../_lib/demo-night"
import { CaptureBody, DRAFT, GapPopover, KIND_LABEL, KindIcon } from "../_components/shared"

type Step = {
  clock: string
  device: "phone" | "laptop" | "none"
  captures: string[]
  incidents: string[]
  sections?: boolean
  arriving?: { capture: string; incident: string }
  caption: string
}

const STEPS: Step[] = [
  {
    clock: "22:00",
    device: "none",
    captures: [],
    incidents: [],
    caption:
      "Doors open. Nothing is logged yet, so there is no report. Nobody has to create one: it starts itself with the first Capture.",
  },
  {
    clock: "23:40",
    device: "phone",
    captures: ["c1"],
    incidents: ["i1"],
    arriving: { capture: "c1", incident: "i1" },
    caption:
      "Alex (Closing Manager) photographs a smashed window on their phone. That first Capture opens tonight's report. The AI drafts an Incident, but no Capture says which window, so Location stays blank (a Gap) instead of being guessed.",
  },
  {
    clock: "00:52",
    device: "phone",
    captures: ["c1", "c2"],
    incidents: ["i1", "i2"],
    arriving: { capture: "c2", incident: "i2" },
    caption:
      "Marek on the door has no account. He opened the team link once and typed his name. His note lands in the report under his name, and the AI drafts a second Incident from it.",
  },
  {
    clock: "01:15",
    device: "phone",
    captures: ["c1", "c2", "c3"],
    incidents: ["i1", "i2", "i3"],
    arriving: { capture: "c3", incident: "i3" },
    caption: "A fight at the bar. Alex records a 14-second voice note. It's transcribed, kept word for word, and drafted.",
  },
  {
    clock: "02:10",
    device: "laptop",
    captures: ["c1", "c2", "c3", "c4"],
    incidents: ["i1", "i2", "i3", "i4"],
    sections: true,
    arriving: { capture: "c4", incident: "i4" },
    caption:
      "Close. Alex sits down at the laptop and pastes the staff group chat. The AI pulls a stolen phone out of it (the time is vague, so it's another Gap) and fills the other Sections.",
  },
  {
    clock: "02:15",
    device: "laptop",
    captures: ["c1", "c2", "c3", "c4"],
    incidents: ["i1", "i2", "i3", "i4"],
    sections: true,
    caption:
      "Your turn, on the laptop. Dashed = the AI wrote it and nobody has checked it. Tap a source chip to see the original Capture. Fill both blanks, confirm each Incident, then submit. You can also type something new in the box at the bottom, e.g. \"Guy fainted near the toilets around 1, friends took him home\", and watch it become an Incident.",
  },
]

function snapshot(step: number): Night {
  const full = seedNight()
  const s = STEPS[step]
  return {
    ...full,
    captures: full.captures.filter((c) => s.captures.includes(c.id)),
    incidents: full.incidents.filter((i) => s.incidents.includes(i.id)),
    sections: s.sections ? full.sections : full.sections.map((x) => ({ ...x, draft: undefined })),
  }
}

const DRAFTING_MS = 1600

export function NightPrototype() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const initial = Math.min(Math.max(Number(params.get("step") ?? 0), 0), STEPS.length - 1)

  const [step, setStep] = useState(initial)
  const [night, setNight] = useState(() => snapshot(initial))
  const [drafting, setDrafting] = useState(false)
  const [tab, setTab] = useState<"report" | "captures">("report")
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)

  const dispatch: React.Dispatch<Action> = (a) => setNight((n) => nightReducer(n, a))

  const go = useCallback(
    (delta: number) => {
      const next = Math.min(Math.max(step + delta, 0), STEPS.length - 1)
      if (next === step) return
      setStep(next)
      setNight(snapshot(next))
      setSubmittedAt(null)
      router.replace(`${pathname}?step=${next}`, { scroll: false })
      if (delta > 0 && STEPS[next].arriving) {
        setDrafting(true)
        setTimeout(() => setDrafting(false), DRAFTING_MS)
      } else setDrafting(false)
    },
    [step, pathname, router],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement | null)?.closest("input, textarea")) return
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  const [typed, setTyped] = useState<{ capture: string; incident: string } | null>(null)

  function addFromLaptop(text: string) {
    const capture = manualCapture(night, text, STEPS[step].clock)
    const incident = fakeDraft(capture)
    setTab("report")
    setNight((n) => ({ ...n, captures: [...n.captures, capture], incidents: [...n.incidents, incident] }))
    setTyped({ capture: capture.id, incident: incident.id })
    setTimeout(() => setTyped(null), DRAFTING_MS)
    requestAnimationFrame(() =>
      document.getElementById("drafting")?.scrollIntoView({ behavior: "smooth", block: "center" }),
    )
  }

  function addManualIncident() {
    const incident = blankIncident(STEPS[step].clock)
    setNight((n) => ({ ...n, incidents: [...n.incidents, incident] }))
    requestAnimationFrame(() =>
      document.getElementById(`inc-${incident.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
    )
  }

  function writeSection(id: string, text: string) {
    setNight((n) => ({
      ...n,
      sections: n.sections.map((x) => (x.id === id ? { ...x, draft: { text, sources: [], kept: true } } : x)),
    }))
  }

  const toReview = [...night.incidents.filter((i) => !i.confirmed)].sort((a, b) => gapsIn(b) - gapsIn(a))
  const confirmedIncidents = night.incidents.filter((i) => i.confirmed)

  function reviewNext() {
    const next = toReview[0]
    if (next) document.getElementById(`inc-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const s = STEPS[step]
  const arriving = typed ?? (drafting ? s.arriving : undefined)
  const arrivingCapture = arriving && night.captures.find((c) => c.id === arriving.capture)
  const isEmpty = night.captures.length === 0
  const reviewing = step === STEPS.length - 1
  const t = totals(night)

  return (
    <div className="flex min-h-dvh flex-col">
      <ScenarioBar step={step} clock={s.clock} device={s.device} caption={s.caption} onGo={go} />

      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3">
          <div className="me-auto leading-tight">
            <p className="text-sm font-semibold">Halo Club</p>
            <p className="text-xs text-muted-foreground">
              Tonight · {night.night}
              {!isEmpty && ` · opened ${night.openedAt} by ${night.openedBy}`}
            </p>
          </div>
          {submittedAt ? (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="size-3.5" /> Submitted {submittedAt}
            </span>
          ) : reviewing ? (
            <>
              {toReview.length > 0 && (
                <Button variant="outline" size="sm" onClick={reviewNext}>
                  Review next · {toReview.length} left
                </Button>
              )}
              <SubmitButton ready={t.ready} onSubmit={() => setSubmittedAt(nowHHMM())} />
            </>
          ) : (
            !isEmpty && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-foreground motion-safe:animate-pulse" /> Live
              </span>
            )
          )}
        </div>
        {(
          <div className="mx-auto flex max-w-5xl gap-4 px-5 text-sm">
            {(["report", "captures"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={cn(
                  "-mb-px border-b-2 pb-2 capitalize",
                  tab === k ? "border-foreground font-medium" : "border-transparent text-muted-foreground",
                )}
              >
                {k === "captures" ? `Captures ${night.captures.length}` : "Report"}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-12 px-5 pt-8 pb-48 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <Outline night={night} hidden={tab === "captures"} />
        <main className="flex max-w-2xl flex-col">
          {tab === "captures" ? (
            isEmpty ? (
              <p className="text-sm text-muted-foreground">No Captures yet.</p>
            ) : (
              <CapturesList captures={night.captures} />
            )
          ) : (
            <>
              <StatusLine night={night} reviewing={reviewing} submitted={!!submittedAt} drafting={!!arriving} />

              <section id="sec-incidents" className="mt-10 mb-6 flex scroll-mt-40 flex-col gap-3">
                <SectionHeading
                  title="Incidents"
                  note={
                    toReview.length
                      ? `${toReview.length} AI ${toReview.length === 1 ? "draft" : "drafts"} to check. Each one needs your Confirmation.`
                      : night.incidents.length
                        ? "All confirmed."
                        : "None yet. Time, place, type and what happened, with evidence if there is any."
                  }
                />
                {toReview
                  .filter((i) => i.id !== arriving?.incident)
                  .map((i) => (
                    <IncidentCard
                      key={i.id}
                      incident={i}
                      captures={night.captures}
                      dispatch={dispatch}
                      fresh={i.id === s.arriving?.incident || i.id === night.incidents.at(-1)?.id}
                      locked={!!submittedAt}
                    />
                  ))}
                {arrivingCapture && <DraftingCard capture={arrivingCapture} />}
                {confirmedIncidents.length > 0 && (
                  <ul className="divide-y rounded-xl border">
                    {confirmedIncidents.map((i) => (
                      <ConfirmedRow key={i.id} incident={i} />
                    ))}
                  </ul>
                )}
                {!submittedAt && (
                  <button
                    onClick={addManualIncident}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-start text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  >
                    <Plus className="size-4" /> Add an Incident yourself
                  </button>
                )}
              </section>

              {night.sections
                .filter((x) => x.id !== "incidents")
                .map((x) => (
                  <SectionBlock
                    key={x.id}
                    section={x}
                    locked={!!submittedAt}
                    onKeep={() => dispatch({ type: "keepSection", section: x.id })}
                    onWrite={(text) => writeSection(x.id, text)}
                  />
                ))}

              {submittedAt && (
                <p className="border-t pt-4 text-xs text-muted-foreground">
                  AI-assisted. Reviewed and submitted by {night.manager.name} at {submittedAt}. Changes only as an Addendum.
                </p>
              )}
            </>
          )}
        </main>
      </div>

      {!submittedAt && <Composer onAdd={addFromLaptop} />}
    </div>
  )
}

function blankIncident(clock: string): Incident {
  return {
    id: `m${Date.now()}`,
    title: "New Incident",
    capturedAt: clock,
    confirmed: false,
    evidence: [],
    manual: true,
    fields: {
      occurredAt: { status: "gap", sources: [] },
      location: { status: "gap", sources: [] },
      type: { status: "gap", sources: [] },
      description: { status: "gap", sources: [] },
    },
  }
}

function manualCapture(night: Night, text: string, clock: string): Capture {
  return { id: `c${Date.now()}`, kind: "text", capturedAt: clock, author: night.manager, text }
}

/** PROTOTYPE stand-in for the AI: keyword-matches a typed Capture into an Incident Draft, leaving Gaps. */
function fakeDraft(c: Capture): Incident {
  const text = c.text.toLowerCase()
  const types: [RegExp, string][] = [
    [/fight|punch|hit/, "Fight/assault"],
    [/faint|collaps|injur|hurt|blood/, "Injury/medical"],
    [/stole|stolen|nicked|theft/, "Theft"],
    [/broke|smash|damage/, "Property damage"],
    [/kicked out|refused|eject/, "Ejection/refused entry"],
    [/drunk|intox/, "Intoxication"],
  ]
  const type = types.find(([re]) => re.test(text))?.[1]
  const location = LOCATIONS.find((l) => text.includes(l.toLowerCase().replace("main ", "")))
  const time = text.match(/\b(\d{1,2}):(\d{2})\b/)?.[0] ?? text.match(/around (\d{1,2})\b/)?.[1]?.padStart(2, "0").concat(":00")
  const src = [c.id]
  return {
    id: `i${c.id}`,
    title: c.text.split(/[,.]/)[0].slice(0, 48),
    capturedAt: c.capturedAt,
    confirmed: false,
    evidence: [],
    fields: {
      occurredAt: time ? { status: "draft", value: time, sources: src } : { status: "gap", hint: "No time in what you wrote.", sources: src },
      location: location ? { status: "draft", value: location, sources: src } : { status: "gap", hint: "No place in what you wrote.", sources: src },
      type: type ? { status: "draft", value: type, sources: src } : { status: "gap", sources: src },
      description: { status: "draft", value: c.text, sources: src },
    },
  }
}

/** One sentence that says where the Night stands, so nobody has to read the whole page to know. */
function StatusLine({ night, reviewing, submitted, drafting }: { night: Night; reviewing: boolean; submitted: boolean; drafting: boolean }) {
  const t = totals(night)
  const withGaps = night.incidents.filter((i) => gapsIn(i) > 0).length
  const readyToConfirm = night.incidents.filter((i) => !i.confirmed && gapsIn(i) === 0).length
  const staff = new Set(night.captures.filter((c) => c.author.role !== "Closing Manager").map((c) => c.author.name)).size

  let text: string
  if (submitted) text = "Submitted and locked. The next team can read it."
  else if (night.captures.length === 0 && night.incidents.length === 0)
    text = "Nothing logged tonight yet. Type below, or write straight into any section."
  else if (drafting) text = "Reading the new Capture…"
  else if (!reviewing)
    text = `${night.captures.length} ${night.captures.length === 1 ? "Capture" : "Captures"} so far${staff ? `, ${staff} from staff` : ""}. ${night.incidents.length} ${night.incidents.length === 1 ? "Incident" : "Incidents"} drafted. Nothing for you to do until close.`
  else if (t.ready) text = "Everything is confirmed. Ready to submit."
  else
    text = [
      withGaps && `${withGaps} ${withGaps === 1 ? "Incident is" : "Incidents are"} missing something`,
      readyToConfirm && `${readyToConfirm} ready to confirm`,
    ]
      .filter(Boolean)
      .join(", ")
      .concat(".")

  return <p className="text-xl font-medium tracking-tight text-pretty">{text}</p>
}

// --- pieces ---

function DraftingCard({ capture }: { capture: Capture }) {
  return (
    <div id="drafting" className={cn("flex flex-col gap-2 rounded-xl p-4 animate-in fade-in", DRAFT)}>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <KindIcon kind={capture.kind} />
        {capture.author.name}
        {capture.author.role !== "Closing Manager" && ` (${capture.author.role})`} added a {KIND_LABEL[capture.kind].toLowerCase()}
        {" · "}drafting…
      </p>
      <span className="h-3 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
      <span className="h-3 w-1/2 rounded bg-muted motion-safe:animate-pulse" />
    </div>
  )
}

const BLANK: Record<IncidentField, string> = {
  occurredAt: "when?",
  location: "where?",
  type: "what kind?",
  description: "What happened?",
}

function IncidentCard({
  incident: i,
  captures,
  dispatch,
  fresh,
  locked,
}: {
  incident: Incident
  captures: Capture[]
  dispatch: React.Dispatch<Action>
  fresh: boolean
  locked: boolean
}) {
  const gaps = gapsIn(i)
  const sources = captures.filter((c) => Object.values(i.fields).some((f) => "sources" in f && f.sources.includes(c.id)))

  function fact(field: IncidentField, className?: string) {
    const f = i.fields[field]
    if (f.status === "gap")
      return locked ? null : (
        <GapPopover incident={i} field={field} dispatch={dispatch} className="py-0">
          {BLANK[field]}
        </GapPopover>
      )
    if (f.status === "unknown") return <span className={cn("text-muted-foreground", className)}>unknown</span>
    return <span className={className}>{f.value}</span>
  }

  return (
    <article
      id={`inc-${i.id}`}
      className={cn(
        "flex scroll-mt-40 flex-col gap-3 rounded-xl p-4",
        i.confirmed || i.manual ? "border" : DRAFT,
        fresh && "animate-in fade-in slide-in-from-bottom-2 duration-300",
      )}
    >
      {!locked && (
        <p className="flex items-center gap-1.5 text-xs">
          <span className="font-medium">{i.manual ? "Written by you" : "AI draft"}</span>
          <span className="text-muted-foreground">
            · {gaps > 0 ? `missing ${missing(i)}` : "ready for you to confirm"}
          </span>
        </p>
      )}
      <div className="flex items-start gap-3">
        <div className="me-auto">
          <h3 className="font-medium">{i.title}</h3>
          <p className="text-sm text-muted-foreground">
            {fact("type")} · {fact("location", "text-foreground")}
          </p>
        </div>
        <span className="text-sm tabular-nums">{fact("occurredAt")}</span>
      </div>

      <p className="text-sm leading-6">{fact("description")}</p>

      <div className="flex flex-wrap items-center gap-2">
        {sources.map((c) => (
          <SourceChip key={c.id} capture={c} />
        ))}
        <span className="ms-auto flex items-center gap-3">
          {i.confirmed ? (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Check className="size-4" /> Confirmed
            </span>
          ) : (
            !locked && (
              <>
                <Button size="sm" disabled={gaps > 0} onClick={() => dispatch({ type: "confirm", incident: i.id })}>
                  Confirm
                </Button>
              </>
            )
          )}
        </span>
      </div>
    </article>
  )
}

function missing(i: Incident) {
  const names: Record<IncidentField, string> = { occurredAt: "time", location: "location", type: "type", description: "description" }
  return (Object.keys(i.fields) as IncidentField[])
    .filter((f) => i.fields[f].status === "gap")
    .map((f) => names[f])
    .join(", ")
}

function ConfirmedRow({ incident: i }: { incident: Incident }) {
  const v = (f: IncidentField) => {
    const x = i.fields[f]
    return x.status === "draft" || x.status === "filled" ? x.value : "unknown"
  }
  return (
    <li id={`inc-${i.id}`} className="flex items-center gap-3 px-4 py-3 text-sm">
      <Check className="size-4 shrink-0" aria-label="Confirmed" />
      <span className="me-auto truncate font-medium">{i.title}</span>
      <span className="shrink-0 text-muted-foreground tabular-nums">
        {v("occurredAt")} · {v("location")}
      </span>
    </li>
  )
}

function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </div>
  )
}

/** Every Section of the template is always there: filled ones expanded, empty ones one line you can write into. */
function SectionBlock({
  section: x,
  locked,
  onKeep,
  onWrite,
}: {
  section: Night["sections"][number]
  locked: boolean
  onKeep: () => void
  onWrite: (text: string) => void
}) {
  const [writing, setWriting] = useState(false)
  const [text, setText] = useState("")

  if (x.draft)
    return (
      <section id={`sec-${x.id}`} className="my-6 flex scroll-mt-40 flex-col gap-3">
        <SectionHeading title={x.name} />
        <div className={cn("rounded-xl p-4", x.draft.kept || locked ? "border" : DRAFT)}>
          {!x.draft.kept && !locked && (
            <p className="mb-2 flex items-center gap-1.5 text-xs">
              <span className="font-medium">AI draft</span>
              <span className="text-muted-foreground">· goes in as is unless you change it</span>
              <Button size="xs" variant="ghost" className="ms-auto" onClick={onKeep}>
                <Check /> Looks right
              </Button>
            </p>
          )}
          <p className="text-sm leading-6">{x.draft.text}</p>
        </div>
      </section>
    )

  return (
    <section id={`sec-${x.id}`} className="scroll-mt-40 border-b last:border-b-0">
      {writing ? (
        <form
          className="flex flex-col gap-2 rounded-xl border p-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (text.trim()) onWrite(text.trim())
          }}
        >
          <p className="text-sm font-medium">{x.name}</p>
          <Textarea autoFocus rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Anything about ${x.name.toLowerCase()} tonight?`} />
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setWriting(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!text.trim()}>
              Add to report
            </Button>
          </div>
        </form>
      ) : (
        <button
          disabled={locked}
          onClick={() => setWriting(true)}
          className="group flex w-full items-center gap-2 rounded-lg px-1 py-2 text-start text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none"
        >
          <span className="me-auto">{x.name}</span>
          {!locked && (
            <span className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
              <Plus className="size-3.5" /> Write
            </span>
          )}
        </button>
      )}
    </section>
  )
}

/** Table of contents = the report template, with what is still waiting on you. */
function Outline({ night, hidden }: { night: Night; hidden: boolean }) {
  const toReview = night.incidents.filter((i) => !i.confirmed).length
  const go = (id: string) => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  return (
    <nav className={cn("hidden flex-col gap-0.5 self-start text-sm lg:sticky lg:top-40 lg:flex", hidden && "lg:invisible")} aria-label="Report outline">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Report</p>
      {[...night.sections].sort((a, b) => Number(b.id === "incidents") - Number(a.id === "incidents")).map((x) => {
        const state =
          x.id === "incidents"
            ? night.incidents.length === 0
              ? "empty"
              : toReview
                ? "draft"
                : "done"
            : !x.draft
              ? "empty"
              : x.draft.kept
                ? "done"
                : "draft"
        return (
          <button
            key={x.id}
            onClick={() => go(x.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1 text-start hover:bg-muted/60",
              state === "empty" && "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                state === "empty" && "border border-muted-foreground/40",
                state === "draft" && "border border-dashed border-foreground",
                state === "done" && "bg-foreground",
              )}
            />
            <span className="me-auto truncate">{x.name}</span>
            {x.id === "incidents" && toReview > 0 && <span className="text-xs tabular-nums">{toReview}</span>}
          </button>
        )
      })}
      <div className="mt-6 flex flex-col gap-1.5 px-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full border border-dashed border-foreground" /> AI draft, not checked
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-foreground" /> Checked by you
        </span>
      </div>
    </nav>
  )
}

function SourceChip({ capture: c }: { capture: Capture }) {
  const staff = c.author.role !== "Closing Manager"
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
        <KindIcon kind={c.kind} />
        <span className={cn(staff && "font-medium text-foreground")}>
          {staff ? `${c.author.name} (${c.author.role})` : c.author.name.split(" ")[0]}
        </span>
        <span className="tabular-nums">· logged {c.capturedAt}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <p className="text-xs text-muted-foreground">
          {KIND_LABEL[c.kind]} by {c.author.name} at {c.capturedAt}, kept as written
        </p>
        <CaptureBody capture={c} compact />
      </PopoverContent>
    </Popover>
  )
}

function CapturesList({ captures }: { captures: Capture[] }) {
  return (
    <ol className="flex flex-col gap-6">
      {captures.map((c) => (
        <li key={c.id} className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <KindIcon kind={c.kind} /> {c.author.name}
            {c.author.role !== "Closing Manager" && ` (${c.author.role})`} · {c.capturedAt}
          </p>
          <CaptureBody capture={c} compact />
        </li>
      ))}
    </ol>
  )
}

function SubmitButton({ ready, onSubmit }: { ready: boolean; onSubmit: () => void }) {
  const [checked, setChecked] = useState(false)
  return (
    <Popover>
      <PopoverTrigger disabled={!ready} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
        Submit
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1" />
          I reviewed this report and it matches what I remember.
        </label>
        <Button disabled={!checked} onClick={onSubmit}>
          Submit and lock
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function Composer({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("")
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-linear-to-t from-background from-50% to-transparent px-5 pt-10 pb-5">
      <form
        className="pointer-events-auto mx-auto flex max-w-2xl items-end gap-1 rounded-2xl border bg-background p-2 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          onAdd(text.trim())
          setText("")
        }}
      >
        <Button type="button" variant="ghost" size="icon" aria-label="Attach photo, video or document">
          <Paperclip />
        </Button>
        <Textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder="Log what happened, or paste the group chat…"
          className="max-h-40 min-h-9 flex-1 resize-none border-0 bg-transparent py-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        {text.trim() ? (
          <Button type="submit" size="icon" aria-label="Add Capture">
            <SendHorizontal />
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="icon" aria-label="Dictate">
            <Mic />
          </Button>
        )}
      </form>
    </div>
  )
}

/** PROTOTYPE chrome — narrates the scenario. Not part of the design. */
function ScenarioBar({
  step,
  clock,
  device,
  caption,
  onGo,
}: {
  step: number
  clock: string
  device: Step["device"]
  caption: string
  onGo: (d: number) => void
}) {
  const { resolvedTheme, setTheme } = useTheme()
  if (process.env.NODE_ENV === "production") return null
  const btn = "grid size-8 shrink-0 place-items-center rounded-full hover:bg-background/15 disabled:opacity-30"
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-3xl items-start gap-3 px-4 py-3">
        <button className={btn} onClick={() => onGo(-1)} disabled={step === 0} aria-label="Previous step">
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex-1">
          <p className="font-mono text-xs opacity-60">
            PROTO · step {step + 1}/{STEPS.length} · {clock}
            {device !== "none" && ` · on ${device === "phone" ? "a phone" : "the laptop"}`}
          </p>
          <p className="text-sm text-pretty">{caption}</p>
        </div>
        <button className={btn} onClick={() => onGo(1)} disabled={step === STEPS.length - 1} aria-label="Next step">
          <ChevronRight className="size-4" />
        </button>
        <button className={btn} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle light/dark">
          <Sun className="hidden size-4 dark:block" />
          <Moon className="size-4 dark:hidden" />
        </button>
      </div>
    </div>
  )
}
