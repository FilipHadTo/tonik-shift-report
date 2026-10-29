# Design system

Read this before building or changing any UI. The look comes from prototype E (`/prototype/report-editor`, ADR 0006): when this file and E disagree, E wins and this file gets fixed. Reference frames are in `docs/design/`.

## Rules of the system

- Tokens are the only styling path. No raw colors, no hex, no `oklch()` in components. If a value is missing, add a token to `app/globals.css` rather than inlining it.
- Build from `components/` (E's primitives). `components/ui/` is stock shadcn, kept for behaviour only (e.g. a future mobile form); it follows the tokens through the shadcn names, but don't reach for it when an E primitive exists.
- Base UI (`@base-ui/react`) supplies behaviour and accessibility: focus, dismissal, positioning, portals. Never restyle by fighting Base UI; style the parts with our classes.
- Dark is the default and primary theme; light must work from the same tokens and gets polished last (`.dark` on `<html>`, via next-themes).
- Desktop app shell: three columns `336px | 1fr | 280px`, `gap-3`, `px-3 pb-3`, min width 1180px. Mobile capture is a separate page.

## Tokens

Utilities come from `@theme` in `app/globals.css`: write `bg-raise`, `text-ink-2`, `shadow-pop`, `ease-out`. Use the raw var only where Tailwind has no utility slot, e.g. `shadow-[inset_0_0_0_1px_var(--line)]` or `bg-(image:--ai-wash)`.

| Token | Use |
|---|---|
| `canvas` | App background behind the columns |
| `panel` | Column surfaces, popovers, sheets |
| `raise` | Cards and controls sitting on a panel (Inbox Capture, secondary button, chip) |
| `press` | Hover/pressed fill on `raise`; selected option; photo placeholder |
| `line` | Default hairline: inset borders, separators, seams |
| `line-2` | Stronger hairline: dashed/empty affordances, manual Incident card, `Kbd` |
| `ink` | Primary text |
| `ink-2` | Secondary text, body metadata |
| `ink-3` | Tertiary text, icons, placeholders, timestamps |
| `ai` | AI accent: "AI draft" label, Sparkles icon, AI buttons, focus ring |
| `ai-soft` / `ai-line` / `ai-ring` | AI fill / cross-highlight outline (`.linked`) / AI hairline (Draft footer border, count pill) |
| `--ai-wash` | Background of anything that is an unaccepted AI Draft. Gradient, so `bg-(image:--ai-wash)` |
| `gap` / `gap-soft` / `gap-line` / `gap-ring` | Gap (missing required Incident field): text+dot / fill / hover ring / resting ring |
| `ok` | Confirmed and "ready" ticks only |
| `cta` / `cta-ink` | Primary button and tooltip (inverted surface) |
| `img-outline` | 1px outline on real images |
| `shadow-panel` / `shadow-pop` | Column edge / floating layers (popover, sheet) |
| `ease-out` / `ease-drawer` | See Motion |

Radius scale in use: `rounded-md` (chips, icon buttons, tooltip), `rounded-lg` (buttons, inputs, small cards), `rounded-xl` (Capture cards, popovers, Section blocks), `rounded-2xl` (columns, Incident, sheet), `rounded-full` (avatars, pills, status dots). Nested radii shrink inward.

Borders are inset box-shadows (`shadow-[inset_0_0_0_1px_var(--line)]`), not `border`, so they never shift layout. The one exception is `border-t` separators inside a block.

## Typography

Geist (`font-sans`), with `cv11` and `ss01` on `<body>`. Base size on the app shell is 14px.

| Role | Classes |
|---|---|
| Report title (h1) | `text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance` |
| Section heading (h2) | `text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]` |
| Incident title (h3) | `text-base leading-6 font-semibold` |
| Document body (editable) | `text-[15px] leading-[1.65] text-pretty` |
| UI text (lists, buttons, popovers) | `text-[13px]` |
| Metadata, labels | `text-xs` in `ink-3` / `ink-2` |
| Overline | `text-xs font-medium tracking-[0.04em] uppercase` |
| Micro (time-picker sublabel, `Kbd`) | `text-[10px]` |

Weights: 400, `font-medium` for labels and buttons, `font-semibold` for headings. Times, counts and money are `tabular-nums`. Don't add new sizes; pick the nearest role.

## Spacing and sizing

Tailwind 4px scale. Inline gaps are `gap-1` to `gap-2.5` (`gap-1.5` is the default icon-to-label gap); block gaps `gap-3` / `gap-4`. Control heights: `h-7` small (chips, sm buttons, icon buttons), `h-8` default buttons and inputs, `h-9` list rows in the rail. Icons are `size-4` in controls and `size-3.5` in metadata, `strokeWidth={1.75}`. Every hit area is at least 36px: `IconBtn` adds an `after:-inset-1` pseudo-element over its 28px box. Draft blocks and Incidents hang into the gutter (`-mx-4 px-4`, `-mx-5 px-5`) so their text lines up with plain text.

## Components (`components/`)

| Component | Use it for | Notes |
|---|---|---|
| `Btn` | Every text button. `variant`: `primary` (one per area, the next step: Submit, Confirm), `secondary` (default), `ghost` (low-weight actions in a row: Discard, Add Evidence), `ai` (actions that call AI: Draft all, Draft into report). `size`: `md` (default) / `sm` (inside blocks) | Base UI `Button`. Lucide icon as first child |
| `IconBtn` | Icon-only actions | `label` is required: it becomes `aria-label` and the `Tip`. Never an unlabelled icon |
| `Tip` | Hover/focus hint for one control | Needs `TooltipProvider` (in `app/layout.tsx`). Short noun phrase, no punctuation |
| `Pop` | Anything anchored to a trigger: pickers, small menus, the QR card | Controlled via `open` / `onOpenChange`. Keyboard opens move focus in, mouse opens don't |
| `chip({ tone })` | Property values that open a picker (time, place, type). `tone`: `set`, `unknown`, `gap`, `add` | A class helper (cva), apply to a `<button>`; a `Pop` trigger usually |
| `Avatar` | Author of a Capture / Draft source | Decorative (`aria-hidden`): always render the name beside it |
| `DraftLabel` | The "AI draft from …" line at the top of every AI Draft | Pass the source Captures |
| `PhotoThumb`, `VoiceThumb` | Evidence and Capture previews | Placeholders until real uploads exist |
| `Kbd` | Keyboard hint inside a `Tip` or menu row | |

Sheets and dialogs use Base UI `Dialog` directly with `sheet-motion` / `backdrop-motion` (see the Submit sheet in `app/prototype/report-editor/top-bar.tsx`). Prototype-only bits (`KindLabel`, `FakeQr`) stay in E's `ui.tsx`.

## States: AI, Draft, Gap, Confirmed

The report's trust model is visible. Each state has exactly one look; don't invent others.

| State | Meaning | Look |
|---|---|---|
| AI | Something AI did or can do | `ai` color + Sparkles icon. Buttons use `variant="ai"`. Never use `ai` for non-AI emphasis |
| Draft | AI text not yet accepted (Section Draft, AI Incident, Enhance result) | `--ai-wash` background + `DraftLabel` on top + an explicit accept action (Keep / Confirm) and Discard. The wash goes away on accept, nothing else moves |
| Gap | A required Incident field is missing; blocks Submit | `chip({ tone: "gap" })`: amber fill, dot and "Add …" text; picker offers the value or "Unknown". Listed in "Before you submit" |
| Unknown | Gap the manager can't know | `chip({ tone: "unknown" })` with HelpCircle, `ink-2`. Doesn't block |
| Confirmed | Manager accepted it | No card, no wash, no ring: plain document text, a hairline `seam` to a confirmed neighbour, and "Confirmed hh:mm" with a tick in `ok`. Reopen is a quiet icon action |
| Manual | Written by the manager, not AI | `bg-raise` card with `line-2` ring, no wash, no `DraftLabel` |

Linked: hovering a Capture or a report item lights its counterpart with `.linked` (2px `ai-line` ring).

## Motion

Motion explains state changes (Draft settling into the document, a footer folding away, a popover coming from its trigger). It never decorates high-frequency actions.

| Class (`app/globals.css`) | What | Timing |
|---|---|---|
| `press` | Scale to 0.96 on `:active` for anything clickable | 140ms `ease-out` |
| `enter` | Mount: fade + 6px rise, via `@starting-style` | 240ms `ease-out` |
| `appear` | Mount: fade only, 80ms delay (follows another change) | 200ms |
| `fold` / `[data-folded]` | Collapse a block to 0 height (grid rows) + fade | 240ms rows, 160ms fade |
| `disclose` / `[data-open]` | Expand in place (e.g. More sections) | 200ms rows, 160ms fade |
| `seam` / `[data-on]` | Hairline between two confirmed blocks | 200ms fade |
| `shimmer` | Pending AI label ("Drafting…") | 1.4s linear loop |
| `pop-motion` | Base UI popover/tooltip popup: scale 0.96 + fade from `--transform-origin` | 160ms `ease-out` |
| `sheet-motion`, `backdrop-motion` | Side sheet from the right / its backdrop | 320ms `ease-drawer` / 200ms |

Rules:

- Curves: `ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) for everything entering or responding; `ease-drawer` (`cubic-bezier(0.32, 0.72, 0, 1)`) for sheets. Never `ease-in`, never built-in `ease`/`linear` for UI (loops excepted).
- Durations: 140–240ms for UI, 320ms max for sheets. Exit no slower than enter.
- Animate `opacity`, `scale`, `translate`; height only through the grid-rows pattern (`fold`, `disclose`). Name properties; never `transition: all`.
- Use transitions and `@starting-style`, not keyframes, so motion can be interrupted.
- Popovers scale from their trigger (`--transform-origin`); never from `scale(0)`.
- No motion on keyboard-driven actions or anything done many times a minute. Colour/background hovers use `transition-colors duration-150` at most.
- The motion classes are unlayered and own `transition-property`: don't put a Tailwind `transition-*` utility on the same element, it will be ignored.
- Reduced motion: every class has a fallback at the end of `globals.css` that drops movement and scale and keeps the fades. New motion must add its own fallback there. In JS, check `prefers-reduced-motion` before smooth scrolling.

## Do / don't

Do
- Reuse a token, component and type role before adding anything; add tokens in both `:root` and `.dark`.
- Give one primary `Btn` per area: the next step.
- Label every icon-only control (`IconBtn label`), keep visible focus (the global `ai` outline), keep 36px hit areas.
- Show what's blocking Submit as Gaps in place and in "Before you submit", not as disabled buttons without a reason.
- Check dark first, then light, in the browser.

Don't
- Don't use stock shadcn styling, purple/blue gradients, glassmorphism or drop shadows on in-flow content (shadows are for floating layers only).
- Don't use `ai` colour or the wash for anything that isn't AI, or `gap` amber for anything that isn't a missing required field.
- Don't carry state by colour alone: Gap has a dot and "Add …", Confirmed has a tick and a label.
- Don't add borders with `border` where an inset hairline works, or new grey values.
- Don't animate layout properties directly, or add motion without a reduced-motion fallback.
