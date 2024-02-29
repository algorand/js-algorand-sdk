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

  describe('ensureSafeInteger', () => {
    it('should error on undefined', () => {
      assert.throws(
        () => utils.ensureSafeInteger(undefined),
        new Error('Value is undefined')
      );
    });

    it('should accept bigints in range', () => {
      assert.strictEqual(
        utils.ensureSafeInteger(BigInt(Number.MIN_SAFE_INTEGER)),
        Number.MIN_SAFE_INTEGER
      );
      assert.strictEqual(utils.ensureSafeInteger(BigInt(-100)), -100);
      assert.strictEqual(utils.ensureSafeInteger(BigInt(0)), 0);
      assert.strictEqual(utils.ensureSafeInteger(BigInt(7)), 7);
      assert.strictEqual(
        utils.ensureSafeInteger(BigInt(Number.MAX_SAFE_INTEGER)),
        Number.MAX_SAFE_INTEGER
      );
    });

    it('should error on bigints outside of range', () => {
      assert.throws(
        () =>
          utils.ensureSafeInteger(BigInt(Number.MIN_SAFE_INTEGER) - BigInt(1)),
        new Error('BigInt value -9007199254740992 is not a safe integer')
      );
      assert.throws(
        () =>
          utils.ensureSafeInteger(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1)),
        new Error('BigInt value 9007199254740992 is not a safe integer')
      );
    });

    it('should accept safe integers', () => {
      assert.strictEqual(
        utils.ensureSafeInteger(Number.MIN_SAFE_INTEGER),
        Number.MIN_SAFE_INTEGER
      );
      assert.strictEqual(utils.ensureSafeInteger(-100), -100);
      assert.strictEqual(utils.ensureSafeInteger(0), 0);
      assert.strictEqual(utils.ensureSafeInteger(7), 7);
      assert.strictEqual(
        utils.ensureSafeInteger(Number.MAX_SAFE_INTEGER),
        Number.MAX_SAFE_INTEGER
      );
    });

    it('should error on unsafe integers', () => {
      assert.throws(
        () => utils.ensureSafeInteger(0.5),
        new Error('Value 0.5 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureSafeInteger(Number.MIN_SAFE_INTEGER - 1),
        new Error('Value -9007199254740992 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureSafeInteger(Number.MAX_SAFE_INTEGER + 1),
        new Error('Value 9007199254740992 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureSafeInteger(NaN),
        new Error('Value NaN is not a safe integer')
      );
    });

    it('should error on unexpected types', () => {
      assert.throws(
        () => utils.ensureSafeInteger('0'),
        new Error('Unexpected type string, 0')
      );

      assert.throws(
        () => utils.ensureSafeInteger(true),
        new Error('Unexpected type boolean, true')
      );

      assert.throws(
        () => utils.ensureSafeInteger(null),
        new Error('Unexpected type object, null')
      );
    });
  });

  describe('ensureSafeUnsignedInteger', () => {
    it('should error on undefined', () => {
      assert.throws(
        () => utils.ensureSafeUnsignedInteger(undefined),
        new Error('Value is undefined')
      );
    });

    it('should accept positive bigints in range', () => {
      assert.strictEqual(utils.ensureSafeUnsignedInteger(BigInt(0)), 0);
      assert.strictEqual(utils.ensureSafeUnsignedInteger(BigInt(7)), 7);
      assert.strictEqual(
        utils.ensureSafeUnsignedInteger(BigInt(Number.MAX_SAFE_INTEGER)),
        Number.MAX_SAFE_INTEGER
      );
    });

    it('should error on negative bigints in range', () => {
      assert.throws(
        () => utils.ensureSafeUnsignedInteger(BigInt(Number.MIN_SAFE_INTEGER)),
        new Error('Value -9007199254740991 is negative')
      );
      assert.throws(
        () => utils.ensureSafeUnsignedInteger(BigInt(-100)),
        new Error('Value -100 is negative')
      );
    });

    it('should error on bigints outside of range', () => {
      assert.throws(
        () =>
          utils.ensureSafeUnsignedInteger(
            BigInt(Number.MIN_SAFE_INTEGER) - BigInt(1)
          ),
        new Error('BigInt value -9007199254740992 is not a safe integer')
      );
      assert.throws(
        () =>
          utils.ensureSafeUnsignedInteger(
            BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1)
          ),
        new Error('BigInt value 9007199254740992 is not a safe integer')
      );
    });

    it('should accept positive safe integers', () => {
      assert.strictEqual(utils.ensureSafeUnsignedInteger(0), 0);
      assert.strictEqual(utils.ensureSafeUnsignedInteger(7), 7);
      assert.strictEqual(
        utils.ensureSafeUnsignedInteger(Number.MAX_SAFE_INTEGER),
        Number.MAX_SAFE_INTEGER
      );
    });

    it('should error on negative safe integers', () => {
      assert.throws(
        () => utils.ensureSafeUnsignedInteger(Number.MIN_SAFE_INTEGER),
        new Error('Value -9007199254740991 is negative')
      );
      assert.throws(
        () => utils.ensureSafeUnsignedInteger(-100),
        new Error('Value -100 is negative')
      );
    });

    it('should error on unsafe integers', () => {
      assert.throws(
        () => utils.ensureSafeUnsignedInteger(0.5),
        new Error('Value 0.5 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureSafeUnsignedInteger(Number.MIN_SAFE_INTEGER - 1),
        new Error('Value -9007199254740992 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureSafeUnsignedInteger(Number.MAX_SAFE_INTEGER + 1),
        new Error('Value 9007199254740992 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureSafeUnsignedInteger(NaN),
        new Error('Value NaN is not a safe integer')
      );
    });

    it('should error on unexpected types', () => {
      assert.throws(
        () => utils.ensureSafeUnsignedInteger('0'),
        new Error('Unexpected type string, 0')
      );

      assert.throws(
        () => utils.ensureSafeUnsignedInteger(true),
        new Error('Unexpected type boolean, true')
      );

      assert.throws(
        () => utils.ensureSafeUnsignedInteger(null),
        new Error('Unexpected type object, null')
      );
    });
  });

  describe('ensureBigInt', () => {
    it('should error on undefined', () => {
      assert.throws(
        () => utils.ensureBigInt(undefined),
        new Error('Value is undefined')
      );
    });

    it('should accept bigints', () => {
      assert.strictEqual(
        utils.ensureBigInt(
          BigInt(-1) * BigInt('0xffffffffffffffff') - BigInt(1)
        ),
        BigInt(-1) * BigInt('0xffffffffffffffff') - BigInt(1)
      );
      assert.strictEqual(
        utils.ensureBigInt(BigInt(-1) * BigInt('0xffffffffffffffff')),
        BigInt(-1) * BigInt('0xffffffffffffffff')
      );
      assert.strictEqual(
        utils.ensureBigInt(BigInt(Number.MIN_SAFE_INTEGER) - BigInt(1)),
        BigInt(Number.MIN_SAFE_INTEGER) - BigInt(1)
      );
      assert.strictEqual(
        utils.ensureBigInt(BigInt(Number.MIN_SAFE_INTEGER)),
        BigInt(Number.MIN_SAFE_INTEGER)
      );
      assert.strictEqual(utils.ensureBigInt(BigInt(-100)), BigInt(-100));
      assert.strictEqual(utils.ensureBigInt(BigInt(0)), BigInt(0));
      assert.strictEqual(utils.ensureBigInt(BigInt(7)), BigInt(7));
      assert.strictEqual(
        utils.ensureBigInt(BigInt(Number.MAX_SAFE_INTEGER)),
        BigInt(Number.MAX_SAFE_INTEGER)
      );
      assert.strictEqual(
        utils.ensureBigInt(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1)),
        BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1)
      );
      assert.strictEqual(
        utils.ensureBigInt(BigInt('0xffffffffffffffff')),
        BigInt('0xffffffffffffffff')
      );
      assert.strictEqual(
        utils.ensureBigInt(BigInt('0xffffffffffffffff') + BigInt(1)),
        BigInt('0xffffffffffffffff') + BigInt(1)
      );
    });

    it('should accept safe integers', () => {
      assert.strictEqual(
        utils.ensureBigInt(Number.MIN_SAFE_INTEGER),
        BigInt(Number.MIN_SAFE_INTEGER)
      );
      assert.strictEqual(utils.ensureBigInt(-100), BigInt(-100));
      assert.strictEqual(utils.ensureBigInt(0), BigInt(0));
      assert.strictEqual(utils.ensureBigInt(7), BigInt(7));
      assert.strictEqual(
        utils.ensureBigInt(Number.MAX_SAFE_INTEGER),
        BigInt(Number.MAX_SAFE_INTEGER)
      );
    });

    it('should error on unsafe integers', () => {
      assert.throws(
        () => utils.ensureBigInt(0.5),
        new Error('Value 0.5 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureBigInt(Number.MIN_SAFE_INTEGER - 1),
        new Error('Value -9007199254740992 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureBigInt(Number.MAX_SAFE_INTEGER + 1),
        new Error('Value 9007199254740992 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureBigInt(NaN),
        new Error('Value NaN is not a safe integer')
      );
    });

    it('should error on unexpected types', () => {
      assert.throws(
        () => utils.ensureBigInt('0'),
        new Error('Unexpected type string, 0')
      );

      assert.throws(
        () => utils.ensureBigInt(true),
        new Error('Unexpected type boolean, true')
      );

      assert.throws(
        () => utils.ensureBigInt(null),
        new Error('Unexpected type object, null')
      );
    });
  });

  describe('ensureUint64', () => {
    it('should error on undefined', () => {
      assert.throws(
        () => utils.ensureUint64(undefined),
        new Error('Value is undefined')
      );
    });

    it('should accept bigints in range', () => {
      assert.strictEqual(utils.ensureUint64(BigInt(0)), BigInt(0));
      assert.strictEqual(utils.ensureUint64(BigInt(7)), BigInt(7));
      assert.strictEqual(
        utils.ensureUint64(BigInt(Number.MAX_SAFE_INTEGER)),
        BigInt(Number.MAX_SAFE_INTEGER)
      );
      assert.strictEqual(
        utils.ensureUint64(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1)),
        BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1)
      );
      assert.strictEqual(
        utils.ensureUint64(BigInt('0xffffffffffffffff')),
        BigInt('0xffffffffffffffff')
      );
    });

    it('should error on bigints out of range', () => {
      assert.throws(
        () => utils.ensureUint64(BigInt(-100)),
        new Error('Value -100 is not a uint64')
      );
      assert.throws(
        () => utils.ensureUint64(BigInt('0xffffffffffffffff') + BigInt(1)),
        new Error('Value 18446744073709551616 is not a uint64')
      );
    });

    it('should accept positive safe integers', () => {
      assert.strictEqual(utils.ensureUint64(0), BigInt(0));
      assert.strictEqual(utils.ensureUint64(7), BigInt(7));
      assert.strictEqual(
        utils.ensureUint64(Number.MAX_SAFE_INTEGER),
        BigInt(Number.MAX_SAFE_INTEGER)
      );
    });

    it('should error on negative safe integers', () => {
      assert.throws(
        () => utils.ensureUint64(Number.MIN_SAFE_INTEGER),
        new Error('Value -9007199254740991 is not a uint64')
      );
      assert.throws(
        () => utils.ensureUint64(-100),
        new Error('Value -100 is not a uint64')
      );
    });

    it('should error on unsafe integers', () => {
      assert.throws(
        () => utils.ensureUint64(0.5),
        new Error('Value 0.5 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureUint64(Number.MIN_SAFE_INTEGER - 1),
        new Error('Value -9007199254740992 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureUint64(Number.MAX_SAFE_INTEGER + 1),
        new Error('Value 9007199254740992 is not a safe integer')
      );
      assert.throws(
        () => utils.ensureUint64(NaN),
        new Error('Value NaN is not a safe integer')
      );
    });

    it('should error on unexpected types', () => {
      assert.throws(
        () => utils.ensureUint64('0'),
        new Error('Unexpected type string, 0')
      );

      assert.throws(
        () => utils.ensureUint64(true),
        new Error('Unexpected type boolean, true')
      );

      assert.throws(
        () => utils.ensureUint64(null),
        new Error('Unexpected type object, null')
      );
    });
  });
});

describe('nacl wrapper', () => {
  it('should validate signature length', () => {
    assert.strictEqual(nacl.isValidSignatureLength(6), false);
    assert.strictEqual(nacl.isValidSignatureLength(64), true);
  });
});
