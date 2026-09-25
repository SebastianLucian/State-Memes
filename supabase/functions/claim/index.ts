// Supabase Edge Function: stake a claim.
// Verifies that the wallet signed the exact claim message, then inserts the
// token with the service role (browsers cannot write to `tokens` directly).
//
// Deploy: supabase functions deploy claim
import { createClient } from 'npm:@supabase/supabase-js@2'
import nacl from 'npm:tweetnacl@1.0.3'
import bs58 from 'npm:bs58@6.0.0'

const STATES = new Set(
  'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '),
)
const INKS = ['#293B4A', '#843F34', '#B28B4D', '#674A34', '#4A5A5E', '#5E6B4E', '#9A5A3A', '#2A2622']
const MAX_AGE_MS = 5 * 60 * 1000

// Keep in sync with src/services/claimMessage.ts
function claimMessage(p: { name: string; symbol: string; state: string; issuedAt: string }) {
  return `THE FRONTIER\n\nI stake a claim in ${p.state}.\nToken: ${p.name} ($${p.symbol})\n\nIssued: ${p.issuedAt}`
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON.' }, 400)
  }

  const name = String(body.name ?? '').trim()
  const symbol = String(body.symbol ?? '').trim().toUpperCase()
  const state = String(body.state ?? '').trim().toUpperCase()
  const publicKey = String(body.publicKey ?? '')
  const issuedAt = String(body.issuedAt ?? '')
  const signature = String(body.signature ?? '')

  if (name.length < 2 || name.length > 32) return json({ error: 'Name must be 2–32 characters.' }, 400)
  if (!/^[A-Z0-9]{2,8}$/.test(symbol)) return json({ error: 'Ticker must be 2–8 letters or digits.' }, 400)
  if (!STATES.has(state)) return json({ error: 'Unknown state.' }, 400)

  const issued = Date.parse(issuedAt)
  if (!Number.isFinite(issued) || Math.abs(Date.now() - issued) > MAX_AGE_MS)
    return json({ error: 'Claim expired. Sign again.' }, 400)

  let pk: Uint8Array
  let sig: Uint8Array
  try {
    pk = bs58.decode(publicKey)
    sig = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0))
  } catch {
    return json({ error: 'Malformed key or signature.' }, 400)
  }
  if (pk.length !== 32 || sig.length !== 64) return json({ error: 'Malformed key or signature.' }, 400)

  const message = new TextEncoder().encode(claimMessage({ name, symbol, state, issuedAt }))
  if (!nacl.sign.detached.verify(message, sig, pk)) return json({ error: 'Signature does not match.' }, 401)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: existing } = await db.from('tokens').select('color').eq('state_id', state)
  const used = new Set((existing ?? []).map((r: { color: string }) => r.color))
  const color = INKS.find((c) => !used.has(c)) ?? INKS[(existing?.length ?? 0) % INKS.length]

  const { data, error } = await db
    .from('tokens')
    .insert({
      state_id: state,
      name,
      symbol,
      color,
      // Starting cap until your indexer reports real market data.
      market_cap: 4200 + Math.round(Math.random() * 1800),
      creator: publicKey,
      signature,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return json({ error: `$${symbol} already stands in this state.` }, 409)
    return json({ error: 'Could not record the claim.' }, 500)
  }
  return json({ token: data })
})
