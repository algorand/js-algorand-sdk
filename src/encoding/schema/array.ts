import { Schema, MsgpackEncodingData, JSONEncodingData } from '../encoding.js';

/* eslint-disable class-methods-use-this */

export class ArraySchema extends Schema {
  constructor(public readonly itemSchema: Schema) {
    super();
  }

  public defaultValue(): unknown[] {
    return [];
  }

  public isDefaultValue(data: unknown): boolean {
    return Array.isArray(data) && data.length === 0;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (Array.isArray(data)) {
      return data.map((item) => this.itemSchema.prepareMsgpack(item));
    }
    throw new Error('ArraySchema data must be an array');
  }

  public fromPreparedMsgpack(encoded: MsgpackEncodingData): unknown[] {
    if (Array.isArray(encoded)) {
      return encoded.map((item) => this.itemSchema.fromPreparedMsgpack(item));
    }
    throw new Error('ArraySchema encoded data must be an array');
  }

  public prepareJSON(data: unknown): JSONEncodingData {
    if (Array.isArray(data)) {
      return data.map((item) => this.itemSchema.prepareJSON(item));
    }
    throw new Error('ArraySchema data must be an array');
  }

  public fromPreparedJSON(encoded: JSONEncodingData): unknown[] {
    if (Array.isArray(encoded)) {
      return encoded.map((item) => this.itemSchema.fromPreparedJSON(item));
    }
    throw new Error('ArraySchema encoded data must be an array');
  }
}