import {
  Schema,
  MsgpackEncodingData,
  MsgpackRawStringProvider,
  JSONEncodingData,
  PrepareJSONOptions,
} from '../encoding.js';
import { Address } from '../address.js';

/* eslint-disable class-methods-use-this */

export class AddressSchema extends Schema {
  public defaultValue(): Address {
    return Address.zeroAddress();
  }

  public isDefaultValue(data: unknown): boolean {
    // The equals method checks if the input is an Address
    return Address.zeroAddress().equals(data as Address);
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (data instanceof Address) {
      return data.publicKey;
    }
    throw new Error(`Invalid address: (${typeof data}) ${data}`);
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _rawStringProvider: MsgpackRawStringProvider
  ): Address {
    // The Address constructor checks that the input is a Uint8Array
    return new Address(encoded as Uint8Array);
  }

  public prepareJSON(
    data: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PrepareJSONOptions
  ): JSONEncodingData {
    if (data instanceof Address) {
      return data.toString();
    }
    throw new Error(`Invalid address: (${typeof data}) ${data}`);
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Address {
    // The Address.fromString method checks that the input is a string
    return Address.fromString(encoded as string);
  }
}
