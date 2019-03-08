let assert = require('assert');
let transaction = require("../src/transaction");

describe('Sign', function () {
    it('should not complain on a missing note', function () {
        let o = {
            "from": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "fee": 10,
            "amount": 847,
            "firstRound": 51,
            "lastRound": 61,
            "note": new Uint8Array(0)
        };

        let txn = new transaction.Transaction(o);

    });

    it('should not complain on a missing genesisID', function () {
        let o = {
            "from": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
            "fee": 10,
            "amount": 847,
            "firstRound": 51,
            "lastRound": 61,
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
            "note": "new Uint8Array(0)"
        };
        assert.throws(() => {
            let txn = new transaction.Transaction(o);
        }, (err) => err.toString() === "Error: note must be a Uint8Array.");


    });

});