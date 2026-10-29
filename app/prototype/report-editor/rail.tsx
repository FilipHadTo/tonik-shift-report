"use client"

// PROTOTYPE — right column: what's left before Submit, then the report's
// Sections. Jump to, see status, show or hide. Hidden ones sit under "More sections".

import { useEffect, useState } from "react"
import { Check, ChevronRight, Eye, EyeOff, Lock, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { IconBtn } from "@/components/btn"
import { Tip } from "@/components/tip"
import { useEditor } from "./report-editor"
import { SECTIONS, blockers, hasContent, isEmpty, openDrafts, orderedIncidents, sectionState, type IncidentField, type SectionId, type SectionState } from "./data"

export function Rail() {
  const { report, dispatch, docRef, reveal } = useEditor()
  const active = useScrollSpy(docRef, report.visible)
  const shown = SECTIONS.filter((s) => report.visible.includes(s.id))
  const hidden = SECTIONS.filter((s) => !report.visible.includes(s.id))
  const [more, setMore] = useState(false)

  return (
    <aside aria-label="Report outline" className="flex min-h-0 flex-col overflow-y-auto rounded-2xl bg-panel px-2 pt-3 pb-3 shadow-panel">
      {!report.submittedAt && <ToDo />}

      <nav aria-label="Sections" className={cn(!report.submittedAt && "mt-6")}>
        <header className="flex h-9 items-center px-2.5">
          <h2 className="text-[13px] font-semibold">Sections</h2>
          <span className="ml-auto text-xs text-ink-3 tabular-nums">{shown.length} of {SECTIONS.length}</span>
        </header>

        <ul className="mt-1 flex flex-col gap-px">
          {shown.map((s) => {
            const st = sectionState(report, s.id)
            const lockReason =
              s.id === "incidents" && report.incidents.some((i) => !i.confirmedAt)
                ? "Confirm or delete every Incident first"
                : hasContent(report, s.id)
                  ? "Clear this section to hide it"
                  : null
            return (
              <li key={s.id} className="group/row relative">
                <button
                  type="button"
                  aria-current={active === s.id ? "location" : undefined}
                  onClick={() => reveal(`section-${s.id}`)}
                  className={cn(
                    "flex h-9 w-full items-center gap-2.5 rounded-lg pr-9 pl-2.5 text-left text-[13px] transition-colors duration-150",
                    active === s.id ? "bg-raise text-ink" : "text-ink-2 hover:bg-raise hover:text-ink",
                  )}
                >
                  <StateDot state={st.state} />
                  <span className="min-w-0 flex-1 truncate" title={s.name}>{s.name}</span>
                  <StateLabel state={st.state} label={st.label} />
                </button>
                <span className="absolute top-1 right-1 opacity-0 transition-opacity duration-150 group-focus-within/row:opacity-100 group-hover/row:opacity-100">
                  {lockReason ? (
                    <Tip label={lockReason}>
                      <span tabIndex={0} aria-label={`Can't hide: ${lockReason}`} className="grid size-7 place-items-center text-ink-3 opacity-40">
                        <EyeOff className="size-4" strokeWidth={1.75} />
                      </span>
                    </Tip>
                  ) : (
                    <IconBtn label={`Hide ${s.name}`} onClick={() => dispatch({ type: "toggleSection", section: s.id })}>
                      <EyeOff strokeWidth={1.75} />
                    </IconBtn>
                  )}
                </span>
              </li>
            )
          })}
        </ul>

        {hidden.length > 0 && (
          <>
            <h3 className="mt-4">
              <button
                type="button"
                aria-expanded={more}
                aria-controls="more-sections"
                onClick={() => setMore((m) => !m)}
                className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs font-medium text-ink-3 transition-colors duration-150 hover:bg-raise hover:text-ink-2"
              >
                <ChevronRight
                  className={cn("size-3.5 shrink-0 transition-transform duration-200 ease-out", more && "rotate-90")}
                  strokeWidth={1.75}
                  aria-hidden
                />
                More sections
                <span className="ml-auto tabular-nums">{hidden.length}</span>
              </button>
            </h3>
            <div id="more-sections" className="disclose" data-open={more || undefined} inert={!more}>
            <ul className="flex flex-col gap-px">
              {hidden.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: "toggleSection", section: s.id })
                      requestAnimationFrame(() => reveal(`section-${s.id}`))
                    }}
                    className="group/add flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-ink-3 transition-colors duration-150 hover:bg-raise hover:text-ink"
                  >
                    <Plus className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    <Eye className="size-3.5 opacity-0 transition-opacity duration-150 group-hover/add:opacity-100" strokeWidth={1.75} aria-hidden />
                    <span className="sr-only">Add section</span>
                  </button>
                </li>
              ))}
            </ul>
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}

const MISSING: Record<IncidentField, string> = { occurredAt: "time", location: "location", type: "type" }

