import {
  Schema,
  MsgpackEncodingData,
  MsgpackRawStringProvider,
  JSONEncodingData,
  PrepareJSONOptions,
  msgpackEncodingDataToJSONEncodingData,
  jsonEncodingDataToMsgpackEncodingData,
} from '../encoding.js';

/* eslint-disable class-methods-use-this */

export class UntypedSchema extends Schema {
  public defaultValue(): undefined {
    return undefined;
  }

  public isDefaultValue(data: unknown): boolean {
    return data === undefined;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    // Value is already MsgpackEncodingData, since it is returned as such from
    // fromPreparedMsgpack and fromPreparedJSON
    return data as MsgpackEncodingData;
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _rawStringProvider: MsgpackRawStringProvider
  ): MsgpackEncodingData {
    return encoded;
  }

  public prepareJSON(
    data: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PrepareJSONOptions
  ): JSONEncodingData {
    return msgpackEncodingDataToJSONEncodingData(data as MsgpackEncodingData);
  }

  public fromPreparedJSON(encoded: JSONEncodingData): MsgpackEncodingData {
    return jsonEncodingDataToMsgpackEncodingData(encoded);
  }
}
