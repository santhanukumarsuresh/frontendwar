import {
  CASH_FLOW,
  DEFAULT_NODES,
  EDGES,
  NET_WORTH_HISTORY,
  OTHER_ASSETS,
} from '@/data/finance'
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
  return EDGES.flatMap((edge) => {
    if (edge.source !== id && edge.target !== id) return []
    const other = getNode(nodes, edge.source === id ? edge.target : edge.source)
    return other ? [{ edge, other }] : []
  })
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

/**
 * The 24-month demo history, rescaled so its final point equals TODAY's
 * actual assets/liabilities. When the user edits their numbers, the trend
 * chart lands exactly on the values shown everywhere else.
 */
export function deriveNetWorthHistory(totals: Totals): NetWorthPoint[] {
  const last = NET_WORTH_HISTORY[NET_WORTH_HISTORY.length - 1]
  const assetFactor = totals.assets / last.assets
  const liabilityFactor = last.liabilities > 0 ? totals.liabilities / last.liabilities : 0
  return NET_WORTH_HISTORY.map((p) => {
    const assets = Math.round(p.assets * assetFactor)
    const liabilities = Math.round(p.liabilities * liabilityFactor)
    return { month: p.month, assets, liabilities, netWorth: assets - liabilities }
  })
}

/** Demo cash-flow shape, rescaled to the user's income / expenses / SIPs. */
export function deriveCashFlow(nodes: FinNode[], totals: Totals): CashFlowPoint[] {
  const self = getSelf(nodes)
  const base = CASH_FLOW[CASH_FLOW.length - 1]
  const incomeFactor = self.monthlyIncome / base.income
  const expenseFactor = self.monthlyExpenses / base.expenses
  const investedFactor = base.invested > 0 ? totals.monthlySip / base.invested : 0
  return CASH_FLOW.map((p) => ({
    month: p.month,
    income: Math.round(p.income * incomeFactor),
    expenses: Math.round(p.expenses * expenseFactor),
    invested: Math.round(p.invested * investedFactor),
  }))
}

/** July's account activity, built from the actual salary, SIPs and EMIs. */
export function deriveTransactions(nodes: FinNode[]): Transaction[] {
  const self = getSelf(nodes)
  const inv = (id: string) => nodes.find((n): n is InvestmentNode => n.id === id)
  const txs: Transaction[] = [
    {
      id: 't-salary',
      date: '25 Jul',
      label: 'Salary — Meridian Labs',
      category: 'Income',
      amount: self.monthlyIncome,
      direction: 'credit',
    },
    {
      id: 't-sip',
      date: '10 Jul',
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
        date: '08 Jul',
        label: `${n.label} EMI`,
        category: 'Loan',
        amount: n.emi,
        direction: 'debit',
      })
    }
  }
  txs.push(
    {
      id: 't-nps',
      date: '05 Jul',
      label: 'NPS Tier-1 contribution',
      category: 'Investment',
      amount: inv('inv-nps')?.monthlyContribution ?? 0,
      direction: 'debit',
    },
    {
      id: 't-gold',
      date: '02 Jul',
      label: 'Gold ETF purchase',
      category: 'Investment',
      amount: inv('inv-gold')?.monthlyContribution ?? 0,
      direction: 'debit',
    },
    {
      id: 't-dividend',
      date: '01 Jul',
      label: 'Dividend — large-caps',
      category: 'Income',
      amount: 4150,
      direction: 'credit',
    },
  )
  return txs.filter((t) => t.amount > 0)
}
