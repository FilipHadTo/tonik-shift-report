"use client"

// PROTOTYPE Tonight Variant B — "Chat composer".
// Looks like the group chat staff already use. Every message is a Capture;
// the composer is the "Log incident" action. Manager sees everyone, Staff see only their own.

import { useState } from "react"
import { Camera, CheckCheck, Mic, SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CaptureBody } from "../../_components/shared"
import type { TonightProps } from "../tonight-prototype"

export function VariantB({ night, who, me, visible, log }: TonightProps) {
  const [text, setText] = useState("")

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="grid size-9 place-items-center rounded-full bg-muted text-xs font-semibold">
          {night.venue.slice(0, 1)}
        </div>
        <div className="flex-1 leading-tight">
          <p className="text-sm font-semibold">Tonight&apos;s report</p>
          <p className="text-xs text-muted-foreground">
            {night.venue} · {night.night} · opened {night.openedAt}
          </p>
        </div>
      </header>

      <ol className="flex flex-1 flex-col gap-3 px-4 py-4">
        <li className="self-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {who === "manager" ? `Report opened ${night.openedAt} by ${night.openedBy}` : `You're ${me.name} (${me.role}) · only you see your messages`}
        </li>
        {visible.map((c) => {
          const mine = c.author.name === me.name
          return (
            <li key={c.id} className={cn("flex max-w-[85%] flex-col gap-1", mine ? "self-end items-end" : "self-start")}>
              {!mine && (
                <span className="px-1 text-xs text-muted-foreground">
                  {c.author.name} · {c.author.role}
                </span>
              )}
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5",
                  mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted",
                )}
              >
                <CaptureBody capture={c} compact />
              </div>
              <span className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground tabular-nums">
                {c.capturedAt}
                {mine && (
                  <>
                    <CheckCheck className="size-3" /> in report
                  </>
                )}
              </span>
            </li>
          )
        })}
      </ol>

      <form
        className="sticky bottom-0 flex items-center gap-2 border-t bg-background px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) {
            log("text", text.trim())
            setText("")
          }
        }}
      >
        <Button type="button" variant="ghost" size="icon-lg" aria-label="Take photo" onClick={() => log("photo", "")}>
          <Camera />
        </Button>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What happened?"
          className="h-11 flex-1 rounded-full px-4 text-base"
        />
        {text.trim() ? (
          <Button type="submit" size="icon-lg" className="rounded-full" aria-label="Log it">
            <SendHorizontal />
          </Button>
        ) : (
          <Button type="button" size="icon-lg" className="rounded-full" aria-label="Record voice note" onClick={() => log("voice", "")}>
            <Mic />
          </Button>
        )}
      </form>
    </div>
  )
}
