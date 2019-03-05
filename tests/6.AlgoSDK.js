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

    describe('Sign', function () {
        it('should return a blob that matches the go code', function () {
            let sk = Buffer.from([242, 175, 163, 193, 109, 239, 243, 150, 57, 236, 107, 130, 11, 20, 250, 252, 116, 163, 125, 222, 50, 175, 14, 232, 7, 153, 82, 169, 228, 5, 76, 247, 143, 84, 203, 38, 75, 204, 66, 20, 164, 35, 27, 68, 149, 151, 224, 143, 55, 229, 237, 204, 90, 5, 160, 96, 193, 117, 197, 79, 183, 92, 227, 132]);
            let golden = Buffer.from([130, 163, 115, 105, 103, 196, 64, 225, 188, 15, 71, 26, 20, 12, 184, 65, 156, 216, 175, 250, 102, 30, 14, 139, 226, 214, 217, 123, 25, 63, 32, 188, 66, 48, 55, 74, 119, 9, 190, 29, 111, 177, 63, 70, 224, 142, 164, 210, 7, 189, 119, 5, 234, 200, 145, 160, 70, 220, 18, 151, 112, 183, 62, 237, 247, 36, 201, 111, 100, 67, 12, 163, 116, 120, 110, 135, 163, 97, 109, 116, 10, 163, 102, 101, 101, 10, 162, 102, 118, 205, 3, 232, 162, 108, 118, 205, 3, 232, 163, 114, 99, 118, 196, 32, 143, 84, 203, 38, 75, 204, 66, 20, 164, 35, 27, 68, 149, 151, 224, 143, 55, 229, 237, 204, 90, 5, 160, 96, 193, 117, 197, 79, 183, 92, 227, 132, 163, 115, 110, 100, 196, 32, 143, 84, 203, 38, 75, 204, 66, 20, 164, 35, 27, 68, 149, 151, 224, 143, 55, 229, 237, 204, 90, 5, 160, 96, 193, 117, 197, 79, 183, 92, 227, 132, 164, 116, 121, 112, 101, 163, 112, 97, 121]);
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
            let tx_golden = "PT4MUMAFIOCRHYPIO7E6T4MGQYQ7GQ5LHXFPWIUDD74M45CZZQBQ";
            assert.deepStrictEqual(js_dec.txID, tx_golden);

        });

    });
});