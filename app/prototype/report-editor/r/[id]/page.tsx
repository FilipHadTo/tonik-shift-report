// PROTOTYPE — one Shift Report on its own URL (ADR 0009): the demo report (its id is the browser's
// demo id; `?scene=start` opens 20:00) or a clean report from "New report" (`r-…`).

import { Suspense } from "react"
import { ReportEditor } from "../../report-editor"
import { ReportSkeleton } from "../../skeleton"

export default function Page({ params }: PageProps<"/prototype/report-editor/r/[id]">) {
  // The id is runtime data; the skeleton is the prerendered shell until it resolves.
  return <Suspense fallback={<ReportSkeleton />}>{params.then(({ id }) => <ReportEditor id={id} />)}</Suspense>
}
