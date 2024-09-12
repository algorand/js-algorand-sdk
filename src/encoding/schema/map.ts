import { RawBinaryString } from 'algorand-msgpack';
import {
  Schema,
  MsgpackEncodingData,
  MsgpackRawStringProvider,
  JSONEncodingData,
  PrepareJSONOptions,
} from '../encoding.js';
import { ensureUint64, arrayEqual } from '../../utils/utils.js';
import {
  bytesToString,
  coerceToBytes,
  bytesToBase64,
  base64ToBytes,
} from '../binarydata.js';

/* eslint-disable class-methods-use-this */

/**
 * Describes a key-value entry in a NamedMapSchema.
 */
export interface NamedMapEntry {
  /**
   * Key of the entry. Must be unique for this map.
   */
  key: string;
  /**
   * The Schema for the entry's value.
   */
  valueSchema: Schema;
  /**
   * If true, the entry will be omitted from the encoding if the value is the default value.
   */
  omitEmpty: boolean;
  /**
   * If true, valueSchema must be a NamedMapSchema and key must be the empty string. The fields of
   * valueSchema will be embedded directly in the parent map.
   *
   * omitEmpty is ignored for embedded entries. Instead, the individual omitEmpty values of the
   * embedded fields are used.
   */
  embedded?: boolean;
}

/**
 * Applies the omitEmpty flag to all entries in the array.
 * @param entries - The entries to apply the flag to.
 * @returns A new array with the omitEmpty flag applied to all entries.
 */
export function allOmitEmpty(
  entries: Array<Omit<NamedMapEntry, 'omitEmpty'>>
): NamedMapEntry[] {
  return entries.map((entry) => ({ ...entry, omitEmpty: true }));
}

/**
 * Schema for a map/struct with a fixed set of known string fields.
 */
export class NamedMapSchema extends Schema {
  private readonly entries: NamedMapEntry[];

  constructor(entries: NamedMapEntry[]) {
    super();
    this.entries = entries;
    this.checkEntries();
  }

  /**
   * Adds new entries to the map schema. WARNING: this is a mutable operation, and you should be very
   * careful when using it. Any error that happens here is non-recoverable and will corrupt the
   * NamedMapSchema object;
   * @param entries - The entries to add.
   */
  public pushEntries(...entries: NamedMapEntry[]) {
    this.entries.push(...entries);
    this.checkEntries();
  }

  private checkEntries() {
    for (const entry of this.entries) {
      if (entry.embedded) {
        if (entry.key !== '') {
          throw new Error('Embedded entries must have an empty key');
        }
        if (!(entry.valueSchema instanceof NamedMapSchema)) {
          throw new Error(
            'Embedded entry valueSchema must be a NamedMapSchema'
          );
        }
      }
    }

    const keys = new Set<string>();
    for (const entry of this.getEntries()) {
      if (keys.has(entry.key)) {
        throw new Error(`Duplicate key: ${entry.key}`);
      }
      keys.add(entry.key);
    }
  }

  /**
   * Returns all top-level entries, properly accounting for fields from embedded entries.
   * @returns An array of all top-level entries for this map.
   */
  public getEntries(): NamedMapEntry[] {
    const entries: NamedMapEntry[] = [];
    for (const entry of this.entries) {
      if (entry.embedded) {
        const embeddedMapSchema = entry.valueSchema as NamedMapSchema;
        entries.push(...embeddedMapSchema.getEntries());
      } else {
        entries.push(entry);
      }
    }
    return entries;
  }

  public defaultValue(): Map<string, unknown> {
    const map = new Map<string, unknown>();
    for (const entry of this.getEntries()) {
      map.set(entry.key, entry.valueSchema.defaultValue());
    }
    return map;
  }

