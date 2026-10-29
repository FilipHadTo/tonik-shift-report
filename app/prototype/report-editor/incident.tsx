"use client"

// PROTOTYPE — an Incident as a structured block inside the document.
// Properties (Gap = amber chip that opens a picker with Unknown), What happened,
// Evidence, then a per-Incident Confirm.

import { useState } from "react"
import { Check, Clock, HelpCircle, MapPin, Paperclip, Plus, Sparkles, Tag, Trash2, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { Btn, IconBtn } from "@/components/btn"
import { chip, type ChipTone } from "@/components/chip"
import { DraftLabel } from "@/components/draft-label"
import { PhotoThumb, VoiceThumb } from "@/components/evidence-thumb"
import { Pop } from "@/components/pop"
import { useEditor } from "./report-editor"
import { INCIDENT_TYPES, LOCATIONS, type Field, type Incident, type IncidentField } from "./data"

const ROWS: { field: IncidentField; label: string; icon: typeof Clock; add: string }[] = [
  { field: "occurredAt", label: "Occurred at", icon: Clock, add: "Add time" },
  { field: "location", label: "Location", icon: MapPin, add: "Add location" },
  { field: "type", label: "Type", icon: Tag, add: "Pick type" },
]

export function IncidentBlock({
  incident: i,
  number,
  joinPrev,
}: {
  incident: Incident
  number: number
  /** The Incident above is confirmed too, so a divider separates the two. */
  joinPrev?: boolean
}) {
  const { report, dispatch, hot, setHot, flash } = useEditor()
  const confirmed = !!i.confirmedAt
  const locked = !!report.submittedAt
  const gap = ROWS.find((r) => i.fields[r.field].status === "gap")
  const lit = (hot?.from === "inbox" && i.sources.some((s) => hot.captures.includes(s))) || flash === i.id
  const sources = report.captures.filter((c) => i.sources.includes(c.id))
  const editable = !confirmed && !locked
  const wash = !confirmed && !i.manual

  return (
    <article
      id={i.id}
      aria-labelledby={`${i.id}-title`}
      data-wash={wash || undefined}
      onMouseEnter={() => i.sources.length && setHot({ captures: i.sources, from: "doc" })}
      onMouseLeave={() => setHot(null)}
      className={cn(
        // Hangs into the gutter like Draft blocks, so the text lines up with the rest of the document.
        "group/incident incident enter -mx-5 scroll-mt-24 rounded-2xl px-5 pt-[18px] pb-2.5",
        confirmed
          ? "shadow-[inset_0_0_0_1px_transparent]"
          : i.manual
            ? "bg-raise shadow-[inset_0_0_0_1px_var(--line-2)]"
            : "shadow-[inset_0_0_0_1px_transparent]",
        lit && "linked",
      )}
    >
      <span aria-hidden data-on={(confirmed && joinPrev) || undefined} className="seam" />
      <header className="flex items-start gap-2">
        <span aria-hidden className="shrink-0 text-base leading-6 font-semibold text-ink-3 tabular-nums">
          {number}
        </span>
        <h3
          id={`${i.id}-title`}
          contentEditable={editable}
          suppressContentEditableWarning
          data-placeholder="Untitled Incident"
          onBlur={(e) => dispatch({ type: "editIncident", incident: i.id, patch: { title: e.currentTarget.textContent ?? "" } })}
          className="min-w-0 flex-1 rounded-sm text-base leading-6 font-semibold outline-none"
        >
          {i.title}
        </h3>
        {confirmed && (
          <span className="appear flex h-6 shrink-0 items-center gap-1">
            {!locked && (
              <Btn
                variant="ghost"
                size="sm"
                className="mr-1 opacity-0 transition-opacity duration-150 group-focus-within/incident:opacity-100 group-hover/incident:opacity-100"
                onClick={() => dispatch({ type: "confirm", incident: i.id, undo: true })}
              >
                <Undo2 strokeWidth={1.75} />
                Reopen
              </Btn>
            )}
            <span className="flex items-center gap-1 text-xs text-ok">
              <Check className="size-3.5" strokeWidth={2.25} aria-hidden />
              Confirmed {i.confirmedAt}
            </span>
          </span>
        )}
      </header>

      <ChipMeta incident={i} editable={editable} />
      <div className="mt-3">
        <Body incident={i} editable={editable} />
      </div>

      {/* Stays mounted so Confirm can fold it away instead of cutting it. */}
      <div className="fold" data-folded={confirmed || undefined} inert={confirmed}>
        <div className="-mx-1 px-1 pb-1">
          <footer
            className={cn(
              "mt-4 flex min-h-8 items-center gap-2 border-t pt-3.5 text-xs text-ink-3",
              i.manual ? "border-line" : "border-ai-ring",
            )}
          >
            {i.manual ? (
              <span>Added by {report.manager.name}</span>
            ) : (
              <DraftLabel sources={sources} />
            )}

            {editable && (
              <span className="ml-auto flex items-center gap-1.5">
                <IconBtn label="Delete Incident" onClick={() => dispatch({ type: "deleteIncident", incident: i.id })}>
                  <Trash2 strokeWidth={1.75} />
                </IconBtn>
                {gap ? (
                  // Confirm can't happen yet, so the button offers the next step instead: it opens the first Gap's picker.
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={() => document.querySelector<HTMLButtonElement>(`#${i.id} [data-field="${gap.field}"]`)?.click()}
                  >
                    <gap.icon strokeWidth={1.75} />
                    {gap.add} to confirm
                  </Btn>
                ) : (
                  <Btn variant="primary" size="sm" onClick={() => dispatch({ type: "confirm", incident: i.id })}>
                    <Check strokeWidth={2.25} />
                    Confirm
                  </Btn>
                )}
              </span>
            )}
          </footer>
        </div>
      </div>
    </article>
  )
}

type MetaProps = { incident: Incident; editable: boolean }

/** One wrap-around row of property chips under the title, labels carried by icons. */
function ChipMeta({ incident: i, editable }: MetaProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {ROWS.map((row) => (
        <FieldChip key={row.field} incident={i} row={row} editable={editable} icon />
      ))}
      {i.fromStaff && (
        <span className="ml-1.5 inline-flex items-center gap-1.5 text-[13px] text-ink-2">
          <span className="text-ink-3">by</span>
          <Avatar author={i.fromStaff} size={18} />
          {i.fromStaff.name}
        </span>
      )}
    </div>
  )
}

