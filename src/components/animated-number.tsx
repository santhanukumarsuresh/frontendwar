import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'

/**
 * Counts a number up from 0 when it scrolls into view. Renders the final
 * value immediately when the user prefers reduced motion.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 1.1,
  className,
}: {
  value: number
  format: (v: number) => string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const formatRef = useRef(format)
  const inView = useInView(ref, { once: true, margin: '-20px' })

  useEffect(() => {
    formatRef.current = format
  }, [format])

  useEffect(() => {
    const el = ref.current
    if (!inView || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = formatRef.current(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = formatRef.current(v)
      },
    })
    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  )
}
