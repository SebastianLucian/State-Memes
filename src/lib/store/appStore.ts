import { createStore } from './createStore'
import { STATES } from '../../data/states'
import { summarize } from '../../services/summaries'
import type { StateSummary, StateToken } from '../../services/types'

export type LaunchStep = 'form' | 'confirm' | 'pending'

export type Dispatch = { id: number; text: string }

export type AppState = {
  revealed: boolean
  hoveredId: string | null
  selectedId: string | null
  tokens: StateToken[]
  summaries: Record<string, StateSummary>
  launch: { open: boolean; step: LaunchStep; stateId: string | null; name: string; symbol: string; error: string | null }
  /** When true, the next map click chooses the launch state instead of opening a panel. */
  picking: boolean
  walletMenuOpen: boolean
  walletModalOpen: boolean
  walletPromptReason: string | null
  /** Short-lived notes like "$COW takes Ohio". */
  dispatch: Dispatch | null
  /** State whose territory animation is being orchestrated by a launch. */
  claiming: string | null
  /** Set after a successful launch to drive the success sequence. */
  celebration: { token: StateToken; key: number } | null
}

export function buildSummaries(tokens: StateToken[]) {
  const out: Record<string, StateSummary> = {}
  for (const s of STATES) out[s.id] = summarize(s.id, tokens)
  return out
}

export const appStore = createStore<AppState>({
  revealed: false,
  hoveredId: null,
  selectedId: null,
  tokens: [],
  summaries: buildSummaries([]),
  launch: { open: false, step: 'form', stateId: null, name: '', symbol: '', error: null },
  picking: false,
  walletMenuOpen: false,
  walletModalOpen: false,
  walletPromptReason: null,
  dispatch: null,
  claiming: null,
  celebration: null,
})

export const useApp = appStore.useStore

export function setTokens(tokens: StateToken[]) {
  appStore.set({ tokens, summaries: buildSummaries(tokens) })
}
