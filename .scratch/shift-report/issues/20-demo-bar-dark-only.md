# 20: Demo controller polish, dark only, no Next.js dev badge

**What to build:** Filip's calls after the demo (2026-10-31):
- The floating demo controller (scene switch Start of shift 20:00 / End of night 02:15, Reset) gets slightly lighter, with an ultra-subtle light shadow so it lifts off the dark page. Stay within `docs/design-system.md` tokens; add one only if none fits.
- Remove the light/dark switch from the demo controller. The app shows dark only; light mode is out of scope (PROCESS.md 2c updated).
- Turn off the Next.js dev indicator (`devIndicators: false` in `next.config.ts`); it covers buttons on desktop and mobile.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Agent:** Sonnet, high effort (UI polish)

- [ ] Demo controller is lighter with a barely-there light shadow; it still reads as a demo tool, not product UI
- [ ] No theme switch anywhere; the page is always dark
- [ ] No Next.js dev badge on desktop or the capture page
- [ ] Looks and works like prototype E, per `docs/design-system.md`
