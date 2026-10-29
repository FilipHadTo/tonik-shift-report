"use client"

// PROTOTYPE — top bar: where you are, inviting staff, and Submit.
// Submit always opens the sheet; what's left to do lives in the right rail.

import { useRef, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Check, ChevronRight, Circle, Copy, Link2, Lock, UserPlus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { Btn } from "@/components/btn"
import { Pop } from "@/components/pop"
import { useEditor } from "./report-editor"
import { SECTIONS, blockers, gapsIn, hasContent, orderedIncidents, statusOf } from "./data"
import { FakeQr } from "./ui"

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
            Open since {report.openedAt}
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
  const b = blockers(report)
  const incidents = orderedIncidents(report)
  const confirmed = incidents.filter((i) => i.confirmedAt).length
  const written = SECTIONS.filter((s) => s.id !== "incidents" && hasContent(report, s.id))
  const notCovered = SECTIONS.filter((s) => s.id !== "incidents" && !hasContent(report, s.id))
  const drafts = report.blocks.filter((x) => x.status === "draft").length
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
                done={b.unconfirmed === 0}
                label={`Every Incident confirmed`}
                meta={`${confirmed} of ${incidents.length}`}
                action={b.unconfirmed ? "Review" : undefined}
                onAction={() => go(incidents.find((i) => !i.confirmedAt)?.id)}
              />
              <ChecklistItem
                done={b.gaps === 0}
                label="No Gaps left"
                meta={b.gaps ? `${b.gaps} left` : undefined}
                action={b.gaps ? "Fill" : undefined}
                onAction={() => go(incidents.find((i) => gapsIn(i) > 0)?.id)}
              />
            </ul>

            <h3 className="mt-6 mb-2 text-xs font-medium text-ink-3">Worth a look</h3>
            <ul className="flex flex-col gap-1 text-[13px] text-ink-2">
              <Info>
                {fresh ? `${fresh} Captures in the inbox not in the report yet` : "Every Capture is handled"}
              </Info>
              <Info>{drafts
                  ? `${drafts === 1 ? "1 Section draft isn't" : `${drafts} Section drafts aren't`} kept yet. They're submitted as they are.`
                  : "No open Section drafts"}</Info>
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
            <Dialog.Close render={<Btn variant="ghost" />}>Keep editing</Dialog.Close>
            <Btn
              variant="primary"
              disabled={!b.ready || !reviewed}
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
}: {
  done: boolean
  label: string
  meta?: string
  action?: string
  onAction?: () => void
}) {
  return (
    <li className="flex h-9 items-center gap-2.5 text-[13px]">
      {done ? (
        <Check className="size-4 text-ok" strokeWidth={2.25} aria-label="Done" />
      ) : (
        <Circle className="size-4 text-gap" strokeWidth={2} aria-label="Not done" />
      )}
      <span className={cn(done ? "text-ink-2" : "text-ink")}>{label}</span>
      {meta && <span className="text-ink-3 tabular-nums">{meta}</span>}
      {action && (
        <Btn size="sm" variant="secondary" className="ml-auto" onClick={onAction}>
          {action}
        </Btn>
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
  const [copied, setCopied] = useState(false)
  const url = "halo.shift.report/n/24-oct/j8k2"
  return (
    <Pop
      align="end"
      className="w-[300px] p-4"
      trigger={
        <Btn variant="secondary">
          <UserPlus strokeWidth={1.75} />
          Invite staff
        </Btn>
      }
    >
      <h3 className="text-sm font-semibold">Invite staff to tonight&apos;s report</h3>
      <p className="mt-1 text-xs leading-[1.5] text-pretty text-ink-3">
        Door, bar and security add Captures from their phones. No account needed, and they can&apos;t see the report.
      </p>
      <div className="mt-4 grid place-items-center rounded-xl bg-white p-4 shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]">
        <FakeQr size={164} />
      </div>
      <div className="mt-3 flex items-center gap-1 rounded-lg bg-raise py-1 pr-1 pl-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
        <Link2 className="size-3.5 shrink-0 text-ink-3" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-xs text-ink-2" title={url}>
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
      <p className="mt-3 text-xs text-ink-3">The link stops working when you submit the report.</p>
    </Pop>
  )
}
