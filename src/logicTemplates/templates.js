let assert = require('assert');
const address = require("../encoding/address");

function putUvarint(buf, x){
    let i = 0;
    while (x > 0x80) {
        buf.append((x&0xFF) | 0x80);
        x >>= 7;
        i += 1;
    }
    buf.append(x&0xFF);
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
        let firstChunk = arr.slice(0, offset); // TODO ejr maybe offset + 1
        firstChunk.push(newVal);
        let secondChunk = arr.slice(offset + placeholderLength, arr.length);
        return firstChunk.concat(secondChunk);
    }

    for (let i = 0; i < offsets.length; i++ ) {
        let decodedLength = 0;
        let val = values[i];
        let valType = valueTypes[i];

        switch (valType) {
            case valTypes.INT:
                let buf = [];
                decodedLength = putUvarint(buf, val);
                res = replace(res, val, offsets[i], 1);
                break;
            case valTypes.ADDRESS:
                val = address.decode(val);
                res = replace(res, val, offsets[i], 32);
                break;
            case valTypes.BASE64:
                val = Buffer.from(val, 'base64');
                res = replace(res, val, offsets[i], 32);
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