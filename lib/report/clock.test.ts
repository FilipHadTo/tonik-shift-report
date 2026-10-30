import { describe, expect, test } from "vitest"
import { cleanReport, nightLabel, onClock, receivePhoneCapture, reducer, reportRow, seedReport, type Report } from "."

const tz = "Europe/London"
// Fri 30 Oct 2026, 21:40 in London (GMT, clocks went back on 25 Oct).
const evening = new Date("2026-10-30T21:40:00Z")
// Sat 31 Oct 2026, 01:05 in London: still the Night of Fri 30 Oct.
const smallHours = new Date("2026-10-31T01:05:00Z")

describe("a clean report (story 65)", () => {
  test("starts empty, on the real clock, on today's Night", () => {
    const r = cleanReport(evening, tz)
    expect(r.kind).toBe("clean")
    expect(r.venue).toBe("Halo Club")
    expect(r.night).toBe("Fri 30 Oct")
    expect(r.startedAt).toBe("21:40")
    expect(r.captures).toEqual([])
    expect(r.incidents).toEqual([])
    expect(r.blocks).toEqual([])
    expect(r.submittedAt).toBeUndefined()
  })

  test("started after midnight, it belongs to the previous date", () => {
    expect(cleanReport(smallHours, tz).night).toBe("Fri 30 Oct")
  })

  test("reads the venue's time zone, not UTC", () => {
    // 05:30 UTC in June is 07:30 in Warsaw: still the previous Night there.
    expect(cleanReport(new Date("2026-06-13T05:30:00Z"), "Europe/Warsaw").night).toBe("Fri 12 Jun")
    expect(cleanReport(new Date("2026-06-13T05:30:00Z"), "Europe/Warsaw").startedAt).toBe("07:30")
  })
})

describe("Night label", () => {
  test("a Night date reads as weekday, day and month", () => {
    expect(nightLabel("2026-10-24")).toBe("Sat 24 Oct")
    expect(nightLabel("2027-01-01")).toBe("Fri 1 Jan")
  })
})

describe("clock per report kind (ADR 0009)", () => {
  test("a clean report's Captures are stamped with the server time", () => {
    const r = onClock(cleanReport(evening, tz), smallHours, tz)
    const out = reducer(r, { type: "addCapture", text: "side door alarm going off" })
    expect(out.captures.at(-1)?.capturedAt).toBe("01:05")
  })

  test("a phone Capture into a clean report gets today's real time", () => {
    const r = onClock(cleanReport(evening, tz), new Date("2026-10-30T23:12:00Z"), tz)
    const input = { device: "phone1", kind: "text" as const, text: "queue is huge", author: { name: "Marek", role: "Door" as const } }
    expect(receivePhoneCapture(r, input, "p-1")?.capture.capturedAt).toBe("23:12")
  })

  test("Submit on a clean report records the real time", () => {
    const r = onClock(cleanReport(evening, tz), smallHours, tz)
    expect(reducer(r, { type: "submit", statement: true }).submittedAt).toBe("01:05")
  })

  test("the demo report keeps the demo clock, whatever the time", () => {
    const demo = seedReport("end")
    expect(demo.kind).toBe("demo")
    expect(onClock(demo, smallHours, tz)).toBe(demo)
    const out = reducer(onClock(demo, smallHours, tz), { type: "addCapture", text: "lights on" })
    expect(out.captures.at(-1)?.capturedAt).toBe("02:15")
  })
})

describe("Reports row (story 64)", () => {
  test("an open report: Night, Open, Incident count, nothing sent", () => {
    expect(reportRow(seedReport("end"))).toEqual({ night: "Sat 24 Oct", status: "open", incidents: 2, demo: true })
  })

  test("a sent report: when and by whom", () => {
    const r: Report = onClock(cleanReport(evening, tz), smallHours, tz)
    const sent = reducer(r, { type: "submit", statement: true })
    expect(reportRow(sent)).toEqual({
      night: "Fri 30 Oct",
      status: "sent",
      incidents: 0,
      demo: false,
      sentAt: "01:05",
      sentBy: "Alex Morgan",
    })
  })
})
