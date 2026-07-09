# FanFare

A stadium event portal for the 2026 World Cup — a single-page marketing &
role-entry experience for **fans**, **staff/volunteers**, and **organizers**.

This is a React + Vite implementation of the `FanFare.dc.html` Claude Design
prototype. The design's reactive template (`sc-if` / `sc-for` / `{{ }}`
bindings and the `DCLogic` component) has been ported to real React state and
components, preserving the visual design, animations, and interactions 1:1.

## Screens

- **Landing** — hero clip with a "ball hits the net" shake synced to the strike,
  animated scoreboard counters, "How it works", an interactive 3-role Portals
  selector, a quiet-intelligence AI strip, a kinetic marquee, and a
  football-pitch impact teaser.
- **About / Impact** — the problem, impact stats, and three commitments
  (accessibility, sustainability, safety).
- **Login** — a Fan / Staff / Organizer role picker.

Navigation is client-side state (no router): `screen`, `role`, and
`activePortal` live in [`src/App.jsx`](src/App.jsx).

## Run it

```bash
npm install
npm run dev      # open the printed localhost URL
```

```bash
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Assets

The hero video and match-ball image aren't bundled. Drop them into
[`public/assets/`](public/assets/) as `goal.mp4` and `fifa-ball-2026.png`
(see [public/assets/README.md](public/assets/README.md)). Until then the app
shows a tasteful animated-pitch fallback and a CSS ball, so it runs fine
without them.

## Structure

```
src/
├── App.jsx                    state, routing, nav handlers
├── data.js                    all copy + the TRIONDA palette
├── index.css                  reset, keyframes, utility classes
├── hooks/useScrollEffects.js  reveal-on-scroll + scoreboard count-up
└── components/
    ├── Nav.jsx  ui.js  SiteFooter.jsx
    ├── Landing.jsx  About.jsx  Login.jsx
    └── landing/  Hero · Scoreboard · HowItWorks · Portals · AIStrip · Marquee · ImpactTeaser
```

> FanFare is an independent concept platform. Not affiliated with any official
> tournament, federation or governing body.
