const assert = require('assert');
const algosdk = require('../index');
const group = require('../src/group');

describe('Sign', () => {
  /* eslint-disable no-console */
  const originalLogFunction = console.log;
  let logs;

  beforeEach(() => {
    logs = '';

    // Mock console.log to suppress logs during tests
    console.log = (msg) => {
      logs += `${msg}\n`;
    };
  });

  afterEach(function Cleanup() {
    // Unmock console.log
    console.log = originalLogFunction;

    // Unsuppress logs if the test failed
    if (this.currentTest.state === 'failed') {
      console.log(logs);
    }
  });
  /* eslint-enable no-console */

  it('should not modify input arrays', () => {
    const appArgs = [Uint8Array.from([1, 2]), Uint8Array.from([3, 4])];
    const appAccounts = [
      '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
    ];
    const appForeignApps = [17, 200];
    const appForeignAssets = [7, 8, 9];
    const o = {
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      note: new Uint8Array(0),
      type: 'appl',
      appIndex: 5,
      appArgs,
      appAccounts,
      appForeignApps,
      appForeignAssets,
    };
    const txn = new algosdk.Transaction(o);
    assert.deepStrictEqual(appArgs, [
      Uint8Array.from([1, 2]),
      Uint8Array.from([3, 4]),
    ]);
    assert.deepStrictEqual(appAccounts, [
      '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
    ]);
    assert.deepStrictEqual(appForeignApps, [17, 200]);
    assert.deepStrictEqual(appForeignAssets, [7, 8, 9]);
    assert.ok(txn.appArgs !== appArgs);
    assert.ok(txn.appAccounts !== appAccounts);
    assert.ok(txn.appForeignApps !== appForeignApps);
    assert.ok(txn.appForeignAssets !== appForeignAssets);
  });

  it('should not complain on a missing note', () => {
    const o = {
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      note: new Uint8Array(0),
    };
    assert.doesNotThrow(() => new algosdk.Transaction(o));
  });

  it('should respect min tx fee', () => {
    const o = {
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 0,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      note: new Uint8Array([123, 12, 200]),
    };
    const txn = new algosdk.Transaction(o);
    assert.strictEqual(txn.fee, 1000); // 1000 is the v5 min txn fee
    const txnEnc = txn.get_obj_for_encoding();
    assert.strictEqual(txnEnc.fee, 1000);
  });

  it('should accept 0 fee', () => {
    const o = {
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 0,
      flatFee: true,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      note: new Uint8Array([123, 12, 200]),
    };
    const txn = new algosdk.Transaction(o);
    assert.equal(txn.fee, 0);
  });

  it('should accept lower than min fee', () => {
    const o = {
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      flatFee: true,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      note: new Uint8Array([123, 12, 200]),
    };
    const txn = new algosdk.Transaction(o);
    assert.equal(txn.fee, 10);
    const txnEnc = txn.get_obj_for_encoding();
    assert.equal(txnEnc.fee, 10);
  });

  it('should not complain on a missing genesisID', () => {
    const o = {
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      note: new Uint8Array([123, 12, 200]),
    };

    assert.doesNotThrow(() => new algosdk.Transaction(o));
  });

  it('should not complain on an empty genesisID', () => {
    const o = {
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      note: new Uint8Array([123, 12, 200]),
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      genesisID: '',
    };

    assert.doesNotThrow(() => new algosdk.Transaction(o));
  });

  it('should complain if note isnt Uint8Array', () => {
    const o = {
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      note: 'new Uint8Array(0)',
    };
    assert.throws(
      () => new algosdk.Transaction(o),
      (err) => err.toString() === 'Error: note must be a Uint8Array.'
    );
  });

  it('should not drop a note of all zeros', () => {
    const txnWithNote = new algosdk.Transaction({
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      note: new Uint8Array(32),
    });

    const txnWithoutNote = new algosdk.Transaction({
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
    });

    const serializedWithNote = algosdk.encodeUnsignedTransaction(txnWithNote);
    const serializedWithoutNote = algosdk.encodeUnsignedTransaction(
      txnWithoutNote
    );

    assert.notDeepStrictEqual(serializedWithNote, serializedWithoutNote);
  });

  it('should drop a lease of all zeros', () => {
    const txnWithLease = new algosdk.Transaction({
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      lease: new Uint8Array(32),
    });

    const txnWithoutLease = new algosdk.Transaction({
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
    });

    const serializedWithLease = algosdk.encodeUnsignedTransaction(txnWithLease);
    const serializedWithoutLease = algosdk.encodeUnsignedTransaction(
      txnWithoutLease
    );

    assert.deepStrictEqual(serializedWithLease, serializedWithoutLease);
  });

  it('should drop an assetMetadataHash of all zeros', () => {
    const address =
      'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';

    const txnWithHash = new algosdk.Transaction({
      from: address,
      fee: 10,
      firstRound: 322575,
      lastRound: 323575,
      genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
      assetIndex: 1234,
      assetManager: address,
      assetReserve: address,
      assetFreeze: address,
      assetClawback: address,
      type: 'acfg',
      assetMetadataHash: new Uint8Array(32),
    });

    const txnWithoutHash = new algosdk.Transaction({
      from: address,
      fee: 10,
      firstRound: 322575,
      lastRound: 323575,
      genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
      assetIndex: 1234,
      assetManager: address,
      assetReserve: address,
      assetFreeze: address,
      assetClawback: address,
      type: 'acfg',
    });

    const serializedWithHash = algosdk.encodeUnsignedTransaction(txnWithHash);
    const serializedWithoutHash = algosdk.encodeUnsignedTransaction(
      txnWithoutHash
    );

    assert.deepStrictEqual(serializedWithHash, serializedWithoutHash);
  });

  it('should be able to prettyprint and go toString without throwing', () => {
    const o = {
      from: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      fee: 10,
      amount: 847,
      firstRound: 51,
      lastRound: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      note: new Uint8Array(0),
    };
    const txn = new algosdk.Transaction(o);
    // assert package recommends just calling prettyPrint over using assert.doesNotThrow
    txn.prettyPrint(); // should not throw
    txn.toString(); // also should not throw
  });

  describe('should correctly serialize and deserialize from msgpack representation', () => {
    it('should correctly serialize and deserialize from msgpack representation', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        to: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        fee: 10,
        amount: 847,
        firstRound: 51,
        lastRound: 61,
        note: new Uint8Array([123, 12, 200]),
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: '',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize from msgpack representation with flat fee', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        to: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        fee: 2063,
        amount: 847,
        firstRound: 51,
        lastRound: 61,
        note: new Uint8Array([123, 12, 200]),
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: '',
        flatFee: true,
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize a state proof transaction from msgpack representation', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        fee: 10,
        firstRound: 51,
        lastRound: 61,
        note: new Uint8Array([123, 12, 200]),
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        voteKey: '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=',
        selectionKey: 'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=',
        voteFirst: 123,
        voteLast: 456,
        voteKeyDilution: 1234,
        genesisID: '',
        type: 'stpf',
        stateProofType: 0,
        stateProof: new Uint8Array([1, 1, 1, 1]),
        stateProofMessage: new Uint8Array([0, 0, 0, 0]),
      };
      const expectedTxn = new algosdk.Transaction(o);
      console.log(
        `${expectedTxn.stateProofType} ${expectedTxn.stateProofMessage} ${expectedTxn.stateProof} ${expectedTxn.type}`
      );
      const encRep = expectedTxn.get_obj_for_encoding();
      console.log(
        `${encRep.sptype} ${encRep.spmsg} ${encRep.sp} ${encRep.type}`
      );
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize a key registration transaction from msgpack representation', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        fee: 10,
        firstRound: 51,
        lastRound: 61,
        note: new Uint8Array([123, 12, 200]),
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        voteKey: '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=',
        selectionKey: 'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=',
        voteFirst: 123,
        voteLast: 456,
        voteKeyDilution: 1234,
        genesisID: '',
        type: 'keyreg',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an offline key registration transaction from msgpack representation', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        fee: 10,
        firstRound: 51,
        lastRound: 61,
        note: new Uint8Array([123, 12, 200]),
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: '',
        type: 'keyreg',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an offline key registration transaction from msgpack representation with explicit nonParticipation=false', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        fee: 10,
        firstRound: 51,
        lastRound: 61,
        note: new Uint8Array([123, 12, 200]),
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: '',
        nonParticipation: false,
        type: 'keyreg',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize a nonparticipating key registration transaction from msgpack representation', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        fee: 10,
        firstRound: 51,
        lastRound: 61,
        note: new Uint8Array([123, 12, 200]),
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        nonParticipation: true,
        genesisID: '',
        type: 'keyreg',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset configuration transaction from msgpack representation', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const o = {
        from: address,
        fee: 10,
        firstRound: 322575,
        lastRound: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetIndex: 1234,
        assetManager: address,
        assetReserve: address,
        assetFreeze: address,
        assetClawback: address,
        type: 'acfg',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset creation transaction from msgpack representation', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const o = {
        from: address,
        fee: 10,
        firstRound: 322575,
        lastRound: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetTotal: 1000,
        assetDefaultFrozen: true,
        assetUnitName: 'tests',
        assetName: 'testcoin',
        assetURL: 'testURL',
        assetMetadataHash: new Uint8Array(
          Buffer.from('ZkFDUE80blJnTzU1ajFuZEFLM1c2U2djNEFQa2N5Rmg=', 'base64')
        ),
        assetManager: address,
        assetReserve: address,
        assetFreeze: address,
        assetClawback: address,
        type: 'acfg',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset transfer transaction from msgpack representation', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const o = {
        type: 'axfer',
        from: address,
        to: address,
        amount: 100,
        fee: 10,
        firstRound: 322575,
        lastRound: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetIndex: 1234,
        assetRevocationTarget: address,
        closeRemainderTo: address,
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an application create transaction from msgpack representation', () => {
      const expectedTxn = algosdk.makeApplicationCreateTxnFromObject({
        from: 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4',
        approvalProgram: Uint8Array.from([1, 32, 1, 1, 34]),
        clearProgram: Uint8Array.from([2, 32, 1, 1, 34]),
        numGlobalInts: 1,
        numGlobalByteSlices: 2,
        numLocalInts: 3,
        numLocalByteSlices: 4,
        onComplete: algosdk.OnApplicationComplete.OptInOC,
        accounts: [
          'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        ],
        appArgs: [Uint8Array.from([0]), Uint8Array.from([1, 2])],
        extraPages: 2,
        foreignApps: [3, 4],
        foreignAssets: [5, 6],
        lease: Uint8Array.from(new Array(32).fill(7)),
        note: new Uint8Array(Buffer.from('note value')),
        rekeyTo: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        suggestedParams: {
          fee: 0,
          firstRound: 322575,
          lastRound: 323575,
          genesisID: 'testnet-v1.0',
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        },
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset freeze transaction from msgpack representation', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const o = {
        from: address,
        fee: 10,
        firstRound: 322575,
        lastRound: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        type: 'afrz',
        freezeAccount: address,
        assetIndex: 1,
        freezeState: true,
      };

      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize a first round of 0', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const o = {
        from: address,
        fee: 10,
        firstRound: 0,
        lastRound: 1000,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        type: 'afrz',
        freezeAccount: address,
        assetIndex: 1,
        freezeState: true,
      };

      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('reserializes correctly no genesis ID', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        to: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        fee: 10,
        amount: 847,
        firstRound: 51,
        lastRound: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        note: new Uint8Array([123, 12, 200]),
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('reserializes correctly zero amount', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        to: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        fee: 10,
        amount: 0,
        firstRound: 51,
        lastRound: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        note: new Uint8Array([123, 12, 200]),
      };
      const expectedTxn = new algosdk.Transaction(o);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize group object', () => {
      const o = {
        from: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        to: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        fee: 10,
        amount: 0,
        firstRound: 51,
        lastRound: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        note: new Uint8Array([123, 12, 200]),
      };
      const tx = new algosdk.Transaction(o);

      {
        const expectedTxg = new group.TxGroup([tx.rawTxID(), tx.rawTxID()]);
        const encRep = expectedTxg.get_obj_for_encoding();
        const encTxg = algosdk.encodeObj(encRep);
        const decEncRep = algosdk.decodeObj(encTxg);
        const decTxg = group.TxGroup.from_obj_for_encoding(decEncRep);
        const reencRep = decTxg.get_obj_for_encoding();
        assert.deepStrictEqual(reencRep, encRep);
      }

      {
        const expectedTxn = tx;
        expectedTxn.group = tx.rawTxID();
        const encRep = expectedTxn.get_obj_for_encoding();
        const encTxn = algosdk.encodeObj(encRep);
        const decEncRep = algosdk.decodeObj(encTxn);
        const decTxn = algosdk.Transaction.from_obj_for_encoding(decEncRep);
        const reencRep = decTxn.get_obj_for_encoding();
        assert.deepStrictEqual(reencRep, encRep);
      }
    });
  });

  describe('transaction making functions', () => {
    it('should be able to use helper to make a payment transaction', () => {
      const from = 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const to = 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM';
      const fee = 10;
      const amount = 847;
      const firstRound = 51;
      const lastRound = 61;
      const note = new Uint8Array([123, 12, 200]);
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const genesisID = '';
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      let closeRemainderTo;
      const o = {
        from,
        to,
        fee,
        amount,
        closeRemainderTo,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        reKeyTo: rekeyTo,
      };
      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makePaymentTxn(
        from,
        to,
        fee,
        amount,
        closeRemainderTo,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should be able to use helper to make a payment transaction with BigInt amount', () => {
      const from = 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const to = 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM';
      const fee = 10;
      const amount = 0xffffffffffffffffn;
      const firstRound = 51;
      const lastRound = 61;
      const note = new Uint8Array([123, 12, 200]);
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const genesisID = '';
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      let closeRemainderTo;
      const o = {
        from,
        to,
        fee,
        amount,
        closeRemainderTo,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        reKeyTo: rekeyTo,
      };
      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makePaymentTxn(
        from,
        to,
        fee,
        amount,
        closeRemainderTo,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should throw if payment amount is too large', () => {
      const from = 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const to = 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM';
      const fee = 10;
      const amount = 0x10000000000000000n;
      const firstRound = 51;
      const lastRound = 61;
      const note = new Uint8Array([123, 12, 200]);
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const genesisID = '';
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      let closeRemainderTo;
      const o = {
        from,
        to,
        fee,
        amount,
        closeRemainderTo,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        reKeyTo: rekeyTo,
      };
      assert.throws(
        () => new algosdk.Transaction(o),
        new Error(
          'Amount must be a positive number and smaller than 2^64-1. If the number is larger than 2^53-1, use bigint.'
        )
      );
    });

    it('should be able to use helper to make a keyreg transaction', () => {
      const from = 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const fee = 10;
      const firstRound = 51;
      const lastRound = 61;
      const note = new Uint8Array([123, 12, 200]);
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const genesisID = '';
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const voteKey = '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=';
      const selectionKey = 'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=';
      const voteKeyDilution = 1234;
      const voteFirst = 123;
      const voteLast = 456;
      const o = {
        from,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        voteKey,
        selectionKey,
        voteFirst,
        voteLast,
        voteKeyDilution,
        genesisID,
        reKeyTo: rekeyTo,
        type: 'keyreg',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makeKeyRegistrationTxn(
        from,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        voteKey,
        selectionKey,
        voteFirst,
        voteLast,
        voteKeyDilution,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should be able to use helper to make an offline keyreg transaction', () => {
      const from = 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const fee = 10;
      const firstRound = 51;
      const lastRound = 61;
      const note = new Uint8Array([123, 12, 200]);
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const genesisID = '';
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const voteKey = undefined;
      const selectionKey = undefined;
      const voteKeyDilution = undefined;
      const voteFirst = undefined;
      const voteLast = undefined;
      const o = {
        from,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        voteKey,
        selectionKey,
        voteFirst,
        voteLast,
        voteKeyDilution,
        genesisID,
        reKeyTo: rekeyTo,
        type: 'keyreg',
        nonParticipation: false,
      };

      assert.throws(
        () =>
          new algosdk.Transaction({
            ...o,
            voteKey: '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=',
          }),
        new Error(
          'online key registration missing at least one of the following fields: ' +
            'voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution'
        )
      );

      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makeKeyRegistrationTxn(
        from,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        voteKey,
        selectionKey,
        voteFirst,
        voteLast,
        voteKeyDilution,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should be able to use helper to make a nonparticipating keyreg transaction', () => {
      const from = 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const fee = 10;
      const firstRound = 51;
      const lastRound = 61;
      const note = new Uint8Array([123, 12, 200]);
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const genesisID = '';
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const voteKey = '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=';
      const selectionKey = 'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=';
      const voteKeyDilution = 1234;
      const voteFirst = 123;
      const voteLast = 456;
      const nonParticipation = true;
      const o = {
        from,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        nonParticipation,
        genesisID,
        reKeyTo: rekeyTo,
        type: 'keyreg',
      };

      assert.throws(
        () =>
          new algosdk.Transaction({
            ...o,
            voteKey,
            selectionKey,
            voteFirst,
            voteLast,
            voteKeyDilution,
          }),
        new Error(
          'nonParticipation is true but participation params are present.'
        )
      );

      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makeKeyRegistrationTxn(
        from,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        rekeyTo,
        nonParticipation
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should be able to use helper to make an asset create transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const fee = 10;
      const defaultFrozen = false;
      const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
      const total = 100;
      const decimals = 0;
      const reserve = addr;
      const freeze = addr;
      const clawback = addr;
      const unitName = 'tst';
      const assetName = 'testcoin';
      const assetURL = 'testURL';
      const assetMetadataHash = new Uint8Array(
        Buffer.from('dGVzdGhhc2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', 'base64')
      );
      const genesisID = '';
      const firstRound = 322575;
      const lastRound = 322575;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const o = {
        from: addr,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        assetTotal: total,
        assetDecimals: decimals,
        assetDefaultFrozen: defaultFrozen,
        assetUnitName: unitName,
        assetName,
        assetURL,
        assetMetadataHash,
        assetManager: addr,
        assetReserve: reserve,
        assetFreeze: freeze,
        assetClawback: clawback,
        genesisID,
        reKeyTo: rekeyTo,
        type: 'acfg',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makeAssetCreateTxn(
        addr,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        total,
        decimals,
        defaultFrozen,
        addr,
        reserve,
        freeze,
        clawback,
        unitName,
        assetName,
        assetURL,
        assetMetadataHash,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should be able to use helper to make an asset create transaction with BigInt total', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const fee = 10;
      const defaultFrozen = false;
      const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
      const total = 0xffffffffffffffffn;
      const decimals = 0;
      const reserve = addr;
      const freeze = addr;
      const clawback = addr;
      const unitName = 'tst';
      const assetName = 'testcoin';
      const assetURL = 'testURL';
      const assetMetadataHash = new Uint8Array(
        Buffer.from('dGVzdGhhc2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', 'base64')
      );
      const genesisID = '';
      const firstRound = 322575;
      const lastRound = 322575;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const o = {
        from: addr,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        assetTotal: total,
        assetDecimals: decimals,
        assetDefaultFrozen: defaultFrozen,
        assetUnitName: unitName,
        assetName,
        assetURL,
        assetMetadataHash,
        assetManager: addr,
        assetReserve: reserve,
        assetFreeze: freeze,
        assetClawback: clawback,
        genesisID,
        reKeyTo: rekeyTo,
        type: 'acfg',
      };
      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makeAssetCreateTxn(
        addr,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        total,
        decimals,
        defaultFrozen,
        addr,
        reserve,
        freeze,
        clawback,
        unitName,
        assetName,
        assetURL,
        assetMetadataHash,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should throw if asset creation total is too large', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const fee = 10;
      const defaultFrozen = false;
      const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
      const total = 0x10000000000000000n;
      const decimals = 0;
      const reserve = addr;
      const freeze = addr;
      const clawback = addr;
      const unitName = 'tst';
      const assetName = 'testcoin';
      const assetURL = 'testURL';
      const assetMetadataHash = new Uint8Array(
        Buffer.from('dGVzdGhhc2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', 'base64')
      );
      const genesisID = '';
      const firstRound = 322575;
      const lastRound = 322575;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const o = {
        from: addr,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        assetTotal: total,
        assetDecimals: decimals,
        assetDefaultFrozen: defaultFrozen,
        assetUnitName: unitName,
        assetName,
        assetURL,
        assetMetadataHash,
        assetManager: addr,
        assetReserve: reserve,
        assetFreeze: freeze,
        assetClawback: clawback,
        genesisID,
        reKeyTo: rekeyTo,
        type: 'acfg',
      };
      assert.throws(
        () => new algosdk.Transaction(o),
        new Error(
          'Total asset issuance must be a positive number and smaller than 2^64-1. If the number is larger than 2^53-1, use bigint.'
        )
      );
    });

    it('should fail to make an asset create transaction with an invalid assetMetadataHash', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const fee = 10;
      const defaultFrozen = false;
      const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
      const total = 100;
      const decimals = 0;
      const reserve = addr;
      const freeze = addr;
      const clawback = addr;
      const unitName = 'tst';
      const assetName = 'testcoin';
      const assetURL = 'testURL';
      const genesisID = '';
      const firstRound = 322575;
      const lastRound = 322575;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const txnTemplate = {
        from: addr,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        assetTotal: total,
        assetDecimals: decimals,
        assetDefaultFrozen: defaultFrozen,
        assetUnitName: unitName,
        assetName,
        assetURL,
        assetManager: addr,
        assetReserve: reserve,
        assetFreeze: freeze,
        assetClawback: clawback,
        genesisID,
        reKeyTo: rekeyTo,
        type: 'acfg',
      };
      assert.doesNotThrow(() => {
        const txnParams = {
          assetMetadataHash: '',
          ...txnTemplate,
        };
        return new algosdk.Transaction(txnParams);
      });
      assert.throws(() => {
        const txnParams = {
          assetMetadataHash: 'abc',
          ...txnTemplate,
        };
        return new algosdk.Transaction(txnParams);
      });
      assert.doesNotThrow(() => {
        const txnParams = {
          assetMetadataHash: 'fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh',
          ...txnTemplate,
        };
        return new algosdk.Transaction(txnParams);
      });
      assert.throws(() => {
        const txnParams = {
          assetMetadataHash: 'fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh1',
          ...txnTemplate,
        };
        return new algosdk.Transaction(txnParams);
      });
      assert.doesNotThrow(() => {
        const txnParams = {
          assetMetadataHash: new Uint8Array(0),
          ...txnTemplate,
        };
        return new algosdk.Transaction(txnParams);
      });
      assert.throws(() => {
        const txnParams = {
          assetMetadataHash: new Uint8Array([1, 2, 3]),
          ...txnTemplate,
        };
        return new algosdk.Transaction(txnParams);
      });
      assert.doesNotThrow(() => {
        const txnParams = {
          assetMetadataHash: new Uint8Array(32),
          ...txnTemplate,
        };
        return new algosdk.Transaction(txnParams);
      });
      assert.throws(() => {
        const txnParams = {
          assetMetadataHash: new Uint8Array(33),
          ...txnTemplate,
        };
        return new algosdk.Transaction(txnParams);
      });
    });

    it('should be able to use helper to make an asset config transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const fee = 10;
      const assetIndex = 1234;
      const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
      const manager = addr;
      const reserve = addr;
      const freeze = addr;
      const clawback = addr;
      const genesisID = '';
      const firstRound = 322575;
      const lastRound = 322575;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const o = {
        from: addr,
        fee,
        firstRound,
        lastRound,
        genesisHash,
        genesisID,
        assetIndex,
        assetManager: manager,
        assetReserve: reserve,
        assetFreeze: freeze,
        assetClawback: clawback,
        type: 'acfg',
        note,
        reKeyTo: rekeyTo,
      };
      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makeAssetConfigTxn(
        addr,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        assetIndex,
        manager,
        reserve,
        freeze,
        clawback,
        true,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should throw when disobeying strict address checking in make asset config', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const fee = 10;
      const assetIndex = 1234;
      const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
      const manager = addr;
      let reserve;
      let freeze;
      const clawback = addr;
      const genesisID = '';
      const firstRound = 322575;
      const lastRound = 322575;
      const note = new Uint8Array([123, 12, 200]);
      let threw = false;
      try {
        algosdk.makeAssetConfigTxn(
          addr,
          fee,
          firstRound,
          lastRound,
          note,
          genesisHash,
          genesisID,
          assetIndex,
          manager,
          reserve,
          freeze,
          clawback
        );
      } catch {
        threw = true;
      }
      assert.deepStrictEqual(true, threw);
    });

    it('should be able to use helper to make an asset destroy transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const fee = 10;
      const assetIndex = 1234;
      const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
      const genesisID = '';
      const firstRound = 322575;
      const lastRound = 322575;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const o = {
        from: addr,
        fee,
        firstRound,
        lastRound,
        genesisHash,
        genesisID,
        assetIndex,
        type: 'acfg',
        note,
        reKeyTo: rekeyTo,
      };
      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makeAssetDestroyTxn(
        addr,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        assetIndex,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should be able to use helper to make an asset transfer transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const fee = 10;
      const sender = addr;
      const recipient = addr;
      const revocationTarget = addr;
      const closeRemainderTo = addr;
      const assetIndex = 1234;
      const amount = 100;
      const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
      const genesisID = '';
      const firstRound = 322575;
      const lastRound = 322575;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const o = {
        type: 'axfer',
        from: sender,
        to: recipient,
        amount,
        fee,
        firstRound,
        lastRound,
        genesisHash,
        genesisID,
        assetIndex,
        note,
        assetRevocationTarget: revocationTarget,
        closeRemainderTo,
        reKeyTo: rekeyTo,
      };
      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makeAssetTransferTxn(
        sender,
        recipient,
        closeRemainderTo,
        revocationTarget,
        fee,
        amount,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        assetIndex,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should be able to use helper to make an asset freeze transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const fee = 10;
      const assetIndex = 1234;
      const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
      const freezeTarget = addr;
      const genesisID = '';
      const firstRound = 322575;
      const lastRound = 322575;
      const freezeState = true;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const o = {
        from: addr,
        fee,
        firstRound,
        lastRound,
        genesisHash,
        type: 'afrz',
        freezeAccount: freezeTarget,
        assetIndex,
        freezeState,
        note,
        genesisID,
        reKeyTo: rekeyTo,
      };
      const expectedTxn = new algosdk.Transaction(o);
      const actualTxn = algosdk.makeAssetFreezeTxn(
        addr,
        fee,
        firstRound,
        lastRound,
        note,
        genesisHash,
        genesisID,
        assetIndex,
        freezeTarget,
        freezeState,
        rekeyTo
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });
    it('should be able to use helper to assign group ID to mixed Transaction and Dict', () => {
      const suggestedParams = {
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        genesisID: '',
        firstRound: 322575,
        lastRound: 322575 + 1000,
        fee: 1000,
        flatFee: true,
      };

      const helperTx = algosdk.makePaymentTxnWithSuggestedParams(
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM',
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM',
        1000,
        undefined,
        new Uint8Array(0),
        suggestedParams
      );

      const dictTx = {
        from: 'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM',
        to: 'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM',
        fee: 1000,
        flatFee: true,
        amount: 0,
        firstRound: 322575,
        lastRound: 322575 + 1000,
        genesisID: '',
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        type: 'pay',
      };

      // Store both transactions
      const txns = [helperTx, dictTx];

      // Group both transactions
      const txgroup = algosdk.assignGroupID(txns);

      assert.deepStrictEqual(txgroup[0].group, txgroup[1].group);
    });
  });
});
