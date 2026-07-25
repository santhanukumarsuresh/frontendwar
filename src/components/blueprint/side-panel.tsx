import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, CheckCircle2, Info, X } from 'lucide-react'
import { connectionsOf } from '@/lib/derive'
import { clampPct, formatINR, formatINRCompact, formatPct } from '@/lib/format'
import { useBlueprintStore } from '@/store/blueprint'
import { useFinanceStore } from '@/store/finance'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/components/blueprint/meta'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { EdgeRelation, FinNode, SelfNode } from '@/types/finance'

interface Insight {
  tone: 'good' | 'warn' | 'info'
  text: string
}

const RELATION_LABELS: Record<EdgeRelation, string> = {
  funds: 'Funding',
  protects: 'Protection',
  owes: 'Liability',
  plans: 'Goal',
  shields: 'Safety net',
  owns: 'Owned by you',
}

/** Rule-based insights, computed live from the node's numbers. */
function insightsFor(node: FinNode, self: SelfNode): Insight[] {
  switch (node.category) {
    case 'goal': {
      const monthsLeft = Math.max(1, (node.targetYear - 2026) * 12 + 5)
      // Required SIP assuming 11% blended annual growth: the existing corpus
      // compounds, and the gap is met by a growing monthly contribution.
      const r = 0.11 / 12
      const growth = Math.pow(1 + r, monthsLeft)
      const futureValueOfCurrent = node.currentAmount * growth
      const gap = Math.max(0, node.targetAmount - futureValueOfCurrent)
      const requiredMonthly = (gap * r) / (growth - 1)
      const insights: Insight[] = []
      if (node.planProgress >= 100) {
        insights.push({
          tone: 'good',
          text: `Ahead of plan — you've built ${formatPct(node.planProgress)} of where the plan says you should be today.`,
        })
      } else if (node.planProgress >= 75) {
        insights.push({
          tone: 'info',
          text: `Slightly behind plan at ${formatPct(node.planProgress)} of today's target. A small top-up closes the gap.`,
        })
      } else {
        insights.push({
          tone: 'warn',
          text: `Behind plan — only ${formatPct(node.planProgress)} of where you should be today.`,
        })
      }
      if (requiredMonthly > node.monthlyAllocation) {
        insights.push({
          tone: 'warn',
          text: `Reaching ${formatINRCompact(node.targetAmount)} by ${node.targetYear} needs ~${formatINRCompact(requiredMonthly)}/mo — you're allocating ${formatINRCompact(node.monthlyAllocation)}/mo. Consider stepping up by ${formatINRCompact(requiredMonthly - node.monthlyAllocation)}.`,
        })
      } else if (requiredMonthly < 500) {
        insights.push({
          tone: 'good',
          text: `At ~11% growth, the existing corpus alone compounds past ${formatINRCompact(node.targetAmount)} by ${node.targetYear} — the ${formatINRCompact(node.monthlyAllocation)}/mo allocation is pure buffer.`,
        })
      } else {
        insights.push({
          tone: 'good',
          text: `Current allocation of ${formatINRCompact(node.monthlyAllocation)}/mo covers the required pace of ~${formatINRCompact(requiredMonthly)}/mo (at 11% growth).`,
        })
      }
      return insights
    }
    case 'investment': {
      const gain = node.currentValue - node.investedAmount
      const insights: Insight[] = [
        {
          tone: gain >= 0 ? 'good' : 'warn',
          text: `${gain >= 0 ? 'Up' : 'Down'} ${formatINRCompact(Math.abs(gain))} on ${formatINRCompact(node.investedAmount)} invested (${formatPct(node.returnPct, 1)} XIRR).`,
        },
      ]
      if (node.returnPct >= 12) {
        insights.push({ tone: 'good', text: 'Beating the 12% long-term equity benchmark.' })
      } else if (node.monthlyContribution === 0) {
        insights.push({
          tone: 'info',
          text: 'No ongoing contribution — this holding grows on returns alone.',
        })
      } else {
        insights.push({
          tone: 'info',
          text: 'Steady compounder — a stabiliser rather than a growth engine.',
        })
      }
      return insights
    }
    case 'loan': {
      const paidPct = (1 - node.outstanding / node.principal) * 100
      const insights: Insight[] = [
        {
          tone: 'info',
          text: `${formatPct(paidPct)} of the principal repaid. EMI runs until ${node.endYear}.`,
        },
      ]
      insights.push(
        node.interestRate >= 9
          ? {
              tone: 'warn',
              text: `At ${formatPct(node.interestRate, 1)} interest, prepayment beats most debt returns — target this loan first.`,
            }
          : {
              tone: 'good',
              text: `At ${formatPct(node.interestRate, 1)}, equity SIPs likely out-earn prepayment. Keep the EMI running.`,
            },
      )
      return insights
    }
    case 'insurance': {
      if (node.kind === 'life') {
        const multiple = node.cover / Math.max(1, self.monthlyIncome * 12)
        return [
          {
            tone: multiple >= 15 ? 'good' : 'warn',
            text: `Cover is ${multiple.toFixed(0)}× annual income — ${multiple >= 15 ? 'meets' : 'below'} the 15–20× rule of thumb.`,
          },
          {
            tone: 'info',
            text: `Costs ${formatINR(node.annualPremium)}/yr. Renews every ${node.renewalMonth}.`,
          },
        ]
      }
      return [
        {
          tone: 'good',
          text: `${formatINRCompact(node.cover)} cover for ${formatINR(node.annualPremium)}/yr — keeps a single event from derailing the plan.`,
        },
        { tone: 'info', text: `Renews every ${node.renewalMonth} with ${node.insurer}.` },
      ]
    }
    case 'emergency': {
      const pct = (node.currentAmount / node.targetAmount) * 100
      return [
        {
          tone: node.monthsCovered >= 6 ? 'good' : 'warn',
          text: `Covers ${node.monthsCovered} months of expenses — target is 6. ${formatPct(pct)} funded.`,
        },
        {
          tone: 'info',
          text: `Parked in liquid funds and a sweep-in FD, redeemable within 24 hours.`,
        },
      ]
    }
    case 'self':
      return [
        {
          tone: 'good',
          text: `Saving ${formatPct(((self.monthlyIncome - self.monthlyExpenses) / Math.max(1, self.monthlyIncome)) * 100)} of income — well above the 30% benchmark.`,
        },
        {
          tone: 'info',
          text: 'Every node in this blueprint connects back here. Click any of them to trace the relationship.',
        },
      ]
  }
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn('mt-0.5 text-base font-bold tabular-nums', accent && 'text-primary')}>
        {value}
      </div>
    </div>
  )
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampPct(value)}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}

