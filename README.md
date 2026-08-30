# Serve Saathi — Website

Next.js (App Router, TypeScript) + Tailwind CSS v4 rebuild of the ServeSaathi
marketing site, built from the Figma file also used by the mobile app.

Read **`CLAUDE.md`** before making changes — it has the full design-system
(colors, type, spacing) and the working method for pulling designs from
Figma correctly.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Structure

- `src/app/` — routes (App Router)
- `src/components/` — page components
- `src/fonts/` — Atkinson Hyperlegible Next (brand typeface, local font files)
- `public/images/` — assets exported from Figma
- `legacy-landing/` — the old static "coming soon" page this repo used to be;
  kept for reference, not part of the build

## Status

First page shipped: `/` — "Join (Choose a role)" (Figma node `1798:21693`,
fileKey `dreRLvM7kEty4p5sNhup0I`). More pages/shared components land
incrementally.
