/* eslint-env mocha */
import assert from 'assert';
import { RawBinaryString } from 'algorand-msgpack';
import algosdk, { bytesToString, coerceToBytes } from '../src/index.js';
import * as utils from '../src/utils/utils.js';
import { Schema, MsgpackRawStringProvider } from '../src/encoding/encoding.js';
import {
  BooleanSchema,
  StringSchema,
  Uint64Schema,
  AddressSchema,
  ByteArraySchema,
  FixedLengthByteArraySchema,
  BlockHashSchema,
  SpecialCaseBinaryStringSchema,
  ArraySchema,
  NamedMapSchema,
  NamedMapEntry,
  Uint64MapSchema,
  StringMapSchema,
  ByteArrayMapSchema,
  SpecialCaseBinaryStringMapSchema,
  UntypedSchema,
  OptionalSchema,
  allOmitEmpty,
} from '../src/encoding/schema/index.js';

const ERROR_CONTAINS_EMPTY_STRING =
  'The object contains empty or 0 values. First empty or 0 value encountered during encoding: ';

describe('encoding', () => {
  class ExampleEncodable implements algosdk.Encodable {
    static readonly encodingSchema = new NamedMapSchema(
      allOmitEmpty([
        { key: 'a', valueSchema: new Uint64Schema() },
        { key: 'b', valueSchema: new StringSchema() },
        { key: 'c', valueSchema: new ByteArraySchema() },
      ])
    );

    // eslint-disable-next-line no-useless-constructor
    constructor(
      public a: number | bigint,
      public b: string,
      public c: Uint8Array
      // eslint-disable-next-line no-empty-function
    ) {}

    // eslint-disable-next-line class-methods-use-this
    getEncodingSchema(): Schema {
      return ExampleEncodable.encodingSchema;
    }

    toEncodingData(): Map<string, unknown> {
      return new Map<string, unknown>([
        ['a', this.a],
        ['b', this.b],
        ['c', this.c],
      ]);
    }

    static fromEncodingData(data: unknown): ExampleEncodable {
      if (!(data instanceof Map)) {
        throw new Error(`Invalid decoded SignedTransaction: ${data}`);
      }
      return new ExampleEncodable(data.get('a'), data.get('b'), data.get('c'));
    }
  }
  describe('msgpack', () => {
    it('should encode properly', () => {
      const input = new ExampleEncodable(
        123,
        'test',
        Uint8Array.from([255, 255, 0])
      );
      const actual = algosdk.encodeMsgpack(input);
      const expected = Uint8Array.from([
        131, 161, 97, 123, 161, 98, 164, 116, 101, 115, 116, 161, 99, 196, 3,
        255, 255, 0,
      ]);
      assert.deepStrictEqual(actual, expected);
    });
    it('should encode properly with default values', () => {
      const input = new ExampleEncodable(0, '', Uint8Array.from([]));
      const actual = algosdk.encodeMsgpack(input);
      const expected = Uint8Array.from([128]);
      assert.deepStrictEqual(actual, expected);
    });
    it('should decode properly', () => {
      const input = Uint8Array.from([
        131, 161, 97, 123, 161, 98, 164, 116, 101, 115, 116, 161, 99, 196, 3,
        255, 255, 0,
      ]);
      const actual = algosdk.decodeMsgpack(input, ExampleEncodable);
      const expected = new ExampleEncodable(
        BigInt(123),
        'test',
        Uint8Array.from([255, 255, 0])
      );
      assert.deepStrictEqual(actual, expected);
    });
    it('should decode properly with default values', () => {
      const input = Uint8Array.from([128]);
      const actual = algosdk.decodeMsgpack(input, ExampleEncodable);
      const expected = new ExampleEncodable(BigInt(0), '', Uint8Array.from([]));
      assert.deepStrictEqual(actual, expected);
    });
  });
  describe('JSON', () => {
    it('should encode properly', () => {
      const input = new ExampleEncodable(
        123,
        'test',
        Uint8Array.from([255, 255, 0])
      );
      const actual = algosdk.encodeJSON(input);
      const expected = { a: 123, b: 'test', c: '//8A' };
      // Compare parsed JSON because field order and whitespace may be different
      assert.deepStrictEqual(JSON.parse(actual), expected);
    });
    it('should encode properly with default values', () => {
      const input = new ExampleEncodable(0, '', Uint8Array.from([]));
      const actual = algosdk.encodeJSON(input);
      const expected = '{}';
      assert.deepStrictEqual(actual, expected);
    });
    it('should decode properly', () => {
      const input = `{ "a": 123, "b": "test", "c": "//8A" }`;
      const actual = algosdk.decodeJSON(input, ExampleEncodable);
      const expected = new ExampleEncodable(
        BigInt(123),
        'test',
        Uint8Array.from([255, 255, 0])
      );
      assert.deepStrictEqual(actual, expected);
    });
    it('should decode properly with default values', () => {
      const input = '{}';
      const actual = algosdk.decodeJSON(input, ExampleEncodable);
      const expected = new ExampleEncodable(BigInt(0), '', Uint8Array.from([]));
      assert.deepStrictEqual(actual, expected);
    });
  });
  describe('Transaction', () => {
    it('should be able to encode & decode', () => {
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: '7RQYTPAKBR6R7KR3AN36IW2CSMXTYDO2IIV6USDC24GQXDEC75DVHKZC54',
        amount: 17,
        receiver: 'VE7563YROD74TOKPJCBNM6CPRLGYPKPS6WOUC5GC675YONMCH7MLGALOFM',
        suggestedParams: {
          fee: 0,
          firstValid: 111,
          lastValid: 222,
          minFee: 1000,
          genesisID: 'testing',
          genesisHash: algosdk.base64ToBytes(
            'O4JSEmM8Qn+5phJf2fQPhsLo0PuIpBvHOqCDNCvwmzI='
          ),
        },
      });
      const encoded = algosdk.encodeMsgpack(txn); // Uint8Array of msgpack-encoded transaction
      const decoded = algosdk.decodeMsgpack(encoded, algosdk.Transaction); // Decoded Transaction instance
      assert.deepStrictEqual(txn, decoded);
    });
  });
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
        const actualB64Decoding = algosdk.bytesToString(
          algosdk.base64ToBytes(expectedEncoding)
        );
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
        preparedMsgpackValues: algosdk.MsgpackEncodingData[];
        // The expected output from calling `fromPreparedMsgpack`. If not provided, `values` will be used.
        expectedValuesFromPreparedMsgpack?: unknown[];
        preparedJsonValues: algosdk.JSONEncodingData[];
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
          name: 'SpecialCaseBinaryStringSchema',
          schema: new SpecialCaseBinaryStringSchema(),
          values: [Uint8Array.from([]), Uint8Array.from([97, 98, 99])],
          preparedMsgpackValues: [
            // Cast is needed because RawBinaryString is not part of the standard MsgpackEncodingData
            new RawBinaryString(
              Uint8Array.from([])
            ) as unknown as algosdk.MsgpackEncodingData,
            new RawBinaryString(
              Uint8Array.from([97, 98, 99])
            ) as unknown as algosdk.MsgpackEncodingData,
          ],
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
          name: 'BlockHashSchema',
          schema: new BlockHashSchema(),
          values: [
            new Uint8Array(32),
            Uint8Array.from([
              236, 203, 188, 96, 194, 35, 246, 94, 227, 223, 92, 185, 6, 143,
              198, 118, 147, 181, 197, 211, 218, 113, 81, 36, 52, 88, 237, 1,
              109, 72, 120, 38,
            ]),
          ],
          preparedMsgpackValues: [
            new Uint8Array(32),
            Uint8Array.from([
              236, 203, 188, 96, 194, 35, 246, 94, 227, 223, 92, 185, 6, 143,
              198, 118, 147, 181, 197, 211, 218, 113, 81, 36, 52, 88, 237, 1,
              109, 72, 120, 38,
            ]),
          ],
          preparedJsonValues: [
            'blk-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            'blk-5TF3YYGCEP3F5Y67LS4QND6GO2J3LROT3JYVCJBULDWQC3KIPATA',
          ],
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
        {
          name: 'OptionalSchema of BooleanSchema',
          schema: new OptionalSchema(new BooleanSchema()),
          values: [undefined, true, false],
          preparedMsgpackValues: [undefined, true, false],
          preparedJsonValues: [null, true, false],
        },
        {
          name: 'Uint64MapSchema of BooleanSchema',
          schema: new Uint64MapSchema(new BooleanSchema()),
          values: [
            new Map(),
            new Map([
              [0n, true],
              [1n, false],
              [2n, true],
              [BigInt('18446744073709551615'), true],
            ]),
          ],
          preparedMsgpackValues: [
            new Map(),
            new Map([
              [0n, true],
              [1n, false],
              [2n, true],
              [BigInt('18446744073709551615'), true],
            ]),
          ],
          preparedJsonValues: [
            {},
            {
              0: true,
              1: false,
              2: true,
              '18446744073709551615': true,
            },
          ],
        },
        {
          name: 'Uint64MapSchema of SpecialCaseBinaryStringSchema',
          schema: new Uint64MapSchema(new SpecialCaseBinaryStringSchema()),
          values: [
            new Map(),
            new Map([
              [0n, Uint8Array.from([])],
              [1n, Uint8Array.from([97])],
              [2n, Uint8Array.from([98])],
              [BigInt('18446744073709551615'), Uint8Array.from([99])],
            ]),
          ],
          preparedMsgpackValues: [
            new Map(),
            new Map([
              [0n, new RawBinaryString(Uint8Array.from([]))],
              [1n, new RawBinaryString(Uint8Array.from([97]))],
              [2n, new RawBinaryString(Uint8Array.from([98]))],
              [
                BigInt('18446744073709551615'),
                new RawBinaryString(Uint8Array.from([99])),
              ],
            ]),
          ],
          preparedJsonValues: [
            {},
            {
              0: '',
              1: 'a',
              2: 'b',
              '18446744073709551615': 'c',
            },
          ],
        },
        {
          name: 'StringMapSchema of BooleanSchema',
          schema: new StringMapSchema(new BooleanSchema()),
          values: [
            new Map(),
            new Map([
              ['a', true],
              ['b', false],
              ['c', true],
              ['', true],
            ]),
          ],
          preparedMsgpackValues: [
            new Map(),
            new Map([
              ['a', true],
              ['b', false],
              ['c', true],
              ['', true],
            ]),
          ],
          preparedJsonValues: [
            {},
            {
              a: true,
              b: false,
              c: true,
              '': true,
            },
          ],
        },
        {
          name: 'ByteArrayMapSchema of BooleanSchema',
          schema: new ByteArrayMapSchema(new BooleanSchema()),
          values: [
            new Map(),
            new Map([
              [Uint8Array.from([]), true],
              [Uint8Array.from([0]), false],
              [Uint8Array.from([1]), true],
              [Uint8Array.from([2, 3, 4, 5]), true],
            ]),
          ],
          preparedMsgpackValues: [
            new Map(),
            new Map([
              [Uint8Array.from([]), true],
              [Uint8Array.from([0]), false],
              [Uint8Array.from([1]), true],
              [Uint8Array.from([2, 3, 4, 5]), true],
            ]),
          ],
          preparedJsonValues: [
            {},
            {
              '': true,
              'AA==': false,
              'AQ==': true,
              'AgMEBQ==': true,
            },
          ],
        },
        {
          name: 'ByteArrayMapSchema of SpecialCaseBinaryStringSchema',
          schema: new ByteArrayMapSchema(new SpecialCaseBinaryStringSchema()),
          values: [
            new Map(),
            new Map([
              [Uint8Array.from([]), Uint8Array.from([])],
              [Uint8Array.from([0]), Uint8Array.from([97])],
              [Uint8Array.from([1]), Uint8Array.from([98])],
              [Uint8Array.from([2, 3, 4, 5]), Uint8Array.from([99])],
            ]),
          ],
          preparedMsgpackValues: [
            new Map(),
            new Map([
              [Uint8Array.from([]), new RawBinaryString(Uint8Array.from([]))],
              [
                Uint8Array.from([0]),
                new RawBinaryString(Uint8Array.from([97])),
              ],
              [
                Uint8Array.from([1]),
                new RawBinaryString(Uint8Array.from([98])),
              ],
              [
                Uint8Array.from([2, 3, 4, 5]),
                new RawBinaryString(Uint8Array.from([99])),
              ],
            ]),
          ],
          preparedJsonValues: [
            {},
            {
              '': '',
              'AA==': 'a',
              'AQ==': 'b',
              'AgMEBQ==': 'c',
            },
          ],
        },
        {
          name: 'SpecialCaseBinaryStringMapSchema of BooleanSchema',
          schema: new SpecialCaseBinaryStringMapSchema(new BooleanSchema()),
          values: [
            new Map(),
            new Map([
              [Uint8Array.from([97]), true],
              [Uint8Array.from([98]), false],
              [Uint8Array.from([99]), true],
              [Uint8Array.from([]), true],
            ]),
          ],
          preparedMsgpackValues: [
            new Map(),
            new Map([
              [new RawBinaryString(Uint8Array.from([97])), true],
              [new RawBinaryString(Uint8Array.from([98])), false],
              [new RawBinaryString(Uint8Array.from([99])), true],
              [new RawBinaryString(Uint8Array.from([])), true],
            ]),
          ],
          preparedJsonValues: [
            {},
            {
              a: true,
              b: false,
              c: true,
              '': true,
            },
          ],
        },
        {
          name: 'SpecialCaseBinaryStringMapSchema of SpecialCaseBinaryStringSchema',
          schema: new SpecialCaseBinaryStringMapSchema(
            new SpecialCaseBinaryStringSchema()
          ),
          values: [
            new Map(),
            new Map([
              [Uint8Array.from([97]), Uint8Array.from([120])],
              [Uint8Array.from([98]), Uint8Array.from([121])],
              [Uint8Array.from([99]), Uint8Array.from([122])],
              [Uint8Array.from([]), Uint8Array.from([])],
            ]),
          ],
          preparedMsgpackValues: [
            new Map(),
            new Map([
              [
                new RawBinaryString(Uint8Array.from([97])),
                new RawBinaryString(Uint8Array.from([120])),
              ],
              [
                new RawBinaryString(Uint8Array.from([98])),
                new RawBinaryString(Uint8Array.from([121])),
              ],
              [
                new RawBinaryString(Uint8Array.from([99])),
                new RawBinaryString(Uint8Array.from([122])),
              ],
              [
                new RawBinaryString(Uint8Array.from([])),
                new RawBinaryString(Uint8Array.from([])),
              ],
            ]),
          ],
          preparedJsonValues: [
            {},
            {
              a: 'x',
              b: 'y',
              c: 'z',
              '': '',
            },
          ],
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
              // Testing with omitEmpty=false for simplicity
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

            const msgpackBytes = algosdk.msgpackRawEncode(actualMsgpack);
            const rawStringProvider = new MsgpackRawStringProvider({
              baseObjectBytes: msgpackBytes,
            });

            const roundtripMsgpackValue = testcase.schema.fromPreparedMsgpack(
              actualMsgpack,
              rawStringProvider
            );
            const roundtripMsgpackExpectedValue =
              testcase.expectedValuesFromPreparedMsgpack
                ? testcase.expectedValuesFromPreparedMsgpack[i]
                : value;
            assert.deepStrictEqual(
              roundtripMsgpackValue,
              roundtripMsgpackExpectedValue
            );

            const actualJson = testcase.schema.prepareJSON(value, {});
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
          emptyValueRestored?: unknown;
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
            schema: new SpecialCaseBinaryStringSchema(),
            emptyValue: Uint8Array.from([]),
            nonemptyValue: Uint8Array.from([97, 98, 99]),
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
            schema: new BlockHashSchema(),
            emptyValue: new Uint8Array(32),
            nonemptyValue: Uint8Array.from([
              236, 203, 188, 96, 194, 35, 246, 94, 227, 223, 92, 185, 6, 143,
              198, 118, 147, 181, 197, 211, 218, 113, 81, 36, 52, 88, 237, 1,
              109, 72, 120, 38,
            ]),
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
                omitEmpty: true,
              },
            ]),
            emptyValue: new Map([['key', false]]),
            nonemptyValue: new Map([['key', true]]),
          },
          {
            schema: new NamedMapSchema([
              {
                key: 'key',
                valueSchema: new OptionalSchema(new BooleanSchema()),
                omitEmpty: true,
              },
            ]),
            emptyValue: new Map([['key', undefined]]),
            nonemptyValue: new Map([['key', true]]),
          },
          {
            schema: new NamedMapSchema([
              {
                key: 'key',
                valueSchema: new OptionalSchema(new BooleanSchema()),
                omitEmpty: true,
              },
            ]),
            // Same case as previous, expect testing that 'false' is also an empty value for the key
            emptyValue: new Map([['key', false]]),
            // false gets restored as undefined
            emptyValueRestored: new Map([['key', undefined]]),
            nonemptyValue: new Map([['key', true]]),
          },
          {
            schema: new Uint64MapSchema(new BooleanSchema()),
            emptyValue: new Map(),
            nonemptyValue: new Map([
              [0n, true],
              [1n, false],
              [2n, true],
              [BigInt('18446744073709551615'), true],
            ]),
          },
          {
            schema: new StringMapSchema(new BooleanSchema()),
            emptyValue: new Map(),
            nonemptyValue: new Map([
              ['a', true],
              ['b', false],
              ['c', true],
              ['', true],
            ]),
          },
          {
            schema: new ByteArrayMapSchema(new BooleanSchema()),
            emptyValue: new Map(),
            nonemptyValue: new Map([
              [Uint8Array.from([]), true],
              [Uint8Array.from([0]), false],
              [Uint8Array.from([1]), true],
              [Uint8Array.from([2, 3, 4, 5]), true],
            ]),
          },
          {
            schema: new SpecialCaseBinaryStringMapSchema(new BooleanSchema()),
            emptyValue: new Map(),
            nonemptyValue: new Map([
              [Uint8Array.from([97]), true],
              [Uint8Array.from([98]), false],
              [Uint8Array.from([99]), true],
              [Uint8Array.from([]), true],
            ]),
          },
        ];

        for (const testValue of testValues.slice()) {
          testValues.push(
            {
              schema: new OptionalSchema(testValue.schema),
              emptyValue: undefined,
              nonemptyValue: testValue.nonemptyValue,
            },
            {
              schema: new OptionalSchema(testValue.schema),
              // Same case as previous, expect testing that the regular empty value is also an empty
              // value for the optional schema
              emptyValue: testValue.emptyValue,
              // The empty value gets restored as undefined
              emptyValueRestored: undefined,
              nonemptyValue: testValue.nonemptyValue,
            }
          );
        }

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
        const allEmptyValuesRestored = new Map(
          testValues.map((testValue, index) => [
            index.toString(),
            // Cannot just check if emptyValueRestored is not undefined, since undefined is a valid value
            Object.prototype.hasOwnProperty.call(
              testValue,
              'emptyValueRestored'
            )
              ? testValue.emptyValueRestored
              : testValue.emptyValue,
          ])
        );

        let prepareMsgpackResult = schema.prepareMsgpack(allEmptyValues);
        // All empty values should be omitted
        assert.deepStrictEqual(prepareMsgpackResult, new Map());
        let msgpackBytes = algosdk.msgpackRawEncode(prepareMsgpackResult);
        let rawStringProvider = new MsgpackRawStringProvider({
          baseObjectBytes: msgpackBytes,
        });
        let fromPreparedMsgpackResult = schema.fromPreparedMsgpack(
          prepareMsgpackResult,
          rawStringProvider
        );
        // Omitted values should be restored with their default/empty values
        assert.deepStrictEqual(
          fromPreparedMsgpackResult,
          allEmptyValuesRestored
        );

        let prepareJsonResult = schema.prepareJSON(allEmptyValues, {});
        // All empty values should be omitted
        assert.deepStrictEqual(prepareJsonResult, {});
        let fromPreparedJsonResult = schema.fromPreparedJSON(prepareJsonResult);
        // Omitted values should be restored with their default/empty values
        assert.deepStrictEqual(fromPreparedJsonResult, allEmptyValuesRestored);

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
        msgpackBytes = algosdk.msgpackRawEncode(prepareMsgpackResult);
        rawStringProvider = new MsgpackRawStringProvider({
          baseObjectBytes: msgpackBytes,
        });
        fromPreparedMsgpackResult = schema.fromPreparedMsgpack(
          prepareMsgpackResult,
          rawStringProvider
        );
        // Values are restored properly
        assert.deepStrictEqual(fromPreparedMsgpackResult, allNonemptyValues);

        prepareJsonResult = schema.prepareJSON(allNonemptyValues, {});
        // All values are present
        assert.strictEqual(
          Object.keys(prepareJsonResult as object).length,
          testValues.length
        );
        fromPreparedJsonResult = schema.fromPreparedJSON(prepareJsonResult);
        // Omitted values should be restored with their default/empty values
        assert.deepStrictEqual(fromPreparedJsonResult, allNonemptyValues);
      });

      it('ignores unknown keys', () => {
        const schema = new NamedMapSchema([
          {
            key: 'a',
            omitEmpty: true,
            valueSchema: new StringSchema(),
          },
          {
            key: 'b',
            omitEmpty: true,
            valueSchema: new StringSchema(),
          },
        ]);

        assert.deepStrictEqual(
          schema.prepareMsgpack(
            new Map([
              ['a', ''],
              ['b', ''],
              ['c', ''],
            ])
          ),
          new Map()
        );
        assert.deepStrictEqual(
          schema.prepareJSON(
            new Map([
              ['a', ''],
              ['b', ''],
              ['c', ''],
            ]),
            {}
          ),
          {}
        );

        assert.deepStrictEqual(
          schema.prepareMsgpack(
            new Map([
              ['a', '1'],
              ['b', '2'],
              ['c', '3'],
            ])
          ),
          new Map([
            ['a', '1'],
            ['b', '2'],
          ])
        );
        assert.deepStrictEqual(
          schema.prepareJSON(
            new Map([
              ['a', '1'],
              ['b', '2'],
              ['c', '3'],
            ]),
            {}
          ),
          {
            a: '1',
            b: '2',
          }
        );

        const mapSchemaOfMap = new NamedMapSchema([
          {
            key: 'map',
            omitEmpty: true,
            valueSchema: schema,
          },
        ]);

        assert.deepStrictEqual(
          mapSchemaOfMap.prepareMsgpack(
            new Map([
              [
                'map',
                new Map([
                  ['a', ''],
                  ['b', ''],
                  ['c', ''],
                ]),
              ],
            ])
          ),
          new Map()
        );
        assert.deepStrictEqual(
          mapSchemaOfMap.prepareJSON(
            new Map([
              [
                'map',
                new Map([
                  ['a', ''],
                  ['b', ''],
                  ['c', ''],
                ]),
              ],
            ]),
            {}
          ),
          {}
        );

        assert.deepStrictEqual(
          mapSchemaOfMap.prepareMsgpack(
            new Map([
              [
                'map',
                new Map([
                  ['a', '1'],
                  ['b', '2'],
                  ['c', '3'],
                ]),
              ],
            ])
          ),
          new Map([
            [
              'map',
              new Map([
                ['a', '1'],
                ['b', '2'],
              ]),
            ],
          ])
        );
        assert.deepStrictEqual(
          mapSchemaOfMap.prepareJSON(
            new Map([
              [
                'map',
                new Map([
                  ['a', '1'],
                  ['b', '2'],
                  ['c', '3'],
                ]),
              ],
            ]),
            {}
          ),
          {
            map: { a: '1', b: '2' },
          }
        );
      });

      it('correctly embeds other maps', () => {
        const bSchema = new NamedMapSchema([
          {
            key: 'b',
            omitEmpty: true,
            valueSchema: new Uint64Schema(),
          },
        ]);

        const abSchema = new NamedMapSchema([
          {
            key: 'a',
            omitEmpty: true,
            valueSchema: new StringSchema(),
          },
          {
            key: '',
            omitEmpty: true,
            valueSchema: bSchema,
            embedded: true,
          },
        ]);

        const emptySchema = new NamedMapSchema([]);

        const abcdSchema = new NamedMapSchema([
          {
            key: '',
            omitEmpty: true,
            valueSchema: abSchema,
            embedded: true,
          },
          {
            key: 'c',
            omitEmpty: true,
            valueSchema: new BooleanSchema(),
          },
          {
            key: 'd',
            omitEmpty: true,
            valueSchema: new ArraySchema(new StringSchema()),
          },
          {
            key: '',
            omitEmpty: true,
            valueSchema: emptySchema,
            embedded: true,
          },
        ]);

        const actualEntries = abcdSchema.getEntries();
        const expectedEntries: NamedMapEntry[] = [
          { key: 'a', omitEmpty: true, valueSchema: new StringSchema() },
          { key: 'b', omitEmpty: true, valueSchema: new Uint64Schema() },
          { key: 'c', omitEmpty: true, valueSchema: new BooleanSchema() },
          {
            key: 'd',
            omitEmpty: true,
            valueSchema: new ArraySchema(new StringSchema()),
          },
        ];
        assert.deepStrictEqual(actualEntries, expectedEntries);

        const acutalDefaultValue = abcdSchema.defaultValue();
        const expectedDefaultValue = new Map<string, unknown>([
          ['a', ''],
          ['b', BigInt(0)],
          ['c', false],
          ['d', []],
        ]);
        assert.deepStrictEqual(acutalDefaultValue, expectedDefaultValue);
      });

      it('correctly pushes new entries', () => {
        const schema = new NamedMapSchema([
          {
            key: 'a',
            omitEmpty: true,
            valueSchema: new StringSchema(),
          },
        ]);

        schema.pushEntries({
          key: 'b',
          omitEmpty: true,
          valueSchema: new Uint64Schema(),
        });

        const actualEntries = schema.getEntries();
        const expectedEntries: NamedMapEntry[] = [
          { key: 'a', omitEmpty: true, valueSchema: new StringSchema() },
          { key: 'b', omitEmpty: true, valueSchema: new Uint64Schema() },
        ];
        assert.deepStrictEqual(actualEntries, expectedEntries);

        assert.throws(
          () =>
            schema.pushEntries({
              key: 'a',
              omitEmpty: true,
              valueSchema: new StringSchema(),
            }),
          new Error('Duplicate key: a')
        );
      });

      it('errors on invalid constructor args', () => {
        assert.throws(
          () =>
            new NamedMapSchema([
              {
                key: 'a',
                omitEmpty: true,
                valueSchema: new StringSchema(),
              },
              {
                key: 'a',
                omitEmpty: true,
                valueSchema: new StringSchema(),
              },
            ]),
          new Error('Duplicate key: a')
        );

        assert.throws(
          () =>
            new NamedMapSchema([
              {
                key: 'a',
                omitEmpty: true,
                valueSchema: new StringSchema(),
              },
              {
                key: '',
                omitEmpty: true,
                valueSchema: new NamedMapSchema([
                  {
                    key: 'a',
                    omitEmpty: true,
                    valueSchema: new StringSchema(),
                  },
                ]),
                embedded: true,
              },
            ]),
          new Error('Duplicate key: a')
        );

        assert.throws(
          () =>
            new NamedMapSchema([
              {
                key: 'a',
                omitEmpty: true,
                valueSchema: new StringSchema(),
              },
              {
                key: 'x',
                omitEmpty: true,
                valueSchema: new NamedMapSchema([]),
                embedded: true,
              },
            ]),
          new Error('Embedded entries must have an empty key')
        );

        assert.throws(
          () =>
            new NamedMapSchema([
              {
                key: 'a',
                omitEmpty: true,
                valueSchema: new StringSchema(),
              },
              {
                key: '',
                omitEmpty: true,
                valueSchema: new StringSchema(),
                embedded: true,
              },
            ]),
          new Error('Embedded entry valueSchema must be a NamedMapSchema')
        );
      });
    });
    describe('lossyBinaryStringConversion', () => {
      const invalidUtf8String = Uint8Array.from([
        61, 180, 118, 220, 39, 166, 43, 68, 219, 116, 105, 84, 121, 46, 122,
        136, 233, 221, 15, 174, 247, 19, 50, 176, 184, 221, 66, 188, 171, 36,
        135, 121,
      ]);

      const invalidUtf8StringEncoded = bytesToString(invalidUtf8String);
      const invalidUtf8StringDecoded = coerceToBytes(invalidUtf8StringEncoded);

      it('should have lossy string conversion for invalid UTF-8 string', () => {
        assert.notStrictEqual(invalidUtf8String, invalidUtf8StringDecoded);
      });

      it('should lossily prepare invalid UTF-8 strings by default and when enabled', () => {
        const options = {
          lossyBinaryStringConversion: true,
        };

        const schema = new SpecialCaseBinaryStringSchema();
        const prepared = schema.prepareJSON(invalidUtf8String, options);
        assert.strictEqual(prepared, invalidUtf8StringEncoded);
        assert.deepStrictEqual(
          schema.fromPreparedJSON(prepared),
          invalidUtf8StringDecoded
        );

        const mapSchema = new SpecialCaseBinaryStringMapSchema(schema);
        const preparedMap = mapSchema.prepareJSON(
          new Map([[invalidUtf8String, invalidUtf8String]]),
          options
        );
        const expectedPreparedMap: Record<string, string> = {};
        expectedPreparedMap[invalidUtf8StringEncoded] =
          invalidUtf8StringEncoded;
        assert.deepStrictEqual(preparedMap, expectedPreparedMap);
        assert.deepStrictEqual(
          mapSchema.fromPreparedJSON(preparedMap),
          new Map([[invalidUtf8StringDecoded, invalidUtf8StringDecoded]])
        );
      });
      it('should error when preparing invalid UTF-8 strings when disabled and by default', () => {
        for (const options of [{}, { lossyBinaryStringConversion: false }]) {
          const schema = new SpecialCaseBinaryStringSchema();
          assert.throws(
            () => schema.prepareJSON(invalidUtf8String, options),
            /Invalid UTF-8 byte array encountered/
          );

          const mapSchema = new SpecialCaseBinaryStringMapSchema(schema);
          assert.throws(
            () =>
              mapSchema.prepareJSON(
                new Map([[Uint8Array.from([97]), invalidUtf8String]]),
                options
              ),
            /Invalid UTF-8 byte array encountered/
          );

          assert.throws(
            () =>
              mapSchema.prepareJSON(
                new Map([[invalidUtf8String, Uint8Array.from([97])]]),
                options
              ),
            /Invalid UTF-8 byte array encountered/
          );

          assert.throws(
            () =>
              mapSchema.prepareJSON(
                new Map([[invalidUtf8String, invalidUtf8String]]),
                options
              ),
            /Invalid UTF-8 byte array encountered/
          );
        }
      });
    });
    describe('MsgpackRawStringProvider', () => {
      it('correctly records paths and provides raw strings', () => {
        const baseObject = new Map<string, unknown>([
          ['a', new Map([['a1', 'abc']])],
          ['b', [new Map(), new Map([[BigInt(17), 'def']])]],
        ]);
        const baseProvider = new MsgpackRawStringProvider({
          baseObjectBytes: algosdk.msgpackRawEncode(baseObject),
        });
        assert.strictEqual(baseProvider.getPathString(), 'root');
        assert.throws(
          () => baseProvider.getRawStringAtCurrentLocation(),
          /Invalid type\. Expected RawBinaryString, got/
        );
        assert.deepStrictEqual(
          baseProvider.getRawStringKeysAndValuesAtCurrentLocation(),
          new Map<unknown, unknown>([
            [
              Uint8Array.from([97]),
              new Map([
                [
                  new RawBinaryString(Uint8Array.from([97, 49])),
                  new RawBinaryString(Uint8Array.from([97, 98, 99])),
                ],
              ]),
            ],
            [
              Uint8Array.from([98]),
              [
                new Map(),
                new Map([
                  [
                    BigInt(17),
                    new RawBinaryString(Uint8Array.from([100, 101, 102])),
                  ],
                ]),
              ],
            ],
          ])
        );

        // Test with both string and raw string form
        for (const firstKey of [
          'a',
          new RawBinaryString(Uint8Array.from([97])),
        ]) {
          const firstValueProvider = baseProvider.withMapValue(firstKey);
          assert.strictEqual(
            firstValueProvider.getPathString(),
            `root -> map key "${firstKey}" (${typeof firstKey})`
          );
          assert.throws(
            () => firstValueProvider.getRawStringAtCurrentLocation(),
            /Invalid type\. Expected RawBinaryString, got/
          );
          assert.deepStrictEqual(
            firstValueProvider.getRawStringKeysAndValuesAtCurrentLocation(),
            new Map([
              [
                Uint8Array.from([97, 49]),
                new RawBinaryString(Uint8Array.from([97, 98, 99])),
              ],
            ])
          );

          // Test with both string and raw string form
          for (const firstFirstKey of [
            'a1',
            new RawBinaryString(Uint8Array.from([97, 49])),
          ]) {
            const firstFirstValueProvider =
              firstValueProvider.withMapValue(firstFirstKey);
            assert.strictEqual(
              firstFirstValueProvider.getPathString(),
              `root -> map key "${firstKey}" (${typeof firstKey}) -> map key "${firstFirstKey}" (${typeof firstFirstKey})`
            );
            assert.deepStrictEqual(
              firstFirstValueProvider.getRawStringAtCurrentLocation(),
              Uint8Array.from([97, 98, 99])
            );
            assert.throws(
              () =>
                firstFirstValueProvider.getRawStringKeysAndValuesAtCurrentLocation(),
              /Invalid type\. Expected Map, got/
            );
          }
        }

        // Test with both string and raw string form
        for (const secondKey of [
          'b',
          new RawBinaryString(Uint8Array.from([98])),
        ]) {
          const secondValueProvider = baseProvider.withMapValue(secondKey);
          assert.strictEqual(
            secondValueProvider.getPathString(),
            `root -> map key "${secondKey}" (${typeof secondKey})`
          );
          assert.throws(
            () => secondValueProvider.getRawStringAtCurrentLocation(),
            /Invalid type\. Expected RawBinaryString, got/
          );
          assert.throws(
            () =>
              secondValueProvider.getRawStringKeysAndValuesAtCurrentLocation(),
            /Invalid type\. Expected Map, got/
          );

          const secondIndex0Provider = secondValueProvider.withArrayElement(0);
          assert.strictEqual(
            secondIndex0Provider.getPathString(),
            `root -> map key "${secondKey}" (${typeof secondKey}) -> array index 0 (number)`
          );
          assert.throws(
            () => secondIndex0Provider.getRawStringAtCurrentLocation(),
            /Invalid type\. Expected RawBinaryString, got/
          );
          assert.deepStrictEqual(
            secondIndex0Provider.getRawStringKeysAndValuesAtCurrentLocation(),
            new Map()
          );

          const secondIndex1Provider = secondValueProvider.withArrayElement(1);
          assert.strictEqual(
            secondIndex1Provider.getPathString(),
            `root -> map key "${secondKey}" (${typeof secondKey}) -> array index 1 (number)`
          );
          assert.throws(
            () => secondIndex1Provider.getRawStringAtCurrentLocation(),
            /Invalid type\. Expected RawBinaryString, got/
          );
          assert.throws(
            () =>
              secondIndex1Provider.getRawStringKeysAndValuesAtCurrentLocation(),
            /Invalid type for map key\. Expected RawBinaryString, got 17 \(bigint\)/
          );

          const secondIndex1FirstProvider = secondIndex1Provider.withMapValue(
            BigInt(17)
          );
          assert.strictEqual(
            secondIndex1FirstProvider.getPathString(),
            `root -> map key "${secondKey}" (${typeof secondKey}) -> array index 1 (number) -> map key "17" (bigint)`
          );
          assert.deepStrictEqual(
            secondIndex1FirstProvider.getRawStringAtCurrentLocation(),
            Uint8Array.from([100, 101, 102])
          );
          assert.throws(
            () =>
              secondIndex1FirstProvider.getRawStringKeysAndValuesAtCurrentLocation(),
            /Invalid type\. Expected Map, got/
          );
        }
      });
    });
  });
  describe('BlockResponse', () => {
    it('should decode block response correctly', () => {
      const encodedBlockResponse = algosdk.base64ToBytes(
        'gqVibG9ja94AEqJiac4AmJaAomZjzQPopGZlZXPEIAfay0ttntFBsXV2vUWa5kIdSG2j1O8iR8QJo5a4LqIho2dlbqd0ZXN0LXYxomdoxCBAkI9g4Zidj7KmD7u3TupPRyxIUOsvsCzO1IlIiDKoqKRwcmV2xCDwEylSD3iD5mcCkowyEagukv+yiXVP06RyaMykuKPaqaVwcm90b6ZmdXR1cmWjcHJwxCB/k/5DqCp+P1WW/80hkucvP2neluTb4OL7yjQQnAxn6aNybmRepnJ3Y2Fscs4AB6Ego3J3ZMQg//////////////////////////////////////////+kc2VlZMQgADr2hmA6p7J28mz5Xje3TrogRklc+wKrrknYFoSPXIqjc3B0gQCBoW7NAgCidGPNA+6idHPOZmyEZaN0eG7EILLaFZI8ZSO3lpCwDTjv6JdxgLRqnLkOCthaTJyfoaSipnR4bjI1NsQgyA7uIgAR0IxH57DVsL4snrEy5FdvuTtWPvyPiJfzZGSkdHhuc5GEomNhzwAAJGE4t9aGo2hnacOjc2lnxEAT74Xeryh/ZJtRxGqcKf8UueJmWXmHH9NuQYTIrJqzKI1kKsFHn7smLAwoa0hDSUeUGI5kvWZvM28ggFiOxykMo3R4boelY2xvc2XEIAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAo2ZlZc0D6KJmdlyibHbNBESjcmN2xCABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKNzbmTEIH+T/kOoKn4/VZb/zSGS5y8/ad6W5Nvg4vvKNBCcDGfppHR5cGWjcGF5pGNlcnSEpHByb3CDo2RpZ8Qgl8J9zpVrkwvOVTZlN3p6b0iKuUpWii4Z0ga04n/XeFGmZW5jZGlnxCCG+emw6b9UVPNwpFN+l3F4SDOSkIKxkgpWSiBi0O62q6VvcHJvcMQgf5P+Q6gqfj9Vlv/NIZLnLz9p3pbk2+Di+8o0EJwMZ+mjcm5kXqRzdGVwAqR2b3RlkYOkY3JlZIGicGbEUIcs4SBw5LBFVDrqyGzHbeuh/PsY5Fr/1oZ+DoPl+N8aAs2ZiEsuPoE/+6oNsiX6YJNFVSBQKaRQBWdPDndXc9w3jq6WR6cEEoi4rCAyyv8Io3NpZ4ahcMQgmOdtSatJuUOlf8qRypCU3uEm3AewgEq+xVOIhtmWUZejcDFzxEAbCsynu50W2/vt6HPCCTAf37rvW1RHk1Y8EnLvBrFIzxi6nZRPeoYdgr4D8yIEKB4Gc7BMFrQbzd1HGKxLKS8GonAyxCCaal9Yfd6VseKV5WCb5lFEeYo3J0X1uOxEspMS8z9uaKNwMnPEQGmZZYbLBiwlzCbu7pdhDl9jSsyWCKW5aM5u0jeSVJGdYzC5SwpVGXlasYN8yj0Z5DKqwweY0ATwg02PCK1xkw2icHPEQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAChc8RAD7PBhIk/Yl40TpUojfBQj79CHOXwpmAToXgmRWG2rkDvmIh4sUjAaXVHdFla1uBMqgLrOk1rEo12QUthenYrB6NzbmTEIH+T/kOoKn4/VZb/zSGS5y8/ad6W5Nvg4vvKNBCcDGfp'
      );
      const blockResponse = algosdk.decodeMsgpack(
        encodedBlockResponse,
        algosdk.modelsv2.BlockResponse
      );
      const expectedBlockResponse = new algosdk.modelsv2.BlockResponse({
        block: new algosdk.Block({
          header: new algosdk.BlockHeader({
            round: BigInt(94),
            branch: algosdk.base64ToBytes(
              '8BMpUg94g+ZnApKMMhGoLpL/sol1T9OkcmjMpLij2qk='
            ),
            seed: algosdk.base64ToBytes(
              'ADr2hmA6p7J28mz5Xje3TrogRklc+wKrrknYFoSPXIo='
            ),
            txnCommitments: new algosdk.TxnCommitments({
              nativeSha512_256Commitment: algosdk.base64ToBytes(
                'stoVkjxlI7eWkLANOO/ol3GAtGqcuQ4K2FpMnJ+hpKI='
              ),
              sha256Commitment: algosdk.base64ToBytes(
                'yA7uIgAR0IxH57DVsL4snrEy5FdvuTtWPvyPiJfzZGQ='
              ),
            }),
            timestamp: BigInt(1718387813),
            genesisID: 'test-v1',
            genesisHash: algosdk.base64ToBytes(
              'QJCPYOGYnY+ypg+7t07qT0csSFDrL7AsztSJSIgyqKg='
            ),
            proposer: new algosdk.Address(
              algosdk.base64ToBytes(
                'f5P+Q6gqfj9Vlv/NIZLnLz9p3pbk2+Di+8o0EJwMZ+k='
              )
            ),
            feesCollected: BigInt(1000),
            bonus: BigInt(10000000),
            proposerPayout: BigInt(0),
            rewardState: new algosdk.RewardState({
              feeSink: new algosdk.Address(
                algosdk.base64ToBytes(
                  'B9rLS22e0UGxdXa9RZrmQh1IbaPU7yJHxAmjlrguoiE='
                )
              ),
              rewardsPool: new algosdk.Address(
                algosdk.base64ToBytes(
                  '//////////////////////////////////////////8='
                )
              ),
              rewardsLevel: BigInt(0),
              rewardsRate: BigInt(0),
              rewardsResidue: BigInt(0),
              rewardsRecalculationRound: BigInt(500000),
            }),
            upgradeState: new algosdk.UpgradeState({
              currentProtocol: 'future',
              nextProtocol: '',
              nextProtocolApprovals: BigInt(0),
              nextProtocolVoteBefore: BigInt(0),
              nextProtocolSwitchOn: BigInt(0),
            }),
            upgradeVote: new algosdk.UpgradeVote({
              upgradePropose: '',
              upgradeDelay: BigInt(0),
              upgradeApprove: false,
            }),
            txnCounter: BigInt(1006),
            stateproofTracking: new Map<number, algosdk.StateProofTrackingData>(
              [
                [
                  0,
                  new algosdk.StateProofTrackingData({
                    stateProofVotersCommitment: new Uint8Array(),
                    stateProofOnlineTotalWeight: BigInt(0),
                    stateProofNextRound: BigInt(512),
                  }),
                ],
              ]
            ),
            participationUpdates: new algosdk.ParticipationUpdates({
              expiredParticipationAccounts: [],
              absentParticipationAccounts: [],
            }),
          }),
          payset: [
            new algosdk.SignedTxnInBlock({
              hasGenesisID: true,
              hasGenesisHash: false,
              signedTxn: new algosdk.SignedTxnWithAD({
                signedTxn: new algosdk.SignedTransaction({
                  txn: new algosdk.Transaction({
                    sender: new algosdk.Address(
                      algosdk.base64ToBytes(
                        'f5P+Q6gqfj9Vlv/NIZLnLz9p3pbk2+Di+8o0EJwMZ+k='
                      )
                    ),
                    type: algosdk.TransactionType.pay,
                    suggestedParams: {
                      flatFee: true,
                      fee: BigInt(1000),
                      firstValid: BigInt(92),
                      lastValid: BigInt(1092),
                      minFee: BigInt(1000),
                    },
                    paymentParams: {
                      amount: 0,
                      receiver: new algosdk.Address(
                        algosdk.base64ToBytes(
                          'AQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
                        )
                      ),
                      closeRemainderTo: new algosdk.Address(
                        algosdk.base64ToBytes(
                          'AQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
                        )
                      ),
                    },
                  }),
                  sig: algosdk.base64ToBytes(
                    'E++F3q8of2SbUcRqnCn/FLniZll5hx/TbkGEyKyasyiNZCrBR5+7JiwMKGtIQ0lHlBiOZL1mbzNvIIBYjscpDA=='
                  ),
                }),
                applyData: new algosdk.ApplyData({
                  closingAmount: BigInt('39999981999750'),
                }),
              }),
            }),
          ],
        }),
        cert: new algosdk.UntypedValue(
          new Map<string, algosdk.MsgpackEncodingData>([
            [
              'prop',
              new Map<string, Uint8Array>([
                [
                  'dig',
                  algosdk.base64ToBytes(
                    'l8J9zpVrkwvOVTZlN3p6b0iKuUpWii4Z0ga04n/XeFE='
                  ),
                ],
                [
                  'encdig',
                  algosdk.base64ToBytes(
                    'hvnpsOm/VFTzcKRTfpdxeEgzkpCCsZIKVkogYtDutqs='
                  ),
                ],
                [
                  'oprop',
                  algosdk.base64ToBytes(
                    'f5P+Q6gqfj9Vlv/NIZLnLz9p3pbk2+Di+8o0EJwMZ+k='
                  ),
                ],
              ]),
            ],
            ['rnd', BigInt(94)],
            ['step', BigInt(2)],
            [
              'vote',
              [
                new Map<string, algosdk.MsgpackEncodingData>([
                  [
                    'cred',
                    new Map([
                      [
                        'pf',
                        algosdk.base64ToBytes(
                          'hyzhIHDksEVUOurIbMdt66H8+xjkWv/Whn4Og+X43xoCzZmISy4+gT/7qg2yJfpgk0VVIFAppFAFZ08Od1dz3DeOrpZHpwQSiLisIDLK/wg='
                        ),
                      ],
                    ]),
                  ],
                  [
                    'sig',
                    new Map([
                      [
                        'p1s',
                        algosdk.base64ToBytes(
                          'GwrMp7udFtv77ehzwgkwH9+671tUR5NWPBJy7waxSM8Yup2UT3qGHYK+A/MiBCgeBnOwTBa0G83dRxisSykvBg=='
                        ),
                      ],
                      [
                        'p2',
                        algosdk.base64ToBytes(
                          'mmpfWH3elbHileVgm+ZRRHmKNydF9bjsRLKTEvM/bmg='
                        ),
                      ],
                      [
                        'p2s',
                        algosdk.base64ToBytes(
                          'aZllhssGLCXMJu7ul2EOX2NKzJYIpblozm7SN5JUkZ1jMLlLClUZeVqxg3zKPRnkMqrDB5jQBPCDTY8IrXGTDQ=='
                        ),
                      ],
                      [
                        'p',
                        algosdk.base64ToBytes(
                          'mOdtSatJuUOlf8qRypCU3uEm3AewgEq+xVOIhtmWUZc='
                        ),
                      ],
                      [
                        'ps',
                        algosdk.base64ToBytes(
                          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='
                        ),
                      ],
                      [
                        's',
                        algosdk.base64ToBytes(
                          'D7PBhIk/Yl40TpUojfBQj79CHOXwpmAToXgmRWG2rkDvmIh4sUjAaXVHdFla1uBMqgLrOk1rEo12QUthenYrBw=='
                        ),
                      ],
                    ]),
                  ],
                  [
                    'snd',
                    algosdk.base64ToBytes(
                      'f5P+Q6gqfj9Vlv/NIZLnLz9p3pbk2+Di+8o0EJwMZ+k='
                    ),
                  ],
                ]),
              ],
            ],
          ])
        ),
      });
      assert.deepStrictEqual(blockResponse, expectedBlockResponse);
      const reencoded = algosdk.encodeMsgpack(blockResponse);
      assert.deepStrictEqual(reencoded, encodedBlockResponse);
    });
    it('should decode ApplyData correctly', () => {
      const encodedApplyData = algosdk.base64ToBytes(
        'iKNhY2HP//////////+kYXBpZM0iuKJjYc8AACRhOLfWhqRjYWlkzR5homR0haJnZIKqZ2xvYmFsS2V5MYKiYXQBomJzo2FiY6pnbG9iYWxLZXkygqJhdAKidWkyo2l0eJGComR0gaJsZ5KkbG9nM6Rsb2c0o3R4boakYXBpZM0eYaNmZWXNA+iiZnZcomx2zQREo3NuZMQgf5P+Q6gqfj9Vlv/NIZLnLz9p3pbk2+Di+8o0EJwMZ+mkdHlwZaRhcHBsomxkggCBqWxvY2FsS2V5MYKiYXQBomJzo2RlZgKBqWxvY2FsS2V5MoKiYXQConVpM6JsZ5KkbG9nMaRsb2cyonNhksQgCbEzlTT2uNiZwobypXnCOg5IqgxtO92MuwR8vJwv3ePEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAonJjEaJycgSicnN7'
      );
      const applyData = algosdk.decodeMsgpack(
        encodedApplyData,
        algosdk.ApplyData
      );
      const expectedApplyData = new algosdk.ApplyData({
        closingAmount: BigInt('39999981999750'),
        assetClosingAmount: BigInt('0xffffffffffffffff'),
        senderRewards: BigInt(123),
        receiverRewards: BigInt(4),
        closeRewards: BigInt(17),
        configAsset: BigInt(7777),
        applicationID: BigInt(8888),
        evalDelta: new algosdk.EvalDelta({
          globalDelta: new Map<Uint8Array, algosdk.ValueDelta>([
            [
              algosdk.coerceToBytes('globalKey1'),
              new algosdk.ValueDelta({
                action: 1,
                uint: BigInt(0),
                bytes: algosdk.coerceToBytes('abc'),
              }),
            ],
            [
              algosdk.coerceToBytes('globalKey2'),
              new algosdk.ValueDelta({
                action: 2,
                uint: BigInt(50),
                bytes: new Uint8Array(),
              }),
            ],
          ]),
          localDeltas: new Map<number, Map<Uint8Array, algosdk.ValueDelta>>([
            [
              0,
              new Map<Uint8Array, algosdk.ValueDelta>([
                [
                  algosdk.coerceToBytes('localKey1'),
                  new algosdk.ValueDelta({
                    action: 1,
                    uint: BigInt(0),
                    bytes: algosdk.coerceToBytes('def'),
                  }),
                ],
              ]),
            ],
            [
              2,
              new Map<Uint8Array, algosdk.ValueDelta>([
                [
                  algosdk.coerceToBytes('localKey2'),
                  new algosdk.ValueDelta({
                    action: 2,
                    uint: BigInt(51),
                    bytes: new Uint8Array(),
                  }),
                ],
              ]),
            ],
          ]),
          sharedAccts: [
            algosdk.Address.fromString(
              'BGYTHFJU624NRGOCQ3ZKK6OCHIHERKQMNU553DF3AR6LZHBP3XR5JLNCUI'
            ),
            algosdk.Address.zeroAddress(),
          ],
          logs: [algosdk.coerceToBytes('log1'), algosdk.coerceToBytes('log2')],
          innerTxns: [
            new algosdk.SignedTxnWithAD({
              signedTxn: new algosdk.SignedTransaction({
                txn: new algosdk.Transaction({
                  sender: new algosdk.Address(
                    algosdk.base64ToBytes(
                      'f5P+Q6gqfj9Vlv/NIZLnLz9p3pbk2+Di+8o0EJwMZ+k='
                    )
                  ),
                  type: algosdk.TransactionType.appl,
                  suggestedParams: {
                    flatFee: true,
                    fee: BigInt(1000),
                    firstValid: BigInt(92),
                    lastValid: BigInt(1092),
                    minFee: BigInt(1000),
                  },
                  appCallParams: {
                    appIndex: BigInt(7777),
                    onComplete: algosdk.OnApplicationComplete.NoOpOC,
                  },
                }),
              }),
              applyData: new algosdk.ApplyData({
                evalDelta: new algosdk.EvalDelta({
                  logs: [
                    algosdk.coerceToBytes('log3'),
                    algosdk.coerceToBytes('log4'),
                  ],
                }),
              }),
            }),
          ],
        }),
      });
      assert.deepStrictEqual(applyData, expectedApplyData);
      const reencoded = algosdk.encodeMsgpack(applyData);
      assert.deepStrictEqual(reencoded, encodedApplyData);
    });
    it('should decode EvalDelta with invalid UTF-8 strings correctly', () => {
      const encodedEvalDelta = algosdk.base64ToBytes(
        'haJnZIKkZzH+/4KiYXQBomJzpHYx/v+kZzL+/4KiYXQConVpMqNpdHiRgqJkdIGibGeSpmxvZzP+/6b+/2xvZzSjdHhuhqRhcGlkzR5ho2ZlZc0D6KJmdlyibHbNBESjc25kxCB/k/5DqCp+P1WW/80hkucvP2neluTb4OL7yjQQnAxn6aR0eXBlpGFwcGyibGSCAIGkbDH+/4KiYXQBomJzpHYy/v8CgaRsMv7/gqJhdAKidWkzomxnkqZsb2cx/v+m/v9sb2cyonNhksQgCbEzlTT2uNiZwobypXnCOg5IqgxtO92MuwR8vJwv3ePEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      );
      const evalDelta = algosdk.decodeMsgpack(
        encodedEvalDelta,
        algosdk.EvalDelta
      );
      const invalidUtf8 = algosdk.base64ToBytes('/v8=');
      const expectedEvalDelta = new algosdk.EvalDelta({
        globalDelta: new Map<Uint8Array, algosdk.ValueDelta>([
          [
            utils.concatArrays(algosdk.coerceToBytes('g1'), invalidUtf8),
            new algosdk.ValueDelta({
              action: 1,
              uint: BigInt(0),
              bytes: utils.concatArrays(
                algosdk.coerceToBytes('v1'),
                invalidUtf8
              ),
            }),
          ],
          [
            utils.concatArrays(algosdk.coerceToBytes('g2'), invalidUtf8),
            new algosdk.ValueDelta({
              action: 2,
              uint: BigInt(50),
              bytes: new Uint8Array(),
            }),
          ],
        ]),
        localDeltas: new Map<number, Map<Uint8Array, algosdk.ValueDelta>>([
          [
            0,
            new Map<Uint8Array, algosdk.ValueDelta>([
              [
                utils.concatArrays(algosdk.coerceToBytes('l1'), invalidUtf8),
                new algosdk.ValueDelta({
                  action: 1,
                  uint: BigInt(0),
                  bytes: utils.concatArrays(
                    algosdk.coerceToBytes('v2'),
                    invalidUtf8
                  ),
                }),
              ],
            ]),
          ],
          [
            2,
            new Map<Uint8Array, algosdk.ValueDelta>([
              [
                utils.concatArrays(algosdk.coerceToBytes('l2'), invalidUtf8),
                new algosdk.ValueDelta({
                  action: 2,
                  uint: BigInt(51),
                  bytes: new Uint8Array(),
                }),
              ],
            ]),
          ],
        ]),
        sharedAccts: [
          algosdk.Address.fromString(
            'BGYTHFJU624NRGOCQ3ZKK6OCHIHERKQMNU553DF3AR6LZHBP3XR5JLNCUI'
          ),
          algosdk.Address.zeroAddress(),
        ],
        logs: [
          utils.concatArrays(algosdk.coerceToBytes('log1'), invalidUtf8),
          utils.concatArrays(invalidUtf8, algosdk.coerceToBytes('log2')),
        ],
        innerTxns: [
          new algosdk.SignedTxnWithAD({
            signedTxn: new algosdk.SignedTransaction({
              txn: new algosdk.Transaction({
                sender: new algosdk.Address(
                  algosdk.base64ToBytes(
                    'f5P+Q6gqfj9Vlv/NIZLnLz9p3pbk2+Di+8o0EJwMZ+k='
                  )
                ),
                type: algosdk.TransactionType.appl,
                suggestedParams: {
                  flatFee: true,
                  fee: BigInt(1000),
                  firstValid: BigInt(92),
                  lastValid: BigInt(1092),
                  minFee: BigInt(1000),
                },
                appCallParams: {
                  appIndex: BigInt(7777),
                  onComplete: algosdk.OnApplicationComplete.NoOpOC,
                },
              }),
            }),
            applyData: new algosdk.ApplyData({
              evalDelta: new algosdk.EvalDelta({
                logs: [
                  utils.concatArrays(
                    algosdk.coerceToBytes('log3'),
                    invalidUtf8
                  ),
                  utils.concatArrays(
                    invalidUtf8,
                    algosdk.coerceToBytes('log4')
                  ),
                ],
              }),
            }),
          }),
        ],
      });
      assert.deepStrictEqual(evalDelta, expectedEvalDelta);
      const reencoded = algosdk.encodeMsgpack(evalDelta);
      assert.deepStrictEqual(reencoded, encodedEvalDelta);
    });
  });
  describe('LedgerStateDelta', () => {
    it('should decode LedgerStateDelta correctly', async () => {
      async function loadResource(name: string): Promise<Uint8Array> {
        const res = await fetch(
          `http://localhost:8080/tests/resources/${name}`
        );
        if (!res.ok) {
          throw new Error(`Failed to load resource (${res.status}): ${name}`);
        }
        return new Uint8Array(await res.arrayBuffer());
      }

      const stateDeltaBytes = await loadResource(
        'groupdelta-betanet_23963123_2.msgp'
      );
      const stateDelta = algosdk.decodeMsgpack(
        stateDeltaBytes,
        algosdk.LedgerStateDelta
      );

      const expectedStateDelta = new algosdk.LedgerStateDelta({
        accounts: new algosdk.AccountDeltas({
          accounts: [
            new algosdk.BalanceRecord({
              addr: algosdk.Address.fromString(
                'TILB4MAJIUF56ZBE7CDOWOXDR57IXZFJUHJARQPW3JDEVKMU56HP3A6A54'
              ),
              accountData: new algosdk.AccountData({
                accountBaseData: new algosdk.AccountBaseData({
                  status: 0,
                  microAlgos: BigInt(377962010),
                  rewardsBase: BigInt(12595),
                  rewardedMicroAlgos: BigInt(0),
                  authAddr: algosdk.Address.zeroAddress(),
                  incentiveEligible: false,
                  totalAppSchema: new algosdk.StateSchema({
                    numUints: 2675,
                    numByteSlices: 2962,
                  }),
                  totalExtraAppPages: 740,
                  totalAppParams: BigInt(459),
                  totalAppLocalStates: BigInt(37),
                  totalAssetParams: BigInt(23),
                  totalAssets: BigInt(110),
                  totalBoxes: BigInt(0),
                  totalBoxBytes: BigInt(0),
                  lastProposed: BigInt(0),
                  lastHeartbeat: BigInt(0),
                }),
                votingData: new algosdk.VotingData({
                  voteID: new Uint8Array(32),
                  selectionID: new Uint8Array(32),
                  stateProofID: new Uint8Array(64),
                  voteFirstValid: BigInt(0),
                  voteLastValid: BigInt(0),
                  voteKeyDilution: BigInt(0),
                }),
              }),
            }),
            new algosdk.BalanceRecord({
              addr: algosdk.Address.fromString(
                'A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE'
              ),
              accountData: new algosdk.AccountData({
                accountBaseData: new algosdk.AccountBaseData({
                  status: 2,
                  microAlgos: BigInt(1529589813809),
                  rewardsBase: BigInt(0),
                  rewardedMicroAlgos: BigInt(0),
                  authAddr: algosdk.Address.zeroAddress(),
                  incentiveEligible: false,
                  totalAppSchema: new algosdk.StateSchema({
                    numUints: 0,
                    numByteSlices: 0,
                  }),
                  totalExtraAppPages: 0,
                  totalAppParams: BigInt(0),
                  totalAppLocalStates: BigInt(0),
                  totalAssetParams: BigInt(0),
                  totalAssets: BigInt(0),
                  totalBoxes: BigInt(0),
                  totalBoxBytes: BigInt(0),
                  lastProposed: BigInt(0),
                  lastHeartbeat: BigInt(0),
                }),
                votingData: new algosdk.VotingData({
                  voteID: new Uint8Array(32),
                  selectionID: new Uint8Array(32),
                  stateProofID: new Uint8Array(64),
                  voteFirstValid: BigInt(0),
                  voteLastValid: BigInt(0),
                  voteKeyDilution: BigInt(0),
                }),
              }),
            }),
            new algosdk.BalanceRecord({
              addr: algosdk.Address.fromString(
                'DSR7TNPLYXGPINSZOC76OYLXNAH6VITLH7BYO5HWLLWUOUI365LD62IHSA'
              ),
              accountData: new algosdk.AccountData({
                accountBaseData: new algosdk.AccountBaseData({
                  status: 0,
                  microAlgos: BigInt(100000),
                  rewardsBase: BigInt(12595),
                  rewardedMicroAlgos: BigInt(0),
                  authAddr: algosdk.Address.zeroAddress(),
                  incentiveEligible: false,
                  totalAppSchema: new algosdk.StateSchema({
                    numUints: 0,
                    numByteSlices: 0,
                  }),
                  totalExtraAppPages: 0,
                  totalAppParams: BigInt(0),
                  totalAppLocalStates: BigInt(0),
                  totalAssetParams: BigInt(0),
                  totalAssets: BigInt(0),
                  totalBoxes: BigInt(0),
                  totalBoxBytes: BigInt(0),
                  lastProposed: BigInt(0),
                  lastHeartbeat: BigInt(0),
                }),
                votingData: new algosdk.VotingData({
                  voteID: new Uint8Array(32),
                  selectionID: new Uint8Array(32),
                  stateProofID: new Uint8Array(64),
                  voteFirstValid: BigInt(0),
                  voteLastValid: BigInt(0),
                  voteKeyDilution: BigInt(0),
                }),
              }),
            }),
            new algosdk.BalanceRecord({
              addr: algosdk.Address.fromString(
                '5UA72YDDTT7VLRMVHDRWCUOTWMWBH5XOB4MJRYTMKDNV3GEVYY5JMT5KXM'
              ),
              accountData: new algosdk.AccountData({
                accountBaseData: new algosdk.AccountBaseData({
                  status: 0,
                  microAlgos: BigInt(243300),
                  rewardsBase: BigInt(12595),
                  rewardedMicroAlgos: BigInt(0),
                  authAddr: algosdk.Address.zeroAddress(),
                  incentiveEligible: false,
                  totalAppSchema: new algosdk.StateSchema({
                    numUints: 0,
                    numByteSlices: 0,
                  }),
                  totalExtraAppPages: 0,
                  totalAppParams: BigInt(0),
                  totalAppLocalStates: BigInt(0),
                  totalAssetParams: BigInt(0),
                  totalAssets: BigInt(0),
                  totalBoxes: BigInt(1),
                  totalBoxBytes: BigInt(331),
                  lastProposed: BigInt(0),
                  lastHeartbeat: BigInt(0),
                }),
                votingData: new algosdk.VotingData({
                  voteID: new Uint8Array(32),
                  selectionID: new Uint8Array(32),
                  stateProofID: new Uint8Array(64),
                  voteFirstValid: BigInt(0),
                  voteLastValid: BigInt(0),
                  voteKeyDilution: BigInt(0),
                }),
              }),
            }),
          ],
          appResources: [
            new algosdk.AppResourceRecord({
              id: BigInt(1508981233),
              address: algosdk.Address.fromString(
                'TILB4MAJIUF56ZBE7CDOWOXDR57IXZFJUHJARQPW3JDEVKMU56HP3A6A54'
              ),
              params: new algosdk.AppParamsDelta({
                deleted: false,
                params: new algosdk.AppParams({
                  approvalProgram: algosdk.base64ToBytes(
                    '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'
                  ),
                  clearStateProgram: algosdk.base64ToBytes(
                    'CCADAQAIJgMKTnVtU3Rha2VycwtUb3RhbFN0YWtlZAxUb3RhbFJld2FyZHMxGyMSQAABAIgAAiJDMQCABlN0YWtlZGI1AikpZDQCCWc0AiOIAEwqZDUAMQCADkFjY3J1ZWRSZXdhcmRzYjUBIzUDNAOBBwxBACI0ADQDJAs0ADQDJAtbNAE0AyQLWwkWXTUANAMiCDUDQv/WKjQAZyJDNQU1BDQENAUUEEAAEjQEFDQFEEEADygoZCIIZ0IABigoZCIJZ4k='
                  ),
                  globalState: new Map<Uint8Array, algosdk.TealValue>([
                    [
                      algosdk.coerceToBytes('Admin'),
                      new algosdk.TealValue({
                        type: 1,
                        bytes: algosdk.base64ToBytes(
                          'mhYeMAlFC99kJPiG6zrjj36L5Kmh0gjB9tpGSqmU744='
                        ),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('CONTRACT_NAME'),
                      new algosdk.TealValue({
                        type: 1,
                        bytes: algosdk.coerceToBytes('PACT FARM'),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('ClaimedRewards'),
                      new algosdk.TealValue({
                        type: 1,
                        bytes: algosdk.base64ToBytes(
                          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
                        ),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('Duration'),
                      new algosdk.TealValue({
                        type: 2,
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('NextDuration'),
                      new algosdk.TealValue({
                        type: 2,
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('NextRewards'),
                      new algosdk.TealValue({
                        type: 1,
                        bytes: algosdk.base64ToBytes(
                          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
                        ),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('NumStakers'),
                      new algosdk.TealValue({
                        type: 2,
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('PendingRewards'),
                      new algosdk.TealValue({
                        type: 1,
                        bytes: algosdk.base64ToBytes(
                          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
                        ),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('RPT'),
                      new algosdk.TealValue({
                        type: 1,
                        bytes: algosdk.base64ToBytes(
                          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
                        ),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('RPT_frac'),
                      new algosdk.TealValue({
                        type: 1,
                        bytes: algosdk.base64ToBytes(
                          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
                        ),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('RewardAssetIDs'),
                      new algosdk.TealValue({
                        type: 1,
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('StakedAssetID'),
                      new algosdk.TealValue({
                        type: 2,
                        uint: BigInt(156390370),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('TotalRewards'),
                      new algosdk.TealValue({
                        type: 1,
                        bytes: algosdk.base64ToBytes(
                          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
                        ),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('TotalStaked'),
                      new algosdk.TealValue({
                        type: 2,
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('UpdatedAt'),
                      new algosdk.TealValue({
                        type: 2,
                        uint: BigInt(1675257832),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('Updater'),
                      new algosdk.TealValue({
                        type: 1,
                        bytes: algosdk.base64ToBytes(
                          'mhYeMAlFC99kJPiG6zrjj36L5Kmh0gjB9tpGSqmU744='
                        ),
                      }),
                    ],
                    [
                      algosdk.coerceToBytes('VERSION'),
                      new algosdk.TealValue({
                        type: 2,
                        uint: BigInt(100),
                      }),
                    ],
                  ]),
                  localStateSchema: new algosdk.StateSchema({
                    numByteSlices: 4,
                    numUints: 2,
                  }),
                  globalStateSchema: new algosdk.StateSchema({
                    numByteSlices: 10,
                    numUints: 7,
                  }),
                  extraProgramPages: 2,
                }),
              }),
              state: new algosdk.AppLocalStateDelta({
                deleted: false,
              }),
            }),
          ],
          assetResources: [],
        }),
        kvMods: new Map<Uint8Array, algosdk.KvValueDelta>([
          [
            algosdk.base64ToBytes('Yng6AAAAAFnxOfFFc2Nyb3c='),
            new algosdk.KvValueDelta({
              data: algosdk.base64ToBytes(
                'CCAEAAEEBiYDC01hc3RlckFwcElEAQEBADIJMQASRDEZQADyMRhAAEU2GgCABDiIGnESRCg2GgEXwDJnsSWyEDYaAhfAMrIYgAS3NV/RshoisgGzsSSyEDIKshQishI2GgMXwDCyESKyAbNCANU2GgCABHiCLPASQABONhoAgAS3WNjREkAAKTYaAIAEm+QoGxJAAAEAsSOyEDYaARfAHLIHIrIBNhoCVwIAsgWzQgCSsSOyEDIJsgcyCmAyCngJsggisgGzQgB6sSSyEDIJshQ2GgIXshI2GgEXwDCyESKyAbOxJbIQKGSyGIAEwxQK57IaKbIaKrIaKbIaKrIaMgmyHDIIsjI2GgEXwDCyMCKyAbNCAC0xGYEFEkAAAQAyCShkYRREsSSyEDYwALIRMgmyFSKyAbOxI7IQMgmyCSKyAbMjQw=='
              ),
              oldData: algosdk.base64ToBytes(
                'CCAEAAEEBiYDC01hc3RlckFwcElEAQEBADIJMQASRDEZQADyMRhAAEU2GgCABDiIGnESRCg2GgEXwDJnsSWyEDYaAhfAMrIYgAS3NV/RshoisgGzsSSyEDIKshQishI2GgMXwDCyESKyAbNCANU2GgCABHiCLPASQABONhoAgAS3WNjREkAAKTYaAIAEm+QoGxJAAAEAsSOyEDYaARfAHLIHIrIBNhoCVwIAsgWzQgCSsSOyEDIJsgcyCmAyCngJsggisgGzQgB6sSSyEDIJshQ2GgIXshI2GgEXwDCyESKyAbOxJbIQKGSyGIAEwxQK57IaKbIaKrIaKbIaKrIaMgmyHDIIsjI2GgEXwDCyMCKyAbNCAC0xGYEFEkAAAQAyCShkYRREsSSyEDYwALIRMgmyFSKyAbOxI7IQMgmyCSKyAbMjQw=='
              ),
            }),
          ],
        ]),
        txids: new Map<Uint8Array, algosdk.IncludedTransactions>([
          [
            algosdk.base64ToBytes(
              'g3NWme3GAy5uHfd8BQO06da2MjdGJ9EuuikeSD3Nuqk='
            ),
            new algosdk.IncludedTransactions({
              lastValid: BigInt(23964120),
              intra: 1,
            }),
          ],
          [
            algosdk.base64ToBytes(
              'j6CIOjVZijXyqqTJA4xJjoA4oSmiM6Il5qsV/O3H3+Q='
            ),
            new algosdk.IncludedTransactions({
              lastValid: BigInt(23964120),
              intra: 0,
            }),
          ],
        ]),
        txleases: new algosdk.UntypedValue(undefined),
        creatables: new Map<bigint, algosdk.ModifiedCreatable>([
          [
            BigInt(1508981233),
            new algosdk.ModifiedCreatable({
              creatableType: 1,
              created: true,
              creator: algosdk.Address.fromString(
                'TILB4MAJIUF56ZBE7CDOWOXDR57IXZFJUHJARQPW3JDEVKMU56HP3A6A54'
              ),
              ndeltas: 0,
            }),
          ],
        ]),
        blockHeader: new algosdk.BlockHeader({
          round: BigInt(23963123),
          branch: algosdk.base64ToBytes(
            'NPCkBgM/t8nRvRaaVqSeWHCyYUdxEghgQglgtERCuqE='
          ),
          seed: algosdk.base64ToBytes(
            'yxhfocGJCuC+DKVcfgwo0juV9jNEUvMiU1uJl0Y1MNk='
          ),
          txnCommitments: new algosdk.TxnCommitments({
            nativeSha512_256Commitment: algosdk.base64ToBytes(
              'FIrR4OYcMHA4fhT2vEScSvbaCkETZd+BPtttEQi8DiI='
            ),
            sha256Commitment: algosdk.base64ToBytes(
              'Hj1OQRa1jURkxJkRtXOKTrKSrm/MIrP5wmTnUuNq3ew='
            ),
          }),
          timestamp: BigInt(1675257836),
          genesisID: 'betanet-v1.0',
          genesisHash: algosdk.base64ToBytes(
            'mFgazF+2uRS1tMiL9dsj01hJGySEmPN28B/TjjvpVW0='
          ),
          proposer: algosdk.Address.zeroAddress(),
          feesCollected: BigInt(0),
          bonus: BigInt(0),
          proposerPayout: BigInt(0),
          rewardState: new algosdk.RewardState({
            feeSink: algosdk.Address.fromString(
              'A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE'
            ),
            rewardsPool: algosdk.Address.fromString(
              '7777777777777777777777777777777777777777777777777774MSJUVU'
            ),
            rewardsLevel: BigInt(12595),
            rewardsRate: BigInt(0),
            rewardsResidue: BigInt(3846799357),
            rewardsRecalculationRound: BigInt(24000000),
          }),
          upgradeState: new algosdk.UpgradeState({
            currentProtocol:
              'https://github.com/algorandfoundation/specs/tree/44fa607d6051730f5264526bf3c108d51f0eadb6',
            nextProtocol: '',
            nextProtocolApprovals: BigInt(0),
            nextProtocolVoteBefore: BigInt(0),
            nextProtocolSwitchOn: BigInt(0),
          }),
          upgradeVote: new algosdk.UpgradeVote({
            upgradePropose: '',
            upgradeDelay: BigInt(0),
            upgradeApprove: false,
          }),
          txnCounter: BigInt(1508981323),
          stateproofTracking: new Map<number, algosdk.StateProofTrackingData>([
            [
              0,
              new algosdk.StateProofTrackingData({
                stateProofVotersCommitment: new Uint8Array(),
                stateProofOnlineTotalWeight: BigInt(0),
                stateProofNextRound: BigInt(23963136),
              }),
            ],
          ]),
          participationUpdates: new algosdk.ParticipationUpdates({
            expiredParticipationAccounts: [],
            absentParticipationAccounts: [],
          }),
        }),
        stateProofNext: BigInt(0),
        prevTimestamp: BigInt(0),
        totals: new algosdk.AccountTotals({
          online: new algosdk.AlgoCount({
            money: BigInt(0),
            rewardUnits: BigInt(0),
          }),
          offline: new algosdk.AlgoCount({
            money: BigInt(0),
            rewardUnits: BigInt(0),
          }),
          notParticipating: new algosdk.AlgoCount({
            money: BigInt(0),
            rewardUnits: BigInt(0),
          }),
          rewardsLevel: BigInt(0),
        }),
      });

      assert.deepStrictEqual(stateDelta, expectedStateDelta);

      // Avoid comparing reencoded to stateDeltaBytes because this SDK uses omit empty for the fields,
      // so the produced encoding will be different. Instead we decode and compare again.
      const reencoded = algosdk.encodeMsgpack(stateDelta);
      const roundTripDecoded = algosdk.decodeMsgpack(
        reencoded,
        algosdk.LedgerStateDelta
      );
      assert.deepStrictEqual(roundTripDecoded, expectedStateDelta);
    });
  });
});
