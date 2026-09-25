import { useEffect, useRef, useState } from 'react'
import { appStore, useApp } from '../../lib/store/appStore'
import { STATES, STATE_BY_ID } from '../../data/states'
import { sanitizeTicker } from '../../lib/format'
import { Button } from '../UI/Button'
import { useLaunch } from '../../hooks/useLaunch'
import { useWallet } from '../../hooks/useWallet'

function suggestTicker(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = sanitizeTicker(words[0])
  return first.length >= 3 || words.length === 1 ? first.slice(0, 6) : sanitizeTicker(words.join('')).slice(0, 6)
}

export function LaunchForm() {
  const launch = useApp((s) => s.launch)
  const { submit } = useLaunch()
  const { connected } = useWallet()
  const [tickerTouched, setTickerTouched] = useState(false)
  const [choosing, setChoosing] = useState(!launch.stateId)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 380)
    return () => clearTimeout(t)
  }, [])

  const update = (patch: Partial<typeof launch>) => appStore.set((s) => ({ launch: { ...s.launch, ...patch, error: null } }))

  const onName = (name: string) => update(tickerTouched ? { name } : { name, symbol: suggestTicker(name) })

  const pickOnMap = () => {
    appStore.set((s) => ({ launch: { ...s.launch, open: false }, picking: true, selectedId: null }))
  }

  const state = launch.stateId ? STATE_BY_ID[launch.stateId] : null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      noValidate
    >
      <header data-stagger className="text-center">
        <div className="label text-[9px] text-ink/50">Form No. 1 · Territorial Claim</div>
        <h2 className="display mt-3 text-[30px] leading-none tracking-[0.06em] uppercase sm:text-[34px]">Make your claim</h2>
        <p className="display mt-3 text-[15px] leading-snug text-ink/65 italic">
          Choose your state.
          <br />
          Give your meme a name.
        </p>
      </header>

      <div data-stagger className="rule-double my-6" />

      <div className="flex flex-col gap-6">
        <label data-stagger className="block">
          <span className="label text-[9px] text-ink/60">Token name</span>
          <input
            ref={nameRef}
            className="field mt-1"
            placeholder="Lone Star"
            value={launch.name}
            maxLength={32}
            onChange={(e) => onName(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <label data-stagger className="block">
          <span className="label text-[9px] text-ink/60">Ticker</span>
          <div className="relative">
            <span className="numeric pointer-events-none absolute top-[11px] left-0 text-[19px] text-ink/35">$</span>
            <input
              className="field numeric mt-1 pl-[18px] !font-sans !text-[22px] font-medium tracking-[0.08em] uppercase"
              placeholder="LONE"
              value={launch.symbol}
              maxLength={8}
              onChange={(e) => {
                setTickerTouched(true)
                update({ symbol: sanitizeTicker(e.target.value) })
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </label>

        <div data-stagger>
          <div className="flex items-baseline justify-between">
            <span className="label text-[9px] text-ink/60">State</span>
            {state && !choosing && (
              <button type="button" className="label text-[9px] text-ink/50 hover:text-ink" onClick={() => setChoosing(true)}>
                Change
              </button>
            )}
          </div>
          {state && !choosing ? (
            <div className="mt-1 flex items-baseline justify-between border-b border-ink/40 pb-2">
              <span className="display text-[24px] tracking-[0.08em] uppercase">{state.name}</span>
              <span className="numeric text-[11px] text-ink/45">{state.id}</span>
            </div>
          ) : (
            <StatePicker
              selected={launch.stateId}
              onPick={(id) => {
                update({ stateId: id })
                setChoosing(false)
              }}
              onPickOnMap={pickOnMap}
            />
          )}
        </div>
      </div>

      <div data-stagger className="mt-7">
        {launch.error && <p className="label mb-3 text-center text-[9.5px] text-brick">{launch.error}</p>}
        <Button type="submit" className="w-full">
          Make claim
        </Button>
        {!connected && (
          <p className="label mt-3 text-center text-[8.5px] text-ink/45">You’ll connect a wallet to sign</p>
        )}
      </div>
    </form>
  )
}

function StatePicker({
  selected,
  onPick,
  onPickOnMap,
}: {
  selected: string | null
  onPick: (id: string) => void
  onPickOnMap: () => void
}) {
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onPickOnMap}
        className="btn-line mb-3 h-9 w-full text-[9.5px]"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <path d="M6 0 V3 M6 9 V12 M0 6 H3 M9 6 H12" stroke="currentColor" strokeWidth="0.9" />
        </svg>
        Select on the map
      </button>
      <div className="label mb-2 text-center text-[8.5px] text-ink/40">or choose below</div>
      <div className="grid max-h-[150px] grid-cols-6 gap-px overflow-y-auto border border-ink/15 bg-ink/15 sm:grid-cols-8">
        {STATES.map((s) => (
          <button
            type="button"
            key={s.id}
            title={s.name}
            onClick={() => onPick(s.id)}
            className={`numeric h-8 text-[11px] tracking-[0.06em] transition-colors ${
              selected === s.id ? 'bg-ink text-parchment' : 'bg-[#ece3d1] text-ink/70 hover:bg-parchment hover:text-ink'
            }`}
          >
            {s.id}
          </button>
        ))}
      </div>
    </div>
  )
}
