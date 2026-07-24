import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Router-level error boundary. Catches render/loader errors so a single broken
 * route degrades gracefully instead of white-screening the whole app.
 */
export function ErrorView({ error }: ErrorComponentProps) {
  const router = useRouter()
  const message = error instanceof Error ? error.message : String(error)

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </span>
      <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        An unexpected error occurred while rendering this page.
      </p>
      {message && (
        <pre className="max-w-lg overflow-auto rounded-lg border bg-muted px-4 py-2 text-left text-xs text-muted-foreground">
          {message}
        </pre>
      )}
      <div className="flex gap-2">
        <Button onClick={() => router.invalidate()}>
          <RotateCcw className="size-4" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link to="/">
            <Home className="size-4" /> Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
