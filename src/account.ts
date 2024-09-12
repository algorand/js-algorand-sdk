import * as nacl from './nacl/naclWrappers.js';
import { Address } from './encoding/address.js';
import Account from './types/account.js';

/**
 * generateAccount returns a new Algorand address and its corresponding secret key
 */
export default function generateAccount(): Account {
  const keys = nacl.keyPair();
  const addr = new Address(keys.publicKey);
  return { addr, sk: keys.secretKey };
}
