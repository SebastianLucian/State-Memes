import { MockTokenService } from './mockTokenService'
import type { LaunchParams, TokenService } from './types'

/**
 * The single seam between UI and chain.
 * Today: a development mock. Later: Solana RPC / indexer / backend — same interface.
 */
export const tokenService: TokenService = new MockTokenService()

export const getStates = () => tokenService.getStates()
export const getTokensByState = (stateId: string) => tokenService.getTokensByState(stateId)
export const getToken = (id: string) => tokenService.getToken(id)
export const getMarketCap = (id: string) => tokenService.getMarketCap(id)
export const launchToken = (params: LaunchParams) => tokenService.launchToken(params)

export type { LaunchParams, LaunchResult, StateToken, StateSummary, TokenService } from './types'

if (import.meta.env.DEV) (globalThis as unknown as { __frontierService: TokenService }).__frontierService = tokenService
