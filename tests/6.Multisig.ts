/* eslint-env mocha */
import assert from 'assert';
import algosdk from '../src/index';
import { MULTISIG_SIGNATURE_LENGTH_ERROR_MSG } from '../src/multisigSigning';

const sampleAccount1 = algosdk.mnemonicToSecretKey(
  'auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch'
);
const sampleAccount2 = algosdk.mnemonicToSecretKey(
  'since during average anxiety protect cherry club long lawsuit loan expand embark forum theory winter park twenty ball kangaroo cram burst board host ability left'
);
const sampleAccount3 = algosdk.mnemonicToSecretKey(
  'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor'
);

// Multisig Golden Params
const sampleMultisigParams: algosdk.MultisigMetadata = {
  version: 1,
  threshold: 2,
  addrs: [sampleAccount1.addr, sampleAccount2.addr, sampleAccount3.addr],
};

const sampleMultisigAddr = algosdk.multisigAddress(sampleMultisigParams);

describe('Sample Multisig Info', () => {
  it('is correct', () => {
    assert.deepStrictEqual(
      sampleAccount1.addr,
      algosdk.Address.fromString(
        'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA'
      )
    );
    assert.deepStrictEqual(
      sampleAccount2.addr,
      algosdk.Address.fromString(
        'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM'
      )
    );
    assert.deepStrictEqual(
      sampleAccount3.addr,
      algosdk.Address.fromString(
        '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU'
      )
    );
    assert.deepStrictEqual(
      sampleMultisigAddr,
      algosdk.Address.fromString(
        'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
      )
    );
  });
});

