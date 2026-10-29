"use client"

// PROTOTYPE — demo controls for the reviewer (stories 59, 60): jump between the
// empty report at 20:00 and the Night at 02:15, reset either, flip the theme.
// Not part of the product UI, so it sits apart: a floating pill at the bottom.

import { useTheme } from "next-themes"
import { Moon, RotateCcw, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { IconBtn } from "@/components/btn"
import { useEditor } from "./report-editor"
import { SCENES, type Scene } from "./data"

export function DemoBar() {
  const { report, setScene } = useEditor()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center">
      <div
        role="group"
        aria-label="Demo"
        className="pointer-events-auto flex items-center gap-1 rounded-full bg-panel p-1 pl-4 text-[13px] shadow-pop"
      >
        <span className="mr-2 text-xs font-medium tracking-[0.04em] text-ink-3 uppercase">Demo</span>
        <div role="radiogroup" aria-label="Moment of the Night" className="flex items-center gap-0.5">
          {(Object.keys(SCENES) as Scene[]).map((s) => {
            const on = report.scene === s
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => !on && setScene(s)}
                className={cn(
                  "press flex h-8 items-center gap-1.5 rounded-full px-3",
                  on ? "bg-press text-ink" : "text-ink-3 hover:text-ink",
                )}
              >
                <span className="font-medium tabular-nums">{SCENES[s].at}</span>
                <span className={on ? "text-ink-2" : undefined}>{SCENES[s].label}</span>
              </button>
            )
          })}
        </div>
        <span aria-hidden className="mx-1 h-5 w-px bg-line" />
        <IconBtn label={`Reset ${SCENES[report.scene].at}`} className="rounded-full" onClick={() => setScene(report.scene)}>
          <RotateCcw strokeWidth={1.75} />
        </IconBtn>
        <IconBtn
          label="Switch theme"
          className="mr-0.5 rounded-full"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {/* Both icons render; CSS picks one, so the server and client markup match. */}
          <Sun strokeWidth={1.75} className="hidden dark:block" />
          <Moon strokeWidth={1.75} className="dark:hidden" />
        </IconBtn>
      </div>
    </div>
  )
}
