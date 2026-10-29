// ARCHIVED — early structure exploration from /prototype, superseded by prototype E
// (/prototype/report-editor, ADR 0006). Don't build on, copy from or edit this route.

// PROTOTYPE — throwaway route. Question: what should the mobile "Tonight" screen look like
// (Log incident + tonight's Captures, Closing Manager / Staff Member switch)?
// Three variants, switchable via ?variant=A|B|C and the floating bottom bar.

import { Suspense } from "react"
import { TonightPrototype } from "./tonight-prototype"

export default function Page() {
  return (
    <Suspense>
      <TonightPrototype />
    </Suspense>
  )
}
