import {
  Schema,
  MsgpackEncodingData,
  MsgpackRawStringProvider,
  JSONEncodingData,
  PrepareJSONOptions,
} from '../encoding.js';
import { base64ToBytes, bytesToBase64 } from '../binarydata.js';

/* eslint-disable class-methods-use-this */

export class ByteArraySchema extends Schema {
  public defaultValue(): Uint8Array {
    return new Uint8Array();
  }

  public isDefaultValue(data: unknown): boolean {
    return data instanceof Uint8Array && data.byteLength === 0;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (data instanceof Uint8Array) {
      return data;
    }
    throw new Error(`Invalid byte array: (${typeof data}) ${data}`);
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _rawStringProvider: MsgpackRawStringProvider
  ): Uint8Array {
    if (encoded instanceof Uint8Array) {
      return encoded;
    }
    throw new Error(`Invalid byte array: (${typeof encoded}) ${encoded}`);
  }

  public prepareJSON(
    data: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PrepareJSONOptions
  ): JSONEncodingData {
    if (data instanceof Uint8Array) {
      return bytesToBase64(data);
    }
    throw new Error(`Invalid byte array: (${typeof data}) ${data}`);
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Uint8Array {
    if (encoded === null || encoded === undefined) {
      return this.defaultValue();
    }
    if (typeof encoded === 'string') {
      return base64ToBytes(encoded);
    }
    throw new Error(`Invalid byte array: (${typeof encoded}) ${encoded}`);
  }
}

export class FixedLengthByteArraySchema extends Schema {
  constructor(public readonly length: number) {
    super();
  }

  public defaultValue(): Uint8Array {
    return new Uint8Array(this.length);
  }

  public isDefaultValue(data: unknown): boolean {
    return (
      data instanceof Uint8Array &&
      data.byteLength === this.length &&
      data.every((byte) => byte === 0)
    );
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (data instanceof Uint8Array) {
      if (data.byteLength === this.length) {
        return data;
      }
      throw new Error(
        `Invalid byte array length: wanted ${this.length}, got ${data.byteLength}`
      );
    }
    throw new Error('Invalid byte array');
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _rawStringProvider: MsgpackRawStringProvider
  ): Uint8Array {
    if (encoded instanceof Uint8Array) {
      if (encoded.byteLength === this.length) {
        return encoded;
      }
      throw new Error(
        `Invalid byte array length: wanted ${this.length}, got ${encoded.byteLength}`
      );
    }
    throw new Error('Invalid byte array');
  }

  public prepareJSON(data: unknown): JSONEncodingData {
    if (data instanceof Uint8Array) {
      if (data.byteLength === this.length) {
        return bytesToBase64(data);
      }
      throw new Error(
        `Invalid byte array length: wanted ${this.length}, got ${data.byteLength}`
      );
    }
    throw new Error('Invalid byte array');
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Uint8Array {
    if (typeof encoded === 'string') {
      const bytes = base64ToBytes(encoded);
      if (bytes.byteLength === this.length) {
        return bytes;
      }
      throw new Error(
        `Invalid byte array length: wanted ${this.length}, got ${bytes.byteLength}`
      );
    }
    throw new Error('Invalid base64 byte array');
  }
}
