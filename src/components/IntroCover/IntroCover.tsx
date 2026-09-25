import { useEffect } from 'react'
import { usePeelInteraction } from '../../hooks/usePeelInteraction'
import { CoverContent } from './CoverContent'
import { PeelInteraction } from './PeelInteraction'

type Props = {
  onCommit: () => void
  onOpened: () => void
}

/**
 * The opening sheet. It lies over the live map; the user peels it away from
 * the top-right corner.
 */
export function IntroCover({ onCommit, onOpened }: Props) {
  const peel = usePeelInteraction({ onCommit, onOpened })
  const { refs, autoPeel } = peel

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') autoPeel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [autoPeel])

  return (
    <div
      ref={refs.rootRef}
      className="peel-root fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-label="The Frontier is open. Pull the corner to explore the map."
    >
      {/* Contact shadow on the map, under the paper edge */}
      <div
        ref={refs.groundShadowRef}
        className="pointer-events-none absolute top-0 left-0"
        style={{
          transformOrigin: '0 0',
          background: 'linear-gradient(90deg, rgb(35 24 16 / 0.34), rgb(35 24 16 / 0.12) 35%, rgb(35 24 16 / 0))',
        }}
        aria-hidden
      />

      {/* The sheet, face up */}
      <div ref={refs.frontRef} className="paper absolute inset-0 overflow-hidden will-change-[clip-path]">
        <CoverContent />
        <div
          ref={refs.frontShadeRef}
          className="pointer-events-none absolute top-0 left-0"
          style={{
            transformOrigin: '0 0',
            background: 'linear-gradient(270deg, rgb(45 30 18 / 0.2), rgb(45 30 18 / 0.06) 45%, rgb(45 30 18 / 0))',
          }}
          aria-hidden
        />
      </div>

      <PeelInteraction peel={peel} />
    </div>
  )
}
