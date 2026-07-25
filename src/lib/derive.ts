import { DEFAULT_NODES, EDGES, OTHER_ASSETS } from '@/data/finance'
import type {
  AllocationSlice,
  CashFlowPoint,
  FinNode,
  GoalNode,
  InvestmentNode,
  Milestone,
  NetWorthPoint,
  SelfNode,
  Transaction,
} from '@/types/finance'

/**
 * Pure derivations over the live (user-editable) node list. Every page reads
 * these instead of static aggregates, so edits made in the blueprint's side
 * panel ripple through the dashboard, timeline and landing page instantly.
 */

export function getNode(nodes: FinNode[], id: string): FinNode | undefined {
  return nodes.find((n) => n.id === id)
}

/** Every edge touching a node, with the node on the other end resolved. */
export function connectionsOf(nodes: FinNode[], id: string) {
  const connections = EDGES.flatMap((edge) => {
    if (edge.source !== id && edge.target !== id) return []
    const other = getNode(nodes, edge.source === id ? edge.target : edge.source)
    return other ? [{ edge, other }] : []
  })
  // If every counterpart was removed (say, stocks that funded a deleted
  // goal), fall back to the ownership link so the panel matches the graph.
  if (connections.length === 0 && id !== 'you') {
    const self = getSelf(nodes)
    connections.push({ edge: { source: id, target: 'you', relation: 'owns' }, other: self })
  }
  return connections
}

export function getGoals(nodes: FinNode[]): GoalNode[] {
  return nodes.filter((n): n is GoalNode => n.category === 'goal')
}

export function getSelf(nodes: FinNode[]): SelfNode {
  return nodes.find((n): n is SelfNode => n.category === 'self') ?? (DEFAULT_NODES[0] as SelfNode)
}

export interface Totals {
  investments: number
  emergency: number
  assets: number
  liabilities: number
  netWorth: number
  insuranceCover: number
  monthlySip: number
  monthlyEmi: number
  savingsRate: number
}

export function computeTotals(nodes: FinNode[]): Totals {
  let investments = 0
  let liabilities = 0
  let cover = 0
  let sip = 0
  let emi = 0
  let emergency = 0
  for (const n of nodes) {
    if (n.category === 'investment') {
      investments += n.currentValue
      sip += n.monthlyContribution
    } else if (n.category === 'loan') {
      liabilities += n.outstanding
      emi += n.emi
    } else if (n.category === 'insurance') {
      cover += n.cover
    } else if (n.category === 'emergency') {
      emergency = n.currentAmount
    }
  }
  const self = getSelf(nodes)
  const assets = investments + emergency + OTHER_ASSETS.cash + OTHER_ASSETS.realEstate
  return {
    investments,
    emergency,
    assets,
    liabilities,
    netWorth: assets - liabilities,
    insuranceCover: cover,
    monthlySip: sip,
    monthlyEmi: emi,
    savingsRate: Math.round(
      ((self.monthlyIncome - self.monthlyExpenses) / Math.max(1, self.monthlyIncome)) * 100,
    ),
  }
}

const ALLOCATION_LABELS: Record<string, string> = {
  'inv-equity-mf': 'Equity MF',
  'inv-stocks': 'Stocks',
  'inv-ppf': 'PPF',
  'inv-nps': 'NPS',
  'inv-fd': 'FD',
  'inv-gold': 'Gold',
}

export function deriveAllocation(nodes: FinNode[]): AllocationSlice[] {
  const slices: AllocationSlice[] = []
  let liquid = OTHER_ASSETS.cash
  for (const n of nodes) {
    if (n.category === 'investment') {
      slices.push({ name: ALLOCATION_LABELS[n.id] ?? n.label, value: n.currentValue })
    } else if (n.category === 'emergency') {
      liquid += n.currentAmount
    }
  }
  slices.push({ name: 'Cash & liquid', value: liquid })
  return slices
}

/*
 * "Where should this goal be TODAY" baselines, derived once from the demo
 * dataset (defaultCurrent / defaultPlanProgress). When the user edits a
 * goal's saved amount, its planProgress is recomputed against this baseline.
 */
