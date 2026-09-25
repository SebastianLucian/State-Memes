import { useMemo, type ReactNode } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import type { Adapter } from '@solana/wallet-adapter-base'
import { SOLANA } from './config'
import { DemoWalletAdapter } from './DemoWalletAdapter'

/**
 * Standard Solana wallet adapter. Phantom, Solflare, Backpack and other
 * Wallet Standard wallets are discovered automatically — no per-wallet packages.
 */
export function WalletProviders({ children }: { children: ReactNode }) {
  const wallets = useMemo<Adapter[]>(() => (SOLANA.demoWalletEnabled ? [new DemoWalletAdapter()] : []), [])
  return (
    <ConnectionProvider endpoint={SOLANA.endpoint}>
      <WalletProvider wallets={wallets} autoConnect localStorageKey="frontier.wallet">
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}
