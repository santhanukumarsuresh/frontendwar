import { Link } from '@tanstack/react-router'
import { Home, LayoutDashboard, Milestone, Settings, Waypoints } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ThemeToggle } from './theme-toggle'

const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/blueprint', label: 'Blueprint', icon: Waypoints },
  { to: '/timeline', label: 'Timeline', icon: Milestone },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold" aria-label="Wealth DNA home">
          <Logo className="size-8" />
          <span className="hidden sm:inline">
            Wealth <span className="text-primary">DNA</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary">
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
