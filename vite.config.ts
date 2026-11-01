import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      // Two pages: the app, and the public vendor board (/vendor.html).
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        vendor: fileURLToPath(new URL('./vendor.html', import.meta.url)),
      },
    },
  },
})
