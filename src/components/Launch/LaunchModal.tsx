import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { appStore, useApp } from '../../lib/store/appStore'
import { closeLaunchModal, openLaunchModal, swapStep } from '../../lib/animation/ui'
import { PaperPanel } from '../UI/PaperPanel'
import { LaunchForm } from './LaunchForm'
import { LaunchConfirmation } from './LaunchConfirmation'
import { launchIntent, useLaunch } from '../../hooks/useLaunch'
import { useWallet } from '../../hooks/useWallet'
import { useSheetDrag } from '../State/StatePanel'

/** Minimal centered sheet (bottom sheet on mobile). Form → confirmation → signature. */
export function LaunchModal() {
  const open = useApp((s) => s.launch.open)
  const step = useApp((s) => s.launch.step)
  const [mounted, setMounted] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const tween = useRef<ReturnType<typeof closeLaunchModal> | null>(null)
  const { closeLaunch } = useLaunch()
  const { connected } = useWallet()
  const drag = useSheetDrag(closeLaunch)

  useEffect(() => {
    if (open) {
      tween.current?.kill()
      setMounted(true)
    } else if (mounted && backdropRef.current && sheetRef.current) {
      tween.current?.kill()
      tween.current = closeLaunchModal(backdropRef.current, sheetRef.current).eventCallback('onComplete', () =>
        setMounted(false),
      )
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (open && mounted && backdropRef.current && sheetRef.current) {
      tween.current = openLaunchModal(backdropRef.current, sheetRef.current)
      if (bodyRef.current) swapStep(bodyRef.current)
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  // Step transitions.
  const shownStep = step === 'pending' ? 'confirm' : step
  useLayoutEffect(() => {
    if (mounted && bodyRef.current) swapStep(bodyRef.current)
  }, [shownStep]) // eslint-disable-line react-hooks/exhaustive-deps

  // Form submitted before a wallet was connected: continue once it is.
  useEffect(() => {
    if (connected && launchIntent.advanceOnConnect) {
      launchIntent.advanceOnConnect = false
      const s = appStore.get()
      if (s.launch.open) appStore.set({ launch: { ...s.launch, step: 'confirm', error: null } })
    }
  }, [connected])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !appStore.get().walletModalOpen && closeLaunch()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeLaunch])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[45] flex items-end justify-center md:items-center" role="dialog" aria-modal="true">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[rgb(40_30_20/0.28)] backdrop-blur-[1.5px]"
        onClick={closeLaunch}
      />
      <PaperPanel
        ref={sheetRef}
        className="relative w-full max-w-[440px] px-7 pt-7 pb-8 max-md:max-h-[92dvh] max-md:max-w-none max-md:overflow-y-auto max-md:border-x-0 max-md:border-b-0 max-md:px-6 max-md:pt-3 sm:px-10"
      >
        <div className="-mx-6 mb-3 flex touch-none justify-center pb-1 md:hidden" {...drag}>
          <span className="h-[3px] w-10 bg-ink/25" />
        </div>
        {step !== 'pending' && (
          <button
            onClick={closeLaunch}
            className="label absolute top-4 right-5 p-1 text-[9px] text-ink/45 hover:text-ink max-md:top-5"
            aria-label="Close"
          >
            ✕
          </button>
        )}
        <div ref={bodyRef} key={shownStep}>
          {shownStep === 'form' ? <LaunchForm /> : <LaunchConfirmation />}
        </div>
      </PaperPanel>
    </div>
  )
}

/** Shown while the user picks the launch state directly on the map. */
export function PickingBanner() {
  const picking = useApp((s) => s.picking)
  useEffect(() => {
    if (!picking) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') appStore.set((s) => ({ picking: false, launch: { ...s.launch, open: true } }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [picking])
  if (!picking) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[76px] z-30 flex justify-center px-4 md:top-[84px]">
      <div className="card-paper pointer-events-auto flex items-center gap-4 border border-ink/50 px-5 py-3 shadow-[0_10px_30px_-14px_rgb(40_28_18/0.5)]">
        <span className="h-2 w-2 animate-pulse rotate-45 bg-brick" />
        <span className="label text-[10px] text-ink">Select a state on the map</span>
        <button
          className="label text-[9px] text-ink/50 hover:text-ink"
          onClick={() => appStore.set((s) => ({ picking: false, launch: { ...s.launch, open: true } }))}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
