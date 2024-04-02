import {
  MsgpackEncodable,
  MsgpackEncodingData,
  JSONEncodable,
  JSONEncodingData,
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
    // TODO
    return this.data;
  }

  public static fromDecodedMsgpack(data: MsgpackEncodingData): UntypedValue {
    return new UntypedValue(data);
  }

  public static fromDecodedJSON(data: JSONEncodingData): UntypedValue {
    // TODO
    return new UntypedValue(data);
  }
}
