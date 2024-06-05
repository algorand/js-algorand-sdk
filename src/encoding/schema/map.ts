import { Schema, MsgpackEncodingData, JSONEncodingData } from '../encoding.js';

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
