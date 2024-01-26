import { Address } from '../encoding/address.js';

/**
 * An Algorand account object.
 *
 * Contains an Algorand address and secret key.
 */
export default interface Account {
  /**
   * Algorand address
   */
  addr: Address;

  /**
   * Secret key belonging to the Algorand address
   */
  sk: Uint8Array;
}
