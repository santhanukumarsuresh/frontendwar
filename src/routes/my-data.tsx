import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Info,
  Landmark,
  PiggyBank,
  RotateCcw,
  ShieldCheck,
  Target,
  User,
  Wallet,
} from 'lucide-react'
import { computeTotals } from '@/lib/derive'
import { formatINRCompact } from '@/lib/format'
import { useFinanceStore } from '@/store/finance'
import { CATEGORY_COLORS } from '@/components/blueprint/meta'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FinNode } from '@/types/finance'

export const Route = createFileRoute('/my-data')({
  head: () => ({
    meta: [
      { title: 'My Data — Wealth DNA' },
      {
        name: 'description',
        content:
          'Enter your own financial details — profile, goals, investments, loans, insurance and emergency fund. Everything in Wealth DNA is drawn from this.',
      },
    ],
  }),
  component: MyDataPage,
})

/**
 * A numeric input that holds a local draft while typing and commits to the
 * store on blur / Enter. Syncs back if the store changes underneath it
 * (e.g. "Reset demo data").
 */
function NumField({
  id,
  label,
  value,
  onCommit,
}: {
  id: string
  label: string
  value: number
  onCommit: (v: number) => void
}) {
  const [draft, setDraft] = useState(String(value))
  // Sync the draft when the store changes underneath (React's sanctioned
  // "adjust state during render" pattern — no effect, no extra pass).
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setDraft(String(value))
  }

  function commit() {
    const parsed = Number(draft)
    if (Number.isFinite(parsed) && parsed >= 0 && parsed !== value) onCommit(parsed)
    else setDraft(String(value))
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="truncate text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      />
    </div>
  )
}

function TextField({
  id,
  label,
  value,
  onCommit,
}: {
  id: string
  label: string
  value: string
  onCommit: (v: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setDraft(value)
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onCommit(trimmed)
    else setDraft(value)
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="truncate text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      />
    </div>
  )
}

/** Numeric fields shown per node, keyed by category. */
const NODE_FIELDS: Partial<Record<FinNode['category'], { key: string; label: string }[]>> = {
  goal: [
    { key: 'targetAmount', label: 'Target (₹)' },
    { key: 'currentAmount', label: 'Saved so far (₹)' },
    { key: 'monthlyAllocation', label: 'Monthly allocation (₹)' },
    { key: 'targetYear', label: 'Target year' },
  ],
  investment: [
    { key: 'currentValue', label: 'Current value (₹)' },
    { key: 'investedAmount', label: 'Invested (₹)' },
    { key: 'monthlyContribution', label: 'Monthly contribution (₹)' },
  ],
  loan: [
    { key: 'outstanding', label: 'Outstanding (₹)' },
    { key: 'emi', label: 'EMI (₹/mo)' },
    { key: 'interestRate', label: 'Interest rate (%)' },
  ],
  insurance: [
    { key: 'cover', label: 'Cover (₹)' },
    { key: 'annualPremium', label: 'Premium (₹/yr)' },
  ],
  emergency: [
    { key: 'currentAmount', label: 'Current corpus (₹)' },
    { key: 'targetAmount', label: 'Target corpus (₹)' },
  ],
}

function NodeRows({ category, icon: Icon }: { category: FinNode['category']; icon: typeof Target }) {
  const nodes = useFinanceStore((s) => s.nodes)
  const updateNode = useFinanceStore((s) => s.updateNode)
  const fields = NODE_FIELDS[category] ?? []
  const items = nodes.filter((n) => n.category === category)

  return (
    <div className="flex flex-col gap-5">
      {items.map((node) => (
        <div key={node.id}>
          <div className="mb-2 flex items-center gap-2">
            <span
              className="grid size-6 place-items-center rounded-md"
              style={{ background: `color-mix(in oklab, ${CATEGORY_COLORS[category]} 18%, transparent)` }}
            >
              <Icon className="size-3.5" style={{ color: CATEGORY_COLORS[category] }} />
            </span>
            <span className="text-sm font-semibold">{node.label}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fields.map((f) => (
              <NumField
                key={f.key}
                id={`${node.id}-${f.key}`}
                label={f.label}
                value={(node as unknown as Record<string, number>)[f.key]}
                onCommit={(v) => updateNode(node.id, { [f.key]: v } as Partial<FinNode>)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MyDataPage() {
  const nodes = useFinanceStore((s) => s.nodes)
  const updateNode = useFinanceStore((s) => s.updateNode)
  const resetData = useFinanceStore((s) => s.resetData)
  const self = nodes.find((n) => n.category === 'self')
  const totals = computeTotals(nodes)

  if (!self || self.category !== 'self') return null

  const sections = [
    { key: 'goal', title: 'Goals', desc: 'What you are building toward.', icon: Target },
    { key: 'investment', title: 'Investments', desc: 'Everything working for you.', icon: PiggyBank },
    { key: 'loan', title: 'Loans', desc: 'What you owe and its cost.', icon: Landmark },
    { key: 'insurance', title: 'Insurance', desc: 'What protects the plan.', icon: ShieldCheck },
    { key: 'emergency', title: 'Emergency fund', desc: 'Your liquidity buffer.', icon: Wallet },
  ] as const

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My financial data</h1>
          <p className="mt-1 text-muted-foreground">
            This single page powers everything — the{' '}
            <Link to="/blueprint" className="font-medium text-primary underline-offset-4 hover:underline">
              blueprint
            </Link>
            , the{' '}
            <Link to="/dashboard" className="font-medium text-primary underline-offset-4 hover:underline">
              dashboard
            </Link>{' '}
            and the{' '}
            <Link to="/timeline" className="font-medium text-primary underline-offset-4 hover:underline">
              timeline
            </Link>{' '}
            all recalculate live from what you enter here.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetData}>
          <RotateCcw className="size-4" /> Reset demo data
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Demo mode.</span> In the real product
          you'd sign in and fill this in once during onboarding. It's prefilled with a realistic
          persona — change any number (saved on blur) and watch every view update. Data lives only
          in this browser.
        </p>
      </motion.div>

      {/* Live summary strip — instant feedback that edits ripple everywhere */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border bg-card/60 p-4 text-center sm:grid-cols-4">
        {(
          [
            ['Net worth', totals.netWorth],
            ['Investments', totals.investments],
            ['Liabilities', totals.liabilities],
            ['Cover', totals.insuranceCover],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <div className="text-lg font-bold tabular-nums text-primary">
              {formatINRCompact(value)}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4 text-primary" /> About you
          </CardTitle>
          <CardDescription>Shown as the centre of your blueprint.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            id="self-name"
            label="Full name"
            value={self.name}
            onCommit={(v) => updateNode('you', { name: v })}
          />
          <TextField
            id="self-occupation"
            label="Occupation, city"
            value={self.occupation}
            onCommit={(v) => updateNode('you', { occupation: v })}
          />
          <NumField
            id="self-age"
            label="Age"
            value={self.age}
            onCommit={(v) => updateNode('you', { age: v })}
          />
          <NumField
            id="self-income"
            label="Monthly income (₹)"
            value={self.monthlyIncome}
            onCommit={(v) => updateNode('you', { monthlyIncome: v })}
          />
          <NumField
            id="self-expenses"
            label="Monthly expenses (₹)"
            value={self.monthlyExpenses}
            onCommit={(v) => updateNode('you', { monthlyExpenses: v })}
          />
        </CardContent>
      </Card>

      {sections.map(({ key, title, desc, icon: Icon }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: i * 0.03 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="size-4 text-primary" /> {title}
              </CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <NodeRows category={key} icon={Icon} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