/** Key figures grid, specific to the node type. */
function NodeStats({ node }: { node: FinNode }) {
  switch (node.category) {
    case 'goal':
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Target" value={formatINRCompact(node.targetAmount)} accent />
            <Stat label="Saved so far" value={formatINRCompact(node.currentAmount)} />
            <Stat label="Target year" value={String(node.targetYear)} />
            <Stat
              label="Monthly allocation"
              value={`${formatINRCompact(node.monthlyAllocation)}/mo`}
            />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress vs plan today</span>
              <span className="font-semibold text-foreground">{formatPct(node.planProgress)}</span>
            </div>
            <ProgressBar value={node.planProgress} color={CATEGORY_COLORS.goal} />
          </div>
        </>
      )
    case 'investment':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Current value" value={formatINRCompact(node.currentValue)} accent />
          <Stat label="Invested" value={formatINRCompact(node.investedAmount)} />
          <Stat label="XIRR" value={formatPct(node.returnPct, 1)} />
          <Stat
            label="Contribution"
            value={
              node.monthlyContribution ? `${formatINRCompact(node.monthlyContribution)}/mo` : '—'
            }
          />
        </div>
      )
    case 'loan':
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Outstanding" value={formatINRCompact(node.outstanding)} accent />
            <Stat label="EMI" value={`${formatINR(node.emi)}/mo`} />
            <Stat label="Interest rate" value={formatPct(node.interestRate, 1)} />
            <Stat label="Closes" value={String(node.endYear)} />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Principal repaid</span>
              <span className="font-semibold text-foreground">
                {formatPct((1 - node.outstanding / node.principal) * 100)}
              </span>
            </div>
            <ProgressBar
              value={(1 - node.outstanding / node.principal) * 100}
              color={CATEGORY_COLORS.loan}
            />
          </div>
        </>
      )
    case 'insurance':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Cover" value={formatINRCompact(node.cover)} accent />
          <Stat label="Premium" value={`${formatINR(node.annualPremium)}/yr`} />
          <Stat label="Renewal" value={node.renewalMonth} />
          <Stat label="Insurer" value={node.insurer.split(' ').slice(0, 2).join(' ')} />
        </div>
      )
    case 'emergency':
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Corpus" value={formatINRCompact(node.currentAmount)} accent />
            <Stat label="Target" value={formatINRCompact(node.targetAmount)} />
            <Stat label="Months covered" value={`${node.monthsCovered} / 6`} />
            <Stat label="Liquidity" value="24 hrs" />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Funded</span>
              <span className="font-semibold text-foreground">
                {formatPct((node.currentAmount / node.targetAmount) * 100)}
              </span>
            </div>
            <ProgressBar
              value={(node.currentAmount / node.targetAmount) * 100}
              color={CATEGORY_COLORS.emergency}
            />
          </div>
        </>
      )
    case 'self':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Age" value={`${node.age} yrs`} />
          <Stat label="Profession" value={node.occupation.split(',')[0]} />
          <Stat label="Monthly income" value={formatINRCompact(node.monthlyIncome)} accent />
          <Stat label="Monthly expenses" value={formatINRCompact(node.monthlyExpenses)} />
        </div>
      )
  }
}

