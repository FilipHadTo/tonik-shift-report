"use client"

// PROTOTYPE Variant C — "Fill-in document".
// The report reads like the finished document. Draft facts are inline dashed tokens,
// a Gap is a blank in the sentence. Sources appear in the margin, like doc comments.

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { gapsIn, sourcesOf, totals, type Incident, type IncidentField } from "../../_lib/demo-night"
import { CaptureBody, DRAFT, GapPopover, KIND_LABEL, KindIcon, SOURCE_HIGHLIGHT } from "../../_components/shared"
import type { VariantProps } from "../report-prototype"

const BLANK: Record<IncidentField, string> = {
  occurredAt: "when?",
  location: "where?",
  type: "what kind?",
  description: "what happened?",
}

export function VariantC({ night, dispatch }: VariantProps) {
  const [focused, setFocused] = useState<string[]>([])
  const t = totals(night)
  const filled = night.sections.filter((s) => s.draft && s.id !== "incidents")
  const empty = night.sections.filter((s) => !s.draft && s.id !== "incidents")
  const marginCaptures = night.captures.filter((c) => focused.includes(c.id))

  function token(incident: Incident, field: IncidentField) {
    const s = incident.fields[field]
    if (s.status === "gap")
      return (
        <GapPopover incident={incident} field={field} dispatch={dispatch} className="mx-0.5 inline-block min-w-20 py-0 text-center">
          {BLANK[field]}
        </GapPopover>
      )
    if (s.status === "unknown") return <span className="italic text-muted-foreground">unknown</span>
    if (s.status === "filled" || incident.confirmed) return <span className="font-medium">{s.value}</span>
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={() => setFocused(s.sources)}
        onKeyDown={(e) => e.key === "Enter" && setFocused(s.sources)}
        className={cn(
          "cursor-pointer rounded px-1 py-0.5 box-decoration-clone",
          field !== "description" && "font-medium",
          DRAFT,
          s.sources.every((id) => focused.includes(id)) && "border-foreground",
        )}
      >
        {s.value}
      </span>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-10 pb-28 lg:grid-cols-[1fr_20rem]">
      <article className="flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-2 border-b pb-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Shift Report · draft</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {night.venue}, night of {night.night}
          </h1>
          <p className="text-sm text-muted-foreground">
            Opened {night.openedAt} by {night.openedBy} · Closing Manager {night.manager.name} · {night.captures.length} Captures
          </p>
          <p className="text-sm text-muted-foreground">
            <span className={cn("mr-1 inline-block h-3 w-6 rounded-sm align-middle", DRAFT)} /> dashed = the AI wrote it, you haven’t checked it yet
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Incidents</h2>
          {night.incidents.map((i, n) => {
            const gaps = gapsIn(i)
            return (
              <div key={i.id} className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 font-medium">
                  <span className="text-muted-foreground tabular-nums">{n + 1}.</span> {i.title}
                  {i.confirmed && <Check className="size-4" aria-label="Confirmed" />}
                </h3>
                <p className="leading-8">
                  At {token(i, "occurredAt")}, at {token(i, "location")} —{" "}
                  {token(i, "type")}. {token(i, "description")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Captured at {i.capturedAt}
                  {i.fromStaff && ` · reported by ${i.fromStaff.name} (${i.fromStaff.role})`}
                  {i.evidence.length > 0 && ` · ${i.evidence.length} photo attached`}
                  {" · "}
                  <button className="underline underline-offset-2" onClick={() => setFocused(sourcesOf(i))}>
                    show sources
                  </button>
                </p>
                {!i.confirmed && (
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" disabled={gaps > 0} onClick={() => dispatch({ type: "confirm", incident: i.id })}>
                      <Check /> Confirm this Incident
                    </Button>
                    {gaps > 0 && <span className="text-xs text-muted-foreground">Fill in the blank first</span>}
                  </div>
                )}
              </div>
            )
          })}
        </section>

        {filled.map((s) => (
          <section key={s.id} className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{s.name}</h2>
            <p
              onClick={() => setFocused(s.draft!.sources)}
              className={cn("cursor-pointer rounded-md p-2 -mx-2 leading-7", !s.draft!.kept && DRAFT)}
            >
              {s.draft!.text}
            </p>
            {!s.draft!.kept && (
              <div className="flex gap-1">
                <Button size="xs" variant="ghost" onClick={() => dispatch({ type: "keepSection", section: s.id })}>
                  Keep
                </Button>
                <Button size="xs" variant="ghost" onClick={() => dispatch({ type: "clearSection", section: s.id })}>
                  Clear
                </Button>
              </div>
            )}
          </section>
        ))}

        <p className="border-t pt-4 text-sm text-muted-foreground">
          Nothing tonight on: {empty.map((s, n) => (
            <span key={s.id}>
              <button className="underline-offset-2 hover:underline">{s.name}</button>
              {n < empty.length - 1 && " · "}
            </span>
          ))}
        </p>

        <footer className="flex items-center gap-3 border-t pt-6">
          <Button disabled={!t.ready}>Submit report</Button>
          <span className="text-sm text-muted-foreground">
            {t.ready ? "Everything confirmed." : `${t.unconfirmed} Incidents to confirm, ${t.gaps} blanks to fill.`}
          </span>
        </footer>
      </article>

      <aside className="lg:sticky lg:top-10 lg:self-start">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Source</h2>
        {marginCaptures.length === 0 ? (
          <p className="text-sm text-muted-foreground">Click anything dashed to see the Capture it came from.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {marginCaptures.map((c) => (
              <div key={c.id} className={cn("rounded-lg border bg-card p-3", SOURCE_HIGHLIGHT)}>
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <KindIcon kind={c.kind} /> {KIND_LABEL[c.kind]} · {c.author.name}
                  <span className="ml-auto tabular-nums">{c.capturedAt}</span>
                </div>
                <CaptureBody capture={c} compact />
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  )
}
