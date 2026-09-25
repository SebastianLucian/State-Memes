import { useEffect, useRef } from 'react'
import { useApp } from '../../lib/store/appStore'
import { useLaunch } from '../../hooks/useLaunch'
import { gsap } from '../../lib/animation/easing'

/** The one call to action on the open map, for claiming without selecting first. */
export function ClaimPrompt() {
  const { openLaunch } = useLaunch()
  const visible = useApp((s) => !s.selectedId && !s.launch.open && !s.picking && !s.celebration)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.to(ref.current, { autoAlpha: visible ? 1 : 0, y: visible ? 0 : 8, duration: 0.4, ease: 'power3.out' })
  }, [visible])

  return (
    <div ref={ref} className="fixed inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] z-20 flex justify-center max-sm:bottom-[68px]">
      <div className="flex flex-col items-center gap-2">
        <button onClick={() => openLaunch(null)} className="btn-ink h-11 px-6 shadow-[0_10px_24px_-12px_rgb(23_22_20/0.6)]">
          <span className="text-ochre">✦</span> Make your claim
        </button>
        <span className="label text-[8.5px] text-ink/45 max-sm:hidden">or select a state</span>
      </div>
    </div>
  )
}

/** Short news from the frontier when a state changes hands. */
export function Dispatch() {
  const dispatch = useApp((s) => s.dispatch)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!dispatch || !el) return
    const tl = gsap
      .timeline()
      .fromTo(el, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .to(el, { autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, '+=5')
    return () => {
      tl.kill()
    }
  }, [dispatch])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-x-0 top-[64px] z-20 flex justify-center opacity-0 md:top-[58px]"
      aria-live="polite"
    >
      {dispatch && (
        <div className="flex items-center gap-2.5">
          <span className="label text-[8.5px] text-brick">Dispatch</span>
          <span className="h-px w-4 bg-ink/30" />
          <span className="display text-[13px] text-ink/80 italic">{dispatch.text}</span>
        </div>
      )}
    </div>
  )
}
