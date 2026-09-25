import type { SupabaseClient } from '@supabase/supabase-js'
import { STATES } from '../data/states'
import { summarize } from './summaries'
import { claimMessage } from './claimMessage'
import type { LaunchParams, LaunchResult, StateToken, TokenEvent, TokenService } from './types'

type TokenRow = {
  id: string
  state_id: string
  name: string
  symbol: string
  market_cap: number | string
  color: string
  creator: string | null
  mint: string | null
  is_mock: boolean
  created_at: string
}

const COLUMNS = 'id,state_id,name,symbol,market_cap,color,creator,mint,is_mock,created_at'

function toToken(r: TokenRow): StateToken {
  return {
    id: r.id,
    stateId: r.state_id,
    name: r.name,
    symbol: r.symbol,
    marketCap: Number(r.market_cap),
    color: r.color,
    createdAt: Date.parse(r.created_at),
    creator: r.creator ?? undefined,
    mint: r.mint ?? undefined,
    mock: r.is_mock,
  }
}

function toBase64(bytes: Uint8Array) {
  let s = ''
  bytes.forEach((b) => (s += String.fromCharCode(b)))
  return btoa(s)
}

/**
 * Tokens live in the Supabase `tokens` table. Reads go straight to Postgres
 * (public RLS select); claims go through the `claim` Edge Function, which
 * verifies the wallet signature. Realtime keeps every open map in step.
 */
export class SupabaseTokenService implements TokenService {
  private tokens: StateToken[] = []
  private loaded: Promise<void> | null = null
  private listeners = new Set<(e: TokenEvent) => void>()
  private channel: ReturnType<SupabaseClient['channel']> | null = null
  private refetchTimer: ReturnType<typeof setTimeout> | null = null

  constructor(private db: SupabaseClient) {}

  private async fetchAll() {
    const { data, error } = await this.db.from('tokens').select(COLUMNS).order('market_cap', { ascending: false })
    if (error) throw error
    this.tokens = (data as TokenRow[]).map(toToken)
    return this.tokens
  }

  private ready() {
    this.loaded ??= this.fetchAll().then(() => undefined)
    return this.loaded
  }

  async getStates() {
    await this.ready()
    return STATES.map((s) => summarize(s.id, this.tokens))
  }

  async getTokensByState(stateId: string) {
    await this.ready()
    return summarize(stateId, this.tokens).tokens
  }

  async getToken(id: string) {
    await this.ready()
    return this.tokens.find((t) => t.id === id) ?? null
  }

  async getMarketCap(id: string) {
    return (await this.getToken(id))?.marketCap ?? 0
  }

  async launchToken({ name, symbol, state, wallet }: LaunchParams): Promise<LaunchResult> {
    if (!wallet.signMessage) throw new Error('This wallet cannot sign messages.')
    const issuedAt = new Date().toISOString()
    const sig = await wallet.signMessage(new TextEncoder().encode(claimMessage({ name, symbol, state, issuedAt })))
    const signature = toBase64(sig)

    const { data, error } = await this.db.functions.invoke('claim', {
      body: { name, symbol, state, publicKey: wallet.publicKey, issuedAt, signature },
    })
    if (error) {
      // Surface the function's own message when it sent one.
      const ctx = (error as { context?: Response }).context
      const detail = ctx ? await ctx.json().catch(() => null) : null
      throw new Error(detail?.error ?? error.message)
    }
    const token = toToken((data as { token: TokenRow }).token)
    if (!this.tokens.some((t) => t.id === token.id)) this.tokens = [...this.tokens, token]
    this.emit({ type: 'launch', token })
    return { token, signature }
  }

  subscribe(listener: (e: TokenEvent) => void) {
    this.listeners.add(listener)
    if (!this.channel) {
      this.channel = this.db
        .channel('frontier-tokens')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens' }, () => this.scheduleRefetch())
        .subscribe()
    }
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size === 0 && this.channel) {
        this.db.removeChannel(this.channel)
        this.channel = null
      }
    }
  }

  /** Bursts of row changes (an indexer writing caps) collapse into one refresh. */
  private scheduleRefetch() {
    if (this.refetchTimer) clearTimeout(this.refetchTimer)
    this.refetchTimer = setTimeout(async () => {
      try {
        this.emit({ type: 'update', tokens: await this.fetchAll() })
      } catch {
        // Keep the last good map; the next change will retry.
      }
    }, 400)
  }

  private emit(e: TokenEvent) {
    this.listeners.forEach((l) => l(e))
  }
}
