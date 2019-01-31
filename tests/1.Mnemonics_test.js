let assert = require('assert');
let nacl = require("../src/nacl/naclWrappers");
let passphrase = require("../src/mnemonic/mnemonic");

describe('#mnemonic', function () {
    it('should return a 25 words passphrase', function () {
        let keys = nacl.keyPair();
        let mn = passphrase.mnemonicFromSeed(keys.secretKey.slice(0, 32));
        assert.strictEqual(mn.split(" ").length, 25);
    });

    it('should be able to be converted back to key', function () {
        for (let i = 0; i < 50; i++) {
            let seed = nacl.randomBytes(32);
            let mn = passphrase.mnemonicFromSeed(seed);
            let key_target = passphrase.seedFromMnemonic(mn);
            let truncatedKey = new Uint8Array(seed);

            assert.deepStrictEqual(key_target, truncatedKey);
        }
    });

    it('should convert pass the zero vector test', function () {
        let key = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        let mn = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon invest";
        let key_target = passphrase.mnemonicFromSeed(key);
        assert.deepStrictEqual(key_target, mn);
    });

    it('should fail with the wrong checksum', function () {
        let seed = nacl.randomBytes(32);
        let mn = passphrase.mnemonicFromSeed(seed);
        //Shuffle some bits
        mn[-1] = "h";
        assert.throws(passphrase.seedFromMnemonic, mn);
    });

    it('should fail to verify an invalid mnemonic', function () {
        let mn = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon venue abandon abandon abandon abandon abandon abandon abandon abandon abandon invest"
        assert.throws(() => {
            passphrase.seedFromMnemonic(mn);
        }, (err) => err === passphrase.ERROR_FAIL_TO_DECODE_MNEMONIC);

    });
    it('should fail to verify an mnemonic with a word that is not in the list ', function () {
        let mn = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon venues abandon abandon abandon abandon abandon abandon abandon abandon abandon invest"
        assert.throws(() => {
            passphrase.seedFromMnemonic(mn);
        }, (err) => err === passphrase.ERROR_NOT_IN_WORDS_LIST);

    });
});
