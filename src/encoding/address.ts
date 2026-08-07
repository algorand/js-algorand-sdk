import base32 from 'hi-base32';
import * as nacl from '../nacl/naclWrappers.js';
import * as utils from '../utils/utils.js';
import { encodeUint64 } from './uint64.js';
import { bytesToHex } from './binarydata.js';
import { couldBeCurvePoint } from '../utils/ed25519-check.js';
// Type-only: erased at runtime, so this does not create an import cycle with
// types/transactions/encoded.ts, which imports this module transitively.
import type { EncodedPQSig } from '../types/transactions/encoded.js';

export const ALGORAND_ADDRESS_BYTE_LENGTH = 36;
export const ALGORAND_CHECKSUM_BYTE_LENGTH = 4;
export const ALGORAND_ADDRESS_LENGTH = 58;
export const ALGORAND_ZERO_ADDRESS_STRING =
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ';

export const MALFORMED_ADDRESS_ERROR_MSG = 'address seems to be malformed';
export const CHECKSUM_ADDRESS_ERROR_MSG = 'wrong checksum for address';

/**
 * The domain-separation prefix prepended to a post-quantum address preimage
 * before hashing. Matches go-algorand's protocol.PostQuantumAddress HashID.
 */
const PQ_ADDRESS_PREFIX = new TextEncoder().encode('PQA');

/**
 * The required byte length of a post-quantum signature scheme identifier.
 */
export const PQ_SCHEME_SIZE = 2;

/**
 * The largest value a post-quantum address salt may take. The salt occupies a
 * single byte of the address preimage.
 */
export const PQ_SALT_MAX = 0xff;

function checksumFromPublicKey(pk: Uint8Array): Uint8Array {
  return Uint8Array.from(
    nacl
      .genericHash(pk)
      .slice(
        nacl.HASH_BYTES_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH,
        nacl.HASH_BYTES_LENGTH
      )
  );
}

/**
 * Represents an Algorand address
 */
export class Address {
  /**
   * The binary form of the address. For standard accounts, this is the public key.
   */
  public readonly publicKey: Uint8Array;

  /**
   * Create a new Address object from its binary form.
   * @param publicKey - The binary form of the address. Must be 32 bytes.
   */
  constructor(publicKey: Uint8Array) {
    if (!(publicKey instanceof Uint8Array)) {
      throw new Error(
        `${MALFORMED_ADDRESS_ERROR_MSG}: ${publicKey} is not Uint8Array, type ${typeof publicKey}`
      );
    }
    if (
      publicKey.length !==
      ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH
    )
      throw new Error(
        `${MALFORMED_ADDRESS_ERROR_MSG}: 0x${bytesToHex(publicKey)}, length ${publicKey.length}`
      );
    this.publicKey = publicKey;
  }

  /**
   * Check if the address is equal to another address.
   */
  equals(other: Address): boolean {
    return (
      other instanceof Address &&
      utils.arrayEqual(this.publicKey, other.publicKey)
    );
  }

  /**
   * Compute the 4 byte checksum of the address.
   */
  checksum(): Uint8Array {
    return checksumFromPublicKey(this.publicKey);
  }

  /**
   * Encode the address into a string form.
   */
  toString(): string {
    const addr = base32.encode(
      utils.concatArrays(this.publicKey, this.checksum())
    );
    return addr.slice(0, ALGORAND_ADDRESS_LENGTH); // removing the extra '===='
  }

  /**
   * Decode an address from a string.
   * @param address - The address to decode. Must be 58 bytes long.
   * @returns An Address object corresponding to the input string.
   */
  static fromString(address: string): Address {
    if (typeof address !== 'string')
      throw new Error(
        `${MALFORMED_ADDRESS_ERROR_MSG}: expected string, got ${typeof address}, ${address}`
      );
    if (address.length !== ALGORAND_ADDRESS_LENGTH)
      throw new Error(
        `${MALFORMED_ADDRESS_ERROR_MSG}: expected length ${ALGORAND_ADDRESS_LENGTH}, got ${address.length}: ${address}`
      );

    // try to decode
    const decoded = base32.decode.asBytes(address);
    // Sanity check
    if (decoded.length !== ALGORAND_ADDRESS_BYTE_LENGTH)
      throw new Error(
        `${MALFORMED_ADDRESS_ERROR_MSG}: expected byte length ${ALGORAND_ADDRESS_BYTE_LENGTH}, got ${decoded.length}`
      );

    // Find publickey and checksum
    const pk = new Uint8Array(
      decoded.slice(
        0,
        ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH
      )
    );
    const cs = new Uint8Array(
      decoded.slice(nacl.PUBLIC_KEY_LENGTH, ALGORAND_ADDRESS_BYTE_LENGTH)
    );
    const checksum = checksumFromPublicKey(pk);
    // Check if the checksum and the address are equal
    if (!utils.arrayEqual(checksum, cs))
      throw new Error(CHECKSUM_ADDRESS_ERROR_MSG);

    return new Address(pk);
  }

