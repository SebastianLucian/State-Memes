import { gsap, EASE, DUR } from './easing'

const isMobile = () => window.innerWidth < 768

export function openStatePanel(panel: HTMLElement) {
  const items = panel.querySelectorAll('[data-stagger]')
  const tl = gsap.timeline()
  if (isMobile()) {
    tl.fromTo(panel, { yPercent: 100, autoAlpha: 1 }, { yPercent: 0, duration: DUR.ui + 0.08, ease: EASE.out })
  } else {
    tl.fromTo(
      panel,
      { autoAlpha: 0, x: 28, rotate: 0.6 },
      { autoAlpha: 1, x: 0, rotate: 0, duration: DUR.ui + 0.1, ease: EASE.out },
    )
  }
  tl.fromTo(items, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.045, ease: EASE.out }, 0.12)
  return tl
}

export function closeStatePanel(panel: HTMLElement) {
  return isMobile()
    ? gsap.to(panel, { yPercent: 100, duration: 0.32, ease: EASE.in })
    : gsap.to(panel, { autoAlpha: 0, x: 20, duration: 0.28, ease: EASE.in })
}

/** Content swap when selection moves between states without closing. */
export function refreshStatePanel(panel: HTMLElement) {
  const items = panel.querySelectorAll('[data-stagger]')
  return gsap.fromTo(items, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.03, ease: EASE.out })
}

export function openLaunchModal(backdrop: HTMLElement, sheet: HTMLElement) {
  const tl = gsap.timeline()
  tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.ui, ease: 'power1.out' })
  if (isMobile()) tl.fromTo(sheet, { yPercent: 100 }, { yPercent: 0, duration: DUR.ui + 0.08, ease: EASE.out }, 0)
  else
    tl.fromTo(
      sheet,
      { autoAlpha: 0, y: 18, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: DUR.ui, ease: EASE.out },
      0.05,
    )
  return tl
}

export function closeLaunchModal(backdrop: HTMLElement, sheet: HTMLElement) {
  const tl = gsap.timeline()
  if (isMobile()) tl.to(sheet, { yPercent: 100, duration: 0.32, ease: EASE.in })
  else tl.to(sheet, { autoAlpha: 0, y: 12, duration: 0.28, ease: EASE.in })
  tl.to(backdrop, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 0.05)
  return tl
}

/** Step change inside the launch sheet. */
export function swapStep(el: HTMLElement) {
  return gsap.fromTo(
    el.querySelectorAll('[data-stagger]'),
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.05, ease: EASE.out },
  )
}

/** Waiting on the wallet: a slow ink line drawing across, then back. Calm. */
export function launchPending(line: HTMLElement) {
  return gsap.fromTo(
    line,
    { scaleX: 0, transformOrigin: '0% 50%' },
    { scaleX: 1, duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true },
  )
}

/** The CLAIMED stamp lands: quick press, tiny overshoot in scale only, ink settles. */
export function launchSuccess(stamp: HTMLElement, caption: HTMLElement[]) {
  const tl = gsap.timeline()
  tl.fromTo(
    stamp,
    { autoAlpha: 0, scale: 1.9, rotate: -14 },
    { autoAlpha: 1, scale: 1, rotate: -7, duration: 0.32, ease: 'power4.in' },
  )
    .to(stamp, { scale: 1.035, duration: 0.07, ease: 'power1.out' })
    .to(stamp, { scale: 1, duration: 0.3, ease: EASE.out })
    .fromTo(caption, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: EASE.out }, '-=0.5')
  return tl
}
