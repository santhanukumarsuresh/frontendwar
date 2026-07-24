import { Link } from '@tanstack/react-router'
import { BarChart3, Boxes, Home, Settings, Swords } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/showcase', label: '3D', icon: Boxes },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Swords className="size-4" />
          </span>
          <span className="hidden sm:inline">Frontend Wars 2026</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
              activeProps={{ className: 'active' }}
              activeOptions={{ exact: to === '/' }}
            >
              <Icon className="size-4" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