export const GOAL_PLAN_BASELINES = new Map(
  getGoals(DEFAULT_NODES).map((g) => [g.id, g.currentAmount / (g.planProgress / 100)]),
)

const MILESTONE_TITLES: Record<string, string> = {
  'goal-car': 'EV crossover upgrade',
  'goal-europe': 'Europe with the family',
  'goal-home': '3BHK down payment ready',
  'goal-education': 'Child education corpus',
  'goal-retirement': 'Financial independence',
}

function milestoneStatus(fundedPct: number, planProgress: number): Milestone['status'] {
  if (fundedPct >= 100) return 'achieved'
  return planProgress >= 75 ? 'on-track' : 'needs-attention'
}

/** The timeline, derived live from the node graph. */
export function deriveMilestones(nodes: FinNode[]): Milestone[] {
  const milestones: Milestone[] = []

  for (const n of nodes) {
    if (n.category === 'emergency') {
      const funded = (n.currentAmount / Math.max(1, n.targetAmount)) * 100
      milestones.push({
        id: 'ms-emergency',
        nodeId: n.id,
        title: '6-month emergency fund',
        targetYear: 2026,
        targetAmount: n.targetAmount,
        currentAmount: n.currentAmount,
        horizon: 'short',
        planProgress: Math.round(funded),
        status: milestoneStatus(funded, funded),
      })
    } else if (n.category === 'loan' && n.id === 'loan-car') {
      const paid = ((n.principal - n.outstanding) / Math.max(1, n.principal)) * 100
      milestones.push({
        id: 'ms-car-loan',
        nodeId: n.id,
        title: 'Car loan closed',
        targetYear: n.endYear,
        targetAmount: n.principal,
        currentAmount: n.principal - n.outstanding,
        horizon: 'short',
        planProgress: Math.round(paid),
        status: milestoneStatus(paid, paid),
      })
    } else if (n.category === 'goal') {
      const funded = (n.currentAmount / Math.max(1, n.targetAmount)) * 100
      milestones.push({
        id: `ms-${n.id}`,
        nodeId: n.id,
        title: MILESTONE_TITLES[n.id] ?? n.label,
        targetYear: n.targetYear,
        targetAmount: n.targetAmount,
        currentAmount: n.currentAmount,
        horizon: n.horizon,
        planProgress: n.planProgress,
        status: milestoneStatus(funded, n.planProgress),
      })
    }
  }

  return milestones.sort((a, b) => a.targetYear - b.targetYear)
}

/* ── Series & activity, synced to the live data ──────────────────────── */

/** Value-weighted blended return across all holdings. */
export function blendedXirr(nodes: FinNode[]): number {
  let weighted = 0
  let total = 0
  for (const n of nodes) {
    if (n.category === 'investment') {
      weighted += n.currentValue * n.returnPct
      total += n.currentValue
    }
  }
  return total > 0 ? weighted / total : 0
}

/** Growth assumption used across the app (also in the goal insights). */
const ANNUAL_GROWTH = 0.11

