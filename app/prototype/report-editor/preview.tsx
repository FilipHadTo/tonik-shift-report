"use client"

// PROTOTYPE — Preview (stories 57, 68, ticket 17): a sent Shift Report as a clean document, the way the
// next team reads it. The Report screen's route in document mode (`?view=document`). Read-only, no
// app chrome inside the page. "Download PDF" saves it as it looks here, dark (ticket 26, `pdf.ts`);
// printing (Cmd+P) keeps its own styles: light ink on white, no top bar.

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, ChevronRight, Download, Lock, SquareCheck } from "lucide-react"
import { Btn } from "@/components/btn"
import { cn } from "@/lib/utils"
import {
  REPORT_API,
  REPORTS_PATH,
  SECTIONS,
  attachmentsOf,
  demoSession,
  hasContent,
  incidentTime,
  nightMinutes,
  notCoveredTonight,
  orderedIncidents,
  reportPath,
  tally,
  type Author,
  type Field,
  type InboxCapture,
  type Incident,
  type Report,
} from "./data"
import { downloadPdf, pdfName } from "./pdf"
import { KindLabel, StoredPhoto } from "./ui"
import "./editor.css"

/** "Marek (Door)"; the Closing Manager goes by name only, like everywhere in the report. */
const who = (a: Author) => (a.role === "Closing Manager" ? a.name : `${a.name} (${a.role})`)

const valueOr = (f: Field, unknown: string) => (f.status === "filled" || f.status === "draft" ? f.value : unknown)

export function ReportPreview({ id }: { id: string }) {
  const [report, setReport] = useState<Report | null>(null)
  const [failed, setFailed] = useState(false)
  const [pdf, setPdf] = useState<"idle" | "busy" | "failed">("idle")
  const doc = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pdf !== "failed") return
    const t = setTimeout(() => setPdf("idle"), 5000)
    return () => clearTimeout(t)
  }, [pdf])

  const savePdf = async () => {
    const article = doc.current?.querySelector("article")
    if (pdf === "busy" || !article || !report) return
    setPdf("busy")
    try {
      await downloadPdf(article, pdfName(report.venue, report.night))
      setPdf("idle")
    } catch {
      setPdf("failed")
    }
  }

  useEffect(() => {
    let stop = false
    fetch(`${REPORT_API}?d=${demoSession()}&r=${id}`, { cache: "no-store" })
      .then((res) => {
        // Not in this browser's Reports list: back to the list.
        if (res.status === 404) {
          window.location.replace(REPORTS_PATH)
          return null
        }
        return res.ok ? (res.json() as Promise<Report>) : Promise.reject(res.status)
      })
      .then((r) => {
        if (!r || stop) return
        // Only a sent report has a Preview; an open one carries on in the editor (story 69).
        if (!r.submittedAt) window.location.replace(reportPath(id))
        else setReport(r)
      })
      .catch(() => !stop && setFailed(true))
    return () => {
      stop = true
    }
  }, [id])

  return (
    <div className="rx flex min-h-dvh flex-col bg-canvas text-[14px] print:bg-transparent">
      <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-x-3.5 gap-y-2 px-4 py-3 sm:px-5 print:hidden">
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-lg bg-panel text-[11px] font-bold tracking-tight text-ink-2 shadow-panel"
        >
          SR
        </span>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] whitespace-nowrap">
          <Link href={REPORTS_PATH} className="text-ink-3 hover:text-ink">
            {report?.venue ?? "Reports"}
          </Link>
          {report && (
            <>
              <ChevronRight className="size-3.5 text-ink-3" aria-hidden />
              <span aria-current="page" className="font-medium">
                Night of {report.night}
              </span>
            </>
          )}
        </nav>
        {report && (
          <span className="hidden h-6 items-center gap-1.5 rounded-full bg-panel px-2.5 text-xs text-ink-2 shadow-panel tabular-nums sm:inline-flex">
            <Lock className="size-3" aria-hidden />
            Sent {report.submittedAt}
          </span>
        )}
        {report && (
          <div className="ml-auto flex items-center gap-2">
            {pdf === "failed" && (
              <span role="status" className="appear mr-1 text-xs text-ink-2">
                Unable to make the PDF. Try again, or print it from your browser.
              </span>
            )}
            {/* The editor is a desktop layout: on a phone the Preview is the whole report. */}
            <Btn nativeButton={false} render={<Link href={reportPath(id)} />} className="max-sm:hidden">
              Open in editor
            </Btn>
            <Btn variant="primary" aria-busy={pdf === "busy"} onClick={savePdf} className="min-w-[8.5rem]">
              <Download strokeWidth={1.75} />
              {pdf === "busy" ? "Making PDF…" : "Download PDF"}
            </Btn>
          </div>
        )}
      </header>

      <main className="flex-1 px-3 pb-3 print:p-0">
        <div
          ref={doc}
          className="mx-auto w-full max-w-[832px] rounded-2xl bg-panel px-5 pt-10 pb-14 shadow-panel sm:px-14 sm:pt-16 sm:pb-20 print:max-w-none print:rounded-none print:bg-transparent print:p-0 print:shadow-none"
        >
          {failed ? (
            <p role="status" className="text-[13px] text-ink-2">
              Unable to load this report. Check your connection and reload the page.
            </p>
          ) : report ? (
            <ReportDocument id={id} report={report} />
          ) : (
            <DocumentSkeleton />
          )}
        </div>
      </main>
    </div>
  )
}

