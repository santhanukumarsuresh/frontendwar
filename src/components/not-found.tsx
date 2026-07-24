import { Link } from '@tanstack/react-router'
import { Compass, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Rendered by the router for unmatched routes (client-side 404). */
export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-7" />
      </span>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Button asChild>
        <Link to="/">
          <Home className="size-4" /> Back to home
        </Link>
      </Button>
    </div>
  )
}
