/* eslint-env mocha */
import assert from 'assert';
import algosdk from '../src/index.js';
import { boxReferencesToEncodingData } from '../src/boxStorage.js';

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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
        genesisID: 'mock-network',
      },
      appCallParams: {
        appIndex: 5,
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
    assert.ok((txn.applicationCall.accounts as any) !== accounts);
    assert.ok((txn.applicationCall.foreignApps as any) !== foreignApps);
    assert.ok((txn.applicationCall.foreignAssets as any) !== foreignAssets);
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
      };
      const zeroFee = new algosdk.Transaction(params);
      assert.strictEqual(zeroFee.fee, minFee);
      assert.strictEqual(zeroFee.toEncodingData().get('fee'), minFee);

      params.suggestedParams.fee = minFee; // since this is fee per byte, it will be far greater than minFee
      const excessFee = new algosdk.Transaction(params);
      assert.ok(excessFee.fee > minFee);
      assert.strictEqual(excessFee.toEncodingData().get('fee'), excessFee.fee);
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
        genesisID: 'mock-network',
      },
    });
    assert.strictEqual(txn.fee, 0n);
    // Should be omitted from encodings
    const encRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
      txn.toEncodingData()
    );
    assert.ok(encRep instanceof Map && !encRep.has('fee'));
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
        genesisID: 'mock-network',
      },
      note: new Uint8Array([123, 12, 200]),
    });
    assert.strictEqual(txn.fee, 10n);
    assert.strictEqual(txn.toEncodingData().get('fee'), 10n);
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
      genesisHash: algosdk.base64ToBytes(
        'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
      ),
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
      assert.deepStrictEqual(reencRep, encRep);
    });

    it.only('should correctly serialize and deserialize a state proof transaction from msgpack representation', () => {
      const stateProofBytes = algosdk.base64ToBytes(
        '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'
      );
      const stateProof = algosdk.decodeMsgpack(
        stateProofBytes,
        algosdk.StateProof
      );
      const stateProofMessageBytes = algosdk.base64ToBytes(
        'haFQzgAhmcOhYsQg2yjiUJZ8n0Dj9ElQ166GrxpvvoRCn0L/Z6QuAXpXDoShZs4CY10BoWzOAmNeAKF2xEB5RkiWhqppJ50rMDHrQ1tiQUskmFvyFDo3AoC+Z6RxNMzyD7QsXIm6oEFcI0We/ANEyffmfHIs8nNCbWcGdgmI'
      );
      const stateProofMessage = algosdk.decodeMsgpack(
        stateProofMessageBytes,
        algosdk.StateProofMessage
      );

      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.stpf,
        sender: 'XMHLMNAVJIMAW2RHJXLXKKK4G3J3U6VONNO3BTAQYVDC3MHTGDP3J5OCRU',
        stateProofParams: {
          stateProofType: 0,
          stateProof,
          message: stateProofMessage,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 51,
          lastValid: 61,
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
        },
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          frozen: true,
          freezeTarget: address,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 322575,
          lastValid: 323575,
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        txn.toEncodingData()
      );
      assert.ok(encRep instanceof Map && !encRep.has('rcv'));

      const encTxn = algosdk.encodeMsgpack(txn);
      const golden = algosdk.base64ToBytes(
        'iaNhbXTNA0+jZmVlzQgqomZ2AaNnZW6sbW9jay1uZXR3b3JromdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds0D6aRub3RlxAN7DMijc25kxCCgiappIuO5mPrf9s1ICN354CHklE44nqPVxjh4ZokZfqR0eXBlo3BheQ=='
      );
      assert.deepStrictEqual(encTxn, golden);

      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, txn);

      const reencRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        decTxn.toEncodingData()
      );
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
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        txn.toEncodingData()
      );
      assert.ok(encRep instanceof Map && !encRep.has('arcv'));

      const encTxn = algosdk.encodeMsgpack(txn);
      const golden = algosdk.base64ToBytes(
        'iqRhYW10zQNPo2ZlZc0ImKJmdgGjZ2VurG1vY2stbmV0d29ya6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbNA+mkbm90ZcQDewzIo3NuZMQgoImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX6kdHlwZaVheGZlcqR4YWlkzScP'
      );
      assert.deepStrictEqual(encTxn, golden);

      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, txn);

      const reencRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        decTxn.toEncodingData()
      );
      assert.deepStrictEqual(reencRep, encRep);
    });

    it('should correctly serialize and deserialize an asset freeze transaction when the freeze account is the zero address', () => {
      const txn = new algosdk.Transaction({
        type: algosdk.TransactionType.afrz,
        sender: 'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
        assetFreezeParams: {
          assetIndex: 9999,
          freezeTarget: algosdk.ALGORAND_ZERO_ADDRESS_STRING,
          frozen: true,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 1,
          lastValid: 1001,
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        txn.toEncodingData()
      );
      assert.ok(encRep instanceof Map && !encRep.has('fadd'));

      const encTxn = algosdk.encodeObj(encRep);
      const golden = algosdk.base64ToBytes(
        'iqRhZnJ6w6RmYWlkzScPo2ZlZc0IeqJmdgGjZ2VurG1vY2stbmV0d29ya6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbNA+mkbm90ZcQDewzIo3NuZMQgoImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX6kdHlwZaRhZnJ6'
      );
      assert.deepStrictEqual(encTxn, golden);

      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, txn);

      const reencRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        decTxn.toEncodingData()
      );
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
          frozen: true,
          freezeTarget: address,
        },
        suggestedParams: {
          minFee: 1000,
          fee: 10,
          firstValid: 0,
          lastValid: 1000,
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        expectedTxn.toEncodingData()
      );
      assert.ok(encRep instanceof Map && !encRep.has('fv'));

      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const reencRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        decTxn.toEncodingData()
      );
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
          genesisHash: algosdk.base64ToBytes(
            'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        txn.toEncodingData()
      );
      assert.ok(encRep instanceof Map && !encRep.has('snd'));

      const encTxn = algosdk.encodeMsgpack(txn);
      const golden = algosdk.base64ToBytes(
        'iaNhbXTNA0+jZmVlzQgqomZ2AaNnZW6sbW9jay1uZXR3b3JromdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds0D6aRub3RlxAN7DMijcmN2xCCgiappIuO5mPrf9s1ICN354CHklE44nqPVxjh4ZokZfqR0eXBlo3BheQ=='
      );
      assert.deepStrictEqual(encTxn, golden);

      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, txn);

      const reencRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        decTxn.toEncodingData()
      );
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        expectedTxn.toEncodingData()
      );
      assert.ok(encRep instanceof Map && !encRep.has('gen'));

      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const reencRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        decTxn.toEncodingData()
      );
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });
      const encRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        expectedTxn.toEncodingData()
      );
      assert.ok(encRep instanceof Map && !encRep.has('amt'));

      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const reencRep = algosdk.Transaction.encodingSchema.prepareMsgpack(
        decTxn.toEncodingData()
      );
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
          genesisHash: algosdk.base64ToBytes(
            'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
          ),
          genesisID: 'mock-network',
        },
        note: new Uint8Array([123, 12, 200]),
      });

      expectedTxn.group = algosdk.computeGroupID([expectedTxn]);
      const encTxn = algosdk.encodeMsgpack(expectedTxn);
      const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
      assert.deepStrictEqual(decTxn, expectedTxn);

      const encRep = expectedTxn.toEncodingData();
      const reencRep = decTxn.toEncodingData();
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
            genesisHash: algosdk.base64ToBytes(
              'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
            ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
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
      const frozen = true;
      const note = new Uint8Array([123, 12, 200]);
      const rekeyTo =
        'GAQVB24XEPYOPBQNJQAE4K3OLNYTRYD65ZKR3OEW5TDOOGL7MDKABXHHTM';
      const suggestedParams: algosdk.SuggestedParams = {
        minFee: 1000,
        fee: 10,
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
        genesisID: 'testnet-v1.0',
        firstValid: 51,
        lastValid: 61,
      };
      const expectedTxn = new algosdk.Transaction({
        type: algosdk.TransactionType.afrz,
        sender: addr,
        assetFreezeParams: {
          freezeTarget,
          frozen,
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
          frozen,
          suggestedParams,
          rekeyTo,
        }
      );
      assert.deepStrictEqual(expectedTxn, actualTxn);
    });

    it('should be able to translate box references to encoded references', () => {
      const testCases: Array<
        [algosdk.BoxReference[], number[], number, Array<Map<string, unknown>>]
      > = [
        [
          [{ appIndex: 100, name: Uint8Array.from([0, 1, 2, 3]) }],
          [100],
          9999,
          [
            new Map<string, unknown>([
              ['i', 1],
              ['n', Uint8Array.from([0, 1, 2, 3])],
            ]),
          ],
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
            new Map<string, unknown>([
              ['i', 0],
              ['n', Uint8Array.from([0, 1, 2, 3])],
            ]),
            new Map<string, unknown>([
              ['i', 0],
              ['n', Uint8Array.from([4, 5, 6, 7])],
            ]),
          ],
        ],
        [
          [{ appIndex: 100, name: Uint8Array.from([0, 1, 2, 3]) }],
          [100],
          100,
          [
            new Map<string, unknown>([
              ['i', 1],
              ['n', Uint8Array.from([0, 1, 2, 3])],
            ]),
          ],
        ],
        [
          [
            { appIndex: 7777, name: Uint8Array.from([0, 1, 2, 3]) },
            { appIndex: 8888, name: Uint8Array.from([4, 5, 6, 7]) },
          ],
          [100, 7777, 8888, 9999],
          9999,
          [
            new Map<string, unknown>([
              ['i', 2],
              ['n', Uint8Array.from([0, 1, 2, 3])],
            ]),
            new Map<string, unknown>([
              ['i', 3],
              ['n', Uint8Array.from([4, 5, 6, 7])],
            ]),
          ],
        ],
        [
          [{ appIndex: 0, name: Uint8Array.from([]) }],
          [],
          1,
          [
            new Map<string, unknown>([
              ['i', 0],
              ['n', Uint8Array.from([])],
            ]),
          ],
        ],
      ];
      for (const testCase of testCases) {
        const expected = testCase[3];
        const actual = boxReferencesToEncodingData(
          testCase[0],
          testCase[1],
          testCase[2]
        );
        assert.deepStrictEqual(actual, expected);
      }
    });
  });
});
