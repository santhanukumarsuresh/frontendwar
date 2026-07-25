import type {
  CashFlowPoint,
  FinEdge,
  FinNode,
  NetWorthPoint,
  SelfNode,
} from '@/types/finance'

/*
 * Realistic starter dataset for one user — Rani S., 32, a product manager in
 * Bengaluru. Amounts are in absolute rupees (₹). This seeds the editable
 * finance store (src/store/finance.ts) which is the live source of truth:
 * the blueprint renders it, the timeline derives from it, and the dashboard
 * aggregates it. Users can edit any node from the blueprint's side panel.
 */

export const DEFAULT_PROFILE: SelfNode = {
  id: 'you',
  label: 'Rani S.',
  category: 'self',
  description: 'The centre of the blueprint — every asset, liability and protection connects here.',
  name: 'Rani S.',
  age: 32,
  occupation: 'Product Manager, Bengaluru',
  monthlyIncome: 185000,
  monthlyExpenses: 96500,
}

export const DEFAULT_NODES: FinNode[] = [
  DEFAULT_PROFILE,

  /* ── Goals ─────────────────────────────────────────────────────────── */
  {
    id: 'goal-retirement',
    label: 'Retirement',
    category: 'goal',
    description: 'Financial independence at 60 with a corpus that sustains today’s lifestyle.',
    targetAmount: 65000000,
    currentAmount: 2960000,
    targetYear: 2054,
    horizon: 'long',
    monthlyAllocation: 42500,
    planProgress: 111,
    priority: 'high',
  },
  {
    id: 'goal-education',
    label: 'Child education',
    category: 'goal',
    description: 'Undergraduate + postgraduate corpus for Aarav, currently 3 years old.',
    targetAmount: 12000000,
    currentAmount: 890000,
    targetYear: 2040,
    horizon: 'long',
    monthlyAllocation: 18000,
    planProgress: 104,
    priority: 'high',
  },
  {
    id: 'goal-home',
    label: 'Home upgrade',
    category: 'goal',
    description: 'Down payment for a 3BHK upgrade — target ₹40L against a ₹1.4Cr purchase.',
    targetAmount: 4000000,
    currentAmount: 740000,
    targetYear: 2031,
    horizon: 'mid',
    monthlyAllocation: 22000,
    planProgress: 58,
    priority: 'medium',
  },
  {
    id: 'goal-car',
    label: 'Car upgrade',
    category: 'goal',
    description: 'Replace the hatchback with an EV crossover after trade-in.',
    targetAmount: 900000,
    currentAmount: 520000,
    targetYear: 2027,
    horizon: 'short',
    monthlyAllocation: 15000,
    planProgress: 82,
    priority: 'low',
  },
  {
    id: 'goal-europe',
    label: 'Europe trip',
    category: 'goal',
    description: 'Three weeks across Italy, Switzerland and France for the family.',
    targetAmount: 450000,
    currentAmount: 160000,
    targetYear: 2028,
    horizon: 'short',
    monthlyAllocation: 8000,
    planProgress: 64,
    priority: 'low',
  },

  /* ── Investments ───────────────────────────────────────────────────── */
  {
    id: 'inv-equity-mf',
    label: 'Equity mutual funds',
    category: 'investment',
    description: 'Flexi-cap + index SIPs — the growth engine for long-horizon goals.',
    instrument: 'Flexi-cap & Nifty 50 index funds',
    currentValue: 1860000,
    investedAmount: 1320000,
    monthlyContribution: 25000,
    returnPct: 14.2,
  },
  {
    id: 'inv-stocks',
    label: 'Direct stocks',
    category: 'investment',
    description: 'Concentrated large-cap portfolio earmarked for the home down payment.',
    instrument: 'NSE large-cap equity',
    currentValue: 740000,
    investedAmount: 610000,
    monthlyContribution: 10000,
    returnPct: 11.8,
  },
  {
    id: 'inv-ppf',
    label: 'PPF',
    category: 'investment',
    description: 'Tax-free debt anchor for retirement — maxed out every April.',
    instrument: 'Public Provident Fund',
    currentValue: 680000,
    investedAmount: 560000,
    monthlyContribution: 12500,
    returnPct: 7.1,
  },
  {
    id: 'inv-nps',
    label: 'NPS',
    category: 'investment',
    description: 'Tier-1 account, 75% equity auto-choice — locked until 60.',
    instrument: 'National Pension System',
    currentValue: 420000,
    investedAmount: 360000,
    monthlyContribution: 5000,
    returnPct: 10.4,
  },
  {
    id: 'inv-fd',
    label: 'Fixed deposits',
    category: 'investment',
    description: 'Laddered FDs maturing 2026–27, matched to the near-term goals.',
    instrument: 'Bank fixed deposits',
    currentValue: 350000,
    investedAmount: 325000,
    monthlyContribution: 0,
    returnPct: 6.9,
  },
  {
    id: 'inv-gold',
    label: 'Gold ETF',
    category: 'investment',
    description: 'Inflation hedge accumulated quarterly, tagged to Aarav’s education.',
    instrument: 'Sovereign gold ETF units',
    currentValue: 230000,
    investedAmount: 190000,
    monthlyContribution: 3000,
    returnPct: 9.8,
  },

  /* ── Loans ─────────────────────────────────────────────────────────── */
  {
    id: 'loan-home',
    label: 'Home loan',
    category: 'loan',
    description: '2BHK flat purchased in 2023 — prepaying ₹1L every bonus cycle.',
    outstanding: 3260000,
    principal: 4500000,
    emi: 38900,
    interestRate: 8.6,
    endYear: 2041,
  },
  {
    id: 'loan-car',
    label: 'Car loan',
    category: 'loan',
    description: 'Hatchback loan in its final stretch — closes mid-2027.',
    outstanding: 290000,
    principal: 750000,
    emi: 15600,
    interestRate: 9.2,
    endYear: 2027,
  },

  /* ── Insurance ─────────────────────────────────────────────────────── */
  {
    id: 'ins-term',
    label: 'Term life',
    category: 'insurance',
    description: 'Pure protection till 65 — sized at ~17× annual income.',
    kind: 'life',
    cover: 15000000,
    annualPremium: 18500,
    renewalMonth: 'March',
    insurer: 'HDFC Life Click 2 Protect',
  },
  {
    id: 'ins-health',
    label: 'Health cover',
    category: 'insurance',
    description: 'Family floater for 3 with a super top-up — beyond the employer plan.',
    kind: 'health',
    cover: 2500000,
    annualPremium: 24200,
    renewalMonth: 'August',
    insurer: 'Niva Bupa ReAssure 2.0',
  },
  {
    id: 'ins-motor',
    label: 'Motor cover',
    category: 'insurance',
    description: 'Comprehensive + zero-dep on the hatchback.',
    kind: 'motor',
    cover: 550000,
    annualPremium: 11800,
    renewalMonth: 'November',
    insurer: 'ICICI Lombard',
  },

  /* ── Emergency fund ────────────────────────────────────────────────── */
  {
    id: 'emergency-fund',
    label: 'Emergency fund',
    category: 'emergency',
    description: 'Liquid fund + sweep-in FD. Target: 6 months of expenses.',
    currentAmount: 460000,
    targetAmount: 600000,
    monthsCovered: 4.8,
  },
]

