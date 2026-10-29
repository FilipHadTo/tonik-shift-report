// PROTOTYPE — throwaway. In-memory seeded demo Night for the UI prototypes.
// Not the real report domain module (see spec: "Report domain module").

export type Author = { name: string; role: "Closing Manager" | "Door" | "Bar" | "Security" };

export type Capture = {
  id: string;
  kind: "photo" | "voice" | "text" | "chat";
  capturedAt: string; // HH:MM on the Night
  author: Author;
  text: string; // verbatim; for voice = transcript, for photo = caption
  chatLines?: { at: string; who: string; text: string }[];
};

export type FieldState =
  | { status: "draft"; value: string; sources: string[] }
  | { status: "gap"; hint?: string; sources: string[] }
  | { status: "filled"; value: string } // manager-entered
  | { status: "unknown" };

export type IncidentField = "occurredAt" | "location" | "type" | "description";

export type Incident = {
  id: string;
  title: string;
  capturedAt: string;
  confirmed: boolean;
  evidence: string[]; // capture ids
  fromStaff?: Author;
  manual?: boolean; // added by the Closing Manager, not drafted by AI
  fields: Record<IncidentField, FieldState>;
};

export type Section = {
  id: string;
  name: string;
  draft?: { text: string; sources: string[]; kept: boolean };
};

export type Night = {
  venue: string;
  night: string;
  openedAt: string;
  openedBy: string;
  manager: Author;
  captures: Capture[];
  incidents: Incident[];
  sections: Section[];
};

export const INCIDENT_TYPES = [
  "Fight/assault",
  "Injury/medical",
  "Ejection/refused entry",
  "Theft",
  "Property damage",
  "Drugs",
  "Intoxication",
  "Harassment",
  "Police called",
  "Other",
];

export const LOCATIONS = [
  "Main bar",
  "Dance floor",
  "Front door",
  "Side entrance",
  "Cloakroom",
  "Smoking area",
  "Toilets",
  "Street outside",
];

export const FIELD_LABEL: Record<IncidentField, string> = {
  occurredAt: "Occurred at",
  location: "Location",
  type: "Type",
  description: "What happened",
};

const manager: Author = { name: "Alex Morgan", role: "Closing Manager" };
const marek: Author = { name: "Marek", role: "Door" };

export const STAFF_DEMO: Author = marek;

export function seedNight(): Night {
  return {
    venue: "Halo Club",
    night: "Sat 24 Oct",
    openedAt: "23:40",
    openedBy: "Alex's photo",
    manager,
    captures: [
      {
        id: "c1",
        kind: "photo",
        capturedAt: "23:40",
        author: manager,
        text: "window smashed, glass on the floor, taped it off",
      },
      {
        id: "c2",
        kind: "text",
        capturedAt: "00:52",
        author: marek,
        text: "Refused re-entry to guy in grey hoodie, already thrown out once. Very aggressive, threw a bottle at the queue barrier. Walked off towards the high street ~00:45",
      },
      {
        id: "c3",
        kind: "voice",
        capturedAt: "01:15",
        author: manager,
        text: "Fight at the main bar like five minutes ago, two guys, Tom and Kuba split them up. One had a cut lip, we gave him ice, he left with his mates. No police.",
      },
      {
        id: "c4",
        kind: "chat",
        capturedAt: "02:10",
        author: manager,
        text: "Pasted group chat — Halo staff (6 messages)",
        chatLines: [
          { at: "22:58", who: "Jess (Bar)", text: "ice machine leaking again 🙃" },
          { at: "00:12", who: "Tom (Security)", text: "front of stage is packed, opening 2nd barrier" },
          { at: "00:31", who: "Alex", text: "ok. dj running 20 min late btw" },
          { at: "01:42", who: "Jess (Bar)", text: "girl at cloakroom says her phone got nicked from her coat. sometime before midnight she thinks?" },
          { at: "01:44", who: "Alex", text: "took her number, told her to report it" },
          { at: "02:05", who: "Tom (Security)", text: "all clear inside, last ones out" },
        ],
      },
    ],
    incidents: [
      {
        id: "i1",
        title: "Broken window",
        capturedAt: "23:40",
        confirmed: false,
        evidence: ["c1"],
        fields: {
          occurredAt: { status: "draft", value: "23:40", sources: ["c1"] },
          location: {
            status: "gap",
            hint: "The photo shows a window — no Capture says which one.",
            sources: ["c1"],
          },
          type: { status: "draft", value: "Property damage", sources: ["c1"] },
          description: {
            status: "draft",
            value: "Window found smashed with glass on the floor. Area taped off.",
            sources: ["c1"],
          },
        },
      },
      {
        id: "i2",
        title: "Refused re-entry, bottle thrown",
        capturedAt: "00:52",
        confirmed: false,
        evidence: [],
        fromStaff: marek,
        fields: {
          occurredAt: { status: "draft", value: "00:45", sources: ["c2"] },
          location: { status: "draft", value: "Front door", sources: ["c2"] },
          type: { status: "draft", value: "Ejection/refused entry", sources: ["c2"] },
          description: {
            status: "draft",
            value:
              "Previously ejected guest (grey hoodie) refused re-entry. Became aggressive and threw a bottle at the queue barrier, then left towards the high street.",
            sources: ["c2"],
          },
        },
      },
      {
        id: "i3",
        title: "Fight at the main bar",
        capturedAt: "01:15",
        confirmed: false,
        evidence: [],
        fields: {
          occurredAt: { status: "draft", value: "01:10", sources: ["c3"] },
          location: { status: "draft", value: "Main bar", sources: ["c3"] },
          type: { status: "draft", value: "Fight/assault", sources: ["c3"] },
          description: {
            status: "draft",
            value:
              "Two male guests fought at the main bar. Security (Tom, Kuba) separated them. One had a cut lip, was given ice and left with friends. Police not called.",
            sources: ["c3"],
          },
        },
      },
      {
        id: "i4",
        title: "Phone stolen from cloakroom",
        capturedAt: "02:10",
        confirmed: false,
        evidence: [],
        fields: {
          occurredAt: {
            status: "gap",
            hint: "Chat says “sometime before midnight she thinks?” — not a time.",
            sources: ["c4"],
          },
          location: { status: "draft", value: "Cloakroom", sources: ["c4"] },
          type: { status: "draft", value: "Theft", sources: ["c4"] },
          description: {
            status: "draft",
            value:
              "Guest reported her phone stolen from her coat in the cloakroom. Manager took her number and advised her to report it to police.",
            sources: ["c4"],
          },
        },
      },
    ],
    sections: [
      {
        id: "overview",
        name: "General overview",
        draft: {
          text: "Busy night, front of stage at capacity around midnight. DJ started 20 min late. Four Incidents, no police attendance.",
          sources: ["c4", "c3"],
          kept: false,
        },
      },
      { id: "incidents", name: "Incidents" },
      { id: "audience", name: "Audience" },
      {
        id: "security",
        name: "Security",
        draft: {
          text: "Second barrier opened at 00:12 due to crowd at the front of stage. Building clear by 02:05.",
          sources: ["c4"],
          kept: false,
        },
      },
      { id: "artist", name: "Artist & crew" },
      { id: "door", name: "Door staff" },
      {
        id: "production",
        name: "Production / run of show",
        draft: { text: "DJ running 20 minutes late.", sources: ["c4"], kept: false },
      },
      { id: "bar", name: "Bar staff" },
      { id: "kitchen", name: "Kitchen" },
      { id: "vendors", name: "Third-party vendors" },
      { id: "private", name: "Private events" },
      {
        id: "maintenance",
        name: "Maintenance / equipment",
        draft: {
          text: "Ice machine leaking again (reported 22:58). Window smashed — taped off, needs glazier.",
          sources: ["c4", "c1"],
          kept: false,
        },
      },
      { id: "inventory", name: "Inventory" },
    ],
  };
}

