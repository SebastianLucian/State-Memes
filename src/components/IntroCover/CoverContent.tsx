/** Everything printed on the sheet. Rendered twice: face-up, and as show-through on the flap. */
export function CoverContent() {
  return (
    <div className="absolute inset-0 select-none">
      <Graticule />

      {/* Frame */}
      <div className="absolute inset-3 border border-ink/25 sm:inset-5" />
      <div className="absolute inset-[15px] border border-ink/10 sm:inset-[23px]" />

      {/* Top margin notes */}
      <div className="label absolute top-8 left-8 hidden text-ink/55 sm:block sm:top-10 sm:left-11">
        Sheet No. 01 &nbsp;·&nbsp; The United States
      </div>
      <div className="label absolute top-8 left-1/2 -translate-x-1/2 text-ink/45 max-sm:hidden sm:top-10">Est. 2026</div>

      {/* Title block */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <div className="label mb-7 text-ink/55 sm:mb-9">A Map of Claims &amp; Territories</div>
        <h1 className="display text-[15vw] leading-[0.92] tracking-[0.01em] text-ink uppercase sm:text-[clamp(4rem,9.5vw,9.5rem)]">
          The Frontier
          <br />
          <span className="italic normal-case">is open.</span>
        </h1>

        <div className="mt-9 flex items-center gap-4 text-ink/60 sm:mt-12">
          <span className="h-px w-10 bg-ink/35" />
          <p className="display text-lg italic sm:text-xl">50 states. Infinite possibilities.</p>
          <span className="h-px w-10 bg-ink/35" />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-1.5 text-center sm:bottom-16">
        <div className="label text-[11px] tracking-[0.32em] text-ink/80">Pick your state.</div>
        <div className="label text-[11px] tracking-[0.32em] text-brick">Make your claim.</div>
      </div>

      <div className="numeric absolute bottom-8 left-8 hidden text-[10px] tracking-[0.12em] text-ink/40 sm:block sm:bottom-10 sm:left-11">
        39°50′N &nbsp;98°35′W
      </div>
      <div className="label absolute right-8 bottom-8 hidden text-ink/40 sm:block sm:right-11 sm:bottom-10">
        Scale of Ambition — Unlimited
      </div>
    </div>
  )
}

/** Curved parallels + meridians, like the ghost of a conic projection. */
function Graticule() {
  const lines = []
  for (let i = 0; i < 6; i++) {
    const y = 18 + i * 13
    lines.push(<path key={`p${i}`} d={`M-10,${y + 6} Q50,${y - 6} 110,${y + 6}`} vectorEffect="non-scaling-stroke" />)
  }
  for (let i = 0; i < 9; i++) {
    const x = -10 + i * 15
    lines.push(<path key={`m${i}`} d={`M${50 + (x - 50) * 0.7},-5 L${x},105`} vectorEffect="non-scaling-stroke" />)
  }
  return (
    <svg
      className="absolute inset-0 h-full w-full text-navy"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.09">
        {lines}
      </g>
    </svg>
  )
}
