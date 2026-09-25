import { clusterApiUrl, type Cluster } from '@solana/web3.js'

const cluster = (import.meta.env.VITE_SOLANA_CLUSTER as Cluster | undefined) ?? 'devnet'

export const SOLANA = {
  cluster,
  endpoint: (import.meta.env.VITE_SOLANA_RPC as string | undefined) || clusterApiUrl(cluster),
  /** A no-funds preview wallet so the full flow can be walked without an extension. */
  demoWalletEnabled: import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_WALLET === 'true',
}
