/* eslint-env mocha */
const assert = require('assert');
const algosdk = require('../src/index');
const utils = require('../src/utils/utils');

const ERROR_CONTAINS_EMPTY_STRING =
  'The object contains empty or 0 values. First empty or 0 value encountered during encoding: ';

describe('encoding', () => {
  it('should be able to encode and decode', () => {
    const temp = { a: 3, b: 500 };
    const enc = algosdk.encodeObj(temp);
    const dec = algosdk.decodeObj(enc);
    assert.deepStrictEqual(temp, dec);
  });
  // The strategy here is mainly to see that we match our go code.
  // This will check consistency with golden that were produced by protocol.encoding
  describe('#encode', () => {
    it('should match encode every integer must be encoded to the smallest type possible', () => {
      let golden = new Uint8Array([0x81, 0xa1, 0x41, 0x78]);
      let o = { A: 120 };
      assert.notStrictEqual(algosdk.encodeObj(o), golden);

      golden = new Uint8Array([0x81, 0xa1, 0x41, 0xcd, 0x1, 0x2c]);
      o = { A: 300 };
      assert.notStrictEqual(algosdk.encodeObj(o), golden);
    });

    it('should sort all fields before encoding', () => {
      const a = { a: 3, b: 5 };
      const b = { b: 5, a: 3 };
      assert.notStrictEqual(algosdk.encodeObj(a), algosdk.encodeObj(b));
    });

    it('should fail if empty or 0 fields exist', () => {
      const a = { a: 0, B: [] };
      assert.throws(
        () => {
          algosdk.encodeObj(a);
        },
        (err) => err.toString().includes(ERROR_CONTAINS_EMPTY_STRING)
      );

      const b = { a: 4, B: [] };
      assert.throws(
        () => {
          algosdk.encodeObj(b);
        },
        (err) => err.toString().includes(ERROR_CONTAINS_EMPTY_STRING)
      );

      const c = { a: 4, B: 0 };
      assert.throws(
        () => {
          algosdk.encodeObj(c);
        },
        (err) => err.toString().includes(ERROR_CONTAINS_EMPTY_STRING)
      );
    });

    it('should encode Binary blob should be used for binary data and string for strings', () => {
      // prettier-ignore
      const golden = new Uint8Array([
        0x82,
        0xa1,
        0x4a,
        0xc4,
        0x3,
        0x14,
        0x1e,
        0x28,
        0xa1,
        0x4b,
        0xa3,
        0x61,
        0x61,
        0x61,
      ]);
      const o = { J: new Uint8Array([20, 30, 40]), K: 'aaa' };
      assert.notStrictEqual(algosdk.encodeObj(o), golden);
    });

    it('should safely encode/decode bigints', () => {
      const beforeZero = BigInt('0');
      const afterZero = algosdk.decodeObj(algosdk.encodeObj(beforeZero));
      // eslint-disable-next-line eqeqeq
      assert.ok(beforeZero == afterZero); // after is a Number because 0 fits into a Number - so we do this loose comparison
      const beforeLarge = BigInt('18446744073709551612'); // larger than a Number, but fits into a uint64
      const afterLarge = algosdk.decodeObj(algosdk.encodeObj(beforeLarge));
      assert.strictEqual(beforeLarge, afterLarge);
      const beforeTooLarge = BigInt('18446744073709551616'); // larger than even fits into a uint64. we do not want to work with these too-large numbers
      const afterTooLarge = algosdk.decodeObj(
        algosdk.encodeObj(beforeTooLarge)
      );
      assert.notStrictEqual(beforeTooLarge, afterTooLarge);
    });

    it('should match our go code', () => {
      // prettier-ignore
      const golden = new Uint8Array([134, 163, 97, 109, 116, 205, 3, 79, 163, 102, 101, 101, 10, 162, 102, 118, 51, 162, 108, 118, 61, 163, 114, 99, 118, 196, 32, 145, 154, 160, 178, 192, 112, 147, 3, 73, 200, 52, 23, 24, 49, 180, 79, 91, 78, 35, 190, 125, 207, 231, 37, 41, 131, 96, 252, 244, 221, 54, 208, 163, 115, 110, 100, 196, 32, 145, 154, 160, 178, 192, 112, 147, 3, 73, 200, 52, 23, 24, 49, 180, 79, 91, 78, 35, 190, 125, 207, 231, 37, 41, 131, 96, 252, 244, 221, 54, 208]);
      const ad = 'SGNKBMWAOCJQGSOIGQLRQMNUJ5NU4I56PXH6OJJJQNQPZ5G5G3IOVLI5VM';
      const o = {
        snd: algosdk.decodeAddress(ad).publicKey,
        rcv: algosdk.decodeAddress(ad).publicKey,
        fee: 10,
        amt: 847,
        fv: 51,
        lv: 61,
      };

      const jsEnc = algosdk.encodeObj(o);
      assert.deepStrictEqual(jsEnc, golden);
    });
  });

  describe('uint64', () => {
    it('should encode properly', () => {
      const testcases = [
        [0, Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0])],
        [0n, Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0])],
        [1, Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1])],
        [1n, Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1])],
        [255, Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255])],
        [255n, Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255])],
        [256, Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0])],
        [256n, Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0])],
        [
          Number.MAX_SAFE_INTEGER,
          Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]),
        ],
        [
          BigInt(Number.MAX_SAFE_INTEGER),
          Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]),
        ],
        [
          BigInt(Number.MAX_SAFE_INTEGER) + 1n,
          Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0]),
        ],
        [
          0xffffffffffffffffn,
          Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255]),
        ],
      ];

      for (const [input, expected] of testcases) {
        const actual = algosdk.encodeUint64(input);
        assert.deepStrictEqual(
          actual,
          expected,
          `Incorrect encoding of ${typeof input} ${input}`
        );
      }
    });

    it('should not encode negative numbers', () => {
      assert.throws(() => algosdk.encodeUint64(-1));
      assert.throws(() => algosdk.encodeUint64(-1n));
      assert.throws(() => algosdk.encodeUint64(Number.MIN_SAFE_INTEGER));
      assert.throws(() =>
        algosdk.encodeUint64(BigInt(Number.MIN_SAFE_INTEGER))
      );
    });

    it('should not encode numbers larger than 2^64', () => {
      assert.throws(() => algosdk.encodeUint64(0xffffffffffffffffn + 1n));
    });

    it('should not encode decimals', () => {
      assert.throws(() => algosdk.encodeUint64(0.01));
      assert.throws(() => algosdk.encodeUint64(9999.99));
    });

    it('should decode properly in default mode', () => {
      // should be the same as safe mode
      const testcases = [
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]), 0],
        [Uint8Array.from([0]), 0],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1]), 1],
        [Uint8Array.from([0, 0, 1]), 1],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255]), 255],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0]), 256],
        [
          Uint8Array.from([31, 255, 255, 255, 255, 255, 255]),
          Number.MAX_SAFE_INTEGER,
        ],
        [
          Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]),
          Number.MAX_SAFE_INTEGER,
        ],
      ];

      for (const [input, expected] of testcases) {
        const actual = algosdk.decodeUint64(input);
        assert.deepStrictEqual(
          actual,
          expected,
          `Incorrect decoding of ${Array.from(input)}`
        );
      }
    });

    it('should throw an error when decoding large values in default mode', () => {
      assert.throws(() =>
        algosdk.decodeUint64(Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0]))
      );
      assert.throws(() =>
        algosdk.decodeUint64(Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 1]))
      );
      assert.throws(() =>
        algosdk.decodeUint64(
          Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255])
        )
      );
    });

    it('should decode properly in safe mode', () => {
      const testcases = [
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]), 0],
        [Uint8Array.from([0]), 0],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1]), 1],
        [Uint8Array.from([0, 0, 1]), 1],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255]), 255],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0]), 256],
        [
          Uint8Array.from([31, 255, 255, 255, 255, 255, 255]),
          Number.MAX_SAFE_INTEGER,
        ],
        [
          Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]),
          Number.MAX_SAFE_INTEGER,
        ],
      ];

      for (const [input, expected] of testcases) {
        const actual = algosdk.decodeUint64(input, 'safe');
        assert.deepStrictEqual(
          actual,
          expected,
          `Incorrect decoding of ${Array.from(input)}`
        );
      }
    });

    it('should throw an error when decoding large values in safe mode', () => {
      assert.throws(() =>
        algosdk.decodeUint64(Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0]), 'safe')
      );
      assert.throws(() =>
        algosdk.decodeUint64(Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 1]), 'safe')
      );
      assert.throws(() =>
        algosdk.decodeUint64(
          Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255]),
          'safe'
        )
      );
    });

    it('should decode properly in mixed mode', () => {
      const testcases = [
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]), 0],
        [Uint8Array.from([0]), 0],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1]), 1],
        [Uint8Array.from([0, 0, 1]), 1],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255]), 255],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0]), 256],
        [
          Uint8Array.from([31, 255, 255, 255, 255, 255, 255]),
          Number.MAX_SAFE_INTEGER,
        ],
        [
          Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]),
          Number.MAX_SAFE_INTEGER,
        ],
        [
          Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0]),
          BigInt(Number.MAX_SAFE_INTEGER) + 1n,
        ],
        [
          Uint8Array.from([32, 0, 0, 0, 0, 0, 0]),
          BigInt(Number.MAX_SAFE_INTEGER) + 1n,
        ],
        [
          Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255]),
          0xffffffffffffffffn,
        ],
      ];

      for (const [input, expected] of testcases) {
        const actual = algosdk.decodeUint64(input, 'mixed');
        assert.deepStrictEqual(
          actual,
          expected,
          `Incorrect decoding of ${Array.from(input)}`
        );
      }
    });

    it('should decode properly in bigint mode', () => {
      const testcases = [
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]), 0n],
        [Uint8Array.from([0]), 0n],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1]), 1n],
        [Uint8Array.from([0, 0, 1]), 1n],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255]), 255n],
        [Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0]), 256n],
        [
          Uint8Array.from([31, 255, 255, 255, 255, 255, 255]),
          BigInt(Number.MAX_SAFE_INTEGER),
        ],
        [
          Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]),
          BigInt(Number.MAX_SAFE_INTEGER),
        ],
        [
          Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0]),
          BigInt(Number.MAX_SAFE_INTEGER) + 1n,
        ],
        [
          Uint8Array.from([32, 0, 0, 0, 0, 0, 0]),
          BigInt(Number.MAX_SAFE_INTEGER) + 1n,
        ],
        [
          Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255]),
          0xffffffffffffffffn,
        ],
      ];

      for (const [input, expected] of testcases) {
        const actual = algosdk.decodeUint64(input, 'bigint');
        assert.deepStrictEqual(
          actual,
          expected,
          `Incorrect decoding of ${Array.from(input)}`
        );
      }
    });

    it('should throw an error when decoding data with wrong length', () => {
      assert.throws(() => algosdk.decodeUint64(Uint8Array.from([])));
      assert.throws(() =>
        algosdk.decodeUint64(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0]))
      );
    });

    it('should throw an error when decoding with an unknown mode', () => {
      assert.throws(() =>
        algosdk.decodeUint64(
          Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]),
          'unknown'
        )
      );
    });
  });

  describe('JSON parse BigInt', () => {
    it('should parse null', () => {
      const input = 'null';

      for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
        const actual = utils.parseJSON(input, { intDecoding });
        const expected = null;

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse number', () => {
      const inputs = ['17', '9007199254740991'];
      for (const input of inputs) {
        for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
          const actual = utils.parseJSON(input, { intDecoding });
          const expected =
            intDecoding === 'bigint' ? BigInt(input) : Number(input);
          assert.deepStrictEqual(
            actual,
            expected,
            `Error when intDecoding = ${intDecoding}`
          );
        }
      }
    });

    it('should parse empty object', () => {
      const input = '{}';

      for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
        const actual = utils.parseJSON(input, { intDecoding });
        const expected = {};

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse populated object', () => {
      const input = '{"a":1,"b":"value","c":[1,2,3],"d":null,"e":{},"f":true}';

      for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
        const actual = utils.parseJSON(input, { intDecoding });

        let expected;
        if (intDecoding === 'bigint') {
          expected = {
            a: 1n,
            b: 'value',
            c: [1n, 2n, 3n],
            d: null,
            e: {},
            f: true,
          };
        } else {
          expected = {
            a: 1,
            b: 'value',
            c: [1, 2, 3],
            d: null,
            e: {},
            f: true,
          };
        }

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse object with BigInt', () => {
      const input =
        '{"a":0,"b":9007199254740991,"c":9007199254740992,"d":9223372036854775807}';

      assert.throws(() => utils.parseJSON(input, { intDecoding: 'safe' }));

      for (const intDecoding of ['default', 'mixed', 'bigint']) {
        const actual = utils.parseJSON(input, { intDecoding });

        let expected;
        if (intDecoding === 'bigint') {
          expected = {
            a: 0n,
            b: 9007199254740991n,
            c: 9007199254740992n,
            d: 9223372036854775807n,
          };
        } else if (intDecoding === 'mixed') {
          expected = {
            a: 0,
            b: 9007199254740991,
            c: 9007199254740992n,
            d: 9223372036854775807n,
          };
        } else {
          expected = {
            a: 0,
            b: 9007199254740991,
            c: Number(9007199254740992n),
            d: Number(9223372036854775807n),
          };
        }

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse empty array', () => {
      const input = '[]';

      for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
        const actual = utils.parseJSON(input, { intDecoding });
        const expected = [];

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse populated array', () => {
      const input = '["test",2,null,[7],{"a":9.5},true]';

      for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
        const actual = utils.parseJSON(input, { intDecoding });

        let expected;
        if (intDecoding === 'bigint') {
          expected = ['test', 2n, null, [7n], { a: 9.5 }, true];
        } else {
          expected = ['test', 2, null, [7], { a: 9.5 }, true];
        }

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse array with BigInt', () => {
      const input = '[0,9007199254740991,9007199254740992,9223372036854775807]';

      assert.throws(() => utils.parseJSON(input, { intDecoding: 'safe' }));

      for (const intDecoding of ['default', 'mixed', 'bigint']) {
        const actual = utils.parseJSON(input, { intDecoding });

        let expected;
        if (intDecoding === 'bigint') {
          expected = [
            0n,
            9007199254740991n,
            9007199254740992n,
            9223372036854775807n,
          ];
        } else if (intDecoding === 'mixed') {
          expected = [
            0,
            9007199254740991,
            9007199254740992n,
            9223372036854775807n,
          ];
        } else {
          expected = [
            0,
            9007199254740991,
            Number(9007199254740992n),
            Number(9223372036854775807n),
          ];
        }

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );
      }
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
        const actualBytes = algosdk.base64ToBytes(expectedEncoding);
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
        const actualB64Decoding = algosdk.base64ToString(expectedEncoding);
        assert.deepStrictEqual(
          actualB64Decoding,
          testCase,
          `Incorrect encoding of ${testCase}; got ${actualB64Decoding}`
        );

        const byteArray = new TextEncoder().encode(testCase);
        const base64String = algosdk.bytesToBase64(byteArray);
        const roundTripString = new TextDecoder().decode(
          algosdk.base64ToBytes(base64String)
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
        const actualHexString = algosdk.bytesToHex(binString);
        assert.deepStrictEqual(
          actualHexString,
          expectedEncoding,
          `Incorrect encoding of ${testCase}; got ${actualHexString}`
        );
      }
    });
  });
});
