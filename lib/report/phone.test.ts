import { describe, expect, test } from "vitest"
import { parsePhoneCapture, parseSaveAction, receivePhoneCapture, reducer, seedReport, statusOf } from "."

const valid = { device: "k3x9a0b1", name: "Ola", role: "Bar", kind: "text", text: "Ice machine is leaking" }

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

  test("a photo may come without a caption", () => {
    expect(parsePhoneCapture({ ...valid, kind: "photo", text: "" })).toMatchObject({ kind: "photo", text: "" })
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

  test("a photo is kept as an uploaded photo", () => {
    const photo = parsePhoneCapture({ ...valid, kind: "photo", text: "" })!
    expect(receivePhoneCapture(seedReport("start"), photo, "p-a1")!.capture.photo).toBe("upload")
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
