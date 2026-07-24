import { useEffect } from 'react'
import { useThemeStore } from '@/store/theme'

/**
 * Applies the theme store to the DOM:
 *   - sets `data-theme` (light | dark) on <html> so the CSS token blocks switch
 *   - overrides --primary / --ring when a custom accent is chosen (else the
 *     theme's built-in primary is used)
 *   - overrides the --radius token
 *
 * Because every Tailwind color/radius utility maps to these CSS variables
 * (see globals.css), changing them here restyles the whole app instantly.
 * The animated switch itself is handled in src/lib/theme-transition.ts.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode)
  const accent = useThemeStore((s) => s.accent)
  const radius = useThemeStore((s) => s.radius)

  useEffect(() => {
    document.documentElement.dataset.theme = mode
  }, [mode])

  useEffect(() => {
    const root = document.documentElement
    if (accent) {
      root.style.setProperty('--primary', accent)
      root.style.setProperty('--ring', accent)
    } else {
      // Fall back to the per-theme primary declared in globals.css.
      root.style.removeProperty('--primary')
      root.style.removeProperty('--ring')
    }
  }, [accent])

  useEffect(() => {
    document.documentElement.style.setProperty('--radius', `${radius}rem`)
  }, [radius])

  return children
}
