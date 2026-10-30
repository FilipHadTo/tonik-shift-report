"use client"

// PROTOTYPE — center column: the Shift Report as a document. Sections are free
// text, Incidents are structured blocks. Tinted wash = Draft.

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, EyeOff, FileText, PenLine, Plus, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { Btn, IconBtn } from "@/components/btn"
import { DraftLabel } from "@/components/draft-label"
import { useEditor } from "./report-editor"
import { REPORTS_PATH, SECTIONS, hasContent, previewPath, newCapturesFor, orderedIncidents, scopeKey, type Block, type SectionId } from "./data"
import { CalmNote } from "./ui"
import { IncidentBlock } from "./incident"
import { EnhanceBar, Enhancing } from "./enhance"

export function Document() {
  const { report, docRef } = useEditor()
  // Once sent, the report reads as a record: a Section nobody wrote in isn't shown (as in the Preview).
  const visible = SECTIONS.filter((s) => report.visible.includes(s.id) && (!report.submittedAt || hasContent(report, s.id)))
  const captures = report.captures.filter((c) => !c.dismissed).length
  const people = new Set(report.captures.filter((c) => !c.dismissed).map((c) => c.author.name)).size

  return (
    <main
      ref={docRef}
      aria-label="Shift Report"
      className="min-h-0 overflow-y-auto rounded-2xl bg-panel shadow-panel"
    >
      <div className="mx-auto max-w-[720px] px-14 pt-16 pb-40">
        <p className="text-xs font-medium tracking-[0.04em] text-ink-3 uppercase">Shift Report · {report.venue}</p>
        <h1 className="mt-2 text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
          Night of {report.night}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-3">
          <span className="inline-flex items-center gap-1.5 text-ink-2">
            <Avatar author={report.manager} size={18} />
            {report.manager.name}
          </span>
          <span aria-hidden>·</span>
          <span>Started {report.startedAt}</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">
            {captures === 0
              ? report.submittedAt
                ? "No Captures"
                : "No Captures yet"
              : `${captures} ${captures === 1 ? "Capture" : "Captures"} from ${people} ${people === 1 ? "person" : "people"}`}
          </span>
        </p>

        {report.submittedAt && <Sent />}

        {!report.drafted && !report.submittedAt && <HowItWorks />}

        <div className="mt-12 flex flex-col gap-16">
          {visible.map((s) => (
            <Section key={s.id} id={s.id} name={s.name} />
          ))}
        </div>
      </div>
      <EnhanceBar />
    </main>
  )
}

/**
 * After Submit (stories 56, 67): the report is sent and locked, the manager can leave. The way into
 * the final document (Preview) and back to Reports sit right here, where the eye lands after the sheet.
 */
function Sent() {
  const { id, report } = useEditor()
  const ref = useRef<HTMLElement>(null)
  // Submit closes the sheet and the button that opened it is gone: land focus on the outcome, where the next
  // steps are. Also on opening a sent report, which starts here anyway.
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="sent-title"
      className="enter mt-8 flex items-center gap-4 rounded-xl bg-raise py-3.5 outline-none pr-3.5 pl-4 shadow-[inset_0_0_0_1px_var(--line)]"
    >
      <Check className="size-5 shrink-0 text-ok" strokeWidth={2.25} aria-hidden />
      <div className="min-w-0 flex-1">
        <h2 id="sent-title" className="text-[13px] font-medium tabular-nums">
          Sent at {report.submittedAt}. You&apos;re done for tonight.
        </h2>
        <p className="mt-0.5 text-[13px] text-pretty text-ink-3">
          Submitted by {(report.submittedBy ?? report.manager).name} and locked. Changes are only possible as a dated
          Addendum.
        </p>
      </div>
      <Btn variant="ghost" nativeButton={false} render={<Link href={REPORTS_PATH} />}>
        Back to Reports
      </Btn>
      <Btn nativeButton={false} render={<Link href={previewPath(id)} />}>
        <FileText strokeWidth={1.75} />
        Preview
      </Btn>
    </section>
  )
}

/**
 * Onboarding, part 2 (story 3): how text gets into the report and what a Draft looks like.
 * Goes away once the first Draft is made in this report (story 4).
 */
function HowItWorks() {
  return (
    <section
      aria-label="How this report gets written"
      className="enter mt-10 rounded-xl px-5 pt-4 pb-5 shadow-[inset_0_0_0_1px_var(--line)]"
    >
      <h2 className="text-[13px] font-medium">How this report gets written</h2>
      <ul className="mt-3 flex flex-col gap-2.5 text-[13px] leading-[1.5] text-ink-2">
        <li className="flex gap-2.5">
          <PenLine className="mt-0.5 size-4 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden />
          <span>Write into any Section yourself, or leave it empty. Every Section is optional.</span>
        </li>
        <li className="flex gap-2.5">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-ai" strokeWidth={1.75} aria-hidden />
          <span>
            The AI drafts only when you ask: one Capture, one Section, or everything new in the Inbox. Select text
            you wrote to Enhance it.
          </span>
        </li>
      </ul>
      {/* A real sample of the Draft look, so the wash means something before the first one arrives. */}
      <div aria-hidden className="mt-4 rounded-lg bg-(image:--ai-wash) px-3.5 pt-2.5 pb-3">
        <DraftLabel sources={[]} />
        <p className="mt-1.5 text-[13px] leading-[1.5] text-ink-2">
          AI text looks like this until you check it. Keep or discard Section Drafts; confirm each Incident on its
          own.
        </p>
      </div>
    </section>
  )
}

