const JSONbig = require('json-bigint')({ useNativeBigInt: true, strict: true });

/**
 * Parse JSON with support for BigInts. Any integers greater than Number.MAX_SAFE_INTEGER will be
 * parsed as BigInts.
 * @param {string} value The stringified JSON to parse. 
 */
function JSONParseWithBigInt(value) {
    const parsed = JSONbig.parse(value, function (_, value) {
        if (value != null && typeof value === 'object' && Object.getPrototypeOf(value) == null) {
            // for some reason the Objects returned by JSONbig.parse have a null prototype, so we
            // need to fix that.
            Object.setPrototypeOf(value, Object.prototype);
        } else if (typeof value === 'bigint') {
            // JSONbig.parse converts number to BigInts if they are >= 10**15. This is smaller than
            // Number.MAX_SAFE_INTEGER, so we can convert some BigInts back to normal numbers.
            if (value <= Number.MAX_SAFE_INTEGER) {
                return Number(value);
            }
        }
        return value;
    });
    return parsed;
}

/**
 * ArrayEqual takes two arrays and return true if equal, false otherwise
 * @return {boolean}
 */
function arrayEqual(a, b) {
    if (a.length !== b.length) {return false;}
    return a.every((val, i) => val === b[i]);
}

/**
 * ConcatArrays takes two array and returns a joint array of both
 * @param a
 * @param b
 * @returns {Uint8Array} [a,b]
 */
function concatArrays(a, b) {
    let c = new Uint8Array(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
}

module.exports = {
    JSONParseWithBigInt,
    arrayEqual,
    concatArrays
};
