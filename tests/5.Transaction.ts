/* eslint-env mocha */
import assert from 'assert';
import algosdk from '../src/index.js';
import { translateBoxReferences } from '../src/boxStorage.js';

describe('Sign', () => {
  it('should not modify input arrays', () => {
    const appArgs = [Uint8Array.from([1, 2]), Uint8Array.from([3, 4])];
    const accounts = [
      '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
    ];
    const foreignApps = [17, 200];
    const foreignAssets = [7, 8, 9];
    const boxes = [{ appIndex: 0, name: Uint8Array.from([0]) }];
    const txn = new algosdk.Transaction({
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      note: new Uint8Array(0),
      type: algosdk.TransactionType.appl,
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
      appCallParams: {
        appId: 5,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs,
        accounts,
        foreignApps,
        foreignAssets,
        boxes,
      },
    });
    assert.deepStrictEqual(appArgs, [
      Uint8Array.from([1, 2]),
      Uint8Array.from([3, 4]),
    ]);
    assert.deepStrictEqual(accounts, [
      '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
    ]);
    assert.deepStrictEqual(foreignApps, [17, 200]);
    assert.deepStrictEqual(foreignAssets, [7, 8, 9]);
    assert.ok(txn.applicationCall);
    assert.ok(txn.applicationCall.appArgs !== appArgs);
    assert.ok((txn.applicationCall.appAccounts as any) !== accounts);
    assert.ok((txn.applicationCall.appForeignApps as any) !== foreignApps);
    assert.ok((txn.applicationCall.appForeignAssets as any) !== foreignAssets);
    assert.ok((txn.applicationCall.boxes as any) !== boxes);
  });

  it('should not complain on a missing note', () => {
    for (const note of [undefined, new Uint8Array()]) {
      const txn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        paymentParams: {
          receiver:
            '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
          amount: 847,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note,
      });
      assert.deepStrictEqual(txn.note, new Uint8Array());
    }
  });

  it('should respect min tx fee', () => {
    for (const minFee of [1000n, 1001n]) {
      const params: algosdk.TransactionParams = {
        type: algosdk.TransactionType.pay,
        sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        paymentParams: {
          receiver:
            '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
          amount: 847,
        },
        suggestedParams: {
          minFee,
          fee: 0,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
      };
      const zeroFee = new algosdk.Transaction(params);
      assert.strictEqual(zeroFee.fee, minFee);
      const encZeroFee = zeroFee.get_obj_for_encoding();
      assert.strictEqual(encZeroFee.fee, minFee);

      params.suggestedParams.fee = minFee; // since this is fee per byte, it will be far greater than minFee
      const excessFee = new algosdk.Transaction(params);
      assert.ok(excessFee.fee > minFee);
      const encExcessFee = excessFee.get_obj_for_encoding();
      assert.strictEqual(encExcessFee.fee, excessFee.fee);
    }
  });

  it('should accept 0 fee', () => {
    const txn = new algosdk.Transaction({
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 847,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 0,
        flatFee: true,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
    });
    assert.strictEqual(txn.fee, 0n);
    const encTxn = txn.get_obj_for_encoding();
    assert.strictEqual(encTxn.fee, undefined); // Should be omitted from encoding
  });

  it('should accept lower than min fee', () => {
    const txn = new algosdk.Transaction({
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 847,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        flatFee: true,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
      note: new Uint8Array([123, 12, 200]),
    });
    assert.strictEqual(txn.fee, 10n);
    const txnEnc = txn.get_obj_for_encoding();
    assert.strictEqual(txnEnc.fee, 10n);
  });

  it('should not complain on a missing genesisID', () => {
    const o: algosdk.TransactionParams = {
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 847,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      },
      note: new Uint8Array([123, 12, 200]),
    };

    assert.doesNotThrow(() => new algosdk.Transaction(o));
  });

  it('should not complain on an empty genesisID', () => {
    const o: algosdk.TransactionParams = {
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 847,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: '',
      },
      note: new Uint8Array([123, 12, 200]),
    };

    assert.doesNotThrow(() => new algosdk.Transaction(o));
  });

  it('should complain if note is not Uint8Array', () => {
    const o: algosdk.TransactionParams = {
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 847,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
      note: 'abcdefg' as any,
    };
    assert.throws(
      () => new algosdk.Transaction(o),
      new Error('Not a Uint8Array: abcdefg')
    );
  });

  it('should not drop a note of all zeros', () => {
    const txnWithNote = new algosdk.Transaction({
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 847,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
      note: new Uint8Array(32),
    });

    const txnWithoutNote = new algosdk.Transaction({
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 847,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
    });

    const serializedWithNote = algosdk.encodeUnsignedTransaction(txnWithNote);
    const serializedWithoutNote =
      algosdk.encodeUnsignedTransaction(txnWithoutNote);

    assert.notDeepStrictEqual(serializedWithNote, serializedWithoutNote);
  });

  it('should drop a lease of all zeros', () => {
    const txnWithLease = new algosdk.Transaction({
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 847,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
      lease: new Uint8Array(32),
    });

    const txnWithoutLease = new algosdk.Transaction({
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 847,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
      lease: new Uint8Array(32),
    });

    const serializedWithLease = algosdk.encodeUnsignedTransaction(txnWithLease);
    const serializedWithoutLease =
      algosdk.encodeUnsignedTransaction(txnWithoutLease);

    assert.deepStrictEqual(serializedWithLease, serializedWithoutLease);
  });

  it('should drop an assetMetadataHash of all zeros', () => {
    const address =
      'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';

    const txnWithHash = new algosdk.Transaction({
      type: algosdk.TransactionType.acfg,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      assetConfigParams: {
        assetIndex: 1234,
        manager: address,
        reserve: address,
        freeze: address,
        clawback: address,
        assetMetadataHash: new Uint8Array(32),
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
    });

    const txnWithoutHash = new algosdk.Transaction({
      type: algosdk.TransactionType.acfg,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      assetConfigParams: {
        assetIndex: 1234,
        manager: address,
        reserve: address,
        freeze: address,
        clawback: address,
      },
      suggestedParams: {
        minFee: 1000,
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'mock-network',
      },
    });

    const serializedWithHash = algosdk.encodeUnsignedTransaction(txnWithHash);
    const serializedWithoutHash =
      algosdk.encodeUnsignedTransaction(txnWithoutHash);

    assert.deepStrictEqual(serializedWithHash, serializedWithoutHash);
  });

  it('should error when the zero address is used for an optional field', () => {
    const sender = 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
    const suggestedParams: algosdk.SuggestedParams = {
      minFee: 1000,
      fee: 10,
      firstValid: 51,
      lastValid: 61,
      genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
      genesisID: 'mock-network',
    };

    const expectedError = new Error(
      'Invalid use of the zero address. To omit this value, pass in undefined'
    );

    assert.throws(
      () =>
        new algosdk.Transaction({
          type: algosdk.TransactionType.pay,
          sender,
          paymentParams: {
            receiver: sender,
            amount: 0,
          },
          rekeyTo: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
          suggestedParams,
        }),
      expectedError
    );

    assert.throws(
      () =>
        new algosdk.Transaction({
          type: algosdk.TransactionType.pay,
          sender,
          paymentParams: {
            receiver: sender,
            amount: 0,
            closeRemainderTo: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
          },
          suggestedParams,
        }),
      expectedError
    );

    assert.throws(
      () =>
        new algosdk.Transaction({
          type: algosdk.TransactionType.axfer,
          sender,
          assetTransferParams: {
            assetIndex: 9999,
            receiver: sender,
            amount: 0,
            closeRemainderTo: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
          },
          suggestedParams,
        }),
      expectedError
    );

    assert.throws(
      () =>
        new algosdk.Transaction({
          type: algosdk.TransactionType.axfer,
          sender,
          assetTransferParams: {
            assetIndex: 9999,
            receiver: sender,
            amount: 0,
            assetSender: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
          },
          suggestedParams,
        }),
      expectedError
    );

    assert.throws(
      () =>
        new algosdk.Transaction({
          type: algosdk.TransactionType.acfg,
          sender,
          assetConfigParams: {
            assetIndex: 9999,
            manager: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
            reserve: sender,
            freeze: sender,
            clawback: sender,
          },
          suggestedParams,
        }),
      expectedError
    );

    assert.throws(
      () =>
        new algosdk.Transaction({
          type: algosdk.TransactionType.acfg,
          sender,
          assetConfigParams: {
            assetIndex: 9999,
            manager: sender,
            reserve: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
            freeze: sender,
            clawback: sender,
          },
          suggestedParams,
        }),
      expectedError
    );

    assert.throws(
      () =>
        new algosdk.Transaction({
          type: algosdk.TransactionType.acfg,
          sender,
          assetConfigParams: {
            assetIndex: 9999,
            manager: sender,
            reserve: sender,
            freeze: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
            clawback: sender,
          },
          suggestedParams,
        }),
      expectedError
    );

    assert.throws(
      () =>
        new algosdk.Transaction({
          type: algosdk.TransactionType.acfg,
          sender,
          assetConfigParams: {
            assetIndex: 9999,
            manager: sender,
            reserve: sender,
            freeze: sender,
            clawback: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
          },
          suggestedParams,
        }),
      expectedError
    );
  });

  describe('should correctly serialize and deserialize from msgpack representation', () => {
    it('should correctly serialize and deserialize from msgpack representation', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        paymentParams: {
          receiver:
            'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
          amount: 847,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize from msgpack representation with flat fee', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        paymentParams: {
          receiver:
            'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
          amount: 847,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 2063,
          flatFee: true,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize a state proof transaction from msgpack representation', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.stpf,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        stateProofParams: {
          stateProofType: 0,
          stateProof: new Uint8Array([1, 1, 1, 1]),
          stateProofMessage: new Uint8Array([0, 0, 0, 0]),
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      // console.log(
      //   `${expectedTxn.stateProofType} ${expectedTxn.stateProofMessage} ${expectedTxn.stateProof} ${expectedTxn.type}`
      // );
      const encRep = expectedTxn.get_obj_for_encoding();
      // console.log(
      //   `${encRep.sptype} ${encRep.spmsg} ${encRep.sp} ${encRep.type}`
      // );
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize a key registration transaction from msgpack representation', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.keyreg,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        keyregParams: {
          voteKey: algosdk.base64ToBytes(
            '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE='
          ),
          selectionKey: algosdk.base64ToBytes(
            'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4='
          ),
          stateProofKey: algosdk.base64ToBytes(
            'mgh7ddGf7dF1Z5/9RDzN/JZZF9yA7XYCKJXvqhwPdvI7pLKh7hizaM5rTC2kizVOpVRIU9PXSLeapvBJ/OxQYA=='
          ),
          voteFirst: 123,
          voteLast: 456,
          voteKeyDilution: 1234,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an offline key registration transaction from msgpack representation', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.keyreg,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        keyregParams: {},
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an offline key registration transaction from msgpack representation with explicit nonParticipation=false', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.keyreg,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        keyregParams: {
          nonParticipation: false,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize a nonparticipating key registration transaction from msgpack representation', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.keyreg,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        keyregParams: {
          nonParticipation: true,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset configuration transaction from msgpack representation', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.acfg,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        assetConfigParams: {
          assetIndex: 1234,
          manager: address,
          reserve: address,
          freeze: address,
          clawback: address,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 322575,
          lastValid: 323575,
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset creation transaction from msgpack representation', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.acfg,
        sender: address,
        assetConfigParams: {
          manager: address,
          reserve: address,
          freeze: address,
          clawback: address,
          total: 2n ** 64n - 1n,
          decimals: 5,
          defaultFrozen: true,
          unitName: 'tests',
          assetName: 'testcoin',
          assetURL: 'https://example.com',
          assetMetadataHash: algosdk.base64ToBytes(
            'ZkFDUE80blJnTzU1ajFuZEFLM1c2U2djNEFQa2N5Rmg='
          ),
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 322575,
          lastValid: 323575,
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset transfer transaction from msgpack representation', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.axfer,
        sender: address,
        assetTransferParams: {
          assetIndex: 1234,
          receiver: address,
          amount: 100,
          closeRemainderTo: address,
          assetSender: address,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 322575,
          lastValid: 323575,
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an application create transaction from msgpack representation', () => {
      const expectedTxn = algosdk.makeApplicationCreateTxnFromObject({
        sender: 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4',
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
        boxes: [{ appIndex: 0, name: Uint8Array.from([0]) }],
        lease: Uint8Array.from(new Array(32).fill(7)),
        note: new TextEncoder().encode('note value'),
        rekeyTo: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        suggestedParams: {
          minFee: 1000,
          fee: 0,
          firstValid: 322575,
          lastValid: 323575,
          genesisID: 'testnet-v1.0',
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        },
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset freeze transaction from msgpack representation', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.afrz,
        sender: address,
        assetFreezeParams: {
          assetIndex: 1,
          assetFrozen: true,
          freezeTarget: address,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 322575,
          lastValid: 323575,
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize a payment transaction when the receiver is the zero address', () => {
      const txn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        paymentParams: {
          receiver: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
          amount: 847,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 1,
          lastValid: 1001,
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = txn.get_obj_for_encoding();
      assert.strictEqual(encRep.rcv, undefined);
      const encTxn = algosdk.encodeObj(encRep);

      const golden = algosdk.base64ToBytes(
        'iaNhbXTNA0+jZmVlzQgqomZ2AaNnZW6sbW9jay1uZXR3b3JromdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds0D6aRub3RlxAN7DMijc25kxCCgiappIuO5mPrf9s1ICN354CHklE44nqPVxjh4ZokZfqR0eXBlo3BheQ=='
      );
      assert.deepStrictEqual(encTxn, golden);

      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, txn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset transfer transaction when the receiver is the zero address', () => {
      const txn = new algosdk.Transaction({
        type: algosdk.TransactionType.axfer,
        sender: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        assetTransferParams: {
          assetIndex: 9999,
          receiver: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
          amount: 847,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 1,
          lastValid: 1001,
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = txn.get_obj_for_encoding();
      assert.strictEqual(encRep.arcv, undefined);
      const encTxn = algosdk.encodeObj(encRep);

      const golden = algosdk.base64ToBytes(
        'iqRhYW10zQNPo2ZlZc0ImKJmdgGjZ2VurG1vY2stbmV0d29ya6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbNA+mkbm90ZcQDewzIo3NuZMQgoImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX6kdHlwZaVheGZlcqR4YWlkzScP'
      );
      assert.deepStrictEqual(encTxn, golden);

      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, txn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset freeze transaction when the freeze account is the zero address', () => {
      const txn = new algosdk.Transaction({
        type: algosdk.TransactionType.afrz,
        sender: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        assetFreezeParams: {
          assetIndex: 9999,
          freezeTarget: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
          assetFrozen: true,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 1,
          lastValid: 1001,
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = txn.get_obj_for_encoding();
      assert.strictEqual(encRep.fadd, undefined);
      const encTxn = algosdk.encodeObj(encRep);

      const golden = algosdk.base64ToBytes(
        'iqRhZnJ6w6RmYWlkzScPo2ZlZc0IeqJmdgGjZ2VurG1vY2stbmV0d29ya6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbNA+mkbm90ZcQDewzIo3NuZMQgoImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX6kdHlwZaRhZnJ6'
      );
      assert.deepStrictEqual(encTxn, golden);

      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, txn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize a first round of 0', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.afrz,
        sender: address,
        assetFreezeParams: {
          assetIndex: 1,
          assetFrozen: true,
          freezeTarget: address,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 0,
          lastValid: 1000,
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize when the sender is the zero address', () => {
      const txn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
        paymentParams: {
          receiver:
            'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
          amount: 847,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 1,
          lastValid: 1001,
          genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = txn.get_obj_for_encoding();
      assert.strictEqual(encRep.snd, undefined);
      const encTxn = algosdk.encodeObj(encRep);

      const golden = algosdk.base64ToBytes(
        'iaNhbXTNA0+jZmVlzQgqomZ2AaNnZW6sbW9jay1uZXR3b3JromdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds0D6aRub3RlxAN7DMijcmN2xCCgiappIuO5mPrf9s1ICN354CHklE44nqPVxjh4ZokZfqR0eXBlo3BheQ=='
      );
      assert.deepStrictEqual(encTxn, golden);

      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, txn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('reserializes correctly no genesis ID', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        paymentParams: {
          receiver:
            'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
          amount: 847,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('reserializes correctly zero amount', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        paymentParams: {
          receiver:
            'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
          amount: 0,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize group object', () => {
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        paymentParams: {
          receiver:
            'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
          amount: 847,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });

      expectedTxn.group = algosdk.computeGroupID([expectedTxn]);
      const encRep = expectedTxn.get_obj_for_encoding();
      const encTxn = algosdk.encodeObj(encRep);
      const decEncRep = algosdk.decodeObj(encTxn);
      const decTxn = algosdk.Transaction.from_obj_for_encoding(
        decEncRep as algosdk.EncodedTransaction
      );
      assert.deepStrictEqual(decTxn, expectedTxn);
      const reencRep = decTxn.get_obj_for_encoding();
      assert.deepStrictEqual(reencRep, encRep);
    });
  });

  describe('transaction making functions', () => {
    it('should be able to use helper to make a payment transaction', () => {
      const sender =
        'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const receiver =
        'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM';
      const amount = 847;
      const closeRemainderTo =
        'RJB34GFP2BR5YJHKXDUMA2W4UX7DFUUR7QZ4AU5TWVKNA2KTNZIYB4BMRM';
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const note = new Uint8Array([123, 12, 200]);
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender,
        paymentParams: {
          receiver,
          amount,
          closeRemainderTo,
        },
        note,
        rekeyTo,
        suggestedParams,
      });
      const actualTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender,
        receiver,
        amount,
        closeRemainderTo,
        note,
        suggestedParams,
        rekeyTo,
      });
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should be able to use helper to make a payment transaction with BigInt amount', () => {
      const sender =
        'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const receiver =
        'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM';
      const amount = 0xffffffffffffffffn;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const closeRemainderTo =
        'RJB34GFP2BR5YJHKXDUMA2W4UX7DFUUR7QZ4AU5TWVKNA2KTNZIYB4BMRM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.pay,
        sender,
        paymentParams: {
          receiver,
          amount,
          closeRemainderTo,
        },
        note,
        rekeyTo,
        suggestedParams,
      });
      const actualTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender,
        receiver,
        amount,
        closeRemainderTo,
        note,
        suggestedParams,
        rekeyTo,
      });
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should throw if payment amount is too large', () => {
      const sender =
        'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const receiver =
        'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM';
      const amount = 0x10000000000000000n;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const closeRemainderTo =
        'RJB34GFP2BR5YJHKXDUMA2W4UX7DFUUR7QZ4AU5TWVKNA2KTNZIYB4BMRM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const o: algosdk.TransactionParams = {
        type: algosdk.TransactionType.pay,
        sender,
        paymentParams: {
          receiver,
          amount,
          closeRemainderTo,
        },
        note,
        rekeyTo,
        suggestedParams,
      };
      assert.throws(
        () => new algosdk.Transaction(o),
        new Error('Value 18446744073709551616 is not a uint64')
      );
    });

    it('should be able to use helper to make a keyreg transaction', () => {
      const sender =
        'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const voteKey = algosdk.base64ToBytes(
        '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE='
      );
      const selectionKey = algosdk.base64ToBytes(
        'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4='
      );
      const stateProofKey = algosdk.base64ToBytes(
        'mgh7ddGf7dF1Z5/9RDzN/JZZF9yA7XYCKJXvqhwPdvI7pLKh7hizaM5rTC2kizVOpVRIU9PXSLeapvBJ/OxQYA=='
      );
      const voteKeyDilution = 1234;
      const voteFirst = 123;
      const voteLast = 456;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.keyreg,
        sender,
        keyregParams: {
          voteKey,
          selectionKey,
          stateProofKey,
          voteFirst,
          voteLast,
          voteKeyDilution,
        },
        suggestedParams,
        note,
        rekeyTo,
      });
      const actualTxn =
        algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          sender,
          note,
          voteKey,
          selectionKey,
          stateProofKey,
          voteFirst,
          voteLast,
          voteKeyDilution,
          suggestedParams,
          rekeyTo,
        });
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should be able to use helper to make an offline keyreg transaction', () => {
      const sender =
        'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };

      assert.throws(
        () =>
          new algosdk.Transaction({
            type: algosdk.TransactionType.keyreg,
            sender,
            keyregParams: {
              voteKey: algosdk.base64ToBytes(
                '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE='
              ),
            },
            suggestedParams,
            note,
            rekeyTo,
          }),
        new Error(
          'Online key registration missing at least one of the following fields: ' +
            'voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution'
        )
      );

      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.keyreg,
        sender,
        keyregParams: {},
        suggestedParams,
        note,
        rekeyTo,
      });
      const actualTxn =
        algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          sender,
          note,
          suggestedParams,
          rekeyTo,
        });
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should be able to use helper to make a nonparticipating keyreg transaction', () => {
      const sender =
        'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU';
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };

      assert.throws(
        () =>
          new algosdk.Transaction({
            type: algosdk.TransactionType.keyreg,
            sender,
            keyregParams: {
              voteKey: algosdk.base64ToBytes(
                '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE='
              ),
              selectionKey: algosdk.base64ToBytes(
                'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4='
              ),
              voteFirst: 123,
              voteLast: 456,
              voteKeyDilution: 1234,
              nonParticipation: true,
            },
            suggestedParams,
            note,
            rekeyTo,
          }),
        new Error(
          'nonParticipation is true but participation params are present.'
        )
      );

      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.keyreg,
        sender,
        keyregParams: {
          nonParticipation: true,
        },
        suggestedParams,
        note,
        rekeyTo,
      });
      const actualTxn =
        algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          sender,
          note,
          suggestedParams,
          rekeyTo,
          nonParticipation: true,
        });
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should be able to use helper to make an asset create transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const defaultFrozen = false;
      const total = 100;
      const decimals = 1;
      const manager = addr;
      const reserve = addr;
      const freeze = addr;
      const clawback = addr;
      const unitName = 'tst';
      const assetName = 'testcoin';
      const assetURL = 'testURL';
      const assetMetadataHash = new Uint8Array(
        algosdk.base64ToBytes('dGVzdGhhc2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=')
      );
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.acfg,
        sender: addr,
        assetConfigParams: {
          defaultFrozen,
          total,
          decimals,
          manager,
          reserve,
          freeze,
          clawback,
          unitName,
          assetName,
          assetURL,
          assetMetadataHash,
        },
        suggestedParams,
        note,
        rekeyTo,
      });
      const actualTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject(
        {
          sender: addr,
          note,
          total,
          decimals,
          defaultFrozen,
          manager,
          reserve,
          freeze,
          clawback,
          unitName,
          assetName,
          assetURL,
          assetMetadataHash,
          suggestedParams,
          rekeyTo,
        }
      );
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should be able to use helper to make an asset create transaction with BigInt total', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const defaultFrozen = false;
      const total = 0xffffffffffffffffn;
      const decimals = 1;
      const manager = addr;
      const reserve = addr;
      const freeze = addr;
      const clawback = addr;
      const unitName = 'tst';
      const assetName = 'testcoin';
      const assetURL = 'testURL';
      const assetMetadataHash = new Uint8Array(
        algosdk.base64ToBytes('dGVzdGhhc2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=')
      );
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.acfg,
        sender: addr,
        assetConfigParams: {
          defaultFrozen,
          total,
          decimals,
          manager,
          reserve,
          freeze,
          clawback,
          unitName,
          assetName,
          assetURL,
          assetMetadataHash,
        },
        suggestedParams,
        note,
        rekeyTo,
      });
      const actualTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject(
        {
          sender: addr,
          note,
          total,
          decimals,
          defaultFrozen,
          manager,
          reserve,
          freeze,
          clawback,
          unitName,
          assetName,
          assetURL,
          assetMetadataHash,
          suggestedParams,
          rekeyTo,
        }
      );
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should throw if asset creation total is too large', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const defaultFrozen = false;
      const total = 0x10000000000000000n;
      const decimals = 1;
      const manager = addr;
      const reserve = addr;
      const freeze = addr;
      const clawback = addr;
      const unitName = 'tst';
      const assetName = 'testcoin';
      const assetURL = 'testURL';
      const assetMetadataHash = new Uint8Array(
        algosdk.base64ToBytes('dGVzdGhhc2gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=')
      );
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const params: algosdk.TransactionParams = {
        type: algosdk.TransactionType.acfg,
        sender: addr,
        assetConfigParams: {
          defaultFrozen,
          total,
          decimals,
          manager,
          reserve,
          freeze,
          clawback,
          unitName,
          assetName,
          assetURL,
          assetMetadataHash,
        },
        suggestedParams,
        note,
        rekeyTo,
      };
      assert.throws(
        () => new algosdk.Transaction(params),
        new Error('Value 18446744073709551616 is not a uint64')
      );
    });

    it('should fail to make an asset create transaction with an invalid assetMetadataHash', () => {
      function paramsWithMetadataHash(
        assetMetadataHash: any
      ): algosdk.TransactionParams {
        const addr =
          'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
        return {
          type: algosdk.TransactionType.acfg,
          sender: addr,
          assetConfigParams: {
            defaultFrozen: false,
            total: 100,
            decimals: 0,
            manager: addr,
            reserve: addr,
            freeze: addr,
            clawback: addr,
            unitName: 'tst',
            assetName: 'testcoin',
            assetURL: 'https://example.com',
            assetMetadataHash,
          },
          suggestedParams: {
            minFee: 1000,
            fee: 10,
            genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
            genesisID: 'testnet-v1.0',
            firstValid: 51,
            lastValid: 61,
          },
          note: new Uint8Array([123, 12, 200]),
          rekeyTo: 'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM',
        };
      }
      assert.doesNotThrow(() => {
        const txnParams = paramsWithMetadataHash(undefined);
        return new algosdk.Transaction(txnParams);
      });
      assert.throws(() => {
        const txnParams = paramsWithMetadataHash(new Uint8Array());
        return new algosdk.Transaction(txnParams);
      });
      assert.throws(() => {
        const txnParams = paramsWithMetadataHash(Uint8Array.from([1, 2, 3]));
        return new algosdk.Transaction(txnParams);
      });
      assert.doesNotThrow(() => {
        const txnParams = paramsWithMetadataHash(new Uint8Array(32));
        return new algosdk.Transaction(txnParams);
      });
      assert.throws(() => {
        const txnParams = paramsWithMetadataHash(new Uint8Array(33));
        return new algosdk.Transaction(txnParams);
      });
      assert.throws(() => {
        const txnParams = paramsWithMetadataHash('');
        return new algosdk.Transaction(txnParams);
      });
      assert.throws(() => {
        const txnParams = paramsWithMetadataHash(
          'fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh'
        );
        return new algosdk.Transaction(txnParams);
      });
    });

    it('should be able to use helper to make an asset config transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const assetIndex = 1234;
      const manager = addr;
      const reserve = addr;
      const freeze = addr;
      const clawback = addr;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.acfg,
        sender: addr,
        assetConfigParams: {
          assetIndex,
          manager,
          reserve,
          freeze,
          clawback,
        },
        suggestedParams,
        note,
        rekeyTo,
      });
      const actualTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject(
        {
          sender: addr,
          note,
          assetIndex,
          manager,
          reserve,
          freeze,
          clawback,
          suggestedParams,
          rekeyTo,
        }
      );
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should throw when disobeying strict address checking in make asset config', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const assetIndex = 1234;
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      assert.throws(
        () =>
          algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
            sender: addr,
            assetIndex,
            manager: addr,
            reserve: addr,
            freeze: undefined,
            clawback: undefined,
            suggestedParams,
          }),
        new Error(
          'strictEmptyAddressChecking is enabled, but an address is empty. If this is intentional, set strictEmptyAddressChecking to false.'
        )
      );

      // does not throw when flag enabled
      algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
        sender: addr,
        assetIndex,
        manager: addr,
        reserve: addr,
        freeze: undefined,
        clawback: undefined,
        suggestedParams,
        strictEmptyAddressChecking: false,
      });
    });

    it('should be able to use helper to make an asset destroy transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const assetIndex = 1234;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.acfg,
        sender: addr,
        assetConfigParams: {
          assetIndex,
        },
        suggestedParams,
        note,
        rekeyTo,
      });
      const actualTxn =
        algosdk.makeAssetDestroyTxnWithSuggestedParamsFromObject({
          sender: addr,
          note,
          assetIndex,
          suggestedParams,
          rekeyTo,
        });
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should be able to use helper to make an asset transfer transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const sender = addr;
      const receiver = addr;
      const assetSender = addr;
      const closeRemainderTo = addr;
      const assetIndex = 1234;
      const amount = 100;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.axfer,
        sender,
        assetTransferParams: {
          receiver,
          assetSender,
          closeRemainderTo,
          assetIndex,
          amount,
        },
        suggestedParams,
        note,
        rekeyTo,
      });
      const actualTxn =
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender,
          receiver,
          closeRemainderTo,
          assetSender,
          amount,
          note,
          assetIndex,
          suggestedParams,
          rekeyTo,
        });
      assert.deepStrictEqual(actualTxn, expectedTxn);
    });

    it('should be able to use helper to make an asset freeze transaction', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const assetIndex = 1234;
      const freezeTarget = addr;
      const assetFrozen = true;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.afrz,
        sender: addr,
        assetFreezeParams: {
          freezeTarget,
          assetFrozen,
          assetIndex,
        },
        suggestedParams,
        note,
        rekeyTo,
      });
      const actualTxn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject(
        {
          sender: addr,
          note,
          assetIndex,
          freezeTarget,
          assetFrozen,
          suggestedParams,
          rekeyTo,
        }
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should be able to translate box references to encoded references', () => {
      const testCases: Array<
        [
          algosdk.BoxReference[],
          number[],
          number,
          algosdk.EncodedBoxReference[],
        ]
      > = [
        [
          [{ appIndex: 100, name: Uint8Array.from([0, 1, 2, 3]) }],
          [100],
          9999,
          [{ i: 1, n: Uint8Array.from([0, 1, 2, 3]) }],
        ],
        [[], [], 9999, []],
        [
          [
            { appIndex: 0, name: Uint8Array.from([0, 1, 2, 3]) },
            { appIndex: 9999, name: Uint8Array.from([4, 5, 6, 7]) },
          ],
          [100],
          9999,
          [
            { n: Uint8Array.from([0, 1, 2, 3]) },
            { n: Uint8Array.from([4, 5, 6, 7]) },
          ],
        ],
        [
          [{ appIndex: 100, name: Uint8Array.from([0, 1, 2, 3]) }],
          [100],
          100,
          [{ i: 1, n: Uint8Array.from([0, 1, 2, 3]) }],
        ],
        [
          [
            { appIndex: 7777, name: Uint8Array.from([0, 1, 2, 3]) },
            { appIndex: 8888, name: Uint8Array.from([4, 5, 6, 7]) },
          ],
          [100, 7777, 8888, 9999],
          9999,
          [
            { i: 2, n: Uint8Array.from([0, 1, 2, 3]) },
            { i: 3, n: Uint8Array.from([4, 5, 6, 7]) },
          ],
        ],
      ];
      for (const testCase of testCases) {
        const expected = testCase[3];
        const actual = translateBoxReferences(
          testCase[0],
          testCase[1],
          testCase[2]
        );
        assert.deepStrictEqual(expected, actual);
      }
    });
  });
});
