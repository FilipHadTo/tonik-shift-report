"use client"

// PROTOTYPE Tonight Variant C — "Three capture tiles".
// No intermediate sheet: Photo / Voice / Text are each one tap from the home screen.
// Staff get a one-time "who are you" step; the Manager gets the team QR inline.

import { useState } from "react"
import { Camera, Check, Mic, QrCode, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { nightMinutes } from "../../_lib/demo-night"
import { KIND_LABEL, KindIcon } from "../../_components/shared"
import type { TonightProps } from "../tonight-prototype"

const ROLES = ["Door", "Bar", "Security"]

export function VariantC({ night, who, me, visible, log }: TonightProps) {
  const [identified, setIdentified] = useState(false)
  const [role, setRole] = useState(me.role)
  const [writing, setWriting] = useState(false)
  const [text, setText] = useState("")
  const [showQr, setShowQr] = useState(false)
  const [last, setLast] = useState<string | null>(null)

  function add(kind: Parameters<TonightProps["log"]>[0], t = "") {
    log(kind, t)
    setLast(KIND_LABEL[kind])
    setWriting(false)
    setText("")
  }

  if (who === "staff" && !identified)
    return (
      <div className="flex flex-1 flex-col gap-6 px-5 py-8">
        <div>
          <p className="text-sm text-muted-foreground">
            {night.venue} · {night.night}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Who&apos;s adding to tonight&apos;s report?</h1>
          <p className="mt-2 text-sm text-muted-foreground">Once. No account. Your name goes on everything you add.</p>
        </div>
        <Input defaultValue={me.name} className="h-12 text-base" aria-label="Your name" />
        <div className="flex gap-2">
          {ROLES.map((r) => (
            <Button key={r} variant={role === r ? "default" : "outline"} className="h-11 flex-1" onClick={() => setRole(r as typeof role)}>
              {r}
            </Button>
          ))}
        </div>
        <Button className="mt-auto h-14 text-base" onClick={() => setIdentified(true)}>
          Continue
        </Button>
      </div>
    )

  const byHour = Object.entries(
    Object.groupBy([...visible].sort((a, b) => nightMinutes(b.capturedAt) - nightMinutes(a.capturedAt)), (c) => `${c.capturedAt.slice(0, 2)}:00`),
  )

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 py-5 pb-10">
      <section className="rounded-2xl bg-muted p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              {night.venue} · opened {night.openedAt} by {night.openedBy}
            </p>
            <h1 className="text-xl font-semibold tracking-tight">Tonight · {night.night}</h1>
          </div>
          {who === "manager" && (
            <Button variant="outline" size="icon" aria-label="Show team QR" onClick={() => setShowQr(!showQr)}>
              <QrCode />
            </Button>
          )}
        </div>
        <p className="mt-2 text-sm">
          {who === "manager"
            ? `${visible.length} Captures · ${visible.filter((c) => c.author.role !== "Closing Manager").length} from staff`
            : `${me.name} (${role}) · ${visible.length} added by you`}
        </p>
        {showQr && who === "manager" && (
          <div className="mt-4 flex items-center gap-4">
            <div className="grid size-24 grid-cols-7 gap-0.5 rounded-md bg-background p-2" aria-label="QR code (fake)">
              {Array.from({ length: 49 }, (_, n) => (
                <span key={n} className={cn("rounded-[1px]", (n * 7919) % 3 ? "bg-foreground" : "bg-transparent")} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Staff scan this to add what they see. No login.</p>
          </div>
        )}
      </section>

      {last && (
        <p className="-my-2 flex items-center gap-1.5 text-sm">
          <Check className="size-4" /> {last} added to tonight&apos;s report
        </p>
      )}

      <section className="grid grid-cols-2 gap-3" aria-label="Log incident">
        <button
          onClick={() => add("photo")}
          className="col-span-2 flex h-32 flex-col items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground active:scale-[0.98]"
        >
          <Camera className="size-8" /> <span className="font-medium">Photo</span>
        </button>
        <button
          onClick={() => add("voice")}
          className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-card active:scale-[0.98]"
        >
          <Mic className="size-6" /> <span className="text-sm font-medium">Hold to talk</span>
        </button>
        <button
          onClick={() => setWriting(!writing)}
          className={cn(
            "flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-card active:scale-[0.98]",
            writing && "border-foreground",
          )}
        >
          <Type className="size-6" /> <span className="text-sm font-medium">Write</span>
        </button>
        {writing && (
          <div className="col-span-2 flex flex-col gap-2">
            <Textarea autoFocus placeholder="What happened, where?" value={text} onChange={(e) => setText(e.target.value)} className="text-base" />
            <Button className="h-11" disabled={!text.trim()} onClick={() => add("text", text)}>
              Add to report
            </Button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        {byHour.map(([hour, caps]) => (
          <div key={hour}>
            <p className="mb-1 font-mono text-xs text-muted-foreground">{hour}</p>
            <ul className="divide-y rounded-xl border">
              {caps!.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <KindIcon kind={c.kind} className="shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{c.kind === "chat" ? c.text : `“${c.text}”`}</span>
                  {who === "manager" && c.author.role !== "Closing Manager" && (
                    <span className="shrink-0 text-xs text-muted-foreground">{c.author.name}</span>
                  )}
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{c.capturedAt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
