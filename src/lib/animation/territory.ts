import { gsap, EASE, prefersReducedMotion } from './easing'

export type TerritoryVisual = {
  r: number
  g: number
  b: number
  wash: number
  stipple: number
  hatch: number
  contour: number
  bleed: number
  tick: number
}

export type TerritoryTarget = Pick<TerritoryVisual, 'wash' | 'stipple' | 'hatch' | 'contour'> & {
  r: number
  g: number
  b: number
}

type Apply = () => void

const instant = () => prefersReducedMotion()

/** Dominance drifted: the ink slowly thickens or thins. Calm, never flashy. */
export function territoryShift(v: TerritoryVisual, to: TerritoryTarget, apply: Apply) {
  gsap.killTweensOf(v)
  return gsap.to(v, { ...to, duration: instant() ? 0 : 2.6, ease: EASE.ink, onUpdate: apply })
}

/**
 * A state is claimed for the first time: ink seeps in from the border,
 * then settles into a wash and a stipple.
 */
export function territoryExpand(v: TerritoryVisual, to: TerritoryTarget, apply: Apply, opts: { delay?: number } = {}) {
  gsap.killTweensOf(v)
  Object.assign(v, { r: to.r, g: to.g, b: to.b, wash: 0, stipple: 0, hatch: 0, contour: 0, bleed: 0, tick: 0 })
  apply()
  if (instant()) {
    Object.assign(v, to, { tick: 1 })
    apply()
    return gsap.timeline()
  }
  const tl = gsap.timeline({ delay: opts.delay ?? 0, onUpdate: apply })
  tl.to(v, { contour: Math.min(1, to.contour + 0.35), duration: 0.5, ease: 'power2.out' })
    .to(v, { bleed: 1, duration: 1.3, ease: EASE.ink }, 0.1)
    .to(v, { wash: to.wash, duration: 1.8, ease: EASE.ink }, 0.45)
    .to(v, { stipple: to.stipple, hatch: to.hatch, duration: 1.6, ease: EASE.ink }, 0.9)
    .to(v, { bleed: 0, contour: to.contour, duration: 1.4, ease: 'power2.inOut' }, 1.5)
    .to(v, { tick: 1, duration: 0.8, ease: 'power2.out' }, 1.3)
  return tl
}

/**
 * Leadership changes hands. The old ink recedes into a contested hatch,
 * the new colour washes over, and the border re-inks itself.
 */
export function territoryChange(v: TerritoryVisual, to: TerritoryTarget, apply: Apply, onSwapLabel: () => void) {
  gsap.killTweensOf(v)
  if (instant()) {
    Object.assign(v, to, { tick: 1, bleed: 0 })
    onSwapLabel()
    apply()
    return gsap.timeline()
  }
  const tl = gsap.timeline({ onUpdate: apply })
  tl.to(v, { wash: v.wash * 0.35, stipple: v.stipple * 0.3, hatch: 0.32, tick: 0, duration: 1.1, ease: 'power2.inOut' })
    .add(onSwapLabel, 1.1)
    .to(v, { r: to.r, g: to.g, b: to.b, duration: 1.6, ease: 'sine.inOut' }, 0.6)
    .to(v, { bleed: 0.7, contour: Math.min(1, to.contour + 0.3), duration: 1.0, ease: EASE.ink }, 1.1)
    .to(v, { wash: to.wash, duration: 2.0, ease: EASE.ink }, 1.4)
    .to(v, { stipple: to.stipple, hatch: to.hatch, duration: 1.8, ease: EASE.ink }, 1.8)
    .to(v, { bleed: 0, contour: to.contour, duration: 1.3, ease: 'power2.inOut' }, 2.2)
    .to(v, { tick: 1, duration: 0.8, ease: 'power2.out' }, 1.5)
  return tl
}

/** Hover response on the map — micro timing. */
export function hoverState(v: { hover: number }, on: boolean, apply: Apply) {
  return gsap.to(v, { hover: on ? 1 : 0, duration: on ? 0.18 : 0.32, ease: 'power2.out', overwrite: 'auto', onUpdate: apply })
}

/** Selection: the chosen state inks its border; the rest recede. */
export function selectState(v: { sel: number; dim: number }, selected: boolean, anySelected: boolean, apply: Apply) {
  return gsap.to(v, {
    overwrite: 'auto',
    sel: selected ? 1 : 0,
    dim: anySelected && !selected ? 1 : 0,
    duration: 0.6,
    ease: 'power2.out',
    onUpdate: apply,
  })
}
