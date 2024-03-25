/* eslint-env mocha */
import assert from 'assert';
import algosdk from '../src/index';

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
const sampleMultisigParams = {
  version: 1,
  threshold: 2,
  addrs: [sampleAccount1.addr, sampleAccount2.addr, sampleAccount3.addr],
} satisfies algosdk.MultisigMetadata;

const sampleMultisigAddr = algosdk.multisigAddress(sampleMultisigParams);

describe('LogicSig', () => {
  describe('makeLogicSig', () => {
    it('should work on valid program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const programHash = algosdk.Address.fromString(
        '6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY'
      );
      const pk = programHash.publicKey;
      let lsig = new algosdk.LogicSig(program);
      assert.strictEqual(lsig.logic, program);
      assert.strictEqual(lsig.args, undefined);
      assert.strictEqual(lsig.sig, undefined);
      assert.strictEqual(lsig.msig, undefined);
      assert.deepStrictEqual(lsig.address(), programHash);

      let verified = lsig.verify(pk);
      assert.strictEqual(verified, true);

      const args = [Uint8Array.from([1, 2, 3]), Uint8Array.from([4, 5, 6])];
      lsig = new algosdk.LogicSig(program, args);
      assert.strictEqual(lsig.logic, program);
      assert.deepStrictEqual(lsig.args, args);
      assert.strictEqual(lsig.sig, undefined);
      assert.strictEqual(lsig.msig, undefined);

      verified = lsig.verify(pk);
      assert.strictEqual(verified, true);

      // check serialization
      const encoded = lsig.toByte();
      const decoded = algosdk.logicSigFromByte(encoded);
      assert.deepStrictEqual(decoded, lsig);
    });
    it('should fail on tampered program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const programHash =
        '6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY';
      const pk = algosdk.decodeAddress(programHash).publicKey;

      program[3] = 2;
      const lsig = new algosdk.LogicSig(program);
      const verified = lsig.verify(pk);
      assert.strictEqual(verified, false);
    });
  });

  describe('address', () => {
    it('should produce the correct address', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const programHash =
        '6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY';

      const lsig = new algosdk.LogicSig(program);
      const address = lsig.address();

      assert.strictEqual(address.toString(), programHash);
      assert.ok(address.equals(algosdk.Address.fromString(programHash)));
    });
  });
});

