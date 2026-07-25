import { create } from 'zustand'
import type { NodeCategory } from '@/types/finance'

/**
 * UI state for the interactive blueprint: which node is selected (drives the
 * side panel), which is hovered (drives edge highlighting), and which
 * categories are filtered out of the graph.
 */
interface BlueprintState {
  selectedId: string | null
  hoveredId: string | null
  hiddenCategories: NodeCategory[]

  select: (id: string | null) => void
  hover: (id: string | null) => void
  toggleCategory: (category: NodeCategory) => void
}

export const useBlueprintStore = create<BlueprintState>()((set, get) => ({
  selectedId: null,
  hoveredId: null,
  hiddenCategories: [],

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
}))
