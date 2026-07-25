import { create } from 'zustand'
import type { EdgeRelation, NodeCategory } from '@/types/finance'

/**
 * UI state for the interactive blueprint: which node is selected (drives the
 * side panel), which is hovered (drives edge highlighting), which categories
 * are filtered out of the graph, and which legend relations are highlighted.
 */
interface BlueprintState {
  selectedId: string | null
  hoveredId: string | null
  hiddenCategories: NodeCategory[]
  activeRelations: EdgeRelation[]

  select: (id: string | null) => void
  hover: (id: string | null) => void
  toggleCategory: (category: NodeCategory) => void
  toggleRelation: (relation: EdgeRelation) => void
}

export const useBlueprintStore = create<BlueprintState>()((set, get) => ({
  selectedId: null,
  hoveredId: null,
  hiddenCategories: [],
  activeRelations: [],

  select: (id) => set({ selectedId: id }),
  hover: (id) => set({ hoveredId: id }),
  toggleCategory: (category) => {
    const hidden = get().hiddenCategories
    set({
      hiddenCategories: hidden.includes(category)
        ? hidden.filter((c) => c !== category)
        : [...hidden, category],
      // Close the panel if its node just got filtered away.
      selectedId: null,
    })
  },
  toggleRelation: (relation) => {
    const active = get().activeRelations
    set({
      activeRelations: active.includes(relation)
        ? active.filter((r) => r !== relation)
        : [...active, relation],
    })
  },
}))