  public isDefaultValue(data: unknown): boolean {
    if (!(data instanceof Map)) return false;
    for (const entry of this.getEntries()) {
      if (!entry.valueSchema.isDefaultValue(data.get(entry.key))) {
        return false;
      }
    }
    return true;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `NamedMapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const map = new Map<string, MsgpackEncodingData>();
    for (const entry of this.getEntries()) {
      const value = data.get(entry.key);
      if (entry.omitEmpty && entry.valueSchema.isDefaultValue(value)) {
        continue;
      }
      map.set(entry.key, entry.valueSchema.prepareMsgpack(value));
    }
    return map;
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    rawStringProvider: MsgpackRawStringProvider
  ): Map<string, unknown> {
    if (!(encoded instanceof Map)) {
      throw new Error('NamedMapSchema data must be a Map');
    }
    const map = new Map<string, unknown>();
    for (const entry of this.getEntries()) {
      if (encoded.has(entry.key)) {
        map.set(
          entry.key,
          entry.valueSchema.fromPreparedMsgpack(
            encoded.get(entry.key),
            rawStringProvider.withMapValue(entry.key)
          )
        );
      } else if (entry.omitEmpty) {
        map.set(entry.key, entry.valueSchema.defaultValue());
      } else {
        throw new Error(`Missing key: ${entry.key}`);
      }
    }
    return map;
  }

  public prepareJSON(
    data: unknown,
    options: PrepareJSONOptions
  ): JSONEncodingData {
    if (!(data instanceof Map)) {
      throw new Error('NamedMapSchema data must be a Map');
    }
    const obj: { [key: string]: JSONEncodingData } = {};
    for (const entry of this.getEntries()) {
      const value = data.get(entry.key);
      if (entry.omitEmpty && entry.valueSchema.isDefaultValue(value)) {
        continue;
      }
      obj[entry.key] = entry.valueSchema.prepareJSON(value, options);
    }
    return obj;
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Map<string, unknown> {
    if (
      encoded == null ||
      typeof encoded !== 'object' ||
      Array.isArray(encoded)
    ) {
      throw new Error('NamedMapSchema data must be an object');
    }
    const map = new Map<string, unknown>();
    for (const entry of this.getEntries()) {
      if (Object.prototype.hasOwnProperty.call(encoded, entry.key)) {
        map.set(
          entry.key,
          entry.valueSchema.fromPreparedJSON(encoded[entry.key])
        );
      } else if (entry.omitEmpty) {
        map.set(entry.key, entry.valueSchema.defaultValue());
      } else {
        throw new Error(`Missing key: ${entry.key}`);
      }
    }
    return map;
  }
}

/**
 * Combines multiple maps into a single map. Throws an error if any of the maps have duplicate keys.
 * @param maps - The maps to combine.
 * @returns A new map with all the entries from the input maps.
 */
export function combineMaps<K, V>(...maps: Array<Map<K, V>>): Map<K, V> {
  const combined = new Map<K, V>();
  for (const map of maps) {
    for (const [key, value] of map) {
      if (combined.has(key)) {
        throw new Error(`Duplicate key: ${key}`);
      }
      combined.set(key, value);
    }
  }
  return combined;
}

/**
 * Converts a map to a new map with different keys and values.
 * @param map - The map to convert.
 * @param func - The function to convert each entry.
 * @returns A new map with the converted entries.
 */
export function convertMap<K1, V1, K2, V2>(
  map: Map<K1, V1>,
  func: (k: K1, v: V1) => [K2, V2]
): Map<K2, V2> {
  const mapped = new Map<K2, V2>();
  for (const [key, value] of map) {
    const [newKey, newValue] = func(key, value);
    mapped.set(newKey, newValue);
  }
  return mapped;
}

/**
 * Schema for a map with a variable number of uint64 keys.
 */
export class Uint64MapSchema extends Schema {
  constructor(public readonly valueSchema: Schema) {
    super();
  }

  public defaultValue(): Map<bigint, unknown> {
    return new Map();
  }

  public isDefaultValue(data: unknown): boolean {
    return data instanceof Map && data.size === 0;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `Uint64MapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<bigint, MsgpackEncodingData>();
    for (const [key, value] of data) {
      const bigintKey = ensureUint64(key);
      if (prepared.has(bigintKey)) {
        throw new Error(`Duplicate key: ${bigintKey}`);
      }
      prepared.set(bigintKey, this.valueSchema.prepareMsgpack(value));
    }
    return prepared;
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    rawStringProvider: MsgpackRawStringProvider
  ): Map<bigint, unknown> {
    if (!(encoded instanceof Map)) {
      throw new Error('Uint64MapSchema data must be a Map');
    }
    const map = new Map<bigint, unknown>();
    for (const [key, value] of encoded) {
      const bigintKey = ensureUint64(key);
      if (map.has(bigintKey)) {
        throw new Error(`Duplicate key: ${bigintKey}`);
      }
      map.set(
        bigintKey,
        this.valueSchema.fromPreparedMsgpack(
          value,
          rawStringProvider.withMapValue(key)
        )
      );
    }
    return map;
  }

