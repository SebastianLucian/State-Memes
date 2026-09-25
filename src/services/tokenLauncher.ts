import { MockTokenService } from './mockTokenService'
import { SupabaseTokenService } from './supabaseTokenService'
import { supabase } from '../lib/supabase/client'
import type { LaunchParams, TokenService } from './types'

/**
 * The single seam between UI and data.
 * With VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set: Supabase.
 * Otherwise: the development mock.
 */
export const tokenService: TokenService = supabase ? new SupabaseTokenService(supabase) : new MockTokenService()
export const usingMockService = !supabase

export const getStates = () => tokenService.getStates()
export const getTokensByState = (stateId: string) => tokenService.getTokensByState(stateId)
export const getToken = (id: string) => tokenService.getToken(id)
export const getMarketCap = (id: string) => tokenService.getMarketCap(id)
export const launchToken = (params: LaunchParams) => tokenService.launchToken(params)

export type { LaunchParams, LaunchResult, StateToken, StateSummary, TokenService } from './types'

if (import.meta.env.DEV) (globalThis as unknown as { __frontierService: TokenService }).__frontierService = tokenService