  /**
   * Get the zero address.
   */
  static zeroAddress(): Address {
    return new Address(
      new Uint8Array(
        ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH
      )
    );
  }
}

/**
 * decodeAddress takes an Algorand address in string form and decodes it into a Uint8Array.
 * @param address - an Algorand address with checksum.
 * @returns the decoded form of the address's public key and checksum
 */
export function decodeAddress(address: string): Address {
  return Address.fromString(address);
}

/**
 * isValidAddress checks if a string is a valid Algorand address.
 * @param address - an Algorand address with checksum.
 * @returns true if valid, false otherwise
 */
export function isValidAddress(address: string): boolean {
  // Try to decode
  try {
    Address.fromString(address);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * encodeAddress takes an Algorand address as a Uint8Array and encodes it into a string with checksum.
 * @param address - a raw Algorand address
 * @returns the address and checksum encoded as a string.
 */
export function encodeAddress(address: Uint8Array): string {
  return new Address(address).toString();
}

const APP_ID_PREFIX = new TextEncoder().encode('appID');

/**
 * Get the escrow address of an application.
 * @param appID - The ID of the application.
 * @returns The address corresponding to that application's escrow account.
 */
export function getApplicationAddress(appID: number | bigint): Address {
  const toBeSigned = utils.concatArrays(APP_ID_PREFIX, encodeUint64(appID));
  const hash = nacl.genericHash(toBeSigned);
  return new Address(Uint8Array.from(hash));
}

/**
 * Derive a post-quantum (PQ) account address together with the canonical salt
 * used to derive it.
 *
 * @param schemeBytes - The 2-byte ASCII PQ scheme identifier (e.g. "f1" for Falcon-1024).
 * @param key - The scheme's canonical public key.
 * @returns The derived Address and the canonical 1-byte salt.
 */
export function addressFromPQKey(
  schemeBytes: Uint8Array,
  key: Uint8Array
): { address: Address; salt: number } {
  if (schemeBytes.length !== PQ_SCHEME_SIZE)
    throw new Error(
      `invalid PQ scheme length: expected ${PQ_SCHEME_SIZE} bytes, got ${schemeBytes.length}`
    );

  // Rejection-sample the lowest salt that yields a PQ-compliant (non-Ed25519)
  // address. The probability of exhausting the range is ~2^-256.
  for (let salt = 0; salt <= PQ_SALT_MAX; salt++) {
    const toBeHashed = utils.concatArrays(
      PQ_ADDRESS_PREFIX,
      schemeBytes,
      Uint8Array.of(salt),
      key
    );
    const publicKey = Uint8Array.from(nacl.genericHash(toBeHashed));
    if (!couldBeCurvePoint(publicKey)) {
      return { address: new Address(publicKey), salt };
    }
  }

  throw new Error('no canonical salt exists for this PQ public key and scheme');
}

/**
 * Derive the account address that a post-quantum signature authorizes.
 *
 * Unlike an Ed25519 signature, a PQ signature carries the scheme, salt and
 * public key of the signing account, so the address it authorizes is fully
 * determined by the signature and does not have to be supplied out of band.
 *
 * This also validates the signature's self-consistency: the salt must be the
 * canonical one for the given scheme and public key, which is what the network
 * requires.
 *
 * @param pqsig - The post-quantum signature to derive the address from.
 * @returns The address of the account the signature authorizes.
 */
export function addressFromPQSig(pqsig: EncodedPQSig): Address {
  const { address, salt } = addressFromPQKey(pqsig.sch, pqsig.pk);
  if (salt !== pqsig.slt) {
    throw new Error(
      `invalid PQ signature salt: expected the canonical salt ${salt}, got ${pqsig.slt}`
    );
  }
  return address;
}
