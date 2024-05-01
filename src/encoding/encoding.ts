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
} from 'algorand-msgpack';
import { bytesToBase64 } from './binarydata.js';
import IntDecoding from '../types/intDecoding.js';
import { stringifyJSON, parseJSON } from '../utils/utils.js';

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
  // TODO: consider different int mode
  const options: DecoderOptions = { intMode: IntMode.MIXED };
  return msgpackDecode(buffer, options);
}

export function decodeAsMap(encoded: ArrayLike<number>) {
  // TODO: consider different int mode
  const options: DecoderOptions = { intMode: IntMode.MIXED, useMap: true };
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

export abstract class Schema {
  public abstract defaultValue(): unknown;

  public abstract isDefaultValue(data: unknown): boolean;

  public abstract prepareMsgpack(data: unknown): MsgpackEncodingData;

  public abstract fromPreparedMsgpack(encoded: MsgpackEncodingData): unknown;

  public abstract prepareJSON(data: unknown): JSONEncodingData;

  public abstract fromPreparedJSON(encoded: JSONEncodingData): unknown;
}

export interface Encodable {
  toEncodingData(): unknown;
  getEncodingSchema(): Schema;
}

export interface EncodableClass<T extends Encodable> {
  fromEncodingData(data: unknown): T;
  encodingSchema: Schema;
}

export function decodeMsgpack<T extends Encodable>(
  encoded: ArrayLike<number>,
  c: EncodableClass<T>
): T {
  return c.fromEncodingData(
    c.encodingSchema.fromPreparedMsgpack(
      decodeAsMap(encoded) as MsgpackEncodingData
    )
  );
}

export function encodeMsgpack(e: Encodable): Uint8Array {
  return rawEncode(e.getEncodingSchema().prepareMsgpack(e.toEncodingData()));
}

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

export function encodeJSON(e: Encodable, space?: string | number): string {
  const prepared = e.getEncodingSchema().prepareJSON(e.toEncodingData());
  return stringifyJSON(prepared, undefined, space);
}
