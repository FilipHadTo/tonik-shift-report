// A phone photo's image (ticket 18), for the desktop Inbox, the report's Evidence and the capture page.
// Scoped by report id like every other Capture read: another report gets a 404.

import { capturePhoto, reportIdOf } from "@/lib/db"

const ID = /^[a-z0-9-]{1,40}$/

/** ?r=…&id=… returns the stored image with its type. A Capture's content never changes, so it caches. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const id = params.get("id")
  if (!id || !ID.test(id)) return new Response(null, { status: 400 })
  const reportId = reportIdOf(params.get("r") ?? params.get("d"))
  if (!reportId) return new Response(null, { status: 404 })
  const photo = await capturePhoto(reportId, id)
  if (!photo) return new Response(null, { status: 404 })
  return new Response(Buffer.from(photo.data, "base64"), {
    headers: {
      "Content-Type": photo.mime,
      "Cache-Control": "private, max-age=86400, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
