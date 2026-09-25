# The Frontier

**Launch a meme. Pick a state. Make your claim.**

An interactive map of America where meme tokens are the mechanism. Every token belongs to a US state; market cap decides who holds the territory.

```
npm install
npm run dev        # http://localhost:5173   (append #map to skip the cover)
npm run build
```

Copy `.env.example` to `.env` to choose the Solana cluster / RPC used for wallet balances.

## Experience

1. **Cover.** A sheet of archival paper lies over the live map. Grab the dog-eared top-right corner and peel it away (mouse or touch). Past 65% of the drag, or on a flick, it snaps open. Otherwise it settles back. Keyboard: `Enter`, or the *Pull to explore* link.
2. **Map.** A MapLibre GL road-atlas style on OpenFreeMap / OpenMapTiles vector tiles, with the fifty states as our own GeoJSON layer. Hover to see an annotation, click to select.
3. **Territories.** The leading token in each state inks the land: a colour wash, stippling, a bled contour line, and hatching when the state is contested. Strength follows dominance (`leader cap / state total`). When the lead changes hands, the old ink recedes and the new one washes in.
4. **Claim.** *Make your claim*, then name + ticker (the state is pre-filled), then a confirmation, then a wallet signature. The success sequence: camera settles, ink spreads, ticker appears, a CLAIMED stamp lands, market cap counts up.

## Architecture

```
src/
  components/
    IntroCover/   IntroCover, PeelInteraction, CoverContent
    Map/          USMap, StateLayer, TerritoryLayer, MapControls, MapOverlays
    Header/       Header, WalletButton, WalletModal
    State/        StateTooltip, StatePanel, StateLeaderboard
    Launch/       LaunchModal, LaunchForm, LaunchConfirmation, LaunchSuccess
    UI/           Button, PaperPanel, Stamp, CountUp
  hooks/          useWallet, useStateSelection, useLaunch, usePeelInteraction, useTokenData
  lib/
    animation/    easing, peel geometry, cover/territory/ui timelines (index.ts is the public API)
    map/          style, layers, geometry, patterns, territory controller, camera
    solana/       wallet providers, config, dev preview wallet
    store/        tiny external store (useSyncExternalStore)
  services/       TokenService interface, mock implementation, tokenLauncher seam
  data/           states.ts, mockTokens.ts
```

**Performance.** Hover, selection and territory animation never re-render React. They write MapLibre `feature-state` directly from GSAP tweens (`lib/map/territory.ts`). The peel runs on the GSAP ticker and writes styles straight to the DOM. Paper textures are generated as bitmaps once at startup, because SVG turbulence backgrounds re-rasterise on every repaint.

## Swapping in real data

The UI talks only to the `TokenService` interface (`src/services/types.ts`):

```ts
getStates() · getTokensByState(stateId) · getToken(id) · getMarketCap(id)
launchToken({ name, symbol, state, wallet }) · subscribe(listener)
```

`src/services/tokenLauncher.ts` currently exports a `MockTokenService`. It uses **development data** (invented tickers and market caps), drifts them slowly so the map feels alive, and records launches locally after the wallet signs a claim message. To go live, implement the interface against your launch program / indexer / market-data API and export it from `tokenLauncher.ts`. Nothing in the UI changes.

## Supabase

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`) and the app reads and writes Supabase instead of the mock. Without them it falls back to mock data.

```
supabase link --project-ref <your-ref>
supabase db push                 # creates public.tokens, RLS, realtime
supabase db seed                 # optional: development rows (is_mock = true)
supabase functions deploy claim  # signature-verified claims
```

- **Reads:** anyone can `select` from `tokens` (RLS). Realtime pushes changes, so every open map updates live.
- **Writes:** browsers cannot insert. A claim calls the `claim` Edge Function. It rebuilds the claim message, checks the wallet's ed25519 signature and that the message is under 5 minutes old, then inserts with the service role. A duplicate ticker in the same state is rejected.
- **Market caps:** `market_cap` starts at a placeholder. Your indexer or market-data job should update it. Map territories follow automatically.

## Wallets

Uses `@solana/wallet-adapter-react` with Wallet Standard discovery, so Phantom, Solflare, Backpack and others are detected without per-wallet packages. In development (or with `VITE_ENABLE_DEMO_WALLET=true`), a **Preview Wallet** with no funds is also listed, so the whole flow can be walked without an extension.

## Attribution

Map data: OpenFreeMap © OpenMapTiles, data from OpenStreetMap. State shapes: US Census Bureau via `us-atlas`.
