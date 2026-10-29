"use client"

// PROTOTYPE — left column: the Night's Captures as an inbox the Closing Manager
// curates by hand. Draft into report, mark as written by hand, or dismiss.

import { useRef, useState } from "react"
import { Archive, ArrowUp, Check, ChevronRight, Copy, CornerDownRight, Link2, Paperclip, PenLine, Sparkles, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditor } from "./report-editor"
import { pendingSectionsOf, statusOf, targetsOf, nightMinutes, type InboxCapture } from "./data"
import { Avatar, Btn, FakeQr, IconBtn, KindLabel, PhotoThumb, Pop, VoiceThumb } from "./ui"

export function Inbox() {
  const { report } = useEditor()
  const [showDismissed, setShowDismissed] = useState(false)
  const byTime = [...report.captures].sort((a, b) => nightMinutes(b.capturedAt) - nightMinutes(a.capturedAt))
  const fresh = byTime.filter((c) => ["new", "drafting"].includes(statusOf(report, c)))
  const processed = byTime.filter((c) => ["drafted", "in-report"].includes(statusOf(report, c)))
  const dismissed = byTime.filter((c) => c.dismissed)

  return (
    <aside aria-label="Inbox" className="flex min-h-0 flex-col rounded-2xl bg-(--panel) shadow-(--shadow-panel)">
      <header className="flex h-12 shrink-0 items-center gap-2 pr-2 pl-4">
        <h2 className="text-[13px] font-semibold">Inbox</h2>
        <span className="text-[13px] text-(--ink-3) tabular-nums">{fresh.length} new</span>
        <InviteStaff />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {fresh.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {fresh.map((c) => (
              <Tile key={c.id} capture={c} />
            ))}
          </ul>
        ) : (
          <p className="mx-2 rounded-lg px-3 py-6 text-center text-[13px] text-(--ink-3) shadow-[inset_0_0_0_1px_var(--line)]">
            Nothing new. Captures from you and your staff land here.
          </p>
        )}

        {processed.length > 0 && (
          <>
            <GroupLabel>Processed</GroupLabel>
            <ul className="flex flex-col gap-1">
              {processed.map((c) => (
                <Tile key={c.id} capture={c} />
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
              className="mt-4 flex w-full items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-(--ink-3) hover:text-(--ink-2)"
            >
              <ChevronRight className={cn("size-3.5 transition-[rotate] duration-150", showDismissed && "rotate-90")} />
              Dismissed · {dismissed.length}
            </button>
            {showDismissed && (
              <ul className="mt-1 flex flex-col gap-1">
                {dismissed.map((c) => (
                  <Tile key={c.id} capture={c} />
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

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-5 mb-1.5 px-2 text-xs font-medium text-(--ink-3)">{children}</h3>
}

function Tile({ capture: c }: { capture: InboxCapture }) {
  const { report, dispatch, draft, hot, setHot, reveal } = useEditor()
  const status = statusOf(report, c)
  const targets = targetsOf(report, c)
  const pending = pendingSectionsOf(c)
  const lit = hot?.from === "doc" && hot.captures.includes(c.id)
  const quiet = status === "in-report" || status === "dismissed"

  return (
    <li
      onMouseEnter={() => status !== "new" && setHot({ captures: [c.id], from: "inbox" })}
      onMouseLeave={() => setHot(null)}
      className={cn(
        "group rounded-[10px] p-3 transition-[background-color,box-shadow] duration-150",
        status === "new" || status === "drafting"
          ? "bg-(--raise) shadow-[inset_0_0_0_1px_var(--line)]"
          : "hover:bg-(--raise)",
        lit && "linked",
      )}
    >
      <div className="flex items-center gap-2 text-xs">
        <Avatar author={c.author} />
        <span className={cn("truncate font-medium", quiet ? "text-(--ink-2)" : "text-(--ink)")}>{c.author.name}</span>
        <span className="truncate text-(--ink-3)">{c.author.role}</span>
        <time className="ml-auto shrink-0 text-(--ink-3) tabular-nums">{c.capturedAt}</time>
      </div>

      <div className={cn("mt-2", quiet && "opacity-70")}>
        {c.kind === "chat" && c.chatLines ? (
          <ChatPreview capture={c} compact={status !== "new"} />
        ) : (
          <p
            className={cn(
              "text-[13px] leading-[1.5] text-pretty text-(--ink)",
              status !== "new" && status !== "drafting" && "line-clamp-2",
            )}
          >
            {c.text}
          </p>
        )}
        {c.photo && status !== "in-report" && <PhotoThumb className="mt-2.5 h-16 w-24" />}
        {c.kind === "voice" && status === "new" && <VoiceThumb className="mt-2.5 w-fit" />}
      </div>

      <div className="mt-2.5 flex items-center gap-1 text-xs">
        {status === "new" && (
          <>
            <KindLabel kind={c.kind} />
            <span className="ml-auto flex items-center gap-0.5">
              <IconBtn label="Dismiss" onClick={() => dispatch({ type: "dismiss", id: c.id })}>
                <Archive strokeWidth={1.75} />
              </IconBtn>
              <IconBtn label="I wrote it into the report myself" onClick={() => dispatch({ type: "handled", id: c.id })}>
                <PenLine strokeWidth={1.75} />
              </IconBtn>
              <Btn
                size="sm"
                variant="secondary"
                className="ml-1"
                onClick={() => draft([c.id])}
                aria-label={`Draft into report: ${c.author.name}, ${c.capturedAt}`}
              >
                <Sparkles className="text-(--ai)" strokeWidth={1.75} />
                {c.applied.length ? "Draft the rest" : "Draft into report"}
              </Btn>
            </span>
          </>
        )}

        {status === "drafting" && (
          <span className="flex h-7 items-center gap-1.5 text-(--ai)" role="status">
            <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />
            <span className="shimmer font-medium">Drafting into the report…</span>
          </span>
        )}

        {(status === "drafted" || status === "in-report") && (
          <span className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
            {status === "drafted" ? (
              <CornerDownRight className="size-3.5 shrink-0 text-(--ai)" aria-hidden />
            ) : (
              <Check className="size-3.5 shrink-0 text-(--ok)" aria-hidden />
            )}
            <span className="text-(--ink-3)">{status === "drafted" ? "Drafted to" : "In report:"}</span>
            {c.handled ? (
              <span className="text-(--ink-2)">written by hand</span>
            ) : (
              targets.map((t, i) => (
                <button
                  key={t.anchor}
                  type="button"
                  onClick={() => reveal(t.anchor)}
                  className="rounded px-0.5 font-medium text-(--ink-2) underline decoration-(--line-2) underline-offset-2 hover:text-(--ink) hover:decoration-(--ink-3)"
                >
                  {t.label}
                  {i < targets.length - 1 ? "," : ""}
                </button>
              ))
            )}
            {status === "drafted" && <span className="text-(--ink-3)">· to review</span>}
            {pending.length > 0 && !c.handled && (
              <Btn size="sm" variant="ai" className="ml-auto -mr-1" onClick={() => draft([c.id])}>
                Draft the rest
              </Btn>
            )}
          </span>
        )}

        {status === "dismissed" && (
          <>
            <KindLabel kind={c.kind} />
            <Btn size="sm" variant="ghost" className="ml-auto -mr-1" onClick={() => dispatch({ type: "dismiss", id: c.id, undo: true })}>
              Restore
            </Btn>
          </>
        )}
      </div>
    </li>
  )
}

function ChatPreview({ capture: c, compact }: { capture: InboxCapture; compact: boolean }) {
  const lines = c.chatLines ?? []
  const shown = compact ? lines.slice(0, 1) : lines.slice(0, 4)
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[13px] text-(--ink-2)">
        {c.text} · {lines.length} messages
      </p>
      <ol className="flex flex-col gap-1 border-l-2 border-(--line-2) pl-2.5">
        {shown.map((l) => (
          <li key={l.at} className="text-[13px] leading-[1.45]">
            <span className="mr-1.5 text-xs text-(--ink-3) tabular-nums">{l.at}</span>
            <span className="font-medium">{l.who}:</span> {l.text}
          </li>
        ))}
        {lines.length > shown.length && (
          <li className="text-xs text-(--ink-3)">+{lines.length - shown.length} more</li>
        )}
      </ol>
    </div>
  )
}

function InviteStaff() {
  const [copied, setCopied] = useState(false)
  const url = "halo.shift.report/n/24-oct/j8k2"
  return (
    <Pop
      align="end"
      className="w-[296px] p-4"
      trigger={
        <Btn variant="ghost" size="sm" className="ml-auto">
          <UserPlus strokeWidth={1.75} />
          Invite staff
        </Btn>
      }
    >
      <h3 className="text-[13px] font-semibold">Invite staff to tonight&apos;s report</h3>
      <p className="mt-1 text-xs leading-[1.5] text-pretty text-(--ink-3)">
        Door, bar and security can add Captures from their phones. No account needed. They can&apos;t see the
        report.
      </p>
      <div className="mt-4 grid place-items-center rounded-xl bg-white p-3">
        <FakeQr size={168} />
      </div>
      <div className="mt-3 flex items-center gap-1 rounded-lg bg-(--raise) py-1 pr-1 pl-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
        <Link2 className="size-3.5 shrink-0 text-(--ink-3)" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-xs text-(--ink-2)" title={url}>
          {url}
        </span>
        <Btn
          size="sm"
          variant="primary"
          onClick={() => {
            navigator.clipboard?.writeText(`https://${url}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Btn>
      </div>
      <p className="mt-2.5 text-xs text-(--ink-3)">The link stops working when you submit the report.</p>
    </Pop>
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
    <div className="composer shrink-0 p-2 pt-0">
      <div
        className={cn(
          "rounded-xl bg-(--raise) shadow-[inset_0_0_0_1px_var(--line)] transition-shadow duration-150",
          open && "shadow-[inset_0_0_0_1px_var(--line-2)]",
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
          placeholder={open ? "What happened? Type it, or paste the group chat. Enter to add." : "Add a Capture…"}
          className={cn(
            "block w-full resize-none bg-transparent px-3 pt-2.5 text-[13px] leading-[1.5] text-(--ink) outline-none placeholder:text-(--ink-3)",
            open ? "h-28" : "h-10",
          )}
        />
        <div className="flex items-center gap-1 px-1.5 pb-1.5">
          <IconBtn label="Attach photo, video or document">
            <Paperclip strokeWidth={1.75} />
          </IconBtn>
          <span className={cn("ml-1 text-xs text-(--ink-3) transition-opacity duration-150", open ? "opacity-100" : "opacity-0")}>
            Saved as written. Draft it when you&apos;re ready.
          </span>
          <button
            type="button"
            aria-label="Add Capture"
            disabled={!text.trim()}
            onClick={send}
            className="press ml-auto grid size-7 place-items-center rounded-lg bg-(--cta) text-(--cta-ink) disabled:bg-(--press) disabled:text-(--ink-3)"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
