// Drafting one Capture into the report: adds its Drafts and shows their Sections.

import { effectsOf } from "./script"
import type { Block, Report, SectionId } from "./types"

export function applyCapture(r: Report, id: string, only?: SectionId): Report {
  const c = r.captures.find((x) => x.id === id)
  if (!c) return r
  const todo = effectsOf(c).filter((e) => !c.applied.includes(e.section) && (!only || e.section === only))
  let next = r
  for (const e of todo) {
    if (e.section === "incidents") {
      next = { ...next, incidents: [...next.incidents, { ...e.incident, sources: [c.id] }] }
    } else {
      const block: Block = { id: `b-${c.id}-${e.section}`, section: e.section, text: e.text, status: "draft", sources: [c.id] }
      next = { ...next, blocks: [...next.blocks, block] }
    }
    if (!next.visible.includes(e.section)) next = { ...next, visible: [...next.visible, e.section] }
  }
  const applied = [...c.applied, ...todo.map((e) => e.section)]
  return {
    ...next,
    captures: next.captures.map((x) => (x.id === id ? { ...x, applied, drafting: false } : x)),
  }
}
