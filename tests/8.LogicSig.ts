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
const sampleMultisigParams: algosdk.MultisigMetadata = {
  version: 1,
  threshold: 2,
  addrs: [sampleAccount1.addr, sampleAccount2.addr, sampleAccount3.addr],
};

const sampleMultisigAddr = algosdk.multisigAddress(sampleMultisigParams);

describe('LogicSig', () => {
  describe('makeLogicSig', () => {
    it('should work on valid program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const programHash =
        '6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY';
      const pk = algosdk.decodeAddress(programHash).publicKey;
      let lsig = new algosdk.LogicSig(program);
      assert.strictEqual(lsig.logic, program);
      assert.strictEqual(lsig.args, undefined);
      assert.strictEqual(lsig.sig, undefined);
      assert.strictEqual(lsig.msig, undefined);
      assert.strictEqual(lsig.address(), programHash);

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

      assert.deepStrictEqual(address, programHash);
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
        Buffer.from('gaRsc2lngaFsxAUBIAEBIg==', 'base64')
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
        Buffer.from('gaRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIg==', 'base64')
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
        Buffer.from(
          'SRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9Ag==',
          'base64'
        )
      );
      const expectedSigKey = algosdk.decodeAddress(sampleAccount1.addr)
        .publicKey;

      assert.deepStrictEqual(lsigAccount.lsig.logic, program);
      assert.deepStrictEqual(lsigAccount.lsig.args, args);
      assert.deepStrictEqual(lsigAccount.lsig.sig, expectedSig);
      assert.strictEqual(lsigAccount.lsig.msig, undefined);
      assert.deepStrictEqual(lsigAccount.sigkey, expectedSigKey);

      // check serialization
      const encoded = lsigAccount.toByte();
      const expectedEncoded = new Uint8Array(
        Buffer.from(
          'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA==',
          'base64'
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
        Buffer.from(
          'SRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9Ag==',
          'base64'
        )
      );
      const expectedMsig: algosdk.EncodedMultisig = {
        v: sampleMultisigParams.version,
        thr: sampleMultisigParams.threshold,
        subsig: sampleMultisigParams.addrs.map((addr) => ({
          pk: algosdk.decodeAddress(addr).publicKey,
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
        Buffer.from(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AQ==',
          'base64'
        )
      );
      assert.deepStrictEqual(encoded, expectedEncoded);

      const decoded = algosdk.LogicSigAccount.fromByte(encoded);
      assert.deepStrictEqual(decoded, lsigAccount);
    });
  });

  describe('appendToMultisig', () => {
    it('should properly append a signature', () => {
      const msig1of3Encoded = new Uint8Array(
        Buffer.from(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AQ==',
          'base64'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msig1of3Encoded);

      lsigAccount.appendToMultisig(sampleAccount2.sk);

      const expectedSig1 = new Uint8Array(
        Buffer.from(
          'SRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9Ag==',
          'base64'
        )
      );
      const expectedSig2 = new Uint8Array(
        Buffer.from(
          'ZLxV2+2RokHUKrZg9+FKuZmaUrOxcVjO/D9P58siQRStqT1ehAUCChemaYMDIk6Go4tqNsVUviBQ/9PuqLMECQ==',
          'base64'
        )
      );
      const expectedMsig: algosdk.EncodedMultisig = {
        v: sampleMultisigParams.version,
        thr: sampleMultisigParams.threshold,
        subsig: sampleMultisigParams.addrs.map((addr) => ({
          pk: algosdk.decodeAddress(addr).publicKey,
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
        Buffer.from(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB',
          'base64'
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
        Buffer.from('gaRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIg==', 'base64')
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(escrowEncoded);

      assert.strictEqual(lsigAccount.verify(), true);
    });

    it('should verify valid single sig', () => {
      const sigEncoded = new Uint8Array(
        Buffer.from(
          'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA==',
          'base64'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(sigEncoded);

      assert.strictEqual(lsigAccount.verify(), true);
    });

    it('should fail single sig with wrong sig', () => {
      const sigEncoded = new Uint8Array(
        Buffer.from(
          'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA==',
          'base64'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(sigEncoded);

      // modify signature
      lsigAccount.lsig.sig![0] = 0;

      assert.strictEqual(lsigAccount.verify(), false);
    });

    it('should verify valid multisig', () => {
      const msigEncoded = new Uint8Array(
        Buffer.from(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB',
          'base64'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msigEncoded);

      assert.strictEqual(lsigAccount.verify(), true);
    });

    it('should fail multisig with wrong sig', () => {
      const msigEncoded = new Uint8Array(
        Buffer.from(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB',
          'base64'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msigEncoded);

      // modify signature
      lsigAccount.lsig.msig!.subsig[0].s[0] = 0;

      assert.strictEqual(lsigAccount.verify(), false);
    });

    it('should fail multisig that does not meet threshold', () => {
      const msigBelowThresholdEncoded = new Uint8Array(
        Buffer.from(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AQ==',
          'base64'
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
        Buffer.from('gaRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIg==', 'base64')
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(escrowEncoded);

      assert.strictEqual(lsigAccount.isDelegated(), false);
    });

    it('should be correct for single sig', () => {
      const sigEncoded = new Uint8Array(
        Buffer.from(
          'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA==',
          'base64'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(sigEncoded);

      assert.strictEqual(lsigAccount.isDelegated(), true);
    });

    it('should be correct for multisig', () => {
      const msigEncoded = new Uint8Array(
        Buffer.from(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB',
          'base64'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msigEncoded);

      assert.strictEqual(lsigAccount.isDelegated(), true);
    });
  });

  describe('address', () => {
    it('should be correct for escrow', () => {
      const escrowEncoded = new Uint8Array(
        Buffer.from('gaRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIg==', 'base64')
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(escrowEncoded);

      const addr = lsigAccount.address();

      const expectedAddr =
        '6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY';

      assert.strictEqual(addr, expectedAddr);
    });

    it('should be correct for single sig', () => {
      const sigEncoded = new Uint8Array(
        Buffer.from(
          'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQEkTuAXRnn8sEID2M34YVKfO6u4Q3b0TZYS/k7dfMGMVkcojDO3vI9F0G1KdsP/vN1TWRvS1YfyLvC17TmNcvQKmc2lna2V5xCAbfsCwS+pht5aQl+bL9AfhCKcFNR0LyYq+sSIJqKuBeA==',
          'base64'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(sigEncoded);

      const addr = lsigAccount.address();

      const expectedAddr =
        'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA';

      assert.strictEqual(addr, expectedAddr);
    });

    it('should be correct for multisig', () => {
      const msigEncoded = new Uint8Array(
        Buffer.from(
          'gaRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYB',
          'base64'
        )
      );
      const lsigAccount = algosdk.LogicSigAccount.fromByte(msigEncoded);

      const addr = lsigAccount.address();

      const expectedAddr =
        'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM';

      assert.strictEqual(addr, expectedAddr);
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
    sender: string,
    expected: { txID: string; blob: Uint8Array }
  ) {
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender,
      to: otherAddr,
      amount: 5000,
      suggestedParams: {
        flatFee: true,
        fee: 217000,
        firstRound: 972508,
        lastRound: 973508,
        genesisID: 'testnet-v31.0',
        genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
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
            Buffer.from(
              'gqRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIqN0eG6Ko2FtdM0TiKNmZWXOAANPqKJmds4ADtbco2dlbq10ZXN0bmV0LXYzMS4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds4ADtrEpG5vdGXECLRReTn8+tJxo3JjdsQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+Yqjc25kxCD2di2sdbGZfWwslhgGgFB0kNeVES/+f7dgsnOK+cfxraR0eXBlo3BheQ==',
              'base64'
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
            Buffer.from(
              'g6Rsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIqRzZ25yxCD2di2sdbGZfWwslhgGgFB0kNeVES/+f7dgsnOK+cfxraN0eG6Ko2FtdM0TiKNmZWXOAANPqKJmds4ADtbco2dlbq10ZXN0bmV0LXYzMS4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds4ADtrEpG5vdGXECLRReTn8+tJxo3JjdsQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+Yqjc25kxCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqR0eXBlo3BheQ==',
              'base64'
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
            Buffer.from(
              'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQD4FPTlN+xK8ZXmf6jGKe46iUYtVLIq+bNenZS3YsBh+IQUtuSRiiRblYXTNDxmsuWxFpCmRmREd5Hzk/BLszgKjdHhuiqNhbXTNE4ijZmVlzgADT6iiZnbOAA7W3KNnZW6tdGVzdG5ldC12MzEuMKJnaMQgJgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dKibHbOAA7axKRub3RlxAi0UXk5/PrScaNyY3bEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKo3NuZMQgXmdPHAru7DdxiY9hx2/10koZeT4skfoIUWJj44Vz6kKkdHlwZaNwYXk=',
              'base64'
            )
          ),
        };
        testSign(lsig, sender, expected);
      });

      it('should throw an error when sender is not LogicSig address', () => {
        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: otherAddr,
          to: otherAddr,
          amount: 5000,
          suggestedParams: {
            flatFee: true,
            fee: 217000,
            firstRound: 972508,
            lastRound: 973508,
            genesisID: 'testnet-v31.0',
            genesisHash: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
          },
          note: new Uint8Array([180, 81, 121, 57, 252, 250, 210, 113]),
        });

        assert.throws(
          () => algosdk.signLogicSigTransaction(txn, lsig),
          (err) =>
            err.message ===
            'Logic signature verification failed. Ensure the program and signature are valid.'
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
            Buffer.from(
              'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBo3R4boqjYW10zROIo2ZlZc4AA0+oomZ2zgAO1tyjZ2VurXRlc3RuZXQtdjMxLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zgAO2sSkbm90ZcQItFF5Ofz60nGjcmN2xCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5',
              'base64'
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
            Buffer.from(
              'g6Rsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBpHNnbnLEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfpo3R4boqjYW10zROIo2ZlZc4AA0+oomZ2zgAO1tyjZ2VurXRlc3RuZXQtdjMxLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zgAO2sSkbm90ZcQItFF5Ofz60nGjcmN2xCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqNzbmTEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKpHR5cGWjcGF5',
              'base64'
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
            Buffer.from(
              'gqRsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIqN0eG6Ko2FtdM0TiKNmZWXOAANPqKJmds4ADtbco2dlbq10ZXN0bmV0LXYzMS4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds4ADtrEpG5vdGXECLRReTn8+tJxo3JjdsQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+Yqjc25kxCD2di2sdbGZfWwslhgGgFB0kNeVES/+f7dgsnOK+cfxraR0eXBlo3BheQ==',
              'base64'
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
            Buffer.from(
              'g6Rsc2lngqNhcmeSxAEBxAICA6FsxAUBIAEBIqRzZ25yxCD2di2sdbGZfWwslhgGgFB0kNeVES/+f7dgsnOK+cfxraN0eG6Ko2FtdM0TiKNmZWXOAANPqKJmds4ADtbco2dlbq10ZXN0bmV0LXYzMS4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds4ADtrEpG5vdGXECLRReTn8+tJxo3JjdsQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+Yqjc25kxCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqR0eXBlo3BheQ==',
              'base64'
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
            Buffer.from(
              'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQD4FPTlN+xK8ZXmf6jGKe46iUYtVLIq+bNenZS3YsBh+IQUtuSRiiRblYXTNDxmsuWxFpCmRmREd5Hzk/BLszgKjdHhuiqNhbXTNE4ijZmVlzgADT6iiZnbOAA7W3KNnZW6tdGVzdG5ldC12MzEuMKJnaMQgJgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dKibHbOAA7axKRub3RlxAi0UXk5/PrScaNyY3bEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKo3NuZMQgXmdPHAru7DdxiY9hx2/10koZeT4skfoIUWJj44Vz6kKkdHlwZaNwYXk=',
              'base64'
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
            Buffer.from(
              'g6Rsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqNzaWfEQD4FPTlN+xK8ZXmf6jGKe46iUYtVLIq+bNenZS3YsBh+IQUtuSRiiRblYXTNDxmsuWxFpCmRmREd5Hzk/BLszgKkc2ducsQgXmdPHAru7DdxiY9hx2/10koZeT4skfoIUWJj44Vz6kKjdHhuiqNhbXTNE4ijZmVlzgADT6iiZnbOAA7W3KNnZW6tdGVzdG5ldC12MzEuMKJnaMQgJgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dKibHbOAA7axKRub3RlxAi0UXk5/PrScaNyY3bEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKo3NuZMQgtMYiaKTDNVD1im3UuMojnJ8dELNBqn4aNuPOYfv8+YqkdHlwZaNwYXk=',
              'base64'
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
            Buffer.from(
              'gqRsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBo3R4boqjYW10zROIo2ZlZc4AA0+oomZ2zgAO1tyjZ2VurXRlc3RuZXQtdjMxLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zgAO2sSkbm90ZcQItFF5Ofz60nGjcmN2xCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5',
              'base64'
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
            Buffer.from(
              'g6Rsc2lng6NhcmeSxAEBxAICA6FsxAUBIAEBIqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RASRO4BdGefywQgPYzfhhUp87q7hDdvRNlhL+Tt18wYxWRyiMM7e8j0XQbUp2w/+83VNZG9LVh/Iu8LXtOY1y9AoKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQGS8VdvtkaJB1Cq2YPfhSrmZmlKzsXFYzvw/T+fLIkEUrak9XoQFAgoXpmmDAyJOhqOLajbFVL4gUP/T7qizBAmBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBpHNnbnLEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfpo3R4boqjYW10zROIo2ZlZc4AA0+oomZ2zgAO1tyjZ2VurXRlc3RuZXQtdjMxLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zgAO2sSkbm90ZcQItFF5Ofz60nGjcmN2xCC0xiJopMM1UPWKbdS4yiOcnx0Qs0Gqfho2485h+/z5iqNzbmTEILTGImikwzVQ9Ypt1LjKI5yfHRCzQap+GjbjzmH7/PmKpHR5cGWjcGF5',
              'base64'
            )
          ),
        };
        testSign(lsigAccount, sender, expected);
      });
    });
  });

  it('should sign a raw transaction object', () => {
    const lsig = new algosdk.LogicSig(program);

    const from = lsig.address();
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
    const txn = {
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

    const actual = algosdk.signLogicSigTransaction(txn, lsig);
    const expected = {
      txID: 'D7H6THOHOCEWJYNWMKHVOR2W36KAJXSGG6DMNTHTBWONBCG4XATA',
      blob: new Uint8Array(
        Buffer.from(
          'gqRsc2lngaFsxAUBIAEBIqN0eG6Ko2FtdM0DT6NmZWXNCniiZnYzomdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsdj2kbm90ZcQDewzIo3JjdsQgoImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX6lcmVrZXnEIDAhUOuXI/Dnhg1MAE4rbltxOOB+7lUduJbsxucZf2DUo3NuZMQg9nYtrHWxmX1sLJYYBoBQdJDXlREv/n+3YLJzivnH8a2kdHlwZaNwYXk=',
          'base64'
        )
      ),
    };

    assert.deepStrictEqual(actual, expected);
  });
});
