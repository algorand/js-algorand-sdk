/**
 * Base class for models
 */
class BaseModel {
    _is_primitive(val) {
        return val == undefined || val == null || (typeof val != "object" && typeof val != "function");
    }

    _is_address(val) {
        return val.publicKey !== undefined && val.checksum !== undefined;
    }

    _get_obj_for_encoding(val) {
        let targetPropValue;
        if (typeof val.get_obj_for_encoding === "function") {
            targetPropValue = val.get_obj_for_encoding();
        } else if (val instanceof Array) {
            targetPropValue = new Array();
            for (const elem of val) {
                targetPropValue.push(this._get_obj_for_encoding(elem))
            }
        } else if (typeof val == "object") {
            const obj = {};
            for (const prop of Object.keys(val)) {
                obj[prop] = this._get_obj_for_encoding(val[prop])
            }
            targetPropValue = obj;
        } else if (this._is_primitive(val)) {
            targetPropValue = val;
        } else {
            throw new Error("Unsupported value: " + String(val))
        }
        return targetPropValue;
    }

    get_obj_for_encoding() {
        const obj = {};
        for (const prop of Object.keys(this)) {
            if (prop == "attribute_map") {
                continue;
            }
            const val = this[prop];
            if (val === undefined) {
                continue;
            }
            const name = this.attribute_map[prop];
            obj[name] = (val === null) ? null : this._get_obj_for_encoding(val);
        }
        return obj;
    }

    static from_obj_for_encoding(obj) {
        const target = {};
        for (const key of Object.keys(obj)) {
            if (this.openapi_types[key] === undefined) {
                throw Error("Unknown key " + key);
            }
            const value = obj[key];
            const targetKey = this.openapi_attribute_map[key];
            let targetType = this.openapi_types[key];
            if (
                Array.isArray(value) && !Array.isArray(targetType) ||
                Array.isArray(targetType) && !Array.isArray(value)
            ) {
                throw Error("Types are not compatible: " + typeof value + " " + typeof targetType);
            }
            if (Array.isArray(value)) {
                target[targetKey] = new Array();
                targetType = targetType[0];
                for (const elem of value) {
                    if (typeof targetType.from_obj_for_encoding === "function") {
                        target[targetKey].push(targetType.from_obj_for_encoding(elem));
                    } else if (targetType === String || targetType == Number) {
                        target[targetKey].push(targetType(elem));
                    } else {
                        throw Error("Unknown array element: " + targetType);
                    }
                }
            } else {
                if (typeof targetType.from_obj_for_encoding === "function") {
                    target[targetKey] = targetType.from_obj_for_encoding(value);
                } else if (targetType === String || targetType == Number) {
                    target[targetKey] = targetType(value);
                } else {
                    throw Error("Unknown value type: " + targetType);
                }
            }
        }
        return Object.assign(new this({}), target);
    }
}

module.exports = {BaseModel};