import { Address } from './encoding/address.js';
import {
  AddressWithDelegatedLsigSigner,
  AddressWithEmptyTransactionSigner,
  AddressWithTransactionSigner,
} from './signer.js';
import { addressWithSignersFromRawPQSigner } from './pq-signer.js';

/**
 * The 2-byte ASCII identifier of the Falcon-1024 post-quantum signature scheme.
 */
export const FALCON_1024_SCHEME = new TextEncoder().encode('f1');

/**
 * A Falcon-1024 public key paired with a function that signs raw bytes with the
 * corresponding secret key.
 *
 * @remarks
 * `falcon1024Signer` receives the exact bytes to sign, with every
 * domain-separation prefix already applied, so it can be backed by a key that
 * never leaves a wallet, HSM or hardware device.
 */
export interface Falcon1024SigningKey {
  /** The Falcon-1024 public key. */
  falcon1024PublicKey: Uint8Array;
  /** Signs the given bytes verbatim with the corresponding secret key. */
  falcon1024Signer: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

/**
 * Build the full set of signers for a Falcon-1024 key from a function that
 * signs raw bytes with it.
 *
 * @remarks
 * A thin wrapper around {@link addressWithSignersFromRawPQSigner} that supplies
 * the {@link FALCON_1024_SCHEME} identifier, so see that function for the
 * details and limitations of post-quantum signing.
 *
 * @param falconSigningKey - The public key and raw signing function to build the signers from
 * @param sendingAddress - The address transactions are sent from. Defaults to
 *   the derived Falcon-1024 address; supply it when this key is the auth
 *   address of a rekeyed account.
 * @returns An address bundled with transaction, empty transaction and delegated
 *   LogicSig signers
 */
export function addressWithSignersFromRawFalcon1024Signer(
  falconSigningKey: Falcon1024SigningKey,
  sendingAddress?: Address
): AddressWithTransactionSigner &
  AddressWithDelegatedLsigSigner &
  AddressWithEmptyTransactionSigner {
  return addressWithSignersFromRawPQSigner(
    {
      pqScheme: FALCON_1024_SCHEME,
      pqPublicKey: falconSigningKey.falcon1024PublicKey,
      pqSigner: falconSigningKey.falcon1024Signer,
    },
    sendingAddress
  );
}
