import { forwardRef } from 'react'
import { WalletButton } from './WalletButton'
import { appStore } from '../../lib/store/appStore'

/** No navigation. A name, a line, a wallet. The product is the map. */
export const Header = forwardRef<HTMLElement>(function Header(_, ref) {
  return (
    <header
      ref={ref}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between px-4 pt-4 opacity-0 sm:px-6 sm:pt-5 lg:px-8"
    >
      <button
        className="pointer-events-auto flex items-center gap-2.5 text-left"
        onClick={() => appStore.set({ selectedId: null })}
        aria-label="The Frontier — back to the full map"
      >
        <Compass />
        <span className="flex flex-col">
          <span className="display text-[17px] leading-none tracking-[0.2em] text-ink uppercase sm:text-[19px]">
            The Frontier
          </span>
          <span className="label mt-1 text-[8px] tracking-[0.26em] text-ink/45 max-sm:hidden">Est. 2026</span>
        </span>
      </button>

      <div className="absolute left-1/2 mt-2.5 hidden -translate-x-1/2 items-center gap-3 md:flex">
        <span className="h-px w-8 bg-ink/30" />
        <span className="label text-[9.5px] tracking-[0.34em] text-ink/60">50 States · One Map</span>
        <span className="h-px w-8 bg-ink/30" />
      </div>

      <div className="pointer-events-auto">
        <WalletButton />
      </div>
    </header>
  )
})

function Compass() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0 text-ink" aria-hidden>
      <circle cx="13" cy="13" r="11.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="13" cy="13" r="9" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
      <path d="M13 3 L15.2 13 L13 23 L10.8 13 Z" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <path d="M13 3 L15.2 13 L10.8 13 Z" fill="#843F34" />
      <path d="M3 13 L13 11.6 L23 13 L13 14.4 Z" fill="currentColor" opacity="0.35" />
    </svg>
  )
}
