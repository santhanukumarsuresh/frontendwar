import { createFileRoute } from '@tanstack/react-router'
import { Check, Moon, RotateCcw, Sun } from 'lucide-react'
import { ACCENT_SWATCHES, type ThemeMode, useThemeStore } from '@/store/theme'
import { runThemeTransition } from '@/lib/theme-transition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/settings')({
  head: () => ({
    meta: [
      { title: 'Settings — Frontend Wars 2026' },
      {
        name: 'description',
        content: 'Switch between light and dark themes and adjust the corner radius token.',
      },
    ],
  }),
  component: SettingsPage,
})

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

function SettingsPage() {
  const { mode, accent, radius, setMode, setAccent, setRadius, reset } = useThemeStore()

  function chooseMode(next: ThemeMode, e: React.MouseEvent) {
    if (next === mode) return
    runThemeTransition(
      () => {
        document.documentElement.dataset.theme = next
        setMode(next)
      },
      { x: e.clientX, y: e.clientY },
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Theme tokens are saved to LocalStorage and applied instantly.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="size-4" /> Reset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Defaults to your system preference. Switching plays a full-page reveal animation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {MODES.map(({ value, label, icon: Icon }) => {
            const active = mode === value
            return (
              <button
                key={value}
                onClick={(e) => chooseMode(value, e)}
                aria-pressed={active}
                className={cn(
                  'group flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all',
                  active
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/40 hover:bg-accent/50',
                )}
              >
                <span
                  className={cn(
                    'grid size-12 place-items-center rounded-full transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:text-foreground',
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold">{label}</span>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Corner radius</CardTitle>
          <CardDescription>{radius.toFixed(3)}rem — drives the --radius token</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Slider
            value={[radius]}
            min={0}
            max={1.5}
            step={0.025}
            onValueChange={([v]) => setRadius(v)}
          />
          <div className="flex gap-3">
            {[0, 0.5, 1, 1.5].map((r) => (
              <div
                key={r}
                className="flex-1 border-2 border-primary/40 bg-primary/5 p-3 text-center text-xs text-muted-foreground"
                style={{ borderRadius: `${r}rem` }}
              >
                {r}rem
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accent color</CardTitle>
          <CardDescription>
            Pick an accent to personalize the theme — it drives the --primary and --ring tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Default: clears the override, using the theme's built-in primary. */}
            <button
              onClick={() => setAccent(null)}
              aria-pressed={accent === null}
              title="Default"
              className={cn(
                'grid size-9 place-items-center rounded-full border-2 text-[10px] font-semibold transition-all',
                accent === null
                  ? 'border-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/40',
              )}
            >
              Auto
            </button>

            {ACCENT_SWATCHES.map((s) => {
              const active = accent?.toLowerCase() === s.value.toLowerCase()
              return (
                <button
                  key={s.value}
                  onClick={() => setAccent(s.value)}
                  aria-label={s.name}
                  aria-pressed={active}
                  title={s.name}
                  className={cn(
                    'grid size-9 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-105',
                    active ? 'ring-foreground' : 'ring-transparent',
                  )}
                  style={{ background: s.value }}
                >
                  {active && <Check className="size-4 text-white" />}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="custom-accent">Custom color</Label>
              <span className="text-sm text-muted-foreground">Choose any color you like.</span>
            </div>
            <input
              id="custom-accent"
              type="color"
              value={isHex(accent) ? accent! : '#005396'}
              onChange={(e) => setAccent(e.target.value)}
              className="size-10 cursor-pointer rounded-md border bg-transparent"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function isHex(v: string | null): v is string {
  return !!v && /^#[0-9a-fA-F]{6}$/.test(v)
}
