"use client"

// PROTOTYPE — top bar: where you are, inviting staff, and Submit.
// Submit always opens the sheet; what's left to do lives in the right rail.

import { useRef, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Check, ChevronRight, Circle, Copy, ExternalLink, Link2, Lock, UserPlus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { Btn, IconBtn } from "@/components/btn"
import { Pop } from "@/components/pop"
import { useEditor } from "./report-editor"
import { SECTIONS, demoSession, hasContent, orderedIncidents, readiness, statusOf, type Blocker } from "./data"
import { Qr } from "./ui"

export function TopBar() {
  const { report } = useEditor()

  return (
    <header className="flex h-16 shrink-0 items-center gap-3.5 px-5">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-panel text-[11px] font-bold tracking-tight text-ink-2 shadow-panel"
      >
        SR
      </span>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
        <span className="text-ink-3">{report.venue}</span>
        <ChevronRight className="size-3.5 text-ink-3" aria-hidden />
        <span className="font-medium">Night of {report.night}</span>
      </nav>
      <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-panel px-2.5 text-xs text-ink-2 shadow-panel">
        {report.submittedAt ? (
          <>
            <Lock className="size-3" aria-hidden />
            Submitted {report.submittedAt}
          </>
        ) : (
          <>
            <span className="size-1.5 rounded-full bg-ok" aria-hidden />
            Open since {report.startedAt}
          </>
        )}
      </span>

      <div className="ml-auto flex items-center gap-2">
        {!report.submittedAt && <InviteStaff />}
        <SubmitSheet />
        <span className="ml-2.5">
          <Avatar author={report.manager} size={30} />
        </span>
      </div>
    </header>
  )
}

function SubmitSheet() {
  const { report, dispatch, reveal } = useEditor()
  const [open, setOpen] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const check = readiness(report, { statement: reviewed })
  const blocking = check.ready ? [] : check.blockers
  const unconfirmed = blocking.filter((b): b is Extract<Blocker, { kind: "incident" }> => b.kind === "incident")
  const gaps = unconfirmed.reduce((n, b) => n + b.missing.length, 0)
  const drafts = blocking.find((b) => b.kind === "drafts")?.ids ?? []
  const incidents = orderedIncidents(report)
  const confirmed = incidents.filter((i) => i.confirmedAt).length
  const written = SECTIONS.filter((s) => s.id !== "incidents" && hasContent(report, s.id))
  const notCovered = SECTIONS.filter((s) => s.id !== "incidents" && !hasContent(report, s.id))
  const fresh = report.captures.filter((c) => statusOf(report, c) === "new").length
  const go = (anchor?: string) => {
    if (!anchor) return
    setOpen(false)
    setTimeout(() => reveal(anchor), 200)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Btn variant="primary" disabled={!!report.submittedAt} />}>
        {report.submittedAt ? "Submitted" : "Submit"}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="backdrop-motion fixed inset-0 z-40 bg-black/30 dark:bg-black/55" />
        <Dialog.Popup
          ref={popupRef}
          // Mouse opens focus the sheet itself, keyboard opens the first control.
          initialFocus={(type) => (type === "keyboard" ? true : popupRef.current)}
          className="sheet-motion fixed inset-y-2 right-2 z-50 flex w-[420px] flex-col rounded-2xl bg-panel shadow-pop outline-none">
          <div className="flex items-start gap-3 px-6 pt-6">
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold tracking-[-0.01em]">Submit Shift Report</Dialog.Title>
              <Dialog.Description className="mt-1 text-[13px] text-ink-3">
                {report.venue} · Night of {report.night}
              </Dialog.Description>
            </div>
            <Dialog.Close className="press -mt-1 -mr-2 grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-raise hover:text-ink" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6">
            <h3 className="mb-2 text-xs font-medium text-ink-3">Needed to submit</h3>
            <ul className="flex flex-col gap-1">
              <ChecklistItem
                done={unconfirmed.length === 0}
                label={`Every Incident confirmed`}
                meta={`${confirmed} of ${incidents.length}`}
                action={unconfirmed.length ? "Show" : undefined}
                onAction={() => go(unconfirmed[0]?.id)}
              />
              <ChecklistItem
                done={gaps === 0}
                label="No Gaps left"
                meta={gaps ? `${gaps} left` : undefined}
                action={gaps ? "Show" : undefined}
                onAction={() => go(unconfirmed.find((b) => b.missing.length)?.id)}
              />
              <ChecklistItem
                done={drafts.length === 0}
                label="Every AI draft kept or discarded"
                meta={drafts.length ? `${drafts.length} left` : undefined}
                action={drafts.length ? "Show" : undefined}
                onAction={() => go(drafts[0])}
                // Bulk Keep only here, as an explicit decision at Submission (story 53). Never for Incidents.
                extra={drafts.length ? "Keep all" : undefined}
                onExtra={() => {
                  dispatch({ type: "keepAll" })
                  // The buttons go away with the drafts: keep focus inside the sheet.
                  popupRef.current?.focus()
                }}
              />
            </ul>

            <h3 className="mt-6 mb-2 text-xs font-medium text-ink-3">Worth a look</h3>
            <ul className="flex flex-col gap-1 text-[13px] text-ink-2">
              <Info>
                {fresh ? `${fresh} Captures in the inbox not in the report yet` : "Every Capture is handled"}
              </Info>
              <Info>
                {written.length} Sections written. Not covered tonight: {notCovered.map((s) => s.name).join(", ")}.
              </Info>
            </ul>

            <label className="mt-6 flex cursor-pointer gap-3 rounded-xl bg-raise p-3.5 shadow-[inset_0_0_0_1px_var(--line)]">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-ink"
              />
              <span className="text-[13px] leading-[1.5]">
                I reviewed this report and it matches what I remember.
              </span>
            </label>
            <p className="mt-3 text-xs leading-[1.5] text-ink-3">
              The report will say: “AI-assisted. Reviewed and submitted by {report.manager.name}.” After submitting it
              locks, and changes are only possible as a dated Addendum.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-5">
            <Dialog.Close render={<Btn variant="ghost" />}>Back to report</Dialog.Close>
            <Btn
              variant="primary"
              disabled={!check.ready}
              onClick={() => {
                dispatch({ type: "submit" })
                setOpen(false)
              }}
            >
              <Lock strokeWidth={2} />
              Submit and lock
            </Btn>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ChecklistItem({
  done,
  label,
  meta,
  action,
  onAction,
  extra,
  onExtra,
}: {
  done: boolean
  label: string
  meta?: string
  action?: string
  onAction?: () => void
  /** A second action, left of `action` so the Show buttons line up across rows. */
  extra?: string
  onExtra?: () => void
}) {
  return (
    <li className="flex min-h-9 items-center gap-2.5 py-1 text-[13px] leading-[1.4]">
      {done ? (
        <Check className="size-4 shrink-0 text-ok" strokeWidth={2.25} aria-label="Done" />
      ) : (
        <Circle className="size-4 shrink-0 text-gap" strokeWidth={2} aria-label="Not done" />
      )}
      {/* Meta flows with the label so a long row wraps as one phrase and the count never splits. */}
      <span className={cn("min-w-0 text-pretty", done ? "text-ink-2" : "text-ink")}>
        {label}
        {meta && <span className="ml-2.5 whitespace-nowrap text-ink-3 tabular-nums">{meta}</span>}
      </span>
      {(extra || action) && (
        <span className="ml-auto flex shrink-0 gap-1.5">
          {extra && (
            <Btn size="sm" variant="secondary" onClick={onExtra}>
              {extra}
            </Btn>
          )}
          {action && (
            <Btn size="sm" variant="secondary" onClick={onAction}>
              {action}
            </Btn>
          )}
        </span>
      )}
    </li>
  )
}

function Info({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 py-1 leading-[1.5]">
      <span className="mt-[9px] size-1 shrink-0 rounded-full bg-ink-3" aria-hidden />
      <span>{children}</span>
    </li>
  )
}

function InviteStaff() {
  const { dispatch, invite, setInvite } = useEditor()
  return (
    <Pop
      align="end"
      className="w-[300px] p-4"
      open={invite.open}
      onOpenChange={(open) => {
        setInvite({ open, halo: false })
        // Counts as invited once the QR was shown (on close, so the onboarding hint stays put meanwhile).
        if (!open) dispatch({ type: "invited" })
      }}
      trigger={
        <Btn variant="secondary" className={cn("relative", invite.halo && "halo")}>
          <UserPlus strokeWidth={1.75} />
          Invite staff
        </Btn>
      }
    >
      <InviteCard />
    </Pop>
  )
}

export const CAPTURE_PATH = "/prototype/report-editor/capture"

/** QR and link to the capture page. Used by Invite staff and the empty Inbox. */
export function InviteCard() {
  const [copied, setCopied] = useState(false)
  const origin = typeof window === "undefined" ? "" : window.location.origin
  const link = `${CAPTURE_PATH}?d=${typeof window === "undefined" ? "" : demoSession()}`
  const href = `${origin}${link}`
  const shown = href.replace(/^https?:\/\//, "")
  const local = /^https?:\/\/(localhost|127\.)/.test(origin)
  return (
    <>
      <h3 className="text-sm font-semibold">Invite staff to tonight&apos;s report</h3>
      <p className="mt-1 text-xs leading-[1.5] text-pretty text-ink-3">
        Door, bar and security add Captures from their phones. No account needed, and they can&apos;t see the report.
        You can use it too.
      </p>
      <div className="mt-4 grid place-items-center rounded-xl bg-white p-4 shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]">
        <Qr value={href} size={164} />
      </div>
      <div className="mt-3 flex items-center gap-1 rounded-lg bg-raise py-1 pr-1 pl-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
        <Link2 className="size-3.5 shrink-0 text-ink-3" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-xs text-ink-2" title={shown}>
          {shown}
        </span>
        <IconBtn label="Open on this computer" nativeButton={false} render={<a href={link} target="_blank" rel="noreferrer" />}>
          <ExternalLink strokeWidth={1.75} />
        </IconBtn>
        <Btn
          size="sm"
          variant="primary"
          onClick={() => {
            navigator.clipboard?.writeText(href)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Btn>
      </div>
      <p className="mt-3 text-xs text-ink-3">
        {local
          ? "Demo on localhost: a phone can't reach it. Open the Network address from next dev to scan."
          : "The link stops working when you submit the report."}
      </p>
    </>
  )
}
