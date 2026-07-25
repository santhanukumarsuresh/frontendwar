import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ClipboardList,
  LayoutDashboard,
  LockKeyhole,
  Milestone,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
  Waypoints,
  WifiOff,
} from 'lucide-react'
import { computeTotals, getGoals } from '@/lib/derive'
import { useAuthStore } from '@/store/auth'
import { useFinanceStore } from '@/store/finance'
import { formatINRCompact, formatPct } from '@/lib/format'
import { AnimatedNumber } from '@/components/animated-number'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Wealth DNA — Your Financial Life Blueprint' },
      {
        name: 'description',
        content:
          'See your entire financial ecosystem — goals, investments, loans, insurance and emergency funds — as one interactive, living blueprint. Free, private, offline-ready.',
      },
    ],
  }),
  component: HomePage,
})

const FEATURES = [
  {
    icon: Waypoints,
    title: 'Interactive blueprint',
    description:
      'A living node graph of your financial DNA — drag, zoom and trace how every investment funds a goal and every policy protects one.',
    to: '/blueprint',
  },
  {
    icon: Milestone,
    title: 'Milestone timeline',
    description:
      'Short, mid and long-term milestones on one timeline, each measured against where the plan says you should be today.',
    to: '/timeline',
  },
  {
    icon: LayoutDashboard,
    title: 'Premium dashboard',
    description:
      'Net worth trend, cash flow, asset allocation, EMIs and protection cover — the complete picture at a glance.',
    to: '/dashboard',
  },
  {
    icon: ShieldCheck,
    title: 'Actionable insights',
    description:
      'Every node carries live, rule-based insights: step up this SIP, prepay that loan, top up this cover.',
    to: '/blueprint',
  },
] as const

const STEPS = [
  {
    icon: UserRoundPlus,
    title: 'Create your account',
    text: 'A few basic details — name, income, expenses. No backend: it all stays on your device.',
  },
  {
    icon: ClipboardList,
    title: 'Make the data yours',
    text: 'Start from realistic sample figures and adjust or remove anything from your profile.',
  },
  {
    icon: Waypoints,
    title: 'Watch it come alive',
    text: 'Your blueprint, dashboard and timeline recalculate live with every change you make.',
  },
] as const

/** Decorative miniature of the blueprint graph, drawn with pure SVG. */
function HeroGraph() {
  const satellites = [
    { x: -150, y: -56, color: '#14b8a6', delay: 0 },
    { x: -104, y: 72, color: '#14b8a6', delay: 0.4 },
    { x: 148, y: -64, color: '#6366f1', delay: 0.8 },
    { x: 158, y: 58, color: '#f59e0b', delay: 1.2 },
    { x: 22, y: -104, color: '#a78bfa', delay: 1.6 },
    { x: -18, y: 108, color: '#10b981', delay: 2.0 },
  ]
  return (
    <svg viewBox="-220 -140 440 280" className="mx-auto w-full max-w-md" aria-hidden>
      {satellites.map((s, i) => (
        <line
          key={i}
          x1={0}
          y1={0}
          x2={s.x}
          y2={s.y}
          stroke={s.color}
          strokeWidth={1.5}
          strokeDasharray="5 5"
          opacity={0.5}
          className="edge-flow"
        />
      ))}
      {satellites.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r={16} fill={s.color} opacity={0.9}>
            <animate
              attributeName="r"
              values="15;17;15"
              dur="3s"
              begin={`${s.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
      <circle r={30} fill="var(--primary)" />
      <text textAnchor="middle" dy="0.35em" fontSize={11} fontWeight={700} fill="#fff">
        You
      </text>
    </svg>
  )
}

function HomePage() {
  const user = useAuthStore((s) => s.user)
  const nodes = useFinanceStore((s) => s.nodes)
  const totals = computeTotals(nodes)
  const goals = getGoals(nodes)
  const onTrack = goals.filter((g) => g.planProgress >= 75).length

  const personalStats: {
    label: string
    value?: number
    format?: (v: number) => string
    text?: string
  }[] = [
    { label: 'Net worth tracked', value: totals.netWorth, format: formatINRCompact },
    { label: 'Goals on track', text: `${onTrack} of ${goals.length}` },
    { label: 'Protection cover', value: totals.insuranceCover, format: formatINRCompact },
    { label: 'Savings rate', value: totals.savingsRate, format: (v) => formatPct(v) },
  ]

  const marketingStats = [
    { icon: LockKeyhole, label: 'Local-first privacy', text: 'Nothing leaves your browser' },
    { icon: WifiOff, label: 'Works offline', text: 'Installable PWA' },
    { icon: Sparkles, label: 'Realistic math', text: 'Compounding, not guesses' },
    { icon: ShieldCheck, label: 'Free forever', text: 'No card, no catch' },
  ]

  return (
    <div className="flex flex-col gap-16">
      <section className="grid items-center gap-10 py-8 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground"
          >
            <Sparkles className="size-4 text-primary" />
            Wealth DNA · Personal Finance SaaS
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-xl text-balance text-4xl font-bold tracking-tight sm:text-6xl"
          >
            Your financial life,{' '}
            <span className="bg-(image:--brand-gradient) bg-clip-text text-transparent">
              decoded.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-lg text-pretty text-lg text-muted-foreground"
          >
            Goals, investments, loans, insurance and your emergency fund — connected into one
            interactive blueprint, so you can see exactly how today's money builds tomorrow's
            life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            {user ? (
              <>
                <Button asChild size="lg">
                  <Link to="/dashboard">
                    Open your dashboard <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/blueprint">Explore your blueprint</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/login">
                    Start free — 2 minutes <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <HeroGraph />
        </motion.div>
      </section>

      {/* Stats strip — personal once signed in, product promises before */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-4 rounded-xl border bg-card/60 p-6 sm:grid-cols-4"
        aria-label={user ? 'Portfolio summary' : 'Why Wealth DNA'}
      >
        {user
          ? personalStats.map(({ label, value, format, text }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold tabular-nums text-primary">
                  {value != null && format ? (
                    <AnimatedNumber value={value} format={format} />
                  ) : (
                    text
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{label}</div>
              </div>
            ))
          : marketingStats.map(({ icon: Icon, label, text }) => (
              <div key={label} className="flex flex-col items-center gap-1 text-center">
                <Icon className="size-5 text-primary" />
                <div className="text-sm font-bold">{label}</div>
                <div className="text-xs text-muted-foreground">{text}</div>
              </div>
            ))}
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Features">
        {FEATURES.map(({ icon: Icon, title, description, to }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={user ? to : '/login'} className="group block h-full">
              <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-lg">
                <CardHeader>
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-2">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {user ? 'Open' : 'Sign in to explore'} <ArrowRight className="inline size-3.5" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20" aria-label="How it works">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Up and running in three steps
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-xl border bg-card/60 p-6"
            >
              <span className="absolute right-4 top-3 text-4xl font-bold text-primary/10">
                {i + 1}
              </span>
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      {!user && (
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-(image:--brand-gradient) p-10 text-center text-white"
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight">
            Ready to decode your financial life?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            Two minutes to sign up. Zero data leaves your browser.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/login">
              Start your blueprint <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.section>
      )}
    </div>
  )
}
