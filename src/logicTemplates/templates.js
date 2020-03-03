const assert = require('assert');
const address = require("../encoding/address");
const logicsig = require('../logicsig');

function putUvarint(buf, x){
    let i = 0;
    while (x > 0x80) {
        buf.push((x&0xFF) | 0x80);
        x >>= 7;
        i += 1;
    }
    buf.push(x&0xFF);
    return i + 1
}

const valTypes = {
    INT : 1,
    ADDRESS : 2,
    BASE64 : 3
};

function inject(orig, offsets, values, valueTypes) {
    assert.strictEqual(offsets.length, values.length);
    assert.strictEqual(offsets.length, valueTypes.length);

    let res = orig;

    function replace(arr, newVal, offset, placeholderLength) {
        let beforeReplacement = arr.slice(0, offset);
        let afterReplacement = arr.slice(offset + placeholderLength, arr.length);
        let chunks = [beforeReplacement, Buffer.from(newVal), afterReplacement];
        return Buffer.concat(chunks);
    }

    for (let i = 0; i < offsets.length; i++ ) {
        let decodedLength = 0;
        let val = values[i];
        let valType = valueTypes[i];

        switch (valType) {
            case valTypes.INT:
                let intBuf = [];
                decodedLength = putUvarint(intBuf, val);
                res = replace(res, intBuf, offsets[i], 1);
                break;
            case valTypes.ADDRESS:
                val = address.decode(val);
                res = replace(res, val.publicKey, offsets[i], 32);
                break;
            case valTypes.BASE64:
                let lenBuf = [];
                val = Buffer.from(val, 'base64');
                putUvarint(lenBuf, val.length);
                val = Buffer.concat([Buffer.from(lenBuf), val]);
                res = replace(res, val, offsets[i], 33);
                break;
            default:
                throw "unrecognized value type"
        }

        if (decodedLength !== 0) {
            for (let o = 0; o < offsets.length; o++) {
                offsets[o] += decodedLength - 1;
            }
        }
    }

    return res
}

module.exports = {inject, valTypes};