function ReportDocument({ id, report: r }: { id: string; report: Report }) {
  const t = tally(r)
  const incidents = orderedIncidents(r)
  const attachments = attachmentsOf(r)
  const submittedBy = r.submittedBy ?? r.manager
  const plural = (n: number, one: string) => `${n} ${n === 1 ? one : `${one}s`}`

  return (
    <article aria-labelledby="doc-title" className="appear">
      <header>
        <p className="text-xs font-medium tracking-[0.04em] text-ink-3 uppercase">Shift Report · {r.venue}</p>
        <h1 id="doc-title" className="mt-2 text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
          Night of {r.night}
        </h1>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 sm:gap-x-6 text-[13px] leading-[1.5]">
          <dt className="text-ink-3">Closing Manager</dt>
          <dd>{r.manager.name}</dd>
          <dt className="text-ink-3">Shift</dt>
          <dd className="tabular-nums">
            Started {r.startedAt} · Submitted {r.submittedAt} · Locked
          </dd>
          <dt className="text-ink-3">Captures</dt>
          <dd className="text-pretty tabular-nums">
            {t.captures === 0
              ? "None"
              : `${t.captures}: ${t.people.map((p) => `${p.count} from ${who(p.author)}`).join(", ")}`}
          </dd>
          <dt className="text-ink-3">Covered</dt>
          <dd className="tabular-nums">
            {plural(t.incidents, "Incident")} · {t.covered} of {t.sections} Sections
          </dd>
        </dl>
      </header>

      <div className="mt-14 flex flex-col gap-12">
        {SECTIONS.filter((s) => hasContent(r, s.id)).map((s) => (
          <DocSection key={s.id} title={s.name}>
            {s.id === "incidents" ? (
              <ol className="flex flex-col gap-8">
                {incidents.map((i, n) => (
                  <IncidentEntry key={i.id} incident={i} number={n + 1} report={r} />
                ))}
              </ol>
            ) : (
              <div className="flex flex-col gap-3">
                {r.blocks
                  .filter((b) => b.section === s.id)
                  .map((b) => (
                    <p key={b.id} className="text-[15px] leading-[1.65] text-pretty">
                      {b.text}
                    </p>
                  ))}
              </div>
            )}
          </DocSection>
        ))}

        <DocSection title="Not covered tonight">
          <p className="text-[15px] leading-[1.65] text-pretty text-ink-2">{notCoveredTonight(r).join(" · ")}</p>
        </DocSection>

        {attachments.length > 0 && (
          <DocSection title="Attachments">
            <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
              {attachments.map(({ capture: c, incidents: nums }) => (
                // A seeded demo photo has no image: a thumbnail-sized placeholder beside its caption, not a big empty frame.
                <figure
                  key={c.id}
                  className={cn("break-inside-avoid", c.photo !== "upload" && "flex items-start gap-4 sm:col-span-full")}
                >
                  <StoredPhoto
                    report={id}
                    capture={c}
                    className={c.photo === "upload" ? "aspect-[4/3] w-full rounded-xl" : "h-16 w-24 shrink-0"}
                  />
                  <figcaption className={cn("text-[13px] leading-[1.5]", c.photo === "upload" && "mt-2.5")}>
                    <span className="font-medium">
                      {nums.map((n) => `Incident ${n}: ${incidents[n - 1].title}`).join(", ")}
                    </span>
                    <span className="block text-ink-3 tabular-nums">
                      Photo, {c.capturedAt}, {who(c.author)}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </DocSection>
        )}

        <DocSection title="Captures" note="Verbatim, as they came in. Never edited.">
          {r.captures.length === 0 ? (
            <p className="text-[15px] leading-[1.65] text-ink-2">No Captures came in for this Night.</p>
          ) : (
            <CaptureTable id={id} report={r} attached={attachments.map((a) => a.capture.id)} />
          )}
        </DocSection>

        <section aria-label="Submission" className="break-inside-avoid border-t border-line pt-8">
          <p className="flex gap-2.5 text-[15px] leading-[1.65]">
            <SquareCheck className="mt-[5px] size-4 shrink-0 text-ink-2" strokeWidth={1.75} role="img" aria-label="Ticked" />
            {r.statement}
          </p>
          <p className="mt-3 text-[13px] leading-[1.5] text-pretty text-ink-3">
            AI-assisted. Reviewed and submitted by {submittedBy.name} at {r.submittedAt}. Locked: changes only as a
            dated, attributed Addendum.
          </p>
        </section>
      </div>
    </article>
  )
}

function DocSection({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <h2 className="break-after-avoid text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">{title}</h2>
      {note && <p className="mt-1 text-[13px] text-ink-3">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function IncidentEntry({ incident: i, number, report: r }: { incident: Incident; number: number; report: Report }) {
  const evidence = r.captures.filter((c) => i.evidence.includes(c.id))
  const meta = [
    incidentTime(i),
    valueOr(i.fields.location, "Location unknown"),
    valueOr(i.fields.type, "Type unknown"),
    i.fromStaff && `Reported by ${who(i.fromStaff)}`,
  ].filter(Boolean)

  return (
    <li className="break-inside-avoid">
      <h3 className="flex gap-2 text-base leading-6 font-semibold">
        <span className="text-ink-3 tabular-nums">{number}</span>
        {i.title || "Untitled Incident"}
      </h3>
      <p className="mt-1 text-[13px] leading-[1.5] text-ink-2 tabular-nums">{meta.join(" · ")}</p>
      <p className="mt-2.5 text-[15px] leading-[1.65] text-pretty">{i.description}</p>
      <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-[1.5] text-ink-2">
        {evidence.length > 0 && (
          <span>
            Evidence:{" "}
            {evidence
              .map((c) => (c.kind === "photo" ? "photo, see Attachments" : "voice note, see Captures"))
              .join("; ")}
            .
          </span>
        )}
        {i.confirmedAt && (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Check className="size-3.5 text-ok" strokeWidth={2.25} aria-hidden />
            Confirmed by {r.manager.name}, {i.confirmedAt}
          </span>
        )}
      </p>
    </li>
  )
}

function CaptureTable({ id, report: r, attached }: { id: string; report: Report; attached: string[] }) {
  return (
    <table className="w-full text-left text-[13px] leading-[1.5]">
      <thead className="text-xs text-ink-3 max-sm:sr-only">
        <tr>
          <th scope="col" className="w-14 pb-2 font-medium">
            Time
          </th>
          <th scope="col" className="w-36 pb-2 font-medium">
            By
          </th>
          <th scope="col" className="w-28 pb-2 font-medium">
            Kind
          </th>
          <th scope="col" className="pb-2 font-medium">
            Content
          </th>
        </tr>
      </thead>
      <tbody>
        {[...r.captures]
          .sort((a, b) => nightMinutes(a.capturedAt) - nightMinutes(b.capturedAt))
          .map((c) => (
            // On a phone each row stacks: time, author and kind on one line, the content under them.
            <tr key={c.id} className="break-inside-avoid border-t border-line align-top max-sm:grid max-sm:grid-cols-[auto_auto_1fr]">
              <td className="py-3 pr-3 tabular-nums max-sm:pb-0">{c.capturedAt}</td>
              <td className="py-3 pr-3 max-sm:pb-0 max-sm:text-ink-2">{who(c.author)}</td>
              <td className="py-3 pr-3 whitespace-nowrap max-sm:pb-0">
                <KindLabel kind={c.kind} />
              </td>
              <td className="py-3 text-pretty max-sm:col-span-3 max-sm:pt-1">
                <CaptureContent id={id} capture={c} attached={attached.includes(c.id)} />
                {c.dismissed && <span className="mt-1 block text-xs text-ink-3">Dismissed, not in the report</span>}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}

function CaptureContent({ id, capture: c, attached }: { id: string; capture: InboxCapture; attached: boolean }) {
  if (c.kind === "chat" && c.chatLines)
    return (
      <>
        <span className="text-ink-2">{c.text}</span>
        <ul className="mt-1.5 flex flex-col gap-1">
          {c.chatLines.map((l, n) => (
            <li key={n} className="grid grid-cols-[3rem_4rem_1fr] gap-2">
              <span className="text-ink-3 tabular-nums">{l.at}</span>
              <span className="text-ink-2">{l.who}</span>
              <span>{l.text}</span>
            </li>
          ))}
        </ul>
      </>
    )
  return (
    <>
      {/* Typed quotes, not <q>: the PDF capture prints its CSS quotes as text. */}
      {c.text ? `“${c.text}”` : <span className="text-ink-3">No caption</span>}
      {c.kind === "photo" &&
        (attached ? (
          <span className="mt-1 block text-xs text-ink-3">Photo in Attachments</span>
        ) : (
          <StoredPhoto report={id} capture={c} className="mt-2 block h-16 w-24" />
        ))}
    </>
  )
}

/** While the report loads: the document's shape, shown only after a noticeable wait. */
function DocumentSkeleton() {
  return (
    <div aria-busy className="rx skeleton">
      <p role="status" className="sr-only">
        Loading report
      </p>
      <div aria-hidden className="flex flex-col gap-3">
        <div className="h-3 w-40 rounded-md bg-raise" />
        <div className="mt-2 h-7 w-72 rounded-md bg-raise" />
        <div className="mt-6 h-3 w-full rounded-md bg-raise" />
        <div className="h-3 w-5/6 rounded-md bg-raise" />
      </div>
    </div>
  )
}
