"use client"

// PROTOTYPE — small primitives shared by the variants (not layout).

import { useState } from "react"
import { Camera, HelpCircle, ImageIcon, MessagesSquare, Mic, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { FIELD_LABEL, INCIDENT_TYPES, LOCATIONS, type Action, type Capture, type Incident, type IncidentField } from "../_lib/demo-night"

/** The one visual rule: dashed outline + light tint = Draft (AI wrote it, nobody checked). */
export const DRAFT = "border border-dashed border-foreground/35 bg-muted/60"
/** Gap: an empty slot inside a Draft. */
export const GAP = "border border-dashed border-destructive/60 bg-destructive/5 text-destructive"
/** Highlight for a source Capture linked from a Draft. */
export const SOURCE_HIGHLIGHT = "ring-2 ring-ring ring-offset-2 ring-offset-background"

export function KindIcon({ kind, className }: { kind: Capture["kind"]; className?: string }) {
  const Icon = { photo: Camera, voice: Mic, text: Type, chat: MessagesSquare }[kind]
  return <Icon className={cn("size-3.5", className)} aria-hidden />
}

export const KIND_LABEL: Record<Capture["kind"], string> = {
  photo: "Photo",
  voice: "Voice note",
  text: "Text",
  chat: "Group chat",
}

/** Verbatim Capture content. Never rewritten. */
export function CaptureBody({ capture, compact }: { capture: Capture; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {capture.kind === "photo" && (
        <div
          className={cn(
            "grid place-items-center rounded-md bg-muted text-muted-foreground",
            compact ? "h-16" : "aspect-[4/3]",
          )}
        >
          <ImageIcon className="size-6" aria-hidden />
        </div>
      )}
      {capture.kind === "voice" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mic className="size-3.5" aria-hidden />
          <span className="h-1 flex-1 rounded-full bg-muted" />
          <span className="tabular-nums">0:14</span>
        </div>
      )}
      {capture.chatLines ? (
        <ul className="flex flex-col gap-1 font-mono text-xs">
          {capture.chatLines.map((l) => (
            <li key={l.at + l.who} className="grid grid-cols-[3rem_1fr] gap-2">
              <span className="text-muted-foreground tabular-nums">[{l.at}]</span>
              <span>
                <span className="text-muted-foreground">{l.who}:</span> {l.text}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={cn(capture.kind === "voice" && "italic")}>“{capture.text}”</p>
      )}
    </div>
  )
}

/** One-tap Gap filler. Each variant decides where it lives (popover, inline, sheet…). */
export function GapOptions({
  field,
  hint,
  onPick,
  onUnknown,
}: {
  field: IncidentField
  hint?: string
  onPick: (value: string) => void
  onUnknown: () => void
}) {
  const [custom, setCustom] = useState("")
  const options =
    field === "location" ? LOCATIONS : field === "type" ? INCIDENT_TYPES : field === "occurredAt" ? ["23:30", "23:45", "00:00"] : []

  return (
    <div className="flex flex-col gap-3">
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {options.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {options.map((o) => (
            <Button key={o} size="sm" variant="outline" onClick={() => onPick(o)}>
              {o}
            </Button>
          ))}
        </div>
      )}
      <form
        className="flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault()
          if (custom.trim()) onPick(custom.trim())
        }}
      >
        <Input
          type={field === "occurredAt" ? "time" : "text"}
          placeholder={field === "location" ? "Somewhere else…" : "Type it…"}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="h-7"
        />
        <Button size="sm" type="submit" disabled={!custom.trim()}>
          Set
        </Button>
      </form>
      <Button size="sm" variant="ghost" className="justify-start text-muted-foreground" onClick={onUnknown}>
        <HelpCircle /> Mark as Unknown
      </Button>
    </div>
  )
}

/** Gap slot that opens GapOptions in a popover. */
export function GapPopover({
  incident,
  field,
  dispatch,
  className,
  children,
}: {
  incident: Incident
  field: IncidentField
  dispatch: React.Dispatch<Action>
  className?: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const f = incident.fields[field]
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn("cursor-pointer rounded-md px-2 py-0.5 text-left text-sm", GAP, className)}>
        {children ?? `Add ${FIELD_LABEL[field].toLowerCase()}`}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <GapOptions
          field={field}
          hint={f.status === "gap" ? f.hint : undefined}
          onPick={(value) => {
            dispatch({ type: "fill", incident: incident.id, field, value })
            setOpen(false)
          }}
          onUnknown={() => {
            dispatch({ type: "unknown", incident: incident.id, field })
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
