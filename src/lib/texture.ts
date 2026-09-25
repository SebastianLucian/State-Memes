/**
 * Paper textures, generated once as bitmaps at startup.
 * (SVG turbulence backgrounds look the same but get re-rasterised on every
 * repaint — far too slow under a moving clip-path.)
 */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function make(size: number, draw: (ctx: CanvasRenderingContext2D, r: () => number) => void, seed: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  if (!ctx) return null
  draw(ctx, rng(seed))
  return c.toDataURL('image/png')
}

/** Fine grain: per-pixel speckle in warm ink. */
function noise(ctx: CanvasRenderingContext2D, r: () => number) {
  const { width: w, height: h } = ctx.canvas
  const img = ctx.createImageData(w, h)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = r()
    img.data[i] = 76
    img.data[i + 1] = 60
    img.data[i + 2] = 42
    img.data[i + 3] = v > 0.5 ? Math.round((v - 0.5) * 2 * 34) : 0
  }
  ctx.putImageData(img, 0, 0)
}

/** Paper fibres: long, faint, mostly horizontal strands. */
function fibers(ctx: CanvasRenderingContext2D, r: () => number) {
  const s = ctx.canvas.width
  for (let i = 0; i < 260; i++) {
    const x = r() * s
    const y = r() * s
    const len = 20 + r() * 90
    const a = (r() - 0.5) * 0.5
    ctx.strokeStyle = r() > 0.35 ? `rgba(103,79,52,${0.03 + r() * 0.05})` : `rgba(255,251,240,${0.1 + r() * 0.12})`
    ctx.lineWidth = 0.4 + r() * 0.7
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + len / 2, y + Math.sin(a) * len * 0.5 + (r() - 0.5) * 6, x + Math.cos(a) * len, y + Math.sin(a) * len)
    for (const [dx, dy] of [
      [-s, 0],
      [0, -s],
    ]) {
      ctx.moveTo(x + dx, y + dy)
      ctx.lineTo(x + dx + Math.cos(a) * len, y + dy + Math.sin(a) * len)
    }
    ctx.stroke()
  }
}

/** Uneven fading: soft blotches, drawn small and scaled up by the browser. */
function blotch(ctx: CanvasRenderingContext2D, r: () => number) {
  const s = ctx.canvas.width
  for (let i = 0; i < 26; i++) {
    const x = r() * s
    const y = r() * s
    const rad = s * (0.08 + r() * 0.22)
    const dark = r() > 0.45
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
    g.addColorStop(0, dark ? `rgba(160,120,70,${0.025 + r() * 0.045})` : `rgba(255,251,240,${0.1 + r() * 0.12})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    for (const dx of [-s, 0, s])
      for (const dy of [-s, 0, s]) {
        ctx.save()
        ctx.translate(dx, dy)
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2)
        ctx.restore()
      }
  }
}

export function installPaperTextures() {
  const root = document.documentElement.style
  const set = (name: string, url: string | null) => url && root.setProperty(name, `url(${url})`)
  set('--noise', make(220, noise, 7))
  set('--fibers', make(600, fibers, 13))
  set('--blotch', make(300, blotch, 3))
}
