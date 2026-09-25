import { useCallback, useEffect, useRef, useState } from 'react'
import { WalletProviders } from './lib/solana/WalletProviders'
import { USMap } from './components/Map/USMap'
import { MapControls } from './components/Map/MapControls'
import { ClaimPrompt, Dispatch } from './components/Map/MapOverlays'
import { Header } from './components/Header/Header'
import { WalletModal } from './components/Header/WalletModal'
import { StateTooltip } from './components/State/StateTooltip'
import { StatePanel } from './components/State/StatePanel'
import { LaunchModal, PickingBanner } from './components/Launch/LaunchModal'
import { LaunchSuccess } from './components/Launch/LaunchSuccess'
import { IntroCover } from './components/IntroCover/IntroCover'
import { appStore } from './lib/store/appStore'
import { introReveal } from './lib/animation/cover'
import { useTokenData } from './hooks/useTokenData'

const skipIntro = typeof location !== 'undefined' && location.hash === '#map'

function Frontier() {
  useTokenData()
  const [coverGone, setCoverGone] = useState(skipIntro)
  const headerRef = useRef<HTMLElement>(null)
  const uiRef = useRef<HTMLDivElement>(null)

  const onCommit = useCallback(() => {
    appStore.set({ revealed: true })
    introReveal([headerRef.current, uiRef.current].filter(Boolean) as Element[])
  }, [])

  // Deep link straight to the map: /#map
  useEffect(() => {
    if (skipIntro) onCommit()
  }, [onCommit])

  return (
    <main className="fixed inset-0 overflow-hidden bg-parchment">
      <USMap />
      <div className="vignette" />

      <Header ref={headerRef} />
      <div ref={uiRef} className="opacity-0">
        <MapControls />
        <ClaimPrompt />
        <Dispatch />
      </div>

      <StateTooltip />
      <StatePanel />
      <PickingBanner />
      <LaunchModal />
      <LaunchSuccess />
      <WalletModal />

      {!coverGone && <IntroCover onCommit={onCommit} onOpened={() => setCoverGone(true)} />}
      <div className="grain" />
    </main>
  )
}

export default function App() {
  return (
    <WalletProviders>
      <Frontier />
    </WalletProviders>
  )
}
