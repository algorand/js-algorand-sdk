import {
  Schema,
  MsgpackEncodingData,
  MsgpackRawStringProvider,
  JSONEncodingData,
  PrepareJSONOptions,
} from '../encoding.js';
import { ensureUint64 } from '../../utils/utils.js';

/* eslint-disable class-methods-use-this */

export class Uint64Schema extends Schema {
  public defaultValue(): bigint {
    return BigInt(0);
  }

  public isDefaultValue(data: unknown): boolean {
    if (typeof data === 'bigint') return data === BigInt(0);
    if (typeof data === 'number') return data === 0;
    return false;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    return ensureUint64(data);
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _rawStringProvider: MsgpackRawStringProvider
  ): bigint {
    return ensureUint64(encoded);
  }

  public prepareJSON(
    data: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PrepareJSONOptions
  ): JSONEncodingData {
    return ensureUint64(data);
  }

  public fromPreparedJSON(encoded: JSONEncodingData): bigint {
    return ensureUint64(encoded);
  }
}
