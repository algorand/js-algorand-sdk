
let assert = require('assert');

let transaction = require("../src/transaction");
let encoding = require("../src/encoding/encoding");
let algosdk = require("../src/main");

describe('Sign', function () {
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
        let txn = new transaction.Transaction(o);
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
        let txn = new transaction.Transaction(o);
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

        let txn = new transaction.Transaction(o);

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

        let txn = new transaction.Transaction(o);

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
            let txn = new transaction.Transaction(o);
        }, (err) => err.toString() === "Error: note must be a Uint8Array.");


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
            let expectedTxn = new transaction.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = encoding.encode(encRep);
            const decEncRep = encoding.decode(encTxn);
            let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
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
            let expectedTxn = new transaction.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = encoding.encode(encRep);
            const decEncRep = encoding.decode(encTxn);
            let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
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
            let expectedTxn = new transaction.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = encoding.encode(encRep);
            const decEncRep = encoding.decode(encTxn);
            let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('should correctly serialize and deserialize an asset configuration transaction from msgpack representation', function() {
            address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4"
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
            let expectedTxn = new transaction.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = encoding.encode(encRep);
            const decEncRep = encoding.decode(encTxn);
            let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('should correctly serialize and deserialize an asset creation transaction from msgpack representation', function() {
            address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4"
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
                "assetMetadataHash": "metadatahash",
                "assetManager": address,
                "assetReserve": address,
                "assetFreeze": address,
                "assetClawback": address,
                "type": "acfg"
            };
            let expectedTxn = new transaction.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = encoding.encode(encRep);
            const decEncRep = encoding.decode(encTxn);
            let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
            const reencRep = decTxn.get_obj_for_encoding();
            assert.deepStrictEqual(reencRep, encRep);
        });

        it('should correctly serialize and deserialize an asset transfer transaction from msgpack representation', function() {
            address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4"
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
            let expectedTxn = new transaction.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = encoding.encode(encRep);
            const decEncRep = encoding.decode(encTxn);
            let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
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

            let expectedTxn = new transaction.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = encoding.encode(encRep);
            const decEncRep = encoding.decode(encTxn);
            let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
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
            let expectedTxn = new transaction.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = encoding.encode(encRep);
            const decEncRep = encoding.decode(encTxn);
            let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
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
            let expectedTxn = new transaction.Transaction(o);
            let encRep = expectedTxn.get_obj_for_encoding();
            const encTxn = encoding.encode(encRep);
            const decEncRep = encoding.decode(encTxn);
            let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
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
            let tx = new transaction.Transaction(o);

            {
                let expectedTxg = new transaction.TxGroup([tx.rawTxID(), tx.rawTxID()])
                let encRep = expectedTxg.get_obj_for_encoding();
                const encTxg = encoding.encode(encRep);
                const decEncRep = encoding.decode(encTxg);
                let decTxg = transaction.TxGroup.from_obj_for_encoding(decEncRep);
                const reencRep = decTxg.get_obj_for_encoding();
                assert.deepStrictEqual(reencRep, encRep);
            }

            {
                let expectedTxn = tx;
                expectedTxn.group = tx.rawTxID();
                let encRep = expectedTxn.get_obj_for_encoding();
                const encTxn = encoding.encode(encRep);
                const decEncRep = encoding.decode(encTxn);
                let decTxn = transaction.Transaction.from_obj_for_encoding(decEncRep);
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
                "genesisID": genesisID
            };
            let expectedTxn = new transaction.Transaction(o);
            let actualTxn = algosdk.makePaymentTxn(from, to, fee, amount, closeRemainderTo, firstRound, lastRound, note, genesisHash, genesisID);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should be able to use helper to make a keyreg transaction', function() {
            let from = "XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU";
            let fee = 10;
            let firstRound = 51;
            let lastRound = 61;
            let note = new Uint8Array([123, 12, 200]);
            let genesisHash = "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=";
            let genesisID = "";
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
                "type": "keyreg"
            };
            let expectedTxn = new transaction.Transaction(o);
            let actualTxn = algosdk.makeKeyRegistrationTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });

        it('should be able to use helper to make an asset create transaction', function() {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let fee = 10;
            let defaultFrozen = false;
            let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
            let total = 100;
            let reserve = addr;
            let freeze = addr;
            let clawback = addr;
            let unitName = "tst";
            let assetName = "testcoin";
            let assetURL = "testURL";
            let assetMetadataHash = "testhash";
            let genesisID = "";
            let firstRound = 322575;
            let lastRound = 322575;
            let note = new Uint8Array([123, 12, 200]);
            let o = {
                "from": addr,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "note": note,
                "genesisHash": genesisHash,
                "assetTotal": total,
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
                "type": "acfg"
            };
            let expectedTxn = new transaction.Transaction(o);
            let actualTxn = algosdk.makeAssetCreateTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                total, defaultFrozen, addr, reserve, freeze, clawback, unitName, assetName, assetURL, assetMetadataHash);
            assert.deepStrictEqual(expectedTxn, actualTxn);
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
                "note": note
            };
            let expectedTxn = new transaction.Transaction(o);
            let actualTxn = algosdk.makeAssetConfigTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                assetIndex, manager, reserve, freeze, clawback);
            assert.deepStrictEqual(expectedTxn, actualTxn);
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
            let o = {
                "from": addr,
                "fee": fee,
                "firstRound": firstRound,
                "lastRound": lastRound,
                "genesisHash": genesisHash,
                "genesisID": genesisID,
                "assetIndex": assetIndex,
                "type": "acfg",
                "note": note
            };
            let expectedTxn = new transaction.Transaction(o);
            let actualTxn = algosdk.makeAssetDestroyTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                assetIndex);
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
                "closeRemainderTo": closeRemainderTo
            };
            let expectedTxn = new transaction.Transaction(o);
            let actualTxn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
                fee, amount, firstRound, lastRound, note, genesisHash, genesisID, assetIndex);
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
                "note": note
            };
            let expectedTxn = new transaction.Transaction(o);
            let actualTxn = algosdk.makeAssetFreezeTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
                assetIndex, freezeTarget, freezeState);
            assert.deepStrictEqual(expectedTxn, actualTxn);
        });
    });
});