import { describe, expect, test } from "vitest"
import { nightOf } from "."

const tz = "Europe/London"

describe("Night assignment", () => {
  test("a Capture at 02:00 belongs to the previous Night", () => {
    expect(nightOf(new Date("2026-10-25T02:00:00+01:00"), tz)).toBe("2026-10-24")
  })

  test("07:59 is still the previous Night, 08:00 starts a new one", () => {
    expect(nightOf(new Date("2026-10-25T07:59:00Z"), tz)).toBe("2026-10-24")
    expect(nightOf(new Date("2026-10-25T08:00:00Z"), tz)).toBe("2026-10-25")
  })

  test("an evening Capture belongs to that date", () => {
    expect(nightOf(new Date("2026-10-24T23:40:00+01:00"), tz)).toBe("2026-10-24")
  })

  test("uses the venue's local time, not UTC", () => {
    // 07:30 UTC is 08:30 in Warsaw (CEST): already the new Night there.
    expect(nightOf(new Date("2026-06-13T07:30:00Z"), "Europe/Warsaw")).toBe("2026-06-13")
    expect(nightOf(new Date("2026-06-13T07:30:00Z"), "Europe/London")).toBe("2026-06-13")
    expect(nightOf(new Date("2026-06-13T05:30:00Z"), "Europe/Warsaw")).toBe("2026-06-12")
  })
})
