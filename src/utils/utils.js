const JSONbig = require('json-bigint')({ useNativeBigInt: true, strict: true });

/**
 * Parse JSON with additional options.
 * @param {string} str The JSON string to parse.
 * @param {object} options Parsing options.
 * @param {boolean} options.useBigInt If true, this option will cause all integers in the JSON
 *   string to be parsed as BigInts. If false, this option will parse integers as Numbers but will
 *   throw an error if an integer larger than Number.MAX_SAFE_INTEGER is included in the JSON.
 *   Defaults to false.
 */
function parseJSON(str, options=undefined) {
    const useBigInt = options ? options.useBigInt : false;
    const parsed = JSONbig.parse(str, function (_, value) {
        if (value != null && typeof value === 'object' && Object.getPrototypeOf(value) == null) {
            // for some reason the Objects returned by JSONbig.parse have a null prototype, so we
            // need to fix that.
            Object.setPrototypeOf(value, Object.prototype);
        } else if (typeof value === 'bigint') {
            if (useBigInt) {
                return value;
            }

            // JSONbig.parse converts number to BigInts if they are >= 10**15. This is smaller than
            // Number.MAX_SAFE_INTEGER, so we can convert some BigInts back to normal numbers.
            if (value <= Number.MAX_SAFE_INTEGER) {
                return Number(value);
            }

            throw new Error("Integer exceeds maximum safe integer: " + value.toString() + ". Try parsing with the useBigInt option enabled.");
        } else if (typeof value === 'number') {
            if (useBigInt && Number.isInteger(value)) {
                return BigInt(value);
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
    parseJSON,
    arrayEqual,
    concatArrays
};
