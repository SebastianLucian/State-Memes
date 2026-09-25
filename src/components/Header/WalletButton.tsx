import { useEffect, useRef } from 'react'
import { appStore, useApp } from '../../lib/store/appStore'
import { promptWallet, useWallet } from '../../hooks/useWallet'
import { gsap } from '../../lib/animation/easing'

/** Small and understated. Connect → address → a tiny wallet card. */
export function WalletButton() {
  const { connected, connecting, short, balance, disconnect, walletName, isDemo, refreshBalance } = useWallet()
  const menuOpen = useApp((s) => s.walletMenuOpen)
  const menuRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen || !menuRef.current) return
    refreshBalance()
    gsap.fromTo(menuRef.current, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power3.out' })
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) appStore.set({ walletMenuOpen: false })
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [menuOpen, refreshBalance])

  if (!connected) {
    return (
      <button
        onClick={() => promptWallet()}
        className="btn-line h-9 bg-parchment/60 px-3.5 text-[10px] backdrop-blur-[2px] sm:px-4"
        disabled={connecting}
      >
        {connecting ? 'Connecting…' : (
          <>
            <span className="max-sm:hidden">Connect wallet</span>
            <span className="sm:hidden">Connect</span>
          </>
        )}
      </button>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => appStore.set({ walletMenuOpen: !menuOpen })}
        className="numeric flex h-9 items-center gap-2 border border-ink/35 bg-parchment/60 px-3 text-[11.5px] tracking-[0.04em] text-ink backdrop-blur-[2px] transition-colors hover:border-ink/70"
        aria-expanded={menuOpen}
      >
        <span className="h-1.5 w-1.5 rotate-45 bg-navy" />
        {short}
      </button>
      {menuOpen && (
        <div ref={menuRef} className="card-paper absolute top-11 right-0 w-56 border border-ink/50 p-5 shadow-[0_14px_30px_-14px_rgb(40_28_18/0.5)]">
          <div className="pointer-events-none absolute inset-[3px] border border-ink/10" />
          <div className="label text-[9px] text-ink/55">Wallet</div>
          <div className="numeric mt-2 text-[15px] text-ink">{short}</div>
          <div className="label mt-1 text-[8.5px] text-ink/40">
            {walletName}
            {isDemo && ' · no funds'}
          </div>
          <div className="rule my-4" />
          <div className="label text-[9px] text-ink/55">SOL</div>
          <div className="numeric mt-1 text-[22px] leading-none text-ink">{balance === null ? '—' : balance.toFixed(2)}</div>
          <div className="rule my-4" />
          <button
            onClick={() => {
              appStore.set({ walletMenuOpen: false })
              disconnect()
            }}
            className="label text-[9.5px] text-brick hover:underline"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
