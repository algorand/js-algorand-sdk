import * as nacl from './nacl/naclWrappers';
import * as address from './encoding/address';
import Account from './types/account';

/**
 * generateAccount returns a new Algorand address and its corresponding secret key
 */
export default function generateSeededAccount(seed: Uint8Array): Account {
  const keys = nacl.keyPairFromSeed(seed);
  const encodedPk = address.encodeAddress(keys.publicKey);
  return { addr: encodedPk, sk: keys.secretKey };
}
