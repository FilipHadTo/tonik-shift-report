"use client"

// PROTOTYPE — the capture page a Staff Member (or the Closing Manager) opens from the QR.
// No login: name and role are kept on the phone (ADR 0004). Captures are saved in the database
// through ../captures/route.ts, into the demo id's report, and the desktop Inbox polls for them.
// A photo is downsized on the phone and stored with its Capture (ticket 18). There is no voice recording: people dictate with the phone keyboard's mic (story 9).
// Laid out like a messaging app, since that's what staff already use mid-shift.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { ArrowUp, Camera, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { Btn, IconBtn } from "@/components/btn"
import { PhotoThumb, VoiceThumb } from "@/components/evidence-thumb"
import { CAPTURES_API, photoSrc, ROLES, type Author, type PhoneCapture } from "../data"

type Identity = Pick<Author, "name" | "role">

const ID_KEY = "shift-report:identity"
const DEVICE_KEY = "shift-report:device"
const SESSION_KEY = "shift-report:capture-demo"
const POLL_MS = 3000
/** Ticket 18: photos go up downsized, longest side 1280 px, JPEG of roughly 150 KB. */
const LONGEST_SIDE = 1280
const TARGET_BYTES = 150 * 1024

function read<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

/** Stable per phone. Not crypto.randomUUID: it's missing on plain-http LAN addresses. */
function deviceId() {
  const known = read<string>(DEVICE_KEY)
  if (known) return known
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
  write(DEVICE_KEY, id)
  return id
}

const noSubscribe = () => () => {}

/** Demo session from the QR link (`?d=…`), kept so a reload without it still lands in the same Inbox. */
function demoId() {
  const fromLink = new URLSearchParams(window.location.search).get("d")
  if (fromLink) write(SESSION_KEY, fromLink)
  return fromLink ?? read<string>(SESSION_KEY) ?? "public"
}

