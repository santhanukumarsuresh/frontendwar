import { DEFAULT_NODES, EDGES, OTHER_ASSETS } from '@/data/finance'
import type {
  AllocationSlice,
  FinNode,
  GoalNode,
  Milestone,
  SelfNode,
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
