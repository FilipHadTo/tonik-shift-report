// PROTOTYPE — throwaway route. Question: how does the Shift Report *feel* as the Night unfolds,
// from an empty screen to Submission? A scripted walkthrough (← → steps), then hands-on review.

import { Suspense } from "react"
import { NightPrototype } from "./night-prototype"

export default function Page() {
  return (
    <Suspense>
      <NightPrototype />
    </Suspense>
  )
}
