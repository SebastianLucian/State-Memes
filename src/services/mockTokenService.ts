import { STATES } from '../data/states'
import { buildMockTokens, INK_LIST } from '../data/mockTokens'
import { summarize } from './summaries'
import { claimMessage } from './claimMessage'
import type { LaunchParams, LaunchResult, StateToken, TokenEvent, TokenService } from './types'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function randomBase58(len: number) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

function bytesToBase58ish(bytes: Uint8Array) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}


/**
 * Development implementation. Market caps drift slowly so territories feel alive,
 * and launches are recorded locally after the wallet signs a claim message.
 *
 * To go live, implement `TokenService` against your launch program / indexer and
 * swap it in `services/tokenLauncher.ts`.
 */
export class MockTokenService implements TokenService {
  private tokens: StateToken[] = buildMockTokens()
  private listeners = new Set<(e: TokenEvent) => void>()
  private timer: ReturnType<typeof setTimeout> | null = null

  async getStates() {
    return STATES.map((s) => summarize(s.id, this.tokens))
  }

  async getTokensByState(stateId: string) {
    return summarize(stateId, this.tokens).tokens
  }

  async getToken(id: string) {
    return this.tokens.find((t) => t.id === id) ?? null
  }

  async getMarketCap(id: string) {
    return this.tokens.find((t) => t.id === id)?.marketCap ?? 0
  }

  async launchToken({ name, symbol, state, wallet }: LaunchParams): Promise<LaunchResult> {
    const message = new TextEncoder().encode(claimMessage({ name, symbol, state, issuedAt: new Date().toISOString() }))
    let signature: string
    if (wallet.signMessage) {
      // A real wallet prompt — the user signs their claim. Replace with the
      // create-token transaction once the launch program is wired up.
      signature = bytesToBase58ish(await wallet.signMessage(message))
    } else {
      await wait(900)
      signature = randomBase58(88)
    }
    await wait(500)

    const existing = this.tokens.filter((t) => t.stateId === state)
    const used = new Set(existing.map((t) => t.color))
    const color = INK_LIST.find((c) => !used.has(c)) ?? INK_LIST[existing.length % INK_LIST.length]

    const token: StateToken = {
      id: `local-${state}-${symbol}-${Date.now()}`.toLowerCase(),
      stateId: state,
      name,
      symbol,
      // A fresh bonding-curve style starting cap.
      marketCap: 4_200 + Math.round(Math.random() * 1_800),
      color,
      createdAt: Date.now(),
      creator: wallet.publicKey,
      mint: randomBase58(44),
      mock: true,
    }
    this.tokens = [...this.tokens, token]
    this.emit({ type: 'launch', token })
    return { token, signature }
  }

  subscribe(listener: (e: TokenEvent) => void) {
    this.listeners.add(listener)
    if (!this.timer) this.scheduleDrift()
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size === 0 && this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    }
  }

  private emit(e: TokenEvent) {
    this.listeners.forEach((l) => l(e))
  }

  /** Slow, calm market drift: one state at a time, every several seconds. */
  private scheduleDrift() {
    this.timer = setTimeout(() => {
      this.drift()
      this.scheduleDrift()
    }, 7_000 + Math.random() * 7_000)
  }

  private drift() {
    const contested = ['OH', 'NV', 'NY', 'TX', 'CA']
    const states = [...new Set(this.tokens.map((t) => t.stateId))]
    const stateId =
      Math.random() < 0.55
        ? contested[Math.floor(Math.random() * contested.length)]
        : states[Math.floor(Math.random() * states.length)]
    const inState = this.tokens.filter((t) => t.stateId === stateId)
    if (inState.length === 0) return

    this.tokens = this.tokens.map((t) => {
      if (t.stateId !== stateId) return t
      // Challengers get a slightly positive bias so leadership can change hands.
      const isLeader = t === inState.reduce((a, b) => (a.marketCap > b.marketCap ? a : b))
      const bias = isLeader ? -0.01 : 0.02
      const change = 1 + bias + (Math.random() - 0.5) * 0.14
      return { ...t, marketCap: Math.max(1_000, Math.round(t.marketCap * change)) }
    })
    this.emit({ type: 'update', tokens: this.tokens })
  }
}
