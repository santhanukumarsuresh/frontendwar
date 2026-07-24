// Copies dist/index.html to dist/404.html so client-side (history) routing
// works on GitHub Pages: unknown deep-links serve the SPA shell, which then
// hydrates and routes correctly. Harmless on Vercel (uses vercel.json instead).
import { copyFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const index = resolve(dist, 'index.html')
const fallback = resolve(dist, '404.html')

try {
  await access(index)
  await copyFile(index, fallback)
  console.log('[spa-fallback] created dist/404.html')
} catch {
  console.warn('[spa-fallback] dist/index.html not found — skipping (did the build run?)')
}
