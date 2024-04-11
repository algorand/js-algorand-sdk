import { Schema, MsgpackEncodingData, JSONEncodingData } from '../encoding.js';

/* eslint-disable class-methods-use-this */

export interface NamedMapEntry {
  key: string;
  valueSchema: Schema;
  required: boolean;
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
      if (entry.required) {
        map.set(entry.key, entry.valueSchema.defaultValue());
      }
    }
    return map;
  }

  public isDefaultValue(data: unknown): boolean {
    if (!(data instanceof Map)) return false;
    for (const entry of this.entries) {
      if (data.has(entry.key)) {
        if (!entry.valueSchema.isDefaultValue(data.get(entry.key))) {
          return false;
        }
      } else if (entry.required) {
        // TODO: think about this case more
        return false;
      }
    }
    // TODO: examine if there are any extra keys?
    return true;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (!(data instanceof Map)) {
      throw new Error('NamedMapSchema data must be a Map');
    }
    const map = new Map<string, MsgpackEncodingData>();
    for (const entry of this.entries) {
      if (data.has(entry.key)) {
        if (
          entry.omitEmpty &&
          entry.valueSchema.isDefaultValue(data.get(entry.key))
        ) {
          continue;
        }
        map.set(
          entry.key,
          entry.valueSchema.prepareMsgpack(data.get(entry.key))
        );
      } else if (entry.required) {
        throw new Error(`Missing required key: ${entry.key}`);
      }
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
      } else if (entry.required) {
        if (entry.omitEmpty) {
          map.set(entry.key, entry.valueSchema.defaultValue());
        }
        throw new Error(`Missing required key: ${entry.key}`);
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
      if (data.has(entry.key)) {
        if (
          entry.omitEmpty &&
          entry.valueSchema.isDefaultValue(data.get(entry.key))
        ) {
          continue;
        }
        obj[entry.key] = entry.valueSchema.prepareJSON(data.get(entry.key));
      } else if (entry.required) {
        throw new Error(`Missing required key: ${entry.key}`);
      }
    }
    return obj;
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Map<string, unknown> {
    if (!(encoded instanceof Map)) {
      throw new Error('NamedMapSchema data must be a Map');
    }
    const map = new Map<string, unknown>();
    for (const entry of this.entries) {
      if (encoded.has(entry.key)) {
        map.set(
          entry.key,
          entry.valueSchema.fromPreparedJSON(encoded.get(entry.key))
        );
      } else if (entry.required) {
        if (entry.omitEmpty) {
          map.set(entry.key, entry.valueSchema.defaultValue());
        }
        throw new Error(`Missing required key: ${entry.key}`);
      }
    }
    return map;
  }
}
