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
    });

    describe('from multisig preimage', function () {
        it('should match main repo code', function () {
            const addr1 = address.decode("XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU");
            const addr2 = address.decode("HTNOX33OCQI2JCOLZ2IRM3BC2WZ6JUILSLEORBPFI6W7GU5Q4ZW6LINHLA");
            const addr3 = address.decode("E6JSNTY4PVCY3IRZ6XEDHEO6VIHCQ5KGXCIQKFQCMB2N6HXRY4IB43VSHI");
            const params = {
                version: 1,
                threshold: 2,
                pks: [addr1.publicKey, addr2.publicKey, addr3.publicKey],
            };
            const expectAddr = "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM";
            let actualAddr = address.fromMultisigPreImg(params);
            let actualAddrEnc = address.encode(actualAddr);
            assert.ok(address.isValidAddress(actualAddrEnc));
            assert.deepStrictEqual(actualAddrEnc, expectAddr);
        });
    })
});
