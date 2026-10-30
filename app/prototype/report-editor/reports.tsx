"use client"

// PROTOTYPE — Reports (stories 59, 63–65, 69–71, ticket 25): the venue's Shift Reports. The same top bar
// as the Report screen, then one panel at the document's width (720px text column, like the report
// itself): title and "New report", the demo report pinned first, then clean reports, newest first.
// Each row: the Night, Open since / Sent (when and by whom), Incidents. A row opens its report.

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Columns3, Lock, Plus } from "lucide-react"
import { Btn, IconBtn } from "@/components/btn"
import { cn } from "@/lib/utils"
import { REPORTS_API, demoSession, previewPath, reportPath, type ReportRow } from "./data"
import "./editor.css"

type Row = ReportRow & { id: string }

// A sent report opens as its Preview (story 68: the same route in document mode); an open one opens
// the Report screen. A sent row also offers its locked editor, with the Inbox (ticket 17).
const rowHref = (r: Row) => (r.status === "sent" ? previewPath(r.id) : reportPath(r.id))

export function Reports() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createFailed, setCreateFailed] = useState(false)

  useEffect(() => {
    // Links from before Reports existed (`?scene=…`) open the demo report, as they used to.
    const search = window.location.search
    if (new URLSearchParams(search).has("scene")) {
      router.replace(`${reportPath(demoSession())}${search}`)
      return
    }
    let stop = false
    fetch(`${REPORTS_API}?d=${demoSession()}`, { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<{ reports: Row[] }>) : Promise.reject(res.status)))
      .then((data) => !stop && setRows(data.reports))
      .catch(() => !stop && setLoadFailed(true))
    return () => {
      stop = true
    }
  }, [router])

  async function newReport() {
    setCreating(true)
    setCreateFailed(false)
    try {
      const res = await fetch(REPORTS_API, { method: "POST", body: JSON.stringify({ d: demoSession() }) })
      if (!res.ok) throw new Error("Not created")
      const { id }: { id: string } = await res.json()
      router.push(reportPath(id))
    } catch {
      setCreating(false)
      setCreateFailed(true)
    }
  }

  const demo = rows?.filter((r) => r.demo) ?? []
  const clean = rows?.filter((r) => !r.demo) ?? []

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-[14px]">
      <header className="flex h-16 shrink-0 items-center gap-3.5 px-5">
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-lg bg-panel text-[11px] font-bold tracking-tight text-ink-2 shadow-panel"
        >
          SR
        </span>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
          <span aria-current="page" className="font-medium">
            Halo Club
          </span>
        </nav>
      </header>

      <main className="flex-1 px-3 pb-3">
        <section
          aria-labelledby="reports-title"
          className="mx-auto w-full max-w-[832px] rounded-2xl bg-panel px-14 pt-16 pb-14 shadow-panel"
        >
          <div className="flex items-end gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tracking-[0.04em] text-ink-3 uppercase">Halo Club</p>
              <h1
                id="reports-title"
                className="mt-2 text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance"
              >
                Reports
              </h1>
            </div>
            <Btn variant="primary" onClick={newReport} disabled={creating} aria-busy={creating}>
              <Plus strokeWidth={2} />
              New report
            </Btn>
          </div>
          {createFailed && (
            <p role="status" className="appear mt-3 text-right text-xs text-ink-2">
              Unable to start a report. Check your connection and try again.
            </p>
          )}

          <div className="mt-10">
            {loadFailed && (
              <p role="status" className="text-[13px] text-ink-2">
                Unable to load your reports. Check your connection and reload the page.
              </p>
            )}
            {!rows && !loadFailed && <RowsSkeleton />}
            {rows && (
              <ul className="appear grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-x-6">
                {demo.map((r) => (
                  <ReportItem key={r.id} row={r} />
                ))}
                <li aria-hidden className="col-span-full my-2 border-t border-line" />
                {clean.map((r) => (
                  <ReportItem key={r.id} row={r} />
                ))}
                {clean.length === 0 && (
                  <li className="col-span-full mt-2 rounded-xl border border-dashed border-line-2 px-5 py-4">
                    <p className="text-[13px] font-medium">No other reports yet</p>
                    <p className="mt-1 text-[13px] text-pretty text-ink-3">
                      New report starts a clean one for tonight on the real clock. The demo report stays as it is.
                    </p>
                  </li>
                )}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function ReportItem({ row: r }: { row: Row }) {
  const sent = r.status === "sent"
  return (
    // The whole row is the link (stretched over it); a sent row's editor button sits above it.
    <li className="group/row relative col-span-full -mx-3 grid h-12 grid-cols-subgrid items-center rounded-lg px-3 text-[13px] transition-colors duration-150 hover:bg-raise has-[>a:focus-visible]:outline-2 has-[>a:focus-visible]:outline-offset-2 has-[>a:focus-visible]:outline-ai">
      <Link
        href={rowHref(r)}
        className="col-span-3 grid grid-cols-subgrid items-center outline-none after:absolute after:inset-0 after:rounded-lg after:content-['']"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="truncate font-medium">Night of {r.night}</span>
          {r.demo && (
            <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-raise px-2 text-xs text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]">
              Demo
            </span>
          )}
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap text-ink-2 tabular-nums">
          {sent ? (
            <>
              <Lock className="size-3.5 text-ink-3" strokeWidth={1.75} aria-hidden />
              Sent {r.sentAt}
              {r.sentBy && <span className="text-ink-3"> by {r.sentBy}</span>}
            </>
          ) : (
            <>
              <span className="mx-1 size-1.5 rounded-full bg-ok" aria-hidden />
              Open
              <span className="text-ink-3"> since {r.startedAt}</span>
            </>
          )}
        </span>
        <span className={cn("whitespace-nowrap tabular-nums", r.incidents ? "text-ink-2" : "text-ink-3")}>
          {r.incidents === 0 ? "No Incidents" : r.incidents === 1 ? "1 Incident" : `${r.incidents} Incidents`}
        </span>
      </Link>
      <span className="relative flex items-center justify-end gap-1">
        {sent && (
          <IconBtn label="Open in editor" nativeButton={false} render={<Link href={reportPath(r.id)} />}>
            <Columns3 strokeWidth={1.75} />
          </IconBtn>
        )}
        <ChevronRight
          className="size-4 text-ink-3 transition-colors duration-150 group-hover/row:text-ink-2"
          strokeWidth={1.75}
          aria-hidden
        />
      </span>
    </li>
  )
}

/** While the list loads (a Neon cold start can take seconds): two static rows, shown only after a noticeable wait. */
function RowsSkeleton() {
  return (
    <div aria-busy className="rx skeleton">
      <p role="status" className="sr-only">
        Loading reports
      </p>
      <div aria-hidden className="flex flex-col">
        {[0, 1].map((i) => (
          <div key={i} className="flex h-12 items-center gap-8">
            <div className="h-3 w-40 rounded-md bg-raise" />
            <div className="ml-auto h-3 w-16 rounded-md bg-raise" />
            <div className="h-3 w-20 rounded-md bg-raise" />
          </div>
        ))}
      </div>
    </div>
  )
}