describe('LogicSigAccount', () => {
  describe('constructor', () => {
    it('should work on valid program without args', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);

      const lsigAccount = new algosdk.LogicSigAccount(program);
      assert.deepStrictEqual(lsigAccount.lsig.logic, program);
      assert.strictEqual(lsigAccount.lsig.args, undefined);
      assert.strictEqual(lsigAccount.lsig.sig, undefined);
      assert.strictEqual(lsigAccount.lsig.msig, undefined);
      assert.strictEqual(lsigAccount.sigkey, undefined);

      // check serialization
      const encoded = lsigAccount.toByte();
      const expectedEncoded = new Uint8Array(
        algosdk.base64ToBytes('gaRsc2lngaFsxAUBIAEBIg==')
      );
      assert.deepStrictEqual(encoded, expectedEncoded);

      const decoded = algosdk.LogicSigAccount.fromByte(encoded);
      assert.deepStrictEqual(decoded, lsigAccount);
    });
    it('should work on valid program with args', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const args = [Uint8Array.from([1]), Uint8Array.from([2, 3])];

      const lsigAccount = new algosdk.LogicSigAccount(program, args);
      assert.deepStrictEqual(lsigAccount.lsig.logic, program);
      assert.deepStrictEqual(lsigAccount.lsig.args, args);
      assert.strictEqual(lsigAccount.lsig.sig, undefined);
      assert.strictEqual(lsigAccount.lsig.msig, undefined);
      assert.strictEqual(lsigAccount.sigkey, undefined);

      // check serialization
      const encoded = lsigAccount.toByte();
      const expectedEncoded = new Uint8Array(
        algosdk.base64ToBytes('gaRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIg==')
      );
      assert.deepStrictEqual(encoded, expectedEncoded);

      const decoded = algosdk.LogicSigAccount.fromByte(encoded);
      assert.deepStrictEqual(decoded, lsigAccount);
    });
  });

  describe('sign', () => {
    it('should properly sign the program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const args = [Uint8Array.from([1]), Uint8Array.from([2, 3])];

      const lsigAccount = new algosdk.LogicSigAccount(program, args);
      lsigAccount.sign(sampleAccount1.sk);

      const expectedSig = new Uint8Array(
        algosdk.base64ToBytes(
          'SRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9Ag=='
        )
      );
      const expectedSigKey = sampleAccount1.addr.publicKey;

      assert.deepStrictEqual(lsigAccount.lsig.logic, program);
      assert.deepStrictEqual(lsigAccount.lsig.args, args);
      assert.deepStrictEqual(lsigAccount.lsig.sig, expectedSig);
      assert.strictEqual(lsigAccount.lsig.msig, undefined);
      assert.deepStrictEqual(lsigAccount.sigkey, expectedSigKey);

      // check serialization
      const encoded = lsigAccount.toByte();
      const expectedEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA=='
        )
      );
      assert.deepStrictEqual(encoded, expectedEncoded);

      const decoded = algosdk.LogicSigAccount.fromByte(encoded);
      assert.deepStrictEqual(decoded, lsigAccount);
    });
  });

  describe('signMultisig', () => {
    it('should properly sign the program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const args = [Uint8Array.from([1]), Uint8Array.from([2, 3])];

      const lsigAccount = new algosdk.LogicSigAccount(program, args);
      lsigAccount.signMultisig(sampleMultisigParams, sampleAccount1.sk);

      const expectedSig = new Uint8Array(
        algosdk.base64ToBytes(
          'SRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9Ag=='
        )
      );
      const expectedMsig: algosdk.EncodedMultisig = {
        v: sampleMultisigParams.version,
        thr: sampleMultisigParams.threshold,
        subsig: sampleMultisigParams.addrs.map((addr) => ({
          pk: addr.publicKey,
        })),
      };
      expectedMsig.subsig[0].s = expectedSig;

      assert.deepStrictEqual(lsigAccount.lsig.logic, program);
      assert.deepStrictEqual(lsigAccount.lsig.args, args);
      assert.strictEqual(lsigAccount.lsig.sig, undefined);
      assert.deepStrictEqual(lsigAccount.lsig.msig, expectedMsig);
      assert.strictEqual(lsigAccount.sigkey, undefined);

      // check serialization
      const encoded = lsigAccount.toByte();
      const expectedEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AQ=='
        )
      );
      assert.deepStrictEqual(encoded, expectedEncoded);

      const decoded = algosdk.LogicSigAccount.fromByte(encoded);
      assert.deepStrictEqual(decoded, lsigAccount);
    });
  });

  describe('appendToMultisig', () => {
    it('should properly append a signature', () => {
      const msig1of3Encoded = algosdk.base64ToBytes(
        'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AQ=='
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msig1of3Encoded);

      lsigAccount.appendToMultisig(sampleAccount2.sk);

      const expectedSig1 = algosdk.base64ToBytes(
        'SRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9Ag=='
      );
      const expectedSig2 = algosdk.base64ToBytes(
        'ZLxV2+2RokHUKrZg9+FKuZmaUrOxcVjO/D9P58siQRStqT1ehAUCChemaYMDIk6Go4tqNsVUviBQ/9PuqLMECQ=='
      );
      const expectedMsig: algosdk.EncodedMultisig = {
        v: sampleMultisigParams.version,
        thr: sampleMultisigParams.threshold,
        subsig: sampleMultisigParams.addrs.map((addr) => ({
          pk: addr.publicKey,
        })),
      };
      expectedMsig.subsig[0].s = expectedSig1;
      expectedMsig.subsig[1].s = expectedSig2;

      assert.strictEqual(lsigAccount.lsig.sig, undefined);
      assert.deepStrictEqual(lsigAccount.lsig.msig, expectedMsig);
      assert.strictEqual(lsigAccount.sigkey, undefined);

      // check serialization
      const encoded = lsigAccount.toByte();
      const expectedEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB'
        )
      );
      assert.deepStrictEqual(encoded, expectedEncoded);

      const decoded = algosdk.LogicSigAccount.fromByte(encoded);
      assert.deepStrictEqual(decoded, lsigAccount);
    });
  });

  describe('verify', () => {
    it('should verify valid escrow', () => {
      const escrowEncoded = new Uint8Array(
        algosdk.base64ToBytes('gaRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIg==')
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(escrowEncoded);

      assert.strictEqual(lsigAccount.verify(), true);
    });

    it('should verify valid single sig', () => {
      const sigEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA=='
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(sigEncoded);

      assert.strictEqual(lsigAccount.verify(), true);
    });

    it('should fail single sig with wrong sig', () => {
      const sigEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA=='
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(sigEncoded);

      // modify signature
      lsigAccount.lsig.sig![0] = 0;

      assert.strictEqual(lsigAccount.verify(), false);
    });

    it('should verify valid multisig', () => {
      const msigEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msigEncoded);

      assert.strictEqual(lsigAccount.verify(), true);
    });

    it('should fail multisig with wrong sig', () => {
      const msigEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msigEncoded);

      // modify signature
      lsigAccount.lsig.msig!.subsig[0].s![0] = 0;

      assert.strictEqual(lsigAccount.verify(), false);
    });

    it('should fail multisig that does not meet threshold', () => {
      const msigBelowThresholdEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AQ=='
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(
        msigBelowThresholdEncoded
      );

      assert.strictEqual(lsigAccount.verify(), false);
    });
  });

  describe('isDelegated', () => {
    it('should be correct for escrow', () => {
      const escrowEncoded = new Uint8Array(
        algosdk.base64ToBytes('gaRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIg==')
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(escrowEncoded);

      assert.strictEqual(lsigAccount.isDelegated(), false);
    });

    it('should be correct for single sig', () => {
      const sigEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA=='
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(sigEncoded);

      assert.strictEqual(lsigAccount.isDelegated(), true);
    });

    it('should be correct for multisig', () => {
      const msigEncoded = new Uint8Array(
        algosdk.base64ToBytes(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msigEncoded);

      assert.strictEqual(lsigAccount.isDelegated(), true);
    });
  });

  describe('address', () => {
    it('should be correct for escrow', () => {
      const escrowEncoded = new Uint8Array(
        algosdk.base64ToBytes('gaRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIg==')
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(escrowEncoded);

      const addr = lsigAccount.address();

      const expectedAddr = algosdk.Address.fromString(
        '6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY'
      );

      assert.deepStrictEqual(addr, expectedAddr);
    });

    it('should be correct for single sig', () => {
      const sigEncoded = algosdk.base64ToBytes(
        'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA=='
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(sigEncoded);

      const addr = lsigAccount.address();

      const expectedAddr = algosdk.Address.fromString(
        'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA'
      );

      assert.deepStrictEqual(addr, expectedAddr);
    });

    it('should be correct for multisig', () => {
      const msigEncoded = algosdk.base64ToBytes(
        'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB'
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msigEncoded);

      const addr = lsigAccount.address();

      const expectedAddr = algosdk.Address.fromString(
        'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
      );

      assert.deepStrictEqual(addr, expectedAddr);
    });
  });
});

describe('signLogicSigTransaction', () => {
  const program = Uint8Array.from([1, 32, 1, 1, 34]);
  const args = [Uint8Array.from([1]), Uint8Array.from([2, 3])];

  const otherAddr =
    'WTDCE2FEYM2VB5MKNXKLRSRDTSPR2EFTIGVH4GRW4PHGD6747GFJTBGT2A';

  function testSign(
    lsigObject: algosdk.LogicSig | algosdk.LogicSigAccount,
    sender: string | algosdk.Address,
    expected: { txID: string; blob: Uint8Array }
  ) {
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender,
      receiver: otherAddr,
      amount: 5000,
      suggestedParams: {
        minFee: 1000,
        flatFee: true,
        fee: 217000,
        firstValid: 972508,
        lastValid: 973508,
        genesisID: 'testnet-v31.0',
        genesisHash: algosdk.base64ToBytes(
          'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
        ),
      },
      note: new Uint8Array([180, 81, 121, 57, 252, 250, 210, 113]),
    });

    const actual = algosdk.signLogicSigTransaction(txn, lsigObject);

    assert.deepStrictEqual(actual, expected);
  }

  describe('with LogicSig', () => {
    describe('escrow', () => {
      const lsig = new algosdk.LogicSig(program, args);

      it('should match expected when sender is LogicSig address', () => {
        const sender = lsig.address();
        const expected = {
          txID: 'SV3GD4AKRRX43F3V4V7GYYB6YCQEPULGUI6GKZO6GPJDKOO75NFA',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'gqRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIqN0eG6Ko2FtdM0TiKNmZWXOAANPqKJmds4ADtbco2dlbq10ZXN0bmV0LXYzMS4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds4ADtrEpG5vdGXECLRReTn8+tJxo3JjdsQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+Yqjc25kxCD2di2sdbGZfWwslhgGgFB0kNeVES/+f7dgsnOK+cfxraR0eXBlo3BheQ=='
            )
          ),
        };
        testSign(lsig, sender, expected);
      });

      it('should match expected when sender is not LogicSig address', () => {
        const sender = otherAddr;
        const expected = {
          txID: 'DRBC5KBOYEUCL6L6H45GQSRKCCUTPNELUHUSQO4ZWCEODJEXQBBQ',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'g6Rsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIqRzZ25yxCD2di2sdbGZfWwslhgGgFB0kNeVES/+f7dgsnOK+cfxraN0eG6Ko2FtdM0TiKNmZWXOAANPqKJmds4ADtbco2dlbq10ZXN0bmV0LXYzMS4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds4ADtrEpG5vdGXECLRReTn8+tJxo3JjdsQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+Yqjc25kxCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqR0eXBlo3BheQ=='
            )
          ),
        };
        testSign(lsig, sender, expected);
      });
    });

    describe('single sig', () => {
      const account = algosdk.mnemonicToSecretKey(
        'olympic cricket tower model share zone grid twist sponsor avoid eight apology patient party success claim famous rapid donor pledge bomb mystery security ability often'
      );
      const lsig = new algosdk.LogicSig(program, args);
      lsig.sign(account.sk);

      it('should match expected when sender is LogicSig address', () => {
        const sender = account.addr;
        const expected = {
          txID: 'EZB2N2TEFR5OOL76Z46ZMRUL3ZQQOYKRFIX6WSHQ5FWESHU4LZPA',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQD4FPTlN+xK8ZXmf6jGKe46iUYtVLIq+bNenZS3YsBh+IQUtuSRiiRblYXTNDxmsuWxFpCmRmREd5Hzk/BLszgKjdHhuiqNhbXTNE4ijZmVlzgADT6iiZnbOAA7W3KNnZW6tdGVzdG5ldC12MzEuMKJnaMQgJgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dKibHbOAA7axKRub3RlxAi0UXk5/PrScaNyY3bEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKo3NuZMQgXmdPHAru7DdxiY9hx2/10koZeT4skfoIUWJj44Vz6kKkdHlwZaNwYXk='
            )
          ),
        };
        testSign(lsig, sender, expected);
      });

      it('should throw an error when sender is not LogicSig address', () => {
        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: otherAddr,
          receiver: otherAddr,
          amount: 5000,
          suggestedParams: {
            minFee: 1000,
            flatFee: true,
            fee: 217000,
            firstValid: 972508,
            lastValid: 973508,
            genesisID: 'testnet-v31.0',
            genesisHash: algosdk.base64ToBytes(
              'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
            ),
          },
          note: new Uint8Array([180, 81, 121, 57, 252, 250, 210, 113]),
        });

        assert.throws(
          () => algosdk.signLogicSigTransaction(txn, lsig),
          new Error(
            'Logic signature verification failed. Ensure the program and signature are valid.'
          )
        );
      });
    });

    describe('multisig', () => {
      const lsig = new algosdk.LogicSig(program, args);
      lsig.sign(sampleAccount1.sk, sampleMultisigParams);
      lsig.appendToMultisig(sampleAccount2.sk);

      it('should match expected when sender is LogicSig address', () => {
        const sender = sampleMultisigAddr;
        const expected = {
          txID: 'UGGT5EZXG2OBPGWTEINC65UXIQ6UVAAOTNKRRCRAUCZH4FWJTVQQ',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBo3R4boqjYW10zROIo2ZlZc4AA0+oomZ2zgAO1tyjZ2VurXRlc3RuZXQtdjMxLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zgAO2sSkbm90ZcQItFF5Ofz60nGjcmN2xCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5'
            )
          ),
        };
        testSign(lsig, sender, expected);
      });

      it('should match expected when sender is not LogicSig address', () => {
        const sender = otherAddr;
        const expected = {
          txID: 'DRBC5KBOYEUCL6L6H45GQSRKCCUTPNELUHUSQO4ZWCEODJEXQBBQ',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'g6Rsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBpHNnbnLEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfpo3R4boqjYW10zROIo2ZlZc4AA0+oomZ2zgAO1tyjZ2VurXRlc3RuZXQtdjMxLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zgAO2sSkbm90ZcQItFF5Ofz60nGjcmN2xCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqNzbmTEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKpHR5cGWjcGF5'
            )
          ),
        };
        testSign(lsig, sender, expected);
      });
    });
  });

  describe('with LogicSigAccount', () => {
    describe('escrow', () => {
      const lsigAccount = new algosdk.LogicSigAccount(program, args);

      it('should match expected when sender is LogicSig address', () => {
        const sender = lsigAccount.address();
        const expected = {
          txID: 'SV3GD4AKRRX43F3V4V7GYYB6YCQEPULGUI6GKZO6GPJDKOO75NFA',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'gqRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIqN0eG6Ko2FtdM0TiKNmZWXOAANPqKJmds4ADtbco2dlbq10ZXN0bmV0LXYzMS4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds4ADtrEpG5vdGXECLRReTn8+tJxo3JjdsQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+Yqjc25kxCD2di2sdbGZfWwslhgGgFB0kNeVES/+f7dgsnOK+cfxraR0eXBlo3BheQ=='
            )
          ),
        };
        testSign(lsigAccount, sender, expected);
      });

      it('should match expected when sender is not LogicSig address', () => {
        const sender = otherAddr;
        const expected = {
          txID: 'DRBC5KBOYEUCL6L6H45GQSRKCCUTPNELUHUSQO4ZWCEODJEXQBBQ',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'g6Rsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIqRzZ25yxCD2di2sdbGZfWwslhgGgFB0kNeVES/+f7dgsnOK+cfxraN0eG6Ko2FtdM0TiKNmZWXOAANPqKJmds4ADtbco2dlbq10ZXN0bmV0LXYzMS4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds4ADtrEpG5vdGXECLRReTn8+tJxo3JjdsQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+Yqjc25kxCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqR0eXBlo3BheQ=='
            )
          ),
        };
        testSign(lsigAccount, sender, expected);
      });
    });

    describe('single sig', () => {
      const account = algosdk.mnemonicToSecretKey(
        'olympic cricket tower model share zone grid twist sponsor avoid eight apology patient party success claim famous rapid donor pledge bomb mystery security ability often'
      );
      const lsigAccount = new algosdk.LogicSigAccount(program, args);
      lsigAccount.sign(account.sk);

      it('should match expected when sender is LogicSig address', () => {
        const sender = account.addr;
        const expected = {
          txID: 'EZB2N2TEFR5OOL76Z46ZMRUL3ZQQOYKRFIX6WSHQ5FWESHU4LZPA',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQD4FPTlN+xK8ZXmf6jGKe46iUYtVLIq+bNenZS3YsBh+IQUtuSRiiRblYXTNDxmsuWxFpCmRmREd5Hzk/BLszgKjdHhuiqNhbXTNE4ijZmVlzgADT6iiZnbOAA7W3KNnZW6tdGVzdG5ldC12MzEuMKJnaMQgJgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dKibHbOAA7axKRub3RlxAi0UXk5/PrScaNyY3bEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKo3NuZMQgXmdPHAru7DdxiY9hx2/10koZeT4skfoIUWJj44Vz6kKkdHlwZaNwYXk='
            )
          ),
        };
        testSign(lsigAccount, sender, expected);
      });

      it('should match expected when sender is not LogicSig address', () => {
        const sender = otherAddr;
        const expected = {
          txID: 'DRBC5KBOYEUCL6L6H45GQSRKCCUTPNELUHUSQO4ZWCEODJEXQBBQ',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'g6Rsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQD4FPTlN+xK8ZXmf6jGKe46iUYtVLIq+bNenZS3YsBh+IQUtuSRiiRblYXTNDxmsuWxFpCmRmREd5Hzk/BLszgKkc2ducsQgXmdPHAru7DdxiY9hx2/10koZeT4skfoIUWJj44Vz6kKjdHhuiqNhbXTNE4ijZmVlzgADT6iiZnbOAA7W3KNnZW6tdGVzdG5ldC12MzEuMKJnaMQgJgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dKibHbOAA7axKRub3RlxAi0UXk5/PrScaNyY3bEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKo3NuZMQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+YqkdHlwZaNwYXk='
            )
          ),
        };
        testSign(lsigAccount, sender, expected);
      });
    });

    describe('multisig', () => {
      const lsigAccount = new algosdk.LogicSigAccount(program, args);
      lsigAccount.signMultisig(sampleMultisigParams, sampleAccount1.sk);
      lsigAccount.appendToMultisig(sampleAccount2.sk);

      it('should match expected when sender is LogicSig address', () => {
        const sender = sampleMultisigAddr;
        const expected = {
          txID: 'UGGT5EZXG2OBPGWTEINC65UXIQ6UVAAOTNKRRCRAUCZH4FWJTVQQ',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBo3R4boqjYW10zROIo2ZlZc4AA0+oomZ2zgAO1tyjZ2VurXRlc3RuZXQtdjMxLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zgAO2sSkbm90ZcQItFF5Ofz60nGjcmN2xCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5'
            )
          ),
        };
        testSign(lsigAccount, sender, expected);
      });

      it('should match expected when sender is not LogicSig address', () => {
        const sender = otherAddr;
        const expected = {
          txID: 'DRBC5KBOYEUCL6L6H45GQSRKCCUTPNELUHUSQO4ZWCEODJEXQBBQ',
          blob: new Uint8Array(
            algosdk.base64ToBytes(
              'g6Rsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBpHNnbnLEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfpo3R4boqjYW10zROIo2ZlZc4AA0+oomZ2zgAO1tyjZ2VurXRlc3RuZXQtdjMxLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zgAO2sSkbm90ZcQItFF5Ofz60nGjcmN2xCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqNzbmTEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKpHR5cGWjcGF5'
            )
          ),
        };
        testSign(lsigAccount, sender, expected);
      });
    });
  });
});

