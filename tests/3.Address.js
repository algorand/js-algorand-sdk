let assert = require('assert');
let nacl = require("../src/nacl/naclWrappers");
let address = require("../src/encoding/address");

describe('address', function () {
    describe('#isValid', function () {
        it('should verify a valid Algorand address', function () {
            assert.ok(address.isValidAddress("MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI"));
        });

        it('should fail to verify an invalid Algorand address', function () {
            assert.strictEqual(address.isValidAddress("MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJG"), false);
        });
    });

    describe('encode, decode', function () {
        it('should be able to encode and verify an address', function () {
            let pk = nacl.randomBytes(32);
            let addr = address.encode(pk);
            assert.ok(address.isValidAddress(addr));
        });

        it('should be able to encode and decode an address', function () {
            let pk = nacl.randomBytes(32);
            let addr = address.encode(pk);
            let d = address.decode(addr);
            assert.deepStrictEqual(new Uint8Array(d.publicKey), pk);
        });
    })
});
