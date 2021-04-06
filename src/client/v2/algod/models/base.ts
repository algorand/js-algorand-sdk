import { Address } from '../../../../types/address';

/**
 * Base class for models
 */

/* eslint-disable no-underscore-dangle,camelcase,class-methods-use-this */
export default class BaseModel {
  attribute_map: Record<string, string>;

  _is_primitive(val: any): val is string | boolean | number | bigint {
    return (
      val === undefined ||
      val == null ||
      (typeof val !== 'object' && typeof val !== 'function')
    );
  }

  _is_address(val: any): val is Address {
    return val.publicKey !== undefined && val.checksum !== undefined;
  }

  /* eslint-disable no-dupe-class-members,no-unused-vars */
  _get_obj_for_encoding(val: Function): Record<string, any>;
  _get_obj_for_encoding(val: any[]): any[];
  _get_obj_for_encoding(val: Record<string, any>): Record<string, any>;
  _get_obj_for_encoding(val: any): any {
    /* eslint-disable no-unused-vars */
    let targetPropValue: any;
    if (typeof val.get_obj_for_encoding === 'function') {
      targetPropValue = val.get_obj_for_encoding();
    } else if (Array.isArray(val)) {
      targetPropValue = [];
      for (const elem of val) {
        targetPropValue.push(this._get_obj_for_encoding(elem));
      }
    } else if (typeof val === 'object') {
      const obj = {};
      for (const prop of Object.keys(val)) {
        obj[prop] = this._get_obj_for_encoding(val[prop]);
      }
      targetPropValue = obj;
    } else if (this._is_primitive(val)) {
      targetPropValue = val;
    } else {
      throw new Error(`Unsupported value: ${String(val)}`);
    }
    return targetPropValue;
  }
  /* eslint-disable no-dupe-class-members */

  get_obj_for_encoding() {
    const obj: Record<string, any> = {};
    for (const prop of Object.keys(this)) {
      const val = this[prop];
      if (prop !== 'attribute_map' && typeof val !== 'undefined') {
        const name = this.attribute_map[prop];
        obj[name] = val === null ? null : this._get_obj_for_encoding(val);
      }
    }
    return obj;
  }
}
