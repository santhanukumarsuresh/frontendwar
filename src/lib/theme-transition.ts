/**
 * Runs `apply` (the DOM/state change that switches the theme) inside a
 * View Transition, then animates the swap:
 *   - the incoming theme is revealed by an expanding circular clip-path
 *     from the click point, and
 *   - the outgoing theme settles back with a slight scale and fade.
 *
 * Falls back to an instant swap when the browser lacks the View
 * Transitions API or the user prefers reduced motion.
 */
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> }
}

const DURATION = 700
const EASING = 'cubic-bezier(0.76, 0, 0.24, 1)' // easeInOutQuart — smooth accel/decel

export function runThemeTransition(apply: () => void, origin?: { x: number; y: number }) {
  const doc = document as ViewTransitionDocument
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (typeof doc.startViewTransition !== 'function' || prefersReduced) {
    apply()
    return
  }

  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  // Radius large enough to cover the farthest corner from the origin.
  const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  const transition = doc.startViewTransition(apply)

  transition.ready
    .then(() => {
      const root = document.documentElement

      // Incoming theme: circular reveal from the click point.
      root.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: DURATION,
          easing: EASING,
          pseudoElement: '::view-transition-new(root)',
        },
      )

      // Outgoing theme: subtle scale + fade so the swap reads as layered depth.
      root.animate(
        { transform: ['scale(1)', 'scale(0.965)'], opacity: [1, 0.55] },
        {
          duration: DURATION,
          easing: EASING,
          pseudoElement: '::view-transition-old(root)',
        },
      )
    })
    .catch(() => {
      /* transition was skipped/interrupted — the theme still applied */
    })
}
