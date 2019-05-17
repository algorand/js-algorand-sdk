const base32 = require('hi-base32');
const nacl = require('../nacl/naclWrappers');
const utils = require('../utils/utils');

const ALGORAND_ADDRESS_BYTE_LENGTH = 36;
const ALGORAND_CHECKSUM_BYTE_LENGTH = 4;
const ALGORAND_ADDRESS_LENGTH = 58;

// Convert "MultisigAddr" UTF-8 to byte array
const MULTISIG_PREIMG2ADDR_PREFIX = new Uint8Array([77, 117, 108, 116, 105, 115, 105, 103, 65, 100, 100, 114]);

const MALFORMED_ADDRESS_ERROR = new Error("address seems to be malformed");
const INVALID_MSIG_VERSION = new Error("invalid multisig version");
const INVALID_MSIG_THRESHOLD = new Error("bad multisig threshold");
const INVALID_MSIG_PK = new Error("bad multisig public key - wrong length");
const UNEXPECTED_PK_LEN = new Error("nacl public key length is not 32 bytes");

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
    if (decoded.length !== ALGORAND_ADDRESS_BYTE_LENGTH) throw MALFORMED_ADDRESS_ERROR;

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

/**
 * fromMultisigPreImg takes multisig parameters and returns a 32 byte typed array public key,
 * representing an address that identifies the "exact group, version, and public keys" that are required for signing.
 * Hash("MultisigAddr" || version uint8 || threshold uint8 || PK1 || PK2 || ...)
 * Encoding this output yields a human readable address.
 * @param version multisig version
 * @param threshold multisig threshold
 * @param pks array of typed array public keys
 */
function fromMultisigPreImg({version, threshold, pks}) {
    if (version !== 1 || version > 255 || version < 0) {
        // ^ a tad redundant, but in case in the future version != 1, still check for uint8
        throw INVALID_MSIG_VERSION;
    }
    if (threshold === 0 || pks.length === 0 || threshold > pks.length || threshold > 255) {
        throw INVALID_MSIG_THRESHOLD;
    }
    let pkLen = ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH;
    if (pkLen !== nacl.PUBLIC_KEY_LENGTH) {
        throw UNEXPECTED_PK_LEN;
    }
    let merged = new Uint8Array(MULTISIG_PREIMG2ADDR_PREFIX.length + 2 + pkLen*pks.length);
    merged.set(MULTISIG_PREIMG2ADDR_PREFIX, 0);
    merged.set([version], MULTISIG_PREIMG2ADDR_PREFIX.length);
    merged.set([threshold], MULTISIG_PREIMG2ADDR_PREFIX.length + 1);
    for (var i = 0; i < pks.length; i++) {
        if (pks[i].length !== pkLen) {
            throw INVALID_MSIG_PK;
        }
        merged.set(pks[i], MULTISIG_PREIMG2ADDR_PREFIX.length + 2 + i*pkLen);
    }
    return nacl.genericHash(merged);
}

/**
 * fromMultisigPreImgAddrs takes multisig parameters and returns a human readable Algorand address.
 * This is equivalent to fromMultisigPreImg, but interfaces with encoded addresses.
 * @param version multisig version
 * @param threshold multisig threshold
 * @param addrs array of encoded addresses
 */
function fromMultisigPreImgAddrs({version, threshold, addrs}) {
    const pks = addrs.map(addr => {
        return decode(addr).publicKey;
    });
    return encode(fromMultisigPreImg({version, threshold, pks}));
}

module.exports = {isValidAddress, decode, encode, fromMultisigPreImg, fromMultisigPreImgAddrs, MALFORMED_ADDRESS_ERROR,
    INVALID_MSIG_VERSION, INVALID_MSIG_THRESHOLD, INVALID_MSIG_PK, UNEXPECTED_PK_LEN};