const base32 = require('hi-base32');
const nacl = require('../nacl/naclWrappers');
const utils = require('../utils/utils');

const ALGORAND_ADDRESS_BYTE_LENGTH = 36;
const ALGORAND_CHECKSUM_BYTE_LENGTH = 4;
const ALGORAND_ADDRESS_LENGTH = 58;

const MALFORMED_ADDRESS_ERROR = new Error("address seems to be malformed");

/**
 * isValidAddress takes an Algorand address and checks if valid.
 * @param address Algorand address
 * @returns {boolean}n true if valid, false otherwise
 */
function isValidAddress(address) {
    if (typeof address !== "string") return false;

    if (address.length !== ALGORAND_ADDRESS_LENGTH) return false;

    // Try to decode
    let decoded;
    try {
        decoded = decode(address);
    } catch (e) {
        return false;
    }

    // Compute checksum
    let checksum = nacl.genericHash(decoded.publicKey).slice(nacl.HASH_BYTES_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH,nacl.HASH_BYTES_LENGTH);

    // Check if the checksum and the address are equal
    return utils.arrayEqual(checksum, decoded.checksum);
}

function decode(address) {
    if (!(typeof address === "string" || address instanceof String)) throw MALFORMED_ADDRESS_ERROR;

    //try to decode
    let decoded = base32.decode.asBytes(address);

    // Sanity check
    if (decoded.length !== ALGORAND_ADDRESS_BYTE_LENGTH) throw new MALFORMED_ADDRESS_ERROR;

    let pk = new Uint8Array(decoded.slice(0, ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH));
    let cs = new Uint8Array(decoded.slice(nacl.PUBLIC_KEY_LENGTH, ALGORAND_ADDRESS_BYTE_LENGTH));

    return {"publicKey": pk, "checksum": cs}
}

function encode(address) {
    //compute checksum
    let checksum = nacl.genericHash(address).slice(nacl.PUBLIC_KEY_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH, nacl.PUBLIC_KEY_LENGTH);
    let addr = base32.encode(utils.concatArrays(address, checksum));

    return addr.toString().slice(0, ALGORAND_ADDRESS_LENGTH); // removing the extra '===='
}

module.exports = {isValidAddress, decode, encode, MALFORMED_ADDRESS_ERROR};