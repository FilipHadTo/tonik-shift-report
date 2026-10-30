// PROTOTYPE — the public link lands on Reports (stories 59, 63–65): the reviewer's Shift Reports,
// the demo report pinned first, and "New report". Each report opens on ./r/[id].

import { Suspense } from "react"
import { Reports } from "./reports"

export default function Page() {
  return (
    <Suspense>
      <Reports />
    </Suspense>
  )
}
