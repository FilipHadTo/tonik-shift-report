"use client"

// PROTOTYPE — center column: the Shift Report as a document. Sections are free
// text, Incidents are structured blocks. Dashed + tinted = Draft.

import { useState } from "react"
import { Check, EyeOff, Lock, Plus, Sparkles, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditor } from "./report-editor"
import { SECTIONS, hasContent, newCapturesFor, orderedIncidents, type Block, type SectionId } from "./data"
import { IncidentBlock } from "./incident"
import { Avatar, Btn, IconBtn } from "./ui"

export function Document() {
  const { report, docRef } = useEditor()
  const visible = SECTIONS.filter((s) => report.visible.includes(s.id))
  const captures = report.captures.filter((c) => !c.dismissed).length
  const staff = new Set(report.captures.filter((c) => c.author.role !== "Closing Manager").map((c) => c.author.name)).size

  return (
    <main
      ref={docRef}
      aria-label="Shift Report"
      className="min-h-0 overflow-y-auto rounded-2xl bg-(--panel) shadow-(--shadow-panel)"
    >
      <div className="mx-auto max-w-[720px] px-14 pt-14 pb-40">
        <p className="text-xs font-medium tracking-[0.04em] text-(--ink-3) uppercase">Shift Report · {report.venue}</p>
        <h1 className="mt-2 text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
          Night of {report.night}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-(--ink-3)">
          <span className="inline-flex items-center gap-1.5 text-(--ink-2)">
            <Avatar author={report.manager} size={18} />
            {report.manager.name}
          </span>
          <span aria-hidden>·</span>
          <span>Opened {report.openedAt} by Alex&apos;s photo</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">
            {captures} Captures from {staff + 1} people
          </span>
        </p>

        {report.submittedAt && (
          <p className="mt-6 flex items-center gap-2 rounded-lg bg-(--raise) px-3 py-2.5 text-[13px] text-(--ink-2) shadow-[inset_0_0_0_1px_var(--line)]">
            <Lock className="size-4 text-(--ink-3)" aria-hidden />
            Submitted {report.submittedAt} by {report.manager.name}. Locked. Changes only as an Addendum.
          </p>
        )}

        <div className="mt-10 flex flex-col gap-12">
          {visible.map((s) => (
            <Section key={s.id} id={s.id} name={s.name} />
          ))}
        </div>
      </div>
    </main>
  )
}

function Section({ id, name }: { id: SectionId; name: string }) {
  const { report, dispatch, draft, flash } = useEditor()
  const fresh = newCapturesFor(report, id)
  const blocks = report.blocks.filter((b) => b.section === id)
  const locked = !!report.submittedAt
  const canHide = !hasContent(report, id)

  return (
    <section
      id={`section-${id}`}
      data-section={id}
      aria-labelledby={`h-${id}`}
      className={cn("group/section scroll-mt-8 rounded-xl", flash === `section-${id}` && "linked")}
    >
      <div className="mb-3 flex min-h-8 items-center gap-2">
        <h2 id={`h-${id}`} className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">
          {name}
        </h2>
        {id === "incidents" && report.incidents.length > 0 && (
          <span className="text-[13px] text-(--ink-3) tabular-nums">
            {report.incidents.filter((i) => i.confirmedAt).length} of {report.incidents.length} confirmed
          </span>
        )}
        {!locked && (
          <span className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-focus-within/section:opacity-100 group-hover/section:opacity-100">
            {fresh.length > 0 && (
              <Btn size="sm" variant="ai" onClick={() => draft(fresh.map((c) => c.id), id)}>
                <Sparkles strokeWidth={1.75} />
                Draft from inbox · {fresh.length}
              </Btn>
            )}
            {canHide && (
              <IconBtn label="Hide section" onClick={() => dispatch({ type: "toggleSection", section: id })}>
                <EyeOff strokeWidth={1.75} />
              </IconBtn>
            )}
          </span>
        )}
      </div>

      {id === "incidents" ? (
        <Incidents />
      ) : (
        <div className="flex flex-col gap-2">
          {blocks.map((b) => (
            <TextBlock key={b.id} block={b} />
          ))}
          {!locked && <Writer section={id} first={blocks.length === 0} hasNew={fresh.length > 0} />}
        </div>
      )}
    </section>
  )
}

