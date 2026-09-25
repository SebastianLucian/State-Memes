import type { usePeelInteraction } from '../../hooks/usePeelInteraction'
import { CoverContent } from './CoverContent'

type Peel = ReturnType<typeof usePeelInteraction>

/**
 * The physical layers of the peel: the flipped flap (with the sheet's
 * show-through on its back), its shading, and the grab handle.
 */
export function PeelInteraction({ peel }: { peel: Peel }) {
  const { refs, handlers, autoPeel } = peel
  return (
    <>
      {/* The flap: the sheet's back, flipped over the fold. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ perspective: '2200px', filter: 'drop-shadow(-5px 9px 12px rgb(40 28 18 / 0.22))' }}
        aria-hidden
      >
        <div
          ref={refs.flapRef}
          className="paper-back absolute inset-0 overflow-hidden will-change-transform"
          style={{ transformOrigin: '0 0', backfaceVisibility: 'visible' }}
        >
          <div className="absolute inset-0 opacity-[0.07]">
            <CoverContent />
          </div>
          <div
            ref={refs.flapShadeRef}
            className="absolute top-0 left-0"
            style={{
              transformOrigin: '0 0',
              background:
                'linear-gradient(90deg, rgb(255 251 240 / 0.55) 0%, rgb(255 251 240 / 0.12) 9%, rgb(0 0 0 / 0) 30%, rgb(60 40 25 / 0.06) 75%, rgb(60 40 25 / 0.14) 100%)',
            }}
          />
        </div>
      </div>

      {/* Grab zone: generous, and forgiving. */}
      <div
        className="peel-grab absolute top-0 right-0 z-10 h-32 w-32 sm:h-40 sm:w-40"
        {...handlers}
        aria-hidden
        style={{ background: 'transparent' }}
      />

      <div
        ref={refs.hintRef}
        className="pointer-events-none absolute top-[72px] right-6 z-10 flex flex-col items-end gap-2 sm:top-[92px] sm:right-9"
      >
        <button
          type="button"
          onClick={autoPeel}
          className="label pointer-events-auto flex items-center gap-2 text-ink/75 transition-colors hover:text-ink"
        >
          <span className="max-sm:hidden">Pull to explore</span>
          <span className="sm:hidden">Pull the corner</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-brick" aria-hidden>
            <path d="M3 15 L15 3 M15 3 H7 M15 3 V11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </>
  )
}
