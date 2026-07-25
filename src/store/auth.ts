import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Mock authentication — there is no backend, so signing in records the
 * account locally and unlocks the app. The basic details collected at
 * sign-up are written into the finance store's "you" node by the login page.
 */
export interface AuthUser {
  name: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  signIn: (user: AuthUser) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    { name: 'wealthdna-auth', version: 1 },
  ),
)