/** A phone photo as a JPEG data URL, longest side ≤ 1280 px, quality lowered until it's near the target size. */
async function downsize(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, LONGEST_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
    let quality = 0.82
    let out = canvas.toDataURL("image/jpeg", quality)
    // base64 is 4/3 of the bytes
    while (out.length * 0.75 > TARGET_BYTES && quality > 0.45) {
      quality -= 0.12
      out = canvas.toDataURL("image/jpeg", quality)
    }
    return out
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function CapturePage() {
  // null on the server, "" on a phone that hasn't identified yet.
  const stored = useSyncExternalStore(noSubscribe, () => localStorage.getItem(ID_KEY) ?? "", () => null)
  const [chosen, setChosen] = useState<Identity | null>(null)
  const [editing, setEditing] = useState(false)
  const ready = stored !== null
  const me = chosen ?? (stored ? read<Identity>(ID_KEY) : null)

  return (
    <div className="flex h-dvh flex-col bg-canvas text-[14px] text-ink">
      {!ready ? null : !me || editing ? (
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col overflow-y-auto px-4 pt-[max(20px,env(safe-area-inset-top))]">
          <Overline />
          <Identify
            initial={me}
            onDone={(id) => {
              write(ID_KEY, id)
              setChosen(id)
              setEditing(false)
            }}
          />
        </div>
      ) : (
        <Captures me={me} onChangeMe={() => setEditing(true)} />
      )}
    </div>
  )
}

function Overline() {
  return <p className="text-xs font-medium tracking-[0.04em] text-ink-3 uppercase">Halo Club · Night of Sat 24 Oct</p>
}

/** Story 8: name and role, once. */
function Identify({ initial, onDone }: { initial: Identity | null; onDone: (id: Identity) => void }) {
  const [name, setName] = useState(initial?.name ?? "")
  const [role, setRole] = useState<Author["role"] | null>(initial?.role ?? null)
  const ok = name.trim().length > 0 && role

  return (
    <form
      className="enter flex flex-1 flex-col pb-[max(16px,env(safe-area-inset-bottom))]"
      onSubmit={(e) => {
        e.preventDefault()
        if (ok) onDone({ name: name.trim(), role })
      }}
    >
      <h1 className="mt-2 text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
        Send to the manager
      </h1>
      <p className="mt-3 text-[15px] leading-[1.55] text-pretty text-ink-2">
        Photos and texts go straight to the manager, with your name and the time. No account, and you only see what
        you sent.
      </p>

      <label htmlFor="name" className="mt-8 text-xs font-medium text-ink-3">
        Your name
      </label>
      <input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="given-name"
        autoCapitalize="words"
        enterKeyHint="next"
        placeholder="First name is enough"
        className="mt-2 h-11 rounded-lg bg-raise px-3.5 text-base shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1px_var(--line-2),0_0_0_3px_var(--ai-soft)]"
      />

      <fieldset className="mt-6">
        <legend className="text-xs font-medium text-ink-3">Your role tonight</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <label
              key={r}
              className={cn(
                "press flex h-11 cursor-pointer items-center gap-2 rounded-lg px-3.5 text-[15px] select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ai",
                role === r
                  ? "bg-press font-medium shadow-[inset_0_0_0_1px_var(--line-2)]"
                  : "bg-raise text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]",
              )}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                className="sr-only"
              />
              <span className="flex-1">{r}</span>
              {role === r && <Check className="size-4 text-ink-2" strokeWidth={2.25} aria-hidden />}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-auto pt-8">
        <Btn type="submit" variant="primary" size="lg" className="w-full" disabled={!ok}>
          Continue
        </Btn>
        <p className="mt-3 text-center text-xs text-ink-3">Saved on this phone for tonight.</p>
      </div>
    </form>
  )
}

type Sent = PhoneCapture & { preview?: string }

/**
 * Stories 9–11, laid out like a messaging app: your Captures are the messages you sent,
 * the composer sits on the keyboard. Attach a photo or type; the keyboard mic covers talking.
 */
function Captures({ me, onChangeMe }: { me: Identity; onChangeMe: () => void }) {
  const [sent, setSent] = useState<Sent[]>([])
  const previews = useRef(new Map<string, string>())
  const ids = useRef({ device: "", demo: "public" })
  const listRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const { device, demo } = ids.current
      const res = await fetch(`${CAPTURES_API}?d=${demo}&device=${device}`, { cache: "no-store" })
      const data: { captures: PhoneCapture[] } = await res.json()
      // Sent from here this session: the local copy, at once. After a reload: the stored one.
      setSent(
        data.captures.map((c) => ({ ...c, preview: previews.current.get(c.id) ?? (c.photo ? photoSrc(demo, c.id) : undefined) })),
      )
    } catch {}
  }, [])

  useEffect(() => {
    ids.current = { device: deviceId(), demo: demoId() }
    load()
    const t = setInterval(load, POLL_MS)
    return () => clearInterval(t)
  }, [load])

  // Newest at the bottom, like a chat: keep it in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [sent.length])

  async function send(kind: Kind, text: string, photo?: string) {
    const res = await fetch(CAPTURES_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        d: ids.current.demo,
        device: ids.current.device,
        name: me.name,
        role: me.role,
        kind,
        text,
        ...(photo && { photo }),
      }),
    })
    if (!res.ok) throw new Error("Not sent")
    const c: PhoneCapture = await res.json()
    if (photo) previews.current.set(c.id, photo)
    await load()
  }

  return (
    <>
      <header className="shrink-0 shadow-[inset_0_-1px_0_var(--line)]">
        <div className="mx-auto flex max-w-[480px] items-center gap-2.5 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3">
          <Avatar author={me} size={32} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[15px] font-medium">
              {me.name} <span className="font-normal text-ink-3">· {me.role}</span>
            </p>
            <p className="mt-0.5 truncate text-xs text-ink-3">Halo Club · Night of Sat 24 Oct</p>
          </div>
          <Btn variant="ghost" className="-mr-2" onClick={onChangeMe}>
            Change
          </Btn>
        </div>
      </header>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <ol className="mx-auto flex min-h-full max-w-[480px] flex-col justify-end gap-3 px-4 py-4">
          {sent.length === 0 && (
            <li className="my-auto px-6 text-center">
              <p className="text-[15px] font-medium">Saw something? Send it.</p>
              <p className="mt-1.5 text-[13px] leading-[1.5] text-pretty text-ink-3">
                A photo or a line of text. Tap the keyboard mic to talk instead of typing. It goes to the manager
                with your name and the time. Only you see this list.
              </p>
            </li>
          )}
          {sent.map((c) => (
            <Bubble key={c.id} capture={c} />
          ))}
        </ol>
      </div>

      <Composer onSend={send} />
    </>
  )
}

