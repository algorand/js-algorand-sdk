import { Buffer } from 'buffer';
import { isNode } from '../utils/utils';

/**
 * Convert a base64 string to a Uint8Array for Node.js and browser environments.
 * @returns A Uint8Array
 */
export function base64ToBytes(base64String: string): Uint8Array {
  if (isNode()) {
    return new Uint8Array(Buffer.from(base64String, 'base64'));
  }
  /* eslint-env browser */
  const binString = atob(base64String);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

/**
 * Decode a base64 string for Node.js and browser environments.
 * @returns A decoded string
 */
export function base64ToString(base64String: string): string {
  if (isNode()) {
    return Buffer.from(base64String, 'base64').toString();
  }
  const binString = base64ToBytes(base64String);
  return new TextDecoder().decode(binString);
}

/**
 * Convert a Uint8Array to a base64 string for Node.js and browser environments.
 * @returns A base64 string
 */
export function bytesToBase64(byteArray: Uint8Array): string {
  if (isNode()) {
    return Buffer.from(byteArray).toString('base64');
  }
  /* eslint-env browser */
  const binString = Array.from(byteArray, (x) => String.fromCodePoint(x)).join(
    ''
  );
  return btoa(binString);
}

/**
 * Convert a a Uint8Array to a hex string for Node.js and browser environments.
 * @returns A hex string
 */
export function bytesToHex(byteArray: Uint8Array): string {
  if (isNode()) {
    return Buffer.from(byteArray).toString('hex');
  }
  return Array.from(byteArray)
    .map((i) => i.toString(16).padStart(2, '0'))
    .join('');
}
