let assert = require('assert');

let transaction = require("../src/transaction");
let encoding = require("../src/encoding/encoding");

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
                "creator": address,
                "index": 1234,
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
                "t": 1000,
                "df": true,
                "un": "tests",
                "an": "testcoin",
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
                "index": 1,
                "creator" : address,
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
});