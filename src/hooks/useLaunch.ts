import { useCallback } from 'react'
import { appStore } from '../lib/store/appStore'
import { launchToken } from '../services/tokenLauncher'
import { sanitizeTicker } from '../lib/format'
import { promptWallet, useWallet } from './useWallet'

export const CONNECT_TO_CLAIM = 'To make your claim'

/** Remembers that the form was submitted before a wallet was connected. */
export const launchIntent = { advanceOnConnect: false }

export function validateClaim(name: string, symbol: string, stateId: string | null) {
  if (name.trim().length < 2) return 'Give your meme a name.'
  if (name.trim().length > 32) return 'Keep the name under 32 characters.'
  const t = sanitizeTicker(symbol)
  if (t.length < 2) return 'A ticker needs at least 2 letters.'
  if (!stateId) return 'Pick a state to claim.'
  const taken = appStore.get().summaries[stateId]?.tokens.some((x) => x.symbol === t)
  if (taken) return `$${t} already stands in this state.`
  return null
}

export function useLaunch() {
  const wallet = useWallet()

  const openLaunch = useCallback((stateId: string | null = null) => {
    const s = appStore.get()
    appStore.set({
      launch: { ...s.launch, open: true, step: 'form', stateId: stateId ?? s.selectedId, error: null },
      picking: false,
    })
  }, [])

  const closeLaunch = useCallback(() => {
    const s = appStore.get()
    if (s.launch.step === 'pending') return
    launchIntent.advanceOnConnect = false
    appStore.set({ launch: { ...s.launch, open: false, step: 'form', error: null } })
  }, [])

  const submit = useCallback(() => {
    const { launch } = appStore.get()
    const error = validateClaim(launch.name, launch.symbol, launch.stateId)
    if (error) return appStore.set({ launch: { ...launch, error } })
    if (!wallet.connected) {
      launchIntent.advanceOnConnect = true
      promptWallet(CONNECT_TO_CLAIM)
      return
    }
    appStore.set({ launch: { ...launch, step: 'confirm', error: null } })
  }, [wallet.connected])

  const confirm = useCallback(async () => {
    const { launch } = appStore.get()
    if (!wallet.address || !launch.stateId) return promptWallet(CONNECT_TO_CLAIM)
    appStore.set({ launch: { ...launch, step: 'pending', error: null }, claiming: launch.stateId })
    try {
      const { token } = await launchToken({
        name: launch.name.trim(),
        symbol: sanitizeTicker(launch.symbol),
        state: launch.stateId,
        wallet: { publicKey: wallet.address, signMessage: wallet.signMessage },
      })
      appStore.set({
        launch: { open: false, step: 'form', stateId: null, name: '', symbol: '', error: null },
        selectedId: token.stateId,
        celebration: { token, key: Date.now() },
      })
      wallet.refreshBalance()
    } catch (err) {
      const msg = err instanceof Error && /reject|declin|denied|cancel/i.test(err.message)
        ? 'Signature declined. Your claim was not made.'
        : 'The claim could not be completed. Try again.'
      appStore.set({ launch: { ...appStore.get().launch, step: 'confirm', error: msg }, claiming: null })
    }
  }, [wallet])

  return { openLaunch, closeLaunch, submit, confirm }
}
