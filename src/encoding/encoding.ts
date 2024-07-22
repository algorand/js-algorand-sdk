/**
 * This file is a wrapper of msgpack.js.
 * The wrapper was written in order to ensure correct encoding of Algorand Transaction and other formats.
 * In particular, it matches go-algorand blockchain client, written in go (https://www.github.com/algorand/go-algorand.
 * Algorand's msgpack encoding follows to following rules -
 *  1. Every integer must be encoded to the smallest type possible (0-255-\>8bit, 256-65535-\>16bit, etx)
 *  2. All fields names must be sorted
 *  3. All empty and 0 fields should be omitted
 *  4. Every positive number must be encoded as uint
 *  5. Binary blob should be used for binary data and string for strings
 *  */

import {
  encode as msgpackEncode,
  EncoderOptions,
  decode as msgpackDecode,
  DecoderOptions,
  IntMode,
  RawBinaryString,
} from 'algorand-msgpack';
import { bytesToBase64, coerceToBytes } from './binarydata.js';
import IntDecoding from '../types/intDecoding.js';
import { stringifyJSON, parseJSON, arrayEqual } from '../utils/utils.js';

// Errors
export const ERROR_CONTAINS_EMPTY_STRING =
  'The object contains empty or 0 values. First empty or 0 value encountered during encoding: ';

/**
 * containsEmpty returns true if any of the object's values are empty, false otherwise.
 * Empty arrays considered empty
 * @param obj - The object to check
 * @returns \{true, empty key\} if contains empty, \{false, undefined\} otherwise
 */
function containsEmpty(obj: Record<string | number | symbol, any>) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (!obj[key] || obj[key].length === 0) {
        return { containsEmpty: true, firstEmptyKey: key };
      }
    }
  }
  return { containsEmpty: false, firstEmptyKey: undefined };
}

/**
 * rawEncode encodes objects using msgpack, regardless of whether there are
 * empty or 0 value fields.
 * @param obj - a dictionary to be encoded. May or may not contain empty or 0 values.
 * @returns msgpack representation of the object
 */
export function rawEncode(obj: unknown) {
  // enable the canonical option
  const options: EncoderOptions = { sortKeys: true };
  return msgpackEncode(obj, options);
}

/**
 * encode encodes objects using msgpack
 * @param obj - a dictionary to be encoded. Must not contain empty or 0 values.
 * @returns msgpack representation of the object
 * @throws Error containing ERROR_CONTAINS_EMPTY_STRING if the object contains empty or zero values
 */
export function encode(obj: Record<string | number | symbol, any>) {
  // Check for empty values
  const emptyCheck = containsEmpty(obj);
  if (emptyCheck.containsEmpty) {
    throw new Error(ERROR_CONTAINS_EMPTY_STRING + emptyCheck.firstEmptyKey);
  }

  // enable the canonical option
  return rawEncode(obj);
}

export function decode(buffer: ArrayLike<number>) {
  // TODO: make IntMode an argument
  const options: DecoderOptions = { intMode: IntMode.MIXED };
  return msgpackDecode(buffer, options);
}

export function decodeAsMap(encoded: ArrayLike<number>) {
  // TODO: make IntMode an argument
  const options: DecoderOptions = { intMode: IntMode.MIXED, useMap: true };
  return msgpackDecode(encoded, options);
}

function decodeAsMapWithRawStrings(encoded: ArrayLike<number>) {
  // TODO: make IntMode an argument
  const options: DecoderOptions = {
    intMode: IntMode.BIGINT,
    useMap: true,
    rawBinaryStringKeys: true,
    rawBinaryStringValues: true,
    useRawBinaryStringClass: true,
  };
  return msgpackDecode(encoded, options);
}

export type MsgpackEncodingData =
  | null
  | undefined
  | string
  | number
  | bigint
  | boolean
  | Uint8Array
  | MsgpackEncodingData[]
  | Map<string | number | bigint | Uint8Array, MsgpackEncodingData>;

export type JSONEncodingData =
  | null
  | undefined
  | string
  | number
  | bigint
  | boolean
  | JSONEncodingData[]
  | { [key: string]: JSONEncodingData };

export function msgpackEncodingDataToJSONEncodingData(
  e: MsgpackEncodingData
): JSONEncodingData {
  if (e === null || e === undefined) {
    return e;
  }
  if (e instanceof Uint8Array) {
    return bytesToBase64(e);
  }
  if (Array.isArray(e)) {
    return e.map(msgpackEncodingDataToJSONEncodingData);
  }
  if (e instanceof Map) {
    const obj: { [key: string]: JSONEncodingData } = {};
    for (const [k, v] of e) {
      if (typeof k !== 'string') {
        throw new Error(`JSON map key must be a string: ${k}`);
      }
      obj[k] = msgpackEncodingDataToJSONEncodingData(v);
    }
    return obj;
  }
  return e;
}