describe('Multisig Functionality', () => {
  describe('signMultisigTransaction', () => {
    it('should match golden main repo result', () => {
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: sampleMultisigAddr,
        receiver: 'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI',
        amount: 1000,
        note: algosdk.base64ToBytes('RSYiABhShvs='),
        closeRemainderTo:
          'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA',
        suggestedParams: {
          minFee: 1000,
          fee: 1000,
          flatFee: true,
          firstValid: 62229,
          lastValid: 63229,
          genesisID: 'devnet-v38.0',
          genesisHash: algosdk.base64ToBytes(
            '/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp0='
          ),
        },
      });

      const { txID, blob } = algosdk.signMultisigTransaction(
        txn,
        sampleMultisigParams,
        sampleAccount1.sk
      );

      const expectedTxID =
        'MANN3ESOHQVHFZBAGD6UK6XFVWEFZQJPWO5SQ2J5LZRCF5E2VVQQ';
      assert.strictEqual(txID, expectedTxID);

      const expectedSignedTxn = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ=='
      );
      assert.deepStrictEqual(blob, expectedSignedTxn);
    });

    it('should correctly handle a different sender', () => {
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: 'EHGMQCXBIFBE364DEKWQVVNCTCTVCGQL3BR2Q5I7CFTRXWIVTF4SYA3GHU',
        receiver: 'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI',
        amount: 1000,
        note: algosdk.base64ToBytes('RSYiABhShvs='),
        closeRemainderTo:
          'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA',
        suggestedParams: {
          minFee: 1000,
          fee: 1000,
          flatFee: true,
          firstValid: 62229,
          lastValid: 63229,
          genesisID: 'devnet-v38.0',
          genesisHash: algosdk.base64ToBytes(
            '/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp0='
          ),
        },
      });

      const { txID, blob } = algosdk.signMultisigTransaction(
        txn,
        sampleMultisigParams,
        sampleAccount1.sk
      );

      const expectedTxID =
        'YQOXQNNO56WXQSU3IDUM2C4J7IZI6WMSCMKN5UCP5ZK6GWA6BXKQ';
      assert.strictEqual(txID, expectedTxID);

      const expectedSignedTxn = algosdk.base64ToBytes(
        'g6Rtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAWLcyn6nB68yo/PUHXB21wyTy+PhHgMQNOIXPTGB96faZP2xqpQ8IFlIR2LPotlX68ylK8MCl82SUfMR4FYyzAIGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaRzZ25yxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCAhzMgK4UFCTfuDIq0K1aKYp1EaC9hjqHUfEWcb2RWZeaR0eXBlo3BheQ=='
      );
      assert.deepStrictEqual(blob, expectedSignedTxn);
    });
  });

  describe('appendSignMultisigTransaction', () => {
    it('should match golden main repo result', () => {
      const oneSigTxn = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ=='
      );

      const { txID, blob } = algosdk.appendSignMultisigTransaction(
        oneSigTxn,
        sampleMultisigParams,
        sampleAccount2.sk
      );

      const expectedTxID =
        'MANN3ESOHQVHFZBAGD6UK6XFVWEFZQJPWO5SQ2J5LZRCF5E2VVQQ';
      assert.strictEqual(txID, expectedTxID);

      const expectedBlob = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQBAhuyRjsOrnHp3s/xI+iMKiL7QPsh8iJZ22YOJJP0aFUwedMr+a6wfdBXk1OefyrAN1wqJ9rq6O+DrWV1fH0ASBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBo3R4boujYW10zQPopWNsb3NlxCBA6TSSiCVky86cWaabZ1Qmiemhw6Kp6ltlpuikQh/8V6NmZWXNA+iiZnbN8xWjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbN9v2kbm90ZcQIRSYiABhShvujcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5'
      );
      assert.deepStrictEqual(blob, expectedBlob);
    });

    it('should correctly handle a different sender', () => {
      const oneSigTxn = algosdk.base64ToBytes(
        'g6Rtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAWLcyn6nB68yo/PUHXB21wyTy+PhHgMQNOIXPTGB96faZP2xqpQ8IFlIR2LPotlX68ylK8MCl82SUfMR4FYyzAIGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaRzZ25yxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCAhzMgK4UFCTfuDIq0K1aKYp1EaC9hjqHUfEWcb2RWZeaR0eXBlo3BheQ=='
      );

      const { txID, blob } = algosdk.appendSignMultisigTransaction(
        oneSigTxn,
        sampleMultisigParams,
        sampleAccount2.sk
      );

      const expectedTxID =
        'YQOXQNNO56WXQSU3IDUM2C4J7IZI6WMSCMKN5UCP5ZK6GWA6BXKQ';
      assert.strictEqual(txID, expectedTxID);

      const expectedBlob = algosdk.base64ToBytes(
        'g6Rtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAWLcyn6nB68yo/PUHXB21wyTy+PhHgMQNOIXPTGB96faZP2xqpQ8IFlIR2LPotlX68ylK8MCl82SUfMR4FYyzAIKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQPuH2WlM2x1tflA6LGMhKXBiuO7dsRzjXYPgcfjvDth9ZsCazyOKHqQmtYjD+pXLM8fJbrRhoUGTkyLxINiT9wCBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBpHNnbnLEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfpo3R4boujYW10zQPopWNsb3NlxCBA6TSSiCVky86cWaabZ1Qmiemhw6Kp6ltlpuikQh/8V6NmZWXNA+iiZnbN8xWjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbN9v2kbm90ZcQIRSYiABhShvujcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEICHMyArhQUJN+4MirQrVopinURoL2GOodR8RZxvZFZl5pHR5cGWjcGF5'
      );
      assert.deepStrictEqual(blob, expectedBlob);
    });
  });

  describe('create/append multisig with external signatures', () => {
    it('should match golden main repo result', () => {
      const oneSigTxn = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ=='
      );

      const signerAddr = sampleAccount2.addr;
      const signedTxn = algosdk.appendSignMultisigTransaction(
        oneSigTxn,
        sampleMultisigParams,
        sampleAccount2.sk
      );

      const multisig = algosdk.decodeSignedTransaction(signedTxn.blob).msig;
      if (multisig === undefined) {
        throw new Error('multisig is undefined');
      }

      const signatures = multisig.subsig;
      if (signatures === undefined) {
        throw new Error('No signatures found');
      }

      const signature = signatures[1].s;
      if (signature === undefined) {
        throw new Error('No signature found');
      }

      const { txID, blob } = algosdk.appendSignRawMultisigSignature(
        oneSigTxn,
        sampleMultisigParams,
        signerAddr,
        signature
      );

      const expectedTxID =
        'MANN3ESOHQVHFZBAGD6UK6XFVWEFZQJPWO5SQ2J5LZRCF5E2VVQQ';
      assert.strictEqual(txID, expectedTxID);

      const expectedBlob = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQBAhuyRjsOrnHp3s/xI+iMKiL7QPsh8iJZ22YOJJP0aFUwedMr+a6wfdBXk1OefyrAN1wqJ9rq6O+DrWV1fH0ASBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBo3R4boujYW10zQPopWNsb3NlxCBA6TSSiCVky86cWaabZ1Qmiemhw6Kp6ltlpuikQh/8V6NmZWXNA+iiZnbN8xWjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbN9v2kbm90ZcQIRSYiABhShvujcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5'
      );

      assert.deepStrictEqual(blob, expectedBlob);
    });

    it('should not sign with signature of invalid length', () => {
      const oneSigTxn = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ=='
      );

      const signerAddr = sampleAccount2.addr;
      const signedTxn = algosdk.appendSignMultisigTransaction(
        oneSigTxn,
        sampleMultisigParams,
        sampleAccount2.sk
      );

      const multisig = algosdk.decodeSignedTransaction(signedTxn.blob).msig;
      if (multisig === undefined) {
        throw new Error('multisig is undefined');
      }

      const signatures = multisig.subsig;
      if (signatures === undefined) {
        throw new Error('No signatures found');
      }

      const signature = signatures[1].s;
      if (signature === undefined) {
        throw new Error('No signature found');
      }

      // Remove the last byte of the signature
      const invalidSignature = signature.slice(0, -1);
      assert.throws(
        () =>
          algosdk.appendSignRawMultisigSignature(
            oneSigTxn,
            sampleMultisigParams,
            signerAddr,
            invalidSignature
          ),
        Error(MULTISIG_SIGNATURE_LENGTH_ERROR_MSG)
      );
    });

    it('should append signature to created raw multisig transaction', () => {
      const rawTxBlob = algosdk.base64ToBytes(
        'jKNmZWXOAAPIwKJmds4ADvnao2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zgAO/cKmc2Vsa2V5xCAyEisr1j3cUzGWF6WqU8Sxwm/j3MryjTYitWl3oUBchqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWma2V5cmVnp3ZvdGVmc3TOAA27oKZ2b3Rla2TNJxCndm90ZWtlecQgcBvX+5ErB7MIEf8oHZ/ulWPlgC4gJokjGSWPd/qTHoindm90ZWxzdM4AD0JA'
      );
      const decRawTx = algosdk.decodeUnsignedTransaction(rawTxBlob);

      const unsignedMultisigTx = algosdk.createMultisigTransaction(
        decRawTx,
        sampleMultisigParams
      );

      // Check that the unsignedMultisigTx is valid
      interface ExpectedMultisigTxStructure {
        msig: {
          subsig: {
            pk: Uint8Array;
            s: Uint8Array;
          }[];
        };
      }
      const unsignedMultisigTxBlob = algosdk.decodeObj(
        unsignedMultisigTx
      ) as ExpectedMultisigTxStructure;
      assert.deepStrictEqual(
        unsignedMultisigTxBlob.msig.subsig[0].pk,
        sampleAccount1.addr.publicKey
      );
      assert.strictEqual(unsignedMultisigTxBlob.msig.subsig[1].s, undefined);

      // Sign the raw transaction with a signature generated from the first account
      const signerAddr = sampleAccount1.addr;
      const signedTxn = algosdk.appendSignMultisigTransaction(
        unsignedMultisigTx,
        sampleMultisigParams,
        sampleAccount1.sk
      );

      const multisig = algosdk.decodeSignedTransaction(signedTxn.blob).msig;
      if (multisig === undefined) {
        throw new Error('multisig is undefined');
      }

      const signatures = multisig.subsig;
      if (signatures === undefined) {
        throw new Error('No signatures found');
      }

      const signature = signatures[0].s;
      if (signature === undefined) {
        throw new Error('No signature found');
      }
      const { txID, blob } = algosdk.appendSignRawMultisigSignature(
        unsignedMultisigTx,
        sampleMultisigParams,
        signerAddr,
        signature
      );

      // Check that the signed raw multisig is valid
      const expectedTxID =
        'E7DA7WTJCWWFQMKSVU5HOIJ5F5HGVGMOZGBIHRJRYGIX7FIJ5VWA';
      assert.strictEqual(txID, expectedTxID);

      const expectedBlob = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAcT0s17wJbvnza+NpyHwM0RWbQ+HwKmsT1PLs+w6d6MpdTH3tra+yKZE0K0qEyhSE7Y56+B9oaf2orEbjc/njDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Mo2ZlZc4AA8jAomZ2zgAO+dqjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbOAA79wqZzZWxrZXnEIDISKyvWPdxTMZYXpapTxLHCb+PcyvKNNiK1aXehQFyGo3NuZMQgjZK0iZABc6BN+kNZo2ZqavzqLEKgXdnB9z7rpUeAN+mkdHlwZaZrZXlyZWendm90ZWZzdM4ADbugpnZvdGVrZM0nEKd2b3Rla2V5xCBwG9f7kSsHswgR/ygdn+6VY+WALiAmiSMZJY93+pMeiKd2b3RlbHN0zgAPQkA='
      );

      assert.deepStrictEqual(blob, expectedBlob);
    });
  });

  describe('should sign keyreg transaction types', () => {
    it('first partial sig should match golden main repo result', () => {
      const rawTxBlob = algosdk.base64ToBytes(
        'jKNmZWXOAAPIwKJmds4ADvnao2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zgAO/cKmc2Vsa2V5xCAyEisr1j3cUzGWF6WqU8Sxwm/j3MryjTYitWl3oUBchqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWma2V5cmVnp3ZvdGVmc3TOAA27oKZ2b3Rla2TNJxCndm90ZWtlecQgcBvX+5ErB7MIEf8oHZ/ulWPlgC4gJokjGSWPd/qTHoindm90ZWxzdM4AD0JA'
      );
      const decRawTx = algosdk.decodeUnsignedTransaction(rawTxBlob);

      const { txID, blob } = algosdk.signMultisigTransaction(
        decRawTx,
        sampleMultisigParams,
        sampleAccount1.sk
      );

      const expectedTxID =
        'E7DA7WTJCWWFQMKSVU5HOIJ5F5HGVGMOZGBIHRJRYGIX7FIJ5VWA';
      assert.strictEqual(txID, expectedTxID);

      const oneSigTxBlob = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAcT0s17wJbvnza+NpyHwM0RWbQ+HwKmsT1PLs+w6d6MpdTH3tra+yKZE0K0qEyhSE7Y56+B9oaf2orEbjc/njDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Mo2ZlZc4AA8jAomZ2zgAO+dqjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbOAA79wqZzZWxrZXnEIDISKyvWPdxTMZYXpapTxLHCb+PcyvKNNiK1aXehQFyGo3NuZMQgjZK0iZABc6BN+kNZo2ZqavzqLEKgXdnB9z7rpUeAN+mkdHlwZaZrZXlyZWendm90ZWZzdM4ADbugpnZvdGVrZM0nEKd2b3Rla2V5xCBwG9f7kSsHswgR/ygdn+6VY+WALiAmiSMZJY93+pMeiKd2b3RlbHN0zgAPQkA='
      );

      assert.deepStrictEqual(blob, oneSigTxBlob);
    });

    it('second partial sig with 3rd pk should match golden main repo result', () => {
      const rawOneSigTxBlob = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAcT0s17wJbvnza+NpyHwM0RWbQ+HwKmsT1PLs+w6d6MpdTH3tra+yKZE0K0qEyhSE7Y56+B9oaf2orEbjc/njDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Mo2ZlZc4AA8jAomZ2zgAO+dqjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbOAA79wqZzZWxrZXnEIDISKyvWPdxTMZYXpapTxLHCb+PcyvKNNiK1aXehQFyGo3NuZMQgjZK0iZABc6BN+kNZo2ZqavzqLEKgXdnB9z7rpUeAN+mkdHlwZaZrZXlyZWendm90ZWZzdM4ADbugpnZvdGVrZM0nEKd2b3Rla2V5xCBwG9f7kSsHswgR/ygdn+6VY+WALiAmiSMZJY93+pMeiKd2b3RlbHN0zgAPQkA='
      );

      const decRawTx = algosdk.decodeSignedTransaction(rawOneSigTxBlob).txn;

      const { txID, blob } = algosdk.signMultisigTransaction(
        decRawTx,
        sampleMultisigParams,
        sampleAccount3.sk
      );

      const expectedTxID =
        'E7DA7WTJCWWFQMKSVU5HOIJ5F5HGVGMOZGBIHRJRYGIX7FIJ5VWA';
      assert.strictEqual(txID, expectedTxID);

      const finMsigBlob = algosdk.mergeMultisigTransactions([
        blob,
        new Uint8Array(rawOneSigTxBlob),
      ]);

      const twoSigTxBlob = algosdk.base64ToBytes(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAcT0s17wJbvnza+NpyHwM0RWbQ+HwKmsT1PLs+w6d6MpdTH3tra+yKZE0K0qEyhSE7Y56+B9oaf2orEbjc/njDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgqJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGhc8RAfScXfzBLaE42NbF9IR0qMa3NBQnhY6kQsV+6htqBsw/bWmc2vBla65CJLSNCNS236BsUMlvbwrs3knF+6bqhD6N0aHICoXYBo3R4boyjZmVlzgADyMCiZnbOAA752qNnZW6sZGV2bmV0LXYzOC4womdoxCD+s2w5EBQ5AMPaVULKGDawD9L4GVkSV80j9gQvmMg2naJsds4ADv3CpnNlbGtlecQgMhIrK9Y93FMxlhelqlPEscJv49zK8o02IrVpd6FAXIajc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlpmtleXJlZ6d2b3RlZnN0zgANu6Cmdm90ZWtkzScQp3ZvdGVrZXnEIHAb1/uRKwezCBH/KB2f7pVj5YAuICaJIxklj3f6kx6Ip3ZvdGVsc3TOAA9CQA=='
      );

      assert.deepStrictEqual(finMsigBlob, twoSigTxBlob);
    });
  });

  describe('mergeMultisigTransactions', () => {
    it('should be symmetric and match golden main repo result', () => {
      // prettier-ignore
      const oneAndThreeBlob = Uint8Array.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
      // prettier-ignore
      const twoAndThreeBlob = Uint8Array.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 129, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 130, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 161, 115, 196, 64, 227, 199, 17, 26, 50, 149, 36, 250, 241, 222, 56, 188, 127, 140, 131, 144, 167, 224, 18, 230, 61, 37, 113, 136, 156, 116, 104, 237, 140, 138, 121, 215, 140, 159, 38, 64, 106, 111, 177, 108, 51, 233, 152, 250, 233, 207, 138, 116, 61, 55, 89, 204, 6, 164, 2, 114, 128, 230, 199, 130, 136, 25, 207, 1, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
      // prettier-ignore
      const allThreeBlob = Uint8Array.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 130, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 161, 115, 196, 64, 227, 199, 17, 26, 50, 149, 36, 250, 241, 222, 56, 188, 127, 140, 131, 144, 167, 224, 18, 230, 61, 37, 113, 136, 156, 116, 104, 237, 140, 138, 121, 215, 140, 159, 38, 64, 106, 111, 177, 108, 51, 233, 152, 250, 233, 207, 138, 116, 61, 55, 89, 204, 6, 164, 2, 114, 128, 230, 199, 130, 136, 25, 207, 1, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);

      const finMsigBlob = algosdk.mergeMultisigTransactions([
        new Uint8Array(twoAndThreeBlob),
        new Uint8Array(oneAndThreeBlob),
      ]);
      const finMsigBlobTwo = algosdk.mergeMultisigTransactions([
        new Uint8Array(oneAndThreeBlob),
        new Uint8Array(twoAndThreeBlob),
      ]);
      assert.deepStrictEqual(finMsigBlob, allThreeBlob);
      assert.deepStrictEqual(finMsigBlobTwo, allThreeBlob);
    });

    it('should merge several transactions', () => {
      // prettier-ignore
      const blobSignedByFirst = Uint8Array.from([ 130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 129, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64, ]);
      // prettier-ignore
      const blobSignedBySecond = Uint8Array.from([ 130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 129, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 130, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 161, 115, 196, 64, 227, 199, 17, 26, 50, 149, 36, 250, 241, 222, 56, 188, 127, 140, 131, 144, 167, 224, 18, 230, 61, 37, 113, 136, 156, 116, 104, 237, 140, 138, 121, 215, 140, 159, 38, 64, 106, 111, 177, 108, 51, 233, 152, 250, 233, 207, 138, 116, 61, 55, 89, 204, 6, 164, 2, 114, 128, 230, 199, 130, 136, 25, 207, 1, 129, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64, ]);
      // prettier-ignore
      const blobSignedByThird = Uint8Array.from([ 130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 129, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64, ]);
      // prettier-ignore
      const blobSignedByAllThree = Uint8Array.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 130, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 161, 115, 196, 64, 227, 199, 17, 26, 50, 149, 36, 250, 241, 222, 56, 188, 127, 140, 131, 144, 167, 224, 18, 230, 61, 37, 113, 136, 156, 116, 104, 237, 140, 138, 121, 215, 140, 159, 38, 64, 106, 111, 177, 108, 51, 233, 152, 250, 233, 207, 138, 116, 61, 55, 89, 204, 6, 164, 2, 114, 128, 230, 199, 130, 136, 25, 207, 1, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);

      const finMsigBlob = algosdk.mergeMultisigTransactions([
        new Uint8Array(blobSignedByFirst),
        new Uint8Array(blobSignedBySecond),
        new Uint8Array(blobSignedByThird),
      ]);
      const finMsigBlobTwo = algosdk.mergeMultisigTransactions([
        new Uint8Array(blobSignedByThird),
        new Uint8Array(blobSignedByFirst),
        new Uint8Array(blobSignedBySecond),
      ]);

      // let's open those to verify all sigs are there
      let { msig } = algosdk.decodeSignedTransaction(finMsigBlob);
      assert(
        msig && msig.subsig.every((sig) => ArrayBuffer.isView(sig.s)),
        'missing signatures'
      );

      ({ msig } = algosdk.decodeSignedTransaction(finMsigBlobTwo));
      assert(
        msig && msig.subsig.every((sig) => ArrayBuffer.isView(sig.s)),
        'missing signatures'
      );

      // let's check the merged transactions against our reference blob
      assert.deepStrictEqual(finMsigBlob, blobSignedByAllThree);
      assert.deepStrictEqual(finMsigBlobTwo, blobSignedByAllThree);
    });

    it('should correctly handle a different sender', () => {
      const oneAndThreeBlob = algosdk.base64ToBytes(
        'g6Rtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAWLcyn6nB68yo/PUHXB21wyTy+PhHgMQNOIXPTGB96faZP2xqpQ8IFlIR2LPotlX68ylK8MCl82SUfMR4FYyzAIGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgqJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGhc8RAQ3t8lAipybLbWaRa3EDKl0mLGwUpYzl0iBCHSflhJM6zboJiT10FnWtXqW0dUBzpj9yeqtSuSJyKb8Ml3YJkCqN0aHICoXYBpHNnbnLEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfpo3R4boujYW10zQPopWNsb3NlxCBA6TSSiCVky86cWaabZ1Qmiemhw6Kp6ltlpuikQh/8V6NmZWXNA+iiZnbN8xWjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbN9v2kbm90ZcQIRSYiABhShvujcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEICHMyArhQUJN+4MirQrVopinURoL2GOodR8RZxvZFZl5pHR5cGWjcGF5'
      );
      const twoAndThreeBlob = algosdk.base64ToBytes(
        'g6Rtc2lng6ZzdWJzaWeTgaJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXiConBrxCAJYzIJU3OJ8HVnEXc5kcfQPhtzyMT1K/av8BqiXPnCcaFzxED7h9lpTNsdbX5QOixjISlwYrju3bEc412D4HH47w7YfWbAms8jih6kJrWIw/qVyzPHyW60YaFBk5Mi8SDYk/cAgqJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGhc8RAQ3t8lAipybLbWaRa3EDKl0mLGwUpYzl0iBCHSflhJM6zboJiT10FnWtXqW0dUBzpj9yeqtSuSJyKb8Ml3YJkCqN0aHICoXYBpHNnbnLEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfpo3R4boujYW10zQPopWNsb3NlxCBA6TSSiCVky86cWaabZ1Qmiemhw6Kp6ltlpuikQh/8V6NmZWXNA+iiZnbN8xWjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbN9v2kbm90ZcQIRSYiABhShvujcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEICHMyArhQUJN+4MirQrVopinURoL2GOodR8RZxvZFZl5pHR5cGWjcGF5'
      );
      const allThreeBlob = algosdk.base64ToBytes(
        'g6Rtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAWLcyn6nB68yo/PUHXB21wyTy+PhHgMQNOIXPTGB96faZP2xqpQ8IFlIR2LPotlX68ylK8MCl82SUfMR4FYyzAIKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQPuH2WlM2x1tflA6LGMhKXBiuO7dsRzjXYPgcfjvDth9ZsCazyOKHqQmtYjD+pXLM8fJbrRhoUGTkyLxINiT9wCConBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaFzxEBDe3yUCKnJsttZpFrcQMqXSYsbBSljOXSIEIdJ+WEkzrNugmJPXQWda1epbR1QHOmP3J6q1K5InIpvwyXdgmQKo3RocgKhdgGkc2ducsQgjZK0iZABc6BN+kNZo2ZqavzqLEKgXdnB9z7rpUeAN+mjdHhui6NhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0D6KJmds3zFaNnZW6sZGV2bmV0LXYzOC4womdoxCD+s2w5EBQ5AMPaVULKGDawD9L4GVkSV80j9gQvmMg2naJsds32/aRub3RlxAhFJiIAGFKG+6NyY3bEIHts4k/rW6zAsWTinCIsV/X2PcOH1DkEglhBHF/hD3wCo3NuZMQgIczICuFBQk37gyKtCtWimKdRGgvYY6h1HxFnG9kVmXmkdHlwZaNwYXk='
      );

      const finMsigBlob = algosdk.mergeMultisigTransactions([
        new Uint8Array(twoAndThreeBlob),
        new Uint8Array(oneAndThreeBlob),
      ]);
      const finMsigBlobTwo = algosdk.mergeMultisigTransactions([
        new Uint8Array(oneAndThreeBlob),
        new Uint8Array(twoAndThreeBlob),
      ]);
      assert.deepStrictEqual(finMsigBlob, allThreeBlob);
      assert.deepStrictEqual(finMsigBlobTwo, allThreeBlob);
    });

    it('should error when msig is missing', () => {
      // prettier-ignore
      const oneAndThreeBlob = Uint8Array.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);

      const decoded = algosdk.decodeMsgpack(
        oneAndThreeBlob,
        algosdk.SignedTransaction
      );
      // copies everything except the msig property
      const decodedNoMsig = new algosdk.SignedTransaction({
        txn: decoded.txn,
        sig: decoded.sig,
        msig: undefined,
        lsig: decoded.lsig,
        sgnr: decoded.sgnr,
      });

      const noMsigBlob = algosdk.encodeMsgpack(decodedNoMsig);

      assert.throws(() => {
        algosdk.mergeMultisigTransactions([noMsigBlob, oneAndThreeBlob]);
      }, new Error('Invalid multisig transaction, multisig structure missing at index 0'));

      assert.throws(() => {
        algosdk.mergeMultisigTransactions([oneAndThreeBlob, noMsigBlob]);
      }, new Error('Invalid multisig transaction, multisig structure missing at index 1'));
    });
  });
});
