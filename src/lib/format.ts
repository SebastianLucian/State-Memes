export function formatCompact(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n)}`
}

export function formatFull(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

export function formatPct(ratio: number) {
  return `${Math.round(ratio * 100)}%`
}

export function shortAddress(addr: string) {
  return `${addr.slice(0, 3)}...${addr.slice(-3)}`
}

export function sanitizeTicker(raw: string) {
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)
}
