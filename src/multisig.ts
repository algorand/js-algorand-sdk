import * as nacl from './nacl/naclWrappers.js';
import {
  Address,
  ALGORAND_ADDRESS_BYTE_LENGTH,
  ALGORAND_CHECKSUM_BYTE_LENGTH,
} from './encoding/address.js';
import * as utils from './utils/utils.js';
import { EncodedMultisig } from './types/transactions/encoded.js';

/**
 Utilities for manipulating multisig transaction blobs.
 */

/**
 * Required options for creating a multisignature
 *
 * Documentation available at: https://developer.algorand.org/docs/get-details/transactions/signatures/#multisignatures
 */
export interface MultisigMetadata {
  /**
   * Multisig version
   */
  version: number;

  /**
   * Multisig threshold value. Authorization requires a subset of signatures,
   * equal to or greater than the threshold value.
   */
  threshold: number;

  /**
   * A list of Algorand addresses representing possible signers for this multisig. Order is important.
   */
  addrs: Array<string | Address>;
}

// Convert "MultisigAddr" UTF-8 to byte array
const MULTISIG_PREIMG2ADDR_PREFIX = new Uint8Array([
  77, 117, 108, 116, 105, 115, 105, 103, 65, 100, 100, 114,
]);

const INVALID_MSIG_VERSION_ERROR_MSG = 'invalid multisig version';
const INVALID_MSIG_THRESHOLD_ERROR_MSG = 'bad multisig threshold';
const INVALID_MSIG_PK_ERROR_MSG = 'bad multisig public key - wrong length';
const UNEXPECTED_PK_LEN_ERROR_MSG = 'nacl public key length is not 32 bytes';

export function pksFromAddresses(addrs: Array<string | Address>): Uint8Array[] {
  return addrs.map((addr) => {
    if (typeof addr === 'string') {
      return Address.fromString(addr).publicKey;
    }
    return addr.publicKey;
  });
}

/**
 * fromMultisigPreImg takes multisig parameters and returns a 32 byte typed array public key,
 * representing an address that identifies the "exact group, version, and public keys" that are required for signing.
 * Hash("MultisigAddr" || version uint8 || threshold uint8 || PK1 || PK2 || ...)
 * Encoding this output yields a human readable address.
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param pks - array of typed array public keys
 */
export function addressFromMultisigPreImg({
  version,
  threshold,
  pks,
}: Omit<MultisigMetadata, 'addrs'> & {
  pks: Uint8Array[];
}): Address {
  if (version !== 1 || version > 255 || version < 0) {
    // ^ a tad redundant, but in case in the future version != 1, still check for uint8
    throw new Error(INVALID_MSIG_VERSION_ERROR_MSG);
  }
  if (
    threshold === 0 ||
    pks.length === 0 ||
    threshold > pks.length ||
    threshold > 255
  ) {
    throw new Error(INVALID_MSIG_THRESHOLD_ERROR_MSG);
  }
  const pkLen = ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH;
  if (pkLen !== nacl.PUBLIC_KEY_LENGTH) {
    throw new Error(UNEXPECTED_PK_LEN_ERROR_MSG);
  }
  const merged = new Uint8Array(
    MULTISIG_PREIMG2ADDR_PREFIX.length + 2 + pkLen * pks.length
  );
  merged.set(MULTISIG_PREIMG2ADDR_PREFIX, 0);
  merged.set([version], MULTISIG_PREIMG2ADDR_PREFIX.length);
  merged.set([threshold], MULTISIG_PREIMG2ADDR_PREFIX.length + 1);
  for (let i = 0; i < pks.length; i++) {
    if (pks[i].length !== pkLen) {
      throw new Error(INVALID_MSIG_PK_ERROR_MSG);
    }
    merged.set(pks[i], MULTISIG_PREIMG2ADDR_PREFIX.length + 2 + i * pkLen);
  }
  return new Address(Uint8Array.from(nacl.genericHash(merged)));
}

/**
 * fromMultisigPreImgAddrs takes multisig parameters and returns a human readable Algorand address.
 * This is equivalent to fromMultisigPreImg, but interfaces with encoded addresses.
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param addrs - array of encoded addresses
 */
export function addressFromMultisigPreImgAddrs({
  version,
  threshold,
  addrs,
}: MultisigMetadata): Address {
  const pks = pksFromAddresses(addrs);
  return addressFromMultisigPreImg({ version, threshold, pks });
}

export function verifyMultisig(
  toBeVerified: Uint8Array,
  msig: EncodedMultisig,
  publicKey: Uint8Array
) {
  const version = msig.v;
  const threshold = msig.thr;
  const subsigs = msig.subsig;

  const pks = subsigs.map((subsig) => subsig.pk);
  if (msig.subsig.length < threshold) {
    return false;
  }

  let pk: Uint8Array;
  try {
    pk = addressFromMultisigPreImg({ version, threshold, pks }).publicKey;
  } catch (e) {
    return false;
  }

  if (!utils.arrayEqual(pk, publicKey)) {
    return false;
  }

  let counter = 0;
  for (const subsig of subsigs) {
    if (subsig.s !== undefined) {
      counter += 1;
    }
  }
  if (counter < threshold) {
    return false;
  }

  let verifiedCounter = 0;
  for (const subsig of subsigs) {
    if (subsig.s !== undefined) {
      if (nacl.verify(toBeVerified, subsig.s, subsig.pk)) {
        verifiedCounter += 1;
      }
    }
  }

  if (verifiedCounter < threshold) {
    return false;
  }

  return true;
}

/**
 * multisigAddress takes multisig metadata (preimage) and returns the corresponding human readable Algorand address.
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param addrs - list of Algorand addresses
 */
export function multisigAddress({
  version,
  threshold,
  addrs,
}: MultisigMetadata): Address {
  return addressFromMultisigPreImgAddrs({ version, threshold, addrs });
}
