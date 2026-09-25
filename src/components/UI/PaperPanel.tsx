import { forwardRef, type HTMLAttributes } from 'react'

/** An archival card: thin border, inner rule, paper surface, soft shadow. */
export const PaperPanel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { corners?: boolean }>(
  function PaperPanel({ className = '', children, corners = true, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={`card-paper relative border border-ink/50 shadow-[0_18px_40px_-18px_rgb(40_28_18/0.45),0_2px_6px_-2px_rgb(40_28_18/0.2)] ${className}`}
        {...rest}
      >
        <div className="pointer-events-none absolute inset-[3px] border border-ink/12" />
        {corners && (
          <>
            <Corner className="top-[6px] left-[6px]" />
            <Corner className="top-[6px] right-[6px] rotate-90" />
            <Corner className="right-[6px] bottom-[6px] rotate-180" />
            <Corner className="bottom-[6px] left-[6px] -rotate-90" />
          </>
        )}
        {children}
      </div>
    )
  },
)

function Corner({ className }: { className: string }) {
  return (
    <svg width="7" height="7" viewBox="0 0 7 7" className={`pointer-events-none absolute text-ink/40 ${className}`}>
      <path d="M0 7 V0 H7" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  )
}
