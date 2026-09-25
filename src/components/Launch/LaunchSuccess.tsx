import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Marker } from 'maplibre-gl'
import { appStore, useApp } from '../../lib/store/appStore'
import { mapRuntime } from '../../lib/map/runtime'
import { focusState } from '../../lib/map/camera'
import { STATE_BY_ID } from '../../data/states'
import { gsap } from '../../lib/animation/easing'
import { launchSuccess } from '../../lib/animation/ui'
import { formatFull } from '../../lib/format'
import { Stamp } from '../UI/Stamp'
import { inkify } from '../../lib/map/palette'
import { CountUp } from '../UI/CountUp'

/**
 * The moment after a claim lands:
 * camera settles on the state → ink spreads through it → the ticker appears →
 * the CLAIMED stamp presses down → market cap starts counting → back to the map.
 */
export function LaunchSuccess() {
  const celebration = useApp((s) => s.celebration)
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [phase, setPhase] = useState<'idle' | 'stamp'>('idle')
  const stampRef = useRef<HTMLDivElement>(null)
  const captionRefs = useRef<HTMLElement[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const map = mapRuntime.map
    const territory = mapRuntime.territory
    if (!celebration || !map || !territory) return
    const { token } = celebration
    const info = STATE_BY_ID[token.stateId]

    const el = document.createElement('div')
    el.style.pointerEvents = 'none'
    const marker = new Marker({ element: el, anchor: 'center' }).setLngLat(info.label).addTo(map)
    setHost(el)
    setPhase('idle')

    const timers: ReturnType<typeof setTimeout>[] = []
    const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))

    territory.mute(token.stateId, true)
    later(250, () => focusState(map, token.stateId, 1100))
    later(1250, () => {
      const summary = appStore.get().summaries[token.stateId]
      territory.claim(token.stateId, summary)
      appStore.set({ claiming: null })
    })
    later(2500, () => setPhase('stamp'))
    later(7600, () => {
      if (wrapRef.current)
        gsap.to(wrapRef.current, {
          autoAlpha: 0,
          y: -8,
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => appStore.set({ celebration: null }),
        })
      else appStore.set({ celebration: null })
    })

    return () => {
      territory.mute(token.stateId, false)
      timers.forEach(clearTimeout)
      marker.remove()
      setHost(null)
      setPhase('idle')
    }
  }, [celebration])

  useEffect(() => {
    if (phase !== 'stamp' || !stampRef.current) return
    const tl = launchSuccess(stampRef.current, captionRefs.current.filter(Boolean))
    return () => {
      tl.kill()
    }
  }, [phase])

  if (!celebration || !host) return null
  const { token } = celebration
  const info = STATE_BY_ID[token.stateId]
  const cap = (el: HTMLElement | null, i: number) => {
    if (el) captionRefs.current[i] = el
  }

  return createPortal(
    <div ref={wrapRef} className="flex translate-y-[24px] flex-col items-center text-center">
      {phase === 'stamp' && (
        <>
          <div
            ref={(el) => cap(el, 0)}
            className="display text-[14px] tracking-[0.34em] text-ink uppercase opacity-0"
            style={{ textShadow: '0 0 10px rgb(236 227 209 / 0.95)' }}
          >
            {info.name}
          </div>
          <div
            ref={(el) => cap(el, 1)}
            className="numeric mt-1 text-[34px] leading-none font-semibold opacity-0"
            style={{ color: inkify(token.color, 0.2), textShadow: '0 0 14px rgb(236 227 209 / 0.95), 0 0 2px rgb(236 227 209)' }}
          >
            ${token.symbol}
          </div>
          <div className="mt-3">
            <Stamp ref={stampRef} sub="By right of meme" className="opacity-0" />
          </div>
          <div ref={(el) => cap(el, 2)} className="mt-3 opacity-0">
            <CountUp value={token.marketCap} from={0} duration={2.4} format={formatFull} className="numeric text-[13px] text-ink" />
            <div className="label mt-0.5 text-[8px] text-ink/55">Market cap</div>
          </div>
        </>
      )}
    </div>,
    host,
  )
}
