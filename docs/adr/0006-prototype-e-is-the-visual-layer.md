# Prototype E is the visual layer, on Base UI primitives

The Report screen mock (`/prototype/report-editor`, variant E) is the visual source of truth and becomes the app's front end, instead of being rebuilt from tickets. Base UI (already used in E for Dialog, Popover, Tooltip) and shadcn provide behaviour and accessibility only; the look is 100% E's: its tokens move into the shared theme and its primitives into `components/`. Dark is the primary theme; light is supported through the same tokens and polished last. This replaces the spec's "stock shadcn defaults, styling via theme tokens only" (commit 9032ed3): stock shadcn read as generic, and every rebuild "in the spirit of" a design lost what made it work. Tokens stay the only styling path. Stock shadcn components not used by E stay in the repo for now, in case the mobile capture page needs them.

## Consequences

- The design system is extracted from E before any further UI work, and documented in `docs/design-system.md` for agents to read before building UI.
- Phase 2b tickets wire E to the real backend (report domain module, Neon, Gemini, polling); they don't re-implement the UI.
