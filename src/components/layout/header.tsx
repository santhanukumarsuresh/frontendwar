import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, LayoutDashboard, Milestone, Waypoints } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useAuthStore } from '@/store/auth'
import { useFinanceStore } from '@/store/finance'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

// The profile is reached through the avatar on the right, not a nav item.
const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/blueprint', label: 'Blueprint', icon: Waypoints },
  { to: '/timeline', label: 'Timeline', icon: Milestone },
] as const

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'W'
}

export function Header() {
  const [open, setOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const selfName = useFinanceStore(
    (s) => s.nodes.find((n) => n.category === 'self')?.label ?? 'W',
  )

  // Close the drawer with Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold" aria-label="Wealth DNA home">
          <Logo className="size-8" />
          <span>
            Wealth <span className="text-primary">DNA</span>
          </span>
        </Link>

        {/* Desktop nav — app pages need an account */}
        {user && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
                activeProps={{ className: 'active' }}
                activeOptions={{ exact: to === '/' }}
              >
                <Icon className="size-4" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              {/* Avatar → profile. Ring + scale on hover so it reads as a button. */}
              <Link
                to="/profile"
                aria-label="Your profile and data"
                title="Profile"
                activeProps={{ className: 'ring-primary' }}
                className="grid size-8 shrink-0 place-items-center rounded-full bg-(image:--brand-gradient) text-xs font-bold text-white ring-2 ring-transparent ring-offset-2 ring-offset-background transition-all hover:scale-105 hover:ring-primary/60"
              >
                {initialsOf(selfName)}
              </Link>

              {/* Animated hamburger — mobile only. z-60 keeps it clickable
                  above the open drawer, so it morphs into the closing X. */}
              <button
                className="relative z-60 grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-accent md:hidden"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                <span className="relative block h-3.5 w-5">
                  <span
                    className={cn(
                      'absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300',
                      open && 'top-1.5 rotate-45',
                    )}
                  />
                  <span
                    className={cn(
                      'absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-current transition-all duration-300',
                      open && 'opacity-0',
                    )}
                  />
                  <span
                    className={cn(
                      'absolute left-0 top-3 block h-0.5 w-5 rounded-full bg-current transition-all duration-300',
                      open && 'top-1.5 -rotate-45',
                    )}
                  />
                </span>
              </button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && user && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col gap-1 border-l bg-card p-5 pt-16 shadow-xl md:hidden"
              aria-label="Mobile"
            >
              {NAV.map(({ to, label, icon: Icon }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  <Link
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
                    activeProps={{ className: 'active' }}
                    activeOptions={{ exact: to === '/' }}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
