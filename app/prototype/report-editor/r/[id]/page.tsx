// PROTOTYPE — one Shift Report on its own URL (ADR 0009): the demo report (its id is the browser's
// demo id; `?scene=start` opens 20:00) or a clean report from "New report" (`r-…`).
// `?view=document` is the same report as its Preview (story 68): the clean, printable document.

import { Suspense } from "react"
import { ReportEditor } from "../../report-editor"
import { ReportPreview } from "../../preview"
import { ReportSkeleton } from "../../skeleton"

export default function Page({ params, searchParams }: PageProps<"/prototype/report-editor/r/[id]">) {
  // The id and the view are runtime data; the skeleton is the prerendered shell until they resolve.
  return (
    <Suspense fallback={<ReportSkeleton />}>
      {Promise.all([params, searchParams]).then(([{ id }, { view }]) =>
        view === "document" ? <ReportPreview id={id} /> : <ReportEditor id={id} />,
      )}
    </Suspense>
  )
}
