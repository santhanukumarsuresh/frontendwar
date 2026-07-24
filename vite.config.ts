import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'

// `base` controls the public path the app is served from.
//  - Vercel / local dev  -> "/"          (default)
//  - GitHub Pages         -> "/<repo>/"   (set via VITE_BASE in CI)
const base = process.env.VITE_BASE ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    // Auto-generates src/routeTree.gen.ts from files in src/routes.
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    // Progressive Web App: installable + offline-first via a precaching
    // service worker. `base`-aware, so it works under the GitHub Pages
    // subpath and on Vercel without changes.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'og-image.png', 'robots.txt'],
      manifest: {
        name: 'Frontend Wars 2026',
        short_name: 'FW 2026',
        description:
          'A fully client-side React + TypeScript + Vite + Tailwind app for Frontend Wars 2026.',
        theme_color: '#7c3aed',
        background_color: '#0b0b12',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['productivity', 'developer'],
        // start_url / scope intentionally omitted — the plugin fills them from
        // Vite's `base`, so installs resolve correctly on subpath hosting.
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // SPA offline fallback: unmatched navigations serve the app shell.
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        // Keep the SW off during `pnpm dev` to avoid stale caches while coding.
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      // import.meta.dirname (Node 20.11+) — __dirname is not available in ESM.
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
