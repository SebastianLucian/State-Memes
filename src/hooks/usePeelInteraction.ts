import { useCallback, useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/animation/easing'
import { computePeel, flapTransform, foldFrame, type Vec } from '../lib/animation/peel'
import { snapClosed, snapOpen } from '../lib/animation/cover'

type Options = {
  /** Called the moment the paper commits to leaving (map intro can start). */
  onCommit: () => void
  /** Called once the paper is fully off-screen. */
  onOpened: () => void
}

const SNAP_AT = 0.65

/**
 * Drives the corner peel: pointer tracking, smoothing, geometry, shading and
 * the snap decision. Everything writes straight to the DOM on the GSAP ticker —
 * React never re-renders during a drag.
 */
export function usePeelInteraction({ onCommit, onOpened }: Options) {
  const rootRef = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)
  const frontShadeRef = useRef<HTMLDivElement>(null)
  const flapRef = useRef<HTMLDivElement>(null)
  const flapShadeRef = useRef<HTMLDivElement>(null)
  const groundShadowRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  const cb = useRef({ onCommit, onOpened })
  cb.current = { onCommit, onOpened }

  const s = useRef({
    W: 0,
    H: 0,
    rest: { x: 0, y: 0 } as Vec,
    restSize: 52,
    current: { x: 0, y: 0 } as Vec,
    target: { x: 0, y: 0 } as Vec,
    offset: { x: 0, y: 0 } as Vec,
    lift: { v: 0 },
    dragging: false,
    animating: false,
    committed: false,
    pointerId: -1,
    samples: [] as { x: number; y: number; t: number }[],
    tween: null as gsap.core.Tween | null,
    idle: null as gsap.core.Timeline | null,
    last: '',
  })

  const required = () => {
    const { W, H } = s.current
    return Math.min(Math.hypot(W, H) * 0.62, 980)
  }

  const render = useCallback(() => {
    const st = s.current
    const { W, H, current, lift } = st
    const front = frontRef.current
    const flap = flapRef.current
    if (!front || !flap || W === 0) return

    const key = `${current.x.toFixed(2)},${current.y.toFixed(2)},${lift.v.toFixed(2)}`
    if (key === st.last) return
    st.last = key

    const g = computePeel(W, H, current)
    const L = Math.hypot(W, H) * 1.5
    const progress = Math.min(1, (g.depth * 2) / required())

    front.style.clipPath = g.front
    front.style.visibility = g.gone ? 'hidden' : 'visible'
    flap.style.clipPath = g.cut
    flap.style.transform = flapTransform(g, lift.v * 11)

    // Shadow the lifted flap casts on the paper beneath it.
    const fs = frontShadeRef.current
    if (fs) {
      const w = Math.min(28 + g.depth * 0.55, 180)
      fs.style.width = `${w}px`
      fs.style.height = `${L * 2}px`
      fs.style.transform = foldFrame(g, -w, L)
      fs.style.opacity = String(0.55 + lift.v * 0.45)
    }
    // Curvature highlight along the fold, darkening toward the tip.
    const fls = flapShadeRef.current
    if (fls) {
      fls.style.width = `${Math.max(g.depth * 2.2, 24)}px`
      fls.style.height = `${L * 2}px`
      fls.style.transform = foldFrame(g, 0, L)
    }
    // Contact shadow on the map, right where the paper edge leaves the surface.
    const gs = groundShadowRef.current
    if (gs) {
      const w = Math.min(24 + g.depth * 0.3, 150)
      gs.style.width = `${w}px`
      gs.style.height = `${L * 2}px`
      gs.style.transform = foldFrame(g, 0, L)
      gs.style.opacity = g.gone ? '0' : String(Math.min(1, 0.4 + progress))
    }
    if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - progress * 4))
  }, [])

  const setRest = useCallback((size: number) => {
    const st = s.current
    st.restSize = size
    st.rest = { x: st.W - size, y: size * 0.92 }
  }, [])

  // Measure + resize.
  useEffect(() => {
    const measure = () => {
      const st = s.current
      const el = rootRef.current
      if (!el) return
      const firstTime = st.W === 0
      st.W = el.clientWidth
      st.H = el.clientHeight
      const size = st.W < 640 ? 46 : 58
      setRest(size)
      if (firstTime || (!st.dragging && !st.animating)) {
        st.current = { ...st.rest }
        st.target = { ...st.rest }
      }
      st.last = ''
      render()
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [render, setRest])

  // Smoothing loop: the corner eases toward the pointer, never snaps to it.
  useEffect(() => {
    let lastT = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(64, now - lastT)
      lastT = now
      const st = s.current
      if (st.animating) return
      const goal = st.dragging ? st.target : st.rest
      const k = 1 - Math.exp(-dt / (st.dragging ? 55 : 90))
      st.current.x += (goal.x - st.current.x) * k
      st.current.y += (goal.y - st.current.y) * k
      render()
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [render])

  // A gentle, occasional lift of the dog-ear — an invitation, not a flashing CTA.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const st = s.current
    const proxy = { size: st.restSize }
    const base = st.restSize
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 1.6 })
    tl.to(proxy, {
      size: base + 16,
      duration: 0.9,
      ease: 'sine.inOut',
      onUpdate: () => !st.dragging && setRest(proxy.size),
    }).to(proxy, {
      size: base,
      duration: 1.1,
      ease: 'sine.inOut',
      onUpdate: () => !st.dragging && setRest(proxy.size),
    })
    st.idle = tl
    return () => {
      tl.kill()
    }
  }, [setRest])

  const commitOpen = useCallback(
    (direction?: Vec) => {
      const st = s.current
      if (st.committed) return
      st.committed = true
      st.dragging = false
      st.animating = true
      st.idle?.kill()
      rootRef.current?.classList.remove('is-dragging')

      const { W, H } = st
      const hyp = Math.hypot(W, H)
      const diag = { x: -W / hyp, y: H / hyp }
      let dir = direction ?? diag
      const dl = Math.hypot(dir.x, dir.y) || 1
      dir = { x: dir.x / dl, y: dir.y / dl }
      // Bias toward the diagonal so the sheet always clears the screen.
      const bx = dir.x * 0.45 + diag.x * 0.55
      const by = dir.y * 0.45 + diag.y * 0.55
      const bl = Math.hypot(bx, by)
      const far = { x: W + (bx / bl) * hyp * 2.6, y: (by / bl) * hyp * 2.6 }

      cb.current.onCommit()
      gsap.to(st.lift, { v: 1.4, duration: 0.5, ease: 'power2.out' })
      st.tween = snapOpen(st.current, far, {
        onUpdate: render,
        onComplete: () => cb.current.onOpened(),
      })
    },
    [render],
  )

  const release = useCallback(() => {
    const st = s.current
    if (!st.dragging) return
    st.dragging = false
    rootRef.current?.classList.remove('is-dragging')

    const C = { x: st.W, y: 0 }
    const dist = Math.hypot(st.current.x - C.x, st.current.y - C.y)
    const progress = dist / required()

    // Release velocity (px/ms) from recent samples.
    const now = performance.now()
    const recent = st.samples.filter((p) => now - p.t < 110)
    let vx = 0
    let vy = 0
    if (recent.length >= 2) {
      const a = recent[0]
      const b = recent[recent.length - 1]
      const dt = Math.max(1, b.t - a.t)
      vx = (b.x - a.x) / dt
      vy = (b.y - a.y) / dt
    }
    const away = { x: st.current.x - C.x, y: st.current.y - C.y }
    const awayLen = Math.hypot(away.x, away.y) || 1
    const flick = (vx * away.x + vy * away.y) / awayLen // speed away from the corner

    if (progress >= SNAP_AT || (flick > 0.55 && progress > 0.1)) {
      commitOpen({ x: away.x + vx * 200, y: away.y + vy * 200 })
    } else {
      st.animating = true
      gsap.to(st.lift, { v: 0, duration: 0.5, ease: 'power2.out' })
      st.tween = snapClosed(st.current, st.rest, {
        onUpdate: render,
        onComplete: () => {
          st.animating = false
        },
      })
    }
  }, [commitOpen, render])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const st = s.current
    if (st.committed) return
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    st.tween?.kill()
    st.animating = false
    st.dragging = true
    st.pointerId = e.pointerId
    st.offset = { x: st.current.x - e.clientX, y: st.current.y - e.clientY }
    st.target = { ...st.current }
    st.samples = [{ x: e.clientX, y: e.clientY, t: performance.now() }]
    rootRef.current?.classList.add('is-dragging')
    gsap.to(st.lift, { v: 1, duration: 0.3, ease: 'power2.out' })
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const st = s.current
      if (!st.dragging || e.pointerId !== st.pointerId) return
      const x = Math.min(st.W - 2, e.clientX + st.offset.x)
      const y = Math.max(2, e.clientY + st.offset.y)
      st.target = { x, y }
      const t = performance.now()
      st.samples.push({ x: e.clientX, y: e.clientY, t })
      if (st.samples.length > 12) st.samples.shift()
      // Forgiving: once far enough, commit even before release.
      const dist = Math.hypot(x - st.W, y)
      if (dist > required() * 1.15) commitOpen({ x: x - st.W, y })
    },
    [commitOpen],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId !== s.current.pointerId) return
      release()
    },
    [release],
  )

  // A release anywhere counts — even if pointer capture was lost along the way.
  useEffect(() => {
    const up = (e: PointerEvent) => {
      if (s.current.dragging && e.pointerId === s.current.pointerId) release()
    }
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [release])

  /** Keyboard / click path: peel it for them, with the same physics. */
  const autoPeel = useCallback(() => {
    const st = s.current
    if (st.committed) return
    st.idle?.kill()
    st.animating = true
    gsap.to(st.lift, { v: 1, duration: 0.3 })
    const mid = { x: st.W * 0.62, y: st.H * 0.34 }
    st.tween = gsap.to(st.current, {
      x: mid.x,
      y: mid.y,
      duration: 0.55,
      ease: 'power2.in',
      onUpdate: render,
      onComplete: () => commitOpen({ x: mid.x - st.W, y: mid.y }),
    })
  }, [commitOpen, render])

  return {
    refs: { rootRef, frontRef, frontShadeRef, flapRef, flapShadeRef, groundShadowRef, hintRef },
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
    autoPeel,
  }
}
