const assert = require('assert');
const algosdk = require('../index');
const nacl = require("../src/nacl/naclWrappers");
const passphrase = require("../src/mnemonic/mnemonic");

describe('#mnemonic', function () {
    it('should return a 25 words passphrase', function () {
        const account = algosdk.generateAccount();
        const mn = algosdk.secretKeyToMnemonic(account.sk);
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
        const lastChar = mn.charAt(mn.length - 1) === "h" ? "i" : "h";
        mn = mn.substring(0, mn.length - 2) + lastChar;
        assert.throws(() => {
            passphrase.seedFromMnemonic(mn)
        }, (err) => err === passphrase.ERROR_FAIL_TO_DECODE_MNEMONIC);
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
