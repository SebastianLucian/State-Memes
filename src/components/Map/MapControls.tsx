import { useEffect, useRef } from 'react'
import { mapRuntime } from '../../lib/map/runtime'
import { flyToRegion } from '../../lib/map/camera'
import { pointer } from '../../lib/map/pointer'
import { appStore } from '../../lib/store/appStore'

function fmtCoord(v: number, pos: string, neg: string) {
  const a = Math.abs(v)
  const d = Math.floor(a)
  const m = Math.floor((a - d) * 60)
  return `${d}°${String(m).padStart(2, '0')}′${v >= 0 ? pos : neg}`
}

/** Atlas furniture: north arrow, scale, insets, coordinates, attribution. */
export function MapControls() {
  const coordRef = useRef<HTMLSpanElement>(null)
  const scaleBarRef = useRef<HTMLDivElement>(null)
  const scaleLabelRef = useRef<HTMLSpanElement>(null)

  // Live cursor coordinates — written straight to the DOM.
  useEffect(
    () =>
      pointer.on((p) => {
        if (coordRef.current) coordRef.current.textContent = `${fmtCoord(p.lat, 'N', 'S')}  ${fmtCoord(p.lng, 'E', 'W')}`
      }),
    [],
  )

  // Scale bar that follows the camera.
  useEffect(() => {
    let raf = 0
    let bound = false
    const update = () => {
      const map = mapRuntime.map
      if (!map) return
      const y = map.getContainer().clientHeight / 2
      const a = map.unproject([0, y])
      const b = map.unproject([100, y])
      const miles = a.distanceTo(b) / 1609.344
      const nice = [5, 10, 25, 50, 100, 200, 250, 500, 1000].reduce((best, n) => (n <= miles ? n : best), 5)
      const px = (nice / miles) * 100
      if (scaleBarRef.current) scaleBarRef.current.style.width = `${px}px`
      if (scaleLabelRef.current) scaleLabelRef.current.textContent = `${nice} mi`
    }
    const onMove = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    const tryBind = () => {
      if (bound || !mapRuntime.map) return
      bound = true
      mapRuntime.map.on('move', onMove)
      update()
    }
    const id = setInterval(tryBind, 250)
    tryBind()
    return () => {
      clearInterval(id)
      cancelAnimationFrame(raf)
      mapRuntime.map?.off('move', onMove)
    }
  }, [])

  const go = (r: 'conus' | 'AK' | 'HI') => {
    if (!mapRuntime.map) return
    appStore.set({ selectedId: null })
    // Clearing selection resets to home; for insets, fly after that settles in.
    if (r !== 'conus') requestAnimationFrame(() => mapRuntime.map && flyToRegion(mapRuntime.map, r))
  }

  const zoom = (d: number) => mapRuntime.map?.easeTo({ zoom: mapRuntime.map.getZoom() + d, duration: 400 })

  return (
    <>
      {/* Bottom-left: insets + attribution */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex flex-col gap-3 sm:bottom-5 sm:left-6">
        <div className="pointer-events-auto flex items-center gap-1.5 max-sm:hidden">
          {(
            [
              ['conus', 'Lower 48'],
              ['AK', 'Alaska'],
              ['HI', 'Hawaii'],
            ] as const
          ).map(([r, label]) => (
            <button
              key={r}
              onClick={() => go(r)}
              className="label border border-ink/25 bg-parchment/70 px-2 py-1 text-[9px] text-ink/65 transition-colors hover:border-ink/60 hover:text-ink"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="label text-[9px] leading-[1.6] tracking-[0.14em] text-ink/45">
          <div className="max-sm:hidden">50 States · One Frontier</div>
          <div className="text-brick/70">Illustrative data · not real tokens</div>
          <div className="pointer-events-auto normal-case tracking-[0.04em]">
            <a href="https://openfreemap.org" target="_blank" rel="noreferrer" className="hover:text-ink">
              OpenFreeMap
            </a>{' '}
            ©{' '}
            <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer" className="hover:text-ink">
              OpenMapTiles
            </a>
            <br />
            Data from{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:text-ink">
              OpenStreetMap
            </a>
          </div>
        </div>
      </div>

      {/* Bottom-right: north arrow, scale, coordinates, zoom */}
      <div className="pointer-events-none absolute right-3 bottom-3 z-20 flex items-end gap-4 sm:right-6 sm:bottom-5">
        <div className="flex flex-col items-end gap-2 max-sm:hidden">
          <span ref={coordRef} className="numeric text-[9.5px] tracking-[0.1em] text-ink/45">
            39°50′N 98°35′W
          </span>
          <div className="flex flex-col items-end gap-1">
            <span ref={scaleLabelRef} className="numeric text-[9px] tracking-[0.1em] text-ink/50">
              —
            </span>
            <div ref={scaleBarRef} className="h-[5px] border-x border-b border-ink/50" style={{ width: 80 }}>
              <div className="h-full w-1/2 border-r border-ink/40" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="pointer-events-auto flex flex-col border border-ink/25 bg-parchment/70 max-sm:hidden">
            <button onClick={() => zoom(0.75)} className="h-7 w-7 text-ink/60 hover:text-ink" aria-label="Zoom in">
              +
            </button>
            <span className="h-px bg-ink/20" />
            <button onClick={() => zoom(-0.75)} className="h-7 w-7 text-ink/60 hover:text-ink" aria-label="Zoom out">
              −
            </button>
          </div>
          <NorthArrow />
        </div>
      </div>
    </>
  )
}

function NorthArrow() {
  return (
    <svg width="22" height="38" viewBox="0 0 22 38" className="text-ink/60" aria-label="North">
      <text x="11" y="9" textAnchor="middle" fontSize="9" fontFamily="var(--font-display)" fill="currentColor">
        N
      </text>
      <path d="M11 13 L15 30 L11 26.5 L7 30 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M11 13 L11 26.5 L7 30 Z" fill="currentColor" />
      <line x1="11" y1="30" x2="11" y2="37" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  )
}
