"use client"

// PROTOTYPE — prototype-only bits of the Report screen mock. Shared primitives
// (Btn, IconBtn, Tip, Pop, Avatar, Kbd, chip, DraftLabel, thumbs) live in components/.

import { useState } from "react"
import { Camera, MessagesSquare, Mic, Type } from "lucide-react"
import { encode, QrCodeDataType } from "uqr"
import { cn } from "@/lib/utils"
import { PhotoThumb } from "@/components/evidence-thumb"
import { AI_CALM, photoSrc, type Capture, type InboxCapture } from "./data"
import { useEditor } from "./report-editor"

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

/**
 * A photo Capture as Evidence or in the Inbox: the real image a phone sent (ticket 18), else the
 * placeholder (seeded photos, or an image that can't be loaded).
 */
export function CapturePhoto({ capture: c, className }: { capture: InboxCapture; className?: string }) {
  const [failed, setFailed] = useState(false)
  const { id } = useEditor()
  if (c.photo !== "upload" || failed) return <PhotoThumb className={className} />
  return (
    // eslint-disable-next-line @next/next/no-img-element -- stored demo photo, already downsized on the phone
    <img
      src={photoSrc(id, c.id)}
      alt={c.text ? `Photo: ${c.text}` : `Photo from ${c.author.name}`}
      onError={() => setFailed(true)}
      className={cn("rounded-lg bg-press object-cover outline outline-1 -outline-offset-1 outline-img-outline", className)}
    />
  )
}

/** Scannable QR for the capture link, drawn in E's style: rounded modules, rounded finder patterns. */
export function Qr({ value, size = 152 }: { value: string; size?: number }) {
  const { data, types, size: n } = encode(value, { ecc: "M", border: 0 })
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
      // A QR needs dark on light in both themes, so it doesn't follow the tokens.
      className="text-[oklch(0.18_0_0)] [--qr-bg:oklch(1_0_0)]"
    >
      <rect x={-1} y={-1} width={n + 2} height={n + 2} rx={2} fill="var(--qr-bg)" />
      {data.flatMap((row, y) =>
        row.map((on, x) =>
          on && types[y][x] !== QrCodeDataType.Position ? (
            <rect key={`${x}.${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.25} fill="currentColor" />
          ) : null,
        ),
      )}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  )
}

/** Story 24: in place of the Draft button that was pressed, when the AI failed. Nothing was lost. */
export function CalmNote({ className }: { className?: string }) {
  return (
    <span role="status" className={cn("appear text-xs leading-[1.4] text-balance text-ink-2", className)}>
      {AI_CALM}
    </span>
  )
}
