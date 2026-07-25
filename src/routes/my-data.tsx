import { createFileRoute, redirect } from '@tanstack/react-router'

/** The data editor moved into the Profile page — keep old links working. */
export const Route = createFileRoute('/my-data')({
  beforeLoad: () => {
    throw redirect({ to: '/profile' })
  },
})
