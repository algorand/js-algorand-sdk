/**
 * Base class for models
 */

/* eslint-disable no-underscore-dangle,camelcase */

function _is_primitive(val: any): val is string | boolean | number | bigint {
  return (
    val === undefined ||
    val == null ||
    (typeof val !== 'object' && typeof val !== 'function')
  );
}

/* eslint-disable no-redeclare,no-unused-vars */
function _get_obj_for_encoding(
  val: Function,
  binary: boolean
): Record<string, any>;
function _get_obj_for_encoding(val: any[], binary: boolean): any[];
function _get_obj_for_encoding(
  val: Record<string, any>,
  binary: boolean
): Record<string, any>;
function _get_obj_for_encoding(val: any, binary: boolean): any {
  /* eslint-disable no-unused-vars */
  let targetPropValue: any;

  if (val instanceof Uint8Array) {
    targetPropValue = binary ? val : Buffer.from(val).toString('base64');
  } else if (typeof val.get_obj_for_encoding === 'function') {
    targetPropValue = val.get_obj_for_encoding(binary);
  } else if (Array.isArray(val)) {
    targetPropValue = [];
    for (const elem of val) {
      targetPropValue.push(_get_obj_for_encoding(elem, binary));
    }
  } else if (typeof val === 'object') {
    const obj = {};
    for (const prop of Object.keys(val)) {
      obj[prop] = _get_obj_for_encoding(val[prop], binary);
    }
    targetPropValue = obj;
  } else if (_is_primitive(val)) {
    targetPropValue = val;
  } else {
    throw new Error(`Unsupported value: ${String(val)}`);
  }
  return targetPropValue;
}
/* eslint-disable no-redeclare */

export default class BaseModel {
  attribute_map: Record<string, string>;

  get_obj_for_encoding(binary: boolean = false) {
    const obj: Record<string, any> = {};

    for (const prop of Object.keys(this.attribute_map)) {
      const name = this.attribute_map[prop];
      const value = this[prop];

      if (typeof value !== 'undefined') {
        obj[name] =
          value === null ? null : _get_obj_for_encoding(value, binary);
      }
    }

    return obj;
  }
}