const TONE_ICONS = {
  good: CheckCircle2,
  warn: AlertTriangle,
  info: Info,
} as const

export function SidePanel() {
  const selectedId = useBlueprintStore((s) => s.selectedId)
  const select = useBlueprintStore((s) => s.select)
  const nodes = useFinanceStore((s) => s.nodes)

  const node = selectedId ? nodes.find((n) => n.id === selectedId) : undefined
  const self = nodes.find((n): n is SelfNode => n.category === 'self')!

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          key={node.id}
          initial={{ x: '105%', opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '105%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="absolute inset-y-3 right-3 z-10 flex w-[calc(100%-1.5rem)] max-w-sm flex-col overflow-y-auto rounded-xl border bg-card/95 p-5 shadow-xl backdrop-blur"
          aria-label={`${node.label} details`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="mt-0.5 size-3.5 shrink-0 rounded-full"
                style={{ background: CATEGORY_COLORS[node.category] }}
              />
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_LABELS[node.category]}
                </div>
                <h2 className="text-lg font-bold leading-tight">{node.label}</h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close panel"
              onClick={() => select(null)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">{node.description}</p>

          <div className="mt-4">
            <NodeStats node={node} />
          </div>

          <Separator className="my-4" />

          <h3 className="text-sm font-semibold">Insights</h3>
          <ul className="mt-2 space-y-2">
            {insightsFor(node, self).map((insight, i) => {
              const Icon = TONE_ICONS[insight.tone]
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex gap-2 rounded-lg border bg-background/60 p-2.5 text-sm"
                >
                  <Icon
                    className={cn(
                      'mt-0.5 size-4 shrink-0',
                      insight.tone === 'good' && 'text-emerald-500',
                      insight.tone === 'warn' && 'text-amber-500',
                      insight.tone === 'info' && 'text-primary',
                    )}
                  />
                  <span>{insight.text}</span>
                </motion.li>
              )
            })}
          </ul>

          <Separator className="my-4" />

          <h3 className="text-sm font-semibold">Connected in your blueprint</h3>
          <ul className="mt-2 space-y-1.5">
            {connectionsOf(nodes, node.id).map(({ edge, other }) => (
              <li key={`${edge.source}-${edge.target}-${edge.relation}`}>
                <button
                  onClick={() => select(other.id)}
                  className="group flex w-full items-center gap-2.5 rounded-lg border bg-background/60 px-3 py-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: CATEGORY_COLORS[other.category] }}
                  />
                  <span className="flex-1 font-medium">{other.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {RELATION_LABELS[edge.relation]}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
