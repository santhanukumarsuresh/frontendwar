import { createFileRoute, redirect } from '@tanstack/react-router'

/** Settings moved into the Profile page — keep old links working. */
export const Route = createFileRoute('/settings')({
  beforeLoad: () => {
    throw redirect({ to: '/profile' })
  },
})
