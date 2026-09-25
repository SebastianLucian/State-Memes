import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

/** One family of physical-feeling eases. No bounce. */
export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  in: 'power2.in',
  // Settles like paper coming to rest: quick departure, long soft landing.
  paper: CustomEase.create('paper', 'M0,0 C0.16,0.62 0.3,0.94 1,1'),
  // Slow ink bleed.
  ink: CustomEase.create('ink', 'M0,0 C0.3,0 0.25,1 1,1'),
}

/** Durations in seconds. */
export const DUR = {
  micro: 0.2,
  ui: 0.42,
  map: 0.8,
  hero: 1.1,
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap }
