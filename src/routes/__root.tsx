import { createRootRoute, HeadContent, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Logo } from '@/components/logo'

export const Route = createRootRoute({
  // Default document head; individual routes override the title/description.
  head: () => ({
    meta: [
      { title: 'Wealth DNA — Your Financial Life Blueprint' },
      {
        name: 'description',
        content:
          'A personal finance platform that connects goals, investments, insurance, loans and emergency funds into one interactive blueprint.',
      },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
      {/* Renders per-route <title>/<meta> into the document head. */}
      <HeadContent />

      {/* Decorative brand backdrop — makes the margins feel designed, not empty. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_-8%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent),radial-gradient(48rem_24rem_at_100%_0,color-mix(in_oklab,var(--brand-light)_8%,transparent),transparent)]"
      />

      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Soft fade-up on every route change — keeps navigation feeling alive. */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            aria-label="Back to home"
          >
            <Logo className="size-5" />
            <span>Wealth DNA · Your financial life, decoded</span>
          </Link>
          <span>Plan · Visualize · Achieve</span>
        </div>
      </footer>
    </div>
  )
}
