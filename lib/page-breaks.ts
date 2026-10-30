/** A block of the document that shouldn't be cut in half, in px from the document's top. */
export type Block = {
  top: number
  bottom: number
  /** A heading: keep it on the same page as the block that follows it. */
  keepWithNext?: boolean
}

/**
 * Where to cut a document `height` px tall into pages that hold `page` px each. A cut goes as low as
 * it can without running through a block (a heading counts together with the block after it). When
 * that would leave a page less than half full (a block taller than a page), it's a plain cut.
 * Returns the cut positions: the top of page 2, page 3, …; none when it fits on one page.
 */
export function pageBreaks(height: number, page: number, blocks: Block[]): number[] {
  const sorted = [...blocks].sort((a, b) => a.top - b.top)
  const spans = sorted.map((b) => {
    if (!b.keepWithNext) return b
    const next = sorted.find((n) => !n.keepWithNext && n.top >= b.bottom)
    return next ? { top: b.top, bottom: next.bottom } : b
  })

  const cuts: number[] = []
  let start = 0
  while (height - start > page) {
    const limit = start + page
    let cut = limit
    for (let inside = spans.find((s) => s.top < cut && s.bottom > cut); inside; ) {
      cut = inside.top
      inside = spans.find((s) => s.top < cut && s.bottom > cut)
    }
    if (cut - start < page / 2) cut = limit
    cuts.push(cut)
    start = cut
  }
  return cuts
}
