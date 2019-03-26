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

module.exports = {arrayEqual, concatArrays};