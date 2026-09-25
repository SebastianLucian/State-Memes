import { useCallback, useEffect, useState } from 'react'
import { useConnection, useWallet as useAdapterWallet } from '@solana/wallet-adapter-react'
import { WalletReadyState, type WalletName } from '@solana/wallet-adapter-base'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { shortAddress } from '../lib/format'
import { DemoWalletName } from '../lib/solana/DemoWalletAdapter'
import { appStore } from '../lib/store/appStore'

/** A thin, UI-shaped layer over the Solana wallet adapter. */
export function useWallet() {
  const w = useAdapterWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)

  const address = w.publicKey?.toBase58() ?? null
  const isDemo = w.wallet?.adapter.name === DemoWalletName

  const refreshBalance = useCallback(async () => {
    if (!w.publicKey) return setBalance(null)
    if (isDemo) return setBalance(12.42)
    try {
      setBalance((await connection.getBalance(w.publicKey)) / LAMPORTS_PER_SOL)
    } catch {
      setBalance(null)
    }
  }, [connection, w.publicKey, isDemo])

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  const choose = useCallback(
    (name: WalletName) => {
      if (w.wallet?.adapter.name === name && !w.connected) {
        w.connect().catch(() => {})
      } else {
        // autoConnect on the provider connects as soon as the selection lands.
        w.select(name)
      }
    },
    [w],
  )

  const wallets = [...w.wallets].sort((a, b) => rank(a.readyState) - rank(b.readyState))

  return {
    connected: w.connected,
    connecting: w.connecting,
    address,
    short: address ? shortAddress(address) : null,
    balance,
    isDemo,
    wallets,
    walletName: w.wallet?.adapter.name ?? null,
    walletIcon: w.wallet?.adapter.icon ?? null,
    choose,
    disconnect: () => w.disconnect(),
    signMessage: w.signMessage,
    refreshBalance,
  }
}

function rank(s: WalletReadyState) {
  return s === WalletReadyState.Installed ? 0 : s === WalletReadyState.Loadable ? 1 : 2
}

/** Ask for a wallet, with a reason shown above the list. */
export function promptWallet(reason: string | null = null) {
  appStore.set({ walletModalOpen: true, walletPromptReason: reason, walletMenuOpen: false })
}
