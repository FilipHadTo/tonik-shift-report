"use client"

// PROTOTYPE — prototype-only bits of the Report screen mock. Shared primitives
// (Btn, IconBtn, Tip, Pop, Avatar, Kbd, chip, DraftLabel, thumbs) live in components/.

import { Camera, MessagesSquare, Mic, Type } from "lucide-react"
import type { Capture } from "./data"

const KIND = {
  photo: { icon: Camera, label: "Photo" },
  voice: { icon: Mic, label: "Voice note" },
  text: { icon: Type, label: "Text" },
  chat: { icon: MessagesSquare, label: "Pasted chat" },
} as const

export function KindLabel({ kind }: { kind: Capture["kind"] }) {
  const { icon: Icon, label } = KIND[kind]
  return (
    <span className="inline-flex items-center gap-1 text-ink-3">
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
      {label}
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
