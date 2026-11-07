import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Alias } from 'vite'

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
    plugins: [react()],
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
