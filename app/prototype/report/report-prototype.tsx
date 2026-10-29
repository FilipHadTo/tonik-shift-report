"use client"

// PROTOTYPE — holds the in-memory Night and swaps the rendered variant.

import { useReducer } from "react"
import { PrototypeSwitcher, useVariant } from "@/components/prototype/prototype-switcher"
import { nightReducer, seedNight, type Action, type Night } from "../_lib/demo-night"
import { VariantA } from "./variants/a-split"
import { VariantA2 } from "./variants/a2-split-refined"
import { VariantB } from "./variants/b-queue"
import { VariantC } from "./variants/c-document"
import { VariantD } from "./variants/d-timeline"

export type VariantProps = { night: Night; dispatch: React.Dispatch<Action> }

const VARIANTS = [
  { key: "A", name: "Split: Captures | Rail" },
  { key: "A2", name: "Split, refined" },
  { key: "B", name: "One at a time" },
  { key: "C", name: "Fill-in document" },
  { key: "D", name: "Night timeline" },
]

export function ReportPrototype() {
  const variant = useVariant(VARIANTS)
  const [night, dispatch] = useReducer(nightReducer, undefined, seedNight)
  const props = { night, dispatch }

  return (
    <>
      {variant.key === "A" && <VariantA {...props} />}
      {variant.key === "A2" && <VariantA2 {...props} />}
      {variant.key === "B" && <VariantB {...props} />}
      {variant.key === "C" && <VariantC {...props} />}
      {variant.key === "D" && <VariantD {...props} />}
      <PrototypeSwitcher
        variants={VARIANTS}
        current={variant}
        onReset={() => dispatch({ type: "reset" })}
        links={[{ href: "/prototype/tonight", label: "Tonight" }]}
      />
    </>
  )
}