function Section({ id, name }: { id: SectionId; name: string }) {
  const { report, dispatch, draft, calm, calmText, flash } = useEditor()
  const fresh = newCapturesFor(report, id)
  const calmHere = calm === scopeKey({ section: id })
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
      <div className="mb-4 flex min-h-8 items-center gap-2">
        <h2 id={`h-${id}`} className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">
          {name}
        </h2>
        {id === "incidents" && report.incidents.length > 0 && (
          <span className="text-[13px] text-ink-3 tabular-nums">
            {report.incidents.filter((i) => i.confirmedAt).length} of {report.incidents.length} confirmed
          </span>
        )}
        {!locked && (
          <span
            className={cn(
              "ml-auto flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-focus-within/section:opacity-100 group-hover/section:opacity-100",
              calmHere && "opacity-100",
            )}
          >
            {calmHere ? (
              <CalmNote text={calmText} />
            ) : fresh.length > 0 && (
              <Btn size="sm" variant="ai" onClick={() => draft({ section: id })}>
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
        <div className="flex flex-col gap-3">
          {blocks.map((b) => (
            <TextBlock key={b.id} block={b} />
          ))}
          {!locked && blocks.length === 0 && <Writer section={id} hasNew={fresh.length > 0} />}
        </div>
      )}
    </section>
  )
}

function Incidents() {
  const { report, dispatch } = useEditor()
  const incidents = orderedIncidents(report)
  return (
    <div className="flex flex-col gap-4">
      {/* Submitted with none: say nothing, like any other empty Section ("Not covered tonight" covers it). */}
      {incidents.length === 0 && !report.submittedAt && (
        <p className="text-[15px] leading-[1.65] text-pretty text-ink-3">
          No Incidents yet. Draft them from the Inbox or add one by hand; each one needs your Confirm.
        </p>
      )}
      {incidents.map((i, n) => (
        <IncidentBlock
          key={i.id}
          incident={i}
          number={n + 1}
          joinPrev={!!i.confirmedAt && !!incidents[n - 1]?.confirmedAt}
        />
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
  const { report, dispatch, enhancing, hot, setHot, flash } = useEditor()
  const isDraft = b.status === "draft"
  const lit = (hot?.from === "inbox" && b.sources.some((s) => hot.captures.includes(s))) || flash === b.id
  const sources = report.captures.filter((c) => b.sources.includes(c.id))
  const locked = !!report.submittedAt
  const busy = enhancing === b.id

  return (
    <div
      id={b.id}
      onMouseEnter={() => b.sources.length && setHot({ captures: b.sources, from: "doc" })}
      onMouseLeave={() => setHot(null)}
      className={cn(
        "enter -mx-4 scroll-mt-24 rounded-xl px-4 transition-[box-shadow,background-color] duration-200",
        isDraft ? "bg-(image:--ai-wash) pt-2.5 pb-3.5" : busy ? "pt-2.5 pb-1" : "py-1",
        lit && "linked",
      )}
    >
      {busy && <Enhancing />}
      {isDraft && (
        <div className="flex h-8 items-center gap-1">
          <DraftLabel sources={sources} note={b.original ? "from your text" : undefined} className="mr-auto" />
          <Btn size="sm" variant="ghost" onClick={() => dispatch({ type: "discard", block: b.id })}>
            Discard
          </Btn>
          <Btn size="sm" variant="secondary" className="-mr-1.5" onClick={() => dispatch({ type: "keep", block: b.id })}>
            <Check strokeWidth={2.25} />
            Keep
          </Btn>
        </div>
      )}
      <p
        // Remount on every text change: the DOM may hold typed text React doesn't know about.
        key={b.text}
        contentEditable={!locked && !busy}
        suppressContentEditableWarning
        // Only text the manager wrote can be enhanced, never AI text, kept or not.
        data-enhance={!locked && b.status === "manual" && !busy ? `block:${b.id}` : undefined}
        onBlur={(e) => {
          const text = e.currentTarget.textContent ?? ""
          if (text !== b.text) dispatch({ type: "editBlock", block: b.id, text })
        }}
        className={cn("text-[15px] leading-[1.65] text-pretty", isDraft && "mt-1")}
      >
        {b.text}
      </p>
    </div>
  )
}

/** Empty Section: click and type, like a Notion block. */
function Writer({ section, hasNew }: { section: SectionId; hasNew: boolean }) {
  const { dispatch } = useEditor()
  const [key, setKey] = useState(0)
  return (
    <p
      key={key}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Write in this section"
      data-placeholder={hasNew ? "Write here, or draft it from the inbox" : "Write here, or leave it empty if there's nothing to report"}
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
      className="-mx-4 cursor-text rounded-xl px-4 py-1 text-[15px] leading-[1.65]"
    />
  )
}
