// Global styles must load before component styles to keep the cascade order.
import '@/styles/theme.css'
import '@/styles/base.css'
import '@/styles/primitives.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
