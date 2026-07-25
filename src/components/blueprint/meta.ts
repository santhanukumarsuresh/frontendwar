import type { NodeCategory } from '@/types/finance'

/* Fixed node palette — saturated mids that hold up on light & dark surfaces. */
export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  self: 'var(--primary)',
  goal: '#6366f1',
  investment: '#14b8a6',
  loan: '#f59e0b',
  insurance: '#a78bfa',
  emergency: '#10b981',
}

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  self: 'You',
  goal: 'Goals',
  investment: 'Investments',
  loan: 'Loans',
  insurance: 'Insurance',
  emergency: 'Emergency fund',
}
