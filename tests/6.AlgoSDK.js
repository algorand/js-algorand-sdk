let assert = require('assert');
let algosdk = require("../src/main");

describe('Algosdk (AKA end to end)', function () {
    describe('#mnemonic', function () {
        it('should export and import', function () {
            for (let i=0 ; i<50 ; i++) {
                let keys = algosdk.generateAddress();
                let mn = algosdk.exportMnemonic(keys.sk);
                let recovered = algosdk.importMnemonic(mn);
                assert.deepStrictEqual(keys.sk, recovered.sk);
                assert.deepStrictEqual(keys.addr, recovered.addr);
            }
        });
    });

    describe('Sign', function () {
        it('should return a blob that matches the go code', function () {
            let sk = Buffer.from( [37,163,185,70,26,105,74,2,147,41,186,60,103,32,59,113,137,21,242,135,201,251,139,232,76,36,69,168,229,58,218,15,254,104,65,3,231,42,243,59,145,177,174,185,35,174,156,5,95,73,178,115,29,11,64,180,35,247,5,253,151,116,60,102]);
            let golden = Buffer.from([130 ,163 ,115 ,105 ,103 ,196 ,64 ,37 ,98 ,186 ,236 ,98 ,138 ,58 ,77 ,193 ,98 ,52 ,96 ,34 ,188 ,79 ,162 ,62 ,79 ,167 ,62 ,74 ,154 ,136 ,237 ,134 ,163 ,69 ,87 ,166 ,248 ,141 ,170 ,19 ,14 ,150 ,131 ,191 ,64 ,204 ,226 ,150 ,89 ,13 ,126 ,82 ,62 ,231 ,74 ,62 ,220 ,10 ,1 ,93 ,197 ,236 ,93 ,97 ,26 ,103 ,85 ,251 ,148 ,185 ,11 ,163 ,116 ,120 ,110 ,130 ,163 ,112 ,97 ,121 ,134 ,163 ,97 ,109 ,116 ,205 ,3 ,79 ,163 ,102 ,101 ,101 ,10 ,162 ,102 ,118 ,51 ,162 ,108 ,118 ,61 ,163 ,114 ,99 ,118 ,196 ,32 ,254 ,104 ,65 ,3 ,231 ,42 ,243 ,59 ,145 ,177 ,174 ,185 ,35 ,174 ,156 ,5 ,95 ,73 ,178 ,115 ,29 ,11 ,64 ,180 ,35 ,247 ,5 ,253 ,151 ,116 ,60 ,102 ,163 ,115 ,110 ,100 ,196 ,32 ,254 ,104 ,65 ,3 ,231 ,42 ,243 ,59 ,145 ,177 ,174 ,185 ,35 ,174 ,156 ,5 ,95 ,73 ,178 ,115 ,29 ,11 ,64 ,180 ,35 ,247 ,5 ,253 ,151 ,116 ,60 ,102 ,164 ,116 ,121 ,112 ,101 ,163 ,112 ,97 ,121]);
            let ad = "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q";
            let o = {
                "to":ad,
                "fee": 10,
                "amount": 847,
                "firstRound": 51,
                "lastRound": 61,
                "note": new Uint8Array(0),
            };


            let js_dec = algosdk.signTransaction(o, sk);
            assert.deepStrictEqual(js_dec.blob, new Uint8Array(golden));

            // Check txid
            let tx_golden = "AL2VPVNIKYKOHDAPTOOB3DXXXI2L55ZWECMVWEB2M5VFRV7OM23Q";
            assert.deepStrictEqual(js_dec.txID, tx_golden);

        });

    });
});