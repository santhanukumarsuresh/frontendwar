import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { MousePointerClick, Pencil } from 'lucide-react'
import { NodeGraph } from '@/components/blueprint/node-graph'
import { SidePanel } from '@/components/blueprint/side-panel'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/components/blueprint/meta'
import { useBlueprintStore } from '@/store/blueprint'
import { useFinanceStore } from '@/store/finance'
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

function BlueprintPage() {
  const hiddenCategories = useBlueprintStore((s) => s.hiddenCategories)
  const toggleCategory = useBlueprintStore((s) => s.toggleCategory)
  const nodes = useFinanceStore((s) => s.nodes)

  return (
    // Sized to the viewport (header + page padding + footer) so the whole
    // blueprint is visible without scrolling.
    <div className="flex h-[calc(100dvh-13rem)] min-h-84 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Financial blueprint</h1>
          <p className="hidden text-sm text-muted-foreground lg:flex lg:items-center lg:gap-3">
            <span className="inline-flex items-center gap-1">
              <MousePointerClick className="size-3.5" /> Click a node for insights
            </span>
            <span className="inline-flex items-center gap-1">
              <Pencil className="size-3.5" /> Numbers come from{' '}
              <Link to="/my-data" className="font-medium text-primary underline-offset-4 hover:underline">
                My Data
              </Link>
            </span>
          </p>
        </div>

        {/* Category filter chips (double as the node legend) */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter node categories">
          {FILTERABLE.map((category) => {
            const active = !hiddenCategories.includes(category)
            const count = nodes.filter((n) => n.category === category).length
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                  active
                    ? 'border-transparent bg-card shadow-sm'
                    : 'border-dashed text-muted-foreground opacity-60',
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: CATEGORY_COLORS[category] }}
                />
                {CATEGORY_LABELS[category]}
                <span className="text-muted-foreground">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Graph canvas + overlaid controls, legend and side panel */}
      <motion.div
        data-graph-shell
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative min-h-0 flex-1 overflow-hidden rounded-xl border bg-card/50"
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
