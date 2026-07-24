import { useEffect } from 'react'
import { ACCENT_PRESETS, resolveMode, useThemeStore } from '@/store/theme'

/**
 * Applies the theme store to the DOM:
 *   - sets `data-theme` on <html> (light | dark) so CSS token blocks switch
 *   - overrides the --primary and --ring tokens from the chosen accent
 *   - overrides the --radius token
 *
 * Because every Tailwind color/radius utility is mapped to these CSS
 * variables (see globals.css), changing them here restyles the whole app
 * instantly — no re-render or class swapping required.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode)
  const accent = useThemeStore((s) => s.accent)
  const customAccent = useThemeStore((s) => s.customAccent)
  const radius = useThemeStore((s) => s.radius)

  // Apply light/dark + react to OS changes when in `system` mode.
  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      root.dataset.theme = resolveMode(mode)
    }
    apply()

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [mode])

  // Apply accent color to the --primary + --ring tokens.
  useEffect(() => {
    const root = document.documentElement
    const color = customAccent ?? ACCENT_PRESETS[accent]
    root.style.setProperty('--primary', color)
    root.style.setProperty('--ring', color)
  }, [accent, customAccent])

  // Apply corner radius.
  useEffect(() => {
    document.documentElement.style.setProperty('--radius', `${radius}rem`)
  }, [radius])

  return children
}