/** What happened, then Evidence. Same in every layout. */
function Body({ incident: i, editable }: MetaProps) {
  const { dispatch } = useEditor()
  return (
    <div className="min-w-0">
      <p
        contentEditable={editable}
        suppressContentEditableWarning
        data-placeholder="What happened?"
        aria-label="What happened"
        onBlur={(e) =>
          dispatch({ type: "editIncident", incident: i.id, patch: { description: e.currentTarget.textContent ?? "" } })
        }
        className="rounded-sm text-[15px] leading-[1.6] text-pretty outline-none"
      >
        {i.description}
      </p>

      {i.evidence.length > 0 ? (
        <div className="mt-3 flex items-center gap-2">
          {i.evidence.includes("c1") && <PhotoThumb className="h-16 w-24" />}
          {i.evidence.includes("c3") && <VoiceThumb />}
        </div>
      ) : (
        editable && (
          <Btn variant="ghost" size="sm" className="mt-2 -ml-2.5 text-ink-3">
            <Paperclip strokeWidth={1.75} />
            Add Evidence
          </Btn>
        )
      )}
    </div>
  )
}

function FieldChip({
  incident: i,
  row,
  editable,
  icon,
}: {
  incident: Incident
  row: (typeof ROWS)[number]
  editable: boolean
  /** Put the property's icon inside the chip, since there's no label column. */
  icon?: boolean
}) {
  const { dispatch } = useEditor()
  const [open, setOpen] = useState(false)
  const f = i.fields[row.field]
  const set = (value: string | null) => {
    dispatch({ type: "setField", incident: i.id, field: row.field, value })
    setOpen(false)
  }

  const look = chipLook(f, row.add)
  const title = row.field === "occurredAt" ? `${row.label} ${look.label} · Captured at ${i.capturedAt}` : `${row.label}: ${look.label}`
  const Icon = row.icon
  const lead = icon && (f.status === "draft" || f.status === "filled") && (
    <Icon className="size-3.5 text-ink-3" strokeWidth={1.75} aria-hidden />
  )
  if (!editable)
    return (
      <span
        className={cn(
          "inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 text-[13px] text-ink tabular-nums",
          icon && "rounded-md px-2 shadow-[inset_0_0_0_1px_var(--line)]",
        )}
      >
        {icon && <Icon className="size-3.5 text-ink-3" strokeWidth={1.75} aria-hidden />}
        <span className="truncate" title={title}>{look.label}</span>
      </span>
    )

  return (
    <Pop
      open={open}
      onOpenChange={setOpen}
      className={row.field === "occurredAt" ? "w-[328px] p-3" : "w-[232px]"}
      trigger={
        <button type="button" data-field={row.field} aria-label={title} title={title} className={chip({ tone: look.tone })}>
          {lead}
          {look.text}
        </button>
      }
    >
      {f.status === "gap" && f.hint && (
        <p className={cn("flex gap-2 text-xs leading-[1.45] text-ink-2", row.field === "occurredAt" ? "mb-3" : "mx-1.5 mt-1 mb-2")}>
          <Sparkles className="mt-px size-3.5 shrink-0 text-ai" strokeWidth={1.75} aria-hidden />
          {f.hint}
        </p>
      )}
      {row.field === "occurredAt" && <TimePicker capturedAt={i.capturedAt} current={valueOf(f)} onPick={set} />}
      {row.field === "location" && <ListPicker options={LOCATIONS} current={valueOf(f)} onPick={set} allowUnknown />}
      {row.field === "type" && <ListPicker options={INCIDENT_TYPES} current={valueOf(f)} onPick={set} />}
    </Pop>
  )
}

