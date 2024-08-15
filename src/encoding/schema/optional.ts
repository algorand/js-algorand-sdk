import {
  Schema,
  MsgpackEncodingData,
  MsgpackRawStringProvider,
  JSONEncodingData,
  PrepareJSONOptions,
} from '../encoding.js';

/* eslint-disable class-methods-use-this */

/**
 * OptionalSchema allows for another schema-defined value to be optional.
 *
 * This expands the set of values which can be represented by the given schema to include `undefined`.
 *
 * Note that this schema considers `undefined` _and_ any default values from the underlying schema
 * to all be default values. This means that when using NamedMapSchema to omit default values, an
 * `undefined` value is indistinguishable from the given schema's default value; in this respect,
 * OptionalSchema does not affect the encoding of NamedMapSchema values, but rather allows the
 * application to restore omitted values as `undefined` instead of their default value.
 *
 * Upon decoding, this schema also allows null/undefined values to be acceptable as values.
 */
export class OptionalSchema extends Schema {
  constructor(public readonly valueSchema: Schema) {
    super();
  }

  public defaultValue(): undefined {
    return undefined;
  }

  public isDefaultValue(data: unknown): boolean {
    return data === undefined || this.valueSchema.isDefaultValue(data);
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (data === undefined) {
      return undefined;
    }
    return this.valueSchema.prepareMsgpack(data);
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    rawStringProvider: MsgpackRawStringProvider
  ): unknown {
    // JS undefined is encoded as msgpack nil, which may be decoded as JS null
    if (encoded === undefined || encoded === null) {
      return undefined;
    }
    return this.valueSchema.fromPreparedMsgpack(encoded, rawStringProvider);
  }

  public prepareJSON(
    data: unknown,
    options: PrepareJSONOptions
  ): JSONEncodingData {
    if (data === undefined) {
      // JSON representation does not have undefined, only null
      return null;
    }
    return this.valueSchema.prepareJSON(data, options);
  }

  public fromPreparedJSON(encoded: JSONEncodingData): unknown {
    if (encoded === undefined || encoded === null) {
      return undefined;
    }
    return this.valueSchema.fromPreparedJSON(encoded);
  }
}
