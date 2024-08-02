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
 * msgpackRawEncode encodes objects using msgpack, regardless of whether there are
 * empty or 0 value fields.
 * @param obj - a dictionary to be encoded. May or may not contain empty or 0 values.
 * @returns msgpack representation of the object
 */
export function msgpackRawEncode(obj: unknown) {
  // enable the canonical option
  const options: EncoderOptions = { sortKeys: true };
  return msgpackEncode(obj, options);
}

/**
 * encodeObj takes a javascript object and returns its msgpack encoding
 * Note that the encoding sorts the fields alphabetically
 * @param o - js object to be encoded. Must not contain empty or 0 values.
 * @returns Uint8Array binary representation
 * @throws Error containing ERROR_CONTAINS_EMPTY_STRING if the object contains empty or zero values
 *
 * @deprecated Use {@link msgpackRawEncode} instead. Note that function does not
 *   check for empty values like this one does.
 */
export function encodeObj(obj: Record<string | number | symbol, any>) {
  // Check for empty values
  const emptyCheck = containsEmpty(obj);
  if (emptyCheck.containsEmpty) {
    throw new Error(ERROR_CONTAINS_EMPTY_STRING + emptyCheck.firstEmptyKey);
  }
  return msgpackRawEncode(obj);
}

function intDecodingToIntMode(intDecoding: IntDecoding): IntMode {
  switch (intDecoding) {
    case IntDecoding.UNSAFE:
      return IntMode.UNSAFE_NUMBER;
    case IntDecoding.SAFE:
      return IntMode.SAFE_NUMBER;
    case IntDecoding.MIXED:
      return IntMode.MIXED;
    case IntDecoding.BIGINT:
      return IntMode.BIGINT;
    default:
      throw new Error(`Invalid intDecoding: ${intDecoding}`);
  }
}

/**
 * Decodes msgpack bytes into a plain JavaScript object.
 * @param buffer - The msgpack bytes to decode
 * @param options - Options for decoding, including int decoding mode. See {@link IntDecoding} for more information.
 * @returns The decoded object
 */
export function msgpackRawDecode(
  buffer: ArrayLike<number>,
  options?: { intDecoding: IntDecoding }
) {
  const decoderOptions: DecoderOptions = {
    intMode: options?.intDecoding
      ? intDecodingToIntMode(options?.intDecoding)
      : IntMode.BIGINT,
  };
  return msgpackDecode(buffer, decoderOptions);
}

/**
 * decodeObj takes a Uint8Array and returns its javascript obj
 * @param o - Uint8Array to decode
 * @returns object
 *
 * @deprecated Use {@link msgpackRawDecode} instead. Note that this function uses `IntDecoding.MIXED`
 *   while `msgpackRawDecode` defaults to `IntDecoding.BIGINT` for int decoding, though it is
 *   configurable.
 */
export function decodeObj(o: ArrayLike<number>) {
  return msgpackRawDecode(o, { intDecoding: IntDecoding.MIXED });
}

/**
 * Decodes msgpack bytes into a Map object. This supports decoding non-string map keys.
 * @param encoded - The msgpack bytes to decode
 * @param options - Options for decoding, including int decoding mode. See {@link IntDecoding} for more information.
 * @returns The decoded Map object
 */
export function msgpackRawDecodeAsMap(
  encoded: ArrayLike<number>,
  options?: { intDecoding: IntDecoding }
) {
  const decoderOptions: DecoderOptions = {
    intMode: options?.intDecoding
      ? intDecodingToIntMode(options?.intDecoding)
      : IntMode.BIGINT,
    useMap: true,
  };
  return msgpackDecode(encoded, decoderOptions);
}

function msgpackRawDecodeAsMapWithRawStrings(
  encoded: ArrayLike<number>,
  options?: { intDecoding: IntDecoding }
) {
  const decoderOptions: DecoderOptions = {
    intMode: options?.intDecoding
      ? intDecodingToIntMode(options?.intDecoding)
      : IntMode.BIGINT,
    useMap: true,
    rawBinaryStringKeys: true,
    rawBinaryStringValues: true,
    useRawBinaryStringClass: true,
  };
  return msgpackDecode(encoded, decoderOptions);
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
  key: string | number | bigint | Uint8Array | RawBinaryString;
}

/**
 * This class is used to index into an encoded msgpack object and extract raw strings.
 */
export class MsgpackRawStringProvider {
  // eslint-disable-next-line no-use-before-define
  private readonly parent?: MsgpackRawStringProvider;

  private readonly baseObjectBytes?: ArrayLike<number>;

  private readonly segment?: MsgpackObjectPathSegment;

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

  /**
   * Create a new provider that resolves to the current provider's map value at the given key.
   */
  public withMapValue(
    key: string | number | bigint | Uint8Array | RawBinaryString
  ): MsgpackRawStringProvider {
    return new MsgpackRawStringProvider({
      parent: this,
      segment: {
        kind: MsgpackObjectPathSegmentKind.MAP_VALUE,
        key,
      },
    });
  }

