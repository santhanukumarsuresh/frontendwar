import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { LockKeyhole, ShieldCheck, Sparkles, Waypoints } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useAuthStore } from '@/store/auth'
import { useFinanceStore } from '@/store/finance'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FinNode } from '@/types/finance'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().user) throw redirect({ to: '/profile' })
  },
  head: () => ({
    meta: [
      { title: 'Sign in — Wealth DNA' },
      {
        name: 'description',
        content:
          'Create your Wealth DNA account — a few basic details and your financial blueprint is ready.',
      },
    ],
  }),
  component: LoginPage,
})

const PERKS = [
  { icon: Waypoints, text: 'Your goals, investments, loans & insurance in one living graph' },
  { icon: ShieldCheck, text: 'Everything stays in your browser — nothing is sent to a server' },
  { icon: Sparkles, text: 'Prefilled with realistic sample figures you can make your own' },
] as const

function LoginPage() {
  const navigate = useNavigate()
  const signIn = useAuthStore((s) => s.signIn)
  const updateNode = useFinanceStore((s) => s.updateNode)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    occupation: '',
    income: '',
    expenses: '',
  })

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // No backend — accept the details as given. The password is neither
    // validated nor stored anywhere.
    const patch: Partial<FinNode> = { name: form.name.trim() }
    if (form.occupation.trim()) patch.occupation = form.occupation.trim()
    const age = Number(form.age)
    if (Number.isFinite(age) && age > 0) patch.age = age
    const income = Number(form.income)
    if (Number.isFinite(income) && income > 0) patch.monthlyIncome = income
    const expenses = Number(form.expenses)
    if (Number.isFinite(expenses) && expenses > 0) patch.monthlyExpenses = expenses
    updateNode('you', patch)

    signIn({ name: form.name.trim(), email: form.email.trim() })
    void navigate({ to: '/profile' })
  }

  return (
    // Negative margin cancels the page's default padding so the form fits a
    // typical laptop viewport without scrolling.
    <div className="mx-auto -my-8 grid min-h-[calc(100dvh-7.5rem)] max-w-5xl items-center gap-10 lg:grid-cols-2">
      {/* Pitch */}
      <motion.div
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden flex-col gap-6 lg:flex"
      >
        <Logo className="size-11" />
        <h1 className="text-balance text-3xl font-bold tracking-tight xl:text-4xl">
          A few details, and your{' '}
          <span className="bg-(image:--brand-gradient) bg-clip-text text-transparent">
            financial blueprint
          </span>{' '}
          is ready.
        </h1>
        <ul className="flex flex-col gap-3">
          {PERKS.map(({ icon: Icon, text }, i) => (
            <motion.li
              key={text}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="flex items-start gap-3 text-muted-foreground"
            >
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              {text}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Form — kept compact so the page fits without scrolling */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mx-auto w-full max-w-md py-0 shadow-lg">
          <CardContent className="flex flex-col gap-2.5 p-4 sm:p-5">
            <div className="flex items-center gap-3 lg:hidden">
              <Logo className="size-8" />
              <div className="font-bold">
                Wealth <span className="text-primary">DNA</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">Create your account</h2>
              <p className="text-sm text-muted-foreground">
                Basic details only — they personalise your blueprint.
              </p>
            </div>

            <form className="flex flex-col gap-2" onSubmit={onSubmit}>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="su-name" className="text-xs">
                    Full name
                  </Label>
                  <Input
                    className="h-8"
                    id="su-name"
                    required
                    placeholder="e.g. Rani Sharma"
                    {...field('name')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="su-email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    className="h-8"
                    id="su-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    {...field('email')}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="su-password" className="text-xs">
                  Password
                </Label>
                <Input
                  className="h-8"
                  id="su-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  {...field('password')}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="su-age" className="text-xs">
                    Age
                  </Label>
                  <Input
                    className="h-8"
                    id="su-age"
                    type="number"
                    min={16}
                    placeholder="32"
                    {...field('age')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="su-occupation" className="text-xs">
                    Occupation, city
                  </Label>
                  <Input
                    className="h-8"
                    id="su-occupation"
                    placeholder="PM, Bengaluru"
                    {...field('occupation')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="su-income" className="text-xs">
                    Monthly income (₹)
                  </Label>
                  <Input
                    className="h-8"
                    id="su-income"
                    type="number"
                    min={0}
                    placeholder="185000"
                    {...field('income')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="su-expenses" className="text-xs">
                    Monthly expenses (₹)
                  </Label>
                  <Input
                    className="h-8"
                    id="su-expenses"
                    type="number"
                    min={0}
                    placeholder="96500"
                    {...field('expenses')}
                  />
                </div>
              </div>

              <Button type="submit" className="mt-0.5">
                Start my blueprint
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
                <LockKeyhole className="size-3 shrink-0" />
                No backend, no tracking — your details never leave this browser.
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
