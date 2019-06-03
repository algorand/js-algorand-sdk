const base32 = require('hi-base32');
const nacl = require('../nacl/naclWrappers');
const utils = require('../utils/utils');

const ALGORAND_SEED_BYTE_LENGTH = 36;
const ALGORAND_CHECKSUM_BYTE_LENGTH = 4;
const ALGORAND_SEED_LENGTH = 58;

const MALFORMED_SEED_ERROR = new Error("seed seems to be malformed");

/**
 * Checks if a seed is valid
 * @param {String} seed - encoded Algorand seed
 * @returns {Boolean} true if valid, false otherwise
 */
function isValidSeed(seed) {
  if (typeof seed !== "string") return false;

  if (seed.length !== ALGORAND_SEED_LENGTH) return false;

  // Try to decode
  let decoded;
  try {
    decoded = decode(seed);
  } catch (e) {
    return false;
  }

  // Compute checksum
  let checksum = nacl.genericHash(decoded.seed).slice(nacl.SEED_BYTES_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH, nacl.SEED_BYTES_LENGTH);

  // Check if the checksum and the seed are equal
  return utils.arrayEqual(checksum, decoded.checksum);
}

/**
 * @param seed
 * @return {{checksum: Uint8Array, seed: Uint8Array}}
 */
function decode(seed) {
  if (!(typeof seed === "string" || seed instanceof String)) throw MALFORMED_SEED_ERROR;

  //try to decode
  let decoded = base32.decode.asBytes(seed);

  // Sanity check
  if (decoded.length !== ALGORAND_SEED_BYTE_LENGTH) throw MALFORMED_SEED_ERROR;

  return {
    seed: new Uint8Array(decoded.slice(0, ALGORAND_SEED_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH)),
    checksum: new Uint8Array(decoded.slice(nacl.SEED_BYTES_LENGTH, ALGORAND_SEED_BYTE_LENGTH))
  }
}

/**
 * Encode a secret key into a seed
 * @param secretKey
 * @return {String} encoded seed
 */
function encode(secretKey) {
  // get seed
  const seed = secretKey.slice(0,nacl.SEED_BYTES_LENGTH);
  //compute checksum
  const checksum = nacl.genericHash(seed).slice(nacl.SEED_BYTES_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH, nacl.SEED_BYTES_LENGTH);
  const encodedSeed = base32.encode(utils.concatArrays(seed, checksum));

  return encodedSeed.toString().slice(0, ALGORAND_SEED_LENGTH); // removing the extra '===='
}

module.exports = {
  isValidSeed,
  decode,
  encode
};
