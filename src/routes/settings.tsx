import { createFileRoute } from '@tanstack/react-router'
import { Check, RotateCcw } from 'lucide-react'
import {
  ACCENT_PRESETS,
  type AccentPreset,
  type ThemeMode,
  useThemeStore,
} from '@/store/theme'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/settings')({
  head: () => ({
    meta: [
      { title: 'Settings — Frontend Wars 2026' },
      {
        name: 'description',
        content: 'Customize the token-driven theme live: mode, accent color and corner radius.',
      },
    ],
  }),
  component: SettingsPage,
})

const MODES: ThemeMode[] = ['light', 'dark', 'system']

function SettingsPage() {
  const { mode, accent, customAccent, radius, setMode, setAccent, setCustomAccent, setRadius, reset } =
    useThemeStore()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Change theme tokens live. Everything is saved to LocalStorage.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="size-4" /> Reset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Light, dark, or follow your system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as ThemeMode)}>
            <TabsList className="w-full">
              {MODES.map((m) => (
                <TabsTrigger key={m} value={m} className="capitalize">
                  {m}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accent color</CardTitle>
          <CardDescription>Drives the --primary and --ring tokens across the app.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ACCENT_PRESETS) as AccentPreset[]).map((name) => {
              const active = !customAccent && accent === name
              return (
                <button
                  key={name}
                  onClick={() => setAccent(name)}
                  aria-label={name}
                  aria-pressed={active}
                  className={cn(
                    'grid size-9 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
                    active ? 'ring-foreground' : 'ring-transparent hover:ring-border',
                  )}
                  style={{ background: ACCENT_PRESETS[name] }}
                >
                  {active && <Check className="size-4 text-white" />}
                </button>
              )
            })}
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="custom-accent">Custom color</Label>
              <span className="text-sm text-muted-foreground">Override the preset with any color.</span>
            </div>
            <input
              id="custom-accent"
              type="color"
              value={hexFromCustom(customAccent)}
              onChange={(e) => setCustomAccent(e.target.value)}
              className="size-10 cursor-pointer rounded-md border bg-transparent"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Corner radius</CardTitle>
          <CardDescription>{radius.toFixed(3)}rem</CardDescription>
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
            {[0, 0.375, 0.625, 1].map((r) => (
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
    </div>
  )
}

// The native color input needs a hex value; presets are oklch so fall back to a neutral hex.
function hexFromCustom(custom: string | null): string {
  if (custom && /^#[0-9a-fA-F]{6}$/.test(custom)) return custom
  return '#7c3aed'
}