/** Everything that blocks Submit, one row per Incident, plus the Drafts nobody kept yet. */
function ToDo() {
  const { report, reveal } = useEditor()
  const b = blockers(report)
  const incidents = orderedIncidents(report)
  const open = incidents.map((i, n) => ({ i, n: n + 1 })).filter(({ i }) => !i.confirmedAt)
  const drafts = openDrafts(report)

  return (
    <section aria-labelledby="todo-h">
      <header className="flex h-9 items-center px-2.5">
        <h2 id="todo-h" className="text-[13px] font-semibold">
          Before you submit
        </h2>
        {!b.ready && !isEmpty(report) && (
          <span className="ml-auto text-xs text-ink-3 tabular-nums">{open.length + (drafts.length ? 1 : 0)} left</span>
        )}
      </header>

      {isEmpty(report) ? (
        // Onboarding, part 3 (story 3): what Submit means. Goes away with the report's first content.
        <div className="mt-1 flex items-start gap-2.5 rounded-xl px-3 py-3 shadow-[inset_0_0_0_1px_var(--line)]">
          <Lock className="mt-px size-4 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-[13px] leading-tight font-medium">Nothing to check yet</p>
            <p className="mt-1 text-xs leading-[1.5] text-pretty text-ink-3">
              Incidents to confirm and their Gaps collect here. Submit locks the report; after that, only a dated
              Addendum.
            </p>
          </div>
        </div>
      ) : b.ready ? (
        <div className="mt-1 flex items-start gap-2.5 rounded-xl bg-raise px-3 py-3 shadow-[inset_0_0_0_1px_var(--line)]">
          <Check className="mt-px size-4 shrink-0 text-ok" strokeWidth={2.25} aria-hidden />
          <div className="leading-tight">
            <p className="text-[13px] font-medium">Ready to submit</p>
            <p className="mt-1 text-xs text-ink-3">Every Incident confirmed, every AI draft checked.</p>
          </div>
        </div>
      ) : (
        <ul className="mt-1 flex flex-col gap-px">
          {open.map(({ i, n }) => {
            const missing = (Object.keys(i.fields) as IncidentField[]).filter((f) => ["gap", "empty"].includes(i.fields[f].status))
            return (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => reveal(i.id)}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-raise"
                >
                  <span
                    aria-hidden
                    className={cn("mx-[3px] mt-[5px] size-1.5 shrink-0 rounded-full", missing.length ? "bg-gap" : "bg-ink-3")}
                  />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="flex gap-1.5 text-[13px]">
                      <span className="text-ink-3 tabular-nums">{n}</span>
                      <span className="truncate text-ink-2">{i.title || "Untitled Incident"}</span>
                    </span>
                    <span className="mt-1 block text-xs text-ink-3">
                      {missing.length ? `Add ${missing.map((f) => MISSING[f]).join(", ")}` : "Ready to confirm"}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {drafts.length > 0 && (
        <button
          type="button"
          onClick={() => reveal(drafts[0])}
          className="mt-px flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-raise"
        >
          <span aria-hidden className="mx-[3px] mt-[5px] size-1.5 shrink-0 rounded-full border border-ai" />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[13px] text-ink-2">
              {drafts.length === 1 ? "1 AI draft" : `${drafts.length} AI drafts`}
            </span>
            <span className="mt-1 block text-xs text-ink-3">Keep or discard</span>
          </span>
        </button>
      )}
    </section>
  )
}

function StateDot({ state }: { state: SectionState }) {
  if (state === "done")
    return <Check className="size-3.5 shrink-0 text-ok" strokeWidth={2.25} aria-hidden />
  return (
    <span
      aria-hidden
      className={cn(
        "mx-[3px] size-2 shrink-0 rounded-full",
        state === "gap" && "bg-gap",
        state === "confirm" && "bg-ai",
        state === "draft" && "border-[1.5px] border-ai",
        state === "empty" && "border border-line-2",
      )}
    />
  )
}

function StateLabel({ state, label }: { state: SectionState; label: string }) {
  if (!label) return null
  return (
    <span
      className={cn(
        "shrink-0 text-xs tabular-nums",
        state === "gap" && "font-medium text-gap",
        state === "confirm" && "text-ai",
        state === "draft" && "text-ai",
        (state === "empty" || state === "done") && "text-ink-3",
      )}
    >
      {label}
    </span>
  )
}

function useScrollSpy(root: React.RefObject<HTMLDivElement | null>, visible: SectionId[]) {
  const [active, setActive] = useState<SectionId | null>(null)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const onScroll = () => {
      const top = el.getBoundingClientRect().top + 120
      let current: SectionId | null = null
      el.querySelectorAll<HTMLElement>("[data-section]").forEach((s) => {
        if (s.getBoundingClientRect().top <= top) current = s.dataset.section as SectionId
      })
      setActive(current ?? (el.querySelector<HTMLElement>("[data-section]")?.dataset.section as SectionId))
    }
    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [root, visible])
  return active
}
