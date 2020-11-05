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
        } else if (Array.isArray(val)) {
            targetPropValue = [];
            for (const elem of val) {
                targetPropValue.push(this._get_obj_for_encoding(elem))
            }
        } else if (typeof val === "object") {
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
}

module.exports = {BaseModel};