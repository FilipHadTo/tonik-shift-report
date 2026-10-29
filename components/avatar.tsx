// Seeded demo people keep the hues they had in prototype E; anyone else gets a stable hue from their name.
const HUES: Record<string, number> = { "Alex Morgan": 258, Marek: 30, Jess: 330, Tom: 150 }

function hueOf(name: string) {
  if (name in HUES) return HUES[name]
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return h
}

/** Initials on a tinted disc. Decorative: always render the name next to it. */
export function Avatar({ author, size = 20 }: { author: { name: string }; size?: number }) {
  const hue = hueOf(author.name)
  const initials = author.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `oklch(0.7 0.09 ${hue} / 0.22)`,
        color: `oklch(0.6 0.12 ${hue})`,
      }}
    >
      {initials}
    </span>
  )
}
