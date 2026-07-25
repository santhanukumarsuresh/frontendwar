import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Landmark,
  PiggyBank,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  User,
  Wallet,
} from 'lucide-react'
import { DEFAULT_NODES } from '@/data/finance'
import { computeTotals } from '@/lib/derive'
import { formatINRCompact } from '@/lib/format'
import { useFinanceStore } from '@/store/finance'
import { CATEGORY_COLORS } from '@/components/blueprint/meta'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FinNode, NodeCategory } from '@/types/finance'

/**
 * A numeric input that holds a local draft while typing and commits to the
 * store on blur / Enter. Syncs back if the store changes underneath it.
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
  // If the store value changes underneath us (reset, restore), drop the draft.
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
const NODE_FIELDS: Partial<Record<NodeCategory, { key: string; label: string }[]>> = {
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

function NodeRows({
  category,
  icon: Icon,
}: {
  category: NodeCategory
  icon: typeof Target
}) {
  const nodes = useFinanceStore((s) => s.nodes)
  const updateNode = useFinanceStore((s) => s.updateNode)
  const removeNode = useFinanceStore((s) => s.removeNode)
  const fields = NODE_FIELDS[category] ?? []
  const items = nodes.filter((n) => n.category === category)

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing here — that's perfectly fine. Restore an item below if you need it back.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {items.map((node) => (
        <div key={node.id}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="grid size-6 place-items-center rounded-md"
                style={{
                  background: `color-mix(in oklab, ${CATEGORY_COLORS[category]} 18%, transparent)`,
                }}
              >
                <Icon className="size-3.5" style={{ color: CATEGORY_COLORS[category] }} />
              </span>
              <span className="text-sm font-semibold">{node.label}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${node.label} — I don't have this`}
              onClick={() => removeNode(node.id)}
            >
              <Trash2 className="size-3.5" /> I don't have this
            </Button>
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

/** The full editable dataset — sections per category, plus removed-item restore. */
export function FinancialData() {
  const nodes = useFinanceStore((s) => s.nodes)
  const updateNode = useFinanceStore((s) => s.updateNode)
  const restoreNode = useFinanceStore((s) => s.restoreNode)
  const resetData = useFinanceStore((s) => s.resetData)
  const self = nodes.find((n) => n.category === 'self')
  const totals = computeTotals(nodes)

  const removed = DEFAULT_NODES.filter(
    (d) => d.category !== 'self' && !nodes.some((n) => n.id === d.id),
  )

  if (!self || self.category !== 'self') return null

  const sections = [
    { key: 'goal', title: 'Goals', desc: 'What you are building toward.', icon: Target },
    { key: 'investment', title: 'Investments', desc: 'Everything working for you.', icon: PiggyBank },
    { key: 'loan', title: 'Loans', desc: 'What you owe and its cost.', icon: Landmark },
    { key: 'insurance', title: 'Insurance', desc: 'What protects the plan.', icon: ShieldCheck },
    { key: 'emergency', title: 'Emergency fund', desc: 'Your liquidity buffer.', icon: Wallet },
  ] as const

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Your financial data</h2>
          <p className="text-sm text-muted-foreground">
            Powers the blueprint, dashboard and timeline — everything recalculates live.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetData}>
          <RotateCcw className="size-4" /> Restore sample data
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm"
      >
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          These figures are autofilled samples — you're free to alter every one and make them
          yours. Don't have something? Remove it. Nothing is compulsory, and it all stays in this
          browser.
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
          <CardDescription>From your sign-up — shown as the centre of your blueprint.</CardDescription>
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

      {removed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Removed items</CardTitle>
            <CardDescription>Add any of these back with their sample figures.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {removed.map((node) => (
              <button
                key={node.id}
                onClick={() => restoreNode(node.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
              >
                <Plus className="size-3.5" />
                {node.label}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
