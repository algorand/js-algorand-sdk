const assert = require('assert');
const { Buffer } = require('buffer');
const algosdk = require('../index');
const utils = require('../src/utils/utils');

const ERROR_CONTAINS_EMPTY_STRING = "The object contains empty or 0 values. First empty or 0 value encountered during encoding: ";

describe('encoding', function () {
    it('should be able to encode and decode', function () {
        let temp = {"a": 3, "b": 500};
        let enc = algosdk.encodeObj(temp);
        let dec = algosdk.decodeObj(enc);
        assert.deepStrictEqual(temp, dec);
    });
    // The strategy here is mainly to see that we match our go code.
    // This will check consistency with golden that were produced by protocol.encoding
    describe('#encode', function () {
        it('should match encode every integer must be encoded to the smallest type possible', function () {
            let golden = Buffer.from([0x81, 0xa1, 0x41, 0x78]);
            let o = {"A": 120};
            assert.notStrictEqual(algosdk.encodeObj(o), golden);

            golden = Buffer.from([0x81, 0xa1, 0x41, 0xcd, 0x1, 0x2c]);
            o = {"A": 300};
            assert.notStrictEqual(algosdk.encodeObj(o), golden);
        });

        it('should sort all fields before encoding', function () {
            let a = {"a": 3, "b": 5};
            let b = {"b": 5, "a": 3};
            assert.notStrictEqual(algosdk.encodeObj(a), algosdk.encodeObj(b));
        });

        it('should fail if empty or 0 fields exist', function () {
            let a = {"a": 0, "B": []};
            assert.throws(() => {
                algosdk.encodeObj(a);
            }, (err) => err.toString().includes(ERROR_CONTAINS_EMPTY_STRING));

            let b = {"a": 4, "B": []};
            assert.throws(() => {
                algosdk.encodeObj(b);
            }, (err) => err.toString().includes(ERROR_CONTAINS_EMPTY_STRING));

            let c = {"a": 4, "B": 0};
            assert.throws(() => {
                algosdk.encodeObj(c);
            }, (err) => err.toString().includes(ERROR_CONTAINS_EMPTY_STRING));
        });

        it('should encode Binary blob should be used for binary data and string for strings', function () {
            let golden = Buffer.from([0x82, 0xa1, 0x4a, 0xc4, 0x3, 0x14, 0x1e, 0x28, 0xa1, 0x4b, 0xa3, 0x61, 0x61, 0x61]);
            let o = {"J": Buffer.from([20, 30, 40]), "K": "aaa"};
            assert.notStrictEqual(algosdk.encodeObj(o), golden);
        });

        it('should safely encode/decode bigints', function () {
            let beforeZero = BigInt("0")
            let afterZero = algosdk.decodeObj(algosdk.encodeObj(beforeZero));
            assert.ok(beforeZero == afterZero); //after is a Number because 0 fits into a Number - so we do this loose comparison
            let beforeLarge = BigInt("18446744073709551612"); // larger than a Number, but fits into a uint64
            let afterLarge = algosdk.decodeObj(algosdk.encodeObj(beforeLarge));
            assert.strictEqual(beforeLarge, afterLarge);
            let beforeTooLarge = BigInt("18446744073709551616") // larger than even fits into a uint64. we do not want to work with these too-large numbers
            let afterTooLarge = algosdk.decodeObj(algosdk.encodeObj(beforeTooLarge));
            assert.notStrictEqual(beforeTooLarge, afterTooLarge)
        });

        it('should match our go code', function () {
            let golden = new Uint8Array([134, 163, 97, 109, 116, 205, 3, 79, 163, 102, 101, 101, 10, 162, 102, 118, 51, 162, 108, 118, 61, 163, 114, 99, 118, 196, 32, 145, 154, 160, 178, 192, 112, 147, 3, 73, 200, 52, 23, 24, 49, 180, 79, 91, 78, 35, 190, 125, 207, 231, 37, 41, 131, 96, 252, 244, 221, 54, 208, 163, 115, 110, 100, 196, 32, 145, 154, 160, 178, 192, 112, 147, 3, 73, 200, 52, 23, 24, 49, 180, 79, 91, 78, 35, 190, 125, 207, 231, 37, 41, 131, 96, 252, 244, 221, 54, 208]);
           let ad = "SGNKBMWAOCJQGSOIGQLRQMNUJ5NU4I56PXH6OJJJQNQPZ5G5G3IOVLI5VM";
           let o = {
                "snd": Buffer.from(algosdk.decodeAddress(ad).publicKey),
                "rcv": Buffer.from(algosdk.decodeAddress(ad).publicKey),
                "fee": 10,
                "amt": 847,
                "fv": 51,
                "lv": 61,
            };

           let js_enc = algosdk.encodeObj(o);
           assert.deepStrictEqual(js_enc, golden);
        });
    });

    describe('uint64', function () {
        it('should encode properly', function () {
            const testcases = [
                [0,                                  Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0])],
                [0n,                                 Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0])],
                [1,                                  Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1])],
                [1n,                                 Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1])],
                [255,                                Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255])],
                [255n,                               Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255])],
                [256,                                Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0])],
                [256n,                               Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0])],
                [Number.MAX_SAFE_INTEGER,            Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255])],
                [BigInt(Number.MAX_SAFE_INTEGER),    Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255])],
                [BigInt(Number.MAX_SAFE_INTEGER)+1n, Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0])],
                [0xFFFFFFFFFFFFFFFFn,                Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255])],
            ];

            for (const [input, expected] of testcases) {
                const actual = algosdk.encodeUint64(input);
                assert.deepStrictEqual(actual, expected, `Incorrect encoding of ${typeof input} ${input}`);
            }
        });

        it('should not encode negative numbers', function () {
            assert.throws(() => algosdk.encodeUint64(-1));
            assert.throws(() => algosdk.encodeUint64(-1n));
            assert.throws(() => algosdk.encodeUint64(Number.MIN_SAFE_INTEGER));
            assert.throws(() => algosdk.encodeUint64(BigInt(Number.MIN_SAFE_INTEGER)));
        });

        it('should not encode numbers larger than 2^64', function () {
            assert.throws(() => algosdk.encodeUint64(0xFFFFFFFFFFFFFFFFn + 1n));
        });

        it('should not encode decimals', function () {
            assert.throws(() => algosdk.encodeUint64(0.01));
            assert.throws(() => algosdk.encodeUint64(9999.99));
        });

        it('should decode properly in default mode', function () {
            // should be the same as safe mode
            const testcases = [
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]),              0],
                [Uint8Array.from([0]),                                   0],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1]),              1],
                [Uint8Array.from([0, 0, 1]),                             1],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255]),            255],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0]),              256],
                [Uint8Array.from([31, 255, 255, 255, 255, 255, 255]),    Number.MAX_SAFE_INTEGER],
                [Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]), Number.MAX_SAFE_INTEGER],
            ];

            for (const [input, expected] of testcases) {
                const actual = algosdk.decodeUint64(input);
                assert.deepStrictEqual(actual, expected, `Incorrect decoding of ${Array.from(input)}`);
            }
        });

        it('should throw an error when decoding large values in default mode', function () {
            assert.throws(() => algosdk.decodeUint64(Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0])));
            assert.throws(() => algosdk.decodeUint64(Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 1])));
            assert.throws(() => algosdk.decodeUint64(Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255])));
        });

        it('should decode properly in safe mode', function () {
            const testcases = [
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]),              0],
                [Uint8Array.from([0]),                                   0],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1]),              1],
                [Uint8Array.from([0, 0, 1]),                             1],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255]),            255],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0]),              256],
                [Uint8Array.from([31, 255, 255, 255, 255, 255, 255]),    Number.MAX_SAFE_INTEGER],
                [Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]), Number.MAX_SAFE_INTEGER],
            ];

            for (const [input, expected] of testcases) {
                const actual = algosdk.decodeUint64(input, 'safe');
                assert.deepStrictEqual(actual, expected, `Incorrect decoding of ${Array.from(input)}`);
            }
        });

        it('should throw an error when decoding large values in safe mode', function () {
            assert.throws(() => algosdk.decodeUint64(Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0]), 'safe'));
            assert.throws(() => algosdk.decodeUint64(Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 1]), 'safe'));
            assert.throws(() => algosdk.decodeUint64(Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255]), 'safe'));
        });

        it('should decode properly in mixed mode', function () {
            const testcases = [
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]),                 0],
                [Uint8Array.from([0]),                                      0],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1]),                 1],
                [Uint8Array.from([0, 0, 1]),                                1],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255]),               255],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0]),                 256],
                [Uint8Array.from([31, 255, 255, 255, 255, 255, 255]),       Number.MAX_SAFE_INTEGER],
                [Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]),    Number.MAX_SAFE_INTEGER],
                [Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0]),                BigInt(Number.MAX_SAFE_INTEGER)+1n],
                [Uint8Array.from([32, 0, 0, 0, 0, 0, 0]),                   BigInt(Number.MAX_SAFE_INTEGER)+1n],
                [Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255]), 0xFFFFFFFFFFFFFFFFn],
            ];

            for (const [input, expected] of testcases) {
                const actual = algosdk.decodeUint64(input, 'mixed');
                assert.deepStrictEqual(actual, expected, `Incorrect decoding of ${Array.from(input)}`);
            }
        });

        it('should decode properly in bigint mode', function () {
            const testcases = [
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]),                 0n],
                [Uint8Array.from([0]),                                      0n],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 1]),                 1n],
                [Uint8Array.from([0, 0, 1]),                                1n],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 255]),               255n],
                [Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 0]),                 256n],
                [Uint8Array.from([31, 255, 255, 255, 255, 255, 255]),       BigInt(Number.MAX_SAFE_INTEGER)],
                [Uint8Array.from([0, 31, 255, 255, 255, 255, 255, 255]),    BigInt(Number.MAX_SAFE_INTEGER)],
                [Uint8Array.from([0, 32, 0, 0, 0, 0, 0, 0]),                BigInt(Number.MAX_SAFE_INTEGER)+1n],
                [Uint8Array.from([32, 0, 0, 0, 0, 0, 0]),                   BigInt(Number.MAX_SAFE_INTEGER)+1n],
                [Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255]), 0xFFFFFFFFFFFFFFFFn],
            ];

            for (const [input, expected] of testcases) {
                const actual = algosdk.decodeUint64(input, 'bigint');
                assert.deepStrictEqual(actual, expected, `Incorrect decoding of ${Array.from(input)}`);
            }
        });

        it('should throw an error when decoding data with wrong length', function () {
            assert.throws(() => algosdk.decodeUint64(Uint8Array.from([])));
            assert.throws(() => algosdk.decodeUint64(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0])));
        });

        it('should throw an error when decoding with an unknown mode', function () {
            assert.throws(() => algosdk.decodeUint64(Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]), 'unknown'));
        });
    });

    describe('JSON parse BigInt', function () {
        it('should parse null', function () {
            const input = 'null';

            for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
                const actual = utils.parseJSON(input, { intDecoding });
                const expected = null;

                assert.deepStrictEqual(actual, expected, `Error when intDecoding = ${intDecoding}`);
            }
        });

        it('should parse number', function () {
            const input = '17';

            for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
                const actual = utils.parseJSON(input, { intDecoding });
                const expected = intDecoding === 'bigint' ? 17n : 17;

                assert.deepStrictEqual(actual, expected, `Error when intDecoding = ${intDecoding}`);
            }
        });

        it('should parse empty object', function () {
            const input = '{}';

            for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
                const actual = utils.parseJSON(input, { intDecoding });
                const expected = {};

                assert.deepStrictEqual(actual, expected, `Error when intDecoding = ${intDecoding}`);
            }
        });

        it('should parse populated object', function () {
            const input = '{"a":1,"b":"value","c":[1,2,3],"d":null,"e":{},"f":true}';

            for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
                const actual = utils.parseJSON(input, { intDecoding });

                let expected;
                if (intDecoding === 'bigint') {
                    expected = {
                        a: 1n,
                        b: 'value',
                        c: [1n,2n,3n],
                        d: null,
                        e: {},
                        f: true
                    };
                } else {
                    expected = {
                        a: 1,
                        b: 'value',
                        c: [1,2,3],
                        d: null,
                        e: {},
                        f: true
                    };
                }

                assert.deepStrictEqual(actual, expected, `Error when intDecoding = ${intDecoding}`);
            }
        });

        it('should parse object with BigInt', function () {
            const input = '{"a":0,"b":9007199254740991,"c":9007199254740992,"d":9223372036854775807}';

            assert.throws(() => utils.parseJSON(input, { intDecoding: 'safe' }));

            for (const intDecoding of ['default', 'mixed', 'bigint']) {
                const actual = utils.parseJSON(input, { intDecoding });

                let expected;
                if (intDecoding === 'bigint') {
                    expected = {
                        a: 0n,
                        b: 9007199254740991n,
                        c: 9007199254740992n,
                        d: 9223372036854775807n
                    };
                } else if (intDecoding === 'mixed') {
                    expected = {
                        a: 0,
                        b: 9007199254740991,
                        c: 9007199254740992n,
                        d: 9223372036854775807n
                    };
                } else {
                    expected = {
                        a: 0,
                        b: 9007199254740991,
                        c: Number(9007199254740992n),
                        d: Number(9223372036854775807n)
                    };
                }

                assert.deepStrictEqual(actual, expected, `Error when intDecoding = ${intDecoding}`);
            }
        });

        it('should parse empty array', function () {
            const input = '[]';

            for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
                const actual = utils.parseJSON(input, { intDecoding });
                const expected = [];

                assert.deepStrictEqual(actual, expected, `Error when intDecoding = ${intDecoding}`);
            }
        });

        it('should parse populated array', function () {
            const input = '["test",2,null,[7],{"a":9.5},true]';

            for (const intDecoding of ['default', 'safe', 'mixed', 'bigint']) {
                const actual = utils.parseJSON(input, { intDecoding });

                let expected;
                if (intDecoding === 'bigint') {
                    expected = [
                        'test',
                        2n,
                        null,
                        [7n],
                        {a: 9.5},
                        true
                    ];
                } else {
                    expected = [
                        'test',
                        2,
                        null,
                        [7],
                        {a: 9.5},
                        true
                    ];
                }

                assert.deepStrictEqual(actual, expected, `Error when intDecoding = ${intDecoding}`);
            }
        });

        it('should parse array with BigInt', function () {
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
                        9223372036854775807n
                    ];
                } else if (intDecoding === 'mixed') {
                    expected = [
                        0,
                        9007199254740991,
                        9007199254740992n,
                        9223372036854775807n
                    ];
                } else {
                    expected = [
                        0,
                        9007199254740991,
                        Number(9007199254740992n),
                        Number(9223372036854775807n)
                    ];
                }

                assert.deepStrictEqual(actual, expected, `Error when intDecoding = ${intDecoding}`);
            }
        });
    });
});
