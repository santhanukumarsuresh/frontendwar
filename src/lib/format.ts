/**
 * Indian-locale money & number formatting used across the app.
 * Amounts are stored in absolute rupees and rendered as ₹X.XCr / ₹X.XL / ₹X,XXX.
 */

/** Full Indian-grouped rupee amount, e.g. ₹12,45,000. */
export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

/**
 * Compact rupee amount using lakh/crore units, e.g. ₹1.24Cr, ₹18.5L, ₹96.5K.
 * Precision is kept high enough to stay truthful: ₹1,85,000 renders as
 * ₹1.85L (never "₹1.9L"), because these are real financial figures.
 */
export function formatINRCompact(value: number): string {
  const sign = value < 0 ? '−' : ''
  const abs = Math.abs(value)
  if (abs >= 1e7) return `${sign}₹${trim((abs / 1e7).toFixed(2))}Cr`
  if (abs >= 1e5) {
    const lakhs = abs / 1e5
    return `${sign}₹${trim(lakhs.toFixed(lakhs < 10 ? 2 : 1))}L`
  }
  if (abs >= 1e3) return `${sign}₹${trim((abs / 1e3).toFixed(1))}K`
  return `${sign}₹${Math.round(abs)}`
}

/**
 * Display convention for people: first name + last-name initial.
 * "Arjun Mehta" → "Arjun M.", "Rani S." → "Rani S.", "Priya" → "Priya".
 */
export function formatDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length < 2) return parts[0] ?? ''
  const initial = parts[1][0]?.toUpperCase()
  return initial ? `${parts[0]} ${initial}.` : parts[0]
}

/** Drop a trailing ".0" / ".00" from a fixed-decimal string. */
function trim(s: string): string {
  return s.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

export function formatPct(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

/** Clamp a progress value into the 0–100 range for bar widths. */
export function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value))
}
