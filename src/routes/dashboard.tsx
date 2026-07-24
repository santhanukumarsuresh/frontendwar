import { createFileRoute } from '@tanstack/react-router'
import { TrendingDown, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
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
import metrics from '@/data/metrics.json'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [
      { title: 'Dashboard — Frontend Wars 2026' },
      {
        name: 'description',
        content: 'Client-side data visualization with Recharts, driven by local mock JSON data.',
      },
    ],
  }),
  component: DashboardPage,
})

// Chart colors reference the theme tokens so they restyle with the theme.
const CHART = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Sample data visualization from a local mock JSON file — no network calls.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.kpis.map((kpi) => {
          const up = kpi.delta >= 0
          return (
            <Card key={kpi.label}>
              <CardHeader>
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-2xl">
                  {kpi.value.toLocaleString()}
                  {kpi.unit ?? ''}
                </CardTitle>
              </CardHeader>
              <CardContent
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  up ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
                )}
              >
                {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {Math.abs(kpi.delta)}%
                <span className="text-muted-foreground">vs last month</span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Traffic area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Traffic</CardTitle>
            <CardDescription>Desktop vs mobile sessions</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.traffic} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--popover-foreground)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="desktop"
                  stroke="var(--chart-1)"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="mobile"
                  stroke="var(--chart-2)"
                  fill="url(#g2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channels pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Channels</CardTitle>
            <CardDescription>Acquisition mix</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.channels}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {metrics.channels.map((_, i) => (
                    <Cell key={i} fill={CHART[i % CHART.length]} stroke="var(--card)" />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--popover-foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
