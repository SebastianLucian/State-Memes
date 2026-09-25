import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { appStore, useApp } from '../../lib/store/appStore'
import { STATES, STATE_BY_ID } from '../../data/states'
import { closeStatePanel, openStatePanel, refreshStatePanel } from '../../lib/animation/ui'
import { formatCompact, formatFull, formatPct } from '../../lib/format'
import { PaperPanel } from '../UI/PaperPanel'
import { Button } from '../UI/Button'
import { CountUp } from '../UI/CountUp'
import { StateLeaderboard } from './StateLeaderboard'
import { useLaunch } from '../../hooks/useLaunch'
import { gsap as gsapCore } from '../../lib/animation/easing'

/** The archival card for a selected state. Right-hand card on desktop, bottom sheet on mobile. */
export function StatePanel() {
  const selectedId = useApp((s) => s.selectedId)
  const hidden = useApp((s) => s.picking || s.launch.open || !!s.celebration)
  const target = hidden ? null : selectedId

  const [shownId, setShownId] = useState<string | null>(null)
  const shownRef = useRef<string | null>(null)
  const pending = useRef<'open' | 'refresh' | null>(null)
  const tween = useRef<{ kill(): unknown; isActive(): boolean } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (target) {
      const wasShown = shownRef.current
      if (wasShown === target && !tween.current?.isActive()) return
      tween.current?.kill()
      pending.current = wasShown ? 'refresh' : 'open'
      shownRef.current = target
      setShownId(target)
    } else if (shownRef.current && panelRef.current) {
      tween.current?.kill()
      tween.current = closeStatePanel(panelRef.current).eventCallback('onComplete', () => {
        shownRef.current = null
        setShownId(null)
      })
    }
  }, [target])

  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el || !pending.current) return
    tween.current = pending.current === 'open' ? openStatePanel(el) : refreshStatePanel(el)
    pending.current = null
  }, [shownId])

  // Esc returns to the full map.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = appStore.get()
      if (e.key === 'Escape' && s.selectedId && !s.launch.open && !s.walletModalOpen) appStore.set({ selectedId: null })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!shownId) return null
  return <PanelBody ref={panelRef} stateId={shownId} />
}

function PanelBody({ stateId, ref }: { stateId: string; ref: React.Ref<HTMLDivElement> }) {
  const summary = useApp((s) => s.summaries[stateId])
  const { openLaunch } = useLaunch()
  const info = STATE_BY_ID[stateId]
  const leader = summary?.leader
  const index = STATES.findIndex((s) => s.id === stateId) + 1
  const drag = useSheetDrag(() => appStore.set({ selectedId: null }))

  return (
    <aside
      className="fixed z-30 max-md:inset-x-0 max-md:bottom-0 md:top-[84px] md:right-6 md:w-[360px] lg:right-8"
      aria-label={`${info.name} territory`}
    >
      <PaperPanel
        ref={ref}
        className="invisible max-h-[calc(100dvh-110px)] overflow-y-auto px-6 pt-5 pb-6 max-md:max-h-[64dvh] max-md:border-x-0 max-md:border-b-0 max-md:pt-3 md:px-7"
        corners={false}
      >
        {/* Mobile drag handle */}
        <div className="-mx-6 mb-2 flex touch-none justify-center pb-2 md:hidden" {...drag}>
          <span className="h-[3px] w-10 bg-ink/25" />
        </div>

        <div data-stagger className="flex items-center justify-between">
          <span className="label text-[9px] text-ink/50">
            No. {String(index).padStart(2, '0')} &nbsp;·&nbsp; {info.id}
          </span>
          <button
            onClick={() => appStore.set({ selectedId: null })}
            className="label -mr-1 p-1 text-[9px] text-ink/50 transition-colors hover:text-ink"
            aria-label="Close"
          >
            Close ✕
          </button>
        </div>

        <header data-stagger className="mt-3">
          <h2 className="display text-[34px] leading-[1] tracking-[0.04em] text-ink uppercase">{info.name}</h2>
          <p className="display mt-1.5 text-[14px] text-ink/60 italic">{info.nickname}</p>
        </header>

        <div data-stagger className="rule-double my-5" />

        {leader ? (
          <>
            <section data-stagger className="flex items-baseline justify-between gap-3">
              <div>
                <div className="numeric text-[30px] leading-none font-semibold tracking-[0.01em]" style={{ color: leader.color }}>
                  ${leader.symbol}
                </div>
                <div className="display mt-1 text-[13px] text-ink/60 italic">{leader.name}</div>
              </div>
              <span className="label text-[8.5px] text-ink/45">Holds the state</span>
            </section>

            <section data-stagger className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <CountUp value={leader.marketCap} format={formatFull} className="numeric block text-[17px] text-ink" />
                <div className="label mt-1 text-[8.5px] text-ink/50">Market cap</div>
              </div>
              <div>
                <CountUp
                  value={summary.dominance}
                  format={formatPct}
                  className="numeric block text-[17px] text-ink"
                />
                <div className="label mt-1 text-[8.5px] text-ink/50">State dominance</div>
              </div>
              <div className="col-span-2 h-[3px] bg-ink/10">
                <div
                  className="h-full transition-[width] duration-1000 ease-[var(--ease-paper)]"
                  style={{ width: `${summary.dominance * 100}%`, background: leader.color }}
                />
              </div>
            </section>

            <div data-stagger className="rule my-5" />

            <section data-stagger>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="label text-[9px] text-ink/60">State leaders</span>
                <span className="numeric text-[10px] text-ink/45">Total {formatCompact(summary.totalMarketCap)}</span>
              </div>
              <StateLeaderboard summary={summary} highlight={leader.id} />
            </section>
          </>
        ) : (
          <section data-stagger className="py-2">
            <div className="label text-[10px] text-brick">Unclaimed territory</div>
            <p className="display mt-2 text-[18px] leading-snug text-ink/80">
              No meme has claimed {info.name} yet.
              <br />
              <span className="italic">The land is open.</span>
            </p>
          </section>
        )}

        <div data-stagger className="rule my-5" />

        <div
          data-stagger
          className="max-md:sticky max-md:-bottom-6 max-md:-mx-6 max-md:bg-[#ece3d1] max-md:px-6 max-md:pt-1 max-md:pb-6"
        >
          <Button className="w-full" onClick={() => openLaunch(stateId)}>
            <span className="text-ochre">✦</span> Make your claim
          </Button>
          {leader?.mock && (
            <p className="label mt-3 text-center text-[8px] tracking-[0.16em] text-ink/40">
              Development data · not real tokens or market caps
            </p>
          )}
        </div>
      </PaperPanel>
    </aside>
  )
}

/** Swipe-down-to-dismiss for bottom sheets. The handle's parent is the sheet. */
export function useSheetDrag(onDismiss: () => void) {
  const start = useRef<number | null>(null)
  const sheetOf = (e: React.PointerEvent) => (e.currentTarget as HTMLElement).parentElement
  return {
    onPointerDown: (e: React.PointerEvent) => {
      start.current = e.clientY
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (start.current === null) return
      const sheet = sheetOf(e)
      if (sheet) gsapCore.set(sheet, { y: Math.max(0, e.clientY - start.current) })
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (start.current === null) return
      const dy = e.clientY - start.current
      start.current = null
      const sheet = sheetOf(e)
      if (dy > 70) onDismiss()
      else if (sheet) gsapCore.to(sheet, { y: 0, duration: 0.3, ease: 'power3.out' })
    },
  }
}
