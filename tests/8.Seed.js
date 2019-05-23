let assert = require('assert');
let nacl = require("../src/nacl/naclWrappers");
let seedEncoding = require("../src/encoding/seed");

describe('seed', function () {
    describe('#isValid', function () {
        it('should validate an encoded seed', function () {
            const seed = nacl.randomBytes(32);
            const encodedSeed = seedEncoding.encode(seed);
            assert.ok(seedEncoding.isValidSeed(encodedSeed));
        });

        it('should fail to verify an invalid Algorand seed', function () {
            assert.strictEqual(seedEncoding.isValidSeed("MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJG"), false);
        });
    });

    describe('encode, decode', function () {
        it('should be able to encode and decode a seed', function () {
            const seed = nacl.randomBytes(32);
            const encodedSeed = seedEncoding.encode(seed);
            const decodedSeed = seedEncoding.decode(encodedSeed);
            assert.deepStrictEqual(new Uint8Array(decodedSeed.seed), seed);
        });
    });
});