export function jsonEncodingDataToMsgpackEncodingData(
  e: JSONEncodingData
): MsgpackEncodingData {
  if (e === null || e === undefined) {
    return e;
  }
  if (
    typeof e === 'string' || // Note, this will not convert base64 to Uint8Array
    typeof e === 'number' ||
    typeof e === 'bigint' ||
    typeof e === 'boolean'
  ) {
    return e;
  }
  if (Array.isArray(e)) {
    return e.map(jsonEncodingDataToMsgpackEncodingData);
  }
  if (typeof e === 'object') {
    const obj = new Map<string, MsgpackEncodingData>();
    for (const [key, value] of Object.entries(e)) {
      obj.set(key, jsonEncodingDataToMsgpackEncodingData(value));
    }
    return obj;
  }
  throw new Error(`Invalid JSON encoding data: ${e}`);
}

/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor,no-empty-function */

enum MsgpackObjectPathSegmentKind {
  MAP_VALUE,
  ARRAY_ELEMENT,
}

interface MsgpackObjectPathSegment {
  kind: MsgpackObjectPathSegmentKind;
  key: string | number | bigint | Uint8Array;
}

export class MsgpackRawStringProvider {
  // eslint-disable-next-line no-use-before-define
  private readonly parent?: MsgpackRawStringProvider;

  private readonly baseObjectBytes?: ArrayLike<number>;

  private readonly segment?;

  private resolvedCache: MsgpackEncodingData = null;
  private resolvedCachePresent = false;

  public constructor({
    parent,
    segment,
    baseObjectBytes,
  }:
    | {
        parent: MsgpackRawStringProvider;
        segment: MsgpackObjectPathSegment;
        baseObjectBytes?: undefined;
      }
    | {
        parent?: undefined;
        segment?: undefined;
        baseObjectBytes: ArrayLike<number>;
      }) {
    this.parent = parent;
    this.segment = segment;
    this.baseObjectBytes = baseObjectBytes;
  }

  public withMapValue(
    key: string | number | bigint | Uint8Array
  ): MsgpackRawStringProvider {
    return new MsgpackRawStringProvider({
      parent: this,
      segment: {
        kind: MsgpackObjectPathSegmentKind.MAP_VALUE,
        key,
      },
    });
  }

  public withArrayElement(index: number): MsgpackRawStringProvider {
    return new MsgpackRawStringProvider({
      parent: this,
      segment: {
        kind: MsgpackObjectPathSegmentKind.ARRAY_ELEMENT,
        key: index,
      },
    });
  }

  public getRawStringAtCurrentLocation(): Uint8Array {
    const resolved = this.resolve();
    if (resolved instanceof RawBinaryString) {
      // Decoded rawBinaryValue will always be a Uint8Array
      return resolved.rawBinaryValue as Uint8Array;
    }
    throw new Error(
      `Invalid type. Expected RawBinaryString, got ${resolved} (${typeof resolved})`
    );
  }

  public getRawStringKeysAtCurrentLocation(): Uint8Array[] {
    const resolved = this.resolve();
    if (!(resolved instanceof Map)) {
      throw new Error(
        `Invalid type. Expected Map, got ${resolved} (${typeof resolved})`
      );
    }
    const keys: Uint8Array[] = [];
    for (const key of resolved.keys()) {
      if (key instanceof RawBinaryString) {
        // Decoded rawBinaryValue will always be a Uint8Array
        keys.push(key.rawBinaryValue as Uint8Array);
      } else {
        throw new Error(
          `Invalid type for map key. Expected RawBinaryString, got (${typeof key}) ${key}`
        );
      }
    }
    return keys;
  }

  private resolve(): MsgpackEncodingData {
    if (this.resolvedCachePresent) {
      return this.resolvedCache;
    }
    let parentResolved: MsgpackEncodingData;
    if (this.parent) {
      parentResolved = this.parent.resolve();
    } else {
      // Need to parse baseObjectBytes
      parentResolved = decodeAsMapWithRawStrings(
        this.baseObjectBytes!
      ) as MsgpackEncodingData;
    }
    if (!this.segment) {
      this.resolvedCache = parentResolved;
      this.resolvedCachePresent = true;
      return parentResolved;
    }
    if (this.segment.kind === MsgpackObjectPathSegmentKind.MAP_VALUE) {
      if (!(parentResolved instanceof Map)) {
        throw new Error(
          `Invalid type. Expected Map, got ${parentResolved} (${typeof parentResolved})`
        );
      }
      // All decoded map keys will be raw strings, and Map objects compare complex values by reference,
      // so we must check all the values for value-equality.
      if (
        typeof this.segment.key === 'string' ||
        this.segment.key instanceof Uint8Array
      ) {
        const targetBytes = coerceToBytes(this.segment.key);
        const targetIsRawString = typeof this.segment.key === 'string';
        for (const [key, value] of parentResolved) {
          let potentialKeyBytes: Uint8Array | undefined;
          if (targetIsRawString) {
            if (key instanceof RawBinaryString) {
              // Decoded rawBinaryValue will always be a Uint8Array
              potentialKeyBytes = key.rawBinaryValue as Uint8Array;
            }
          } else if (key instanceof Uint8Array) {
            potentialKeyBytes = key;
          }
          if (potentialKeyBytes && arrayEqual(targetBytes, potentialKeyBytes)) {
            this.resolvedCache = value;
            break;
          }
        }
      } else {
        this.resolvedCache = parentResolved.get(this.segment.key);
      }
      this.resolvedCachePresent = true;
      return this.resolvedCache;
    }
    if (this.segment.kind === MsgpackObjectPathSegmentKind.ARRAY_ELEMENT) {
      if (!Array.isArray(parentResolved)) {
        throw new Error(
          `Invalid type. Expected Array, got ${parentResolved} (${typeof parentResolved})`
        );
      }
      this.resolvedCache = parentResolved[this.segment.key as number];
      this.resolvedCachePresent = true;
      return this.resolvedCache;
    }
    throw new Error(`Invalid segment kind: ${this.segment.kind}`);
  }
}

