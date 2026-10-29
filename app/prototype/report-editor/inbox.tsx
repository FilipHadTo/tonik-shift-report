"use client"

// PROTOTYPE — left column: the Night's Captures as an inbox the Closing Manager
// curates by hand. Draft into report, mark as written by hand, or dismiss.

import { useRef, useState } from "react"
import { Archive, ArrowUp, Check, ChevronRight, CornerDownRight, Paperclip, PenLine, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditor } from "./report-editor"
import { pendingSectionsOf, statusOf, targetsOf, nightMinutes, type InboxCapture } from "./data"
import { Avatar, Btn, IconBtn, KindLabel, PhotoThumb, VoiceThumb } from "./ui"

export function Inbox() {
  const { report, draft } = useEditor()
  const [showDismissed, setShowDismissed] = useState(false)
  const byTime = [...report.captures].sort((a, b) => nightMinutes(b.capturedAt) - nightMinutes(a.capturedAt))
  const fresh = byTime.filter((c) => ["new", "drafting"].includes(statusOf(report, c)))
  const processed = byTime.filter((c) => ["drafted", "in-report"].includes(statusOf(report, c)))
  const dismissed = byTime.filter((c) => c.dismissed)

  return (
    <aside aria-label="Inbox" className="flex min-h-0 flex-col rounded-2xl bg-(--panel) shadow-(--shadow-panel)">
      <header className="flex h-14 shrink-0 items-center gap-2 pr-3 pl-5">
        <h2 className="text-sm font-semibold">Inbox</h2>
        {fresh.length > 0 && (
          <span className="rounded-full bg-(--ai-soft) px-1.5 py-px text-xs font-medium text-(--ai) tabular-nums shadow-[inset_0_0_0_1px_var(--ai-ring)]">
            {fresh.length} new
          </span>
        )}
        {fresh.length > 0 && !report.submittedAt && (
          <Btn
            variant="ai"
            size="sm"
            className="ml-auto"
            disabled={fresh.every((c) => statusOf(report, c) === "drafting")}
            onClick={() => draft(fresh.filter((c) => statusOf(report, c) === "new").map((c) => c.id))}
          >
            <Sparkles strokeWidth={1.75} />
            Draft all
          </Btn>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-1 pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)]">
        {fresh.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {fresh.map((c) => (
              <NewTile key={c.id} capture={c} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center rounded-xl px-6 py-8 text-center shadow-[inset_0_0_0_1px_var(--line)]">
            <Check className="size-5 text-(--ok)" strokeWidth={2} aria-hidden />
            <p className="mt-2.5 text-[13px] font-medium">You&apos;re through the inbox</p>
            <p className="mt-1 text-xs leading-[1.5] text-pretty text-(--ink-3)">
              New Captures from you and your staff show up here.
            </p>
          </div>
        )}

        {processed.length > 0 && (
          <>
            <GroupLabel count={processed.length}>Processed</GroupLabel>
            <ul className="flex flex-col gap-0.5">
              {processed.map((c) => (
                <QuietTile key={c.id} capture={c} />
              ))}
            </ul>
          </>
        )}

        {dismissed.length > 0 && (
          <>
            <button
              type="button"
              aria-expanded={showDismissed}
              onClick={() => setShowDismissed((v) => !v)}
              className="mt-7 mb-2 flex items-center gap-1 rounded-md px-2 text-xs font-medium text-(--ink-3) hover:text-(--ink-2)"
            >
              <ChevronRight className={cn("size-3.5 transition-[rotate] duration-150", showDismissed && "rotate-90")} aria-hidden />
              Dismissed
              <span className="tabular-nums">{dismissed.length}</span>
            </button>
            {showDismissed && (
              <ul className="flex flex-col gap-0.5">
                {dismissed.map((c) => (
                  <QuietTile key={c.id} capture={c} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <Composer />
    </aside>
  )
}

function GroupLabel({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <h3 className="mt-7 mb-2 flex items-center gap-1.5 px-2 text-xs font-medium text-(--ink-3)">
      {children}
      <span className="tabular-nums">{count}</span>
    </h3>
  )
}

function Byline({ capture: c, size = 28 }: { capture: InboxCapture; size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar author={c.author} size={size} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-medium">{c.author.name}</span>
          <time className="ml-auto shrink-0 text-xs text-(--ink-3) tabular-nums">{c.capturedAt}</time>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-(--ink-3)">
          <span className="truncate">{c.author.role}</span>
          <span aria-hidden>·</span>
          <KindLabel kind={c.kind} />
        </div>
      </div>
    </div>
  )
}

function NewTile({ capture: c }: { capture: InboxCapture }) {
  const { report, dispatch, draft } = useEditor()
  const drafting = statusOf(report, c) === "drafting"

  return (
    <li className="enter rounded-xl bg-(--raise) p-4 shadow-[inset_0_0_0_1px_var(--line)]">
      <Byline capture={c} />

      <div className="mt-3">
        {c.kind === "chat" && c.chatLines ? (
          <ChatPreview capture={c} lines={3} />
        ) : (
          <p className="text-[13.5px] leading-[1.55] text-pretty">{c.text}</p>
        )}
        {c.photo && <PhotoThumb className="mt-3 h-[72px] w-[108px]" />}
        {c.kind === "voice" && <VoiceThumb className="mt-3 w-fit" />}
      </div>

      <div className="mt-4 flex h-8 items-center gap-0.5">
        {drafting ? (
          <span className="flex items-center gap-1.5 text-xs text-(--ai)" role="status">
            <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />
            <span className="shimmer font-medium">Drafting into the report…</span>
          </span>
        ) : (
          <>
            <IconBtn label="Dismiss" className="-ml-1.5" onClick={() => dispatch({ type: "dismiss", id: c.id })}>
              <Archive strokeWidth={1.75} />
            </IconBtn>
            <IconBtn label="I wrote it into the report myself" onClick={() => dispatch({ type: "handled", id: c.id })}>
              <PenLine strokeWidth={1.75} />
            </IconBtn>
            <Btn
              variant="secondary"
              className="ml-auto"
              onClick={() => draft([c.id])}
              aria-label={`Draft into report: ${c.author.name}, ${c.capturedAt}`}
            >
              <Sparkles className="text-(--ai)" strokeWidth={1.75} />
              Draft into report
            </Btn>
          </>
        )}
      </div>
    </li>
  )
}

function QuietTile({ capture: c }: { capture: InboxCapture }) {
  const { report, dispatch, draft, hot, setHot, reveal } = useEditor()
  const status = statusOf(report, c)
  const targets = targetsOf(report, c)
  const pending = pendingSectionsOf(c)
  const lit = hot?.from === "doc" && hot.captures.includes(c.id)

  return (
    <li
      onMouseEnter={() => status !== "dismissed" && setHot({ captures: [c.id], from: "inbox" })}
      onMouseLeave={() => setHot(null)}
      className={cn(
        "rounded-xl px-3 py-3 transition-[background-color,box-shadow] duration-150 hover:bg-(--raise)",
        lit && "linked bg-(--raise)",
      )}
    >
      <div className="flex items-center gap-2 text-xs">
        <Avatar author={c.author} size={20} />
        <span className="truncate font-medium text-(--ink-2)">{c.author.name}</span>
        <span className="truncate text-(--ink-3)">{c.author.role}</span>
        <time className="ml-auto shrink-0 text-(--ink-3) tabular-nums">{c.capturedAt}</time>
      </div>

      <p className="mt-1.5 line-clamp-2 pl-7 text-[13px] leading-[1.5] text-(--ink-3)">
        {c.kind === "chat" && c.chatLines ? `${c.text} · ${c.chatLines.length} messages` : c.text}
      </p>

      <div className="mt-2 flex min-h-6 flex-wrap items-center gap-x-1 gap-y-0.5 pl-7 text-xs">
        {status === "dismissed" ? (
          <>
            <span className="text-(--ink-3)">Not in the report</span>
            <Btn size="sm" variant="ghost" className="-my-1 ml-auto" onClick={() => dispatch({ type: "dismiss", id: c.id, undo: true })}>
              Restore
            </Btn>
          </>
        ) : (
          <>
            {status === "drafted" ? (
              <CornerDownRight className="size-3.5 shrink-0 text-(--ai)" aria-hidden />
            ) : (
              <Check className="size-3.5 shrink-0 text-(--ok)" strokeWidth={2.25} aria-hidden />
            )}
            {c.handled ? (
              <span className="text-(--ink-2)">Written into the report by hand</span>
            ) : (
              targets.map((t, i) => (
                <button
                  key={t.anchor}
                  type="button"
                  onClick={() => reveal(t.anchor)}
                  className="rounded-sm font-medium text-(--ink-2) hover:text-(--ink) hover:underline hover:underline-offset-2"
                >
                  {t.label}
                  {i < targets.length - 1 ? "," : ""}
                </button>
              ))
            )}
            {status === "drafted" && <span className="text-(--ai)">· to review</span>}
            {pending.length > 0 && !c.handled && (
              <Btn size="sm" variant="ai" className="-my-1 ml-auto" onClick={() => draft([c.id])}>
                Draft the rest
              </Btn>
            )}
          </>
        )}
      </div>
    </li>
  )
}

function ChatPreview({ capture: c, lines: max }: { capture: InboxCapture; lines: number }) {
  const lines = c.chatLines ?? []
  const shown = lines.slice(0, max)
  return (
    <div>
      <p className="text-xs text-(--ink-3)">
        {c.text} · {lines.length} messages
      </p>
      <ol className="mt-2 flex flex-col gap-1.5 rounded-lg bg-(--panel) px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
        {shown.map((l) => (
          <li key={l.at} className="grid grid-cols-[36px_1fr] text-[13px] leading-[1.45]">
            <span className="pt-px text-xs text-(--ink-3) tabular-nums">{l.at}</span>
            <span>
              <span className="font-medium">{l.who}</span> <span className="text-(--ink-2)">{l.text}</span>
            </span>
          </li>
        ))}
        {lines.length > shown.length && (
          <li className="pl-9 text-xs text-(--ink-3)">{lines.length - shown.length} more messages</li>
        )}
      </ol>
    </div>
  )
}

function Composer() {
  const { dispatch } = useEditor()
  const [text, setText] = useState("")
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const open = focused || text.length > 0

  function send() {
    const t = text.trim()
    if (!t) return
    dispatch({ type: "addCapture", text: t })
    setText("")
    ref.current?.focus()
  }

  return (
    <div className="composer shrink-0 px-3 pb-3">
      <div
        className={cn(
          "rounded-xl bg-(--raise) transition-shadow duration-150",
          open
            ? "shadow-[inset_0_0_0_1px_var(--line-2),0_0_0_3px_var(--ai-soft)]"
            : "shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--line-2)]",
        )}
      >
        <label htmlFor="composer" className="sr-only">
          New Capture
        </label>
        <textarea
          id="composer"
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder={open ? "What happened? Type it, or paste the group chat." : "Add a Capture…"}
          className={cn(
            "block w-full resize-none bg-transparent px-3.5 pt-3 text-[13.5px] leading-[1.5] outline-none placeholder:text-(--ink-3)",
            open ? "h-28" : "h-11",
          )}
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          <IconBtn label="Attach photo, video or document">
            <Paperclip strokeWidth={1.75} />
          </IconBtn>
          <span
            className={cn("ml-1 text-xs text-(--ink-3) transition-opacity duration-150", open ? "opacity-100" : "opacity-0")}
            aria-hidden={!open}
          >
            Kept as written · <kbd className="font-sans">↵</kbd> to add
          </span>
          <button
            type="button"
            aria-label="Add Capture"
            disabled={!text.trim()}
            // Keep focus in the textarea so the ring doesn't jump to a button that's about to disable itself.
            onMouseDown={(e) => e.preventDefault()}
            onClick={send}
            className="press ml-auto grid size-7 place-items-center rounded-lg bg-(--cta) text-(--cta-ink) disabled:bg-(--press) disabled:text-(--ink-3)"
          >
            <ArrowUp className="size-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  )
}
