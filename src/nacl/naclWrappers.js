const nacl = require('tweetnacl');
const sha512 = require('js-sha512');

function genericHash(arr) {
    return sha512.sha512_256.array(arr);
}

function randomBytes(length) {
    return nacl.randomBytes(length);
}

function keyPair() {
    let seed = randomBytes(nacl.box.secretKeyLength);
    return keyPairFromSeed(seed);
}

function keyPairFromSeed(seed) {
    return nacl.sign.keyPair.fromSeed(seed);
}

function keyPairFromSecretKey(sk) {
    return nacl.sign.keyPair.fromSecretKey(sk);
}

function sign(msg, secretKey) {
    return nacl.sign.detached(msg, secretKey);
}

function bytesEqual(a, b) {
    return nacl.verify(a, b);
}

function verify(message, signature, verifyKey) {
    return nacl.sign.detached.verify(message, signature, verifyKey);
}

module.exports = {genericHash, randomBytes, keyPair, sign, keyPairFromSeed, keyPairFromSecretKey, bytesEqual, verify};

// constants
module.exports.PUBLIC_KEY_LENGTH = nacl.sign.publicKeyLength;
module.exports.SECRET_KEY_LENGTH = nacl.sign.secretKeyLength;
module.exports.HASH_BYTES_LENGTH = 32;
module.exports.SEED_BTYES_LENGTH = 32;