import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

/** Selectable accent swatches (applied to the --primary / --ring tokens). */
export const ACCENT_SWATCHES = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Ocean', value: '#0369a1' },
] as const

/** The OS-level color preference, used as the default before the user chooses. */
export function getSystemMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export interface ThemeState {
  /** light | dark — defaults to the system preference on first visit */
  mode: ThemeMode
  /** custom accent color, or null to use the theme's built-in primary */
  accent: string | null
  /** base corner radius in rem */
  radius: number

  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  setAccent: (accent: string | null) => void
  setRadius: (radius: number) => void
  reset: () => void
}

const DEFAULT_RADIUS = 0.5

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: getSystemMode(),
      accent: null,
      radius: DEFAULT_RADIUS,
      setMode: (mode) => set({ mode }),
      toggleMode: () => set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
      setAccent: (accent) => set({ accent }),
      setRadius: (radius) => set({ radius }),
      reset: () => set({ mode: getSystemMode(), accent: null, radius: DEFAULT_RADIUS }),
    }),
    {
      name: 'wealthdna-theme', // localStorage key — must match the bootstrap script in index.html
      version: 3,
      // Coerce any older persisted shape into the current one (older builds had
      // a 'system' mode and accent presets). Prevents the "couldn't be migrated"
      // console error and preserves the user's mode/radius across upgrades.
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<ThemeState>
        const accent =
          typeof p.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(p.accent) ? p.accent : null
        return {
          mode: p.mode === 'light' || p.mode === 'dark' ? p.mode : getSystemMode(),
          accent,
          radius: typeof p.radius === 'number' ? p.radius : DEFAULT_RADIUS,
        } as ThemeState
      },
    },
  ),
)
