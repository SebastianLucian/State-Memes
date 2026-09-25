import {
  BaseMessageSignerWalletAdapter,
  WalletNotConnectedError,
  WalletReadyState,
  WalletSignTransactionError,
  type WalletName,
} from '@solana/wallet-adapter-base'
import { Keypair, type PublicKey, type Transaction, type VersionedTransaction } from '@solana/web3.js'

export const DemoWalletName = 'Preview Wallet' as WalletName<'Preview Wallet'>

const ICON =
  'data:image/svg+xml;base64,' +
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#E8DDC8"/><rect x="5" y="5" width="22" height="22" fill="none" stroke="#171614" stroke-dasharray="2 2"/><text x="16" y="21" font-size="12" text-anchor="middle" font-family="Georgia" fill="#843F34">P</text></svg>',
  )

/**
 * Development-only wallet. It has no funds and signs nothing on-chain; it lets
 * the launch flow be exercised end to end without a browser extension.
 */
export class DemoWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = DemoWalletName
  url = 'https://github.com'
  icon = ICON
  supportedTransactionVersions = null
  readyState = WalletReadyState.Loadable

  private _keypair: Keypair | null = null
  private _connecting = false

  get publicKey(): PublicKey | null {
    return this._keypair?.publicKey ?? null
  }

  get connecting() {
    return this._connecting
  }

  async connect() {
    this._connecting = true
    await new Promise((r) => setTimeout(r, 350))
    this._keypair = Keypair.generate()
    this._connecting = false
    this.emit('connect', this._keypair.publicKey)
  }

  async disconnect() {
    this._keypair = null
    this.emit('disconnect')
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(): Promise<T> {
    throw new WalletSignTransactionError('The preview wallet cannot sign transactions.')
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(): Promise<T[]> {
    throw new WalletSignTransactionError('The preview wallet cannot sign transactions.')
  }

  async signMessage(): Promise<Uint8Array> {
    if (!this._keypair) throw new WalletNotConnectedError()
    await new Promise((r) => setTimeout(r, 1100))
    return crypto.getRandomValues(new Uint8Array(64))
  }
}
