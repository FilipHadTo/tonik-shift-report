"use client"

// PROTOTYPE — an Incident as a structured block inside the document.
// Properties as chips (Gap = dashed amber chip that opens a picker with Unknown),
// then What happened, then Evidence, then a per-Incident Confirm.

import { useState } from "react"
import { Check, Clock, HelpCircle, MapPin, Paperclip, Sparkles, Tag, Trash2, Undo2, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditor } from "./report-editor"
import { INCIDENT_TYPES, LOCATIONS, gapsIn, type Field, type Incident, type IncidentField } from "./data"
import { Avatar, Btn, IconBtn, PhotoThumb, Pop, VoiceThumb } from "./ui"

const ROWS: { field: IncidentField; label: string; icon: typeof Clock; add: string }[] = [
  { field: "occurredAt", label: "Occurred at", icon: Clock, add: "Add time" },
  { field: "location", label: "Location", icon: MapPin, add: "Add location" },
  { field: "type", label: "Type", icon: Tag, add: "Pick type" },
]

export function IncidentBlock({ incident: i, number }: { incident: Incident; number: number }) {
  const { report, dispatch, hot, setHot, flash } = useEditor()
  const confirmed = !!i.confirmedAt
  const locked = !!report.submittedAt
  const gaps = gapsIn(i)
  const lit = (hot?.from === "inbox" && i.sources.some((s) => hot.captures.includes(s))) || flash === i.id
  const sources = report.captures.filter((c) => i.sources.includes(c.id))
  const editable = !confirmed && !locked

  return (
    <article
      id={i.id}
      aria-labelledby={`${i.id}-title`}
      onMouseEnter={() => i.sources.length && setHot({ captures: i.sources, from: "doc" })}
      onMouseLeave={() => setHot(null)}
      className={cn(
        "enter scroll-mt-24 rounded-xl p-4 pb-3 transition-[box-shadow,background-color,border-color] duration-200",
        confirmed
          ? "border border-(--line-2) bg-(--panel)"
          : "border border-dashed border-(--ai-line) bg-(--ai-soft)",
        lit && "linked",
      )}
    >
      <header className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="mt-px grid size-6 shrink-0 place-items-center rounded-md bg-(--raise) text-xs font-semibold text-(--ink-2) tabular-nums shadow-[inset_0_0_0_1px_var(--line)]"
        >
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
        {confirmed ? (
          <span className="flex h-6 shrink-0 items-center gap-1 text-xs text-(--ok)">
            <Check className="size-3.5" strokeWidth={2.25} aria-hidden />
            Confirmed {i.confirmedAt}
          </span>
        ) : (
          <span className="flex h-6 shrink-0 items-center gap-1 text-xs font-medium text-(--ai)">
            {!i.manual && <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />}
            {i.manual ? "New" : "Draft"}
          </span>
        )}
      </header>

      <dl className="mt-3.5 grid grid-cols-[124px_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 pl-[34px] text-[13px]">
        {ROWS.map((row) => (
          <Row key={row.field} icon={row.icon} label={row.label}>
            <FieldChip incident={i} row={row} editable={editable} />
            {row.field === "occurredAt" && (
              <span className="ml-2 text-xs text-(--ink-3) tabular-nums">Captured at {i.capturedAt}</span>
            )}
          </Row>
        ))}
        {i.fromStaff && (
          <Row icon={UserRound} label="Reported by">
            <span className="inline-flex h-7 items-center gap-1.5 text-(--ink)">
              <Avatar author={i.fromStaff} size={18} />
              {i.fromStaff.name}
              <span className="text-(--ink-3)">{i.fromStaff.role}</span>
            </span>
          </Row>
        )}
      </dl>

      <div className="mt-3 pl-[34px]">
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
            <Btn variant="ghost" size="sm" className="mt-2 -ml-2.5 text-(--ink-3)">
              <Paperclip strokeWidth={1.75} />
              Add Evidence
            </Btn>
          )
        )}
      </div>

      <footer className="mt-3 flex min-h-8 items-center gap-2 border-t border-(--line) pt-3 pl-[34px] text-xs text-(--ink-3)">
        {sources.length > 0 ? (
          <span className="flex items-center gap-1.5">
            From
            {sources.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1 text-(--ink-2)">
                <Avatar author={c.author} size={16} />
                {c.author.name.split(" ")[0]}, <span className="tabular-nums">{c.capturedAt}</span>
              </span>
            ))}
          </span>
        ) : (
          <span>Added by {report.manager.name}</span>
        )}

        {editable && (
          <span className="ml-auto flex items-center gap-1.5">
            {gaps > 0 && (
              <span className="mr-1 text-(--gap)">
                Fill {gaps === 1 ? "1 Gap" : `${gaps} Gaps`} to confirm
              </span>
            )}
            <IconBtn label="Delete Incident" onClick={() => dispatch({ type: "deleteIncident", incident: i.id })}>
              <Trash2 strokeWidth={1.75} />
            </IconBtn>
            <Btn
              variant="primary"
              size="sm"
              disabled={gaps > 0}
              onClick={() => dispatch({ type: "confirm", incident: i.id })}
            >
              <Check strokeWidth={2.25} />
              Confirm
            </Btn>
          </span>
        )}
        {confirmed && !locked && (
          <Btn
            variant="ghost"
            size="sm"
            className="ml-auto -mr-1.5"
            onClick={() => dispatch({ type: "confirm", incident: i.id, undo: true })}
          >
            <Undo2 strokeWidth={1.75} />
            Reopen
          </Btn>
        )}
      </footer>
    </article>
  )
}

function Row({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="flex items-center gap-1.5 text-(--ink-3)">
        <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
        {label}
      </dt>
      <dd className="flex min-w-0 items-center">{children}</dd>
    </>
  )
}

const chip =
  "press inline-flex h-7 max-w-full items-center gap-1.5 truncate rounded-md px-2 text-[13px] whitespace-nowrap"

function FieldChip({ incident: i, row, editable }: { incident: Incident; row: (typeof ROWS)[number]; editable: boolean }) {
  const { dispatch } = useEditor()
  const [open, setOpen] = useState(false)
  const f = i.fields[row.field]
  const set = (value: string | null) => {
    dispatch({ type: "setField", incident: i.id, field: row.field, value })
    setOpen(false)
  }

  const look = chipLook(f, row.add)
  if (!editable) return <span className="inline-flex h-7 items-center gap-1.5 text-[13px] text-(--ink) tabular-nums">{look.text}</span>

  return (
    <Pop
      open={open}
      onOpenChange={setOpen}
      className={row.field === "occurredAt" ? "w-[280px] p-3" : "w-[232px]"}
      trigger={
        <button type="button" aria-label={`${row.label}: ${look.text}`} className={cn(chip, look.cls, "hover:bg-(--press)")}>
          {look.text}
        </button>
      }
    >
      {f.status === "gap" && f.hint && (
        <p className={cn("flex gap-2 text-xs leading-[1.45] text-(--ink-2)", row.field === "occurredAt" ? "mb-3" : "mx-1.5 mt-1 mb-2")}>
          <Sparkles className="mt-px size-3.5 shrink-0 text-(--ai)" strokeWidth={1.75} aria-hidden />
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

function chipLook(f: Field, add: string): { text: React.ReactNode; cls: string } {
  switch (f.status) {
    case "draft":
    case "filled":
      return { text: f.value, cls: "bg-(--raise) text-(--ink) shadow-[inset_0_0_0_1px_var(--line)] tabular-nums" }
    case "unknown":
      return {
        text: (
          <>
            <HelpCircle className="size-3.5" strokeWidth={1.75} aria-hidden />
            Unknown
          </>
        ),
        cls: "bg-(--raise) text-(--ink-2) shadow-[inset_0_0_0_1px_var(--line)]",
      }
    case "gap":
      return { text: add, cls: "border border-dashed border-(--gap-line) bg-(--gap-soft) font-medium text-(--gap)" }
    case "empty":
      return { text: add, cls: "border border-dashed border-(--line-2) text-(--ink-3)" }
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
      <p className="mb-1.5 text-xs text-(--ink-3)">Before it was captured ({capturedAt})</p>
      <div className="flex flex-wrap gap-1">
        {quick.map(({ d, t }) => (
          <button
            key={d}
            type="button"
            onClick={() => onPick(t)}
            className={cn(
              chip,
              "flex-col gap-0 py-1 leading-tight tabular-nums shadow-[inset_0_0_0_1px_var(--line)] hover:bg-(--press)",
              "h-auto",
              current === t ? "bg-(--press)" : "bg-(--raise)",
            )}
          >
            <span className="text-[13px] font-medium">{t}</span>
            <span className="text-[10px] text-(--ink-3)">{d === 0 ? "at capture" : `${-d >= 60 ? `${-d / 60}h` : `${-d}m`} before`}</span>
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
          className="h-8 flex-1 rounded-lg bg-(--raise) px-2.5 text-[13px] tabular-nums shadow-[inset_0_0_0_1px_var(--line)] outline-none [color-scheme:light] dark:[color-scheme:dark]"
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
          className="flex h-8 shrink-0 items-center rounded-md px-2 text-left hover:bg-(--raise) aria-selected:font-medium"
        >
          {o}
          {current === o && <Check className="ml-auto size-3.5 text-(--ink-2)" aria-hidden />}
        </button>
      ))}
      {allowUnknown && (
        <>
          <div className="my-1 h-px shrink-0 bg-(--line)" />
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
      className={cn("flex h-auto shrink-0 flex-col items-start rounded-md px-2 py-1.5 text-left hover:bg-(--raise)", className)}
    >
      <span className="flex items-center gap-1.5">
        <HelpCircle className="size-3.5 text-(--ink-3)" strokeWidth={1.75} aria-hidden />
        Mark as Unknown
      </span>
      <span className="pl-5 text-xs text-(--ink-3)">You can&apos;t know it. Doesn&apos;t block submitting.</span>
    </button>
  )
}
