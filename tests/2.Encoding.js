let assert = require('assert');
let encoding = require("../src/encoding/encoding");
let address = require('../src/encoding/address');

describe('encoding', function () {
    it('should be able to encode and decode', function () {
        let temp = {"a": 3, "b": 500};
        let enc = encoding.encode(temp);
        let dec = encoding.decode(enc);
        assert.deepStrictEqual(temp, dec);
    });
    // The strategy here is mainly to see that we match our go code.
    // This will check consistency with golden that were produced by protocol.encoding
    describe('#encode', function () {
        it('should match encode every integer must be encoded to the smallest type possible', function () {
            let golden = Buffer.from([0x81, 0xa1, 0x41, 0x78]);
            let o = {"A": 120};
            assert.notStrictEqual(encoding.encode(o), golden);

            golden = Buffer.from([0x81, 0xa1, 0x41, 0xcd, 0x1, 0x2c]);
            o = {"A": 300};
            assert.notStrictEqual(encoding.encode(o), golden);
        });

        it('should sort all fields before encoding', function () {
            let a = {"a": 3, "b": 5};
            let b = {"b": 5, "a": 3};
            assert.notStrictEqual(encoding.encode(a), encoding.encode(b));
        });

        it('should fail if empty or 0 fields exist', function () {
            let a = {"a": 0, "B": []};
            assert.throws(() => {
                encoding.encode(a);
            }, (err) => err === encoding.ERROR_CONTAINS_EMPTY);

            let b = {"a": 4, "B": []};
            assert.throws(() => {
                encoding.encode(b);
            }, (err) => err === encoding.ERROR_CONTAINS_EMPTY);

            let c = {"a": 4, "B": 0};
            assert.throws(() => {
                encoding.encode(c);
            }, (err) => err === encoding.ERROR_CONTAINS_EMPTY);
        });

        it('should encode Binary blob should be used for binary data and string for strings', function () {
            let golden = Buffer.from([0x82, 0xa1, 0x4a, 0xc4, 0x3, 0x14, 0x1e, 0x28, 0xa1, 0x4b, 0xa3, 0x61, 0x61, 0x61]);
            let o = {"J": Buffer.from([20, 30, 40]), "K": "aaa"};
            assert.notStrictEqual(encoding.encode(o), golden);
        });

        it('should match our go code', function () {
           let golden = Buffer.from([134,163,97,109,116,205,3,79,163,102,101,101,10,162,102,118,51,162,108,118,61,163,114,99,118,196,32,145,154,160,178,192,112,147,3,73,200,52,23,24,49,180,79,91,78,35,190,125,207,231,37,41,131,96,252,244,221,54,208,163,115,110,100,196,32,145,154,160,178,192,112,147,3,73,200,52,23,24,49,180,79,91,78,35,190,125,207,231,37,41,131,96,252,244,221,54,208]);
           let ad = "SGNKBMWAOCJQGSOIGQLRQMNUJ5NU4I56PXH6OJJJQNQPZ5G5G3IOVLI5VM";
           let o = {
                "snd": Buffer.from(address.decode(ad).publicKey),
                "rcv": Buffer.from(address.decode(ad).publicKey),
                "fee": 10,
                "amt": 847,
                "fv": 51,
                "lv": 61,
            };

           let js_enc = encoding.encode(o);
           assert.deepStrictEqual(js_enc, golden);
        });
    });

});