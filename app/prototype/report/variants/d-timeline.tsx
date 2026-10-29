"use client"

// PROTOTYPE Variant D — "Night timeline".
// The Night as one time axis: Captures on the left at Captured-at, Incidents on the right
// at Occurred-at. An Incident with no time can't be placed, so it waits in a holding bay.

import { useState } from "react"
import { Check, ChevronRight, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  FIELDS,
  FIELD_LABEL,
  fieldValue,
  gapsIn,
  nightMinutes,
  sourcesOf,
  totals,
  type Capture,
  type Incident,
} from "../../_lib/demo-night"
import { CaptureBody, DRAFT, GAP, GapPopover, KIND_LABEL, KindIcon, SOURCE_HIGHLIGHT } from "../../_components/shared"
import type { VariantProps } from "../report-prototype"

type Row =
  | { t: string; kind: "hour" }
  | { t: string; kind: "capture"; capture: Capture }
  | { t: string; kind: "incident"; incident: Incident }

const HOURS = ["22:00", "23:00", "00:00", "01:00", "02:00", "03:00"]

export function VariantD({ night, dispatch }: VariantProps) {
  const [selected, setSelected] = useState<string | null>(night.incidents[0].id)
  const [focused, setFocused] = useState<string[]>(sourcesOf(night.incidents[0]))
  const t = totals(night)

  const placed = night.incidents.filter((i) => fieldValue(i.fields.occurredAt)?.match(/^\d\d:\d\d$/))
  const unplaced = night.incidents.filter((i) => !placed.includes(i))

  const rows: Row[] = [
    ...HOURS.map((h) => ({ t: h, kind: "hour" as const })),
    ...night.captures.map((c) => ({ t: c.capturedAt, kind: "capture" as const, capture: c })),
    ...placed.map((i) => ({ t: fieldValue(i.fields.occurredAt)!, kind: "incident" as const, incident: i })),
  ].sort((a, b) => nightMinutes(a.t) - nightMinutes(b.t) || (a.kind === "hour" ? -1 : 1))

  function select(i: Incident) {
    setSelected(i.id === selected ? null : i.id)
    setFocused(sourcesOf(i))
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 pb-28">
      <header className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-xs text-muted-foreground">
            Opened {night.openedAt} by {night.openedBy}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {night.venue} · {night.night}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {night.incidents.length - t.unconfirmed}/{night.incidents.length} Incidents confirmed
          </span>
          <Button disabled={!t.ready}>Submit</Button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
        <div className="flex flex-col gap-6">
          {unplaced.length > 0 && (
            <section
              className={cn(
                "rounded-xl p-4",
                unplaced.some((i) => i.fields.occurredAt.status === "gap") ? cn(GAP, "text-foreground") : "border",
              )}
            >
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Clock className="size-4" /> Not on the timeline — time is a Gap or Unknown
              </h2>
              <div className="flex flex-col gap-3">
                {unplaced.map((i) => (
                  <IncidentBlock
                    key={i.id}
                    incident={i}
                    open={selected === i.id}
                    onSelect={() => select(i)}
                    dispatch={dispatch}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-[1fr_3.5rem_1fr] gap-x-3">
            <p className="pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Captured</p>
            <span />
            <p className="pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Happened</p>
            {rows.map((r, n) =>
              r.kind === "hour" ? (
                <div key={`h${r.t}`} className="col-span-3 grid grid-cols-subgrid items-center py-1">
                  <span className="h-px bg-border" />
                  <span className="text-center font-mono text-xs text-muted-foreground">{r.t}</span>
                  <span className="h-px bg-border" />
                </div>
              ) : (
                <div key={n} className="col-span-3 grid grid-cols-subgrid items-start py-1.5">
                  {r.kind === "capture" ? (
                    <>
                      <div
                        className={cn(
                          "rounded-lg border bg-card p-3 transition-shadow",
                          focused.includes(r.capture.id) && SOURCE_HIGHLIGHT,
                        )}
                      >
                        <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <KindIcon kind={r.capture.kind} /> {KIND_LABEL[r.capture.kind]} · {r.capture.author.name}
                          {r.capture.author.role !== "Closing Manager" && ` (${r.capture.author.role})`}
                        </div>
                        <CaptureBody capture={r.capture} compact />
                      </div>
                      <span className="pt-3 text-center font-mono text-xs tabular-nums">{r.t}</span>
                      <span />
                    </>
                  ) : (
                    <>
                      <span />
                      <span className="pt-3 text-center font-mono text-xs tabular-nums">{r.t}</span>
                      <IncidentBlock
                        incident={r.incident}
                        open={selected === r.incident.id}
                        onSelect={() => select(r.incident)}
                        dispatch={dispatch}
                      />
                    </>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-1 lg:sticky lg:top-8 lg:self-start">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Rest of the report</h2>
          {night.sections
            .filter((s) => s.id !== "incidents")
            .map((s) =>
              s.draft ? (
                <div key={s.id} className={cn("mb-1.5 rounded-lg p-2.5 text-sm", s.draft.kept ? "border" : DRAFT)}>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.draft.text}</p>
                  {!s.draft.kept && (
                    <Button size="xs" variant="ghost" className="mt-1 -ml-2" onClick={() => dispatch({ type: "keepSection", section: s.id })}>
                      Keep
                    </Button>
                  )}
                </div>
              ) : (
                <button key={s.id} className="flex items-center gap-1.5 rounded px-1 py-1 text-left text-xs text-muted-foreground hover:bg-muted">
                  <ChevronRight className="size-3" /> {s.name}
                </button>
              ),
            )}
        </aside>
      </div>
    </div>
  )
}

function IncidentBlock({
  incident: i,
  open,
  onSelect,
  dispatch,
}: {
  incident: Incident
  open: boolean
  onSelect: () => void
  dispatch: VariantProps["dispatch"]
}) {
  const gaps = gapsIn(i)
  return (
    <article className={cn("rounded-lg p-3", i.confirmed ? "border bg-card" : DRAFT, open && "shadow-sm")}>
      <button onClick={onSelect} className="flex w-full items-center gap-2 text-left">
        <span className="font-medium">{i.title}</span>
        {gaps > 0 && !open && (
          <Badge variant="destructive" className="ml-auto">
            {gaps} Gap
          </Badge>
        )}
        {i.confirmed && <Check className="ml-auto size-4" aria-label="Confirmed" />}
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-3">
          <dl className="grid grid-cols-[6rem_1fr] items-start gap-x-2 gap-y-1.5 text-sm">
            {FIELDS.map((f) => {
              const s = i.fields[f]
              return (
                <div key={f} className="contents">
                  <dt className="text-xs text-muted-foreground">{FIELD_LABEL[f]}</dt>
                  <dd className={cn(s.status === "unknown" && "text-muted-foreground")}>
                    {s.status === "gap" ? <GapPopover incident={i} field={f} dispatch={dispatch} /> : fieldValue(s)}
                  </dd>
                </div>
              )
            })}
            <dt className="text-xs text-muted-foreground">Captured at</dt>
            <dd className="text-xs text-muted-foreground tabular-nums">
              {i.capturedAt} (system)
              {i.fromStaff && (
                <Badge variant="outline" className="ml-2">
                  <Users /> {i.fromStaff.name}
                </Badge>
              )}
            </dd>
          </dl>
          {!i.confirmed && (
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={gaps > 0} onClick={() => dispatch({ type: "confirm", incident: i.id })}>
                Confirm Incident
              </Button>
              {gaps > 0 && <span className="text-xs text-muted-foreground">Resolve the Gap first</span>}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
