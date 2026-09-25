import { Buffer } from 'buffer/'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { installPaperTextures } from './lib/texture'

// Some Solana dependencies still reach for Node's Buffer.
const g = globalThis as typeof globalThis & { Buffer?: typeof Buffer }
g.Buffer ??= Buffer

installPaperTextures()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
