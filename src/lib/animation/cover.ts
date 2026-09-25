import { gsap, EASE, DUR } from './easing'
import type { Vec } from './peel'

/** Animate the peel point off the paper entirely. */
export function snapOpen(point: Vec, target: Vec, opts: { onUpdate: () => void; onComplete: () => void }) {
  return gsap.to(point, {
    x: target.x,
    y: target.y,
    duration: DUR.hero,
    ease: 'power2.inOut',
    onUpdate: opts.onUpdate,
    onComplete: opts.onComplete,
  })
}

/** Return the peel point to the resting dog-ear. */
export function snapClosed(point: Vec, rest: Vec, opts: { onUpdate: () => void; onComplete?: () => void }) {
  return gsap.to(point, {
    x: rest.x,
    y: rest.y,
    duration: 0.75,
    ease: EASE.paper,
    onUpdate: opts.onUpdate,
    onComplete: opts.onComplete,
  })
}

/**
 * The interface arriving after the paper has gone. Opacity only: a transform
 * would turn these wrappers into containing blocks for their fixed children.
 */
export function introReveal(els: Element[]) {
  return gsap.fromTo(
    els,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: DUR.hero, ease: EASE.out, stagger: 0.12, delay: 0.35 },
  )
}
