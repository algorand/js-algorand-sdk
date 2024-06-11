import { Encodable, MsgpackEncodingData } from '../../encoding/encoding.js';
import { UntypedSchema } from '../../encoding/schema/index.js';

export class UntypedValue implements Encodable {
  static readonly encodingSchema = new UntypedSchema();

  public readonly data: MsgpackEncodingData;

  constructor(data: MsgpackEncodingData) {
    this.data = data;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): UntypedSchema {
    return UntypedValue.encodingSchema;
  }

  public toEncodingData(): MsgpackEncodingData {
    return this.data;
  }

  public static fromEncodingData(data: unknown): UntypedValue {
    return new UntypedValue(data as MsgpackEncodingData);
  }
}