/** Short month label like "Jul 26", n months before today. */
function monthLabel(monthsAgo: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.toLocaleString('en', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`
}

/**
 * Walks today's actual balance sheet backwards, month by month, to build the
 * 24-month trend. Each step undoes one month of savings and asset growth and
 * adds back the loan principal that the EMIs actually cleared. A small
 * deterministic market wobble keeps the curve honest about volatility.
 * No stored history exists anywhere — this is entirely a function of the
 * numbers the user entered.
 */
export function deriveNetWorthHistory(nodes: FinNode[], totals: Totals): NetWorthPoint[] {
  const rMarket = ANNUAL_GROWTH / 12
  const rProperty = 0.05 / 12 // property appreciates slower than the markets

  // Principal component of the current EMIs (EMI minus this month's interest).
  let principalPerMonth = 0
  for (const n of nodes) {
    if (n.category === 'loan') {
      principalPerMonth += Math.max(0, n.emi - (n.outstanding * n.interestRate) / 100 / 12)
    }
  }

  let marketAssets = Math.max(0, totals.assets - OTHER_ASSETS.realEstate)
  let property = OTHER_ASSETS.realEstate
  let liabilities = totals.liabilities
  const points: NetWorthPoint[] = [
    {
      month: monthLabel(0),
      assets: Math.round(marketAssets + property),
      liabilities: Math.round(liabilities),
      netWorth: Math.round(marketAssets + property - liabilities),
    },
  ]

  for (let i = 1; i < 24; i++) {
    const wobble = 0.012 * Math.sin(i * 1.7) + 0.008 * Math.sin(i * 0.6)
    marketAssets = Math.max(0, (marketAssets - totals.monthlySip) / (1 + rMarket + wobble))
    property = property / (1 + rProperty)
    liabilities = liabilities > 0 ? liabilities + principalPerMonth : 0
    const assets = marketAssets + property
    points.unshift({
      month: monthLabel(i),
      assets: Math.round(assets),
      liabilities: Math.round(liabilities),
      netWorth: Math.round(assets - liabilities),
    })
  }
  return points
}

/**
 * Last eight months of cash flow from the actual income, expenses and SIP
 * totals. Income and investments are steady; expenses carry a small
 * deterministic seasonal swing around the entered monthly figure.
 */
export function deriveCashFlow(nodes: FinNode[], totals: Totals): CashFlowPoint[] {
  const self = getSelf(nodes)
  const points: CashFlowPoint[] = []
  for (let i = 7; i >= 0; i--) {
    const seasonality = 1 + 0.06 * Math.sin(i * 1.3)
    points.push({
      month: monthLabel(i),
      income: self.monthlyIncome,
      expenses: Math.round(self.monthlyExpenses * seasonality),
      invested: totals.monthlySip,
    })
  }
  return points
}

/** Assumed annual dividend yield on directly held stocks, paid quarterly. */
const STOCK_DIVIDEND_YIELD = 0.015

/** This month's account activity, built from the actual salary, SIPs and EMIs. */
export function deriveTransactions(nodes: FinNode[]): Transaction[] {
  const self = getSelf(nodes)
  const inv = (id: string) => nodes.find((n): n is InvestmentNode => n.id === id)
  const month = new Date().toLocaleString('en', { month: 'short' })
  const day = (d: string) => `${d} ${month}`

  const txs: Transaction[] = [
    {
      id: 't-salary',
      date: day('25'),
      label: 'Salary credited',
      category: 'Income',
      amount: self.monthlyIncome,
      direction: 'credit',
    },
    {
      id: 't-sip',
      date: day('10'),
      label: 'SIP — Flexi-cap fund',
      category: 'Investment',
      amount: inv('inv-equity-mf')?.monthlyContribution ?? 0,
      direction: 'debit',
    },
  ]
  for (const n of nodes) {
    if (n.category === 'loan') {
      txs.push({
        id: `t-${n.id}`,
        date: day('08'),
        label: `${n.label} EMI`,
        category: 'Loan',
        amount: n.emi,
        direction: 'debit',
      })
    }
  }
  const stocks = inv('inv-stocks')
  txs.push(
    {
      id: 't-nps',
      date: day('05'),
      label: 'NPS Tier-1 contribution',
      category: 'Investment',
      amount: inv('inv-nps')?.monthlyContribution ?? 0,
      direction: 'debit',
    },
    {
      id: 't-gold',
      date: day('02'),
      label: 'Gold ETF purchase',
      category: 'Investment',
      amount: inv('inv-gold')?.monthlyContribution ?? 0,
      direction: 'debit',
    },
    {
      id: 't-dividend',
      date: day('01'),
      label: 'Dividend — direct stocks',
      category: 'Income',
      // Quarterly payout at the assumed yield on the holding's actual value.
      amount: stocks ? Math.round((stocks.currentValue * STOCK_DIVIDEND_YIELD) / 4) : 0,
      direction: 'credit',
    },
  )
  return txs.filter((t) => t.amount > 0)
}
