import { describe, expect, test } from "vitest"
import { MAX_PHOTO_BYTES, parsePhoneCapture, parsePhoto, parseSaveAction, receivePhoneCapture, reducer, seedReport, statusOf } from "."

const valid = { device: "k3x9a0b1", name: "Ola", role: "Bar", kind: "text", text: "Ice machine is leaking" }

const bytes = (...b: number[]) => btoa(String.fromCharCode(...b, ...Array(32).fill(0)))
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0)
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
const WEBP = bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50)
const jpegUrl = `data:image/jpeg;base64,${JPEG}`
const photo = { ...valid, kind: "photo", text: "", photo: jpegUrl }

describe("parsePhoneCapture: what a phone may send", () => {
  test.each([
    null,
    "hello",
    { ...valid, device: undefined },
    { ...valid, device: "not a device!" },
    { ...valid, name: "   " },
    { ...valid, role: "DJ" },
    { ...valid, kind: "chat" },
    { ...valid, kind: "fax" },
    { ...valid, text: "  " },
    { ...valid, text: 42 },
  ])("refuses %j", (raw) => {
    expect(parsePhoneCapture(raw)).toBeNull()
  })

  test("takes the author, kind and text, trimmed", () => {
    expect(parsePhoneCapture({ ...valid, name: "  Ola ", text: " Ice machine is leaking \n" })).toEqual({
      device: "k3x9a0b1",
      kind: "text",
      text: "Ice machine is leaking",
      author: { name: "Ola", role: "Bar" },
    })
  })

  test("takes every role on the fixed list, Other included", () => {
    for (const role of ["Door", "Bar", "Security", "Closing Manager", "Other"]) {
      expect(parsePhoneCapture({ ...valid, role })?.author.role).toBe(role)
    }
  })

  test("a photo may come without a caption, and carries its image", () => {
    expect(parsePhoneCapture(photo)).toMatchObject({ kind: "photo", text: "", photo: { mime: "image/jpeg", data: JPEG } })
  })

  test("a photo Capture needs a valid image; nothing else may carry one", () => {
    expect(parsePhoneCapture({ ...photo, photo: undefined })).toBeNull()
    expect(parsePhoneCapture({ ...photo, photo: "data:text/html;base64,PGgxPg==" })).toBeNull()
    expect(parsePhoneCapture({ ...valid, photo: jpegUrl })).toBeNull()
  })

  test("never takes Captured-at or an id from the phone", () => {
    const parsed = parsePhoneCapture({ ...valid, capturedAt: "19:00", id: "c1" })
    expect(parsed).not.toHaveProperty("capturedAt")
    expect(parsed).not.toHaveProperty("id")
  })

  test("clips an overlong name and text", () => {
    const parsed = parsePhoneCapture({ ...valid, name: "x".repeat(100), text: "y".repeat(5000) })
    expect(parsed?.author.name).toHaveLength(40)
    expect(parsed?.text).toHaveLength(2000)
  })
})

describe("parsePhoto: the image a phone may send", () => {
  test.each([
    ["JPEG", "image/jpeg", JPEG],
    ["PNG", "image/png", PNG],
    ["WebP", "image/webp", WEBP],
  ])("takes a %s data URL as its type and base64 bytes", (_, mime, data) => {
    expect(parsePhoto(`data:${mime};base64,${data}`)).toEqual({ mime, data })
  })

  test.each([
    ["no image", undefined],
    ["not a string", 42],
    ["not a data URL", "https://example.com/a.jpg"],
    ["not base64", "data:image/jpeg;base64,not base64!"],
    ["an empty image", "data:image/jpeg;base64,"],
    ["not an image", `data:text/html;base64,${JPEG}`],
    ["an SVG", `data:image/svg+xml;base64,${btoa("<svg/>")}`],
    ["bytes that are not what the type says", `data:image/jpeg;base64,${PNG}`],
    ["text dressed as a JPEG", `data:image/jpeg;base64,${btoa("<script>alert(1)</script>")}`],
  ])("refuses %s", (_, raw) => {
    expect(parsePhoto(raw)).toBeNull()
  })

  test("refuses an image over the size limit, takes one at it", () => {
    const sized = (n: number) => `data:image/jpeg;base64,${btoa("\xff\xd8\xff" + "\0".repeat(n - 3))}`
    expect(parsePhoto(sized(MAX_PHOTO_BYTES))).not.toBeNull()
    expect(parsePhoto(sized(MAX_PHOTO_BYTES + 1))).toBeNull()
  })
})

describe("receivePhoneCapture: the server stamps and files a phone Capture", () => {
  const input = parsePhoneCapture(valid)!

  test("Captured-at is the report's clock, and the clock moves on", () => {
    const r = seedReport("end")
    const out = receivePhoneCapture(r, input, "p-a1")!
    expect(out.capture.capturedAt).toBe("02:15")
    expect(out.report.clock).toBe(r.clock + 1)
    const next = receivePhoneCapture(out.report, input, "p-a2")!
    expect(next.capture.capturedAt).toBe("02:16")
  })

  test("lands in the Inbox as New, attributed and marked as from a phone", () => {
    const { report, capture } = receivePhoneCapture(seedReport("start"), input, "p-a1")!
    expect(report.captures.at(-1)).toEqual(capture)
    expect(capture).toMatchObject({ id: "p-a1", kind: "text", author: { name: "Ola", role: "Bar" }, fromPhone: true })
    expect(statusOf(report, capture)).toBe("new")
  })

  test("a photo is kept as an uploaded photo; its bytes stay out of the report", () => {
    const { capture } = receivePhoneCapture(seedReport("start"), parsePhoneCapture(photo)!, "p-a1")!
    expect(capture.photo).toBe("upload")
    expect(JSON.stringify(capture)).not.toContain(JPEG)
  })

  test("a submitted report takes no more Captures", () => {
    const r = { ...seedReport("start"), submittedAt: "03:00" }
    expect(receivePhoneCapture(r, input, "p-a1")).toBeNull()
  })

  test("the desktop's live Inbox shows it without moving Captured-at", () => {
    const r = seedReport("end")
    const { report, capture } = receivePhoneCapture(r, input, "p-a1")!
    const desktop = reducer(r, { type: "receive", captures: [{ ...capture, photo: false }] })
    expect(desktop.captures.at(-1)?.capturedAt).toBe(capture.capturedAt)
    expect(desktop.clock).toBe(report.clock)
  })
})

describe("phone Captures never come in through manager actions", () => {
  test("the action route refuses receive", () => {
    const capture = { id: "p1", kind: "text", capturedAt: "01:00", author: { name: "Ola", role: "Bar" }, text: "Ice out" }
    expect(parseSaveAction({ type: "receive", captures: [capture] })).toBeNull()
  })
})
