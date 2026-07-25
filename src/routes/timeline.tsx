import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Car,
  CheckCircle2,
  CircleDollarSign,
  Flag,
  GraduationCap,
  Home,
  Plane,
  ShieldCheck,
  Sunrise,
} from 'lucide-react'
import { MILESTONES } from '@/data/finance'
import { clampPct, formatINRCompact, formatPct } from '@/lib/format'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { GoalHorizon, Milestone } from '@/types/finance'

export const Route = createFileRoute('/timeline')({
  head: () => ({
    meta: [
      { title: 'Timeline — Wealth DNA' },
      {
        name: 'description',
        content:
          'Every financial milestone on one timeline — short, mid and long term — with live progress against the plan.',
      },
    ],
  }),
  component: TimelinePage,
})

const HORIZONS: { key: GoalHorizon; title: string; range: string }[] = [
  { key: 'short', title: 'Short term', range: '1–2 years · 2026–2028' },
  { key: 'mid', title: 'Mid term', range: '3–5 years · 2029–2031' },
  { key: 'long', title: 'Long term', range: '5+ years · 2032 onwards' },
]

const MILESTONE_ICONS: Record<string, typeof Flag> = {
  'ms-emergency': ShieldCheck,
  'ms-car-loan': CircleDollarSign,
  'ms-car': Car,
  'ms-europe': Plane,
  'ms-home': Home,
  'ms-education': GraduationCap,
  'ms-retirement': Sunrise,
}

const STATUS_META = {
  achieved: { label: 'Achieved', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  'on-track': { label: 'On track', className: 'bg-primary/12 text-primary' },
  'needs-attention': { label: 'Needs attention', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
} as const

function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
  const Icon = MILESTONE_ICONS[milestone.id] ?? Flag
  const status = STATUS_META[milestone.status]
  const funded = (milestone.currentAmount / milestone.targetAmount) * 100

  return (
    <motion.li
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative pl-12"
    >
      {/* Timeline dot */}
      <span
        className={cn(
          'absolute left-0 top-4 grid size-9 place-items-center rounded-full border-2 bg-card',
          milestone.status === 'needs-attention' ? 'border-amber-500/60' : 'border-primary/60',
        )}
      >
        <Icon className="size-4 text-primary" />
      </span>

      <Card className="transition-colors hover:border-primary/40">
        <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{milestone.title}</h3>
                <span
                  className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', status.className)}
                >
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Target {formatINRCompact(milestone.targetAmount)} by {milestone.targetYear}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold tabular-nums text-primary">
                {formatINRCompact(milestone.currentAmount)}
              </div>
              <div className="text-xs text-muted-foreground">{formatPct(funded)} funded</div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Progress vs plan today</span>
              <span
                className={cn(
                  'font-semibold',
                  milestone.planProgress >= 100
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : milestone.planProgress >= 75
                      ? 'text-foreground'
                      : 'text-amber-600 dark:text-amber-400',
                )}
              >
                {formatPct(milestone.planProgress)}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${clampPct(milestone.planProgress)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
                className={cn(
                  'h-full rounded-full',
                  milestone.planProgress >= 100
                    ? 'bg-emerald-500'
                    : milestone.planProgress >= 75
                      ? 'bg-primary'
                      : 'bg-amber-500',
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.li>
  )
}

function TimelinePage() {
  const onTrack = MILESTONES.filter((m) => m.planProgress >= 75).length

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Milestone timeline</h1>
        <p className="mt-1 text-muted-foreground">
          {onTrack} of {MILESTONES.length} milestones are at 75%+ of plan. Each one maps to a node
          in the{' '}
          <Link to="/blueprint" className="font-medium text-primary underline-offset-4 hover:underline">
            blueprint
          </Link>
          .
        </p>
      </div>

      {HORIZONS.map(({ key, title, range }) => {
        const items = MILESTONES.filter((m) => m.horizon === key)
        if (items.length === 0) return null
        return (
          <section key={key} aria-label={title}>
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-lg font-bold">{title}</h2>
              <span className="text-sm text-muted-foreground">{range}</span>
            </div>
            <ol className="relative flex flex-col gap-4">
              {/* Spine */}
              <span
                aria-hidden
                className="absolute bottom-4 left-4.25 top-4 w-0.5 bg-linear-to-b from-primary/50 via-border to-border"
              />
              {items.map((m, i) => (
                <MilestoneCard key={m.id} milestone={m} index={i} />
              ))}
            </ol>
          </section>
        )
      })}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground"
      >
        <CheckCircle2 className="mx-auto mb-2 size-5 text-emerald-500" />
        The journey ends at financial independence in 2054 — a ₹6.5Cr corpus at age 60.
      </motion.div>
    </div>
  )
}
