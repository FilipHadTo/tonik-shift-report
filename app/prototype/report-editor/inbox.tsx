"use client"

// PROTOTYPE — left column: the Night's Captures as an inbox the Closing Manager
// curates by hand. Draft into report, mark as written by hand, or dismiss.

import { useRef, useState } from "react"
import {
  Archive,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  CornerDownRight,
  CornerLeftDown,
  Lock,
  Mic,
  Paperclip,
  PenLine,
  Smartphone,
  Sparkles,
  Square,
  UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { Btn, IconBtn } from "@/components/btn"
import { VoiceThumb } from "@/components/evidence-thumb"
import { useEditor } from "./report-editor"
import { scopeKey, statusOf, targetsOf, nightMinutes, type InboxCapture } from "./data"
import { CalmNote, CapturePhoto, KindLabel } from "./ui"
import { dictationMessage, joinDictation, useDictation } from "./dictation"

export function Inbox() {
  const { report, draft, calm } = useEditor()
  // After Submit the Inbox stays as a record of what went in, but nothing in it can change the report.
  const locked = Boolean(report.submittedAt)
  const [showDismissed, setShowDismissed] = useState(false)
  const byTime = [...report.captures].sort((a, b) => nightMinutes(b.capturedAt) - nightMinutes(a.capturedAt))
  const fresh = byTime.filter((c) => ["new", "drafting"].includes(statusOf(report, c)))
  const processed = byTime.filter((c) => ["drafted", "in-report"].includes(statusOf(report, c)))
  const dismissed = byTime.filter((c) => c.dismissed)

  return (
    <aside aria-label="Inbox" className="flex min-h-0 flex-col rounded-2xl bg-panel shadow-panel">
      <header className="flex h-14 shrink-0 items-center gap-2 pr-3 pl-5">
        <h2 className="text-sm font-semibold">Inbox</h2>
        {fresh.length > 0 && (
          <span className="rounded-full bg-ai-soft px-1.5 py-px text-xs font-medium text-ai tabular-nums shadow-[inset_0_0_0_1px_var(--ai-ring)]">
            {fresh.length} new
          </span>
        )}
        {fresh.length > 0 && !report.submittedAt && calm === "all" ? (
          <CalmNote className="ml-auto max-w-48 text-right" />
        ) : fresh.length > 0 && !report.submittedAt && (
          <Btn
            variant="ai"
            size="sm"
            className="ml-auto"
            disabled={fresh.every((c) => statusOf(report, c) === "drafting")}
            onClick={() => draft({ all: true })}
          >
            <Sparkles strokeWidth={1.75} />
            Draft all
          </Btn>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-1 pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)]">
        {!report.invited && !locked && report.captures.length > 0 && <InviteNudge />}
        {report.captures.length === 0 ? (
          !locked && <EmptyInbox />
        ) : fresh.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {fresh.map((c) => (
              <NewTile key={c.id} capture={c} />
            ))}
          </ul>
        ) : (
          !locked && (
            <div className="flex flex-col items-center rounded-xl px-6 py-8 text-center shadow-[inset_0_0_0_1px_var(--line)]">
              <Check className="size-5 text-ok" strokeWidth={2} aria-hidden />
              <p className="mt-2.5 text-[13px] font-medium">You&apos;re through the inbox</p>
              <p className="mt-1 text-xs leading-[1.5] text-pretty text-ink-3">
                New Captures from you and your staff show up here.
              </p>
            </div>
          )
        )}

        {processed.length > 0 && (
          <>
            <GroupLabel count={processed.length} first={locked && fresh.length === 0}>
              Processed
            </GroupLabel>
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
              className="mt-7 mb-2 flex items-center gap-1 rounded-md px-2 text-xs font-medium text-ink-3 hover:text-ink-2"
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

      {locked ? <LockedNote /> : <Composer />}
    </aside>
  )
}

/**
 * Onboarding, part 1 (story 3): where Captures come from. Shown until the first Capture is in;
 * the Invite step goes away once staff were invited (story 4).
 */
function EmptyInbox() {
  const { report } = useEditor()
  return (
    <div className="enter rounded-xl px-5 pt-5 pb-2 shadow-[inset_0_0_0_1px_var(--line)]">
      <p className="text-[13px] font-medium">Tonight&apos;s Captures land here</p>
      <p className="mt-1 text-xs leading-[1.5] text-pretty text-ink-3">
        Photos, voice notes and lines of text from you and your staff, kept word for word with who and when. Nothing
        goes into the report until you say so.
      </p>
      <ol className="mt-4 flex flex-col">
        {!report.invited && (
          <Step icon={UserPlus} title="Invite your staff" action={<InvitePop />}>
            They scan a QR and log from their phones. No account.
          </Step>
        )}
        <Step icon={Smartphone} title="Capture from your phone">
          Same link, pick Closing Manager. Photo, voice or text in seconds.
        </Step>
        <Step icon={CornerLeftDown} title="Or type it here" last>
          Paste the staff group chat at the end of the Night. One send, one Capture.
        </Step>
      </ol>
    </div>
  )
}

function Step({
  icon: Icon,
  title,
  action,
  last,
  children,
}: {
  icon: typeof UserPlus
  title: string
  action?: React.ReactNode
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <li className={cn("flex gap-3 py-3", !last && "border-b border-line")}>
      <Icon className="mt-px size-4 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-5 font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-[1.5] text-pretty text-ink-3">{children}</p>
      </div>
      {action}
    </li>
  )
}

/** Opens Invite staff where it lives, in the top bar, with a halo on it: teaches the place, not just the QR. */
function InvitePop() {
  const { setInvite } = useEditor()
  return (
    <Btn size="sm" variant="secondary" className="shrink-0" onClick={() => setInvite({ open: true, halo: true })}>
      Show QR
      <ArrowUpRight strokeWidth={1.75} />
    </Btn>
  )
}

/** Captures are coming in but staff haven't been invited yet: one quiet row above the list. */
function InviteNudge() {
  return (
    <div className="enter mb-2.5 flex items-center gap-3 rounded-xl px-4 py-3 shadow-[inset_0_0_0_1px_var(--line)]">
      <UserPlus className="size-4 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden />
      <p className="min-w-0 flex-1 text-xs leading-[1.5] text-ink-2">Invite door, bar and security to add theirs.</p>
      <InvitePop />
    </div>
  )
}

/** Sits where the composer was once the report is sent (story 67). */
function LockedNote() {
  return (
    <p className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-4 text-xs text-ink-3">
      <Lock className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      Report sent. The Inbox is locked.
    </p>
  )
}

function GroupLabel({ children, count, first }: { children: React.ReactNode; count: number; first?: boolean }) {
  return (
    <h3 className={cn(first ? "mt-2" : "mt-7", "mb-2 flex items-center gap-1.5 px-2 text-xs font-medium text-ink-3")}>
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
          <time className="ml-auto shrink-0 text-xs text-ink-3 tabular-nums">{c.capturedAt}</time>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
          <span className="truncate">{c.author.role}</span>
          <span aria-hidden>·</span>
          <KindLabel kind={c.kind} />

        </div>
      </div>
    </div>
  )
}

function NewTile({ capture: c }: { capture: InboxCapture }) {
  const { report, dispatch, draft, calm } = useEditor()
  const locked = Boolean(report.submittedAt)
  const drafting = statusOf(report, c) === "drafting"
  const targets = targetsOf(report, c)

  return (
    <li className="enter rounded-xl bg-raise p-4 shadow-[inset_0_0_0_1px_var(--line)]">
      <Byline capture={c} />

      <div className="mt-3">
        {c.kind === "chat" && c.chatLines ? (
          <ChatPreview capture={c} lines={3} />
        ) : (
          c.text && <p className="text-[13.5px] leading-[1.55] text-pretty">{c.text}</p>
        )}
        {c.photo && <CapturePhoto capture={c} className={cn("h-[72px] w-[108px]", c.text && "mt-3")} />}
        {c.kind === "voice" && <VoiceThumb className="mt-3 w-fit" />}
      </div>

      {targets.length > 0 && (
        // Part of it is in the report already (e.g. its Incident was deleted): drafting adds only the rest.
        <p className="mt-3 flex items-center gap-1 text-xs text-ink-3">
          <CornerDownRight className="size-3.5 shrink-0" aria-hidden />
          Already in {targets.map((t) => t.label).join(", ")}
        </p>
      )}

      <div className="mt-4 flex h-8 items-center gap-0.5">
        {locked ? (
          <span className="text-xs text-ink-3">Not in the report</span>
        ) : drafting ? (
          <span className="flex items-center gap-1.5 text-xs text-ai" role="status">
            <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />
            <span className="shimmer font-medium">Drafting into the report…</span>
          </span>
        ) : calm === scopeKey({ capture: c.id }) ? (
          <CalmNote />
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
              onClick={() => draft({ capture: c.id })}
              aria-label={`Draft into report: ${c.author.name}, ${c.capturedAt}`}
            >
              <Sparkles className="text-ai" strokeWidth={1.75} />
              Draft into report
            </Btn>
          </>
        )}
      </div>
    </li>
  )
}

function QuietTile({ capture: c }: { capture: InboxCapture }) {
  const { report, dispatch, hot, setHot, reveal } = useEditor()
  const locked = Boolean(report.submittedAt)
  const status = statusOf(report, c)
  const targets = targetsOf(report, c)
  const lit = hot?.from === "doc" && hot.captures.includes(c.id)

  return (
    <li
      onMouseEnter={() => status !== "dismissed" && setHot({ captures: [c.id], from: "inbox" })}
      onMouseLeave={() => setHot(null)}
      className={cn(
        "rounded-xl px-3 py-3 transition-[background-color,box-shadow] duration-150 hover:bg-raise",
        lit && "linked bg-raise",
      )}
    >
      <div className="flex items-center gap-2 text-xs">
        <Avatar author={c.author} size={20} />
        <span className="truncate font-medium text-ink-2">{c.author.name}</span>
        <span className="truncate text-ink-3">{c.author.role}</span>
        <time className="ml-auto shrink-0 text-ink-3 tabular-nums">{c.capturedAt}</time>
      </div>

      <p className="mt-1.5 line-clamp-2 pl-7 text-[13px] leading-[1.5] text-ink-3">
        {c.kind === "chat" && c.chatLines ? `${c.text} · ${c.chatLines.length} messages` : c.text || "Photo, no caption"}
      </p>

      <div className="mt-2 flex min-h-6 flex-wrap items-center gap-x-1 gap-y-0.5 pl-7 text-xs">
        {status === "dismissed" ? (
          <>
            <span className="text-ink-3">Not in the report</span>
            {!locked && (
              <Btn size="sm" variant="ghost" className="-my-1 ml-auto" onClick={() => dispatch({ type: "dismiss", id: c.id, undo: true })}>
                Restore
              </Btn>
            )}
          </>
        ) : (
          <>
            {status === "drafted" ? (
              <CornerDownRight className="size-3.5 shrink-0 text-ai" aria-hidden />
            ) : (
              <Check className="size-3.5 shrink-0 text-ok" strokeWidth={2.25} aria-hidden />
            )}
            {c.handled ? (
              <span className="text-ink-2">Written into the report by hand</span>
            ) : (
              targets.map((t, i) => (
                <button
                  key={t.anchor}
                  type="button"
                  onClick={() => reveal(t.anchor)}
                  className="rounded-sm font-medium text-ink-2 hover:text-ink hover:underline hover:underline-offset-2"
                >
                  {t.label}
                  {i < targets.length - 1 ? "," : ""}
                </button>
              ))
            )}
            {status === "drafted" && <span className="text-ai">· to review</span>}
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
      <p className="text-xs text-ink-3">
        {c.text} · {lines.length} messages
      </p>
      <ol className="mt-2 flex flex-col gap-1.5 rounded-lg bg-panel px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
        {shown.map((l) => (
          <li key={l.at} className="grid grid-cols-[36px_1fr] text-[13px] leading-[1.45]">
            <span className="pt-px text-xs text-ink-3 tabular-nums">{l.at}</span>
            <span>
              <span className="font-medium">{l.who}</span> <span className="text-ink-2">{l.text}</span>
            </span>
          </li>
        ))}
        {lines.length > shown.length && (
          <li className="pl-9 text-xs text-ink-3">{lines.length - shown.length} more messages</li>
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
  // What was in the field when dictation started: spoken words go after it.
  const before = useRef("")
  const dictation = useDictation((said) => setText(joinDictation(before.current, said)))
  const message = dictationMessage[dictation.state]
  const open = focused || text.length > 0 || dictation.listening

  function send() {
    const t = text.trim()
    if (!t) return
    dictation.cancel()
    dispatch({ type: "addCapture", text: t })
    setText("")
    ref.current?.focus()
  }

  function toggleDictation() {
    if (dictation.listening) return dictation.stop()
    before.current = text
    dictation.start()
    ref.current?.focus()
  }

  return (
    <div className="composer shrink-0 px-3 pb-3">
      <div
        className={cn(
          "rounded-xl bg-raise transition-shadow duration-150",
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
          onChange={(e) => {
            // Typing takes over from dictation; the words said so far stay.
            if (dictation.listening) dictation.stop()
            else if (message) dictation.reset()
            setText(e.target.value)
          }}
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
            "block w-full resize-none bg-transparent px-3.5 pt-3 text-[13.5px] leading-[1.5] outline-none placeholder:text-ink-3",
            open ? "h-28" : "h-11",
          )}
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          <IconBtn label="Attach photo, video or document">
            <Paperclip strokeWidth={1.75} />
          </IconBtn>
          {dictation.supported && (
            <IconBtn
              label={dictation.listening ? "Stop dictation" : "Dictate"}
              // Keep focus (and the open composer) in the textarea while dictating.
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleDictation}
              className={cn(dictation.listening && "bg-press text-ink hover:bg-press [&_svg]:size-3")}
            >
              {dictation.listening ? <Square className="fill-current" strokeWidth={1.75} /> : <Mic strokeWidth={1.75} />}
            </IconBtn>
          )}
          <span
            role="status"
            className={cn(
              "ml-1 min-w-0 truncate text-xs text-ink-3 transition-opacity duration-150",
              open || message ? "opacity-100" : "opacity-0",
              message && "text-ink-2",
            )}
          >
            {message ??
              (dictation.listening ? (
                "Listening…"
              ) : open ? (
                // Visual hint only; the live region announces dictation, not focus.
                <span aria-hidden>
                  Kept as written · <kbd className="font-sans">↵</kbd> to add
                </span>
              ) : null)}
          </span>
          <button
            type="button"
            aria-label="Add Capture"
            disabled={!text.trim()}
            // Keep focus in the textarea so the ring doesn't jump to a button that's about to disable itself.
            onMouseDown={(e) => e.preventDefault()}
            onClick={send}
            className="press ml-auto grid size-7 place-items-center rounded-lg bg-cta text-cta-ink disabled:bg-press disabled:text-ink-3"
          >
            <ArrowUp className="size-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  )
}
