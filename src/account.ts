import * as nacl from './nacl/naclWrappers.js';
import * as address from './encoding/address.js';
import Account from './types/account.js';

/**
 * generateAccount returns a new Algorand address and its corresponding secret key
 */
export default function generateAccount(): Account {
  const keys = nacl.keyPair();
  const encodedPk = address.encodeAddress(keys.publicKey);
  return { addr: encodedPk, sk: keys.secretKey };
}
