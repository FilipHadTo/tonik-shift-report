"use client"

// PROTOTYPE — small hand-styled primitives for the Report screen mock.
// Base UI handles focus, dismissal and positioning; styling is ours.

import { Popover } from "@base-ui/react/popover"
import { Tooltip } from "@base-ui/react/tooltip"
import { Camera, MessagesSquare, Mic, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Author, Capture } from "./data"

type BtnProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "ai"
  size?: "sm" | "md"
}

export function Btn({ variant = "secondary", size = "md", className, ...props }: BtnProps) {
  return (
    <button
      type="button"
      className={cn(
        "press inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
        size === "md" ? "h-8 px-3 text-[13px]" : "h-7 px-2.5 text-xs",
        variant === "primary" && "bg-(--cta) text-(--cta-ink) hover:opacity-90",
        variant === "secondary" && "bg-(--raise) text-(--ink) shadow-[inset_0_0_0_1px_var(--line)] hover:bg-(--press)",
        variant === "ghost" && "text-(--ink-2) hover:bg-(--raise) hover:text-(--ink)",
        variant === "ai" && "text-(--ai) hover:bg-(--ai-soft) [&_svg]:text-(--ai)",
        className,
      )}
      {...props}
    />
  )
}

export function IconBtn({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <Tip label={label}>
      <button
        type="button"
        aria-label={label}
        className={cn(
          "press relative grid size-7 shrink-0 place-items-center rounded-md text-(--ink-3) hover:bg-(--raise) hover:text-(--ink) disabled:opacity-40 [&_svg]:size-4",
          // 28px box, 36px hit area
          "after:absolute after:-inset-1 after:content-['']",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </Tip>
  )
}

export function Tip({ label, children }: { label: React.ReactNode; children: React.ReactElement }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6} className="z-50">
          <Tooltip.Popup className="rx rx-pop rounded-md bg-(--cta) px-2 py-1 text-xs text-(--cta-ink)">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function Pop({
  trigger,
  children,
  className,
  side = "bottom",
  align = "start",
  open,
  onOpenChange,
}: {
  trigger: React.ReactElement
  children: React.ReactNode
  className?: string
  side?: "bottom" | "top" | "left" | "right"
  align?: "start" | "center" | "end"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger render={trigger} />
      <Popover.Portal>
        <Popover.Positioner side={side} align={align} sideOffset={6} className="z-50">
          <Popover.Popup
            className={cn(
              "rx rx-pop rounded-xl bg-(--panel) p-1.5 text-[13px] shadow-(--shadow-pop) outline-none",
              className,
            )}
          >
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

const HUES: Record<string, number> = { "Alex Morgan": 258, Marek: 30, Jess: 330, Tom: 150 }

export function Avatar({ author, size = 20 }: { author: Pick<Author, "name">; size?: number }) {
  const hue = HUES[author.name] ?? 200
  const initials = author.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `oklch(0.7 0.09 ${hue} / 0.22)`,
        color: `oklch(0.6 0.12 ${hue})`,
      }}
    >
      {initials}
    </span>
  )
}

const KIND = {
  photo: { icon: Camera, label: "Photo" },
  voice: { icon: Mic, label: "Voice note" },
  text: { icon: Type, label: "Text" },
  chat: { icon: MessagesSquare, label: "Pasted chat" },
} as const

export function KindLabel({ kind }: { kind: Capture["kind"] }) {
  const { icon: Icon, label } = KIND[kind]
  return (
    <span className="inline-flex items-center gap-1 text-(--ink-3)">
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
      {label}
    </span>
  )
}

/** Stand-in for a phone photo: a dark pane with a crack. Upload is fake in the prototype. */
export function PhotoThumb({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Photo of a smashed window"
      className={cn("relative block overflow-hidden rounded-md", className)}
      style={{
        background:
          "radial-gradient(120% 90% at 30% 20%, oklch(0.55 0.04 230), oklch(0.28 0.03 240) 60%, oklch(0.18 0.02 250))",
        outline: "1px solid var(--img-outline)",
        outlineOffset: -1,
      }}
    >
      <svg viewBox="0 0 80 60" className="absolute inset-0 size-full" aria-hidden>
        <g stroke="oklch(0.95 0 0 / 0.75)" strokeWidth="0.7" fill="none" strokeLinecap="round">
          <path d="M44 26 L58 6 M44 26 L76 22 M44 26 L70 50 M44 26 L40 58 M44 26 L12 44 M44 26 L18 8 M44 26 L36 2" />
          <path d="M50 18 L54 28 L48 34 L38 32 L36 22 Z" />
          <path d="M56 12 L64 26 L58 40 L42 42 L28 36 L26 20 L36 12 Z" strokeWidth="0.5" />
        </g>
      </svg>
    </span>
  )
}

export function VoiceThumb({ className }: { className?: string }) {
  const bars = [4, 9, 6, 12, 8, 14, 10, 6, 11, 7, 13, 5, 9, 4, 7, 3]
  return (
    <span className={cn("flex h-9 items-center gap-2 rounded-md bg-(--raise) px-2.5", className)}>
      <Mic className="size-3.5 text-(--ink-3)" aria-hidden />
      <span className="flex h-4 items-center gap-[2px]" aria-hidden>
        {bars.map((h, i) => (
          <span key={i} className="w-[2px] rounded-full bg-(--ink-3)" style={{ height: h }} />
        ))}
      </span>
      <span className="text-xs text-(--ink-3) tabular-nums">0:14</span>
    </span>
  )
}

/** Fake QR: finder patterns plus deterministic noise. Not scannable. */
export function FakeQr({ size = 152 }: { size?: number }) {
  const n = 25
  const cells: [number, number][] = []
  let seed = 7
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rand() > 0.52) cells.push([x, y])
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} rx={1.6} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={1} fill="var(--qr-bg)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="currentColor" />
    </g>
  )
  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      width={size}
      height={size}
      role="img"
      aria-label="QR code for the staff link"
      className="text-[oklch(0.18_0_0)] [--qr-bg:oklch(1_0_0)]"
    >
      <rect x={-1} y={-1} width={n + 2} height={n + 2} rx={2} fill="var(--qr-bg)" />
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.25} fill="currentColor" />
      ))}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  )
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-(--line-2) px-1 font-sans text-[10px] text-(--ink-3)">{children}</kbd>
  )
}
