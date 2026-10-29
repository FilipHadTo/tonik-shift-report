// The two demo scenes (story 60): 20:00 empty, 02:15 partly drafted and reviewed.

import { DEFAULT_VISIBLE, SCENES, nightMinutes } from "./catalog"
import { applyCapture } from "./apply"
import { alex, jess, marek } from "./script"
import type { InboxCapture, Report, Scene } from "./types"

export function seedReport(scene: Scene = "end"): Report {
  const base: Report = {
    venue: "Halo Club",
    night: "Sat 24 Oct",
    scene,
    startedAt: SCENES.start.at,
    manager: alex,
    captures: [],
    blocks: [],
    incidents: [],
    visible: [...DEFAULT_VISIBLE],
    invited: false,
    drafted: false,
    clock: nightMinutes(SCENES[scene].at),
  }
  // 20:00: Alex just started the report. Nothing in it yet, so the empty states are the onboarding.
  if (scene === "start") return base

  const captures: InboxCapture[] = [
    {
      id: "c1",
      kind: "photo",
      capturedAt: "23:40",
      author: alex,
      text: "window smashed, glass on the floor, taped it off",
      photo: "window",
      applied: [],
    },
    {
      id: "c2",
      kind: "text",
      capturedAt: "00:52",
      author: marek,
      text: "Refused re-entry to guy in grey hoodie, already thrown out once. Very aggressive, threw a bottle at the queue barrier. Walked off towards the high street ~00:45",
      applied: [],
    },
    {
      id: "c6",
      kind: "text",
      capturedAt: "01:05",
      author: jess,
      text: "we're out of aperol since about 1. need 2 cases before friday pls",
      applied: [],
    },
    {
      id: "c3",
      kind: "voice",
      capturedAt: "01:15",
      author: alex,
      text: "Fight at the main bar like five minutes ago, two guys, Tom and Kuba split them up. One had a cut lip, we gave him ice, he left with his mates. No police.",
      applied: [],
    },
    {
      id: "c4",
      kind: "chat",
      capturedAt: "02:10",
      author: alex,
      text: "Halo staff group",
      chatLines: [
        { at: "22:58", who: "Jess", text: "ice machine leaking again 🙃" },
        { at: "00:12", who: "Tom", text: "front of stage is packed, opening 2nd barrier" },
        { at: "00:31", who: "Alex", text: "ok. dj running 20 min late btw" },
        { at: "01:42", who: "Jess", text: "girl at cloakroom says her phone got nicked from her coat. sometime before midnight she thinks?" },
        { at: "01:44", who: "Alex", text: "took her number, told her to report it" },
        { at: "02:05", who: "Tom", text: "all clear inside, last ones out" },
      ],
      applied: [],
    },
  ]

  let r: Report = {
    ...base,
    captures,
    blocks: [
      {
        // Typed in a hurry, so Enhance has something to clean up.
        id: "b-sec-1",
        section: "security",
        text: "2 security short till 22:00, kuba covered side door",
        status: "manual",
        sources: [],
      },
    ],
    invited: true,
    drafted: true,
  }
  // State at 02:15: Alex already drafted two Captures and confirmed one Incident.
  r = applyCapture(r, "c1")
  r = applyCapture(r, "c3")
  r = { ...r, incidents: r.incidents.map((i) => (i.id === "i-c3" ? { ...i, confirmedAt: "02:09" } : i)) }
  return r
}
