const { Buffer } = require('buffer');

/**
 * encodeUint64 converts an integer to its binary representation.
 * @param {number | bigint} num The number to convert. This must be an unsigned integer less than
 *   2^64.
 * @returns {Uint8Array} An 8-byte typed array containing the big-endian encoding of the input
 *   integer.
 */
function encodeUint64(num) {
  const isInteger = typeof num === 'bigint' || Number.isInteger(num);

  if (!isInteger || num < 0 || num > 0xffffffffffffffffn) {
    throw new Error('Input is not a 64-bit unsigned integer');
  }

  const buf = Buffer.allocUnsafe(8);

  buf.writeBigUInt64BE(BigInt(num));

  return new Uint8Array(buf);
}

/**
 * decodeUint64 produces an integer from a binary representation.
 * @param {Uint8Array} data An typed array containing the big-endian encoding of an unsigned integer
 *   less than 2^64. This array must be at most 8 bytes long.
 * @param {"safe" | "mixed" | "bigint"} decodingMode Configure how the integer will be
 *   decoded.
 *
 *   The options are:
 *   * "safe": The integer will be decoded as a Number, but if it is greater than
 *     Number.MAX_SAFE_INTEGER an error will be thrown.
 *   * "mixed": The integer will be decoded as a Number if it is less than or equal to
 *     Number.MAX_SAFE_INTEGER, otherwise it will be decoded as a BigInt.
 *   * "bigint": The integer will always be decoded as a BigInt.
 *
 *   Defaults to "safe" if not included.
 * @returns {number | bigint} The integer that was encoded in the input data. The return type will
 *   be determined by the parameter decodingMode.
 */
function decodeUint64(data, decodingMode = 'safe') {
  if (
    decodingMode !== 'safe' &&
    decodingMode !== 'mixed' &&
    decodingMode !== 'bigint'
  ) {
    throw new Error(`Unknown decodingMode option: ${decodingMode}`);
  }

  if (data.byteLength === 0 || data.byteLength > 8) {
    throw new Error(
      `Data has unacceptable length. Expected length is between 1 and 8, got ${data.byteLength}`
    );
  }

  // insert 0s at the beginning if data is smaller than 8 bytes
  const padding = Buffer.allocUnsafe(8 - data.byteLength);
  padding.fill(0);

  const buf = Buffer.concat([padding, Buffer.from(data)]);

  const num = buf.readBigUInt64BE();
  const isBig = num > Number.MAX_SAFE_INTEGER;

  if (decodingMode === 'safe') {
    if (isBig) {
      throw new Error(
        `Integer exceeds maximum safe integer: ${num.toString()}. Try decoding with "mixed" or "safe" decodingMode.`
      );
    }
    return Number(num);
  }

  if (decodingMode === 'mixed' && !isBig) {
    return Number(num);
  }

  return num;
}

module.exports = {
  encodeUint64,
  decodeUint64,
};