function Bubble({ capture: c }: { capture: Sent }) {
  const [failed, setFailed] = useState(false)
  const src = failed ? undefined : c.preview
  return (
    <li className="enter flex flex-col items-end">
      <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-br-md bg-raise shadow-[inset_0_0_0_1px_var(--line)]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- downsized photo, never optimised
          <img src={src} alt="" onError={() => setFailed(true)} className="max-h-64 w-full object-cover" />
        ) : (
          c.photo && <PhotoThumb className="m-1.5 h-28 w-44 rounded-xl" />
        )}
        {c.kind === "voice" && <VoiceThumb className="mx-1.5 mt-1.5 bg-press" />}
        {c.text && <p className="px-3.5 py-2.5 text-[15px] leading-[1.5] text-pretty">{c.text}</p>}
      </div>
      <p className="mt-1 flex items-center gap-1 pr-1 text-xs text-ink-3">
        <time className="tabular-nums">{c.capturedAt}</time>
        <span aria-hidden>·</span>
        <Check className="size-3.5 text-ok" strokeWidth={2.25} aria-hidden />
        Received
      </p>
    </li>
  )
}

type Kind = "text" | "photo"

function Composer({ onSend }: { onSend: (kind: Kind, text: string, photo?: string) => Promise<void> }) {
  const [text, setText] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [state, setState] = useState<"idle" | "sending" | "failed" | "unreadable">("idle")
  const fileRef = useRef<HTMLInputElement>(null)
  const canSend = (!!text.trim() || !!photo) && state !== "sending"

  async function run(kind: Kind, body: string, image?: string) {
    setState("sending")
    try {
      await onSend(kind, body, image)
      setState("idle")
      return true
    } catch {
      setState("failed")
      return false
    }
  }

  async function sendTyped() {
    if (!canSend) return
    if (await run(photo ? "photo" : "text", text.trim(), photo ?? undefined)) {
      setText("")
      setPhoto(null)
    }
  }

  return (
    <footer className="shrink-0 bg-canvas shadow-[inset_0_1px_0_var(--line)]">
      <div className="mx-auto max-w-[480px] px-3 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))]">
        {state === "failed" && (
          <p role="alert" className="mb-2 px-1 text-xs text-ink-2">
            Didn&apos;t go through. It&apos;s still here, try again.
          </p>
        )}
        {state === "unreadable" && (
          <p role="alert" className="mb-2 px-1 text-xs text-ink-2">
            Couldn&apos;t open that photo. Try taking it again.
          </p>
        )}
        {photo && (
          <div className="enter relative mb-2 ml-12 w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element -- local downsized copy, never optimised */}
            <img src={photo} alt="Photo to send" className="h-24 rounded-xl object-cover outline outline-1 -outline-offset-1 outline-img-outline" />
            <IconBtn label="Remove photo" className="absolute -top-2 -right-2 rounded-full bg-panel shadow-pop" onClick={() => setPhoto(null)}>
              <X strokeWidth={2} />
            </IconBtn>
          </div>
        )}

        <div className="flex items-end gap-2">
          <RoundBtn label="Add a photo" onClick={() => fileRef.current?.click()}>
            <Camera className="size-5" strokeWidth={1.75} />
          </RoundBtn>
          <label htmlFor="capture-text" className="sr-only">
            {photo ? "Caption" : "What happened"}
          </label>
          <textarea
            id="capture-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendTyped()
              }
            }}
            rows={1}
            enterKeyHint="send"
            placeholder={photo ? "Add a line about it" : "What did you see?"}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] bg-raise px-4 py-2.5 text-base leading-6 shadow-[inset_0_0_0_1px_var(--line)] outline-none [field-sizing:content] placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1px_var(--line-2)]"
          />
          <RoundBtn label="Send" primary disabled={!canSend} onClick={sendTyped}>
            <ArrowUp className="size-5" strokeWidth={2.25} />
          </RoundBtn>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={async (e) => {
          const f = e.target.files?.[0]
          e.target.value = ""
          if (!f) return
          try {
            setPhoto(await downsize(f))
            setState("idle")
          } catch {
            setState("unreadable")
          }
        }}
      />
    </footer>
  )
}

/** 44px round control for the composer, the thumb-zone size. */
function RoundBtn({
  label,
  primary,
  className,
  ...props
}: React.ComponentProps<"button"> & { label: string; primary?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "press grid size-11 shrink-0 place-items-center rounded-full select-none disabled:opacity-45",
        primary ? "bg-cta text-cta-ink" : "text-ink-2 active:bg-raise",
        className,
      )}
      {...props}
    />
  )
}