  /**
   * Create a new provider that resolves to the current provider's array element at the given index.
   */
  public withArrayElement(index: number): MsgpackRawStringProvider {
    return new MsgpackRawStringProvider({
      parent: this,
      segment: {
        kind: MsgpackObjectPathSegmentKind.ARRAY_ELEMENT,
        key: index,
      },
    });
  }

  /**
   * Get the raw string at the current location. If the current location is not a raw string, an error is thrown.
   */
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

  /**
   * Get the raw string map keys and values at the current location. If the current location is not a map, an error is thrown.
   */
  public getRawStringKeysAndValuesAtCurrentLocation(): Map<
    Uint8Array,
    MsgpackEncodingData
  > {
    const resolved = this.resolve();
    if (!(resolved instanceof Map)) {
      throw new Error(
        `Invalid type. Expected Map, got ${resolved} (${typeof resolved})`
      );
    }
    const keysAndValues = new Map<Uint8Array, MsgpackEncodingData>();
    for (const [key, value] of resolved) {
      if (key instanceof RawBinaryString) {
        // Decoded rawBinaryValue will always be a Uint8Array
        keysAndValues.set(key.rawBinaryValue as Uint8Array, value);
      } else {
        throw new Error(
          `Invalid type for map key. Expected RawBinaryString, got ${key} (${typeof key})`
        );
      }
    }
    return keysAndValues;
  }

  /**
   * Resolve the provider by extracting the value it indicates from the base msgpack object.
   */
  private resolve(): MsgpackEncodingData {
    if (this.resolvedCachePresent) {
      return this.resolvedCache;
    }
    let parentResolved: MsgpackEncodingData;
    if (this.parent) {
      parentResolved = this.parent.resolve();
    } else {
      // Need to parse baseObjectBytes
      parentResolved = msgpackRawDecodeAsMapWithRawStrings(
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
        this.segment.key instanceof Uint8Array ||
        this.segment.key instanceof RawBinaryString
      ) {
        const targetBytes =
          this.segment.key instanceof RawBinaryString
            ? // Decoded rawBinaryValue will always be a Uint8Array
              (this.segment.key.rawBinaryValue as Uint8Array)
            : coerceToBytes(this.segment.key);
        const targetIsRawString =
          typeof this.segment.key === 'string' ||
          this.segment.key instanceof RawBinaryString;
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

  /**
   * Get the path string of the current location indicated by the provider. Useful for debugging.
   */
  public getPathString(): string {
    const parentPathString = this.parent ? this.parent.getPathString() : 'root';
    if (!this.segment) {
      return parentPathString;
    }
    if (this.segment.kind === MsgpackObjectPathSegmentKind.MAP_VALUE) {
      return `${parentPathString} -> map key "${this.segment.key}" (${typeof this.segment.key})`;
    }
    if (this.segment.kind === MsgpackObjectPathSegmentKind.ARRAY_ELEMENT) {
      return `${parentPathString} -> array index ${this.segment.key} (${typeof this.segment.key})`;
    }
    return `${parentPathString} -> unknown segment kind ${this.segment.kind}`;
  }
}

/**
 * Options for {@link Schema.prepareJSON}
 */
export interface PrepareJSONOptions {
  /**
   * If true, allows invalid UTF-8 binary strings to be converted to JSON strings.
   *
   * Otherwise, an error will be thrown if encoding a binary string to a JSON cannot be done losslessly.
   */
  lossyBinaryStringConversion?: boolean;
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
  public abstract prepareJSON(
    data: unknown,
    options: PrepareJSONOptions
  ): JSONEncodingData;

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
  const decoded = msgpackRawDecodeAsMap(encoded) as MsgpackEncodingData;
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
  return msgpackRawEncode(
    e.getEncodingSchema().prepareMsgpack(e.toEncodingData())
  );
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
    intDecoding: IntDecoding.BIGINT,
  });
  return c.fromEncodingData(
    c.encodingSchema.fromPreparedJSON(decoded) as JSONEncodingData
  );
}

export interface EncodeJSONOptions {
  /**
   * Adds indentation, white space, and line break characters to the return-value JSON text to make
   * it easier to read.
   */
  space?: string | number;

  /**
   * If true, allows invalid UTF-8 binary strings to be converted to JSON strings.
   *
   * Otherwise, an error will be thrown if encoding a binary string to a JSON cannot be done losslessly.
   */
  lossyBinaryStringConversion?: boolean;
}

/**
 * Encode an Encodable object to a JSON string.
 * @param e - The object to encode
 * @param options - Optional encoding options. See {@link EncodeJSONOptions} for more information.
 * @returns A JSON string encoding of the object
 */
export function encodeJSON(e: Encodable, options?: EncodeJSONOptions): string {
  const { space, ...prepareJSONOptions } = options ?? {};
  const prepared = e
    .getEncodingSchema()
    .prepareJSON(e.toEncodingData(), prepareJSONOptions);
  return stringifyJSON(prepared, undefined, space);
}
