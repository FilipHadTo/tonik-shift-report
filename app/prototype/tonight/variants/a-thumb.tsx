"use client"

// PROTOTYPE Tonight Variant A — "Thumb button + feed".
// One big "Log incident" in the thumb zone opens a sheet (Photo / Voice / Type).
// Above it: what tonight's report already holds, newest first.

import { useState } from "react"
import { Camera, Check, Mic, Plus, QrCode, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { CaptureBody, KIND_LABEL, KindIcon } from "../../_components/shared"
import type { TonightProps } from "../tonight-prototype"

export function VariantA({ night, who, me, visible, log }: TonightProps) {
  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState("")
  const [justAdded, setJustAdded] = useState(false)

  function add(kind: Parameters<TonightProps["log"]>[0], t = "") {
    log(kind, t)
    setOpen(false)
    setTyping(false)
    setText("")
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2500)
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-start gap-3 px-5 pt-5 pb-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{night.venue}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Tonight · {night.night}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {who === "manager"
              ? `Report opened ${night.openedAt} by ${night.openedBy}`
              : `Adding to tonight's report as ${me.name} (${me.role})`}
          </p>
        </div>
        {who === "manager" && (
          <Button variant="outline" size="sm">
            <QrCode /> Team link
          </Button>
        )}
      </header>

      <ol className="flex flex-1 flex-col gap-2 px-5 pb-32">
        <li className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {who === "manager" ? `${visible.length} Captures tonight` : `Your Captures (${visible.length})`}
        </li>
        {visible.length === 0 && <li className="text-sm text-muted-foreground">Nothing from you yet.</li>}
        {[...visible].reverse().map((c) => (
          <li key={c.id} className="rounded-xl border bg-card p-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <KindIcon kind={c.kind} /> {KIND_LABEL[c.kind]}
              {who === "manager" && <span>· {c.author.name}{c.author.role !== "Closing Manager" && ` (${c.author.role})`}</span>}
              <span className="ml-auto tabular-nums">{c.capturedAt}</span>
            </div>
            <div className="max-h-28 overflow-hidden">
              <CaptureBody capture={c} compact />
            </div>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-0 bg-linear-to-t from-background from-60% to-transparent px-5 pt-6 pb-6">
        {justAdded && (
          <p className="mb-2 flex items-center justify-center gap-1.5 text-sm">
            <Check className="size-4" /> Added to tonight&apos;s report
          </p>
        )}
        <Button className="h-14 w-full rounded-2xl text-base" onClick={() => setOpen(true)}>
          <Plus className="size-5" /> Log incident
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-[420px] rounded-t-2xl pb-6">
          <SheetHeader>
            <SheetTitle>Log incident</SheetTitle>
          </SheetHeader>
          {typing ? (
            <div className="flex flex-col gap-2 px-4">
              <Textarea autoFocus placeholder="What happened, where?" value={text} onChange={(e) => setText(e.target.value)} />
              <Button className="h-12" disabled={!text.trim()} onClick={() => add("text", text)}>
                Add
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 px-4">
              {[
                { kind: "photo" as const, icon: Camera, label: "Photo" },
                { kind: "voice" as const, icon: Mic, label: "Voice" },
              ].map(({ kind, icon: Icon, label }) => (
                <Button key={kind} variant="outline" className="h-24 flex-col gap-2 rounded-xl" onClick={() => add(kind)}>
                  <Icon className="size-6" /> {label}
                </Button>
              ))}
              <Button variant="outline" className="h-24 flex-col gap-2 rounded-xl" onClick={() => setTyping(true)}>
                <Type className="size-6" /> Type
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
