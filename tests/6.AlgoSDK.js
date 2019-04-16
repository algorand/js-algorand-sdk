let assert = require('assert');
let algosdk = require("../src/main");

describe('Algosdk (AKA end to end)', function () {
    describe('#mnemonic', function () {
        it('should export and import', function () {
            for (let i=0 ; i<50 ; i++) {
                let keys = algosdk.generateAccount();
                let mn = algosdk.secretKeyToMnemonic(keys.sk);
                let recovered = algosdk.mnemonicToSecretKey(mn);
                assert.deepStrictEqual(keys.sk, recovered.sk);
                assert.deepStrictEqual(keys.addr, recovered.addr);
            }
        });
    });

    describe('#encoding', function () {
        it('should encode and decode', function () {
            let o = {"a": [1, 2, 3, 4, 5], "b": 3486, "c": "skfg"};
            assert.deepStrictEqual(o, algosdk.decodeObj(algosdk.encodeObj(o)));
        });

        it('should encode and decode strings', function () {
            let o = "Hi there";
            assert.deepStrictEqual(o, algosdk.decodeObj(algosdk.encodeObj(o)));
        });
    });

    describe('Sign', function () {
        it('should return a blob that matches the go code', function () {
            let sk = Buffer.from([242, 175, 163, 193, 109, 239, 243, 150, 57, 236, 107, 130, 11, 20, 250, 252, 116, 163, 125, 222, 50, 175, 14, 232, 7, 153, 82, 169, 228, 5, 76, 247, 143, 84, 203, 38, 75, 204, 66, 20, 164, 35, 27, 68, 149, 151, 224, 143, 55, 229, 237, 204, 90, 5, 160, 96, 193, 117, 197, 79, 183, 92, 227, 132]);
            let golden = Buffer.from([130, 163, 115, 105, 103, 196, 64, 131, 118, 119, 11, 135, 24, 77, 7, 112, 40, 243, 142, 37, 135, 67, 134, 136, 191, 0, 29, 231, 196, 61, 179, 87, 218, 72, 35, 51, 136, 90, 21, 28, 20, 46, 187, 156, 253, 174, 221, 29, 32, 35, 191, 204, 151, 214, 104, 130, 179, 128, 91, 234, 165, 10, 125, 202, 69, 175, 56, 134, 162, 222, 13, 163, 116, 120, 110, 135, 163, 97, 109, 116, 10, 163, 102, 101, 101, 205, 7, 38, 162, 102, 118, 205, 3, 232, 162, 108, 118, 205, 3, 232, 163, 114, 99, 118, 196, 32, 143, 84, 203, 38, 75, 204, 66, 20, 164, 35, 27, 68, 149, 151, 224, 143, 55, 229, 237, 204, 90, 5, 160, 96, 193, 117, 197, 79, 183, 92, 227, 132, 163, 115, 110, 100, 196, 32, 143, 84, 203, 38, 75, 204, 66, 20, 164, 35, 27, 68, 149, 151, 224, 143, 55, 229, 237, 204, 90, 5, 160, 96, 193, 117, 197, 79, 183, 92, 227, 132, 164, 116, 121, 112, 101, 163, 112, 97, 121]);
            let ad = "R5KMWJSLZRBBJJBDDNCJLF7AR436L3OMLIC2AYGBOXCU7N244OCLNZFM2M";
            let o = {
                "to":ad,
                "fee": 10,
                "amount": 10,
                "firstRound": 1000,
                "lastRound": 1000,
                "note": new Uint8Array(0),
            };

            let js_dec = algosdk.signTransaction(o, sk);
            assert.deepStrictEqual(Buffer.from(js_dec.blob), golden);

            // Check txid
            let tx_golden = "SGQTHZ4NF47OEHNUKN4SPGJOEVLFIMW2GILZRVU347YOYYRDSVAA";
            assert.deepStrictEqual(js_dec.txID, tx_golden);

        });

    });
});