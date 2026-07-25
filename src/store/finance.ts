import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_NODES } from '@/data/finance'
import { GOAL_PLAN_BASELINES, getSelf } from '@/lib/derive'
import { formatDisplayName } from '@/lib/format'
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
  /** Drop an item the user doesn't have (e.g. no car loan). "you" is fixed. */
  removeNode: (id: string) => void
  /** Bring back a previously removed item, with its sample figures. */
  restoreNode: (id: string) => void
  resetData: () => void
}

/** Re-derive dependent fields after an edit. */
function recompute(nodes: FinNode[]): FinNode[] {
  const self = getSelf(nodes)
  return nodes.map((n) => {
    if (n.category === 'self') {
      // The graph label follows the display convention: "Rani S.", "Arjun M."
      return { ...n, label: formatDisplayName(n.name) }
    }
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
      removeNode: (id) =>
        set((state) => {
          if (id === 'you') return state
          return { nodes: recompute(state.nodes.filter((n) => n.id !== id)) }
        }),
      restoreNode: (id) =>
        set((state) => {
          if (state.nodes.some((n) => n.id === id)) return state
          const byId = new Map(state.nodes.map((n) => [n.id, n]))
          // Rebuild in canonical order so the restored item lands in place.
          const nodes = DEFAULT_NODES.flatMap((d) => {
            if (d.id === id) return [d]
            const existing = byId.get(d.id)
            return existing ? [existing] : []
          })
          return { nodes: recompute(nodes) }
        }),
      resetData: () => set({ nodes: DEFAULT_NODES }),
    }),
    {
      name: 'wealthdna-data',
      version: 1,
      // Accept any persisted subset of known nodes (users may remove items
      // they don't have); require only the "you" node. Anything else falls
      // back to the sample dataset.
      merge: (persisted, current) => {
        const p = persisted as Partial<FinanceState> | undefined
        if (!Array.isArray(p?.nodes)) return current
        const knownIds = new Set(DEFAULT_NODES.map((d) => d.id))
        const nodes = p.nodes.filter((n): n is FinNode => Boolean(n?.id) && knownIds.has(n.id))
        const hasSelf = nodes.some((n) => n.category === 'self')
        return hasSelf ? { ...current, nodes: recompute(nodes) } : current
      },
    },
  ),
)
