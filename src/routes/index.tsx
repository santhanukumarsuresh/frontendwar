import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Boxes, Palette, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Frontend Wars 2026 — Client-side React Starter' },
      {
        name: 'description',
        content:
          'A compliant, deploy-ready React + TypeScript + Vite + Tailwind starter with token-driven theming, data viz, 3D and offline PWA support.',
      },
    ],
  }),
  component: HomePage,
})

const FEATURES = [
  {
    icon: Palette,
    title: 'Token-driven theming',
    description:
      'Every color and radius is a CSS variable wired into Tailwind. Change the whole look from Settings — persisted to LocalStorage.',
    to: '/settings',
  },
  {
    icon: BarChart3,
    title: 'Data visualization',
    description: 'Recharts, Chart.js and D3 are ready to go, all reading the same theme tokens.',
    to: '/dashboard',
  },
  {
    icon: Boxes,
    title: '3D & motion',
    description: 'Three.js + React Three Fiber, Framer Motion, GSAP and Lenis are pre-wired.',
    to: '/showcase',
  },
] as const

function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground"
        >
          <Sparkles className="size-4 text-primary" />
          React · TypeScript · Vite · Tailwind
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl"
        >
          A compliant, deploy-ready starter for{' '}
          <span className="text-primary">Frontend Wars 2026</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl text-pretty text-lg text-muted-foreground"
        >
          100% client-side. No backend, no SSR, no databases — just a fast, themeable foundation
          you can build your winning submission on.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg">
            <Link to="/dashboard">
              Explore the dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/settings">Customize theme</Link>
          </Button>
        </motion.div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description, to }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={to} className="group block h-full">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardHeader>
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-2">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowRight className="inline size-3.5" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
