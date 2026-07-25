# Wealth DNA — Your Financial Life Blueprint

Live at: **https://santhanukumarsuresh.github.io/frontendwar/**

A responsive personal finance platform that shows your complete financial ecosystem as one
interactive blueprint. Goals, investments, insurance, loans and the emergency fund are connected
in a living node graph, tracked on a milestone timeline, and summarised on a dashboard. The whole
app runs in the browser — there is no backend.

Built for Frontend Wars 2026 (Phase 1), problem statement "Wealth DNA – Financial Life Blueprint".

## Features

| # | Mandatory feature | Where |
|---|---|---|
| 01 | Interactive financial node graph connecting goals, investments, loans and insurance (D3 force simulation with drag, pan/zoom and animated funding edges) | `/blueprint` |
| 02 | Financial milestone timeline with progress across short / mid / long-term horizons | `/timeline` |
| 03 | Animated side panels with detailed, rule-based insights per node | `/blueprint` (click any node) |
| 04 | Goal dependency and relationship visualization — hover or select to highlight every funding, protection and liability link | `/blueprint` |
| 05 | Responsive FinTech dashboard on realistic mock data (net worth trend, cash flow, allocation, EMIs, cover) | `/dashboard` |

Beyond the brief:

- Sign-up flow (mock, no server): basic details collected at sign-up personalise the dataset,
  then the profile page holds account, appearance settings and the full data editor.
- Bring your own numbers: every figure is editable, and items you don't have (say, a car loan)
  can be removed and later restored. Everything persists to LocalStorage and never leaves the
  browser.
- Light/dark theming with a circular-reveal transition, accent picker and adjustable radius.
- Installable PWA with offline support, count-up numbers, page transitions, reduced-motion
  fallbacks.

## How it works

The data model is one typed graph, seeded in [`src/data/finance.ts`](src/data/finance.ts) and
held in an editable Zustand store ([`src/store/finance.ts`](src/store/finance.ts)):

- Nodes: the user, goals, investments, loans, insurance policies and the emergency fund
  (discriminated union in [`src/types/finance.ts`](src/types/finance.ts)).
- Edges: typed relationships — `funds`, `protects`, `owes`, `plans`, `shields`.
- Everything else derives from the store ([`src/lib/derive.ts`](src/lib/derive.ts)): totals,
  allocation, milestones, blended returns, and the chart series, which are rescaled so trends
  always land on the user's current numbers.

Amounts follow Indian conventions (rupees, lakh/crore) via
[`src/lib/format.ts`](src/lib/format.ts).

## Tech stack

- React 19, TypeScript, Vite — client-side only
- TanStack Router (file-based, code-split routes with an auth guard)
- Tailwind CSS v4 — token-driven theming, every color is a CSS variable
- D3 force simulation and zoom for the blueprint graph
- Recharts for dashboard charts, Framer Motion for animation
- Zustand (persisted) for data, auth and theme state
- vite-plugin-pwa for the offline service worker

## Development

```bash
pnpm install
pnpm dev        # start the dev server
pnpm build      # typecheck + production build (dist/)
pnpm preview    # preview the production build
pnpm lint       # eslint
pnpm typecheck  # tsc only
```

Requires Node 20+ and pnpm. Deploys to GitHub Pages via
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which sets
`VITE_BASE` to the repository subpath; a Vercel config is also included.

## Project structure

```
src/
├── components/
│   ├── blueprint/       # node-graph.tsx (D3 graph), side-panel.tsx (insight panel)
│   ├── profile/         # appearance-settings.tsx, financial-data.tsx (data editor)
│   ├── layout/          # header, theme toggle
│   └── ui/              # button, card, slider and other primitives
├── data/finance.ts      # sample dataset (nodes, edges, base series)
├── lib/                 # derive.ts, format.ts, auth-guard.ts
├── routes/              # / login dashboard blueprint timeline profile
├── store/               # zustand: finance, auth, theme, blueprint UI state
└── types/finance.ts     # domain model
```
