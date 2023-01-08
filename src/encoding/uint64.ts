/**
 * encodeUint64 converts an integer to its binary representation.
 * @param num - The number to convert. This must be an unsigned integer less than
 *   2^64.
 * @returns An 8-byte typed array containing the big-endian encoding of the input
 *   integer.
 */
export function encodeUint64(dec: number) {
  let binString = convertToBinary(dec)

  while (true) {
    if (binString.length < 64) {
      binString = "0" + binString
    }
    else {
      break
    }
  }

  let array : number[] = [];

  for (let i = 0; i < 64; i += 8) {
    let piece = binString.slice(i, i + 8)
    piece += ""
    let pieceNumber = parseInt(piece, 2)
    array.push(pieceNumber)
  }

  return Uint8Array.from(array)

}

function convertToBinary (num: number) {
  let binary = (num % 2).toString();
  for (; num > 1; ) {
      num = parseInt(String(num / 2));
      binary =  (num % 2) + (binary);
  }
  return binary
}

/**
 * decodeUint64 produces an integer from a binary representation.
 * @param data - An typed array containing the big-endian encoding of an unsigned integer
 *   less than 2^64. This array must be at most 8 bytes long.
 * @param decodingMode - Configure how the integer will be
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
 * @returns The integer that was encoded in the input data. The return type will
 *   be determined by the parameter decodingMode.
 */
export function decodeUint64(data: Uint8Array, decodingMode: 'safe'): number;
export function decodeUint64(
  data: Uint8Array,
  decodingMode: 'mixed'
): number | bigint;
export function decodeUint64(data: Uint8Array, decodingMode: 'bigint'): bigint;
export function decodeUint64(data: any, decodingMode: any = 'safe') {
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