function valueOf(f: Field) {
  return f.status === "draft" || f.status === "filled" ? f.value : undefined
}

function chipLook(f: Field, add: string): { text: React.ReactNode; label: string; tone: ChipTone } {
  switch (f.status) {
    case "draft":
    case "filled":
      return { text: <span className="truncate">{f.value}</span>, label: f.value, tone: "set" }
    case "unknown":
      return {
        text: (
          <>
            <HelpCircle className="size-3.5" strokeWidth={1.75} aria-hidden />
            Unknown
          </>
        ),
        label: "Unknown",
        tone: "unknown",
      }
    case "gap":
      return {
        text: (
          <>
            <span className="size-1.5 rounded-full bg-gap" aria-hidden />
            {add}
          </>
        ),
        label: `Gap, ${add.toLowerCase()}`,
        tone: "gap",
      }
    case "empty":
      return {
        text: (
          <>
            <Plus className="size-3.5" strokeWidth={1.75} aria-hidden />
            {add}
          </>
        ),
        label: add,
        tone: "add",
      }
  }
}

function shift(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number)
  const t = (h * 60 + m + minutes + 1440) % 1440
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`
}

function TimePicker({
  capturedAt,
  current,
  onPick,
}: {
  capturedAt: string
  current?: string
  onPick: (v: string | null) => void
}) {
  const [custom, setCustom] = useState(current ?? "")
  const quick = [0, -10, -30, -60, -120].map((d) => ({ d, t: shift(capturedAt, d) }))
  return (
    <div>
      <p className="mb-1.5 text-xs text-ink-3">Before it was captured ({capturedAt})</p>
      <div className="grid grid-cols-5 gap-1">
        {quick.map(({ d, t }) => (
          <button
            key={d}
            type="button"
            onClick={() => onPick(t)}
            className={cn(
              chip(),
              "flex-col justify-center gap-0 px-0 py-1.5 leading-tight tabular-nums shadow-[inset_0_0_0_1px_var(--line)] hover:bg-press",
              "h-auto",
              current === t ? "bg-press" : "bg-raise",
            )}
          >
            <span className="text-[13px] font-medium">{t}</span>
            <span className="text-[10px] text-ink-3">{d === 0 ? "at capture" : `${-d >= 60 ? `${-d / 60}h` : `${-d}m`} before`}</span>
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault()
          if (custom) onPick(custom)
        }}
      >
        <label htmlFor="time-exact" className="sr-only">
          Exact time
        </label>
        <input
          id="time-exact"
          type="time"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="h-8 flex-1 rounded-lg bg-raise px-2.5 text-[13px] tabular-nums shadow-[inset_0_0_0_1px_var(--line)] outline-none [color-scheme:light] dark:[color-scheme:dark]"
        />
        <Btn type="submit" variant="primary" disabled={!custom}>
          Set
        </Btn>
      </form>
      <UnknownButton onPick={() => onPick(null)} className="mt-2 -mx-1 w-[calc(100%+8px)]" />
    </div>
  )
}

function ListPicker({
  options,
  current,
  onPick,
  allowUnknown,
}: {
  options: string[]
  current?: string
  onPick: (v: string | null) => void
  allowUnknown?: boolean
}) {
  return (
    <div role="listbox" className="flex max-h-[22rem] flex-col overflow-y-auto">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="option"
          aria-selected={current === o}
          onClick={() => onPick(o)}
          className="flex h-8 shrink-0 items-center rounded-md px-2 text-left hover:bg-raise aria-selected:font-medium"
        >
          {o}
          {current === o && <Check className="ml-auto size-3.5 text-ink-2" aria-hidden />}
        </button>
      ))}
      {allowUnknown && (
        <>
          <div className="my-1 h-px shrink-0 bg-line" />
          <UnknownButton onPick={() => onPick(null)} />
        </>
      )}
    </div>
  )
}

function UnknownButton({ onPick, className }: { onPick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn("flex h-auto shrink-0 flex-col items-start rounded-md px-2 py-1.5 text-left hover:bg-raise", className)}
    >
      <span className="flex items-center gap-1.5">
        <HelpCircle className="size-3.5 text-ink-3" strokeWidth={1.75} aria-hidden />
        Mark as Unknown
      </span>
      <span className="pl-5 text-xs text-ink-3">You can&apos;t know it. Doesn&apos;t block submitting.</span>
    </button>
  )
}