// --- state ---

export type Action =
  | { type: "fill"; incident: string; field: IncidentField; value: string }
  | { type: "unknown"; incident: string; field: IncidentField }
  | { type: "confirm"; incident: string }
  | { type: "keepSection"; section: string }
  | { type: "clearSection"; section: string }
  | { type: "addCapture"; capture: Capture }
  | { type: "reset" };

export function nightReducer(state: Night, action: Action): Night {
  switch (action.type) {
    case "fill":
    case "unknown":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id !== action.incident
            ? i
            : {
                ...i,
                fields: {
                  ...i.fields,
                  [action.field]:
                    action.type === "fill"
                      ? { status: "filled", value: action.value }
                      : { status: "unknown" },
                },
              },
        ),
      };
    case "confirm":
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.incident && gapsIn(i) === 0 ? { ...i, confirmed: true } : i,
        ),
      };
    case "keepSection":
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.section && s.draft ? { ...s, draft: { ...s.draft, kept: true } } : s,
        ),
      };
    case "clearSection":
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.section ? { ...s, draft: undefined } : s,
        ),
      };
    case "addCapture":
      return { ...state, captures: [...state.captures, action.capture] };
    case "reset":
      return seedNight();
  }
}

// --- helpers ---

export const FIELDS: IncidentField[] = ["occurredAt", "location", "type", "description"];

export function gapsIn(i: Incident) {
  return FIELDS.filter((f) => i.fields[f].status === "gap").length;
}

export function totals(n: Night) {
  const unconfirmed = n.incidents.filter((i) => !i.confirmed).length;
  const gaps = n.incidents.reduce((sum, i) => sum + gapsIn(i), 0);
  return { unconfirmed, gaps, ready: unconfirmed === 0 && gaps === 0 };
}

export function fieldValue(f: FieldState) {
  if (f.status === "draft" || f.status === "filled") return f.value;
  if (f.status === "unknown") return "Unknown";
  return null;
}

export function sourcesOf(i: Incident) {
  const ids = new Set<string>();
  for (const f of FIELDS) {
    const s = i.fields[f];
    if ("sources" in s) s.sources.forEach((id) => ids.add(id));
  }
  return [...ids];
}

export function nowHHMM() {
  return new Date().toTimeString().slice(0, 5);
}

/** Night clock: minutes since 18:00 so 01:15 sorts after 23:40. */
export function nightMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return ((h + 24 - 18) % 24) * 60 + m;
}
