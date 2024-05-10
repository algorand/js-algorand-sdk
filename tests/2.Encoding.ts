/* eslint-env mocha */
import assert from 'assert';
import algosdk from '../src/index.js';
import * as utils from '../src/utils/utils.js';
import {
  Schema,
  MsgpackEncodingData,
  JSONEncodingData,
} from '../src/encoding/encoding.js';
import {
  BooleanSchema,
  StringSchema,
  Uint64Schema,
  AddressSchema,
  ByteArraySchema,
  FixedLengthByteArraySchema,
  ArraySchema,
  NamedMapSchema,
  UntypedSchema,
} from '../src/encoding/schema/index.js';

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
        (err: Error) => err.toString().includes(ERROR_CONTAINS_EMPTY_STRING)
      );

      const b = { a: 4, B: [] };
      assert.throws(
        () => {
          algosdk.encodeObj(b);
        },
        (err: Error) => err.toString().includes(ERROR_CONTAINS_EMPTY_STRING)
      );

      const c = { a: 4, B: 0 };
      assert.throws(
        () => {
          algosdk.encodeObj(c);
        },
        (err: Error) => err.toString().includes(ERROR_CONTAINS_EMPTY_STRING)
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
      const afterZero = algosdk.decodeObj(algosdk.encodeObj(beforeZero as any));
      // eslint-disable-next-line eqeqeq
      assert.ok(beforeZero == afterZero); // after is a Number because 0 fits into a Number - so we do this loose comparison
      const beforeLarge = BigInt('18446744073709551612'); // larger than a Number, but fits into a uint64
      const afterLarge = algosdk.decodeObj(
        algosdk.encodeObj(beforeLarge as any)
      );
      assert.strictEqual(beforeLarge, afterLarge);
      const tooLarge = BigInt('18446744073709551616'); // larger than even fits into a uint64. we do not want to work with these too-large numbers
      assert.throws(
        () => algosdk.encodeObj(tooLarge as any),
        /Bigint is too large for uint64: 18446744073709551616$/
      );
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
      const testcases: Array<[number | bigint, Uint8Array]> = [
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
      const testcases: Array<[Uint8Array, number | bigint]> = [
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
      const testcases: Array<[Uint8Array, number | bigint]> = [
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
      const testcases: Array<[Uint8Array, number | bigint]> = [
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
      const testcases: Array<[Uint8Array, bigint]> = [
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
          'unknown' as any
        )
      );
    });
  });

  describe('JSON BigInt', () => {
    it('should parse null', () => {
      const input = 'null';

      for (const intDecoding of [
        algosdk.IntDecoding.UNSAFE,
        algosdk.IntDecoding.SAFE,
        algosdk.IntDecoding.MIXED,
        algosdk.IntDecoding.BIGINT,
      ]) {
        const actual = utils.parseJSON(input, { intDecoding });
        const expected = null;

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );

        const roundtrip = utils.stringifyJSON(actual);
        assert.deepStrictEqual(
          roundtrip,
          input,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse number', () => {
      const inputs = ['17', '9007199254740991'];
      for (const input of inputs) {
        for (const intDecoding of [
          algosdk.IntDecoding.UNSAFE,
          algosdk.IntDecoding.SAFE,
          algosdk.IntDecoding.MIXED,
          algosdk.IntDecoding.BIGINT,
        ]) {
          const actual = utils.parseJSON(input, { intDecoding });
          const expected =
            intDecoding === algosdk.IntDecoding.BIGINT
              ? BigInt(input)
              : Number(input);
          assert.deepStrictEqual(
            actual,
            expected,
            `Error when intDecoding = ${intDecoding}`
          );

          const roundtrip = utils.stringifyJSON(actual);
          assert.deepStrictEqual(
            roundtrip,
            input,
            `Error when intDecoding = ${intDecoding}`
          );
        }
      }
    });

    it('should parse string', () => {
      const input =
        '"IRK7XSCO7LPIBQKIUJXTQ5I7XBP3362ACPME5SOUUIJXN77T44RG4FZSLI"';

      for (const intDecoding of [
        algosdk.IntDecoding.UNSAFE,
        algosdk.IntDecoding.SAFE,
        algosdk.IntDecoding.MIXED,
        algosdk.IntDecoding.BIGINT,
      ]) {
        const actual = utils.parseJSON(input, { intDecoding });

        assert.strictEqual(typeof actual, 'string');

        const expected =
          'IRK7XSCO7LPIBQKIUJXTQ5I7XBP3362ACPME5SOUUIJXN77T44RG4FZSLI';

        assert.strictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );

        const roundtrip = utils.stringifyJSON(actual);
        assert.deepStrictEqual(
          roundtrip,
          input,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse empty object', () => {
      const input = '{}';

      for (const intDecoding of [
        algosdk.IntDecoding.UNSAFE,
        algosdk.IntDecoding.SAFE,
        algosdk.IntDecoding.MIXED,
        algosdk.IntDecoding.BIGINT,
      ]) {
        const actual = utils.parseJSON(input, { intDecoding });
        const expected = {};

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );

        const roundtrip = utils.stringifyJSON(actual);
        assert.deepStrictEqual(
          roundtrip,
          input,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse populated object', () => {
      const input = '{"a":1,"b":"value","c":[1,2,3],"d":null,"e":{},"f":true}';

      for (const intDecoding of [
        algosdk.IntDecoding.UNSAFE,
        algosdk.IntDecoding.SAFE,
        algosdk.IntDecoding.MIXED,
        algosdk.IntDecoding.BIGINT,
      ]) {
        const actual = utils.parseJSON(input, { intDecoding });

        let expected;
        if (intDecoding === algosdk.IntDecoding.BIGINT) {
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

        const roundtrip = utils.stringifyJSON(actual);
        assert.deepStrictEqual(
          roundtrip,
          input,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse object with BigInt', () => {
      const input =
        '{"a":0,"b":9007199254740991,"c":9007199254740992,"d":9223372036854775807}';

      assert.throws(() =>
        utils.parseJSON(input, { intDecoding: algosdk.IntDecoding.SAFE })
      );

      for (const intDecoding of [
        algosdk.IntDecoding.UNSAFE,
        algosdk.IntDecoding.MIXED,
        algosdk.IntDecoding.BIGINT,
      ]) {
        const actual = utils.parseJSON(input, { intDecoding });

        let expected;
        if (intDecoding === algosdk.IntDecoding.BIGINT) {
          expected = {
            a: 0n,
            b: 9007199254740991n,
            c: 9007199254740992n,
            d: 9223372036854775807n,
          };
        } else if (intDecoding === algosdk.IntDecoding.MIXED) {
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

        if (intDecoding !== algosdk.IntDecoding.UNSAFE) {
          const roundtrip = utils.stringifyJSON(actual);
          assert.deepStrictEqual(
            roundtrip,
            input,
            `Error when intDecoding = ${intDecoding}`
          );
        }
      }
    });

    it('should parse empty array', () => {
      const input = '[]';

      for (const intDecoding of [
        algosdk.IntDecoding.UNSAFE,
        algosdk.IntDecoding.SAFE,
        algosdk.IntDecoding.MIXED,
        algosdk.IntDecoding.BIGINT,
      ]) {
        const actual = utils.parseJSON(input, { intDecoding });
        const expected: unknown[] = [];

        assert.deepStrictEqual(
          actual,
          expected,
          `Error when intDecoding = ${intDecoding}`
        );

        const roundtrip = utils.stringifyJSON(actual);
        assert.deepStrictEqual(
          roundtrip,
          input,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse populated array', () => {
      const input = '["test",2,null,[7],{"a":9.5},true]';

      for (const intDecoding of [
        algosdk.IntDecoding.UNSAFE,
        algosdk.IntDecoding.SAFE,
        algosdk.IntDecoding.MIXED,
        algosdk.IntDecoding.BIGINT,
      ]) {
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

        const roundtrip = utils.stringifyJSON(actual);
        assert.deepStrictEqual(
          roundtrip,
          input,
          `Error when intDecoding = ${intDecoding}`
        );
      }
    });

    it('should parse array with BigInt', () => {
      const input = '[0,9007199254740991,9007199254740992,9223372036854775807]';

      assert.throws(() =>
        utils.parseJSON(input, { intDecoding: algosdk.IntDecoding.SAFE })
      );

      for (const intDecoding of [
        algosdk.IntDecoding.UNSAFE,
        algosdk.IntDecoding.MIXED,
        algosdk.IntDecoding.BIGINT,
      ]) {
        const actual = utils.parseJSON(input, { intDecoding });

        let expected;
        if (intDecoding === algosdk.IntDecoding.BIGINT) {
          expected = [
            0n,
            9007199254740991n,
            9007199254740992n,
            9223372036854775807n,
          ];
        } else if (intDecoding === algosdk.IntDecoding.MIXED) {
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

        if (intDecoding !== algosdk.IntDecoding.UNSAFE) {
          const roundtrip = utils.stringifyJSON(actual);
          assert.deepStrictEqual(
            roundtrip,
            input,
            `Error when intDecoding = ${intDecoding}`
          );
        }
      }
    });

    it('should stringify with spacing', () => {
      const input = { a: 1, b: 'value', c: [1, 2, 3], d: null, e: {}, f: true };
      const actual = utils.stringifyJSON(input, undefined, 2);
      const expected = `{
  "a": 1,
  "b": "value",
  "c": [
    1,
    2,
    3
  ],
  "d": null,
  "e": {},
  "f": true
}`;
      assert.strictEqual(actual, expected);
    });
  });

  describe('Base64 decoding utilities', () => {
    it('should decode bytes from Base64', () => {
      const testCases: Array<[Uint8Array, string]> = [
        [
          Uint8Array.from([
            97, 32, 196, 128, 32, 240, 144, 128, 128, 32, 230, 150, 135, 32,
            240, 159, 166, 132,
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
        ['\uFFFD\uFFFD', '/v8='], // Non UTF-8 bytes should still decode to same (invalid) output
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
  describe('Schema', () => {
    describe('General', () => {
      interface SchemaTestCase {
        name: string;
        schema: Schema;
        values: unknown[];
        preparedMsgpackValues: MsgpackEncodingData[];
        // The expected output from calling `fromPreparedMsgpack`. If not provided, `values` will be used.
        expectedValuesFromPreparedMsgpack?: unknown[];
        preparedJsonValues: JSONEncodingData[];
        // The expected output from calling `fromPreparedJSON`. If not provided, `values` will be used.
        expectedValuesFromPreparedJson?: unknown[];
      }

      const testcases: SchemaTestCase[] = [
        {
          name: 'BooleanSchema',
          schema: new BooleanSchema(),
          values: [true, false],
          preparedMsgpackValues: [true, false],
          preparedJsonValues: [true, false],
        },
        {
          name: 'StringSchema',
          schema: new StringSchema(),
          values: ['', 'abc'],
          preparedMsgpackValues: ['', 'abc'],
          preparedJsonValues: ['', 'abc'],
        },
        {
          name: 'Uint64Schema',
          schema: new Uint64Schema(),
          values: [0, 1, 255, 256, 0xffffffffffffffffn],
          preparedMsgpackValues: [0n, 1n, 255n, 256n, 0xffffffffffffffffn],
          // fromPreparedMsgpack will convert numbers to bigints
          expectedValuesFromPreparedMsgpack: [
            0n,
            1n,
            255n,
            256n,
            0xffffffffffffffffn,
          ],
          preparedJsonValues: [0n, 1n, 255n, 256n, 0xffffffffffffffffn],
          // Roundtrip will convert numbers to bigints
          expectedValuesFromPreparedJson: [
            0n,
            1n,
            255n,
            256n,
            0xffffffffffffffffn,
          ],
        },
        {
          name: 'AddressSchema',
          schema: new AddressSchema(),
          values: [
            algosdk.Address.zeroAddress(),
            algosdk.Address.fromString(
              'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
            ),
          ],
          preparedMsgpackValues: [
            new Uint8Array(32),
            Uint8Array.from([
              99, 180, 127, 102, 156, 252, 55, 227, 39, 198, 169, 232, 163, 16,
              36, 130, 26, 223, 230, 213, 0, 153, 108, 192, 200, 197, 28, 77,
              196, 50, 141, 112,
            ]),
          ],
          preparedJsonValues: [
            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
            'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI',
          ],
        },
        {
          name: 'ByteArraySchema',
          schema: new ByteArraySchema(),
          values: [Uint8Array.from([]), Uint8Array.from([1, 2, 3])],
          preparedMsgpackValues: [
            Uint8Array.from([]),
            Uint8Array.from([1, 2, 3]),
          ],
          preparedJsonValues: ['', 'AQID'],
        },
        {
          name: 'FixedLengthByteArraySchema',
          schema: new FixedLengthByteArraySchema(5),
          values: [new Uint8Array(5), Uint8Array.from([1, 2, 3, 4, 5])],
          preparedMsgpackValues: [
            new Uint8Array(5),
            Uint8Array.from([1, 2, 3, 4, 5]),
          ],
          preparedJsonValues: ['AAAAAAA=', 'AQIDBAU='],
        },
        {
          name: 'UntypedSchema',
          schema: new UntypedSchema(),
          values: [undefined, null, 0, 'abc', new Map()],
          preparedMsgpackValues: [undefined, null, 0, 'abc', new Map()],
          preparedJsonValues: [undefined, null, 0, 'abc', {}],
        },
        {
          name: 'UntypedSchema, binary data', // Special case for Uint8Array
          schema: new UntypedSchema(),
          values: [new Uint8Array(), Uint8Array.from([1, 2, 3])],
          preparedMsgpackValues: [new Uint8Array(), Uint8Array.from([1, 2, 3])],
          preparedJsonValues: ['', 'AQID'],
          // Roundtrip will convert Uint8Array to base64 strings
          expectedValuesFromPreparedJson: ['', 'AQID'],
        },
      ];

      const primitiveTestcases = testcases.slice();

      // Add ArraySchema test cases
      for (const testcase of primitiveTestcases) {
        const arrayTestcase: SchemaTestCase = {
          name: `ArraySchema containing ${testcase.name}`,
          schema: new ArraySchema(testcase.schema),
          values: [[], ...testcase.values.map((v) => [v]), testcase.values],
          preparedMsgpackValues: [
            [],
            ...testcase.preparedMsgpackValues.map((v) => [v]),
            testcase.preparedMsgpackValues,
          ],
          expectedValuesFromPreparedMsgpack:
            testcase.expectedValuesFromPreparedMsgpack,
          preparedJsonValues: [
            [],
            ...testcase.preparedJsonValues.map((v) => [v]),
            testcase.preparedJsonValues,
          ],
        };

        if (testcase.expectedValuesFromPreparedMsgpack) {
          arrayTestcase.expectedValuesFromPreparedMsgpack = [
            [],
            ...testcase.expectedValuesFromPreparedMsgpack.map((v) => [v]),
            testcase.expectedValuesFromPreparedMsgpack,
          ];
        }

        if (testcase.expectedValuesFromPreparedJson) {
          arrayTestcase.expectedValuesFromPreparedJson = [
            [],
            ...testcase.expectedValuesFromPreparedJson.map((v) => [v]),
            testcase.expectedValuesFromPreparedJson,
          ];
        }

        testcases.push(arrayTestcase);
      }

      const primitiveAndArrayTestcases = testcases.slice();

      // Add NamedMapSchema test cases
      for (const testcase of primitiveAndArrayTestcases) {
        const mapTestcase: SchemaTestCase = {
          name: `NamedMapSchema containing ${testcase.name}`,
          schema: new NamedMapSchema([
            {
              key: 'key',
              valueSchema: testcase.schema,
              // Testing with required=true and omitEmpty=false for simplicity
              required: true,
              omitEmpty: false,
            },
          ]),
          values: testcase.values.map((v) => new Map([['key', v]])),
          preparedMsgpackValues: testcase.preparedMsgpackValues.map(
            (v) => new Map([['key', v]])
          ),
          preparedJsonValues: testcase.preparedJsonValues.map((v) => ({
            key: v,
          })),
        };

        if (testcase.expectedValuesFromPreparedMsgpack) {
          mapTestcase.expectedValuesFromPreparedMsgpack =
            testcase.expectedValuesFromPreparedMsgpack.map(
              (v) => new Map([['key', v]])
            );
        }

        if (testcase.expectedValuesFromPreparedJson) {
          mapTestcase.expectedValuesFromPreparedJson =
            testcase.expectedValuesFromPreparedJson.map(
              (v) => new Map([['key', v]])
            );
        }

        testcases.push(mapTestcase);
      }

      for (const testcase of testcases) {
        it(`should correctly prepare values for encoding and decoding with schema ${testcase.name}`, () => {
          for (let i = 0; i < testcase.values.length; i++) {
            const value = testcase.values[i];
            const preparedMsgpackValue = testcase.preparedMsgpackValues[i];
            const preparedJsonValue = testcase.preparedJsonValues[i];

            const actualMsgpack = testcase.schema.prepareMsgpack(value);
            assert.deepStrictEqual(actualMsgpack, preparedMsgpackValue);

            const roundtripMsgpackValue =
              testcase.schema.fromPreparedMsgpack(actualMsgpack);
            const roundtripMsgpackExpectedValue =
              testcase.expectedValuesFromPreparedMsgpack
                ? testcase.expectedValuesFromPreparedMsgpack[i]
                : value;
            assert.deepStrictEqual(
              roundtripMsgpackValue,
              roundtripMsgpackExpectedValue
            );

            const actualJson = testcase.schema.prepareJSON(value);
            assert.deepStrictEqual(actualJson, preparedJsonValue);

            const roundtripJsonValue =
              testcase.schema.fromPreparedJSON(actualJson);
            const roundtripJsonExpectedValue =
              testcase.expectedValuesFromPreparedJson
                ? testcase.expectedValuesFromPreparedJson[i]
                : value;
            assert.deepStrictEqual(
              roundtripJsonValue,
              roundtripJsonExpectedValue
            );
          }
        });
      }
    });
    describe('NamedMapSchema', () => {
      it('correctly handles omitEmpty', () => {
        const testValues: Array<{
          schema: Schema;
          emptyValue: unknown;
          nonemptyValue: unknown;
        }> = [
          {
            schema: new BooleanSchema(),
            emptyValue: false,
            nonemptyValue: true,
          },
          {
            schema: new Uint64Schema(),
            emptyValue: 0n,
            nonemptyValue: 1n,
          },
          {
            schema: new StringSchema(),
            emptyValue: '',
            nonemptyValue: 'abc',
          },
          {
            schema: new AddressSchema(),
            emptyValue: algosdk.Address.zeroAddress(),
            nonemptyValue: algosdk.Address.fromString(
              'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
            ),
          },
          {
            schema: new ByteArraySchema(),
            emptyValue: Uint8Array.from([]),
            nonemptyValue: Uint8Array.from([1, 2, 3]),
          },
          {
            schema: new FixedLengthByteArraySchema(5),
            emptyValue: new Uint8Array(5),
            nonemptyValue: Uint8Array.from([1, 2, 3, 4, 5]),
          },
          {
            schema: new UntypedSchema(),
            emptyValue: undefined,
            nonemptyValue: 0,
          },
          {
            schema: new ArraySchema(new BooleanSchema()),
            emptyValue: [],
            nonemptyValue: [false],
          },
          {
            schema: new NamedMapSchema([
              {
                key: 'key',
                valueSchema: new BooleanSchema(),
                omitEmpty: false,
                required: false,
              },
            ]),
            emptyValue: new Map(),
            nonemptyValue: new Map([['key', false]]),
          },
          {
            schema: new NamedMapSchema([
              {
                key: 'key',
                valueSchema: new BooleanSchema(),
                omitEmpty: true,
                required: true,
              },
            ]),
            emptyValue: new Map([['key', false]]),
            nonemptyValue: new Map([['key', true]]),
          },
        ];

        const schema = new NamedMapSchema(
          testValues.map((testValue, index) => ({
            key: index.toString(),
            valueSchema: testValue.schema,
            required: true,
            omitEmpty: true,
          }))
        );

        const allEmptyValues = new Map(
          testValues.map((testValue, index) => [
            index.toString(),
            testValue.emptyValue,
          ])
        );

        let prepareMsgpackResult = schema.prepareMsgpack(allEmptyValues);
        // All empty values should be omitted
        assert.deepStrictEqual(prepareMsgpackResult, new Map());
        let fromPreparedMsgpackResult =
          schema.fromPreparedMsgpack(prepareMsgpackResult);
        // Omitted values should be restored with their default/empty values
        assert.deepStrictEqual(fromPreparedMsgpackResult, allEmptyValues);

        let prepareJsonResult = schema.prepareJSON(allEmptyValues);
        // All empty values should be omitted
        assert.deepStrictEqual(prepareJsonResult, {});
        let fromPreparedJsonResult = schema.fromPreparedJSON(prepareJsonResult);
        // Omitted values should be restored with their default/empty values
        assert.deepStrictEqual(fromPreparedJsonResult, allEmptyValues);

        const allNonemptyValues = new Map(
          testValues.map((testValue, index) => [
            index.toString(),
            testValue.nonemptyValue,
          ])
        );

        prepareMsgpackResult = schema.prepareMsgpack(allNonemptyValues);
        assert.ok(prepareMsgpackResult instanceof Map);
        // All values are present
        assert.strictEqual(prepareMsgpackResult.size, testValues.length);
        fromPreparedMsgpackResult =
          schema.fromPreparedMsgpack(prepareMsgpackResult);
        // Values are restored properly
        assert.deepStrictEqual(fromPreparedMsgpackResult, allNonemptyValues);

        prepareJsonResult = schema.prepareJSON(allNonemptyValues);
        // All values are present
        assert.strictEqual(
          Object.keys(prepareJsonResult as object).length,
          testValues.length
        );
        fromPreparedJsonResult = schema.fromPreparedJSON(prepareJsonResult);
        // Omitted values should be restored with their default/empty values
        assert.deepStrictEqual(fromPreparedJsonResult, allNonemptyValues);
      });
    });
  });
});
