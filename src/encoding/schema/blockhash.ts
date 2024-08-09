import base32 from 'hi-base32';
import {
  Schema,
  MsgpackEncodingData,
  MsgpackRawStringProvider,
  JSONEncodingData,
  PrepareJSONOptions,
} from '../encoding.js';

/**
 * Length of a block hash in bytes
 */
const blockHashByteLength = 32;

/* eslint-disable class-methods-use-this */

/**
 * Length of a 32-byte encoded in base32 without padding
 */
const base32Length = 52;

/**
 * BlockHashSchema is a schema for block hashes.
 *
 * In msgapck, these types are encoded as 32-byte binary strings. In JSON, they
 * are encoded as strings prefixed with "blk-" followed by the base32 encoding
 * of the 32-byte block hash without any padding.
 */
export class BlockHashSchema extends Schema {
  public defaultValue(): Uint8Array {
    return new Uint8Array(blockHashByteLength);
  }

  public isDefaultValue(data: unknown): boolean {
    return (
      data instanceof Uint8Array &&
      data.byteLength === blockHashByteLength &&
      data.every((byte) => byte === 0)
    );
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (data instanceof Uint8Array && data.byteLength === blockHashByteLength) {
      return data;
    }
    throw new Error(`Invalid block hash: (${typeof data}) ${data}`);
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _rawStringProvider: MsgpackRawStringProvider
  ): Uint8Array {
    if (
      encoded instanceof Uint8Array &&
      encoded.byteLength === blockHashByteLength
    ) {
      return encoded;
    }
    throw new Error(`Invalid block hash: (${typeof encoded}) ${encoded}`);
  }

  public prepareJSON(
    data: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PrepareJSONOptions
  ): JSONEncodingData {
    if (data instanceof Uint8Array && data.byteLength === blockHashByteLength) {
      return `blk-${base32.encode(data).slice(0, base32Length)}`;
    }
    throw new Error(`Invalid block hash: (${typeof data}) ${data}`);
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Uint8Array {
    if (
      typeof encoded === 'string' &&
      encoded.length === base32Length + 4 &&
      encoded.startsWith('blk-')
    ) {
      return Uint8Array.from(base32.decode.asBytes(encoded.slice(4)));
    }
    throw new Error(`Invalid block hash: (${typeof encoded}) ${encoded}`);
  }
}
