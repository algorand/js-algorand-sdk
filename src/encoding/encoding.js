/**
 * This file is a wrapper of msgpack.js.
 * The wrapper was written in order to ensure correct encoding of Algorand Transaction and other formats.
 * In particular, it matches go-algorand blockchain client, written in go (https://www.github.com/algorand/go-algorand.
 * Algorand's msgpack encoding follows to following rules -
 *  1. Every integer must be encoded to the smallest type possible (0-255->8bit, 256-65535->16bit, etx)
 *  2. All fields names must be sorted
 *  3. All empty and 0 fields should be omitted
 *  4. Every positive number must be encoded as uint
 *  5. Binary blob should be used for binary data and string for strings
 *  */

const msgpack = require("@msgpack/msgpack");

// Errors
const ERROR_CONTAINS_EMPTY = new Error("The object contains empty or 0 values");

/**
 * containsEmpty returns true if any of the object's values are empty, false otherwise.
 * Empty arrays considered empty
 * @param obj
 * @returns {boolean} true if contains empty, false otherwise
 */
function containsEmpty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (!obj[key] || obj[key].length === 0) return true;
        }
    }
    return false;
}

/**
 * encode encodes objects using msgpack
 * @param obj a dictionary to be encoded. Must not contain empty or 0 values.
 * @returns {Uint8Array} msgpack representation of the object
 * @throws ERROR_CONTAINS_EMPTY if the object contains empty or zero values
 */
function encode(obj) {
    // Check for empty values
    if (containsEmpty(obj)) {throw ERROR_CONTAINS_EMPTY;}

    // enable the canonical option
    let options = {sortKeys: true};
    return msgpack.encode(obj, options);
}

function decode(obj) {
    return msgpack.decode(obj);
}

module.exports = {encode, decode, ERROR_CONTAINS_EMPTY};