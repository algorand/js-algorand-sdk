
const assert = require('assert');
const { Buffer } = require('buffer');
const algosdk = require('../index');
const group = require('../src/group');

describe('Sign', function () {
    it('should not modify input arrays', function () {
        const appArgs = [Uint8Array.from([1, 2]), Uint8Array.from([3, 4])];
        const appAccounts = ["7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q", "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM"];
        const appForeignApps = [17, 200];
        const appForeignAssets = [7, 8, 9];
        const o = {
            "from": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "fee": 10,
            "firstRound": 51,
            "lastRound": 61,
            "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
            "note": new Uint8Array(0),
            "type": "appl",
            "appIndex": 5,
            "appArgs": appArgs,
            "appAccounts": appAccounts,
            "appForeignApps": appForeignApps,
            "appForeignAssets": appForeignAssets,
        };
        const txn = new algosdk.Transaction(o);
        assert.deepStrictEqual(appArgs, [Uint8Array.from([1, 2]), Uint8Array.from([3, 4])]);
        assert.deepStrictEqual(appAccounts, ["7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q", "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM"]);
        assert.deepStrictEqual(appForeignApps, [17, 200]);
        assert.deepStrictEqual(appForeignAssets, [7, 8, 9]);
        assert.ok(txn.appArgs !== appArgs);
        assert.ok(txn.appAccounts !== appAccounts);
        assert.ok(txn.appForeignApps !== appForeignApps);
        assert.ok(txn.appForeignAssets !== appForeignAssets);
    });

    it('should not complain on a missing note', function () {
        let o = {
            "from": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "fee": 10,
            "amount": 847,
            "firstRound": 51,
            "lastRound": 61,
            "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
            "note": new Uint8Array(0)
        };
        let txn = new algosdk.Transaction(o);
    });

    it('should respect min tx fee', function () {
        let o = {
            "from": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "fee": 0,
            "amount": 847,
            "firstRound": 51,
            "lastRound": 61,
            "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
            "note": new Uint8Array([123, 12, 200])
        };
        let txn = new algosdk.Transaction(o);
        assert.equal(txn.fee, 1000); // 1000 is the v5 min txn fee
        let txnEnc = txn.get_obj_for_encoding();
        assert.equal(txnEnc.fee, 1000);
    });

    it('should not complain on a missing genesisID', function () {
        let o = {
            "from": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "fee": 10,
            "amount": 847,
            "firstRound": 51,
            "lastRound": 61,
            "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
            "note": new Uint8Array([123, 12, 200])
        };

        let txn = new algosdk.Transaction(o);

    });

    it('should not complain on an empty genesisID', function () {
        let o = {
            "from": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "fee": 10,
            "amount": 847,
            "firstRound": 51,
            "lastRound": 61,
            "note": new Uint8Array([123, 12, 200]),
            "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
            "genesisID": ""
        };

        let txn = new algosdk.Transaction(o);

    });

    it('should complain if note isnt Uint8Array', function () {

        let o = {
            "from": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "fee": 10,
            "amount": 847,
            "firstRound": 51,
            "lastRound": 61,
            "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
            "note": "new Uint8Array(0)"
        };
        assert.throws(() => {
            let txn = new algosdk.Transaction(o);
        }, (err) => err.toString() === "Error: note must be a Uint8Array.");


    });

    it('should be able to prettyprint and go toString without throwing', function() {
        let o = {
            "from": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "fee": 10,
            "amount": 847,
            "firstRound": 51,
            "lastRound": 61,
            "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
            "note": new Uint8Array(0)
        };
        let txn = new algosdk.Transaction(o);
        // assert package recommends just calling prettyPrint over using assert.doesNotThrow
        txn.prettyPrint(); // should not throw
        let dummyString = txn.toString(); // also should not throw
    });

    describe('should correctly serialize and deserialize from msgpack representation', function () {
        it('should correctly serialize and deserialize from msgpack representation', function() {
            let o = {
                "from": "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU",
                "to": "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM",
                "fee": 10,
                "amount": 847,
                "firstRound": 51,
                "lastRound": 61,
                "note": new Uint8Array([123, 12, 200]),
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "genesisID": ""
            };
            let expectedTxn = new algosdk.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = algosdk.encodeObj(encRep);
            const decEncRep = algosdk.decodeObj(encTxn);
            let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('should correctly serialize and deserialize from msgpack representation with flat fee', function() {
            let o = {
                "from": "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU",
                "to": "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM",
                "fee": 2063,
                "amount": 847,
                "firstRound": 51,
                "lastRound": 61,
                "note": new Uint8Array([123, 12, 200]),
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "genesisID": "",
                "flatFee": true
            };
            let expectedTxn = new algosdk.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = algosdk.encodeObj(encRep);
            const decEncRep = algosdk.decodeObj(encTxn);
            let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('should correctly serialize and deserialize a key registration transaction from msgpack representation', function() {
            let o = {
                "from": "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU",
                "fee": 10,
                "firstRound": 51,
                "lastRound": 61,
                "note": new Uint8Array([123, 12, 200]),
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "voteKey": "5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=",
                "selectionKey": "oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=",
                "voteFirst": 123,
                "voteLast": 456,
                "voteKeyDilution": 1234,
                "genesisID": "",
                "type": "keyreg"
            };
            let expectedTxn = new algosdk.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = algosdk.encodeObj(encRep);
            const decEncRep = algosdk.decodeObj(encTxn);
            let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('should correctly serialize and deserialize an asset configuration transaction from msgpack representation', function() {
            const address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4"
            let o = {
                "from": address,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetIndex": 1234,
                "assetManager": address,
                "assetReserve": address,
                "assetFreeze": address,
                "assetClawback": address,
                "type": "acfg"
            };
            let expectedTxn = new algosdk.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = algosdk.encodeObj(encRep);
            const decEncRep = algosdk.decodeObj(encTxn);
            let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('should correctly serialize and deserialize an asset creation transaction from msgpack representation', function() {
            const address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4"
            let o = {
                "from": address,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetTotal": 1000,
                "assetDefaultFrozen": true,
                "assetUnitName": "tests",
                "assetName": "testcoin",
                "assetURL": "testURL",
                "assetMetadataHash": new Uint8Array(Buffer.from("ZkFDUE80blJnTzU1ajFuZEFLM1c2U2djNEFQa2N5Rmg=", "base64")),
                "assetManager": address,
                "assetReserve": address,
                "assetFreeze": address,
                "assetClawback": address,
                "type": "acfg"
            };
            let expectedTxn = new algosdk.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = algosdk.encodeObj(encRep);
            const decEncRep = algosdk.decodeObj(encTxn);
            let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('should correctly serialize and deserialize an asset transfer transaction from msgpack representation', function() {
            const address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4"
            let o = {
                "type": "axfer",
                "from": address,
                "to": address,
                "amount": 100,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetIndex": 1234,
                "assetRevocationTarget": address,
                "closeRemainderTo": address
            };
            let expectedTxn = new algosdk.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = algosdk.encodeObj(encRep);
            const decEncRep = algosdk.decodeObj(encTxn);
            let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });
      
        it('should correctly serialize and deserialize an asset freeze transaction from msgpack representation', function() {
            address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4"
            let o = {
                "from": address,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "type": "afrz",
                "freezeAccount": address,
                "assetIndex": 1,
                "freezeState" : true
            };

            let expectedTxn = new algosdk.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = algosdk.encodeObj(encRep);
            const decEncRep = algosdk.decodeObj(encTxn);
            let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('reserializes correctly no genesis ID', function() {
            let o = {
                "from": "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU",
                "to": "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM",
                "fee": 10,
                "amount": 847,
                "firstRound": 51,
                "lastRound": 61,
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "note": new Uint8Array([123, 12, 200]),
            };
            let expectedTxn = new algosdk.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = algosdk.encodeObj(encRep);
            const decEncRep = algosdk.decodeObj(encTxn);
            let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('reserializes correctly zero amount', function() {
            let o = {
                "from": "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU",
                "to": "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM",
                "fee": 10,
                "amount": 0,
                "firstRound": 51,
                "lastRound": 61,
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "note": new Uint8Array([123, 12, 200]),
            };
            let expectedTxn = new algosdk.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = algosdk.encodeObj(encRep);
            const decEncRep = algosdk.decodeObj(encTxn);
            let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('should correctly serialize and deserialize group object', function() {
            let o = {
                "from": "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU",
                "to": "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM",
                "fee": 10,
                "amount": 0,
                "firstRound": 51,
                "lastRound": 61,
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "note": new Uint8Array([123, 12, 200]),
            };
            let tx = new algosdk.Transaction(o);

            {
                let expectedTxg = new group.TxGroup([tx.rawTxID(), tx.rawTxID()])
                let encRep = expectedTxg.get_obj_for_encoding();
                const encTxg = algosdk.encodeObj(encRep);
                const decEncRep = algosdk.decodeObj(encTxg);
                let decTxg = group.TxGroup.from_obj_for_encoding(decEncRep);
                const reencRep = decTxg.get_obj_for_encoding();
                assert.deepStrictEqual(reencRep, encRep);
            }

            {
                let expectedTxn = tx;
                expectedTxn.group = tx.rawTxID();
                let encRep = expectedTxn.get_obj_for_encoding();
                const encTxn = algosdk.encodeObj(encRep);
                const decEncRep = algosdk.decodeObj(encTxn);
                let decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
                const reencRep = decTxn.get_obj_for_encoding();
                assert.deepStrictEqual(reencRep, encRep);
            }

        });
    });

    describe('transaction making functions', function () {
        it('should be able to use helper to make a payment transaction', function() {
            let from = "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU";
            let to = "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM";
            let fee = 10;
            let amount = 847;
            let firstRound = 51;
            let lastRound = 61;
            let note = new Uint8Array([123, 12, 200]);
            let genesisHash = "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=";
            let genesisID = "";
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let closeRemainderTo = undefined;
            let o = {
                "from": from,
                "to": to,
                "fee": fee,
                "amount": amount,
                "closeRemainderTo": closeRemainderTo,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo
            };
            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makePaymentTxn(from, to, fee, amount, closeRemainderTo, firstRound, lastRound, note, genesisHash, genesisID, rekeyTo);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should be able to use helper to make a payment transaction with BigInt amount', function() {
            let from = "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU";
            let to = "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM";
            let fee = 10;
            let amount = 0xFFFFFFFFFFFFFFFFn;
            let firstRound = 51;
            let lastRound = 61;
            let note = new Uint8Array([123, 12, 200]);
            let genesisHash = "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=";
            let genesisID = "";
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let closeRemainderTo = undefined;
            let o = {
                "from": from,
                "to": to,
                "fee": fee,
                "amount": amount,
                "closeRemainderTo": closeRemainderTo,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo
            };
            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makePaymentTxn(from, to, fee, amount, closeRemainderTo, firstRound, lastRound, note, genesisHash, genesisID, rekeyTo);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should throw if payment amount is too large', function() {
            let from = "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU";
            let to = "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM";
            let fee = 10;
            let amount = 0x10000000000000000n;
            let firstRound = 51;
            let lastRound = 61;
            let note = new Uint8Array([123, 12, 200]);
            let genesisHash = "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=";
            let genesisID = "";
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let closeRemainderTo = undefined;
            let o = {
                "from": from,
                "to": to,
                "fee": fee,
                "amount": amount,
                "closeRemainderTo": closeRemainderTo,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo
            };
            assert.throws(() => new algosdk.Transaction(o), new Error('Amount must be a positive number and smaller than 2^64-1'));
        });

        it('should be able to use helper to make a keyreg transaction', function() {
            let from = "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU";
            let fee = 10;
            let firstRound = 51;
            let lastRound = 61;
            let note = new Uint8Array([123, 12, 200]);
            let genesisHash = "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=";
            let genesisID = "";
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let voteKey = "5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=";
            let selectionKey = "oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=";
            let voteKeyDilution = 1234;
            let voteFirst = 123;
            let voteLast = 456;
            let o = {
                "from": from,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "voteKey": voteKey,
                "selectionKey": selectionKey,
                "voteFirst": voteFirst,
                "voteLast": voteLast,
                "voteKeyDilution": voteKeyDilution,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo,
                "type": "keyreg"
            };
            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makeKeyRegistrationTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, rekeyTo);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should be able to use helper to make a nonparticipating keyreg transaction', function() {
            let from = "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU";
            let fee = 10;
            let firstRound = 51;
            let lastRound = 61;
            let note = new Uint8Array([123, 12, 200]);
            let genesisHash = "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=";
            let genesisID = "";
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let voteKey = "5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=";
            let selectionKey = "oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=";
            let voteKeyDilution = 1234;
            let voteFirst = 123;
            let voteLast = 456;
            let nonParticipation = true;
            let o = {
                "from": from,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "nonParticipation": nonParticipation,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo,
                "type": "keyreg"
            };
            
            assert.throws(
                () => new algosdk.Transaction({ ...o, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution }),
                new Error("nonParticipation is true but participation params are present.")
            );

            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makeKeyRegistrationTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                undefined, undefined, undefined, undefined, undefined, rekeyTo, nonParticipation);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should be able to use helper to make an asset create transaction', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let defaultFrozen = false;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let total = 100;
            let decimals = 0;
            let reserve = addr;
            let freeze = addr;
            let clawback = addr;
            let unitName = "tst";
            let assetName = "testcoin";
            let assetURL = "testURL";
            let assetMetadataHash = new Uint8Array(Buffer.from("dGVzdGhhc2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"));
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let note = new Uint8Array([123, 12, 200]);
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let o = {
                "from": addr,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "assetTotal": total,
                "assetDecimals": decimals,
                "assetDefaultFrozen": defaultFrozen,
                "assetUnitName": unitName,
                "assetName": assetName,
                "assetURL": assetURL,
                "assetMetadataHash": assetMetadataHash,
                "assetManager": addr,
                "assetReserve": reserve,
                "assetFreeze": freeze,
                "assetClawback": clawback,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo,
                "type": "acfg"
            };
            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makeAssetCreateTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                total, decimals, defaultFrozen, addr, reserve, freeze, clawback, unitName, assetName, assetURL, assetMetadataHash, rekeyTo);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should be able to use helper to make an asset create transaction with BigInt total', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let defaultFrozen = false;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let total = 0xFFFFFFFFFFFFFFFFn;
            let decimals = 0;
            let reserve = addr;
            let freeze = addr;
            let clawback = addr;
            let unitName = "tst";
            let assetName = "testcoin";
            let assetURL = "testURL";
            let assetMetadataHash = new Uint8Array(Buffer.from("dGVzdGhhc2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"));
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let note = new Uint8Array([123, 12, 200]);
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let o = {
                "from": addr,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "assetTotal": total,
                "assetDecimals": decimals,
                "assetDefaultFrozen": defaultFrozen,
                "assetUnitName": unitName,
                "assetName": assetName,
                "assetURL": assetURL,
                "assetMetadataHash": assetMetadataHash,
                "assetManager": addr,
                "assetReserve": reserve,
                "assetFreeze": freeze,
                "assetClawback": clawback,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo,
                "type": "acfg"
            };
            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makeAssetCreateTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                total, decimals, defaultFrozen, addr, reserve, freeze, clawback, unitName, assetName, assetURL, assetMetadataHash, rekeyTo);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should throw if asset creation total is too large', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let defaultFrozen = false;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let total = 0x10000000000000000n;
            let decimals = 0;
            let reserve = addr;
            let freeze = addr;
            let clawback = addr;
            let unitName = "tst";
            let assetName = "testcoin";
            let assetURL = "testURL";
            let assetMetadataHash = new Uint8Array(Buffer.from("dGVzdGhhc2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"));
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let note = new Uint8Array([123, 12, 200]);
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let o = {
                "from": addr,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "assetTotal": total,
                "assetDecimals": decimals,
                "assetDefaultFrozen": defaultFrozen,
                "assetUnitName": unitName,
                "assetName": assetName,
                "assetURL": assetURL,
                "assetMetadataHash": assetMetadataHash,
                "assetManager": addr,
                "assetReserve": reserve,
                "assetFreeze": freeze,
                "assetClawback": clawback,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo,
                "type": "acfg"
            };
            assert.throws(() => new algosdk.Transaction(o), new Error('Total asset issuance must be a positive number and smaller than 2^64-1'));
        });

        it('should fail to make an asset create transaction with an invalid assetMetadataHash', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let defaultFrozen = false;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let total = 100;
            let decimals = 0;
            let reserve = addr;
            let freeze = addr;
            let clawback = addr;
            let unitName = "tst";
            let assetName = "testcoin";
            let assetURL = "testURL";
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let note = new Uint8Array([123, 12, 200]);
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let txnTemplate = {
                "from": addr,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "assetTotal": total,
                "assetDecimals": decimals,
                "assetDefaultFrozen": defaultFrozen,
                "assetUnitName": unitName,
                "assetName": assetName,
                "assetURL": assetURL,
                "assetManager": addr,
                "assetReserve": reserve,
                "assetFreeze": freeze,
                "assetClawback": clawback,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo,
                "type": "acfg"
            };
            assert.doesNotThrow(() => {
                let txnParams = {
                    assetMetadataHash: '',
                    ...txnTemplate
                };
                new algosdk.Transaction(txnParams);
            });
            assert.throws(() => {
                let txnParams = {
                    assetMetadataHash: 'abc',
                    ...txnTemplate
                };
                new algosdk.Transaction(txnParams);
            });
            assert.doesNotThrow(() => {
                let txnParams = {
                    assetMetadataHash: 'fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh',
                    ...txnTemplate
                };
                new algosdk.Transaction(txnParams);
            });
            assert.throws(() => {
                let txnParams = {
                    assetMetadataHash: 'fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh1',
                    ...txnTemplate
                };
                new algosdk.Transaction(txnParams);
            });
            assert.doesNotThrow(() => {
                let txnParams = {
                    assetMetadataHash: new Uint8Array(0),
                    ...txnTemplate
                };
                new algosdk.Transaction(txnParams);
            });
            assert.throws(() => {
                let txnParams = {
                    assetMetadataHash: new Uint8Array([1, 2, 3]),
                    ...txnTemplate
                };
                new algosdk.Transaction(txnParams);
            });
            assert.doesNotThrow(() => {
                let txnParams = {
                    assetMetadataHash: new Uint8Array(32),
                    ...txnTemplate
                };
                new algosdk.Transaction(txnParams);
            });
            assert.throws(() => {
                let txnParams = {
                    assetMetadataHash: new Uint8Array(33),
                    ...txnTemplate
                };
                new algosdk.Transaction(txnParams);
            });
        });

        it('should be able to use helper to make an asset config transaction', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let assetIndex = 1234;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let manager = addr;
            let reserve = addr;
            let freeze = addr;
            let clawback = addr;
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let note = new Uint8Array([123, 12, 200]);
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let o = {
                "from": addr,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "genesisHash": genesisHash,
                "genesisID": genesisID,
                "assetIndex": assetIndex,
                "assetManager": manager,
                "assetReserve": reserve,
                "assetFreeze": freeze,
                "assetClawback": clawback,
                "type": "acfg",
                "note": note,
                "reKeyTo": rekeyTo
            };
            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makeAssetConfigTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                assetIndex, manager, reserve, freeze, clawback, true, rekeyTo);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should throw when disobeying strict address checking in make asset config', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let assetIndex = 1234;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let manager = addr;
            let reserve = undefined;
            let freeze = undefined;
            let clawback = addr;
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let note = new Uint8Array([123, 12, 200]);
            let threw = false;
            try {
                algosdk.makeAssetConfigTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                    assetIndex, manager, reserve, freeze, clawback);
            } catch {
                threw = true;
            }
            assert.deepStrictEqual(true, threw);
        });

        it('should be able to use helper to make an asset destroy transaction', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let assetIndex = 1234;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let note = new Uint8Array([123, 12, 200]);
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let o = {
                "from": addr,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "genesisHash": genesisHash,
                "genesisID": genesisID,
                "assetIndex": assetIndex,
                "type": "acfg",
                "note": note,
                "reKeyTo": rekeyTo
            };
            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makeAssetDestroyTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                assetIndex, rekeyTo);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should be able to use helper to make an asset transfer transaction', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let sender = addr;
            let recipient = addr;
            let revocationTarget = addr;
            let closeRemainderTo = addr;
            let assetIndex = 1234;
            let amount = 100;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let creator = addr;
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let note = new Uint8Array([123, 12, 200]);
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let o = {
                "type": "axfer",
                "from": sender,
                "to": recipient,
                "amount": amount,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "genesisHash": genesisHash,
                "genesisID": genesisID,
                "assetIndex": assetIndex,
                "note": note,
                "assetRevocationTarget": revocationTarget,
                "closeRemainderTo": closeRemainderTo,
                "reKeyTo": rekeyTo
            };
            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
                fee, amount, firstRound, lastRound, note, genesisHash, genesisID, assetIndex, rekeyTo);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should be able to use helper to make an asset freeze transaction', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let assetIndex = 1234;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let creator = addr;
            let freezeTarget = addr;
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let freezeState = true;
            let note = new Uint8Array([123, 12, 200]);
            let rekeyTo = "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM";
            let o = {
                "from": addr,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "genesisHash": genesisHash,
                "type": "afrz",
                "freezeAccount": freezeTarget,
                "assetIndex": assetIndex,
                "creator" : creator,
                "freezeState" : freezeState,
                "note": note,
                "genesisID": genesisID,
                "reKeyTo": rekeyTo
            };
            let expectedTxn = new algosdk.Transaction(o);
            let actualTxn = algosdk.makeAssetFreezeTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                assetIndex, freezeTarget, freezeState, rekeyTo);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });
        it('should be able to use helper to assign group ID to mixed Transaction and Dict', function() {
            let suggestedParams = {
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "genesisID": "",
                "firstRound": 322575,
                "lastRound": 322575 + 1000,
                "fee": 1000,
                "flatFee": true
            };

            let helperTx = algosdk.makePaymentTxnWithSuggestedParams("GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM",
                "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM", 1000, undefined,
                new Uint8Array(0), suggestedParams);

            let dictTx = {
                "from": "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM",
                "to": "GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM",
                "fee": 1000,
                "flatFee": true,
                "amount": 0,
                "firstRound": 322575,
                "lastRound": 322575 + 1000,
                "genesisID": "",
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "type": "pay"
            };

            // Store both transactions
            let txns = [helperTx, dictTx];

            // Group both transactions
            let txgroup = algosdk.assignGroupID(txns);

            assert.deepStrictEqual(txgroup[0].group, txgroup[1].group)

        });
    });
});