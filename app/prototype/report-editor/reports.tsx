"use client"

// PROTOTYPE — Reports (stories 59, 63–65, 69, 71), a bare functional scaffold from E's existing pieces:
// one row per report (Night, Open / Sent, Incidents, when and by whom it was sent), the demo report
// pinned first, "New report", open a report. Filip designs the list and the Sent state later.

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Btn } from "@/components/btn"
import { REPORTS_API, demoSession, reportPath, type ReportRow } from "./data"

type Row = ReportRow & { id: string }

export function Reports() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [creating, setCreating] = useState(false)

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
      .catch(() => !stop && setFailed(true))
    return () => {
      stop = true
    }
  }, [router])

  async function newReport() {
    setCreating(true)
    try {
      const res = await fetch(REPORTS_API, { method: "POST", body: JSON.stringify({ d: demoSession() }) })
      if (!res.ok) throw new Error("Not created")
      const { id }: { id: string } = await res.json()
      router.push(reportPath(id))
    } catch {
      setCreating(false)
      setFailed(true)
    }
  }

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
          <span className="text-ink-3">Halo Club</span>
        </nav>
        <div className="ml-auto">
          <Btn variant="primary" onClick={newReport} disabled={creating}>
            <Plus strokeWidth={2} />
            New report
          </Btn>
        </div>
      </header>

      <main className="flex-1 px-3 pb-3">
        <section aria-labelledby="reports-title" className="rounded-2xl bg-panel p-5 shadow-panel">
          <h1 id="reports-title" className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">
            Reports
          </h1>
          {failed && (
            <p role="status" className="mt-3 text-xs text-ink-2">
              Couldn&apos;t reach the reports. Try again in a moment.
            </p>
          )}
          {!rows && !failed && (
            <p role="status" className="sr-only">
              Loading reports
            </p>
          )}
          {rows && (
            <ul className="mt-3 flex flex-col">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link
                    href={reportPath(r.id)}
                    className="-mx-3 flex h-11 items-center gap-4 rounded-lg px-3 text-[13px] hover:bg-raise"
                  >
                    <span className="w-44 font-medium">Night of {r.night}</span>
                    <span className="w-14 text-ink-2">{r.status === "sent" ? "Sent" : "Open"}</span>
                    <span className="w-24 text-ink-2 tabular-nums">
                      {r.incidents === 1 ? "1 Incident" : `${r.incidents} Incidents`}
                    </span>
                    <span className="flex-1 text-ink-3 tabular-nums">
                      {r.sentAt && `Sent ${r.sentAt}${r.sentBy ? ` by ${r.sentBy}` : ""}`}
                    </span>
                    {r.demo && <span className="text-xs font-medium tracking-[0.04em] text-ink-3 uppercase">Demo</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
