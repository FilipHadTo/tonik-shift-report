import { describe, expect, test } from "vitest"
import { pageBreaks } from "./page-breaks"

describe("page breaks", () => {
  test("a document that fits on one page has no cuts", () => {
    expect(pageBreaks(900, 1000, [{ top: 0, bottom: 900 }])).toEqual([])
  })

  test("cuts above a block that would cross the page edge", () => {
    const blocks = [
      { top: 0, bottom: 600 },
      { top: 620, bottom: 1080 },
      { top: 1100, bottom: 1500 },
    ]
    expect(pageBreaks(1500, 1000, blocks)).toEqual([620])
  })

  test("keeps a heading with the block after it", () => {
    const blocks = [
      { top: 0, bottom: 800 },
      { top: 840, bottom: 870, keepWithNext: true },
      { top: 890, bottom: 1200 },
    ]
    expect(pageBreaks(1200, 1000, blocks)).toEqual([840])
  })

  test("a block taller than a page gets a plain cut", () => {
    expect(pageBreaks(2600, 1000, [{ top: 100, bottom: 2500 }])).toEqual([1000, 2000])
  })
})
