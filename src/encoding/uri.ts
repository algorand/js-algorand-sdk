/**
 * This file contains URI encoding schemes for Uint8Arrays and Buffers.
 *
 * If there are non UTF-8 characters in the box name, the name will be converted
 * to its corresponding hex value and escaped in the URL.
 *  */

// TODO: Consider deleting if native URL encoding function will suffice.
function isUrlSafe(char: number): boolean {
  return (
    // Check for alphanumeric characters
    (char >= Buffer.from('a')[0] && char <= Buffer.from('z')[0]) ||
    (char >= Buffer.from('A')[0] && char <= Buffer.from('Z')[0]) ||
    (char >= Buffer.from('0')[0] && char <= Buffer.from('9')[0]) ||
    // Check for [-_~.]
    char === Buffer.from('-')[0] ||
    char === Buffer.from('_')[0] ||
    char === Buffer.from('~')[0] ||
    char === Buffer.from('.')[0]
  );
}

export function encodeURLFromBytes(buf: Uint8Array) {
  if (!(buf instanceof Uint8Array)) {
    throw TypeError(`Argument ${buf} must be in bytes`);
  }
  let encoded = '';
  for (let i = 0; i < buf.length; i++) {
    const charBuf = Buffer.from([buf[i]]);
    if (isUrlSafe(buf[i])) {
      const char = charBuf.toString();
      encoded += char;
    } else {
      encoded += `%${charBuf.toString('hex').toUpperCase()}`;
    }
  }
  return encoded;
}
