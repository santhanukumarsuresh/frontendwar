import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth'

/** Route guard: the app pages require a (mock) signed-in account. */
export function requireAuth() {
  if (!useAuthStore.getState().user) {
    throw redirect({ to: '/login' })
  }
}
