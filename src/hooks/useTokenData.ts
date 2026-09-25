import { useEffect } from 'react'
import { tokenService } from '../services/tokenLauncher'
import { appStore, buildSummaries } from '../lib/store/appStore'
import { STATE_BY_ID } from '../data/states'
import type { StateToken } from '../services/types'

let dispatchId = 0

function apply(tokens: StateToken[]) {
  const prev = appStore.get().summaries
  const summaries = buildSummaries(tokens)
  // Note leadership changes as a short "dispatch" — the map shows the rest.
  let dispatch = appStore.get().dispatch
  for (const id of Object.keys(summaries)) {
    const a = prev[id]?.leader
    const b = summaries[id].leader
    if (a && b && a.id !== b.id && id !== appStore.get().claiming) {
      dispatch = { id: ++dispatchId, text: `$${b.symbol} takes ${STATE_BY_ID[id].name}` }
    }
  }
  appStore.set({ tokens, summaries, dispatch })
}

/** Loads token data through the service interface and keeps it live. */
export function useTokenData() {
  useEffect(() => {
    let alive = true
    tokenService.getStates().then((states) => {
      if (!alive) return
      apply(states.flatMap((s) => s.tokens))
    })
    const off = tokenService.subscribe((e) => {
      if (e.type === 'update') apply(e.tokens)
      else apply([...appStore.get().tokens, e.token])
    })
    return () => {
      alive = false
      off()
    }
  }, [])
}
