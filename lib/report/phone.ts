// Phone Captures (stories 10, 11, 13): what the capture page may send, and how the server files it.
// Captured-at and the id are never taken from the phone.

import { ROLES, type Author, type Capture } from "./catalog"
import { clockLabel } from "./derived"
import type { InboxCapture, Report } from "./types"

/** Image types a phone may send. The capture page always sends JPEG; PNG and WebP are also safe to show and to give the AI. */
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export type PhotoMime = (typeof PHOTO_TYPES)[number]

/** A photo's image as stored with its Capture: its type and its bytes in base64. */
export type Photo = { mime: PhotoMime; data: string }

/** The phone downsizes to about 150 KB before sending (ticket 18); anything far past that is refused. */
export const MAX_PHOTO_BYTES = 600 * 1024

/** A Capture as the capture page sends it, checked. `device` only scopes "your Captures" on that phone. */
export type PhoneCaptureInput = {
  device: string
  kind: Extract<Capture["kind"], "photo" | "voice" | "text">
  text: string
  author: Author
  /** Only, and always, on a photo. */
  photo?: Photo
}

const DATA_URL = /^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/]+={0,2})$/
/** The first bytes of each type, so a file can't claim to be an image it isn't. */
const SIGNATURES: Record<PhotoMime, (b: string) => boolean> = {
  "image/jpeg": (b) => b.startsWith("\xff\xd8\xff"),
  "image/png": (b) => b.startsWith("\x89PNG\r\n\x1a\n"),
  "image/webp": (b) => b.startsWith("RIFF") && b.slice(8, 12) === "WEBP",
}

/** The image a phone sends, as a base64 data URL: a known type, bytes that match it, within the size limit. */
export function parsePhoto(raw: unknown): Photo | null {
  if (typeof raw !== "string") return null
  const m = DATA_URL.exec(raw)
  if (!m) return null
  const [, mime, data] = m
  if (!(PHOTO_TYPES as readonly string[]).includes(mime)) return null
  const size = (data.length * 3) / 4 - (data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0)
  if (size > MAX_PHOTO_BYTES) return null
  let head: string
  try {
    head = atob(data.slice(0, 16))
  } catch {
    return null
  }
  return SIGNATURES[mime as PhotoMime](head) ? { mime: mime as PhotoMime, data } : null
}

const KINDS = new Set<string>(["photo", "voice", "text"] satisfies PhoneCaptureInput["kind"][])
const ROLE_SET = new Set<string>(ROLES)
const DEVICE = /^[a-z0-9]{1,40}$/
const MAX_NAME = 40
const MAX_TEXT = 2000

export function parsePhoneCapture(raw: unknown): PhoneCaptureInput | null {
  if (typeof raw !== "object" || raw === null) return null
  const v = raw as Record<string, unknown>
  if (typeof v.device !== "string" || !DEVICE.test(v.device)) return null
  if (typeof v.kind !== "string" || !KINDS.has(v.kind)) return null
  if (typeof v.role !== "string" || !ROLE_SET.has(v.role)) return null
  if (typeof v.name !== "string" || typeof v.text !== "string") return null
  const name = v.name.trim().slice(0, MAX_NAME)
  const text = v.text.trim().slice(0, MAX_TEXT)
  // A photo may go without a caption; anything else needs words.
  if (!name || (!text && v.kind !== "photo")) return null
  // A photo Capture carries its image; nothing else carries one.
  const photo = v.kind === "photo" ? parsePhoto(v.photo) : null
  if (v.kind === "photo" ? !photo : v.photo !== undefined) return null
  return {
    device: v.device,
    kind: v.kind as PhoneCaptureInput["kind"],
    text,
    author: { name, role: v.role as Author["role"] },
    ...(photo && { photo }),
  }
}

/**
 * Files a phone Capture in the report: Captured-at is the report's clock at arrival, then the clock
 * moves on. A submitted report takes no more Captures (null).
 */
export function receivePhoneCapture(
  r: Report,
  input: PhoneCaptureInput,
  id: string,
): { report: Report; capture: InboxCapture } | null {
  if (r.submittedAt) return null
  const capture: InboxCapture = {
    id,
    kind: input.kind,
    capturedAt: clockLabel(r),
    author: input.author,
    text: input.text,
    applied: [],
    fromPhone: true,
    ...(input.kind === "photo" && { photo: "upload" as const }),
  }
  return { report: { ...r, captures: [...r.captures, capture], clock: r.clock + 1 }, capture }
}
