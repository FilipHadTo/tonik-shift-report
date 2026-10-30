// Phone Captures (stories 10, 11, 13): what the capture page may send, and how the server files it.
// Captured-at and the id are never taken from the phone.

import { ROLES, type Author, type Capture } from "./catalog"
import { clockLabel } from "./derived"
import type { InboxCapture, Report } from "./types"

/** A Capture as the capture page sends it, checked. `device` only scopes "your Captures" on that phone. */
export type PhoneCaptureInput = {
  device: string
  kind: Extract<Capture["kind"], "photo" | "voice" | "text">
  text: string
  author: Author
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
  return {
    device: v.device,
    kind: v.kind as PhoneCaptureInput["kind"],
    text,
    author: { name, role: v.role as Author["role"] },
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