describe('ProgramSourceMap', () => {
  const input = {
    version: 3,
    sources: ['test/scripts/e2e_subs/tealprogs/sourcemap-test.teal'],
    names: [],
    mappings:
      ';;;;AAGA;;AAAmB;;AAAO;AAAI;;;AAE9B;;AAAO;;AAAO;AACd;;AAAO;AAAO;AALO;AAAI;AASrB;AACA',
  };

  const expectedLocations = new Map<number, algosdk.SourceLocation>([
    [4, { sourceIndex: 0, line: 3, column: 0 }],
    [6, { sourceIndex: 0, line: 3, column: 19 }],
    [8, { sourceIndex: 0, line: 3, column: 26 }],
    [9, { sourceIndex: 0, line: 3, column: 30 }],
    [12, { sourceIndex: 0, line: 5, column: 0 }],
    [14, { sourceIndex: 0, line: 5, column: 7 }],
    [16, { sourceIndex: 0, line: 5, column: 14 }],
    [17, { sourceIndex: 0, line: 6, column: 0 }],
    [19, { sourceIndex: 0, line: 6, column: 7 }],
    [20, { sourceIndex: 0, line: 6, column: 14 }],
    [21, { sourceIndex: 0, line: 1, column: 21 }],
    [22, { sourceIndex: 0, line: 1, column: 25 }],
    [23, { sourceIndex: 0, line: 10, column: 4 }],
    [24, { sourceIndex: 0, line: 11, column: 4 }],
  ]);

  const expectedPcsForLine = new Map<number, algosdk.PcLineLocation[]>([
    [
      3,
      [
        { pc: 4, column: 0 },
        { pc: 6, column: 19 },
        { pc: 8, column: 26 },
        { pc: 9, column: 30 },
      ],
    ],
    [
      5,
      [
        { pc: 12, column: 0 },
        { pc: 14, column: 7 },
        { pc: 16, column: 14 },
      ],
    ],
    [
      6,
      [
        { pc: 17, column: 0 },
        { pc: 19, column: 7 },
        { pc: 20, column: 14 },
      ],
    ],
    [
      1,
      [
        { pc: 21, column: 21 },
        { pc: 22, column: 25 },
      ],
    ],
    [10, [{ pc: 23, column: 4 }]],
    [11, [{ pc: 24, column: 4 }]],
  ]);

  it('should be able to read a ProgramSourceMap', () => {
    const sourceMap = new algosdk.ProgramSourceMap(input);

    assert.strictEqual(sourceMap.version, input.version);
    assert.deepStrictEqual(sourceMap.sources, input.sources);
    assert.deepStrictEqual(sourceMap.names, input.names);
    assert.strictEqual(sourceMap.mappings, input.mappings);
  });

  describe('getLocationForPc', () => {
    it('should return the correct location for all pcs', () => {
      const sourceMap = new algosdk.ProgramSourceMap(input);
      const maxPcToCheck = 30;

      for (let pc = 0; pc < maxPcToCheck; pc++) {
        const expected = expectedLocations.get(pc);
        assert.deepStrictEqual(
          sourceMap.getLocationForPc(pc),
          expected,
          `pc=${pc}`
        );
      }
    });
  });

  describe('getPcs', () => {
    it('should return the correct pcs', () => {
      const sourceMap = new algosdk.ProgramSourceMap(input);
      const expectedPcs = Array.from(expectedLocations.keys());
      assert.deepStrictEqual(sourceMap.getPcs(), expectedPcs);
    });
  });

  describe('getPcsForLine', () => {
    it('should return the correct pcs for all lines', () => {
      const sourceMap = new algosdk.ProgramSourceMap(input);
      const maxLineToCheck = 15;

      for (let line = 1; line <= maxLineToCheck; line++) {
        const expected = expectedPcsForLine.get(line) || [];
        assert.deepStrictEqual(
          sourceMap.getPcsOnSourceLine(0, line),
          expected,
          `line=${line}`
        );
      }
    });
  });
});
