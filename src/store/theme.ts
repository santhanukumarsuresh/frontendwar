import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

/** Named accent presets (values are oklch strings applied to the --primary token). */
export const ACCENT_PRESETS = {
  violet: 'oklch(0.55 0.24 285)',
  blue: 'oklch(0.55 0.2 255)',
  emerald: 'oklch(0.6 0.16 160)',
  amber: 'oklch(0.72 0.17 65)',
  rose: 'oklch(0.62 0.24 15)',
  cyan: 'oklch(0.62 0.13 210)',
} as const

export type AccentPreset = keyof typeof ACCENT_PRESETS

export interface ThemeState {
  /** light | dark | system (follows OS preference) */
  mode: ThemeMode
  /** selected accent preset name */
  accent: AccentPreset
  /** optional custom accent that overrides the preset (any valid CSS color) */
  customAccent: string | null
  /** base corner radius in rem */
  radius: number

  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentPreset) => void
  setCustomAccent: (color: string | null) => void
  setRadius: (radius: number) => void
  reset: () => void
}

const DEFAULTS = {
  mode: 'system' as ThemeMode,
  accent: 'violet' as AccentPreset,
  customAccent: null as string | null,
  radius: 0.625,
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent, customAccent: null }),
      setCustomAccent: (customAccent) => set({ customAccent }),
      setRadius: (radius) => set({ radius }),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'fw-theme', // localStorage key — must match the bootstrap script in index.html
      version: 1,
    },
  ),
)

/** Resolve `system` mode to a concrete light/dark value. */
export function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}
