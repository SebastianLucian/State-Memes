import type { Map as MLMap } from 'maplibre-gl'

/**
 * Tiny procedural textures, drawn once on a canvas and handed to MapLibre as
 * fill patterns. Seeded so the map looks the same on every visit.
 */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const PR = 2 // device-pixel density of the pattern bitmaps

function canvas(size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size * PR
  const ctx = c.getContext('2d')!
  ctx.scale(PR, PR)
  return { c, ctx }
}

function stipple() {
  const size = 48
  const { c, ctx } = canvas(size)
  const r = rng(11)
  ctx.fillStyle = 'rgba(23,22,20,0.85)'
  for (let i = 0; i < 70; i++) {
    const x = r() * size
    const y = r() * size
    const rad = 0.35 + r() * 0.55
    for (const [ox, oy] of [
      [0, 0],
      [size, 0],
      [-size, 0],
      [0, size],
      [0, -size],
    ]) {
      ctx.beginPath()
      ctx.arc(x + ox, y + oy, rad, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return c
}

function hatch() {
  const size = 16
  const { c, ctx } = canvas(size)
  ctx.strokeStyle = 'rgba(23,22,20,0.8)'
  ctx.lineWidth = 0.6
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath()
    ctx.moveTo(k * size, size)
    ctx.lineTo(k * size + size, 0)
    ctx.stroke()
  }
  return c
}

function grain() {
  const size = 96
  const { c, ctx } = canvas(size)
  const r = rng(29)
  for (let i = 0; i < 900; i++) {
    const a = r() * 0.07
    ctx.fillStyle = r() > 0.5 ? `rgba(103,74,52,${a})` : `rgba(255,250,238,${a * 1.4})`
    ctx.fillRect(r() * size, r() * size, 0.6 + r(), 0.6 + r())
  }
  // A few fibres.
  ctx.lineWidth = 0.35
  for (let i = 0; i < 14; i++) {
    ctx.strokeStyle = `rgba(103,74,52,${0.05 + r() * 0.06})`
    const x = r() * size
    const y = r() * size
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + (r() - 0.5) * 10, y + (r() - 0.5) * 10, x + (r() - 0.5) * 18, y + (r() - 0.5) * 18)
    ctx.stroke()
  }
  return c
}

const PATTERNS: Record<string, () => HTMLCanvasElement> = {
  stipple,
  hatch,
  'paper-grain': grain,
}

export function registerPatterns(map: MLMap) {
  const add = (id: string) => {
    if (map.hasImage(id) || !PATTERNS[id]) return
    const c = PATTERNS[id]()
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height)
    map.addImage(id, data, { pixelRatio: PR })
  }
  Object.keys(PATTERNS).forEach(add)
  map.on('styleimagemissing', (e) => add(e.id))
}
