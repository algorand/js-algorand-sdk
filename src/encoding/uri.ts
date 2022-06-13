/**
 * This file contains URI encoding schemes for Uint8Arrays and Buffers.
 *
 * If there are non UTF-8 characters in the box name, the name will be converted
 * to its corresponding hex value and escaped in the URL.
 *  */

const isUrlSafe = (char) => {
  const urlSafePattern = /[a-zA-Z0-9\-_~.]+/;
  return urlSafePattern.test(char);
};

export function encodeURLFromBytes(buf: Uint8Array) {
  if (!(buf instanceof Uint8Array)) {
    throw TypeError(`Argument ${buf} must be in bytes`);
  }
  let encoded = '';
  for (let i = 0; i < buf.length; i++) {
    const charBuf = Buffer.from('00', 'hex');
    charBuf.writeUInt8(buf[i]);
    const char = charBuf.toString();
    if (isUrlSafe(char)) {
      encoded += char;
    } else {
      encoded += `%${charBuf.toString('hex').toUpperCase()}`;
    }
  }
  return encoded;
}
