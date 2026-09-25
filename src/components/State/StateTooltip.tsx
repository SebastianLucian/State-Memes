import { useEffect, useRef } from 'react'
import { useApp } from '../../lib/store/appStore'
import { STATE_BY_ID } from '../../data/states'
import { pointer } from '../../lib/map/pointer'
import { formatCompact, formatPct } from '../../lib/format'
import { gsap } from '../../lib/animation/easing'

/** A tiny map annotation that follows the cursor: old atlas label + modern data. */
export function StateTooltip() {
  const hoveredId = useApp((s) => s.hoveredId)
  const summary = useApp((s) => (s.hoveredId ? s.summaries[s.hoveredId] : null))
  const hidden = useApp((s) => !s.revealed || s.launch.open || s.walletModalOpen)
  const ref = useRef<HTMLDivElement>(null)
  const selectedId = useApp((s) => s.selectedId)
  const visible = !!hoveredId && !hidden && hoveredId !== selectedId

  useEffect(
    () =>
      pointer.on(({ x, y }) => {
        const el = ref.current
        if (!el) return
        const w = el.offsetWidth
        const h = el.offsetHeight
        const flipX = x + 22 + w > window.innerWidth - 12
        const flipY = y - 14 - h < 70
        const tx = flipX ? x - 22 - w : x + 22
        const ty = flipY ? y + 18 : y - 14 - h
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
        el.dataset.flipx = String(flipX)
        el.dataset.flipy = String(flipY)
      }),
    [],
  )

  useEffect(() => {
    if (!ref.current) return
    gsap.to(ref.current, { autoAlpha: visible ? 1 : 0, duration: visible ? 0.16 : 0.22, ease: 'power2.out' })
  }, [visible])

  const info = hoveredId ? STATE_BY_ID[hoveredId] : null
  const leader = summary?.leader

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-30 opacity-0 max-md:hidden [@media(hover:none)]:hidden"
      style={{ visibility: 'hidden' }}
      aria-hidden
    >
      <div className="card-paper relative min-w-[148px] border border-ink/45 px-3 pt-2 pb-2.5 shadow-[0_6px_18px_-8px_rgb(40_28_18/0.45)]">
        <div className="absolute inset-[2px] border border-ink/10" />
        <div className="display text-[13px] tracking-[0.2em] text-ink uppercase">{info?.name}</div>
        <div className="my-1.5 h-px bg-ink/30" />
        {leader ? (
          <>
            <div className="numeric text-[15px] font-semibold tracking-[0.02em]" style={{ color: leader.color }}>
              ${leader.symbol}
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <span className="numeric text-[12px] text-ink">{formatCompact(leader.marketCap)}</span>
              <span className="label text-[8.5px] text-ink/60">{formatPct(summary!.dominance)} dominance</span>
            </div>
          </>
        ) : (
          <>
            <div className="label text-[9.5px] text-brick">Unclaimed</div>
            <div className="display mt-0.5 text-[12px] text-ink/60 italic">The land is open.</div>
          </>
        )}
      </div>
    </div>
  )
}
