/**
 * Page-peel geometry.
 *
 * The paper is the rectangle [0,W]×[0,H]. Its top-right corner C=(W,0) has been
 * dragged to P. The fold line is the perpendicular bisector of C→P. Everything
 * on the corner side of the fold is flipped over it (a 180° rotation about the
 * fold axis) — that's the flap. What remains is still lying flat.
 */
export type Vec = { x: number; y: number }

export type PeelGeometry = {
  /** Remaining flat paper, as a CSS polygon() */
  front: string
  /** The lifted region in paper coordinates (before the flip), as a CSS polygon() */
  cut: string
  /** Fold midpoint */
  m: Vec
  /** Unit normal pointing from the fold toward the corner */
  n: Vec
  /** Angle of the normal, degrees */
  normalDeg: number
  /** Half the distance C→P: how far the fold has travelled from the corner */
  depth: number
  /** True when no paper remains flat */
  gone: boolean
}

type Pt = [number, number]

function clipHalfPlane(poly: Pt[], keep: (p: Pt) => number): Pt[] {
  // Sutherland–Hodgman against a single plane; keep where keep(p) >= 0.
  const out: Pt[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const da = keep(a)
    const db = keep(b)
    if (da >= 0) out.push(a)
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db)
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  }
  return out
}

const toPolygon = (pts: Pt[]) =>
  pts.length < 3
    ? 'polygon(0 0, 0 0, 0 0)'
    : `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(', ')})`

export function computePeel(W: number, H: number, P: Vec): PeelGeometry {
  const C = { x: W, y: 0 }
  let dx = C.x - P.x
  let dy = C.y - P.y
  let len = Math.hypot(dx, dy)
  if (len < 0.001) {
    dx = 1
    dy = -1
    len = Math.SQRT2 * 0.001
  }
  const n = { x: dx / len, y: dy / len }
  const m = { x: (C.x + P.x) / 2, y: (C.y + P.y) / 2 }
  const side = (p: Pt) => (p[0] - m.x) * n.x + (p[1] - m.y) * n.y

  const rect: Pt[] = [
    [0, 0],
    [W, 0],
    [W, H],
    [0, H],
  ]
  const frontPts = clipHalfPlane(rect, (p) => -side(p))
  const cutPts = clipHalfPlane(rect, side)

  return {
    front: toPolygon(frontPts),
    cut: toPolygon(cutPts),
    m,
    n,
    normalDeg: (Math.atan2(n.y, n.x) * 180) / Math.PI,
    depth: len / 2,
    gone: frontPts.length < 3,
  }
}

/**
 * Transform that flips the flap over the fold axis. `lift` (degrees) keeps it
 * from lying perfectly flat, so perspective gives it depth while dragging.
 */
export function flapTransform(g: PeelGeometry, lift: number) {
  const axisDeg = g.normalDeg + 90
  const { x, y } = g.m
  return `translate3d(${x}px, ${y}px, 0) rotate(${axisDeg}deg) rotateX(${180 - lift}deg) rotate(${-axisDeg}deg) translate3d(${-x}px, ${-y}px, 0)`
}

/** Places an element's origin on the fold line, x-axis pointing along the normal. */
export function foldFrame(g: PeelGeometry, offsetX: number, halfLength: number) {
  return `translate3d(${g.m.x}px, ${g.m.y}px, 0) rotate(${g.normalDeg}deg) translate3d(${offsetX}px, ${-halfLength}px, 0)`
}
