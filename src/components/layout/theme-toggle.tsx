import { Monitor, Moon, Sun } from 'lucide-react'
import { type ThemeMode, useThemeStore } from '@/store/theme'
import { cn } from '@/lib/utils'

const OPTIONS: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
]

/** Compact segmented light/dark/system switch used in the header. */
export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  return (
    <div
      role="radiogroup"
      aria-label="Color mode"
      className="inline-flex items-center gap-0.5 rounded-full border bg-card p-0.5"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={mode === value}
          aria-label={label}
          title={label}
          onClick={() => setMode(value)}
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-full transition-colors',
            mode === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}
