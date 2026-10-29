"use client"

// PROTOTYPE chrome — floating variant switcher for /prototype routes.
// Not part of any design being evaluated. Hidden in production builds.

import { useCallback, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { ChevronLeft, ChevronRight, Moon, RotateCcw, Sun } from "lucide-react"

export type PrototypeVariant = { key: string; name: string }

export function useVariant(variants: PrototypeVariant[]) {
  const params = useSearchParams()
  const key = params.get("variant")?.toUpperCase()
  return variants.find((v) => v.key === key) ?? variants[0]
}

export function PrototypeSwitcher({
  variants,
  current,
  onReset,
  links,
  placement = "bottom",
}: {
  variants: PrototypeVariant[]
  current: PrototypeVariant
  onReset?: () => void
  links?: { href: string; label: string }[]
  /** "top" on mobile-first screens so the bar doesn't cover thumb-zone actions. */
  placement?: "top" | "bottom"
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const { resolvedTheme, setTheme } = useTheme()

  const go = useCallback(
    (delta: number) => {
      const i = variants.findIndex((v) => v.key === current.key)
      const next = variants[(i + delta + variants.length) % variants.length]
      const sp = new URLSearchParams(params.toString())
      sp.set("variant", next.key)
      router.replace(`${pathname}?${sp}`, { scroll: false })
    },
    [variants, current, params, pathname, router],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      if (t?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  if (process.env.NODE_ENV === "production") return null

  const btn =
    "grid size-8 place-items-center rounded-full hover:bg-background/15 focus-visible:outline-2 focus-visible:outline-background"

  return (
    <div className={`pointer-events-none fixed inset-x-0 z-[100] flex justify-center px-4 ${placement === "top" ? "top-2" : "bottom-4"}`}>
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-foreground px-1.5 py-1 text-background shadow-lg ring-1 ring-background/20">
        <span className="pl-2 pr-1 font-mono text-[10px] uppercase tracking-wider opacity-60">proto</span>
        <button className={btn} onClick={() => go(-1)} aria-label="Previous variant">
          <ChevronLeft className="size-4" />
        </button>
        <span className="whitespace-nowrap text-center text-sm tabular-nums sm:min-w-44">
          <b>{current.key}</b> <span className="hidden opacity-70 sm:inline">({current.name})</span>
        </span>
        <button className={btn} onClick={() => go(1)} aria-label="Next variant">
          <ChevronRight className="size-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-background/25" />
        <button
          className={btn}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle light/dark"
        >
          <Sun className="hidden size-4 dark:block" />
          <Moon className="size-4 dark:hidden" />
        </button>
        {onReset && (
          <button className={btn} onClick={onReset} aria-label="Reset demo">
            <RotateCcw className="size-4" />
          </button>
        )}
        {links?.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs hover:bg-background/15">
            {l.label} →
          </Link>
        ))}
      </div>
    </div>
  )
}
