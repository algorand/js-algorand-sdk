import JSONbigWithoutConfig from 'json-bigint';
import IntDecoding from '../types/intDecoding.js';

const JSONbig = JSONbigWithoutConfig({
  useNativeBigInt: true,
  strict: true,
});

export interface ParseJSONOptions {
  intDecoding: IntDecoding;
}

/**
 * Parse JSON with additional options.
 * @param str - The JSON string to parse.
 * @param options - Configures how integers in this JSON string will be decoded. See the
 *   `IntDecoding` enum for more details.
 */
export function parseJSON(str: string, { intDecoding }: ParseJSONOptions) {
  if (
    intDecoding !== IntDecoding.SAFE &&
    intDecoding !== IntDecoding.UNSAFE &&
    intDecoding !== IntDecoding.BIGINT &&
    intDecoding !== IntDecoding.MIXED
  ) {
    throw new Error(`Invalid intDecoding option: ${intDecoding}`);
  }
  return JSONbig.parse(str, (_, value) => {
    if (
      value != null &&
      typeof value === 'object' &&
      Object.getPrototypeOf(value) == null
    ) {
      // JSONbig.parse objects are created with Object.create(null) and thus have a null prototype
      // let us remedy that
      Object.setPrototypeOf(value, Object.prototype);
    }

    if (typeof value === 'bigint') {
      if (intDecoding === IntDecoding.SAFE && value > Number.MAX_SAFE_INTEGER) {
        throw new Error(
          `Integer exceeds maximum safe integer: ${value.toString()}. Try parsing with a different intDecoding option.`
        );
      }
      if (
        intDecoding === IntDecoding.BIGINT ||
        (intDecoding === IntDecoding.MIXED && value > Number.MAX_SAFE_INTEGER)
      ) {
        return value;
      }
      // JSONbig.parse converts number to BigInts if they are >= 10**15. This is smaller than
      // Number.MAX_SAFE_INTEGER, so we can convert some BigInts back to normal numbers.
      return Number(value);
    }

    if (typeof value === 'number') {
      if (intDecoding === IntDecoding.BIGINT && Number.isInteger(value)) {
        return BigInt(value);
      }
    }

    return value;
  });
}

/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
 *
 * This functions differs from the built-in JSON.stringify in that it supports serializing BigInts.
 *
 * This function takes the same arguments as the built-in JSON.stringify function.
 *
 * @param value - A JavaScript value, usually an object or array, to be converted.
 * @param replacer - A function that transforms the results.
 * @param space - Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 */
export function stringifyJSON(
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number
): string {
  return JSONbig.stringify(value, replacer, space);
}

/**
 * ArrayEqual takes two arrays and return true if equal, false otherwise
 */
export function arrayEqual<T>(a: ArrayLike<T>, b: ArrayLike<T>): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return Array.from(a).every((val, i) => val === b[i]);
}

/**
 * ConcatArrays takes n number arrays and returns a joint Uint8Array
 * @param arrs - An arbitrary number of n array-like number list arguments
 * @returns [a,b]
 */
export function concatArrays(...arrs: ArrayLike<number>[]) {
  const size = arrs.reduce((sum, arr) => sum + arr.length, 0);
  const c = new Uint8Array(size);

  let offset = 0;
  for (let i = 0; i < arrs.length; i++) {
    c.set(arrs[i], offset);
    offset += arrs[i].length;
  }

  return c;
}

/**
 * Remove undefined properties from an object
 * @param obj - An object, preferably one with some undefined properties
 * @returns A copy of the object with undefined properties removed
 */
export function removeUndefinedProperties(
  obj: Record<string | number | symbol, any>
) {
  const mutableCopy = { ...obj };
  Object.keys(mutableCopy).forEach((key) => {
    if (typeof mutableCopy[key] === 'undefined') delete mutableCopy[key];
  });
  return mutableCopy;
}

/**
 * Check whether the environment is Node.js (as opposed to the browser)
 * @returns True if Node.js environment, false otherwise
 */
export function isNode() {
  return (
    // @ts-ignore
    typeof process === 'object' &&
    // @ts-ignore
    typeof process.versions === 'object' &&
    // @ts-ignore
    typeof process.versions.node !== 'undefined'
  );
}

/**
 * Check whether the environment is ReactNative
 * @returns True if ReactNative, false otherwise
 */
export function isReactNative() {
  const { navigator } = globalThis as { navigator?: { product?: string } };
  if (typeof navigator === 'object' && navigator.product === 'ReactNative') {
    return true;
  }
  return false;
}

export function ensureSafeInteger(value: unknown): number {
  if (typeof value === 'undefined') {
    throw new Error('Value is undefined');
  }
  if (typeof value === 'bigint') {
    if (
      value > BigInt(Number.MAX_SAFE_INTEGER) ||
      value < BigInt(Number.MIN_SAFE_INTEGER)
    ) {
      throw new Error(`BigInt value ${value} is not a safe integer`);
    }
    return Number(value);
  }
  if (typeof value === 'number') {
    if (Number.isSafeInteger(value)) {
      return value;
    }
    throw new Error(`Value ${value} is not a safe integer`);
  }
  throw new Error(`Unexpected type ${typeof value}, ${value}`);
}

export function ensureSafeUnsignedInteger(value: unknown): number {
  const intValue = ensureSafeInteger(value);
  if (intValue < 0) {
    throw new Error(`Value ${intValue} is negative`);
  }
  return intValue;
}

export function ensureBigInt(value: unknown): bigint {
  if (typeof value === 'undefined') {
    throw new Error('Value is undefined');
  }
  if (typeof value === 'bigint') {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new Error(`Value ${value} is not a safe integer`);
    }
    return BigInt(value);
  }
  throw new Error(`Unexpected type ${typeof value}, ${value}`);
}

export function ensureUint64(value: unknown): bigint {
  const bigIntValue = ensureBigInt(value);
  if (bigIntValue < 0 || bigIntValue > BigInt('0xffffffffffffffff')) {
    throw new Error(`Value ${bigIntValue} is not a uint64`);
  }
  return bigIntValue;
}
