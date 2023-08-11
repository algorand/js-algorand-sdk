/* eslint-env mocha */
const assert = require('assert');
const algosdk = require('../src/index');
const nacl = require('../src/nacl/naclWrappers');
const utils = require('../src/utils/utils');

describe('Algosdk (AKA end to end)', () => {
  describe('#mnemonic', () => {
    it('should export and import', () => {
      for (let i = 0; i < 50; i++) {
        const keys = algosdk.generateAccount();
        const mn = algosdk.secretKeyToMnemonic(keys.sk);
        const recovered = algosdk.mnemonicToSecretKey(mn);
        assert.deepStrictEqual(keys.sk, recovered.sk);
        assert.deepStrictEqual(keys.addr, recovered.addr);
      }
    });
  });

  describe('#encoding', () => {
    it('should encode and decode', () => {
      const o = { a: [1, 2, 3, 4, 5], b: 3486, c: 'skfg' };
      assert.deepStrictEqual(o, algosdk.decodeObj(algosdk.encodeObj(o)));
    });

    it('should encode and decode strings', () => {
      const o = 'Hi there';
      assert.deepStrictEqual(o, algosdk.decodeObj(algosdk.encodeObj(o)));
    });

    it('should not mutate unsigned transaction when going to or from encoded buffer', () => {
      const receiver =
        'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI';
      const fee = 4;
      const amount = 1000;
      const firstValid = 12466;
      const lastValid = 13466;
      const genesisID = 'devnet-v33.0';
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const closeRemainderTo =
        'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA';
      const note = new Uint8Array(algosdk.base64ToBytes('6gAVR0Nsv5Y='));
      const sender = receiver;
      const suggestedParams = {
        genesisHash,
        genesisID,
        firstValid,
        lastValid,
        fee,
      };
      const txnAsObj = algosdk.makePaymentTxnWithSuggestedParams(
        sender,
        receiver,
        amount,
        closeRemainderTo,
        note,
        suggestedParams
      );
      const txnAsBuffer = algosdk.encodeUnsignedTransaction(txnAsObj);
      const txnAsObjRecovered = algosdk.decodeUnsignedTransaction(txnAsBuffer);
      const txnAsBufferRecovered = algosdk.encodeUnsignedTransaction(
        txnAsObjRecovered
      );
      assert.deepStrictEqual(txnAsBuffer, txnAsBufferRecovered);
      const txnAsBufferGolden = new Uint8Array(
        algosdk.base64ToBytes(
          'i6NhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0EmKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqRub3RlxAjqABVHQ2y/lqNyY3bEIHts4k/rW6zAsWTinCIsV/X2PcOH1DkEglhBHF/hD3wCo3NuZMQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKkdHlwZaNwYXk='
        )
      );
      assert.deepStrictEqual(txnAsBufferGolden, txnAsBufferRecovered);
    });

    it('should not mutate signed transaction when going to or from encoded buffer', () => {
      const receiver =
        'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI';
      const fee = 4;
      const amount = 1000;
      const firstValid = 12466;
      const lastValid = 13466;
      const genesisID = 'devnet-v33.0';
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const closeRemainderTo =
        'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA';
      const note = new Uint8Array(algosdk.base64ToBytes('6gAVR0Nsv5Y='));
      const sender = receiver;
      const suggestedParams = {
        genesisHash,
        genesisID,
        firstValid,
        lastValid,
        fee,
      };
      const txnAsObj = algosdk.makePaymentTxnWithSuggestedParams(
        sender,
        receiver,
        amount,
        closeRemainderTo,
        note,
        suggestedParams
      );
      let sk =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      sk = algosdk.mnemonicToSecretKey(sk);
      const initialSignedTxnBytes = txnAsObj.signTxn(sk.sk);
      const signedTxnRecovered = algosdk.decodeSignedTransaction(
        initialSignedTxnBytes
      );
      const txnAsObjRecovered = signedTxnRecovered.txn;
      const recoveredSignedTxnBytes = txnAsObjRecovered.signTxn(sk.sk);
      assert.deepStrictEqual(initialSignedTxnBytes, recoveredSignedTxnBytes);
      const signedTxnBytesGolden = new Uint8Array(
        algosdk.base64ToBytes(
          'g6RzZ25yxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaNzaWfEQDJHtrytU9p3nhRH1XS8tX+KmeKGyekigG7M704dOkBMTqiOJFuukbK2gUViJtivsPrKNiV0+WIrdbBk7gmNkgGjdHhui6NhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0EmKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqRub3RlxAjqABVHQ2y/lqNyY3bEIHts4k/rW6zAsWTinCIsV/X2PcOH1DkEglhBHF/hD3wCo3NuZMQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKkdHlwZaNwYXk=',
          'base64'
        )
      );
      assert.deepStrictEqual(signedTxnBytesGolden, recoveredSignedTxnBytes);
    });
  });

  describe('Sign', () => {
    it('should return a blob that matches the go code', () => {
      let sk =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      const golden =
        'gqNzaWfEQPhUAZ3xkDDcc8FvOVo6UinzmKBCqs0woYSfodlmBMfQvGbeUx3Srxy3dyJDzv7rLm26BRv9FnL2/AuT7NYfiAWjdHhui6NhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0EmKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqRub3RlxAjqABVHQ2y/lqNyY3bEIHts4k/rW6zAsWTinCIsV/X2PcOH1DkEglhBHF/hD3wCo3NuZMQg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGkdHlwZaNwYXk=';
      const o = {
        receiver: 'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI',
        fee: 4,
        amount: 1000,
        firstValid: 12466,
        lastValid: 13466,
        genesisID: 'devnet-v33.0',
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        closeRemainderTo:
          'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA',
        note: new Uint8Array(algosdk.base64ToBytes('6gAVR0Nsv5Y=')),
      };

      sk = algosdk.mnemonicToSecretKey(sk);

      const jsDec = algosdk.signTransaction(o, sk.sk);
      assert.deepStrictEqual(jsDec.blob, algosdk.base64ToBytes(golden));

      // // Check txid
      const txGolden = '5FJDJD5LMZC3EHUYYJNH5I23U4X6H2KXABNDGPIL557ZMJ33GZHQ';
      assert.deepStrictEqual(jsDec.txID, txGolden);
    });

    it('should return a blob that matches the go code when using a flat fee', () => {
      let sk =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      const golden =
        'gqNzaWfEQPhUAZ3xkDDcc8FvOVo6UinzmKBCqs0woYSfodlmBMfQvGbeUx3Srxy3dyJDzv7rLm26BRv9FnL2/AuT7NYfiAWjdHhui6NhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0EmKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqRub3RlxAjqABVHQ2y/lqNyY3bEIHts4k/rW6zAsWTinCIsV/X2PcOH1DkEglhBHF/hD3wCo3NuZMQg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGkdHlwZaNwYXk=';
      const o = {
        receiver: 'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI',
        fee: 1176,
        amount: 1000,
        firstValid: 12466,
        lastValid: 13466,
        genesisID: 'devnet-v33.0',
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        closeRemainderTo:
          'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA',
        note: new Uint8Array(algosdk.base64ToBytes('6gAVR0Nsv5Y=')),
        flatFee: true,
      };

      sk = algosdk.mnemonicToSecretKey(sk);

      const jsDec = algosdk.signTransaction(o, sk.sk);
      assert.deepStrictEqual(jsDec.blob, algosdk.base64ToBytes(golden));

      // // Check txid
      const txGolden = '5FJDJD5LMZC3EHUYYJNH5I23U4X6H2KXABNDGPIL557ZMJ33GZHQ';
      assert.deepStrictEqual(jsDec.txID, txGolden);
    });

    it('should return a blob that matches the go code when constructing with a lease', () => {
      let sk =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      const golden =
        'gqNzaWfEQOMmFSIKsZvpW0txwzhmbgQjxv6IyN7BbV5sZ2aNgFbVcrWUnqPpQQxfPhV/wdu9jzEPUU1jAujYtcNCxJ7ONgejdHhujKNhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0FLKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqJseMQgAQIDBAECAwQBAgMEAQIDBAECAwQBAgMEAQIDBAECAwSkbm90ZcQI6gAVR0Nsv5ajcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEIOfw+E0GgR358xyNh4sRVfRnHVGhhcIAkIZn9ElYcGihpHR5cGWjcGF5';
      // prettier-ignore
      const lease = new Uint8Array([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
      const o = {
        receiver: 'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI',
        fee: 4,
        amount: 1000,
        firstValid: 12466,
        lastValid: 13466,
        genesisID: 'devnet-v33.0',
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        closeRemainderTo:
          'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA',
        note: new Uint8Array(algosdk.base64ToBytes('6gAVR0Nsv5Y=')),
        lease,
      };

      sk = algosdk.mnemonicToSecretKey(sk);

      const jsDec = algosdk.signTransaction(o, sk.sk);
      assert.deepStrictEqual(jsDec.blob, algosdk.base64ToBytes(golden));

      // Check txid
      const txGolden = '7BG6COBZKF6I6W5XY72ZE4HXV6LLZ6ENSR6DASEGSTXYXR4XJOOQ';
      assert.deepStrictEqual(jsDec.txID, txGolden);
    });

    it('should return a blob that matches the go code when adding a lease', () => {
      let sk =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      const golden =
        'gqNzaWfEQOMmFSIKsZvpW0txwzhmbgQjxv6IyN7BbV5sZ2aNgFbVcrWUnqPpQQxfPhV/wdu9jzEPUU1jAujYtcNCxJ7ONgejdHhujKNhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0FLKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqJseMQgAQIDBAECAwQBAgMEAQIDBAECAwQBAgMEAQIDBAECAwSkbm90ZcQI6gAVR0Nsv5ajcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEIOfw+E0GgR358xyNh4sRVfRnHVGhhcIAkIZn9ElYcGihpHR5cGWjcGF5';
      // prettier-ignore
      const lease = new Uint8Array([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
      const receiver =
        'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI';
      const fee = 4;
      const amount = 1000;
      const firstValid = 12466;
      const lastValid = 13466;
      const genesisID = 'devnet-v33.0';
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const closeRemainderTo =
        'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA';
      const note = new Uint8Array(algosdk.base64ToBytes('6gAVR0Nsv5Y='));
      sk = algosdk.mnemonicToSecretKey(sk);
      const key = nacl.keyPairFromSecretKey(sk.sk);
      const sender = algosdk.encodeAddress(key.publicKey);
      const suggestedParams = {
        genesisHash,
        genesisID,
        firstValid,
        lastValid,
        fee,
      };
      const txn = algosdk.makePaymentTxnWithSuggestedParams(
        sender,
        receiver,
        amount,
        closeRemainderTo,
        note,
        suggestedParams
      );
      txn.addLease(lease, fee);

      const txnBytes = txn.signTxn(sk.sk);
      assert.deepStrictEqual(txnBytes, algosdk.base64ToBytes(golden));

      // Check txid
      const txGolden = '7BG6COBZKF6I6W5XY72ZE4HXV6LLZ6ENSR6DASEGSTXYXR4XJOOQ';
      assert.deepStrictEqual(txn.txID().toString(), txGolden);
    });
  });

  describe('Sign and verify bytes', () => {
    it('should verify a correct signature', () => {
      const account = algosdk.generateAccount();
      const toSign = Uint8Array.from([1, 9, 25, 49]);
      const signed = algosdk.signBytes(toSign, account.sk);
      assert.equal(true, algosdk.verifyBytes(toSign, signed, account.addr));
    });

    it('should not verify a corrupted signature', () => {
      const account = algosdk.generateAccount();
      const toSign = Uint8Array.from([1, 9, 25, 49]);
      const signed = algosdk.signBytes(toSign, account.sk);
      signed[0] = (signed[0] + 1) % 256;
      assert.equal(false, algosdk.verifyBytes(toSign, signed, account.addr));
    });

    it('should attach arbitrary signatures', () => {
      const sender = algosdk.generateAccount();
      const signer = algosdk.generateAccount();

      // Create a transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: sender.addr,
        receiver: signer.addr,
        amount: 1000,
        suggestedParams: {
          firstValid: 12466,
          lastValid: 13466,
          genesisID: 'devnet-v33.0',
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          fee: 4,
        },
      });

      // Sign it directly to get a signature
      const signedWithSk = txn.signTxn(signer.sk);
      const decoded = algosdk.decodeObj(signedWithSk);
      const signature = decoded.sig;

      // Attach the signature to the transaction indirectly, and compare
      const signedWithSignature = txn.attachSignature(signer.addr, signature);
      assert.deepEqual(signedWithSk, signedWithSignature);

      // Check that signer was set
      const decodedWithSigner = algosdk.decodeObj(signedWithSignature);
      assert.deepEqual(
        decodedWithSigner.sgnr,
        algosdk.decodeAddress(signer.addr).publicKey
      );
    });

    it('should not attach signature with incorrect length', () => {
      const sender = algosdk.generateAccount();
      const signer = algosdk.generateAccount();

      // Create a transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: sender.addr,
        receiver: signer.addr,
        amount: 1000,
        suggestedParams: {
          firstValid: 12466,
          lastValid: 13466,
          genesisID: 'devnet-v33.0',
          genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          fee: 4,
        },
      });

      // Sign it directly to get a signature
      const signedWithSk = txn.signTxn(signer.sk);
      const decoded = algosdk.decodeObj(signedWithSk);
      const signature = decoded.sig.slice(0, -1); // without the last byte

      // Check that the signature is not attached
      assert.throws(
        () => txn.attachSignature(signer.addr, signature),
        Error('Invalid signature length')
      );
    });
  });

  describe('Multisig Sign', () => {
    it('should return a blob that matches the go code', () => {
      const params = {
        version: 1,
        threshold: 2,
        addrs: [
          'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA',
          'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM',
          '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU',
        ],
      }; // msig address - RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM

      const mnem3 =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      const { sk } = algosdk.mnemonicToSecretKey(mnem3);

      const o = {
        receiver: 'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI',
        fee: 4,
        amount: 1000,
        firstValid: 12466,
        lastValid: 13466,
        genesisID: 'devnet-v33.0',
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        closeRemainderTo:
          'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA',
        note: algosdk.base64ToBytes('X4Bl4wQ9rCo='),
      };

      const jsDec = algosdk.signMultisigTransaction(o, params, sk);
      // this golden also contains the correct multisig address
      const golden = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgaJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXiBonBrxCAJYzIJU3OJ8HVnEXc5kcfQPhtzyMT1K/av8BqiXPnCcYKicGvEIOfw+E0GgR358xyNh4sRVfRnHVGhhcIAkIZn9ElYcGihoXPEQF6nXZ7CgInd1h7NVspIPFZNhkPL+vGFpTNwH3Eh9gwPM8pf1EPTHfPvjf14sS7xN7mTK+wrz7Odhp4rdWBNUASjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQSYomZ2zTCyo2dlbqxkZXZuZXQtdjMzLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zTSapG5vdGXECF+AZeMEPawqo3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ=='
      );
      assert.deepStrictEqual(jsDec.blob, golden);

      // Check txid
      const txGolden = 'TDIO6RJWJIVDDJZELMSX5CPJW7MUNM3QR4YAHYAKHF3W2CFRTI7A';
      assert.deepStrictEqual(jsDec.txID, txGolden);
    });

    it('should return the same blob whether using dict-of-args or algosdk.makeFooTransaction', () => {
      const params = {
        version: 1,
        threshold: 2,
        addrs: [
          'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA',
          'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM',
          '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU',
        ],
      }; // msig address - RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM

      const mnemonic =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      const { sk } = algosdk.mnemonicToSecretKey(mnemonic);

      const toAddr =
        'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI';
      const fromAddr =
        'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM';
      const fee = 4;
      const amount = 1000;
      const firstValid = 12466;
      const lastValid = 13466;
      const genesisID = 'devnet-v33.0';
      const genesisHash = 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=';
      const closeRemainder =
        'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA';
      const note = algosdk.base64ToBytes('X4Bl4wQ9rCo=');
      const oDict = {
        receiver: toAddr,
        sender: fromAddr,
        fee,
        amount,
        firstValid,
        lastValid,
        genesisID,
        genesisHash,
        closeRemainderTo: closeRemainder,
        note,
      };
      const suggestedParams = {
        genesisHash,
        genesisID,
        firstValid,
        lastValid,
        fee,
      };
      const oObj = algosdk.makePaymentTxnWithSuggestedParams(
        fromAddr,
        toAddr,
        amount,
        closeRemainder,
        note,
        suggestedParams
      );

      const oDictOutput = algosdk.signMultisigTransaction(oDict, params, sk);
      const oObjOutput = algosdk.signMultisigTransaction(oObj, params, sk);
      assert.deepStrictEqual(oDictOutput.txID, oObjOutput.txID);
      assert.deepStrictEqual(oDictOutput.blob, oObjOutput.blob);
    });
  });

  describe('Multisig Append', () => {
    it('should return a blob that matches the go code', () => {
      const params = {
        version: 1,
        threshold: 2,
        addrs: [
          'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA',
          'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM',
          '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU',
        ],
      };
      const mnem1 =
        'auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch';
      const { sk } = algosdk.mnemonicToSecretKey(mnem1);

      // this is a multisig transaction with an existing signature
      const o = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgaJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXiBonBrxCAJYzIJU3OJ8HVnEXc5kcfQPhtzyMT1K/av8BqiXPnCcYKicGvEIOfw+E0GgR358xyNh4sRVfRnHVGhhcIAkIZn9ElYcGihoXPEQF6nXZ7CgInd1h7NVspIPFZNhkPL+vGFpTNwH3Eh9gwPM8pf1EPTHfPvjf14sS7xN7mTK+wrz7Odhp4rdWBNUASjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQSYomZ2zTCyo2dlbqxkZXZuZXQtdjMzLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zTSapG5vdGXECF+AZeMEPawqo3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ=='
      );

      const jsDec = algosdk.appendSignMultisigTransaction(o, params, sk);
      const golden = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAjmG2MILQVLoKg8q7jAYpu0r42zu9edYHrkkuSAikJAnDPplY1Pq90/ssyFhpKLrmvDDcSwNAwTGBjqtSOFYUAIGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgqJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGhc8RAXqddnsKAid3WHs1Wykg8Vk2GQ8v68YWlM3AfcSH2DA8zyl/UQ9Md8++N/XixLvE3uZMr7CvPs52Gnit1YE1QBKN0aHICoXYBo3R4boujYW10zQPopWNsb3NlxCBA6TSSiCVky86cWaabZ1Qmiemhw6Kp6ltlpuikQh/8V6NmZWXNBJiiZnbNMLKjZ2VurGRldm5ldC12MzMuMKJnaMQgJgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dKibHbNNJqkbm90ZcQIX4Bl4wQ9rCqjcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5'
      );
      assert.deepStrictEqual(jsDec.blob, golden);

      // Check txid
      const txGolden = 'TDIO6RJWJIVDDJZELMSX5CPJW7MUNM3QR4YAHYAKHF3W2CFRTI7A';
      assert.deepStrictEqual(jsDec.txID, txGolden);
    });
  });

  describe('Multisig Address', () => {
    it('should return the correct address from preimage', () => {
      const params = {
        version: 1,
        threshold: 2,
        addrs: [
          'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA',
          'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM',
          '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU',
        ],
      };
      const outAddr = algosdk.multisigAddress(params);
      assert.deepStrictEqual(
        outAddr,
        'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
      );
    });
  });

  describe('Group operations', () => {
    it('should return a blob that matches the go code', () => {
      const address =
        'UPYAFLHSIPMJOHVXU2MPLQ46GXJKSDCEMZ6RLCQ7GWB5PRDKJUWKKXECXI';
      const [fromAddress, toAddress] = [address, address];
      const fee = 1000;
      const amount = 2000;
      const genesisID = 'devnet-v1.0';
      const genesisHash = 'sC3P7e2SdbqKJK0tbiCdK9tdSpbe6XeCGKdoNzmlj0E';
      const firstValid1 = 710399;
      const note1 = algosdk.base64ToBytes('wRKw5cJ0CMo=');
      const o1 = {
        receiver: toAddress,
        sender: fromAddress,
        fee,
        amount,
        firstValid: firstValid1,
        lastValid: firstValid1 + 1000,
        genesisID,
        genesisHash,
        note: note1,
        flatFee: true,
      };

      const firstValid2 = 710515;
      const note2 = algosdk.base64ToBytes('dBlHI6BdrIg=');

      const o2 = {
        receiver: toAddress,
        sender: fromAddress,
        fee,
        amount,
        firstValid: firstValid2,
        lastValid: firstValid2 + 1000,
        genesisID,
        genesisHash,
        note: note2,
        flatFee: true,
      };

      const goldenTx1 =
        'gaN0eG6Ko2FtdM0H0KNmZWXNA+iiZnbOAArW/6NnZW6rZGV2bmV0LXYxLjCiZ2jEILAtz+3tknW6iiStLW4gnSvbXUqW3ul3ghinaDc5pY9Bomx2zgAK2uekbm90ZcQIwRKw5cJ0CMqjcmN2xCCj8AKs8kPYlx63ppj1w5410qkMRGZ9FYofNYPXxGpNLKNzbmTEIKPwAqzyQ9iXHremmPXDnjXSqQxEZn0Vih81g9fEak0spHR5cGWjcGF5';
      const goldenTx2 =
        'gaN0eG6Ko2FtdM0H0KNmZWXNA+iiZnbOAArXc6NnZW6rZGV2bmV0LXYxLjCiZ2jEILAtz+3tknW6iiStLW4gnSvbXUqW3ul3ghinaDc5pY9Bomx2zgAK21ukbm90ZcQIdBlHI6BdrIijcmN2xCCj8AKs8kPYlx63ppj1w5410qkMRGZ9FYofNYPXxGpNLKNzbmTEIKPwAqzyQ9iXHremmPXDnjXSqQxEZn0Vih81g9fEak0spHR5cGWjcGF5';

      const tx1 = new algosdk.Transaction(o1);
      const tx2 = new algosdk.Transaction(o2);

      // goal clerk send dumps unsigned transaction as signed with empty signature in order to save tx type
      let stx1 = algosdk.encodeObj({ txn: tx1.get_obj_for_encoding() });
      let stx2 = algosdk.encodeObj({ txn: tx2.get_obj_for_encoding() });
      assert.deepStrictEqual(stx1, algosdk.base64ToBytes(goldenTx1));
      assert.deepStrictEqual(stx2, algosdk.base64ToBytes(goldenTx2));

      // goal clerk group sets Group to every transaction and concatenate them in output file
      // simulating that behavior here
      const goldenTxg =
        'gaN0eG6Lo2FtdM0H0KNmZWXNA+iiZnbOAArW/6NnZW6rZGV2bmV0LXYxLjCiZ2jEILAtz+3tknW6iiStLW4gnSvbXUqW3ul3ghinaDc5pY9Bo2dycMQgLiQ9OBup9H/bZLSfQUH2S6iHUM6FQ3PLuv9FNKyt09SibHbOAAra56Rub3RlxAjBErDlwnQIyqNyY3bEIKPwAqzyQ9iXHremmPXDnjXSqQxEZn0Vih81g9fEak0so3NuZMQgo/ACrPJD2Jcet6aY9cOeNdKpDERmfRWKHzWD18RqTSykdHlwZaNwYXmBo3R4boujYW10zQfQo2ZlZc0D6KJmds4ACtdzo2dlbqtkZXZuZXQtdjEuMKJnaMQgsC3P7e2SdbqKJK0tbiCdK9tdSpbe6XeCGKdoNzmlj0GjZ3JwxCAuJD04G6n0f9tktJ9BQfZLqIdQzoVDc8u6/0U0rK3T1KJsds4ACttbpG5vdGXECHQZRyOgXayIo3JjdsQgo/ACrPJD2Jcet6aY9cOeNdKpDERmfRWKHzWD18RqTSyjc25kxCCj8AKs8kPYlx63ppj1w5410qkMRGZ9FYofNYPXxGpNLKR0eXBlo3BheQ==';
      {
        const gid = algosdk.computeGroupID([tx1, tx2]);
        tx1.group = gid;
        tx2.group = gid;
        stx1 = algosdk.encodeObj({ txn: tx1.get_obj_for_encoding() });
        stx2 = algosdk.encodeObj({ txn: tx2.get_obj_for_encoding() });
        const concat = utils.concatArrays(stx1, stx2);
        assert.deepStrictEqual(concat, algosdk.base64ToBytes(goldenTxg));
      }

      // check computeGroupID for list of dicts (not Transaction objects)
      {
        const gid = algosdk.computeGroupID([o1, o2]);
        tx1.group = gid;
        tx2.group = gid;
        stx1 = algosdk.encodeObj({ txn: tx1.get_obj_for_encoding() });
        stx2 = algosdk.encodeObj({ txn: tx2.get_obj_for_encoding() });
        const concat = utils.concatArrays(stx1, stx2);
        assert.deepStrictEqual(concat, algosdk.base64ToBytes(goldenTxg));
      }

      // check filtering by address in assignGroupID
      let result;
      result = algosdk.assignGroupID([tx1, tx2]);
      assert.equal(result.length, 2);

      result = algosdk.assignGroupID([tx1, tx2], '');
      assert.equal(result.length, 2);

      result = algosdk.assignGroupID([tx1, tx2], address);
      assert.equal(result.length, 2);

      result = algosdk.assignGroupID(
        [tx1, tx2],
        'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA'
      );
      assert.ok(result instanceof Array);
      assert.equal(result.length, 0);
    });
  });

  describe('assets', () => {
    it('should return a blob that matches the go code for asset create', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const golden =
        'gqNzaWfEQEDd1OMRoQI/rzNlU4iiF50XQXmup3k5czI9hEsNqHT7K4KsfmA/0DUVkbzOwtJdRsHS8trm3Arjpy9r7AXlbAujdHhuh6RhcGFyiaJhbcQgZkFDUE80blJnTzU1ajFuZEFLM1c2U2djNEFQa2N5RmiiYW6odGVzdGNvaW6iYXWnd2Vic2l0ZaFjxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFmxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFtxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFyxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aF0ZKJ1bqN0c3SjZmVlzQ+0omZ2zgAE7A+iZ2jEIEhjtRiks8hOyBDyLU8QgcsPcfBZp6wg3sYvf3DlCToiomx2zgAE7/ejc25kxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aR0eXBlpGFjZmc=';
      let sk =
        'awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred';
      const createTxn = {
        sender: address,
        fee: 10,
        firstValid: 322575,
        lastValid: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetTotal: 100,
        assetDefaultFrozen: false,
        assetManager: address,
        assetReserve: address,
        assetFreeze: address,
        assetClawback: address,
        assetUnitName: 'tst',
        assetName: 'testcoin',
        assetURL: 'website',
        assetMetadataHash: 'fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh',
        type: 'acfg',
      };
      sk = algosdk.mnemonicToSecretKey(sk);
      const jsDecCreate = algosdk.signTransaction(createTxn, sk.sk);
      assert.deepStrictEqual(jsDecCreate.blob, algosdk.base64ToBytes(golden));
    });

    it('should return a blob that matches the go code for asset create with decimals', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const golden =
        'gqNzaWfEQCj5xLqNozR5ahB+LNBlTG+d0gl0vWBrGdAXj1ibsCkvAwOsXs5KHZK1YdLgkdJecQiWm4oiZ+pm5Yg0m3KFqgqjdHhuh6RhcGFyiqJhbcQgZkFDUE80blJnTzU1ajFuZEFLM1c2U2djNEFQa2N5RmiiYW6odGVzdGNvaW6iYXWnd2Vic2l0ZaFjxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aJkYwGhZsQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2hbcQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2hcsQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2hdGSidW6jdHN0o2ZlZc0P3KJmds4ABOwPomdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds4ABO/3o3NuZMQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2kdHlwZaRhY2Zn';
      let sk =
        'awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred';
      const createTxn = {
        sender: address,
        fee: 10,
        firstValid: 322575,
        lastValid: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetTotal: 100,
        assetDecimals: 1,
        assetDefaultFrozen: false,
        assetManager: address,
        assetReserve: address,
        assetFreeze: address,
        assetClawback: address,
        assetUnitName: 'tst',
        assetName: 'testcoin',
        assetURL: 'website',
        assetMetadataHash: 'fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh',
        type: 'acfg',
      };
      sk = algosdk.mnemonicToSecretKey(sk);
      const jsDecCreate = algosdk.signTransaction(createTxn, sk.sk);
      assert.deepStrictEqual(jsDecCreate.blob, algosdk.base64ToBytes(golden));
    });

    it('should return a blob that matches the go code for asset configuration', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const golden =
        'gqNzaWfEQBBkfw5n6UevuIMDo2lHyU4dS80JCCQ/vTRUcTx5m0ivX68zTKyuVRrHaTbxbRRc3YpJ4zeVEnC9Fiw3Wf4REwejdHhuiKRhcGFyhKFjxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFmxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFtxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFyxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aRjYWlkzQTSo2ZlZc0NSKJmds4ABOwPomdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds4ABO/3o3NuZMQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2kdHlwZaRhY2Zn';
      let sk =
        'awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred';
      const o = {
        sender: address,
        fee: 10,
        firstValid: 322575,
        lastValid: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetIndex: 1234,
        assetManager: address,
        assetReserve: address,
        assetFreeze: address,
        assetClawback: address,
        type: 'acfg',
      };
      sk = algosdk.mnemonicToSecretKey(sk);
      const jsDec = algosdk.signTransaction(o, sk.sk);
      assert.deepStrictEqual(jsDec.blob, algosdk.base64ToBytes(golden));
    });

    it('should return a blob that matches the go code for asset destroy', () => {
      const address =
        'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const golden =
        'gqNzaWfEQBSP7HtzD/Lvn4aVvaNpeR4T93dQgo4LvywEwcZgDEoc/WVl3aKsZGcZkcRFoiWk8AidhfOZzZYutckkccB8RgGjdHhuh6RjYWlkAaNmZWXNB1iiZnbOAATsD6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbOAATv96NzbmTEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pHR5cGWkYWNmZw==';
      let sk =
        'awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred';
      const o = {
        sender: address,
        fee: 10,
        firstValid: 322575,
        lastValid: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetIndex: 1,
        type: 'acfg',
      };
      sk = algosdk.mnemonicToSecretKey(sk);
      const jsDec = algosdk.signTransaction(o, sk.sk);
      assert.deepStrictEqual(jsDec.blob, algosdk.base64ToBytes(golden));
    });
    it('should return a blob that matches the go code for asset freeze', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';
      const o = {
        sender: addr,
        fee: 10,
        firstValid: 322575,
        lastValid: 323576,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        type: 'afrz',
        freezeAccount: addr,
        assetIndex: 1,
        assetFrozen: true,
      };

      const mnem =
        'awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred';
      const { sk } = algosdk.mnemonicToSecretKey(mnem);
      const jsDec = algosdk.signTransaction(o, sk);
      const golden = algosdk.base64ToBytes(
        'gqNzaWfEQAhru5V2Xvr19s4pGnI0aslqwY4lA2skzpYtDTAN9DKSH5+qsfQQhm4oq+9VHVj7e1rQC49S28vQZmzDTVnYDQGjdHhuiaRhZnJ6w6RmYWRkxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aRmYWlkAaNmZWXNCRqiZnbOAATsD6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbOAATv+KNzbmTEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pHR5cGWkYWZyeg=='
      );
      assert.deepStrictEqual(jsDec.blob, golden);
    });
    it('should return a blob that matches the go code for asset transfer', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';

      const o = {
        type: 'axfer',
        sender: addr,
        receiver: addr,
        amount: 1,
        fee: 10,
        firstValid: 322575,
        lastValid: 323576,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetIndex: 1,
        closeRemainderTo: addr,
      };

      const mnem =
        'awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred';
      const { sk } = algosdk.mnemonicToSecretKey(mnem);
      const jsDec = algosdk.signTransaction(o, sk);
      const golden = algosdk.base64ToBytes(
        'gqNzaWfEQNkEs3WdfFq6IQKJdF1n0/hbV9waLsvojy9pM1T4fvwfMNdjGQDy+LeesuQUfQVTneJD4VfMP7zKx4OUlItbrwSjdHhuiqRhYW10AaZhY2xvc2XEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pGFyY3bEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9o2ZlZc0KvqJmds4ABOwPomdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds4ABO/4o3NuZMQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2kdHlwZaVheGZlcqR4YWlkAQ=='
      );
      assert.deepStrictEqual(jsDec.blob, golden);
    });
    it('should return a blob that matches the go code for asset accept', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';

      const o = {
        type: 'axfer',
        sender: addr,
        receiver: addr,
        amount: 0,
        fee: 10,
        firstValid: 322575,
        lastValid: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetIndex: 1,
      };

      const mnem =
        'awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred';
      const { sk } = algosdk.mnemonicToSecretKey(mnem);
      const jsDec = algosdk.signTransaction(o, sk);
      const golden = algosdk.base64ToBytes(
        'gqNzaWfEQJ7q2rOT8Sb/wB0F87ld+1zMprxVlYqbUbe+oz0WM63FctIi+K9eYFSqT26XBZ4Rr3+VTJpBE+JLKs8nctl9hgijdHhuiKRhcmN2xCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aNmZWXNCOiiZnbOAATsD6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbOAATv96NzbmTEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pHR5cGWlYXhmZXKkeGFpZAE='
      );
      assert.deepStrictEqual(jsDec.blob, golden);
    });
    it('should return a blob that matches the go code for asset revoke', () => {
      const addr = 'BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4';

      const o = {
        type: 'axfer',
        sender: addr,
        receiver: addr,
        assetSender: addr,
        amount: 1,
        fee: 10,
        firstValid: 322575,
        lastValid: 323575,
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
        assetIndex: 1,
      };

      const mnem =
        'awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred';
      const { sk } = algosdk.mnemonicToSecretKey(mnem);
      const jsDec = algosdk.signTransaction(o, sk);
      const golden = algosdk.base64ToBytes(
        'gqNzaWfEQHsgfEAmEHUxLLLR9s+Y/yq5WeoGo/jAArCbany+7ZYwExMySzAhmV7M7S8+LBtJalB4EhzEUMKmt3kNKk6+vAWjdHhuiqRhYW10AaRhcmN2xCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aRhc25kxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aNmZWXNCqqiZnbOAATsD6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbOAATv96NzbmTEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pHR5cGWlYXhmZXKkeGFpZAE='
      );
      assert.deepStrictEqual(jsDec.blob, golden);
    });
  });

  describe('LogicSig', () => {
    it('should return valid logic sig object', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]); // int 1
      let lsig = new algosdk.LogicSig(program);
      assert.equal(lsig.logic, program);
      assert.equal(lsig.args, undefined);
      assert.equal(lsig.sig, undefined);
      assert.equal(lsig.msig, undefined);

      const args = [Uint8Array.from('123'), Uint8Array.from('456')];
      lsig = new algosdk.LogicSig(program, args);
      assert.equal(lsig.logic, program);
      assert.deepEqual(lsig.args, args);
    });
  });
  describe('Single logic sig', () => {
    it('should work on valid program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const keys = algosdk.generateAccount();
      const lsig = new algosdk.LogicSig(program);
      lsig.sign(keys.sk);
      const verified = lsig.verify(algosdk.decodeAddress(keys.addr).publicKey);
      assert.equal(verified, true);

      // check serialization
      const encoded = lsig.toByte();
      const decoded = algosdk.logicSigFromByte(encoded);
      assert.deepStrictEqual(decoded, lsig);
    });
  });
  describe('Multisig logic sig', () => {
    it('should work on valid program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const lsig = new algosdk.LogicSig(program);

      const keys = algosdk.generateAccount();
      assert.throws(() => lsig.appendToMultisig(keys.sk), 'empty msig');

      const params = {
        version: 1,
        threshold: 2,
        addrs: [
          'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA',
          'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM',
          '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU',
        ],
      };
      const outAddr = algosdk.multisigAddress(params);
      const msigPk = algosdk.decodeAddress(outAddr).publicKey;
      const mn1 =
        'auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch';
      const mn2 =
        'since during average anxiety protect cherry club long lawsuit loan expand embark forum theory winter park twenty ball kangaroo cram burst board host ability left';
      const sk1 = algosdk.mnemonicToSecretKey(mn1);
      const sk2 = algosdk.mnemonicToSecretKey(mn2);

      lsig.sign(sk1.sk, params);

      // fails on wrong key
      assert.throws(() => lsig.appendToMultisig(keys.sk));

      lsig.appendToMultisig(sk2.sk);
      let verified = lsig.verify(msigPk);
      assert.equal(verified, true);

      // combine sig and msig
      const lsigf = new algosdk.LogicSig(program);
      lsigf.sign(keys.sk);
      lsig.sig = lsigf.sig;
      verified = lsig.verify(msigPk);
      assert.equal(verified, false);

      lsig.sig = undefined;
      verified = lsig.verify(msigPk);
      assert.equal(verified, true);

      // check serialization
      const encoded = lsig.toByte();
      const decoded = algosdk.logicSigFromByte(encoded);
      assert.deepStrictEqual(decoded, lsig);
    });
  });

  describe('LogicSig Transaction', () => {
    it('should match to goal-produced logic signed tx', () => {
      const fromAddress =
        '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU';
      const toAddress =
        'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI';
      const mn =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      const fee = 1000;
      const amount = 2000;
      const firstValid = 2063137;
      const genesisID = 'devnet-v1.0';
      const genesisHash = 'sC3P7e2SdbqKJK0tbiCdK9tdSpbe6XeCGKdoNzmlj0E=';
      const note = algosdk.base64ToBytes('8xMCTuLQ810=');

      const txn = {
        receiver: toAddress,
        sender: fromAddress,
        fee,
        amount,
        firstValid,
        lastValid: firstValid + 1000,
        genesisID,
        genesisHash,
        note,
        flatFee: true,
      };

      const program = Uint8Array.from([1, 32, 1, 1, 34]); // int 1
      const args = [
        Uint8Array.from([49, 50, 51]),
        Uint8Array.from([52, 53, 54]),
      ];
      const lsig = new algosdk.LogicSig(program, args);
      const sk = algosdk.mnemonicToSecretKey(mn);
      lsig.sign(sk.sk);

      const jsDec = algosdk.signLogicSigTransaction(txn, lsig);

      // goal clerk send -o tx3 -a 2000 --fee 1000 -d ~/.algorand -w test -L sig.lsig --argb64 MTIz --argb64 NDU2 \
      // -f 47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU \
      // -t PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI
      const golden =
        'gqRsc2lng6NhcmeSxAMxMjPEAzQ1NqFsxAUBIAEBIqNzaWfEQE6HXaI5K0lcq50o/y3bWOYsyw9TLi/oorZB4xaNdn1Z14351u2f6JTON478fl+JhIP4HNRRAIh/I8EWXBPpJQ2jdHhuiqNhbXTNB9CjZmVlzQPoomZ2zgAfeyGjZ2Vuq2Rldm5ldC12MS4womdoxCCwLc/t7ZJ1uookrS1uIJ0r211Klt7pd4IYp2g3OaWPQaJsds4AH38JpG5vdGXECPMTAk7i0PNdo3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaR0eXBlo3BheQ==';

      assert.deepStrictEqual(jsDec.blob, algosdk.base64ToBytes(golden));
      const senderPk = algosdk.decodeAddress(fromAddress).publicKey;
      const verified = lsig.verify(senderPk);
      assert.equal(verified, true);
    });
  });

  describe('tealSign', () => {
    const data = algosdk.base64ToBytes('Ux8jntyBJQarjKGF8A==');
    const prog = algosdk.base64ToBytes('ASABASI=');
    const addr = new algosdk.LogicSig(prog).address();

    const seed = algosdk.base64ToBytes(
      '5Pf7eGMA52qfMT4R4/vYCt7con/7U3yejkdXkrcb26Q='
    );
    const { publicKey: pk, secretKey: sk } = nacl.keyPairFromSeed(seed);

    it('should produce a verifiable signature', () => {
      const sig = algosdk.tealSign(sk, data, addr);

      const parts = utils.concatArrays(
        algosdk.decodeAddress(addr).publicKey,
        data
      );
      const toBeVerified = utils.concatArrays(
        new TextEncoder().encode('ProgData'),
        parts
      );
      const verified = nacl.verify(toBeVerified, sig, pk);
      assert.equal(verified, true);
    });

    it('should produce a verifiable signature from a program', () => {
      const sig1 = algosdk.tealSign(sk, data, addr);
      const sig2 = algosdk.tealSignFromProgram(sk, data, prog);

      assert.deepStrictEqual(sig1, sig2);
    });

    it('should verify a valid signature', () => {
      const sig = algosdk.tealSign(sk, data, addr);

      const verified = algosdk.verifyTealSign(data, addr, sig, pk);
      assert.equal(verified, true);
    });
  });

  describe('v2 Dryrun models', () => {
    const schema = new algosdk.modelsv2.ApplicationStateSchema({
      numUint: 5,
      numByteSlice: 5,
    });
    const acc = new algosdk.modelsv2.Account({
      address: 'UAPJE355K7BG7RQVMTZOW7QW4ICZJEIC3RZGYG5LSHZ65K6LCNFPJDSR7M',
      amount: 5002280000000000,
      amountWithoutPendingRewards: 5000000000000000,
      pendingRewards: 2280000000000,
      rewardBase: 456,
      rewards: 2280000000000,
      round: 18241,
      status: 'Online',
    });
    const params = new algosdk.modelsv2.ApplicationParams({
      creator: 'UAPJE355K7BG7RQVMTZOW7QW4ICZJEIC3RZGYG5LSHZ65K6LCNFPJDSR7M',
      approvalProgram: 'AiABASI=',
      clearStateProgram: 'AiABASI=',
      localStateSchema: schema,
      globalStateSchema: schema,
    });
    const app = new algosdk.modelsv2.Application({
      id: 1380011588,
      params,
    });
    // make a raw txn
    const txn = {
      apsu: 'AiABASI=',
      fee: 1000,
      fv: 18242,
      gh: 'ZIkPs8pTDxbRJsFB1yJ7gvnpDu0Q85FRkl2NCkEAQLU=',
      lv: 19242,
      note: 'tjpNge78JD8=',
      snd: 'UAPJE355K7BG7RQVMTZOW7QW4ICZJEIC3RZGYG5LSHZ65K6LCNFPJDSR7M',
      type: 'appl',
    };
    const req = new algosdk.modelsv2.DryrunRequest({
      accounts: [acc],
      apps: [app],
      round: 18241,
      protocolVersion: 'future',
      latestTimestamp: 1592537757,
      txns: [{ txn }],
    });

    it('should be properly serialized to JSON', () => {
      const actual = req.get_obj_for_encoding();

      const golden =
        'ewogICJhY2NvdW50cyI6IFsKICAgIHsKICAgICAgImFkZHJlc3MiOiAiVUFQSkUzNTVLN0JHN1JRVk1UWk9XN1FXNElDWkpFSUMzUlpHWUc1TFNIWjY1SzZMQ05GUEpEU1I3TSIsCiAgICAgICJhbW91bnQiOiA1MDAyMjgwMDAwMDAwMDAwLAogICAgICAiYW1vdW50LXdpdGhvdXQtcGVuZGluZy1yZXdhcmRzIjogNTAwMDAwMDAwMDAwMDAwMCwKICAgICAgInBlbmRpbmctcmV3YXJkcyI6IDIyODAwMDAwMDAwMDAsCiAgICAgICJyZXdhcmQtYmFzZSI6IDQ1NiwKICAgICAgInJld2FyZHMiOiAyMjgwMDAwMDAwMDAwLAogICAgICAicm91bmQiOiAxODI0MSwKICAgICAgInN0YXR1cyI6ICJPbmxpbmUiCiAgICB9CiAgXSwKICAiYXBwcyI6IFsKICAgIHsKICAgICAgImlkIjogMTM4MDAxMTU4OCwKICAgICAgInBhcmFtcyI6IHsKICAgICAgICAiY3JlYXRvciI6ICJVQVBKRTM1NUs3Qkc3UlFWTVRaT1c3UVc0SUNaSkVJQzNSWkdZRzVMU0haNjVLNkxDTkZQSkRTUjdNIiwKICAgICAgICAiYXBwcm92YWwtcHJvZ3JhbSI6ICJBaUFCQVNJPSIsCiAgICAgICAgImNsZWFyLXN0YXRlLXByb2dyYW0iOiAiQWlBQkFTST0iLAogICAgICAgICJnbG9iYWwtc3RhdGUtc2NoZW1hIjogewogICAgICAgICAgIm51bS1ieXRlLXNsaWNlIjogNSwKICAgICAgICAgICJudW0tdWludCI6IDUKICAgICAgICB9LAogICAgICAgICJsb2NhbC1zdGF0ZS1zY2hlbWEiOiB7CiAgICAgICAgICAibnVtLWJ5dGUtc2xpY2UiOiA1LAogICAgICAgICAgIm51bS11aW50IjogNQogICAgICAgIH0KICAgICAgfQogICAgfQogIF0sCiAgImxhdGVzdC10aW1lc3RhbXAiOiAxNTkyNTM3NzU3LAogICJwcm90b2NvbC12ZXJzaW9uIjogImZ1dHVyZSIsCiAgInJvdW5kIjogMTgyNDEsCiAgInR4bnMiOiBbCiAgICB7CiAgICAgICJ0eG4iOiB7CiAgICAgICAgImFwc3UiOiAiQWlBQkFTST0iLAogICAgICAgICJmZWUiOiAxMDAwLAogICAgICAgICJmdiI6IDE4MjQyLAogICAgICAgICJnaCI6ICJaSWtQczhwVER4YlJKc0ZCMXlKN2d2bnBEdTBRODVGUmtsMk5Da0VBUUxVPSIsCiAgICAgICAgImx2IjogMTkyNDIsCiAgICAgICAgIm5vdGUiOiAidGpwTmdlNzhKRDg9IiwKICAgICAgICAic25kIjogIlVBUEpFMzU1SzdCRzdSUVZNVFpPVzdRVzRJQ1pKRUlDM1JaR1lHNUxTSFo2NUs2TENORlBKRFNSN00iLAogICAgICAgICJ0eXBlIjogImFwcGwiCiAgICAgIH0KICAgIH0KICBdCn0K';
      const goldenString = algosdk.base64ToString(golden, 'base64');
      const expected = JSON.parse(goldenString);

      assert.deepStrictEqual(actual, expected);
    });

    it('should be properly serialized to msgpack', () => {
      const actual = req.get_obj_for_encoding(true);
      const golden =
        'hqhhY2NvdW50c5GIp2FkZHJlc3PZOlVBUEpFMzU1SzdCRzdSUVZNVFpPVzdRVzRJQ1pKRUlDM1JaR1lHNUxTSFo2NUs2TENORlBKRFNSN02mYW1vdW50zwARxYwSd5AAvmFtb3VudC13aXRob3V0LXBlbmRpbmctcmV3YXJkc88AEcN5N+CAAK9wZW5kaW5nLXJld2FyZHPPAAACEtqXEACrcmV3YXJkLWJhc2XNAcincmV3YXJkc88AAAIS2pcQAKVyb3VuZM1HQaZzdGF0dXOmT25saW5lpGFwcHORgqJpZM5SQU5EpnBhcmFtc4WwYXBwcm92YWwtcHJvZ3JhbcQFAiABASKzY2xlYXItc3RhdGUtcHJvZ3JhbcQFAiABASKnY3JlYXRvctk6VUFQSkUzNTVLN0JHN1JRVk1UWk9XN1FXNElDWkpFSUMzUlpHWUc1TFNIWjY1SzZMQ05GUEpEU1I3TbNnbG9iYWwtc3RhdGUtc2NoZW1hgq5udW0tYnl0ZS1zbGljZQWobnVtLXVpbnQFsmxvY2FsLXN0YXRlLXNjaGVtYYKubnVtLWJ5dGUtc2xpY2UFqG51bS11aW50BbBsYXRlc3QtdGltZXN0YW1wzl7sMp2wcHJvdG9jb2wtdmVyc2lvbqZmdXR1cmWlcm91bmTNR0GkdHhuc5GBo3R4boikYXBzdahBaUFCQVNJPaNmZWXNA+iiZnbNR0KiZ2jZLFpJa1BzOHBURHhiUkpzRkIxeUo3Z3ZucER1MFE4NUZSa2wyTkNrRUFRTFU9omx2zUsqpG5vdGWsdGpwTmdlNzhKRDg9o3NuZNk6VUFQSkUzNTVLN0JHN1JRVk1UWk9XN1FXNElDWkpFSUMzUlpHWUc1TFNIWjY1SzZMQ05GUEpEU1I3TaR0eXBlpGFwcGw=';
      const goldenBinary = new Uint8Array(algosdk.base64ToBytes(golden));
      const expected = algosdk.decodeObj(goldenBinary);

      assert.deepStrictEqual(actual, expected);
    });
  });
});
