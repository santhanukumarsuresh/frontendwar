import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'

export const Route = createRootRoute({
  // Default document head; individual routes override the title/description.
  head: () => ({
    meta: [
      { title: 'Frontend Wars 2026 — Client-side React Starter' },
      {
        name: 'description',
        content:
          'A fully client-side React + TypeScript + Vite + Tailwind app for Frontend Wars 2026.',
      },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
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
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <span>Frontend Wars 2026 · 100% client-side</span>
          <span>Code. Create. Conquer.</span>
        </div>
      </footer>
    </div>
  )
}
