const toObjectEncoding: unique symbol = Symbol('toObjectEncoding');
const fromObjectEncoding: unique symbol = Symbol('fromObjectEncoding');

enum EncodingFormat {
  JSON = 'json',
  Msgpack = 'msgpack',
}

export interface Encodable {
  [toObjectEncoding](format: EncodingFormat): Record<string, unknown>;
  [fromObjectEncoding](
    obj: Record<string, unknown>,
    format: EncodingFormat
  ): void;
}
