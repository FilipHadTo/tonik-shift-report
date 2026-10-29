// PROTOTYPE — throwaway route. Question: does an inbox of Captures the Closing
// Manager curates by hand, next to a Notion-like report document and a Section
// rail, make the end-of-night flow obvious? Desktop only.

import { Suspense } from "react"
import { ReportEditor } from "./report-editor"

export default function Page() {
  return (
    <Suspense>
      <ReportEditor />
    </Suspense>
  )
}
