import { forwardRef } from 'react'

/** An official-looking rubber stamp. Slightly rotated, slightly uneven ink. */
export const Stamp = forwardRef<HTMLDivElement, { label?: string; sub?: string; color?: string; className?: string }>(
  function Stamp({ label = 'Claimed', sub, color = '#843F34', className = '' }, ref) {
    return (
      <div ref={ref} className={`relative inline-block -rotate-[7deg] mix-blend-multiply ${className}`} style={{ color }}>
        <svg className="absolute h-0 w-0">
          <filter id="stamp-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.4" />
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
        </svg>
        <div
          className="border-[3px] border-current bg-[rgb(236_227_209/0.35)] px-4 py-2 text-center"
          style={{ filter: 'url(#stamp-rough)' }}
        >
          <div className="absolute inset-[3px] border border-current opacity-80" />
          <div className="display text-[26px] leading-none font-bold tracking-[0.3em] uppercase">{label}</div>
          {sub && <div className="label mt-1 text-[8px] tracking-[0.3em]">{sub}</div>}
        </div>
      </div>
    )
  },
)
