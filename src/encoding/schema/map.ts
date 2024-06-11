import { Schema, MsgpackEncodingData, JSONEncodingData } from '../encoding.js';
import { ensureUint64 } from '../../utils/utils.js';

/* eslint-disable class-methods-use-this */

export interface NamedMapEntry {
  key: string;
  valueSchema: Schema;
  omitEmpty: boolean;
}

export function allOmitEmpty(
  entries: Array<Omit<NamedMapEntry, 'omitEmpty'>>
): NamedMapEntry[] {
  return entries.map((entry) => ({ ...entry, omitEmpty: true }));
}

/**
 * Schema for a map/struct with a fixed set of string fields.
 */
export class NamedMapSchema extends Schema {
  constructor(public readonly entries: NamedMapEntry[]) {
    super();
  }

  public defaultValue(): Map<string, unknown> {
    const map = new Map<string, unknown>();
    for (const entry of this.entries) {
      map.set(entry.key, entry.valueSchema.defaultValue());
    }
    return map;
  }

  public isDefaultValue(data: unknown): boolean {
    if (!(data instanceof Map)) return false;
    for (const entry of this.entries) {
      if (!entry.valueSchema.isDefaultValue(data.get(entry.key))) {
        return false;
      }
    }
    return true;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `NamedMapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const map = new Map<string, MsgpackEncodingData>();
    for (const entry of this.entries) {
      const value = data.get(entry.key);
      if (entry.omitEmpty && entry.valueSchema.isDefaultValue(value)) {
        continue;
      }
      map.set(entry.key, entry.valueSchema.prepareMsgpack(value));
    }
    return map;
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData
  ): Map<string, unknown> {
    if (!(encoded instanceof Map)) {
      throw new Error('NamedMapSchema data must be a Map');
    }
    const map = new Map<string, unknown>();
    for (const entry of this.entries) {
      if (encoded.has(entry.key)) {
        map.set(
          entry.key,
          entry.valueSchema.fromPreparedMsgpack(encoded.get(entry.key))
        );
      } else if (entry.omitEmpty) {
        map.set(entry.key, entry.valueSchema.defaultValue());
      } else {
        throw new Error(`Missing key: ${entry.key}`);
      }
    }
    return map;
  }

  public prepareJSON(data: unknown): JSONEncodingData {
    if (!(data instanceof Map)) {
      throw new Error('NamedMapSchema data must be a Map');
    }
    const obj: { [key: string]: JSONEncodingData } = {};
    for (const entry of this.entries) {
      const value = data.get(entry.key);
      if (entry.omitEmpty && entry.valueSchema.isDefaultValue(value)) {
        continue;
      }
      obj[entry.key] = entry.valueSchema.prepareJSON(value);
    }
    return obj;
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Map<string, unknown> {
    if (
      encoded == null ||
      typeof encoded !== 'object' ||
      Array.isArray(encoded)
    ) {
      throw new Error('NamedMapSchema data must be an object');
    }
    const map = new Map<string, unknown>();
    for (const entry of this.entries) {
      if (Object.prototype.hasOwnProperty.call(encoded, entry.key)) {
        map.set(
          entry.key,
          entry.valueSchema.fromPreparedJSON(encoded[entry.key])
        );
      } else if (entry.omitEmpty) {
        map.set(entry.key, entry.valueSchema.defaultValue());
      } else {
        throw new Error(`Missing key: ${entry.key}`);
      }
    }
    return map;
  }
}

/**
 * Schema for a map with a variable number of uint64 keys.
 */
export class Uint64MapSchema extends Schema {
  constructor(public readonly valueSchema: Schema) {
    super();
  }

  public defaultValue(): Map<bigint, unknown> {
    return new Map();
  }

  public isDefaultValue(data: unknown): boolean {
    return data instanceof Map && data.size === 0;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `Uint64MapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<bigint, MsgpackEncodingData>();
    for (const [key, value] of data) {
      const bigintKey = ensureUint64(key);
      if (prepared.has(bigintKey)) {
        throw new Error(`Duplicate key: ${bigintKey}`);
      }
      prepared.set(key, this.valueSchema.prepareMsgpack(value));
    }
    return prepared;
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData
  ): Map<bigint, unknown> {
    if (!(encoded instanceof Map)) {
      throw new Error('Uint64MapSchema data must be a Map');
    }
    const map = new Map<bigint, unknown>();
    for (const [key, value] of encoded) {
      const bigintKey = ensureUint64(key);
      if (map.has(bigintKey)) {
        throw new Error(`Duplicate key: ${bigintKey}`);
      }
      map.set(bigintKey, this.valueSchema.fromPreparedMsgpack(value));
    }
    return map;
  }

  public prepareJSON(data: unknown): JSONEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `Uint64MapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<bigint, JSONEncodingData>();
    for (const [key, value] of data) {
      const bigintKey = ensureUint64(key);
      if (prepared.has(bigintKey)) {
        throw new Error(`Duplicate key: ${bigintKey}`);
      }
      prepared.set(key, this.valueSchema.prepareJSON(value));
    }
    // Convert map to object
    const obj: { [key: string]: JSONEncodingData } = {};
    for (const [key, value] of prepared) {
      obj[key.toString()] = value;
    }
    return obj;
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Map<bigint, unknown> {
    if (
      encoded == null ||
      typeof encoded !== 'object' ||
      Array.isArray(encoded)
    ) {
      throw new Error('NamedMapSchema data must be an object');
    }
    const map = new Map<bigint, unknown>();
    for (const [key, value] of Object.entries(encoded)) {
      const bigintKey = BigInt(key);
      if (map.has(bigintKey)) {
        throw new Error(`Duplicate key: ${bigintKey}`);
      }
      map.set(bigintKey, this.valueSchema.fromPreparedJSON(value));
    }
    return map;
  }
}
