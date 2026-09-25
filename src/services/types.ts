export type StateToken = {
  id: string
  stateId: string
  name: string
  symbol: string
  marketCap: number
  color: string
  createdAt: number
  creator?: string
  mint?: string
  /** true for development mock data — never presented as real. */
  mock?: boolean
}

export type StateSummary = {
  stateId: string
  totalMarketCap: number
  leader: StateToken | null
  /** 0..1 share of the state's market cap held by the leader. */
  dominance: number
  tokens: StateToken[] // sorted by market cap, descending
}

export type LaunchParams = {
  name: string
  symbol: string
  state: string
  wallet: LaunchWallet
}

/** The minimal wallet surface the launcher needs. Keeps UI decoupled from the adapter. */
export type LaunchWallet = {
  publicKey: string
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>
}

export type LaunchResult = {
  token: StateToken
  signature: string
}

export type TokenEvent =
  | { type: 'update'; tokens: StateToken[] }
  | { type: 'launch'; token: StateToken }

/**
 * Everything the UI knows about the token world.
 * Swap the implementation (RPC, indexer, backend) without touching components.
 */
export interface TokenService {
  getStates(): Promise<StateSummary[]>
  getTokensByState(stateId: string): Promise<StateToken[]>
  getToken(id: string): Promise<StateToken | null>
  getMarketCap(id: string): Promise<number>
  launchToken(params: LaunchParams): Promise<LaunchResult>
  subscribe(listener: (event: TokenEvent) => void): () => void
}
