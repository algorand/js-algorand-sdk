import { Schema, MsgpackEncodingData, JSONEncodingData } from '../encoding.js';

/* eslint-disable class-methods-use-this */

export class BooleanSchema extends Schema {
  public defaultValue(): boolean {
    return false;
  }

  public isDefaultValue(data: unknown): boolean {
    return data === false;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (typeof data === 'boolean') {
      return data;
    }
    throw new Error('Invalid boolean');
  }

  public fromPreparedMsgpack(encoded: MsgpackEncodingData): boolean {
    if (typeof encoded === 'boolean') {
      return encoded;
    }
    throw new Error('Invalid boolean');
  }

  public prepareJSON(data: unknown): JSONEncodingData {
    if (typeof data === 'boolean') {
      return data;
    }
    throw new Error('Invalid boolean');
  }

  public fromPreparedJSON(encoded: JSONEncodingData): boolean {
    if (typeof encoded === 'boolean') {
      return encoded;
    }
    throw new Error('Invalid boolean');
  }
}
