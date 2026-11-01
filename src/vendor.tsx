// Entry for the public vendor board (vendor.html): no sign-in, no app code.
import '@/styles/theme.css'
import '@/styles/base.css'
import '@/styles/primitives.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { VendorPage } from '@/features/vendor'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VendorPage />
  </StrictMode>,
)
