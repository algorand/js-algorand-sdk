import {
  base64ToBytes,
  bytesToBase64,
  coerceToBytes,
} from '../encoding/binarydata.js';
import IntDecoding from '../types/intDecoding.js';
import { Transaction } from '../transaction.js';
import { CustomTokenHeader, KMDTokenHeader } from './urlTokenBaseHTTPClient.js';
import ServiceClient from './v2/serviceClient.js';

export class KmdClient extends ServiceClient {
  constructor(
    token: string | KMDTokenHeader | CustomTokenHeader,
    baseServer = 'http://127.0.0.1',
    port: string | number = 7833,
    headers = {}
  ) {
    super('X-KMD-API-Token', token, baseServer, port, headers);
  }

  private async get(relativePath: string): Promise<any> {
    const res = await this.c.get({
      relativePath,
    });
    return res.parseBodyAsJSON({
      // Using SAFE for all KMD endpoints because no integers in responses should ever be too big
      intDecoding: IntDecoding.SAFE,
    });
  }

  private async delete(relativePath: string, data: any): Promise<any> {
    const res = await this.c.delete({
      relativePath,
      data,
    });
    return res.parseBodyAsJSON({
      // Using SAFE for all KMD endpoints because no integers in responses should ever be too big
      intDecoding: IntDecoding.SAFE,
    });
  }

  private async post(relativePath: string, data: any): Promise<any> {
    const res = await this.c.post({
      relativePath,
      data,
    });
    return res.parseBodyAsJSON({
      // Using SAFE for all KMD endpoints because no integers in responses should ever be too big
      intDecoding: IntDecoding.SAFE,
    });
  }

  /**
   * version returns a VersionResponse containing a list of kmd API versions supported by this running kmd instance.
   */
  async versions() {
    return this.get('/versions');
  }

  /**
   * listWallets returns a ListWalletsResponse containing the list of wallets known to kmd. Using a wallet ID
   * returned from this endpoint, you can initialize a wallet handle with client.InitWalletHandle
   */
  async listWallets() {
    return this.get('/v1/wallets');
  }

  /**
   * createWallet creates a wallet with the specified name, password, driver,
   * and master derivation key. If the master derivation key is blank, one is
   * generated internally to kmd. CreateWallet returns a CreateWalletResponse
   * containing information about the new wallet.
   * @param walletName
   * @param walletPassword
   * @param walletDriverName
   * @param walletMDK
   */
  async createWallet(
    walletName: string,
    walletPassword: string,
    walletMDK: Uint8Array = new Uint8Array(),
    walletDriverName = 'sqlite'
  ) {
    const req = {
      wallet_name: walletName,
      wallet_driver_name: walletDriverName,
      wallet_password: walletPassword,
      master_derivation_key: bytesToBase64(walletMDK),
    };
    return this.post('/v1/wallet', req);
  }

  /**
   * initWalletHandle accepts a wallet ID and a wallet password, and returns an
   * initWalletHandleResponse containing a wallet handle token. This wallet
   * handle token can be used for subsequent operations on this wallet, like key
   * generation, transaction signing, etc.. WalletHandleTokens expire after a
   * configurable number of seconds, and must be renewed periodically with
   * RenewWalletHandle. It is good practice to call ReleaseWalletHandle when
   * you're done interacting with this wallet.
   * @param walletID
   * @param walletPassword
   */
  async initWalletHandle(walletID: string, walletPassword: string) {
    const req = {
      wallet_id: walletID,
      wallet_password: walletPassword,
    };
    return this.post('/v1/wallet/init', req);
  }

  /**
   * releaseWalletHandle invalidates the passed wallet handle token, making
   * it unusuable for subsequent wallet operations.
   * @param walletHandle
   */
  async releaseWalletHandle(walletHandle: string) {
    const req = {
      wallet_handle_token: walletHandle,
    };
    return this.post('/v1/wallet/release', req);
  }

  /**
   * renewWalletHandle accepts a wallet handle and attempts to renew it, moving
   * the expiration time to some number of seconds in the future. It returns a
   * RenewWalletHandleResponse containing the walletHandle and the number of
   * seconds until expiration
   * @param walletHandle
   */
  async renewWalletHandle(walletHandle: string) {
    const req = {
      wallet_handle_token: walletHandle,
    };
    return this.post('/v1/wallet/renew', req);
  }

