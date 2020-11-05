const nacl = require('./nacl/naclWrappers');
const address = require('./encoding/address');

/**
 * generateAccount returns a new Algorand address and its corresponding secret key
 * @returns {{sk: Uint8Array, addr: string}}
 */
function generateAccount() {
    let keys = nacl.keyPair();
    let encodedPk = address.encodeAddress(keys.publicKey);
    return {addr: encodedPk, sk: keys.secretKey};
}

module.exports = { generateAccount };
