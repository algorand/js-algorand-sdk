/* eslint-env mocha */
import assert from 'assert';
import * as nacl from '../src/nacl/naclWrappers.js';
import algosdk from '../src/index.js';
import * as address from '../src/encoding/address.js';

describe('address', () => {
  describe('#isValid', () => {
    const correctCase =
      'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI';
    // prettier-ignore
    const correctPublicKey = new Uint8Array([99, 180, 127, 102, 156, 252, 55, 227, 39, 198, 169, 232, 163, 16, 36, 130, 26, 223, 230, 213, 0, 153, 108, 192, 200, 197, 28, 77, 196, 50, 141, 112]);
    const correctChecksum = new Uint8Array([122, 240, 2, 74]);
    const malformedAddress1 =
      'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJ';
    const malformedAddress2 = 123 as any;
    const malformedAddress3 =
      'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACererZQGI113RBSRVYHV4ACJI';
    const wrongChecksumAddress =
      'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJG';

    // Check core functions
    it('should verify a valid Algorand address', () => {
      const decodedAddress = algosdk.decodeAddress(correctCase);
      assert.deepStrictEqual(decodedAddress.publicKey, correctPublicKey);
      assert.deepStrictEqual(decodedAddress.checksum(), correctChecksum);
    });

    it('should fail to verify a malformed Algorand address', () => {
      assert.throws(
        () => {
          algosdk.decodeAddress(malformedAddress1);
        },
        (err: Error) =>
          err.message.includes(address.MALFORMED_ADDRESS_ERROR_MSG)
      );
      assert.throws(
        () => {
          algosdk.decodeAddress(malformedAddress2);
        },
        (err: Error) =>
          err.message.includes(address.MALFORMED_ADDRESS_ERROR_MSG)
      );
      // Catch an exception possibly thrown by base32 decoding function
      assert.throws(() => {
        algosdk.decodeAddress(malformedAddress3);
      }, new Error('Invalid base32 characters'));
    });

    it('should fail to verify a checksum for an invalid Algorand address', () => {
      assert.throws(() => {
        algosdk.decodeAddress(wrongChecksumAddress);
      }, new Error(address.CHECKSUM_ADDRESS_ERROR_MSG));
    });

    // Check helper functions
    it('should verify a valid Algorand address', () => {
      assert.ok(algosdk.isValidAddress(correctCase));
    });

    it('should fail to verify an invalid Algorand address', () => {
      assert.strictEqual(algosdk.isValidAddress(malformedAddress1), false);
    });
  });

  describe('encode, decode', () => {
    it('should be able to encode and verify an address', () => {
      const pk = nacl.randomBytes(32);
      const addr = algosdk.encodeAddress(pk);
      assert.ok(algosdk.isValidAddress(addr));
    });

    it('should throw an error for addresses with incorrect length', () => {
      const pk = nacl.randomBytes(15);
      assert.throws(
        () => {
          algosdk.encodeAddress(pk);
        },
        (err: Error) =>
          err.message.includes(address.MALFORMED_ADDRESS_ERROR_MSG)
      );
    });

    it('should be able to encode and decode an address', () => {
      const pk = nacl.randomBytes(32);
      const addr = algosdk.encodeAddress(pk);
      const d = algosdk.decodeAddress(addr);
      assert.deepStrictEqual(new Uint8Array(d.publicKey), pk);
    });
  });

  describe('from multisig preimage', () => {
    it('should match main repo code', () => {
      const addr1 =
        'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const addr2 =
        'HTNOX33OCQI2JCOLZ2IRM3BC2WZ6JUILSLEORBPFI6W7GU5Q4ZW6LINHLA';
      const addr3 =
        'E6JSNTY4PVCY3IRZ6XEDHEO6VIHCQ5KGXCIQKFQCMB2N6HXRY4IB43VSHI';
      const params = {
        version: 1,
        threshold: 2,
        addrs: [addr1, addr2, addr3],
      };
      const expectAddr = algosdk.Address.fromString(
        'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM'
      );
      const actualAddr = algosdk.multisigAddress(params);
      assert.deepStrictEqual(actualAddr, expectAddr);
    });
  });

  describe('#getApplicationAddress', () => {
    it('should produce the correct address', () => {
      const appID = 77;
      const expected = algosdk.Address.fromString(
        'PCYUFPA2ZTOYWTP43MX2MOX2OWAIAXUDNC2WFCXAGMRUZ3DYD6BWFDL5YM'
      );
      const actual = algosdk.getApplicationAddress(appID);
      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('Zero address', () => {
    it('should be correct', () => {
      assert.strictEqual(
        algosdk.ALGORAND_ZERO_ADDRESS_STRING,
        algosdk.encodeAddress(new Uint8Array(32))
      );
    });
  });
});
