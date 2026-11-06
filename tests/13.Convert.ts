/* eslint-env mocha */
import assert from 'assert';
import {
  microalgosToAlgos,
  algosToMicroalgos,
  INVALID_MICROALGOS_ERROR_MSG,
} from '../src/convert.js';

describe('convert', () => {
  describe('microalgosToAlgos', () => {
    it('should convert safe integer microalgos to algos', () => {
      assert.strictEqual(microalgosToAlgos(0), 0);
      assert.strictEqual(microalgosToAlgos(1_000_000), 1);
      assert.strictEqual(microalgosToAlgos(1_500_000), 1.5);
      assert.strictEqual(microalgosToAlgos(1), 0.000001);
      assert.strictEqual(
        microalgosToAlgos(Number.MAX_SAFE_INTEGER),
        Number.MAX_SAFE_INTEGER / 1e6
      );
    });

    it('should convert bigint microalgos to algos', () => {
      assert.strictEqual(microalgosToAlgos(0n), 0);
      assert.strictEqual(microalgosToAlgos(1_000_000n), 1);
      assert.strictEqual(microalgosToAlgos(1_500_000n), 1.5);
      assert.strictEqual(microalgosToAlgos(1n), 0.000001);
      assert.strictEqual(microalgosToAlgos(10_000_000_000_000n), 10_000_000);
      assert.strictEqual(
        microalgosToAlgos(BigInt(Number.MAX_SAFE_INTEGER)),
        Number.MAX_SAFE_INTEGER / 1e6
      );
    });

    it('should throw on negative numbers or non-safe integers', () => {
      assert.throws(() => microalgosToAlgos(-1), {
        message: INVALID_MICROALGOS_ERROR_MSG,
      });
      assert.throws(() => microalgosToAlgos(1.5), {
        message: INVALID_MICROALGOS_ERROR_MSG,
      });
      assert.throws(() => microalgosToAlgos(Number.MAX_SAFE_INTEGER + 1), {
        message: INVALID_MICROALGOS_ERROR_MSG,
      });
    });

    it('should throw on negative bigints', () => {
      assert.throws(() => microalgosToAlgos(-1n), {
        message: INVALID_MICROALGOS_ERROR_MSG,
      });
      assert.throws(() => microalgosToAlgos(-1_000_000n), {
        message: INVALID_MICROALGOS_ERROR_MSG,
      });
    });
  });

  describe('algosToMicroalgos', () => {
    it('should convert number algos to microalgos', () => {
      assert.strictEqual(algosToMicroalgos(0), 0);
      assert.strictEqual(algosToMicroalgos(1), 1_000_000);
      assert.strictEqual(algosToMicroalgos(1.5), 1_500_000);
      assert.strictEqual(algosToMicroalgos(0.000001), 1);
    });

    it('should convert bigint algos to microalgos as number by default', () => {
      assert.strictEqual(algosToMicroalgos(0n), 0);
      assert.strictEqual(algosToMicroalgos(1n), 1_000_000);
      assert.strictEqual(algosToMicroalgos(50n), 50_000_000);
    });

    it('should return bigint when returnBigInt is true', () => {
      assert.strictEqual(algosToMicroalgos(0, true), 0n);
      assert.strictEqual(algosToMicroalgos(1, true), 1_000_000n);
      assert.strictEqual(algosToMicroalgos(1.5, true), 1_500_000n);
      assert.strictEqual(algosToMicroalgos(0n, true), 0n);
      assert.strictEqual(algosToMicroalgos(1n, true), 1_000_000n);
      assert.strictEqual(
        algosToMicroalgos(10_000_000n, true),
        10_000_000_000_000n
      );
    });

    it('should maintain roundtrip precision', () => {
      const amounts = [1, 50, 1000, 250000];
      for (const amount of amounts) {
        assert.strictEqual(
          microalgosToAlgos(algosToMicroalgos(amount, true)),
          amount
        );
        assert.strictEqual(
          microalgosToAlgos(algosToMicroalgos(BigInt(amount), true)),
          amount
        );
      }
    });
  });
});
