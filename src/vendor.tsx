// Entry for the public vendor board (vendor.html?room=<roomId>): no sign-in, no app code.
import '@/styles/theme.css'
import '@/styles/base.css'
import '@/styles/primitives.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { VendorPage } from '@/features/vendor'

const roomId = new URLSearchParams(window.location.search).get('room')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VendorPage roomId={roomId} />
  </StrictMode>,
)
