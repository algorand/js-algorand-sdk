import assert from 'assert';
import * as utils from '../src/utils/utils';
import * as convert from '../src/convert';

describe('utils & converts', () => {
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
  describe('convertCidByte32', () => {
    it('should convert IPFS CID V0 to 32 byte hex array and back', () => {
      const expected = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
      const a = convert.ipfsCidV0ToB32(expected);
      const actual = convert.b32ToIpfsCidV0(a);
      assert.strictEqual(expected, actual);
    });
  });
  describe('convertAlgoMicroAlgo', () => {
    it('should convert MicroAlgo and Algo and back', () => {
      const expected = 1e9;
      const a = convert.microalgosToAlgos(expected);
      const actual = convert.algosToMicroalgos(a);
      assert.strictEqual(expected, actual);
    });
  });
});
