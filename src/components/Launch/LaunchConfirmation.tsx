import { useEffect, useRef } from 'react'
import { appStore, useApp } from '../../lib/store/appStore'
import { STATE_BY_ID } from '../../data/states'
import { sanitizeTicker } from '../../lib/format'
import { launchPending } from '../../lib/animation/ui'
import { Button } from '../UI/Button'
import { useLaunch } from '../../hooks/useLaunch'
import { useWallet } from '../../hooks/useWallet'

export function LaunchConfirmation() {
  const launch = useApp((s) => s.launch)
  const { confirm } = useLaunch()
  const { short, walletName } = useWallet()
  const lineRef = useRef<HTMLDivElement>(null)
  const pending = launch.step === 'pending'
  const state = launch.stateId ? STATE_BY_ID[launch.stateId] : null

  useEffect(() => {
    if (!pending || !lineRef.current) return
    const t = launchPending(lineRef.current)
    return () => {
      t.kill()
    }
  }, [pending])

  return (
    <div>
      <header data-stagger className="text-center">
        <div className="label text-[9px] text-ink/50">Your claim</div>
      </header>

      <div data-stagger className="rule-double my-5" />

      <div data-stagger className="py-2 text-center">
        <div className="display text-[30px] leading-none tracking-[0.12em] uppercase">{state?.name}</div>
        <div className="display mt-1.5 text-[13px] text-ink/55 italic">{state?.nickname}</div>
      </div>

      <div data-stagger className="my-6 flex items-center justify-center gap-4">
        <span className="h-px flex-1 bg-ink/25" />
        <span className="numeric text-[34px] leading-none font-semibold tracking-[0.02em] text-navy">
          ${sanitizeTicker(launch.symbol)}
        </span>
        <span className="h-px flex-1 bg-ink/25" />
      </div>
      <div data-stagger className="display -mt-3 text-center text-[14px] text-ink/60 italic">{launch.name}</div>

      <div data-stagger className="rule my-6" />

      <div data-stagger className="text-center">
        {pending ? (
          <div className="py-1">
            <div className="label text-[10px] text-ink/70">Awaiting signature</div>
            <div className="mx-auto mt-3 h-px w-40 bg-ink/15">
              <div ref={lineRef} className="h-full bg-ink" />
            </div>
            <div className="numeric mt-3 text-[10px] text-ink/45">
              {walletName} · {short}
            </div>
          </div>
        ) : (
          <>
            <div className="label mb-4 text-[10px] tracking-[0.3em] text-brick">Ready to launch</div>
            {launch.error && <p className="label mb-3 text-[9.5px] text-brick">{launch.error}</p>}
            <Button className="w-full" onClick={confirm}>
              Confirm
            </Button>
            <button
              className="label mt-4 text-[9px] text-ink/50 hover:text-ink"
              onClick={() => appStore.set((s) => ({ launch: { ...s.launch, step: 'form', error: null } }))}
            >
              ← Edit claim
            </button>
          </>
        )}
      </div>
    </div>
  )
}
