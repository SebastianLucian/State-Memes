import type { Map as MLMap, PaddingOptions } from 'maplibre-gl'
import { CONUS_BOUNDS, stateBounds } from './geometry'

const isMobile = () => window.innerWidth < 768

export function homePadding(): PaddingOptions {
  return isMobile()
    ? { top: 84, bottom: 120, left: 16, right: 16 }
    : { top: 110, bottom: 90, left: 70, right: 70 }
}

function focusPadding(): PaddingOptions {
  const w = window.innerWidth
  const h = window.innerHeight
  return isMobile()
    ? { top: 80, bottom: Math.round(h * 0.52), left: 28, right: 28 }
    : { top: 120, bottom: 90, left: 90, right: Math.min(460, Math.round(w * 0.36)) }
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3)

export function focusState(map: MLMap, id: string, duration = 900) {
  const b = stateBounds(id)
  if (!b) return
  map.fitBounds(b, { padding: focusPadding(), maxZoom: id === 'RI' || id === 'DE' ? 7.2 : 6.2, duration, easing: ease })
}

export function resetView(map: MLMap, duration = 900) {
  map.fitBounds(CONUS_BOUNDS, { padding: homePadding(), duration, easing: ease })
}

export function flyToRegion(map: MLMap, region: 'conus' | 'AK' | 'HI') {
  if (region === 'conus') return resetView(map, 1100)
  const b = stateBounds(region)
  if (b) map.fitBounds(b, { padding: homePadding(), duration: 1100, easing: ease, maxZoom: 6 })
}
