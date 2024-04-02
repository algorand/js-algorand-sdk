import {
  MsgpackEncodable,
  MsgpackEncodingData,
  JSONEncodable,
  JSONEncodingData,
  msgpackEncodingDataToJSONEncodingData,
  jsonEncodingDataToMsgpackEncodingData,
} from '../../encoding/encoding.js';

export class UntypedValue implements MsgpackEncodable, JSONEncodable {
  public readonly data: MsgpackEncodingData;

  constructor(data: MsgpackEncodingData) {
    this.data = data;
  }

  public msgpackPrepare(): MsgpackEncodingData {
    return this.data;
  }

  public jsonPrepare(): JSONEncodingData {
    return msgpackEncodingDataToJSONEncodingData(this.data);
  }

  public static fromDecodedMsgpack(data: MsgpackEncodingData): UntypedValue {
    return new UntypedValue(data);
  }

  public static fromDecodedJSON(data: JSONEncodingData): UntypedValue {
    return new UntypedValue(jsonEncodingDataToMsgpackEncodingData(data));
  }
}
