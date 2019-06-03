let assert = require('assert');
let nacl = require("../src/nacl/naclWrappers");
let Seed = require("../src/encoding/seed");

describe('seed', function () {
  describe('#isValid', function () {
    it('should validate an encoded seed', function () {
      const seed = nacl.randomBytes(32);
      const encodedSeed = Seed.encode(seed);
      assert.ok(Seed.isValidSeed(encodedSeed));
    });

    it('should fail to verify an invalid Algorand seed', function () {
      assert.strictEqual(Seed.isValidSeed("MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJG"), false);
    });
  });

  describe('encode, decode', function () {
    it('should be able to encode and decode a seed', function () {
      const seed = nacl.randomBytes(32);
      const encodedSeed = Seed.encode(seed);
      const decodedSeed = Seed.decode(encodedSeed);
      assert.deepStrictEqual(new Uint8Array(decodedSeed.seed), seed);
    });
  });
});