  public prepareJSON(
    data: unknown,
    options: PrepareJSONOptions
  ): JSONEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `Uint64MapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<bigint, JSONEncodingData>();
    for (const [key, value] of data) {
      const bigintKey = ensureUint64(key);
      if (prepared.has(bigintKey)) {
        throw new Error(`Duplicate key: ${bigintKey}`);
      }
      prepared.set(bigintKey, this.valueSchema.prepareJSON(value, options));
    }
    // Convert map to object
    const obj: { [key: string]: JSONEncodingData } = {};
    for (const [key, value] of prepared) {
      obj[key.toString()] = value;
    }
    return obj;
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Map<bigint, unknown> {
    if (
      encoded == null ||
      typeof encoded !== 'object' ||
      Array.isArray(encoded)
    ) {
      throw new Error('Uint64MapSchema data must be an object');
    }
    const map = new Map<bigint, unknown>();
    for (const [key, value] of Object.entries(encoded)) {
      const bigintKey = BigInt(key);
      if (map.has(bigintKey)) {
        throw new Error(`Duplicate key: ${bigintKey}`);
      }
      map.set(bigintKey, this.valueSchema.fromPreparedJSON(value));
    }
    return map;
  }
}

/**
 * Schema for a map with a variable number of string keys.
 */
export class StringMapSchema extends Schema {
  constructor(public readonly valueSchema: Schema) {
    super();
  }

  public defaultValue(): Map<string, unknown> {
    return new Map();
  }

  public isDefaultValue(data: unknown): boolean {
    return data instanceof Map && data.size === 0;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `StringMapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<string, MsgpackEncodingData>();
    for (const [key, value] of data) {
      if (typeof key !== 'string') {
        throw new Error(`Invalid key: ${key}`);
      }
      if (prepared.has(key)) {
        throw new Error(`Duplicate key: ${key}`);
      }
      prepared.set(key, this.valueSchema.prepareMsgpack(value));
    }
    return prepared;
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    rawStringProvider: MsgpackRawStringProvider
  ): Map<string, unknown> {
    if (!(encoded instanceof Map)) {
      throw new Error('StringMapSchema data must be a Map');
    }
    const map = new Map<string, unknown>();
    for (const [key, value] of encoded) {
      if (typeof key !== 'string') {
        throw new Error(`Invalid key: ${key}`);
      }
      if (map.has(key)) {
        throw new Error(`Duplicate key: ${key}`);
      }
      map.set(
        key,
        this.valueSchema.fromPreparedMsgpack(
          value,
          rawStringProvider.withMapValue(key)
        )
      );
    }
    return map;
  }

  public prepareJSON(
    data: unknown,
    options: PrepareJSONOptions
  ): JSONEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `StringMapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<string, JSONEncodingData>();
    for (const [key, value] of data) {
      if (typeof key !== 'string') {
        throw new Error(`Invalid key: ${key}`);
      }
      if (prepared.has(key)) {
        throw new Error(`Duplicate key: ${key}`);
      }
      prepared.set(key, this.valueSchema.prepareJSON(value, options));
    }
    // Convert map to object
    const obj: { [key: string]: JSONEncodingData } = {};
    for (const [key, value] of prepared) {
      obj[key] = value;
    }
    return obj;
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Map<string, unknown> {
    if (
      encoded == null ||
      typeof encoded !== 'object' ||
      Array.isArray(encoded)
    ) {
      throw new Error('StringMapSchema data must be an object');
    }
    const map = new Map<string, unknown>();
    for (const [key, value] of Object.entries(encoded)) {
      if (map.has(key)) {
        throw new Error(`Duplicate key: ${key}`);
      }
      map.set(key, this.valueSchema.fromPreparedJSON(value));
    }
    return map;
  }
}

/**
 * Schema for a map with a variable number of byte array keys.
 */
export class ByteArrayMapSchema extends Schema {
  constructor(public readonly valueSchema: Schema) {
    super();
  }

  public defaultValue(): Map<Uint8Array, unknown> {
    return new Map();
  }

  public isDefaultValue(data: unknown): boolean {
    return data instanceof Map && data.size === 0;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `ByteArrayMapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<Uint8Array, MsgpackEncodingData>();
    for (const [key, value] of data) {
      if (!(key instanceof Uint8Array)) {
        throw new Error(`Invalid key: ${key} (${typeof key})`);
      }
      prepared.set(key, this.valueSchema.prepareMsgpack(value));
    }
    return prepared;
  }

  public fromPreparedMsgpack(
    encoded: MsgpackEncodingData,
    rawStringProvider: MsgpackRawStringProvider
  ): Map<Uint8Array, unknown> {
    if (!(encoded instanceof Map)) {
      throw new Error('ByteArrayMapSchema data must be a Map');
    }
    const map = new Map<Uint8Array, unknown>();
    for (const [key, value] of encoded) {
      if (!(key instanceof Uint8Array)) {
        throw new Error(`Invalid key: ${key} (${typeof key})`);
      }
      map.set(
        key,
        this.valueSchema.fromPreparedMsgpack(
          value,
          rawStringProvider.withMapValue(key)
        )
      );
    }
    return map;
  }

  public prepareJSON(
    data: unknown,
    options: PrepareJSONOptions
  ): JSONEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `ByteArrayMapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<string, JSONEncodingData>();
    for (const [key, value] of data) {
      if (!(key instanceof Uint8Array)) {
        throw new Error(`Invalid key: ${key} (${typeof key})`);
      }
      const b64Encoded = bytesToBase64(key);
      if (prepared.has(b64Encoded)) {
        throw new Error(`Duplicate key (base64): ${b64Encoded}`);
      }
      prepared.set(b64Encoded, this.valueSchema.prepareJSON(value, options));
    }
    // Convert map to object
    const obj: { [key: string]: JSONEncodingData } = {};
    for (const [key, value] of prepared) {
      obj[key] = value;
    }
    return obj;
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Map<Uint8Array, unknown> {
    if (
      encoded == null ||
      typeof encoded !== 'object' ||
      Array.isArray(encoded)
    ) {
      throw new Error('ByteArrayMapSchema data must be an object');
    }
    const map = new Map<Uint8Array, unknown>();
    for (const [key, value] of Object.entries(encoded)) {
      map.set(base64ToBytes(key), this.valueSchema.fromPreparedJSON(value));
    }
    return map;
  }
}

/**
 * Converts any RawBinaryString values to regular strings in a MsgpackEncodingData object.
 *
 * Note this conversion may be lossy if the binary data is not valid UTF-8.
 *
 * @returns A new object with RawBinaryString values converted to strings.
 */
function convertRawStringsInMsgpackValue(
  value: MsgpackEncodingData
): MsgpackEncodingData {
  if (value instanceof RawBinaryString) {
    return bytesToString(value.rawBinaryValue as Uint8Array);
  }
  if (value instanceof Map) {
    const newMap = new Map<
      string | number | bigint | Uint8Array,
      MsgpackEncodingData
    >();
    for (const [key, val] of value) {
      newMap.set(
        convertRawStringsInMsgpackValue(key) as
          | string
          | number
          | bigint
          | Uint8Array,
        convertRawStringsInMsgpackValue(val)
      );
    }
    return newMap;
  }
  if (Array.isArray(value)) {
    return value.map(convertRawStringsInMsgpackValue);
  }
  return value;
}

/**
 * Schema for a map with a variable number of binary string keys.
 *
 * See SpecialCaseBinaryStringSchema for more information about the key type.
 */
export class SpecialCaseBinaryStringMapSchema extends Schema {
  constructor(public readonly valueSchema: Schema) {
    super();
  }

  public defaultValue(): Map<Uint8Array, unknown> {
    return new Map();
  }

  public isDefaultValue(data: unknown): boolean {
    return data instanceof Map && data.size === 0;
  }

  public prepareMsgpack(data: unknown): MsgpackEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `SpecialCaseBinaryStringMapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<RawBinaryString, MsgpackEncodingData>();
    for (const [key, value] of data) {
      if (!(key instanceof Uint8Array)) {
        throw new Error(`Invalid key: ${key} (${typeof key})`);
      }
      prepared.set(
        new RawBinaryString(key),
        this.valueSchema.prepareMsgpack(value)
      );
    }
    // Cast is needed because RawBinaryString is not part of the standard MsgpackEncodingData
    return prepared as unknown as Map<Uint8Array, MsgpackEncodingData>;
  }

  public fromPreparedMsgpack(
    _encoded: MsgpackEncodingData,
    rawStringProvider: MsgpackRawStringProvider
  ): Map<Uint8Array, unknown> {
    const map = new Map<Uint8Array, unknown>();
    const keysAndValues =
      rawStringProvider.getRawStringKeysAndValuesAtCurrentLocation();
    for (const [key, value] of keysAndValues) {
      map.set(
        key,
        this.valueSchema.fromPreparedMsgpack(
          convertRawStringsInMsgpackValue(value),
          rawStringProvider.withMapValue(new RawBinaryString(key))
        )
      );
    }
    return map;
  }

  public prepareJSON(
    data: unknown,
    options: PrepareJSONOptions
  ): JSONEncodingData {
    if (!(data instanceof Map)) {
      throw new Error(
        `SpecialCaseBinaryStringMapSchema data must be a Map. Got (${typeof data}) ${data}`
      );
    }
    const prepared = new Map<string, JSONEncodingData>();
    for (const [key, value] of data) {
      if (!(key instanceof Uint8Array)) {
        throw new Error(`Invalid key: ${key}`);
      }
      // Not safe to convert to string for all binary data
      const keyStringValue = bytesToString(key);
      if (
        !options.lossyBinaryStringConversion &&
        !arrayEqual(coerceToBytes(keyStringValue), key)
      ) {
        throw new Error(
          `Invalid UTF-8 byte array encountered. Encode with lossyBinaryStringConversion enabled to bypass this check. Base64 value: ${bytesToBase64(key)}`
        );
      }
      prepared.set(
        keyStringValue,
        this.valueSchema.prepareJSON(value, options)
      );
    }
    // Convert map to object
    const obj: { [key: string]: JSONEncodingData } = {};
    for (const [key, value] of prepared) {
      obj[key] = value;
    }
    return obj;
  }

  public fromPreparedJSON(encoded: JSONEncodingData): Map<Uint8Array, unknown> {
    if (
      encoded == null ||
      typeof encoded !== 'object' ||
      Array.isArray(encoded)
    ) {
      throw new Error(
        'SpecialCaseBinaryStringMapSchema data must be an object'
      );
    }
    const map = new Map<Uint8Array, unknown>();
    for (const [key, value] of Object.entries(encoded)) {
      map.set(coerceToBytes(key), this.valueSchema.fromPreparedJSON(value));
    }
    return map;
  }
}
