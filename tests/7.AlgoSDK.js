let assert = require('assert');
let algosdk = require("../src/main");
let address = require("../src/encoding/address");
let passphrase = require("../src/mnemonic/mnemonic");
let nacl = require("../src/nacl/naclWrappers");

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

    describe('Multisig Sign', function () {
        it('should return a blob that matches the go code', function () {
            const params = {
                version: 1,
                threshold: 2,
                addrs: [
                   "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA",
                    "BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM",
                    "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
                ],
            };
            let mnem3 = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
            let seed = passphrase.seedFromMnemonic(mnem3);
            let sk = nacl.keyPairFromSeed(seed).secretKey;

            let o = {
                "to": "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
                "fee": 10,
                "amount": 10,
                "firstRound": 1000,
                "lastRound": 1000,
                "note": new Uint8Array(0),
            };

            let js_dec = algosdk.signMultisigTransaction(o, params, sk);
            // this golden also contains the correct multisig address
            let golden = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 129, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 89, 235, 190, 174, 89, 197, 155, 153, 148, 120, 178, 211, 193, 116, 216, 211, 24, 246, 254, 115, 130, 238, 147, 23, 192, 199, 86, 179, 170, 110, 70, 192, 6, 111, 210, 93, 202, 165, 40, 72, 70, 252, 64, 102, 2, 75, 43, 85, 222, 192, 161, 25, 152, 117, 93, 213, 182, 136, 91, 206, 108, 218, 83, 3, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 135, 163, 97, 109, 116, 10, 163, 102, 101, 101, 205, 7, 38, 162, 102, 118, 205, 3, 232, 162, 108, 118, 205, 3, 232, 163, 114, 99, 118, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 163, 112, 97, 121]);
            assert.deepStrictEqual(Buffer.from(js_dec.blob), golden);

            // Check txid
            let tx_golden = "6CPXBC4QQFFAM6ZOROB6TOX7WE5OGKEMW6CES5GH2MANZFTNFDRQ";
            assert.deepStrictEqual(js_dec.txID, tx_golden);
        });

    });


    describe('Multisig Append', function () {
        it('should return a blob that matches the go code', function () {
            const params = {
                version: 1,
                threshold: 2,
                addrs: [
                    "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA",
                    "BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM",
                    "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
                ],
            };
            let mnem1 = "auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch";
            let seed = passphrase.seedFromMnemonic(mnem1);
            let sk = nacl.keyPairFromSeed(seed).secretKey;

            // this is a multisig transaction with an existing signature in the third slot
            let o = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 129, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 89, 235, 190, 174, 89, 197, 155, 153, 148, 120, 178, 211, 193, 116, 216, 211, 24, 246, 254, 115, 130, 238, 147, 23, 192, 199, 86, 179, 170, 110, 70, 192, 6, 111, 210, 93, 202, 165, 40, 72, 70, 252, 64, 102, 2, 75, 43, 85, 222, 192, 161, 25, 152, 117, 93, 213, 182, 136, 91, 206, 108, 218, 83, 3, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 135, 163, 97, 109, 116, 10, 163, 102, 101, 101, 205, 7, 38, 162, 102, 118, 205, 3, 232, 162, 108, 118, 205, 3, 232, 163, 114, 99, 118, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 163, 112, 97, 121]);

            let js_dec = algosdk.appendSignMultisigTransaction(o, params, sk);
            let golden = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 220, 122, 23, 29, 121, 252, 136, 31, 80, 18, 91, 94, 220, 180, 80, 145, 148, 182, 228, 225, 197, 111, 162, 84, 103, 176, 63, 164, 167, 48, 244, 56, 17, 45, 46, 182, 204, 171, 2, 70, 129, 13, 77, 89, 189, 91, 242, 188, 191, 235, 82, 240, 114, 91, 164, 208, 143, 99, 102, 131, 70, 115, 51, 7, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 89, 235, 190, 174, 89, 197, 155, 153, 148, 120, 178, 211, 193, 116, 216, 211, 24, 246, 254, 115, 130, 238, 147, 23, 192, 199, 86, 179, 170, 110, 70, 192, 6, 111, 210, 93, 202, 165, 40, 72, 70, 252, 64, 102, 2, 75, 43, 85, 222, 192, 161, 25, 152, 117, 93, 213, 182, 136, 91, 206, 108, 218, 83, 3, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 135, 163, 97, 109, 116, 10, 163, 102, 101, 101, 205, 7, 38, 162, 102, 118, 205, 3, 232, 162, 108, 118, 205, 3, 232, 163, 114, 99, 118, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 163, 112, 97, 121]);
            assert.deepStrictEqual(Buffer.from(js_dec.blob), golden);

            // Check txid
            let tx_golden = "6CPXBC4QQFFAM6ZOROB6TOX7WE5OGKEMW6CES5GH2MANZFTNFDRQ";
            assert.deepStrictEqual(js_dec.txID, tx_golden);
        });

    });
});