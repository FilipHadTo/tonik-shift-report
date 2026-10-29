// PROTOTYPE — throwaway route. Question: what should the Report screen look like
// when the Closing Manager reviews and confirms an Incident that has a Gap?
// Four variants, switchable via ?variant=A|B|C|D and the floating bottom bar.

import { Suspense } from "react"
import { ReportPrototype } from "./report-prototype"

export default function Page() {
  return (
    <Suspense>
      <ReportPrototype />
    </Suspense>
  )
}
