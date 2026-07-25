import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CASH_FLOW, NET_WORTH_HISTORY, TRANSACTIONS } from '@/data/finance'
import { computeTotals, deriveAllocation, getGoals, getSelf } from '@/lib/derive'
import { useFinanceStore } from '@/store/finance'
import { clampPct, formatINR, formatINRCompact, formatPct } from '@/lib/format'
import { AnimatedNumber } from '@/components/animated-number'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { InsuranceNode, LoanNode } from '@/types/finance'

export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [
      { title: 'Dashboard — Wealth DNA' },
      {
        name: 'description',
        content:
          'Net worth, cash flow, asset allocation, goals, loans and protection — your entire financial life on one dashboard.',
      },
    ],
  }),
  component: DashboardPage,
})

const CHART = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  '#f59e0b',
  '#64748b',
]

const TOOLTIP_STYLE = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--popover-foreground)',
  fontSize: 12,
} as const

const compactTick = (v: number) => formatINRCompact(v)
const tooltipINR = (v: number | string | ReadonlyArray<number | string> | undefined) =>
  formatINRCompact(Number(Array.isArray(v) ? v[0] : (v ?? 0)))

function DashboardPage() {
  const nodes = useFinanceStore((s) => s.nodes)
  const totals = computeTotals(nodes)
  const goals = getGoals(nodes)
  const self = getSelf(nodes)
  const allocation = deriveAllocation(nodes)

  const first = NET_WORTH_HISTORY[0]
  const last = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 1]
  const prev = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 2]
  const yoyGrowth = ((last.netWorth - first.netWorth) / first.netWorth) * 100
  const momDelta = ((last.netWorth - prev.netWorth) / prev.netWorth) * 100

  const loans = nodes.filter((n): n is LoanNode => n.category === 'loan')
  const insurance = nodes.filter((n): n is InsuranceNode => n.category === 'insurance')

  const kpis = [
    {
      label: 'Net worth',
      value: totals.netWorth,
      format: formatINRCompact,
      delta: momDelta,
      deltaLabel: 'vs last month',
      icon: Wallet,
    },
    {
      label: 'Investments',
      value: totals.investments,
      format: formatINRCompact,
      delta: 14.2,
      deltaLabel: 'blended XIRR',
      icon: TrendingUp,
    },
    {
      label: 'Liabilities',
      value: totals.liabilities,
      format: formatINRCompact,
      delta: -8.7,
      deltaLabel: 'debt this year',
      invert: true,
      icon: Landmark,
    },
    {
      label: 'Savings rate',
      value: totals.savingsRate,
      format: (v: number) => formatPct(v),
      delta: totals.monthlySip / 1000,
      deltaLabel: `₹${Math.round(totals.monthlySip / 1000)}K SIP/mo`,
      plain: true,
      icon: PiggyBank,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {self.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            Your net worth grew {formatPct(yoyGrowth)} over the last 24 months. Here's the full
            picture.
          </p>
        </div>
        <Link
          to="/blueprint"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Open the blueprint <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, format, delta, deltaLabel, invert, plain, icon: Icon }, i) => {
          const positive = invert ? delta < 0 : delta >= 0
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription>{label}</CardDescription>
                    <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <CardTitle className="text-2xl tabular-nums">
                    <AnimatedNumber value={value} format={format} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-1 text-sm font-medium">
                  {plain ? (
                    <span className="text-muted-foreground">{deltaLabel}</span>
                  ) : (
                    <>
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5',
                          positive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive',
                        )}
                      >
                        {delta >= 0 ? (
                          <ArrowUpRight className="size-4" />
                        ) : (
                          <ArrowDownRight className="size-4" />
                        )}
                        {formatPct(Math.abs(delta), 1)}
                      </span>
                      <span className="text-muted-foreground">{deltaLabel}</span>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Net worth trend + allocation */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Net worth trend</CardTitle>
            <CardDescription>
              Assets vs liabilities, last 24 months — {formatINRCompact(first.netWorth)} →{' '}
              {formatINRCompact(last.netWorth)}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={NET_WORTH_HISTORY} margin={{ left: 4, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gAssets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={compactTick}
                  width={52}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipINR} />
                <Area
                  type="monotone"
                  dataKey="assets"
                  name="Assets"
                  stroke="var(--chart-1)"
                  fill="url(#gAssets)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  name="Net worth"
                  stroke="var(--chart-2)"
                  fill="url(#gNet)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset allocation</CardTitle>
            <CardDescription>
              {formatINRCompact(allocation.reduce((sum, slice) => sum + slice.value, 0))} across{' '}
              {allocation.length} buckets
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {allocation.map((_, i) => (
                    <Cell key={i} fill={CHART[i % CHART.length]} stroke="var(--card)" />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipINR} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cash flow + goals */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash flow</CardTitle>
            <CardDescription>
              Income vs expenses vs investments — averaging{' '}
              {formatINRCompact(totals.monthlySip + 10500)} invested per month
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CASH_FLOW} margin={{ left: 4, right: 8, top: 8 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={compactTick}
                  width={52}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipINR} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" name="Income" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="invested" name="Invested" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal progress</CardTitle>
            <CardDescription>Against plan, as of today</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {goals.map((goal) => (
              <div key={goal.id}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{goal.label}</span>
                  <span
                    className={cn(
                      'text-xs font-semibold tabular-nums',
                      goal.planProgress >= 100
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : goal.planProgress >= 75
                          ? 'text-muted-foreground'
                          : 'text-amber-600 dark:text-amber-400',
                    )}
                  >
                    {formatPct(goal.planProgress)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${clampPct(goal.planProgress)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      goal.planProgress >= 100
                        ? 'bg-emerald-500'
                        : goal.planProgress >= 75
                          ? 'bg-primary'
                          : 'bg-amber-500',
                    )}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatINRCompact(goal.currentAmount)} of {formatINRCompact(goal.targetAmount)} ·{' '}
                  {goal.targetYear}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Loans + protection + transactions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Loans</CardTitle>
            <CardDescription>
              {formatINR(totals.monthlyEmi)}/mo in EMIs · {formatINRCompact(totals.liabilities)}{' '}
              outstanding
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {loans.map((loan) => {
              const paid = (1 - loan.outstanding / loan.principal) * 100
              return (
                <div key={loan.id}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-medium">{loan.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatPct(loan.interestRate, 1)} · till {loan.endYear}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${clampPct(paid)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-chart-4"
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{formatPct(paid)} repaid</span>
                    <span>
                      {formatINRCompact(loan.outstanding)} left · EMI {formatINR(loan.emi)}
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protection</CardTitle>
            <CardDescription>
              {formatINRCompact(totals.insuranceCover)} total cover
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {insurance.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center gap-3 rounded-lg border bg-background/60 p-3"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-chart-3/15 text-chart-3">
                  <ShieldCheck className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{policy.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatINR(policy.annualPremium)}/yr · renews {policy.renewalMonth}
                  </div>
                </div>
                <div className="text-sm font-bold tabular-nums text-primary">
                  {formatINRCompact(policy.cover)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>July 2026</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            {TRANSACTIONS.map((tx, i) => (
              <div
                key={tx.id}
                className={cn(
                  'flex items-center gap-3 py-2.5',
                  i > 0 && 'border-t border-border/60',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full',
                    tx.direction === 'credit'
                      ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tx.direction === 'credit' ? (
                    <ArrowDownRight className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{tx.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {tx.date} · {tx.category}
                  </div>
                </div>
                <div
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    tx.direction === 'credit'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-foreground',
                  )}
                >
                  {tx.direction === 'credit' ? '+' : '−'}
                  {formatINR(tx.amount)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
