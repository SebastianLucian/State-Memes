import type { StateSummary, StateToken } from './types'

export function summarize(stateId: string, all: StateToken[]): StateSummary {
  const tokens = all.filter((t) => t.stateId === stateId).sort((a, b) => b.marketCap - a.marketCap)
  const totalMarketCap = tokens.reduce((sum, t) => sum + t.marketCap, 0)
  const leader = tokens[0] ?? null
  const dominance = leader && totalMarketCap > 0 ? leader.marketCap / totalMarketCap : 0
  return { stateId, totalMarketCap, leader, dominance, tokens }
}
