import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { requireAuth } from '@/lib/auth-guard'
import { formatDisplayName } from '@/lib/format'
import { useAuthStore } from '@/store/auth'
import { useFinanceStore } from '@/store/finance'
import { AppearanceSettings } from '@/components/profile/appearance-settings'
import { FinancialData } from '@/components/profile/financial-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/profile')({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: 'Profile — Wealth DNA' },
      {
        name: 'description',
        content:
          'Your account, website customization and financial data — everything Wealth DNA knows lives here, in your browser.',
      },
    ],
  }),
  component: ProfilePage,
})

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'W'
}

function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const nodes = useFinanceStore((s) => s.nodes)
  const self = nodes.find((n) => n.category === 'self')

  if (!user || !self || self.category !== 'self') return null

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="h-20 bg-(image:--brand-gradient) opacity-90" aria-hidden />
          <CardContent className="flex flex-wrap items-end justify-between gap-4 p-6 pt-0">
            <div className="flex items-end gap-4">
              <span className="-mt-8 grid size-16 shrink-0 place-items-center rounded-2xl border-4 border-card bg-(image:--brand-gradient) text-xl font-bold text-white shadow">
                {initialsOf(self.name)}
              </span>
              <div>
                <h1 className="text-xl font-bold leading-tight">
                  {formatDisplayName(self.name)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {user.email} · {self.occupation}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signOut()
                void navigate({ to: '/' })
              }}
            >
              <LogOut className="size-4" /> Sign out
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <AppearanceSettings />

      <Separator />

      <FinancialData />
    </div>
  )
}
