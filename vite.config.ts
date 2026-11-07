import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Alias, type Plugin } from 'vite'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))

/** Services that talk to Firebase. The demo build swaps each for its in-memory copy in src/demo/services. */
const DEMO_SERVICES = [
  'accessService',
  'authService',
  'debtService',
  'orderService',
  'roommateService',
  'settlementService',
  'userService',
  'vendorService',
]

/**
 * `npm run dev:demo` only serves the demo at /demo/, but the terminal links to
 * / (and people type /demo), which would open the real app with no sign-in.
 * Send both to /demo/. GitHub Pages already redirects /demo to /demo/.
 */
const demoDevRedirect: Plugin = {
  name: 'demo-dev-redirect',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = req.url?.split('?')[0]
      if (path === '/' || path === '/demo') {
        res.writeHead(302, { Location: '/demo/' })
        res.end()
        return
      }
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDemo = mode === 'demo'

  const demoAliases: Alias[] = isDemo
    ? [
        {
          find: new RegExp(`^@/services/(${DEMO_SERVICES.join('|')})$`),
          replacement: fromRoot('./src/demo/services/$1.ts'),
        },
      ]
    : []

  return {
    plugins: isDemo ? [react(), demoDevRedirect] : [react()],
    // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH.
    base: process.env.BASE_PATH ?? '/',
    resolve: {
      alias: [...demoAliases, { find: '@', replacement: fromRoot('./src') }],
    },
    build: isDemo
      ? {
          // `vite build --mode demo` adds dist/demo/ next to the main build.
          emptyOutDir: false,
          rolldownOptions: { input: { demo: fromRoot('./demo/index.html') } },
        }
      : {
          // The app, and the public vendor board (/vendor.html).
          rolldownOptions: {
            input: {
              main: fromRoot('./index.html'),
              vendor: fromRoot('./vendor.html'),
            },
          },
        },
  }
})
