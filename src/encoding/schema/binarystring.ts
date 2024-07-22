import { RawBinaryString } from 'algorand-msgpack';
import {
  Schema,
  MsgpackEncodingData,
  MsgpackRawStringProvider,
  JSONEncodingData,
} from '../encoding.js';
import { coerceToBytes, bytesToString } from '../binarydata.js';

/* eslint-disable class-methods-use-this */

/**
 * SpecialCaseBinaryStringSchema is a schema for byte arrays which are encoded
 * as strings in msgpack and JSON.
 *
 * This schema allows lossless conversion between the in memory representation
 * and the msgpack encoded representation, but NOT between the in memory and
 * JSON encoded representations if the byte array contains invalid UTF-8
 * sequences.
 */
export class SpecialCaseBinaryStringSchema extends Schema {
  public defaultValue(): Uint8Array {
    return new Uint8Array();
  }

  public isDefaultValue(data: unknown): boolean {
    return data instanceof Uint8Array && data.byteLength === 0;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (data instanceof Uint8Array) {
      // TODO: fix cast?
      return new RawBinaryString(data) as unknown as MsgpackEncodingData;
    }
    throw new Error(`Invalid byte array: (${typeof data}) ${data}`);
  }

  public fromPreparedMsgpack(
    _encoded: MsgpackEncodingData,
    rawStringProvider: MsgpackRawStringProvider
  ): Uint8Array {
    return rawStringProvider.getRawStringAtCurrentLocation();
  }

  public prepareJSON(data: unknown): JSONEncodingData {
    if (data instanceof Uint8Array) {
      // WARNING: not safe for all binary data
      return bytesToString(data);
    }
    throw new Error(`Invalid byte array: (${typeof data}) ${data}`);
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Uint8Array {
    if (typeof encoded === 'string') {
      return coerceToBytes(encoded);
    }
    throw new Error(`Invalid byte array: (${typeof encoded}) ${encoded}`);
  }
}
