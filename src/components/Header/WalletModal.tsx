import { useEffect, useLayoutEffect, useRef } from 'react'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { appStore, useApp } from '../../lib/store/appStore'
import { useWallet } from '../../hooks/useWallet'
import { launchIntent } from '../../hooks/useLaunch'
import { PaperPanel } from '../UI/PaperPanel'
import { gsap } from '../../lib/animation/easing'

const SUGGESTED = [
  { name: 'Phantom', url: 'https://phantom.app/' },
  { name: 'Solflare', url: 'https://solflare.com/' },
  { name: 'Backpack', url: 'https://backpack.app/' },
]

export function WalletModal() {
  const open = useApp((s) => s.walletModalOpen)
  const reason = useApp((s) => s.walletPromptReason)
  const { wallets, choose, connected, connecting } = useWallet()
  const sheetRef = useRef<HTMLDivElement>(null)

  const close = () => {
    launchIntent.advanceOnConnect = false
    appStore.set({ walletModalOpen: false, walletPromptReason: null })
  }

  useLayoutEffect(() => {
    if (open && sheetRef.current)
      gsap.fromTo(sheetRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' })
  }, [open])

  useEffect(() => {
    if (open && connected) appStore.set({ walletModalOpen: false, walletPromptReason: null })
  }, [open, connected])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const detected = wallets.filter((w) => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable)
  const detectedNames = new Set(detected.map((w) => w.adapter.name as string))
  const missing = SUGGESTED.filter((s) => !detectedNames.has(s.name))

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[rgb(40_30_20/0.3)]" onClick={close} />
      <PaperPanel
        ref={sheetRef}
        className="relative w-full max-w-[360px] px-7 pt-7 pb-7 max-md:max-w-none max-md:border-x-0 max-md:border-b-0"
      >
        <button onClick={close} className="label absolute top-4 right-5 p-1 text-[9px] text-ink/45 hover:text-ink" aria-label="Close">
          ✕
        </button>
        <div className="text-center">
          <div className="label text-[11px] tracking-[0.3em] text-ink">Connect wallet</div>
          {reason && <div className="label mt-1.5 text-[9.5px] tracking-[0.26em] text-brick">{reason}</div>}
        </div>
        <div className="rule-double my-5" />

        <ul className="flex flex-col">
          {detected.map((w, i) => (
            <li key={w.adapter.name} className={i > 0 ? 'border-t border-dotted border-ink/20' : ''}>
              <button
                onClick={() => choose(w.adapter.name)}
                disabled={connecting}
                className="group flex w-full items-center gap-3 py-3 text-left disabled:opacity-50"
              >
                <img src={w.adapter.icon} alt="" className="h-6 w-6" />
                <span className="flex-1 text-[14px] text-ink">{w.adapter.name}</span>
                <span className="label text-[8.5px] text-ink/40 transition-colors group-hover:text-ink">
                  {w.readyState === WalletReadyState.Installed ? 'Detected' : 'Preview'} →
                </span>
              </button>
            </li>
          ))}
          {missing.map((s) => (
            <li key={s.name} className="border-t border-dotted border-ink/20 first:border-t-0">
              <a href={s.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 py-3">
                <span className="h-6 w-6 border border-dashed border-ink/30" />
                <span className="flex-1 text-[14px] text-ink/55">{s.name}</span>
                <span className="label text-[8.5px] text-ink/35 group-hover:text-ink">Install ↗</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="label mt-5 text-center text-[8px] leading-relaxed tracking-[0.14em] text-ink/40">
          Any Solana wallet supporting the Wallet Standard works
        </p>
      </PaperPanel>
    </div>
  )
}
