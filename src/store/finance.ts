import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_NODES } from '@/data/finance'
import { GOAL_PLAN_BASELINES, getSelf } from '@/lib/derive'
import type { FinNode } from '@/types/finance'

/**
 * The live financial dataset. Seeded with the demo persona and fully editable
 * from the blueprint's side panel; every change persists to LocalStorage so
 * the app holds YOUR numbers across visits. Derived figures (goal plan
 * progress, emergency-fund months) are recomputed on every edit.
 */
interface FinanceState {
  nodes: FinNode[]
  updateNode: (id: string, patch: Partial<FinNode>) => void
  resetData: () => void
}

/** Re-derive dependent fields after an edit. */
function recompute(nodes: FinNode[]): FinNode[] {
  const self = getSelf(nodes)
  return nodes.map((n) => {
    if (n.category === 'goal') {
      const baseline = GOAL_PLAN_BASELINES.get(n.id)
      if (baseline) {
        return { ...n, planProgress: Math.round((n.currentAmount / baseline) * 100) }
      }
    }
    if (n.category === 'emergency') {
      return {
        ...n,
        monthsCovered: Math.round((n.currentAmount / Math.max(1, self.monthlyExpenses)) * 10) / 10,
      }
    }
    return n
  })
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      nodes: DEFAULT_NODES,
      updateNode: (id, patch) =>
        set((state) => ({
          nodes: recompute(
            state.nodes.map((n) => (n.id === id ? ({ ...n, ...patch } as FinNode) : n)),
          ),
        })),
      resetData: () => set({ nodes: DEFAULT_NODES }),
    }),
    {
      name: 'wealthdna-data',
      version: 1,
      // Only accept a persisted node list that still matches the app's schema
      // (same ids) — otherwise fall back to the demo dataset.
      merge: (persisted, current) => {
        const p = persisted as Partial<FinanceState> | undefined
        const valid =
          Array.isArray(p?.nodes) &&
          p.nodes.length === DEFAULT_NODES.length &&
          DEFAULT_NODES.every((d) => p.nodes!.some((n) => n?.id === d.id))
        return valid ? { ...current, nodes: recompute(p.nodes as FinNode[]) } : current
      },
    },
  ),
)
