/**
 * The exact text a wallet signs to stake a claim.
 * Keep in sync with supabase/functions/claim/index.ts — the server rebuilds
 * this string and verifies the signature against it.
 */
export function claimMessage(p: { name: string; symbol: string; state: string; issuedAt: string }) {
  return `THE FRONTIER\n\nI stake a claim in ${p.state}.\nToken: ${p.name} ($${p.symbol})\n\nIssued: ${p.issuedAt}`
}
