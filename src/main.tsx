import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from './components/theme-provider'
import { NotFound } from './components/not-found'
import { ErrorView } from './components/error-view'
import './styles/globals.css'

// `basepath` keeps client-side routing correct when the app is served from a
// subpath (GitHub Pages: /<repo>/). On Vercel / dev BASE_URL is "/".
const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ErrorView,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
