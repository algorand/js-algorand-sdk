/**
 * Base class for models
 */

import { bytesToBase64 } from '../../encoding/binarydata';

/* eslint-disable no-underscore-dangle,camelcase */
function _is_primitive(val: any): val is string | boolean | number | bigint {
  /* eslint-enable no-underscore-dangle,camelcase */
  return (
    val === undefined ||
    val == null ||
    (typeof val !== 'object' && typeof val !== 'function')
  );
}

/* eslint-disable no-underscore-dangle,camelcase,no-redeclare,no-unused-vars */
function _get_obj_for_encoding(
  val: Function,
  binary: boolean,
  omitEmpty: boolean
): Record<string, any>;
function _get_obj_for_encoding(
  val: any[],
  binary: boolean,
  omitEmpty: boolean
): any[];
function _get_obj_for_encoding(
  val: Record<string, any>,
  binary: boolean,
  omitEmpty: boolean
): Record<string, any>;
function _get_obj_for_encoding(
  val: any,
  binary: boolean,
  omitEmpty: boolean
): any {
  /* eslint-enable no-underscore-dangle,camelcase,no-redeclare,no-unused-vars */
  if (val instanceof Uint8Array) {
    if (omitEmpty && val.byteLength === 0) {
      return undefined;
    }
    return binary ? val : bytesToBase64(val);
  }
  if (typeof val.get_obj_for_encoding === 'function') {
    return val.get_obj_for_encoding(binary);
  }
  if (Array.isArray(val)) {
    if (omitEmpty && val.length === 0) {
      return undefined;
    }
    const targetPropValue = [];
    for (const elem of val) {
      targetPropValue.push(_get_obj_for_encoding(elem, binary, omitEmpty));
    }
    return targetPropValue;
  }
  if (typeof val === 'object') {
    let keyCount = 0;
    const obj = {};
    for (const prop of Object.keys(val)) {
      const forEncoding = _get_obj_for_encoding(val[prop], binary, omitEmpty);
      if (omitEmpty && typeof forEncoding === 'undefined') {
        continue;
      }
      obj[prop] = forEncoding;
      keyCount += 1;
    }
    if (omitEmpty && keyCount === 0) {
      return undefined;
    }
    return obj;
  }
  if (_is_primitive(val)) {
    if (omitEmpty && !val) {
      return undefined;
    }
    return val;
  }
  throw new Error(`Unsupported value: ${String(val)}`);
}

export default class BaseModel {
  /* eslint-disable no-underscore-dangle,camelcase */
  attribute_map: Record<string, string>;

  /**
   * Get an object ready for encoding to either JSON or msgpack.
   * @param binary - Use true to indicate that the encoding can handle raw binary objects
   *   (Uint8Arrays). Use false to indicate that raw binary objects should be converted to base64
   *   strings. True should be used for objects that will be encoded with msgpack, and false should
   *   be used for objects that will be encoded with JSON.
   * @param omitEmpty - Use true to omit all properties with falsy or empty values. This is useful
   *   for encoding objects for msgpack, since our encoder will error if it encounters any empty or
   *   falsy values.
   */
  get_obj_for_encoding(binary: boolean = false, omitEmpty: boolean = false) {
    /* eslint-enable no-underscore-dangle,camelcase */
    let keyCount = 0;
    const obj: Record<string, any> = {};

    for (const prop of Object.keys(this.attribute_map)) {
      const name = this.attribute_map[prop];
      const value = this[prop];
      if (typeof value === 'undefined') {
        continue;
      }
      const valueForEncoding = _get_obj_for_encoding(value, binary, omitEmpty);
      if (omitEmpty && typeof valueForEncoding === 'undefined') {
        continue;
      }
      obj[name] = valueForEncoding;
      keyCount += 1;
    }

    if (omitEmpty && keyCount === 0) {
      return undefined;
    }
    return obj;
  }
}
