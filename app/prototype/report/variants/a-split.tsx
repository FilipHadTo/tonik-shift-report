"use client"

// PROTOTYPE Variant A — "Split: Captures | Rail".
// The spec's literal layout: capture surface + verbatim Captures on the left,
// a rail of Incidents and Sections on the right. Confirmation happens inline on the rail.

import { useEffect, useState } from "react"
import { Check, ChevronRight, Paperclip, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  FIELDS,
  FIELD_LABEL,
  gapsIn,
  sourcesOf,
  totals,
  type Incident,
} from "../../_lib/demo-night"
import { CaptureBody, DRAFT, GapPopover, KIND_LABEL, KindIcon, SOURCE_HIGHLIGHT } from "../../_components/shared"
import type { VariantProps } from "../report-prototype"

export function VariantA({ night, dispatch }: VariantProps) {
  const [focused, setFocused] = useState<string[]>([])
  const t = totals(night)

  useEffect(() => {
    if (focused[0]) document.getElementById(`a-cap-${focused[0]}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [focused])

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-6 py-3">
        <div>
          <h1 className="font-semibold">
            {night.venue} · Night of {night.night}
          </h1>
          <p className="text-xs text-muted-foreground">
            Opened {night.openedAt} by {night.openedBy} · {night.captures.length} Captures
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {t.unconfirmed} to confirm · {t.gaps} {t.gaps === 1 ? "Gap" : "Gaps"}
          </span>
          <Button disabled={!t.ready}>Submit report</Button>
        </div>
      </header>

      <div className="grid flex-1 lg:grid-cols-[1fr_28rem]">
        {/* Left: capture surface + Captures */}
        <section className="flex flex-col gap-4 border-r p-6 pb-24">
          <div className="rounded-lg border bg-card p-3">
            <Textarea
              placeholder="Brain-dump the rest of the night, or paste the group chat…"
              className="min-h-20 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <div className="mt-2 flex justify-between">
              <Button variant="ghost" size="sm">
                <Paperclip /> Attach
              </Button>
              <Button size="sm" variant="secondary">
                Add Capture
              </Button>
            </div>
          </div>

          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Captures tonight</h2>
          <ol className="flex flex-col gap-3">
            {night.captures.map((c) => (
              <li
                key={c.id}
                id={`a-cap-${c.id}`}
                className={cn(
                  "rounded-lg border bg-card p-3 transition-shadow",
                  focused.includes(c.id) && SOURCE_HIGHLIGHT,
                )}
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <KindIcon kind={c.kind} />
                  <span>{KIND_LABEL[c.kind]}</span>
                  <span>·</span>
                  <span className={cn(c.author.role !== "Closing Manager" && "font-medium text-foreground")}>
                    {c.author.name} ({c.author.role})
                  </span>
                  <span className="ml-auto tabular-nums">{c.capturedAt}</span>
                </div>
                <CaptureBody capture={c} compact />
              </li>
            ))}
          </ol>
        </section>

        {/* Right: rail */}
        <aside className="flex flex-col gap-6 p-6 pb-24 lg:sticky lg:top-0 lg:max-h-dvh lg:overflow-y-auto">
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Incidents · {night.incidents.length}
            </h2>
            {night.incidents.map((i) => (
              <IncidentCard key={i.id} incident={i} dispatch={dispatch} onFocus={setFocused} focused={focused} />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Sections</h2>
            {night.sections
              .filter((s) => s.id !== "incidents")
              .map((s) =>
                s.draft ? (
                  <div
                    key={s.id}
                    className={cn("mb-2 rounded-lg p-3 text-sm", s.draft.kept ? "border" : DRAFT)}
                    onClick={() => setFocused(s.draft!.sources)}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">{s.name}</span>
                      {!s.draft.kept && (
                        <span className="flex gap-1">
                          <Button size="xs" variant="ghost" onClick={() => dispatch({ type: "clearSection", section: s.id })}>
                            Clear
                          </Button>
                          <Button size="xs" variant="outline" onClick={() => dispatch({ type: "keepSection", section: s.id })}>
                            Keep
                          </Button>
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{s.draft.text}</p>
                  </div>
                ) : (
                  <button
                    key={s.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
                  >
                    <ChevronRight className="size-3.5" />
                    {s.name}
                    <span className="ml-auto text-xs">Nothing yet</span>
                  </button>
                ),
              )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function IncidentCard({
  incident: i,
  dispatch,
  onFocus,
  focused,
}: {
  incident: Incident
  dispatch: VariantProps["dispatch"]
  onFocus: (ids: string[]) => void
  focused: string[]
}) {
  const gaps = gapsIn(i)
  const active = sourcesOf(i).some((id) => focused.includes(id))

  return (
    <article
      className={cn(
        "rounded-lg p-3 transition-colors",
        i.confirmed ? "border bg-card" : DRAFT,
        active && !i.confirmed && "border-foreground/60",
      )}
    >
      <header className="mb-2 flex items-start gap-2">
        <button className="text-left font-medium hover:underline" onClick={() => onFocus(sourcesOf(i))}>
          {i.title}
        </button>
        {i.fromStaff && (
          <Badge variant="outline" className="ml-auto">
            <Users /> {i.fromStaff.name} ({i.fromStaff.role})
          </Badge>
        )}
        {i.confirmed && (
          <Badge variant="secondary" className={cn(!i.fromStaff && "ml-auto")}>
            <Check /> Confirmed
          </Badge>
        )}
      </header>

      <dl className="grid grid-cols-[6.5rem_1fr] items-start gap-x-2 gap-y-1.5 text-sm">
        {FIELDS.map((f) => {
          const s = i.fields[f]
          return (
            <div key={f} className="contents">
              <dt className="text-xs text-muted-foreground">{FIELD_LABEL[f]}</dt>
              <dd>
                {s.status === "gap" ? (
                  <GapPopover incident={i} field={f} dispatch={dispatch} />
                ) : s.status === "draft" ? (
                  <button className="text-left hover:underline" onClick={() => onFocus(s.sources)}>
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
        <dt className="text-xs text-muted-foreground">Captured at</dt>
        <dd className="text-xs tabular-nums text-muted-foreground">{i.capturedAt} (system)</dd>
      </dl>

      {!i.confirmed && (
        <footer className="mt-3 flex items-center justify-end gap-2">
          {gaps > 0 && (
            <span className="text-xs text-muted-foreground">
              Fill or mark Unknown {gaps === 1 ? "the Gap" : `${gaps} Gaps`} first
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
