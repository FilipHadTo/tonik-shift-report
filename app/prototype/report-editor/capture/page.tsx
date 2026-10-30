// PROTOTYPE — mobile capture page (stories 7–12, 61). Reached from the Invite staff QR.
// Identify once, then send a photo or text (dictated with the keyboard mic); see only your own Captures.

import type { Metadata, Viewport } from "next"
import { CapturePage } from "./capture"

export const metadata: Metadata = {
  title: "Send to the manager",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  // Hex approximation of the dark --canvas (the app is dark only): the meta tag can't read CSS variables.
  themeColor: "#0c0d0f",
  colorScheme: "dark",
}

export default function Page() {
  return <CapturePage />
}