/*
 * Relationships. `funds` = money flows toward a goal, `protects` = insurance
 * shields an entity, `owes` = debt against the user, `plans` = the user's own
 * goals, `shields` = the emergency buffer.
 */
export const EDGES: FinEdge[] = [
  { source: 'you', target: 'goal-retirement', relation: 'plans' },
  { source: 'you', target: 'goal-education', relation: 'plans' },
  { source: 'you', target: 'goal-home', relation: 'plans' },
  { source: 'you', target: 'goal-car', relation: 'plans' },
  { source: 'you', target: 'goal-europe', relation: 'plans' },

  { source: 'inv-equity-mf', target: 'goal-retirement', relation: 'funds' },
  { source: 'inv-equity-mf', target: 'goal-education', relation: 'funds' },
  { source: 'inv-ppf', target: 'goal-retirement', relation: 'funds' },
  { source: 'inv-nps', target: 'goal-retirement', relation: 'funds' },
  { source: 'inv-stocks', target: 'goal-home', relation: 'funds' },
  { source: 'inv-fd', target: 'goal-car', relation: 'funds' },
  { source: 'inv-fd', target: 'goal-europe', relation: 'funds' },
  { source: 'inv-gold', target: 'goal-education', relation: 'funds' },

  { source: 'loan-home', target: 'you', relation: 'owes' },
  { source: 'loan-car', target: 'you', relation: 'owes' },

  { source: 'ins-term', target: 'you', relation: 'protects' },
  { source: 'ins-term', target: 'goal-education', relation: 'protects' },
  { source: 'ins-term', target: 'goal-retirement', relation: 'protects' },
  { source: 'ins-health', target: 'you', relation: 'protects' },
  { source: 'ins-health', target: 'emergency-fund', relation: 'protects' },
  { source: 'ins-motor', target: 'loan-car', relation: 'protects' },

  { source: 'emergency-fund', target: 'you', relation: 'shields' },
]

