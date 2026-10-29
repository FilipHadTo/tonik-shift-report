import { Image as ImageIcon, Mic } from "lucide-react"
import { cn } from "@/lib/utils"

/** Photo Evidence placeholder until real uploads exist. */
export function PhotoThumb({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Photo"
      className={cn("grid place-items-center rounded-lg bg-press text-ink-3 shadow-[inset_0_0_0_1px_var(--line)]", className)}
    >
      <ImageIcon className="size-5" strokeWidth={1.5} aria-hidden />
    </span>
  )
}

const BARS = [4, 9, 6, 12, 8, 14, 10, 6, 11, 7, 13, 5, 9, 4, 7, 3]

/** Voice note Evidence: static waveform and duration. */
export function VoiceThumb({ duration = "0:14", className }: { duration?: string; className?: string }) {
  return (
    <span className={cn("flex h-9 items-center gap-2 rounded-md bg-raise px-2.5", className)}>
      <Mic className="size-3.5 text-ink-3" aria-hidden />
      <span className="flex h-4 items-center gap-[2px]" aria-hidden>
        {BARS.map((h, i) => (
          <span key={i} className="w-[2px] rounded-full bg-ink-3" style={{ height: h }} />
        ))}
      </span>
      <span className="text-xs text-ink-3 tabular-nums">{duration}</span>
    </span>
  )
}
