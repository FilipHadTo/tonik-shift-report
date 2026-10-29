"use client"

// PROTOTYPE — in-memory Night, Manager/Staff demo switch, phone-width frame on desktop.

import { useReducer, useState } from "react"
import { PrototypeSwitcher, useVariant } from "@/components/prototype/prototype-switcher"
import { cn } from "@/lib/utils"
import { STAFF_DEMO, nightReducer, nowHHMM, seedNight, type Action, type Author, type Capture, type Night } from "../_lib/demo-night"
import { VariantA } from "./variants/a-thumb"
import { VariantB } from "./variants/b-chat"
import { VariantC } from "./variants/c-tiles"

export type Who = "manager" | "staff"

export type TonightProps = {
  night: Night
  dispatch: React.Dispatch<Action>
  who: Who
  me: Author
  /** Captures this viewer may see: all for the Closing Manager, own only for a Staff Member. */
  visible: Capture[]
  log: (kind: Capture["kind"], text: string) => void
}

const VARIANTS = [
  { key: "A", name: "Thumb button + feed" },
  { key: "B", name: "Chat composer" },
  { key: "C", name: "Three capture tiles" },
]

const FAKE_TEXT: Record<Capture["kind"], string> = {
  photo: "spilled drinks by the DJ booth, mopped",
  voice: "Guy collapsed near the toilets, gave him water, he's ok, friends taking him home.",
  text: "",
  chat: "",
}

export function TonightPrototype() {
  const variant = useVariant(VARIANTS)
  const [night, dispatch] = useReducer(nightReducer, undefined, seedNight)
  const [who, setWho] = useState<Who>("manager")
  const me = who === "manager" ? night.manager : STAFF_DEMO
  const visible = who === "manager" ? night.captures : night.captures.filter((c) => c.author.name === me.name)

  function log(kind: Capture["kind"], text: string) {
    dispatch({
      type: "addCapture",
      capture: { id: `c${Date.now()}`, kind, capturedAt: nowHHMM(), author: me, text: text || FAKE_TEXT[kind] },
    })
  }

  const props = { night, dispatch, who, me, visible, log }

  return (
    <div className="flex min-h-dvh justify-center bg-muted/40 pt-14">
      <div className="relative flex w-full max-w-[420px] flex-col bg-background sm:border-x">
        {/* Demo control (reviewer-only), not part of the design */}
        <div className="flex items-center justify-center gap-1 border-b border-dashed bg-muted/40 px-3 py-1.5 text-xs">
          <span className="mr-1 font-mono uppercase tracking-wider text-muted-foreground">demo as</span>
          {(["manager", "staff"] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWho(w)}
              className={cn("rounded-full px-2.5 py-0.5", who === w ? "bg-foreground text-background" : "text-muted-foreground")}
            >
              {w === "manager" ? "Closing Manager" : "Staff Member"}
            </button>
          ))}
        </div>
        {variant.key === "A" && <VariantA {...props} />}
        {variant.key === "B" && <VariantB {...props} />}
        {variant.key === "C" && <VariantC {...props} />}
      </div>
      <PrototypeSwitcher
        variants={VARIANTS}
        current={variant}
        onReset={() => dispatch({ type: "reset" })}
        links={[{ href: "/prototype/report", label: "Report" }]}
        placement="top"
      />
    </div>
  )
}
