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

export interface Falcon1024SigningKey {
  falcon1024PublicKey: Uint8Array;
  falcon1024Signer: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

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
