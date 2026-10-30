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
  // Hex approximations of --canvas (light / dark): the meta tag can't read CSS variables.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d0f" },
  ],
}

export default function Page() {
  return <CapturePage />
}