/**
 * A Schema is used to prepare objects for encoding and decoding from msgpack and JSON.
 *
 * Schemas represent a specific type.
 */
export abstract class Schema {
  /**
   * Get the default value for this type.
   */
  public abstract defaultValue(): unknown;

  /**
   * Checks if the value is the default value for this type.
   * @param data - The value to check
   * @returns True if the value is the default value, false otherwise
   */
  public abstract isDefaultValue(data: unknown): boolean;

  /**
   * Prepares the encoding data for encoding to msgpack.
   * @param data - Encoding data to be prepared.
   * @returns A value ready to be msgpack encoded.
   */
  public abstract prepareMsgpack(data: unknown): MsgpackEncodingData;

  /**
   * Restores the encoding data from a msgpack encoding object.
   * @param encoded - The msgpack encoding object to restore.
   * @param rawStringProvider - A provider for raw strings.
   * @returns The original encoding data.
   */
  public abstract fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    rawStringProvider: MsgpackRawStringProvider
  ): unknown;

  /**
   * Prepares the encoding data for encoding to JSON.
   * @param data - The JSON encoding data to be prepared.
   * @returns A value ready to be JSON encoded.
   */
  public abstract prepareJSON(data: unknown): JSONEncodingData;

  /**
   * Restores the encoding data from a JSON encoding object.
   * @param encoded - The JSON encoding object to restore.
   * @returns The original encoding data.
   */
  public abstract fromPreparedJSON(encoded: JSONEncodingData): unknown;
}

/**
 * An interface for objects that can be encoded and decoded to/from msgpack and JSON.
 */
export interface Encodable {
  /**
   * Extract the encoding data for this object. This data, after being prepared by the encoding
   * Schema, can be encoded to msgpack or JSON.
   */
  toEncodingData(): unknown;
  /**
   * Get the encoding Schema for this object, used to prepare the encoding data for msgpack and JSON.
   */
  getEncodingSchema(): Schema;
}

/**
 * A type that represents the class of an Encodable object.
 */
export interface EncodableClass<T extends Encodable> {
  /**
   * Create a new instance of this class from the given encoding data.
   * @param data - The encoding data to create the object from
   */
  fromEncodingData(data: unknown): T;
  /**
   * The encoding Schema for this class, used to prepare encoding data from msgpack and JSON.
   */
  readonly encodingSchema: Schema;
}

/**
 * Decode a msgpack byte array to an Encodable object.
 * @param encoded - The msgpack bytes to decode
 * @param c - The class of the object to decode. This class must match the object that was encoded.
 * @returns An instance of the class with the decoded data
 */
export function decodeMsgpack<T extends Encodable>(
  encoded: ArrayLike<number>,
  c: EncodableClass<T>
): T {
  const decoded = decodeAsMap(encoded) as MsgpackEncodingData;
  const rawStringProvider = new MsgpackRawStringProvider({
    baseObjectBytes: encoded,
  });
  return c.fromEncodingData(
    c.encodingSchema.fromPreparedMsgpack(decoded, rawStringProvider)
  );
}

/**
 * Encode an Encodable object to a msgpack byte array.
 * @param e - The object to encode
 * @returns A msgpack byte array encoding of the object
 */
export function encodeMsgpack(e: Encodable): Uint8Array {
  return rawEncode(e.getEncodingSchema().prepareMsgpack(e.toEncodingData()));
}

/**
 * Decode a JSON string to an Encodable object.
 * @param encoded - The JSON string to decode
 * @param c - The class of the object to decode. This class must match the object that was encoded.
 * @returns An instance of the class with the decoded data
 */
export function decodeJSON<T extends Encodable>(
  encoded: string,
  c: EncodableClass<T>
): T {
  const decoded: JSONEncodingData = parseJSON(encoded, {
    intDecoding: IntDecoding.MIXED,
  });
  return c.fromEncodingData(
    c.encodingSchema.fromPreparedJSON(decoded) as JSONEncodingData
  );
}

/**
 * Encode an Encodable object to a JSON string.
 * @param e - The object to encode
 * @param space - Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns A JSON string encoding of the object
 */
export function encodeJSON(e: Encodable, space?: string | number): string {
  const prepared = e.getEncodingSchema().prepareJSON(e.toEncodingData());
  return stringifyJSON(prepared, undefined, space);
}
