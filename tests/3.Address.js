const assert = require('assert');
const nacl = require("../src/nacl/naclWrappers");
const algosdk = require('../index');
const address = require('../src/encoding/address')

describe('address', function () {
    describe('#isValid', function () {

        const corret_address = "MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI";
        const correct_publickey = new Uint8Array([
            99, 180, 127, 102, 156, 252,  55, 227, 39, 198, 169, 232, 163,  16,  36, 130,
            26, 223, 230, 213,   0, 153, 108, 192, 200, 197,  28,  77, 196,  50, 141, 112 ]);
        const correct_checksum = new Uint8Array([ 122, 240, 2, 74 ]);
        const malformed_address1 = "MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJ";
        const malformed_address2 = 123;
        const malformed_address3 = "MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACererZQGI113RBSRVYHV4ACJI";
        const wrong_checksum_address = "MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJG";

        // Check core functions
        it('should verify a valid Algorand address', function () {
            const decoded_address = algosdk.decodeAddress(corret_address);
            assert.deepStrictEqual(decoded_address.publicKey, correct_publickey);
            assert.deepStrictEqual(decoded_address.checksum, correct_checksum);
        });

        it('should fail to verify a malformed Algorand address', function () {
            assert.throws(() => { algosdk.decodeAddress(malformed_address1) }, (err) => err === address.MALFORMED_ADDRESS_ERROR);
            assert.throws(() => { algosdk.decodeAddress(malformed_address2) }, (err) => err === address.MALFORMED_ADDRESS_ERROR);
            // Catch an exception possibly thrown by base32 decoding function
            assert.throws(() => { algosdk.decodeAddress(malformed_address3) }, (err) => err.message === "Invalid base32 characters");
        });

        it('should fail to verify a checksum for an invalid Algorand address', function () {
            assert.throws(() => { algosdk.decodeAddress(wrong_checksum_address) }, (err) => err === address.CHECKSUM_ADDRESS_ERROR);
       });

        // Check helper functions
        it('should verify a valid Algorand address', function () {
            assert.ok(algosdk.isValidAddress(corret_address));
        });

        it('should fail to verify an invalid Algorand address', function () {
            assert.strictEqual(algosdk.isValidAddress(malformed_address1), false);
        });

    });

    describe('encode, decode', function () {
        it('should be able to encode and verify an address', function () {
            let pk = nacl.randomBytes(32);
            let addr = algosdk.encodeAddress(pk);
            assert.ok(algosdk.isValidAddress(addr));
        });

        it('should be able to encode and decode an address', function () {
            let pk = nacl.randomBytes(32);
            let addr = algosdk.encodeAddress(pk);
            let d = algosdk.decodeAddress(addr);
            assert.deepStrictEqual(new Uint8Array(d.publicKey), pk);
        });
    });

    describe('from multisig preimage', function () {
        it('should match main repo code', function () {
            const addr1 = "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU";
            const addr2 = "HTNOX33OCQI2JCOLZ2IRM3BC2WZ6JUILSLEORBPFI6W7GU5Q4ZW6LINHLA";
            const addr3 = "E6JSNTY4PVCY3IRZ6XEDHEO6VIHCQ5KGXCIQKFQCMB2N6HXRY4IB43VSHI";
            const params = {
                version: 1,
                threshold: 2,
                addrs: [addr1, addr2, addr3],
            };
            const expectAddr = "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM";
            let actualAddr = algosdk.multisigAddress(params);
            assert.ok(algosdk.isValidAddress(actualAddr));
            assert.deepStrictEqual(actualAddr, expectAddr);
        });
    })
});
