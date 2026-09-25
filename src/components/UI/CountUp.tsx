import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/animation/easing'

/** Tweens a number in place. Writes text directly; no re-render per frame. */
export function CountUp({
  value,
  format,
  duration = 1.2,
  from,
  className,
}: {
  value: number
  format: (n: number) => string
  duration?: number
  from?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const current = useRef({ v: from ?? value })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tween = gsap.to(current.current, {
      v: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = format(current.current.v)
      },
    })
    return () => {
      tween.kill()
    }
  }, [value, duration, format])

  return (
    <span ref={ref} className={className}>
      {format(current.current.v)}
    </span>
  )
}
