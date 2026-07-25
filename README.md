# Wealth DNA — Your Financial Life Blueprint

A modern, responsive **Personal Finance SaaS platform** that visualizes your complete financial
ecosystem as one interactive blueprint. Goals, investments, insurance, loans and the emergency
fund are connected in a living node graph, tracked on a milestone timeline, and summarized on a
premium FinTech dashboard — 100% client-side, powered by realistic mock financial data.

> Built for **Frontend Wars 2026 — Phase 1**, problem statement *"Wealth DNA – Financial Life
> Blueprint"*.

## ✨ Features

| # | Mandatory feature | Where |
|---|---|---|
| 01 | **Interactive financial node graph** connecting goals, investments, loans & insurance — D3 force simulation with drag, pan/zoom and money-flow animations | `/blueprint` |
| 02 | **Financial milestone timeline** with progress visualization across short / mid / long-term horizons | `/timeline` |
| 03 | **Animated side panels** with detailed, rule-based financial insights per node | `/blueprint` (click any node) |
| 04 | **Goal dependency & relationship visualization** — hover/select highlights every funding, protection and liability link | `/blueprint` |
| 05 | **Responsive premium FinTech dashboard** with realistic mock datasets (net worth trend, cash flow, allocation, EMIs, cover) | `/dashboard` |

Plus: **bring your own data** — click any node in the blueprint and use the pencil to enter your
real numbers (persisted to LocalStorage, never sent anywhere; reset from Settings), light/dark
theming with a circular-reveal transition (View Transitions API), accent customization, animated
count-up KPIs and page transitions, installable PWA with offline support, and reduced-motion
accessibility support.

## 🧬 How it's modelled

Everything renders from one typed graph in [`src/data/finance.ts`](src/data/finance.ts):

- **Nodes** — the user, 5 goals, 6 investments, 2 loans, 3 insurance policies and the emergency
  fund (discriminated union in [`src/types/finance.ts`](src/types/finance.ts)).
- **Edges** — typed relationships: `funds`, `protects`, `owes`, `plans`, `shields`.
- The blueprint renders the graph, the timeline reads the goal nodes, and the dashboard
  aggregates the same data — a single source of truth, no duplication.

Amounts use Indian conventions (₹, lakh/crore) via [`src/lib/format.ts`](src/lib/format.ts).

## 🛠 Tech stack

- **React 19 + TypeScript + Vite** — client-side only, no backend, no SSR
- **TanStack Router** — file-based, code-split client routes
- **Tailwind CSS v4** — token-driven design system (every color is a CSS variable)
- **D3** (force simulation + zoom) — the blueprint graph
- **Recharts** — dashboard charts
- **Framer Motion** — side panels, progress bars, page transitions
- **Zustand** — theme + blueprint UI state, persisted to LocalStorage
- **vite-plugin-pwa** — installable, offline-first

## 🚀 Getting started

```bash
pnpm install
pnpm dev        # start the dev server
pnpm build      # typecheck + production build (dist/)
pnpm preview    # preview the production build
pnpm lint       # eslint
pnpm typecheck  # tsc only
```

Requires Node ≥ 20 and pnpm. Deploys as a static SPA (Vercel config and GitHub Pages
`VITE_BASE` support included).

## 📁 Structure

```
src/
├── components/
│   ├── blueprint/       # node-graph.tsx (D3 force graph), side-panel.tsx (animated insights)
│   ├── layout/          # header, theme toggle
│   └── ui/              # button, card, slider, … (shadcn-style primitives)
├── data/finance.ts      # the mock financial universe (nodes, edges, milestones, time series)
├── lib/format.ts        # ₹ lakh/crore formatting
├── routes/              # / (landing) · /dashboard · /blueprint · /timeline · /settings
├── store/               # zustand: theme + blueprint selection/filters
└── types/finance.ts     # domain model
```
