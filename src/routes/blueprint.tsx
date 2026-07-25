import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { MousePointerClick, Move, ZoomIn } from 'lucide-react'
import { NodeGraph } from '@/components/blueprint/node-graph'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/components/blueprint/meta'
import { SidePanel } from '@/components/blueprint/side-panel'
import { NODES } from '@/data/finance'
import { useBlueprintStore } from '@/store/blueprint'
import { cn } from '@/lib/utils'
import type { NodeCategory } from '@/types/finance'

export const Route = createFileRoute('/blueprint')({
  head: () => ({
    meta: [
      { title: 'Blueprint — Wealth DNA' },
      {
        name: 'description',
        content:
          'Your complete financial ecosystem as an interactive node graph — goals, investments, loans, insurance and the emergency fund, connected.',
      },
    ],
  }),
  component: BlueprintPage,
})

const FILTERABLE: NodeCategory[] = ['goal', 'investment', 'loan', 'insurance', 'emergency']

const HINTS = [
  { icon: MousePointerClick, text: 'Click a node for insights' },
  { icon: Move, text: 'Drag nodes to rearrange' },
  { icon: ZoomIn, text: 'Scroll to zoom, drag canvas to pan' },
] as const

function BlueprintPage() {
  const hiddenCategories = useBlueprintStore((s) => s.hiddenCategories)
  const toggleCategory = useBlueprintStore((s) => s.toggleCategory)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial blueprint</h1>
          <p className="text-muted-foreground">
            Every goal, investment, loan and protection in one living graph. Hover to trace
            dependencies; click to open the insight panel.
          </p>
        </div>
        <div className="hidden items-center gap-4 text-xs text-muted-foreground lg:flex">
          {HINTS.map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-1.5">
              <Icon className="size-3.5" /> {text}
            </span>
          ))}
        </div>
      </div>

      {/* Category filter chips (double as the legend) */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter node categories">
        {FILTERABLE.map((category) => {
          const active = !hiddenCategories.includes(category)
          const count = NODES.filter((n) => n.category === category).length
          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                active
                  ? 'border-transparent bg-card shadow-sm'
                  : 'border-dashed text-muted-foreground opacity-60',
              )}
            >
              <span
                className="size-2.5 rounded-full"
                style={{ background: CATEGORY_COLORS[category] }}
              />
              {CATEGORY_LABELS[category]}
              <span className="text-xs text-muted-foreground">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Graph canvas + overlaid side panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-[calc(100dvh-19rem)] min-h-120 overflow-hidden rounded-xl border bg-card/50"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--primary)_6%,transparent),transparent_70%)]"
        />
        <NodeGraph />
        <SidePanel />
      </motion.div>
    </div>
  )
}
