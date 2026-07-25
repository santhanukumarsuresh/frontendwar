import { useId } from 'react'

/**
 * The Wealth DNA mark — a hub-and-satellites node graph on an indigo→violet
 * gradient tile. This exact artwork is mirrored in public/favicon.svg and the
 * generated PWA/OG PNGs, so the brand is identical everywhere.
 */
export function Logo({ className = 'size-8' }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Wealth DNA">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill={`url(#${id})`} />
      <g stroke="#fff" strokeWidth="1.4" opacity="0.85">
        <line x1="16" y1="16" x2="8" y2="9" />
        <line x1="16" y1="16" x2="24" y2="9" />
        <line x1="16" y1="16" x2="7.5" y2="22" />
        <line x1="16" y1="16" x2="24.5" y2="23" />
      </g>
      <circle cx="16" cy="16" r="4.2" fill="#fff" />
      <circle cx="8" cy="9" r="2.6" fill="#fff" opacity="0.9" />
      <circle cx="24" cy="9" r="2.6" fill="#fff" opacity="0.9" />
      <circle cx="7.5" cy="22" r="2.6" fill="#fff" opacity="0.9" />
      <circle cx="24.5" cy="23" r="2.6" fill="#fff" opacity="0.9" />
    </svg>
  )
}
