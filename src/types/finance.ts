/**
 * Domain model for the Wealth DNA financial blueprint.
 *
 * Every entity in the user's financial life (goals, investments, loans,
 * insurance, the emergency fund and the user themselves) is a node in a
 * graph; the relationships between them (funding, protection, debt) are
 * typed edges. The blueprint, timeline and dashboard all read this model.
 */

export type NodeCategory = 'self' | 'goal' | 'investment' | 'loan' | 'insurance' | 'emergency'

export type GoalHorizon = 'short' | 'mid' | 'long'

interface BaseNode {
  id: string
  label: string
  category: NodeCategory
  description: string
}

export interface SelfNode extends BaseNode {
  category: 'self'
  name: string
  age: number
  occupation: string
  monthlyIncome: number
  monthlyExpenses: number
}

export interface GoalNode extends BaseNode {
  category: 'goal'
  targetAmount: number
  currentAmount: number
  targetYear: number
  horizon: GoalHorizon
  monthlyAllocation: number
  /** Progress against where the plan says you should be TODAY (can exceed 100). */
  planProgress: number
  priority: 'high' | 'medium' | 'low'
}

export interface InvestmentNode extends BaseNode {
  category: 'investment'
  instrument: string
  currentValue: number
  investedAmount: number
  monthlyContribution: number
  /** Annualised return (XIRR) in percent. */
  returnPct: number
}

export interface LoanNode extends BaseNode {
  category: 'loan'
  outstanding: number
  principal: number
  emi: number
  interestRate: number
  endYear: number
}

export interface InsuranceNode extends BaseNode {
  category: 'insurance'
  kind: 'life' | 'health' | 'motor'
  cover: number
  annualPremium: number
  renewalMonth: string
  insurer: string
}

export interface EmergencyNode extends BaseNode {
  category: 'emergency'
  currentAmount: number
  targetAmount: number
  monthsCovered: number
}

export type FinNode =
  | SelfNode
  | GoalNode
  | InvestmentNode
  | LoanNode
  | InsuranceNode
  | EmergencyNode

/**
 * `owns` is never stored in the edge list — it is the fallback relation used
 * when an item's linked goal/loan has been removed, so nothing in the graph
 * floats disconnected from the user.
 */
export type EdgeRelation = 'funds' | 'protects' | 'owes' | 'plans' | 'shields' | 'owns'

export interface FinEdge {
  source: string
  target: string
  relation: EdgeRelation
}

export interface Milestone {
  id: string
  nodeId: string
  title: string
  targetYear: number
  targetAmount: number
  currentAmount: number
  horizon: GoalHorizon
  /** Progress vs. plan today, in percent (may exceed 100). */
  planProgress: number
  status: 'achieved' | 'on-track' | 'needs-attention'
}

export interface NetWorthPoint {
  month: string
  assets: number
  liabilities: number
  netWorth: number
}

export interface CashFlowPoint {
  month: string
  income: number
  expenses: number
  invested: number
}

export interface AllocationSlice {
  name: string
  value: number
}

export interface Transaction {
  id: string
  date: string
  label: string
  category: string
  amount: number
  direction: 'credit' | 'debit'
}
