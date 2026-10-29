"use client"

// PROTOTYPE Variant B — "One at a time".
// A review queue: one Incident fills the screen, its source Captures sit beside it,
// the Gap is promoted to a direct question. Confirm moves to the next one.

import { useState } from "react"
import { ArrowRight, Check, ChevronRight, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FIELDS, FIELD_LABEL, gapsIn, sourcesOf, totals } from "../../_lib/demo-night"
import { CaptureBody, DRAFT, GAP, GapOptions, KIND_LABEL, KindIcon, SOURCE_HIGHLIGHT } from "../../_components/shared"
import type { VariantProps } from "../report-prototype"

const QUESTION = {
  occurredAt: "When did this happen?",
  location: "Where did this happen?",
  type: "What kind of Incident is it?",
  description: "What happened?",
}

export function VariantB({ night, dispatch }: VariantProps) {
  const [currentId, setCurrentId] = useState(night.incidents[0].id)
  const [focused, setFocused] = useState<string[]>([])
  const t = totals(night)
  const current = night.incidents.find((i) => i.id === currentId) ?? night.incidents[0]
  const index = night.incidents.indexOf(current)
  const sources = night.captures.filter((c) => sourcesOf(current).includes(c.id))
  const gapFields = FIELDS.filter((f) => current.fields[f].status === "gap")

  function confirmAndNext() {
    dispatch({ type: "confirm", incident: current.id })
    const next = night.incidents.find((i, n) => n > index && !i.confirmed) ?? night.incidents.find((i) => !i.confirmed && i.id !== current.id)
    if (next) setCurrentId(next.id)
    setFocused([])
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-4 border-b px-6 py-3">
        <h1 className="text-sm font-semibold">
          {night.venue} <span className="font-normal text-muted-foreground">· {night.night} · opened {night.openedAt}</span>
        </h1>
        <div className="flex flex-1 justify-center gap-1">
          {night.incidents.map((i) => (
            <button
              key={i.id}
              aria-label={i.title}
              onClick={() => setCurrentId(i.id)}
              className={cn(
                "h-1.5 w-10 rounded-full",
                i.confirmed ? "bg-foreground" : gapsIn(i) ? "bg-destructive/50" : "bg-muted-foreground/30",
                i.id === current.id && "outline-2 outline-offset-2 outline-ring",
              )}
            />
          ))}
        </div>
        <Button size="sm" disabled={!t.ready}>
          Submit
        </Button>
      </header>

      <div className="grid flex-1 lg:grid-cols-[14rem_1fr_22rem]">
        <nav className="hidden flex-col gap-1 border-r p-4 lg:flex">
          <p className="mb-1 px-2 text-xs text-muted-foreground">Incidents</p>
          {night.incidents.map((i) => (
            <button
              key={i.id}
              onClick={() => setCurrentId(i.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                i.id === current.id && "bg-muted font-medium",
              )}
            >
              {i.confirmed ? (
                <Check className="size-3.5 shrink-0" />
              ) : (
                <span className={cn("size-3.5 shrink-0 rounded-full", gapsIn(i) ? GAP : DRAFT)} />
              )}
              <span className="truncate">{i.title}</span>
            </button>
          ))}
          <p className="mt-6 mb-1 px-2 text-xs text-muted-foreground">Rest of the report</p>
          {night.sections
            .filter((s) => s.id !== "incidents")
            .map((s) => (
              <div key={s.id} className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                <ChevronRight className="size-3" />
                <span className={cn("truncate", s.draft && "text-foreground")}>{s.name}</span>
                {s.draft && <span className={cn("ml-auto size-2 shrink-0 rounded-full", s.draft.kept ? "bg-foreground" : DRAFT)} />}
              </div>
            ))}
        </nav>

        <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6 pb-28 lg:p-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Incident {index + 1} of {night.incidents.length}
            {current.fromStaff && (
              <Badge variant="outline">
                <Users /> from {current.fromStaff.name} ({current.fromStaff.role})
              </Badge>
            )}
            {current.confirmed && (
              <Badge variant="secondary">
                <Check /> Confirmed
              </Badge>
            )}
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">{current.title}</h2>

          {!current.confirmed &&
            gapFields.map((f) => {
              const s = current.fields[f]
              return (
                <section key={f} className={cn("rounded-xl p-5", GAP, "text-foreground")}>
                  <h3 className="mb-3 text-lg font-medium">{QUESTION[f]}</h3>
                  <GapOptions
                    field={f}
                    hint={s.status === "gap" ? s.hint : undefined}
                    onPick={(value) => dispatch({ type: "fill", incident: current.id, field: f, value })}
                    onUnknown={() => dispatch({ type: "unknown", incident: current.id, field: f })}
                  />
                </section>
              )
            })}

          <dl className="flex flex-col gap-3">
            {FIELDS.filter((f) => current.fields[f].status !== "gap").map((f) => {
              const s = current.fields[f]
              const isDraft = s.status === "draft" && !current.confirmed
              return (
                <button
                  key={f}
                  onClick={() => setFocused("sources" in s ? s.sources : [])}
                  className={cn("rounded-lg p-4 text-left", isDraft ? DRAFT : "border")}
                >
                  <dt className="text-xs text-muted-foreground">{FIELD_LABEL[f]}</dt>
                  <dd className={cn("mt-1", f === "description" ? "text-base" : "text-lg font-medium", s.status === "unknown" && "text-muted-foreground")}>
                    {s.status === "gap" ? null : s.status === "unknown" ? "Unknown" : s.value}
                  </dd>
                </button>
              )
            })}
            <div className="px-4 text-xs text-muted-foreground">Captured at {current.capturedAt} (system)</div>
          </dl>

          {!current.confirmed && (
            <div className="flex items-center gap-3">
              <Button size="lg" disabled={gapFields.length > 0} onClick={confirmAndNext}>
                Confirm Incident <ArrowRight />
              </Button>
              {gapFields.length > 0 && <span className="text-sm text-muted-foreground">Answer the question above first</span>}
            </div>
          )}
        </main>

        <aside className="flex flex-col gap-3 border-l bg-muted/30 p-6 pb-28">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Where this came from</h3>
          {sources.map((c) => (
            <div key={c.id} className={cn("rounded-lg border bg-card p-3", focused.includes(c.id) && SOURCE_HIGHLIGHT)}>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <KindIcon kind={c.kind} /> {KIND_LABEL[c.kind]} · {c.author.name} ({c.author.role})
                <span className="ml-auto tabular-nums">{c.capturedAt}</span>
              </div>
              <CaptureBody capture={c} />
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
