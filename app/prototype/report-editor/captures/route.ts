// PROTOTYPE — in-memory stand-in for the live Inbox (story 13): the mobile capture page
// POSTs here and the desktop Report screen polls. One process, no persistence: it resets
// when the server restarts. Everything is scoped by demo session (`d`, one per desktop
// browser, carried by the QR link); inside it each scene keeps its own Captures and a
// phone writes into the scene the desktop has open.

import { SCENES, nightMinutes, timeOf, type PhoneCapture, type Scene } from "../data"

type Stored = PhoneCapture & { device: string }
type Night = { clock: number; captures: Stored[] }
type Store = { current: Scene; nights: Record<Scene, Night> }

const g = globalThis as { __captureStores?: Map<string, Store> }

const fresh = (scene: Scene): Night => ({ clock: nightMinutes(SCENES[scene].at), captures: [] })

const MAX_SESSIONS = 500

function store(session: unknown) {
  const id = typeof session === "string" && /^[a-z0-9]{1,16}$/.test(session) ? session : "public"
  const all = (g.__captureStores ??= new Map<string, Store>())
  let s = all.get(id)
  if (!s) {
    // Oldest demo goes first; a prototype server shouldn't grow without bound.
    if (all.size >= MAX_SESSIONS) all.delete(all.keys().next().value!)
    s = { current: "end", nights: { start: fresh("start"), end: fresh("end") } }
    all.set(id, s)
  }
  return s
}

const sceneOf = (v: unknown): Scene => (v === "start" ? "start" : "end")

/** The device id stays on the server: it only scopes "your Captures". */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const strip = ({ device, ...c }: Stored): PhoneCapture => c

const ROLES = ["Closing Manager", "Door", "Bar", "Security"] as const
const KINDS = ["photo", "voice", "text"] as const

/**
 * Desktop: ?scene=… returns that scene's Captures.
 * Phone: ?device=… returns its own Captures in the current scene (story 11).
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const s = store(params.get("d"))
  const device = params.get("device")
  const night = s.nights[device ? s.current : sceneOf(params.get("scene"))]
  const captures = night.captures.filter((c) => !device || c.device === device).map(strip)
  return Response.json({ captures })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 40) : ""
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 2000) : ""
  if (
    !name ||
    typeof body?.device !== "string" ||
    !ROLES.includes(body.role) ||
    !KINDS.includes(body.kind) ||
    (!text && body.kind !== "photo")
  )
    return Response.json({ error: "Invalid Capture" }, { status: 400 })

  const s = store(body.d)
  const night = s.nights[s.current]
  // Captured-at is set here, on the demo clock, never by the phone (story 10).
  night.clock += 1
  const capture: Stored = {
    id: `p${night.clock}-${night.captures.length + 1}`,
    device: body.device,
    kind: body.kind,
    capturedAt: timeOf(night.clock),
    author: { name, role: body.role },
    text,
    photo: body.kind === "photo",
  }
  night.captures.push(capture)
  return Response.json(strip(capture), { status: 201 })
}

/** A desktop opened a scene: phones now write into it. `reset` empties it (demo Reset / switch). */
export async function PUT(request: Request) {
  const body = await request.json().catch(() => null)
  const scene = sceneOf(body?.scene)
  const s = store(body?.d)
  s.current = scene
  if (body?.reset) s.nights[scene] = fresh(scene)
  return Response.json({ scene })
}
