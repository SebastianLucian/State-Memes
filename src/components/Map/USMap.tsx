import { useEffect, useRef, useState } from 'react'
import { Map as MapLibreMap, setWorkerUrl, type Map as MLMap } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { buildStyle } from '../../lib/map/style'
import { registerPatterns } from '../../lib/map/patterns'
import { CONUS_BOUNDS } from '../../lib/map/geometry'
import { homePadding, resetView } from '../../lib/map/camera'
import { TerritoryController } from '../../lib/map/territory'
import { mapRuntime } from '../../lib/map/runtime'
import { appStore } from '../../lib/store/appStore'
import { StateLayer } from './StateLayer'
import { TerritoryLayer } from './TerritoryLayer'

// Bundle MapLibre's module worker explicitly so it resolves under any bundler setup.
setWorkerUrl(workerUrl)

/**
 * The hero. A MapLibre map styled as a faded road atlas, with the fifty
 * states as interactive territory on top.
 */
export function USMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState<{ map: MLMap; territory: TerritoryController } | null>(null)

  useEffect(() => {
    const container = containerRef.current!
    const map = new MapLibreMap({
      container,
      style: buildStyle(),
      center: [-96, 38.5],
      zoom: 3.4,
      minZoom: 1.6,
      maxZoom: 9,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      renderWorldCopies: false,
      fadeDuration: 250,
    })
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()

    // Frame the Lower 48, a touch closer than home; the reveal settles it into place.
    const frameHome = () => {
      map.resize()
      const cam = map.cameraForBounds(CONUS_BOUNDS, { padding: homePadding() })
      if (cam) map.jumpTo({ center: cam.center, zoom: (cam.zoom ?? 3.4) + (appStore.get().revealed ? 0 : 0.35) })
    }
    frameHome()

    registerPatterns(map)

    let territory: TerritoryController | null = null
    map.on('load', () => {
      frameHome()
      territory = new TerritoryController(map)
      mapRuntime.map = map
      mapRuntime.territory = territory
      setReady({ map, territory })
    })

    const offReveal = appStore.watch(
      (s) => s.revealed,
      (r) => r && resetView(map, 2000),
    )

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(container)

    return () => {
      offReveal()
      ro.disconnect()
      mapRuntime.map = null
      mapRuntime.territory = null
      map.remove()
    }
  }, [])

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" aria-label="Map of the United States" role="application" />
      {ready && (
        <>
          <StateLayer map={ready.map} territory={ready.territory} />
          <TerritoryLayer territory={ready.territory} />
        </>
      )}
    </div>
  )
}
