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
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Renders per-route <title>/<meta> into the document head. */}
      <HeadContent />
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-sm text-muted-foreground">
          <span>Frontend Wars 2026 · 100% client-side</span>
          <span>Code. Create. Conquer.</span>
        </div>
      </footer>
    </div>
  )
}
