/**
 * The animation system. One easing family, four timing tiers
 * (micro 150–250ms · UI 300–500ms · map 500–900ms · hero 700–1200ms).
 */
export { EASE, DUR, gsap, prefersReducedMotion } from './easing'
export { introReveal, snapOpen, snapClosed } from './cover'
/** Peel geometry for a given drag point — the pure core of the cover peel. */
export { computePeel as peelCover, flapTransform, foldFrame } from './peel'
export { hoverState, selectState, territoryExpand, territoryChange, territoryShift } from './territory'
export {
  openStatePanel,
  closeStatePanel,
  refreshStatePanel,
  openLaunchModal,
  closeLaunchModal,
  swapStep,
  launchPending,
  launchSuccess,
} from './ui'