function Incidents() {
  const { report, dispatch } = useEditor()
  const incidents = orderedIncidents(report)
  return (
    <div className="flex flex-col gap-3">
      {incidents.length === 0 && (
        <p className="text-[15px] text-(--ink-3)">No Incidents tonight.</p>
      )}
      {incidents.map((i, n) => (
        <IncidentBlock key={i.id} incident={i} number={n + 1} />
      ))}
      {!report.submittedAt && (
        <Btn variant="ghost" className="-ml-2 w-fit" onClick={() => dispatch({ type: "addIncident" })}>
          <Plus strokeWidth={1.75} />
          Add Incident
        </Btn>
      )}
    </div>
  )
}

function TextBlock({ block: b }: { block: Block }) {
  const { report, dispatch, hot, setHot } = useEditor()
  const isDraft = b.status === "draft"
  const lit = hot?.from === "inbox" && b.sources.some((s) => hot.captures.includes(s))
  const sources = report.captures.filter((c) => b.sources.includes(c.id))

  return (
    <div
      onMouseEnter={() => b.sources.length && setHot({ captures: b.sources, from: "doc" })}
      onMouseLeave={() => setHot(null)}
      className={cn(
        "enter rounded-[10px] transition-[box-shadow,background-color] duration-150",
        isDraft ? "border border-dashed border-(--ai-line) bg-(--ai-soft) px-3.5 pt-3 pb-2.5" : "-mx-3.5 px-3.5 py-1",
        lit && "linked",
      )}
    >
      <p
        contentEditable={!report.submittedAt}
        suppressContentEditableWarning
        onBlur={(e) => {
          const text = e.currentTarget.textContent ?? ""
          if (text !== b.text) dispatch({ type: "editBlock", block: b.id, text })
        }}
        className="rounded-sm text-[15px] leading-[1.65] text-pretty outline-none"
      >
        {b.text}
      </p>
      {isDraft && (
        <div className="mt-2 flex items-center gap-2 text-xs text-(--ink-3)">
          <Sparkles className="size-3.5 text-(--ai)" strokeWidth={1.75} aria-hidden />
          <span>Draft from</span>
          {sources.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1 text-(--ink-2)">
              <Avatar author={c.author} size={16} />
              <span className="tabular-nums">{c.capturedAt}</span>
            </span>
          ))}
          <span className="ml-auto flex items-center gap-0.5">
            <IconBtn label="Discard draft" onClick={() => dispatch({ type: "discard", block: b.id })}>
              <Trash2 strokeWidth={1.75} />
            </IconBtn>
            <Btn size="sm" variant="secondary" onClick={() => dispatch({ type: "keep", block: b.id })}>
              <Check strokeWidth={2} />
              Keep
            </Btn>
          </span>
        </div>
      )}
    </div>
  )
}

/** Empty line at the end of a Section: click and type, like a Notion block. */
function Writer({ section, first, hasNew }: { section: SectionId; first: boolean; hasNew: boolean }) {
  const { dispatch } = useEditor()
  const [key, setKey] = useState(0)
  return (
    <p
      key={key}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Write in this section"
      data-placeholder={
        first ? (hasNew ? "Write here, or draft it from the inbox" : "Write here. Leave it empty if nothing to report.") : "Add more…"
      }
      onBlur={(e) => {
        const text = (e.currentTarget.textContent ?? "").trim()
        if (text) {
          dispatch({ type: "write", section, text })
          setKey((k) => k + 1)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
      className={cn(
        "-mx-3.5 cursor-text rounded-[10px] px-3.5 py-1 text-[15px] leading-[1.65] outline-none",
        !first && "opacity-0 focus:opacity-100 group-hover/section:opacity-100",
      )}
    />
  )
}