  /**
   * renameWallet accepts a wallet ID, wallet password, and a new wallet name,
   * and renames the underlying wallet.
   * @param walletID
   * @param walletPassword
   * @param newWalletName
   */
  async renameWallet(
    walletID: string,
    walletPassword: string,
    newWalletName: string
  ) {
    const req = {
      wallet_id: walletID,
      wallet_password: walletPassword,
      wallet_name: newWalletName,
    };
    return this.post('/v1/wallet/rename', req);
  }

  /**
   * getWallet accepts a wallet handle and returns high level information about
   * this wallet in a GetWalletResponse.
   * @param walletHandle
   */
  async getWallet(walletHandle: string) {
    const req = {
      wallet_handle_token: walletHandle,
    };
    return this.post('/v1/wallet/info', req);
  }

  /**
   * exportMasterDerivationKey accepts a wallet handle and a wallet password, and
   * returns an ExportMasterDerivationKeyResponse containing the master
   * derivation key. This key can be used as an argument to CreateWallet in
   * order to recover the keys generated by this wallet. The master derivation
   * key can be encoded as a sequence of words using the mnemonic library, and
   * @param walletHandle
   * @param walletPassword
   */
  async exportMasterDerivationKey(
    walletHandle: string,
    walletPassword: string
  ) {
    const req = {
      wallet_handle_token: walletHandle,
      wallet_password: walletPassword,
    };
    const res = await this.post('/v1/master-key/export', req);
    return {
      master_derivation_key: base64ToBytes(res.master_derivation_key),
    };
  }

  /**
   * importKey accepts a wallet handle and an ed25519 private key, and imports
   * the key into the wallet. It returns an ImportKeyResponse containing the
   * address corresponding to this private key.
   * @param walletHandle
   * @param secretKey
   */
  async importKey(walletHandle: string, secretKey: Uint8Array) {
    const req = {
      wallet_handle_token: walletHandle,
      private_key: bytesToBase64(secretKey),
    };
    return this.post('/v1/key/import', req);
  }

  /**
   * exportKey accepts a wallet handle, wallet password, and address, and returns
   * an ExportKeyResponse containing the ed25519 private key corresponding to the
   * address stored in the wallet.
   * @param walletHandle
   * @param walletPassword
   * @param addr
   */
  async exportKey(walletHandle: string, walletPassword: string, addr: string) {
    const req = {
      wallet_handle_token: walletHandle,
      address: addr,
      wallet_password: walletPassword,
    };
    const res = await this.post('/v1/key/export', req);
    return { private_key: base64ToBytes(res.private_key) };
  }

  /**
   * generateKey accepts a wallet handle, and then generates the next key in the
   * wallet using its internal master derivation key. Two wallets with the same
   * master derivation key will generate the same sequence of keys.
   * @param walletHandle
   */
  async generateKey(walletHandle: string) {
    const req = {
      wallet_handle_token: walletHandle,
      display_mnemonic: false,
    };
    return this.post('/v1/key', req);
  }

  /**
   * deleteKey accepts a wallet handle, wallet password, and address, and deletes
   * the information about this address from the wallet (including address and
   * secret key). If DeleteKey is called on a key generated using GenerateKey,
   * the same key will not be generated again. However, if a wallet is recovered
   * using the master derivation key, a key generated in this way can be
   * recovered.
   * @param walletHandle
   * @param walletPassword
   * @param addr
   */
  async deleteKey(walletHandle: string, walletPassword: string, addr: string) {
    const req = {
      wallet_handle_token: walletHandle,
      address: addr,
      wallet_password: walletPassword,
    };
    return this.delete('/v1/key', req);
  }

  /**
   * ListKeys accepts a wallet handle and returns a ListKeysResponse containing
   * all of the addresses for which this wallet contains secret keys.
   * @param walletHandle
   */
  async listKeys(walletHandle: string) {
    const req = {
      wallet_handle_token: walletHandle,
    };
    return this.post('/v1/key/list', req);
  }

  /**
   * signTransaction accepts a wallet handle, wallet password, and a transaction,
   * and returns and SignTransactionResponse containing an encoded, signed
   * transaction. The transaction is signed using the key corresponding to the
   * Sender field.
   * @param walletHandle
   * @param walletPassword
   * @param transaction
   */
  async signTransaction(
    walletHandle: string,
    walletPassword: string,
    transaction: Transaction
  ) {
    const req = {
      wallet_handle_token: walletHandle,
      wallet_password: walletPassword,
      transaction: bytesToBase64(transaction.toByte()),
    };
    const res = await this.post('/v1/transaction/sign', req);
    return base64ToBytes(res.signed_transaction);
  }