/* ── Assets outside the node graph ───────────────────────────────────── */

/** Held assets that aren't blueprint nodes: bank balance and the 2BHK flat. */
export const OTHER_ASSETS = {
  cash: 180000,
  realEstate: 8200000,
} as const

/* ── Time series ─────────────────────────────────────────────────────── */

export const NET_WORTH_HISTORY: NetWorthPoint[] = [
  { month: 'Aug 24', assets: 11020000, liabilities: 3890000, netWorth: 7130000 },
  { month: 'Sep 24', assets: 11135000, liabilities: 3862000, netWorth: 7273000 },
  { month: 'Oct 24', assets: 11080000, liabilities: 3834000, netWorth: 7246000 },
  { month: 'Nov 24', assets: 11240000, liabilities: 3806000, netWorth: 7434000 },
  { month: 'Dec 24', assets: 11390000, liabilities: 3778000, netWorth: 7612000 },
  { month: 'Jan 25', assets: 11310000, liabilities: 3750000, netWorth: 7560000 },
  { month: 'Feb 25', assets: 11150000, liabilities: 3722000, netWorth: 7428000 },
  { month: 'Mar 25', assets: 11480000, liabilities: 3648000, netWorth: 7832000 },
  { month: 'Apr 25', assets: 11620000, liabilities: 3620000, netWorth: 8000000 },
  { month: 'May 25', assets: 11760000, liabilities: 3592000, netWorth: 8168000 },
  { month: 'Jun 25', assets: 11895000, liabilities: 3564000, netWorth: 8331000 },
  { month: 'Jul 25', assets: 11840000, liabilities: 3536000, netWorth: 8304000 },
  { month: 'Aug 25', assets: 12010000, liabilities: 3508000, netWorth: 8502000 },
  { month: 'Sep 25', assets: 12180000, liabilities: 3480000, netWorth: 8700000 },
  { month: 'Oct 25', assets: 12325000, liabilities: 3452000, netWorth: 8873000 },
  { month: 'Nov 25', assets: 12270000, liabilities: 3424000, netWorth: 8846000 },
  { month: 'Dec 25', assets: 12455000, liabilities: 3396000, netWorth: 9059000 },
  { month: 'Jan 26', assets: 12610000, liabilities: 3368000, netWorth: 9242000 },
  { month: 'Feb 26', assets: 12530000, liabilities: 3340000, netWorth: 9190000 },
  { month: 'Mar 26', assets: 12780000, liabilities: 3264000, netWorth: 9516000 },
  { month: 'Apr 26', assets: 12905000, liabilities: 3236000, netWorth: 9669000 },
  { month: 'May 26', assets: 12990000, liabilities: 3208000, netWorth: 9782000 },
  { month: 'Jun 26', assets: 13065000, liabilities: 3180000, netWorth: 9885000 },
  { month: 'Jul 26', assets: 13120000, liabilities: 3550000, netWorth: 9570000 },
]

export const CASH_FLOW: CashFlowPoint[] = [
  { month: 'Dec 25', income: 185000, expenses: 108500, invested: 45500 },
  { month: 'Jan 26', income: 185000, expenses: 94200, invested: 55500 },
  { month: 'Feb 26', income: 185000, expenses: 91800, invested: 55500 },
  { month: 'Mar 26', income: 213000, expenses: 99400, invested: 85500 },
  { month: 'Apr 26', income: 196000, expenses: 95600, invested: 68000 },
  { month: 'May 26', income: 196000, expenses: 102300, invested: 55500 },
  { month: 'Jun 26', income: 196000, expenses: 93100, invested: 55500 },
  { month: 'Jul 26', income: 196000, expenses: 96500, invested: 55500 },
]

/* Account activity is derived live from these nodes — see deriveTransactions
   in src/lib/derive.ts. */
