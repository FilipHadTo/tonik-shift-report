# 20: Demo controller polish, dark only, no Next.js dev badge

**What to build:** Filip's calls after the demo (2026-10-31):
- The floating demo controller (scene switch Start of shift 20:00 / End of night 02:15, Reset) gets slightly lighter, with an ultra-subtle light shadow so it lifts off the dark page. Stay within `docs/design-system.md` tokens; add one only if none fits.
- Remove the light/dark switch from the demo controller. The app shows dark only; light mode is out of scope (PROCESS.md 2c updated).
- Turn off the Next.js dev indicator (`devIndicators: false` in `next.config.ts`); it covers buttons on desktop and mobile.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet, high effort (UI polish)

- [x] Demo controller is lighter with a barely-there light shadow; it still reads as a demo tool, not product UI
- [x] No theme switch anywhere; the page is always dark
- [x] No Next.js dev badge on desktop or the capture page
- [x] Looks and works like prototype E, per `docs/design-system.md`

## Comments

Done 2026-10-30.

- Demo controller (`app/prototype/report-editor/demo-bar.tsx`): surface `bg-panel` → `bg-raise` (dark `oklch(0.205 0.006 260)`, one step lighter than the panel it floats over), shadow `shadow-pop` → new token `shadow-lift`. Dark value of `--elevation-lift`: `0 0 0 1px oklch(1 0 0 / 0.09), 0 0 24px -2px oklch(1 0 0 / 0.07), 0 12px 32px -8px oklch(0 0 0 / 0.6)` (white hairline + faint white halo; the dark drop shadow stays for depth). The light `:root` value just aliases `--elevation-pop`. Token row added in `docs/design-system.md`. Selected scene stays `bg-press`, so it still reads on the lighter pill.
- Theme switch removed from the controller. Dark is forced app-wide: `ThemeProvider` in `app/layout.tsx` now uses `forcedTheme="dark"` (no `enableSystem`), so a stored `theme=light` from before or a light system setting can't apply. Checked in the browser with both set: `<html>` keeps `.dark`, `color-scheme: dark`. The capture page's `themeColor` is dark only, plus `colorScheme: "dark"`. `docs/design-system.md` now says dark only. The archived prototypes' switcher still renders but is a no-op.
- `devIndicators: false` in `next.config.ts`: no badge on desktop (1440) or the capture page (390). Note: right after the config restart, an open tab got stuck in an "HMR hash mismatch" reload loop once; a fresh tab after the next restart was fine, so reload the page if that happens.
- Screenshots (before / after) taken in the browser at 1440×900.