  /**
   * signTransactionWithSpecificPublicKey accepts a wallet handle, wallet password, a transaction, and a public key,
   * and returns and SignTransactionResponse containing an encoded, signed
   * transaction. The transaction is signed using the key corresponding to the
   * publicKey arg.
   * @param walletHandle
   * @param walletPassword
   * @param transaction
   * @param publicKey - sign the txn with the key corresponding to publicKey (used for working with a rekeyed addr)
   */
  async signTransactionWithSpecificPublicKey(
    walletHandle: string,
    walletPassword: string,
    transaction: Transaction,
    publicKey: Uint8Array | string
  ) {
    const pk = coerceToBytes(publicKey);

    const req = {
      wallet_handle_token: walletHandle,
      wallet_password: walletPassword,
      transaction: bytesToBase64(transaction.toByte()),
      public_key: bytesToBase64(pk),
    };
    const res = await this.post('/v1/transaction/sign', req);
    return base64ToBytes(res.signed_transaction);
  }

  /**
   * listMultisig accepts a wallet handle and returns a ListMultisigResponse
   * containing the multisig addresses whose preimages are stored in this wallet.
   * A preimage is the information needed to reconstruct this multisig address,
   * including multisig version information, threshold information, and a list
   * of public keys.
   * @param walletHandle
   */
  async listMultisig(walletHandle: string) {
    const req = {
      wallet_handle_token: walletHandle,
    };
    return this.post('/v1/multisig/list', req);
  }

  /**
   * importMultisig accepts a wallet handle and the information required to
   * generate a multisig address. It derives this address, and stores all of the
   * information within the wallet. It returns a ImportMultisigResponse with the
   * derived address.
   * @param walletHandle
   * @param version
   * @param threshold
   * @param pks
   */
  async importMultisig(
    walletHandle: string,
    version: number,
    threshold: number,
    pks: string[]
  ) {
    const req = {
      wallet_handle_token: walletHandle,
      multisig_version: version,
      threshold,
      pks,
    };
    return this.post('/v1/multisig/import', req);
  }

  /**
   * exportMultisig accepts a wallet handle, wallet password, and multisig
   * address, and returns an ExportMultisigResponse containing the stored
   * multisig preimage. The preimage contains all of the information necessary
   * to derive the multisig address, including version, threshold, and a list of
   * public keys.
   * @param walletHandle
   * @param walletPassword
   * @param addr
   */
  async exportMultisig(walletHandle: string, addr: string) {
    const req = {
      wallet_handle_token: walletHandle,
      address: addr,
    };
    return this.post('/v1/multisig/export', req);
  }

  /**
   * signMultisigTransaction accepts a wallet handle, wallet password,
   * transaction, public key (*not* an address), and an optional partial
   * MultisigSig. It looks up the secret key corresponding to the public key, and
   * returns a SignMultisigTransactionResponse containing a MultisigSig with a
   * signature by the secret key included.
   * @param walletHandle
   * @param pw
   * @param tx
   * @param pk
   * @param partial
   */
  async signMultisigTransaction(
    walletHandle: string,
    pw: string,
    transaction: Transaction,
    pk: Uint8Array | string,
    partial: string
  ) {
    const pubkey = coerceToBytes(pk);
    const req = {
      wallet_handle_token: walletHandle,
      transaction: bytesToBase64(transaction.toByte()),
      public_key: bytesToBase64(pubkey),
      partial_multisig: partial,
      wallet_password: pw,
    };
    return this.post('/v1/multisig/sign', req);
  }

  /**
   * deleteMultisig accepts a wallet handle, wallet password, and multisig
   * address, and deletes the information about this multisig address from the
   * wallet (including address and secret key).
   * @param walletHandle
   * @param walletPassword
   * @param addr
   */
  async deleteMultisig(
    walletHandle: string,
    walletPassword: string,
    addr: string
  ) {
    const req = {
      wallet_handle_token: walletHandle,
      address: addr,
      wallet_password: walletPassword,
    };
    return this.delete('/v1/multisig', req);
  }
}
