// Entry for the demo (demo/index.html). Built with `--mode demo`, which swaps
// every Firebase service for the in-memory demo one (see vite.config.ts).
import '@/styles/theme.css'
import '@/styles/base.css'
import '@/styles/primitives.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { DemoApp } from '@/demo/DemoApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
)
