# A Shift Report opens on the night's first Capture

Status: superseded by ADR-0005

There is no blank "Create report" step: one Shift Report per venue per night opens automatically with the first Capture (usually logged on a phone mid-shift), and the end-of-night flow is finishing and submitting it. This serves the "captured close to the event" metric and means the manager never faces an empty page at 3am. The UI must make this obvious — the report always says which night it belongs to, when it was opened, and what it already holds — so an auto-created report never feels like something appeared out of nowhere.
