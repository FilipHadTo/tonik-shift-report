"use client"

// PROTOTYPE — right column: the report's Sections. Jump to, see status,
// show or hide. Hidden Sections sit under "More sections".

import { useEffect, useState } from "react"
import { Check, Eye, EyeOff, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditor } from "./report-editor"
import { SECTIONS, hasContent, sectionState, type SectionId, type SectionState } from "./data"
import { IconBtn, Tip } from "./ui"

export function Rail() {
  const { report, dispatch, docRef, reveal } = useEditor()
  const active = useScrollSpy(docRef, report.visible)
  const shown = SECTIONS.filter((s) => report.visible.includes(s.id))
  const hidden = SECTIONS.filter((s) => !report.visible.includes(s.id))

  return (
    <nav aria-label="Sections" className="flex min-h-0 flex-col rounded-2xl bg-(--panel) shadow-(--shadow-panel)">
      <header className="flex h-12 shrink-0 items-center px-4">
        <h2 className="text-[13px] font-semibold">Sections</h2>
        <span className="ml-auto text-xs text-(--ink-3) tabular-nums">{shown.length} of {SECTIONS.length}</span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <ul className="flex flex-col">
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
                    "flex h-8 w-full items-center gap-2.5 rounded-lg pr-9 pl-2.5 text-left text-[13px] transition-colors duration-150",
                    active === s.id ? "bg-(--raise) text-(--ink)" : "text-(--ink-2) hover:bg-(--raise) hover:text-(--ink)",
                  )}
                >
                  <StateDot state={st.state} />
                  <span className="min-w-0 flex-1 truncate">{s.name}</span>
                  <StateLabel state={st.state} label={st.label} />
                </button>
                <span className="absolute top-0.5 right-1 opacity-0 transition-opacity duration-150 group-focus-within/row:opacity-100 group-hover/row:opacity-100">
                  {lockReason ? (
                    <Tip label={lockReason}>
                      <span tabIndex={0} aria-label={`Can't hide: ${lockReason}`} className="grid size-7 place-items-center text-(--ink-3) opacity-40">
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
            <h3 className="mt-5 mb-1 px-2.5 text-xs font-medium text-(--ink-3)">More sections</h3>
            <ul className="flex flex-col">
              {hidden.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: "toggleSection", section: s.id })
                      requestAnimationFrame(() => reveal(`section-${s.id}`))
                    }}
                    className="group/add flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-(--ink-3) transition-colors duration-150 hover:bg-(--raise) hover:text-(--ink)"
                  >
                    <Plus className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    <Eye className="size-3.5 opacity-0 transition-opacity duration-150 group-hover/add:opacity-100" strokeWidth={1.75} aria-hidden />
                    <span className="sr-only">Add section</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </nav>
  )
}

function StateDot({ state }: { state: SectionState }) {
  if (state === "done")
    return <Check className="size-3.5 shrink-0 text-(--ok)" strokeWidth={2.25} aria-hidden />
  return (
    <span
      aria-hidden
      className={cn(
        "mx-[3px] size-2 shrink-0 rounded-full",
        state === "gap" && "bg-(--gap)",
        state === "confirm" && "bg-(--ai)",
        state === "draft" && "border-[1.5px] border-(--ai)",
        state === "empty" && "border border-(--line-2)",
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
        state === "gap" && "font-medium text-(--gap)",
        state === "confirm" && "text-(--ai)",
        state === "draft" && "text-(--ai)",
        (state === "empty" || state === "done") && "text-(--ink-3)",
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
