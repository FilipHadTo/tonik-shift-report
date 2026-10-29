"use client"

// PROTOTYPE Variant A2 — "Split, refined".
// Iteration on A after Filip's review: the report is the main column (review is the job at
// this moment), Captures become a narrower source panel, and the brain-dump composer sits at
// the bottom of that panel where new Captures land. One report outline instead of two lists.

import { useEffect, useRef, useState } from "react"
import { Check, Paperclip, Plus, SendHorizontal, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FIELDS, FIELD_LABEL, gapsIn, sourcesOf, totals, type Incident } from "../../_lib/demo-night"
import { CaptureBody, DRAFT, GapPopover, KIND_LABEL, KindIcon, SOURCE_HIGHLIGHT } from "../../_components/shared"
import type { VariantProps } from "../report-prototype"

export function VariantA2({ night, dispatch }: VariantProps) {
  const [focused, setFocused] = useState<string[]>([])
  const panel = useRef<HTMLDivElement>(null)
  const t = totals(night)
  const confirmed = night.incidents.length - t.unconfirmed
  const filled = night.sections.filter((s) => s.id !== "incidents" && s.draft)
  const empty = night.sections.filter((s) => s.id !== "incidents" && !s.draft)

  useEffect(() => {
    if (!focused[0]) return
    panel.current
      ?.querySelector(`[data-capture="${focused[0]}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [focused])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 lg:h-dvh">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 py-5">
        <div className="me-auto">
          <h1 className="text-lg font-semibold">
            {night.venue} · Night of {night.night}
          </h1>
          <p className="text-sm text-muted-foreground">
            Opened {night.openedAt} by {night.openedBy}
          </p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {confirmed} of {night.incidents.length} Incidents confirmed
          {t.gaps > 0 && ` · ${t.gaps} ${t.gaps === 1 ? "Gap" : "Gaps"} left`}
        </p>
        <Button disabled={!t.ready}>Submit report</Button>
      </header>

      <div className="grid flex-1 gap-10 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_24rem]">
        {/* Main: the report outline */}
        <main className="lg:-me-6 lg:overflow-y-auto lg:pe-6">
          <div className="flex max-w-2xl flex-col gap-12 pt-4 pb-28">
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold">Incidents</h2>
              <p className="text-sm text-muted-foreground">Each one needs your Confirmation before you can submit.</p>
            </div>
            <div className="flex flex-col gap-3">
              {night.incidents.map((i) => (
                <IncidentCard key={i.id} incident={i} dispatch={dispatch} focused={focused} onFocus={setFocused} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold">Rest of the report</h2>
              <p className="text-sm text-muted-foreground">Optional. Drafts go in as they are unless you change them.</p>
            </div>
            <div className="flex flex-col gap-3">
              {filled.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setFocused(s.draft!.sources)}
                  className={cn("group rounded-lg p-4", s.draft!.kept ? "border" : DRAFT)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="me-auto text-sm font-medium">{s.name}</h3>
                    {!s.draft!.kept && (
                      <Button size="xs" variant="ghost" onClick={() => dispatch({ type: "keepSection", section: s.id })}>
                        <Check /> Keep
                      </Button>
                    )}
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`Clear ${s.name}`}
                      onClick={() => dispatch({ type: "clearSection", section: s.id })}
                    >
                      <X />
                    </Button>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.draft!.text}</p>
                </div>
              ))}
            </div>
            <ul className="divide-y rounded-lg border">
              {empty.map((s) => (
                <li key={s.id}>
                  <button className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm hover:bg-muted/50">
                    <span className="me-auto text-muted-foreground">{s.name}</span>
                    <Plus className="size-3.5 text-muted-foreground" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
          </div>
        </main>

        {/* Side: Captures = sources, composer at the bottom where new ones land */}
        <aside
          className="flex flex-col border-t lg:min-h-0 lg:border-t-0 lg:border-s lg:ps-6"
          aria-label="Captures"
        >
          <div className="flex items-baseline gap-2 pt-4 pb-3">
            <h2 className="text-base font-semibold">Captures</h2>
            <span className="text-sm text-muted-foreground">{night.captures.length} tonight, kept as written</span>
          </div>

          <div ref={panel} className="flex flex-1 flex-col gap-2 overflow-y-auto pb-4 lg:-me-2 lg:pe-2">
            {night.captures.map((c) => {
              const staff = c.author.role !== "Closing Manager"
              return (
                <article
                  key={c.id}
                  data-capture={c.id}
                  className={cn("rounded-lg border bg-card p-3 transition-shadow", focused.includes(c.id) && SOURCE_HIGHLIGHT)}
                >
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <KindIcon kind={c.kind} />
                    <span>{KIND_LABEL[c.kind]}</span>
                    {staff && (
                      <span className="font-medium text-foreground">
                        · {c.author.name} ({c.author.role})
                      </span>
                    )}
                    <span className="ms-auto tabular-nums">{c.capturedAt}</span>
                  </div>
                  <CaptureBody capture={c} compact />
                </article>
              )
            })}
          </div>

          <form className="mb-20 rounded-lg border bg-card p-2 lg:mb-6" onSubmit={(e) => e.preventDefault()}>
            <Textarea
              rows={2}
              placeholder="Add anything else from tonight, or paste the group chat…"
              className="min-h-0 resize-none border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <div className="flex justify-between">
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Attach photo, video or document">
                <Paperclip />
              </Button>
              <Button type="submit" size="icon-sm" aria-label="Add Capture">
                <SendHorizontal />
              </Button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  )
}

function IncidentCard({
  incident: i,
  dispatch,
  focused,
  onFocus,
}: {
  incident: Incident
  dispatch: VariantProps["dispatch"]
  focused: string[]
  onFocus: (ids: string[]) => void
}) {
  const gaps = gapsIn(i)
  const active = sourcesOf(i).some((id) => focused.includes(id))

  return (
    <article
      onClick={() => onFocus(sourcesOf(i))}
      className={cn(
        "rounded-lg p-4 transition-colors",
        i.confirmed ? "border bg-card" : DRAFT,
        active && !i.confirmed && "border-foreground/60",
      )}
    >
      <header className="mb-3">
        <h3 className="flex items-center gap-2 font-medium">
          {i.title}
          {i.confirmed && <Check className="size-4" aria-label="Confirmed" />}
        </h3>
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
          <span className="tabular-nums">Captured {i.capturedAt}</span>
          {i.fromStaff && (
            <>
              ·
              <span className="inline-flex items-center gap-1 text-foreground">
                <Users className="size-3" /> {i.fromStaff.name} ({i.fromStaff.role})
              </span>
            </>
          )}
          {i.evidence.length > 0 && <>· {i.evidence.length} photo</>}
        </p>
      </header>

      <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
        {FIELDS.map((f) => {
          const s = i.fields[f]
          return (
            <div key={f} className="contents">
              <dt className="pt-0.5 text-muted-foreground">{FIELD_LABEL[f]}</dt>
              <dd onClick={(e) => e.stopPropagation()}>
                {s.status === "gap" ? (
                  <GapPopover incident={i} field={f} dispatch={dispatch} />
                ) : s.status === "draft" ? (
                  <button className="text-start" onClick={() => onFocus(s.sources)}>
                    {s.value}
                  </button>
                ) : s.status === "unknown" ? (
                  <span className="text-muted-foreground">Unknown</span>
                ) : (
                  <span>{s.value}</span>
                )}
              </dd>
            </div>
          )
        })}
      </dl>

      {!i.confirmed && (
        <footer className="mt-4 flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
          {gaps > 0 && (
            <span className="text-xs text-muted-foreground">
              Fill {gaps === 1 ? "the Gap" : `${gaps} Gaps`} or mark Unknown first
            </span>
          )}
          <Button size="sm" disabled={gaps > 0} onClick={() => dispatch({ type: "confirm", incident: i.id })}>
            Confirm Incident
          </Button>
        </footer>
      )}
    </article>
  )
}
