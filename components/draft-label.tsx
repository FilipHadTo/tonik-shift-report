import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"

export type DraftSource = { id: string; author: { name: string }; capturedAt: string }

/** "AI draft from …" line on top of every Draft: Section, Incident or Enhance result. */
export function DraftLabel({ sources, className }: { sources: DraftSource[]; className?: string }) {
  return (
    <p className={cn("flex items-center gap-1.5 text-xs text-ink-3", className)}>
      <Sparkles className="size-3.5 text-ai" strokeWidth={1.75} aria-hidden />
      <span className="font-medium text-ai">AI draft</span>
      {sources.length > 0 && <span>from</span>}
      {sources.map((c, i) => (
        <span key={c.id} className="inline-flex items-center gap-1 text-ink-2">
          <Avatar author={c.author} size={16} />
          {c.author.name.split(" ")[0]}
          <span className="text-ink-3 tabular-nums">{c.capturedAt}</span>
          {i < sources.length - 1 && <span className="text-ink-3">,</span>}
        </span>
      ))}
    </p>
  )
}
