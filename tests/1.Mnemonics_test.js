/* eslint-env mocha */
const assert = require('assert');
const algosdk = require('../src/index');
const nacl = require('../src/nacl/naclWrappers');
const passphrase = require('../src/mnemonic/mnemonic');

describe('#mnemonic', () => {
  it('should return a 25 words passphrase', () => {
    const account = algosdk.generateAccount();
    const mn = algosdk.secretKeyToMnemonic(account.sk);
    assert.strictEqual(mn.split(' ').length, 25);
  });

  it('should be able to be converted back to key', () => {
    for (let i = 0; i < 50; i++) {
      const seed = nacl.randomBytes(32);
      const mn = passphrase.mnemonicFromSeed(seed);
      const keyTarget = passphrase.seedFromMnemonic(mn);
      const truncatedKey = new Uint8Array(seed);

      assert.deepStrictEqual(keyTarget, truncatedKey);
    }
  });

  it('should convert pass the zero vector test', () => {
    // A zero Uint8Array of length 32
    const key = new Uint8Array(Array.from({ length: 32 }, () => 0));
    const mn =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon invest';
    const keyTarget = passphrase.mnemonicFromSeed(key);
    assert.deepStrictEqual(keyTarget, mn);
  });

  it('should fail with the wrong checksum', () => {
    const seed = nacl.randomBytes(32);
    let mn = passphrase.mnemonicFromSeed(seed);
    // Shuffle some bits
    const lastChar = mn.charAt(mn.length - 1) === 'h' ? 'i' : 'h';
    mn = mn.substring(0, mn.length - 2) + lastChar;
    assert.throws(
      () => {
        passphrase.seedFromMnemonic(mn);
      },
      (err) => err.message === passphrase.FAIL_TO_DECODE_MNEMONIC_ERROR_MSG
    );
  });

  it('should fail to verify an invalid mnemonic', () => {
    const mn =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon venue abandon abandon abandon abandon abandon abandon abandon abandon abandon invest';
    assert.throws(
      () => {
        passphrase.seedFromMnemonic(mn);
      },
      (err) => err.message === passphrase.FAIL_TO_DECODE_MNEMONIC_ERROR_MSG
    );
  });
  it('should fail to verify an mnemonic with a word that is not in the list ', () => {
    const mn =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon venues abandon abandon abandon abandon abandon abandon abandon abandon abandon invest';
    assert.throws(
      () => {
        passphrase.seedFromMnemonic(mn);
      },
      (err) => err.message === passphrase.NOT_IN_WORDS_LIST_ERROR_MSG
    );
  });
});
