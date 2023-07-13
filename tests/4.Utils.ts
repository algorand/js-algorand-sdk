/* eslint-env mocha */
import assert from 'assert';
import * as utils from '../src/utils/utils';
import * as nacl from '../src/nacl/naclWrappers';

describe('utils', () => {
  describe('concatArrays', () => {
    it('should concat two Uint8Arrays', () => {
      const a = new Uint8Array([1, 2, 3]);
      const b = new Uint8Array([4, 5, 6]);

      const expected = new Uint8Array([1, 2, 3, 4, 5, 6]);
      const actual = utils.concatArrays(a, b);
      assert.deepStrictEqual(actual, expected);
    });

    it('should concat two number arrays as a Uint8Array', () => {
      const a = [1, 2, 3];
      const b = [4, 5, 6];

      const expected = new Uint8Array([1, 2, 3, 4, 5, 6]);
      const actual = utils.concatArrays(a, b);
      assert.deepStrictEqual(actual, expected);
      assert(actual instanceof Uint8Array);
    });

    it('should concat three Uint8Arrays', () => {
      const a = new Uint8Array([1, 2]);
      const b = new Uint8Array([3, 4]);
      const c = new Uint8Array([5, 6]);

      const expected = new Uint8Array([1, 2, 3, 4, 5, 6]);
      const actual = utils.concatArrays(a, b, c);
      assert.deepStrictEqual(expected, actual);
    });
  });

  describe('Base64 decoding utilities', () => {
    it('should decode bytes from Base64', () => {
      const testCases = [
        [
          Uint8Array.from([
            97,
            32,
            196,
            128,
            32,
            240,
            144,
            128,
            128,
            32,
            230,
            150,
            135,
            32,
            240,
            159,
            166,
            132,
          ]), // a Ā 𐀀 文 🦄
          'YSDEgCDwkICAIOaWhyDwn6aE',
        ],
        [
          Uint8Array.from([0, 1, 2, 3, 4, 46, 46, 46, 254, 255]), // non UTF-8 bytes
          'AAECAwQuLi7+/w==',
        ],
      ];
      for (const [expectedBytes, expectedEncoding] of testCases) {
        const actualBytes = utils.base64ToBytes(expectedEncoding as string);
        assert.deepStrictEqual(
          actualBytes,
          expectedBytes,
          `Incorrect encoding of ${expectedBytes}; got ${actualBytes}`
        );
      }
    });

    it('should decode and encode Base64 roundtrip for UTF-8 strings', () => {
      const testCases = [
        ['Hello, Algorand!', 'SGVsbG8sIEFsZ29yYW5kIQ=='],
        ['a Ā 𐀀 文 🦄', 'YSDEgCDwkICAIOaWhyDwn6aE'],
        ['(╯°□°）``` ┻━┻ 00\\', 'KOKVr8Kw4pahwrDvvIlgYGAg4pS74pSB4pS7IDAwXA=='],
      ];
      for (const [testCase, expectedEncoding] of testCases) {
        const actualB64Decoding = utils.base64ToString(expectedEncoding);
        assert.deepStrictEqual(
          actualB64Decoding,
          testCase,
          `Incorrect encoding of ${testCase}; got ${actualB64Decoding}`
        );

        const byteArray = new TextEncoder().encode(testCase);
        const base64String = utils.bytesToBase64(byteArray);
        const roundTripString = new TextDecoder().decode(
          utils.base64ToBytes(base64String)
        );

        assert.deepStrictEqual(
          roundTripString,
          testCase,
          `Incorrect decoding of ${testCase}; got ${roundTripString}`
        );
      }
    });

    it('should encode bytes to hex', () => {
      const testCases = [
        ['Hello, Algorand!', '48656c6c6f2c20416c676f72616e6421'],
        ['a Ā 𐀀 文 🦄', '6120c48020f090808020e6968720f09fa684'],
        [
          '(╯°□°）``` ┻━┻ 00\\',
          '28e295afc2b0e296a1c2b0efbc8960606020e294bbe29481e294bb2030305c',
        ],
      ];
      for (const [testCase, expectedEncoding] of testCases) {
        const binString = new TextEncoder().encode(testCase);
        const actualHexString = utils.bytesToHex(binString);
        assert.deepStrictEqual(
          actualHexString,
          expectedEncoding,
          `Incorrect encoding of ${testCase}; got ${actualHexString}`
        );
      }
    });
  });
});

describe('nacl wrapper', () => {
  it('should validate signature length', () => {
    assert.strictEqual(nacl.isValidSignatureLength(6), false);
    assert.strictEqual(nacl.isValidSignatureLength(64), true);
  });
});
