import assert from 'assert';
import algosdk from '../index';
import * as logic from '../src/logic/logic';
import * as utils from '../src/utils/utils';

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
      let lsig = algosdk.makeLogicSig(program);
      assert.strictEqual(lsig.logic, program);
      assert.strictEqual(lsig.args, undefined);
      assert.strictEqual(lsig.sig, undefined);
      assert.strictEqual(lsig.msig, undefined);
      assert.strictEqual(lsig.address(), programHash);

      let verified = lsig.verify(pk);
      assert.strictEqual(verified, true);

      const args = [Uint8Array.from([1, 2, 3]), Uint8Array.from([4, 5, 6])];
      lsig = algosdk.makeLogicSig(program, args);
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
      const lsig = algosdk.makeLogicSig(program);
      const verified = lsig.verify(pk);
      assert.strictEqual(verified, false);
    });
    it('should fail on invalid program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      program[0] = 128;
      assert.throws(() => algosdk.makeLogicSig(program));
    });
  });

  describe('address', () => {
    it('should produce the correct address', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      const programHash =
        '6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY';

      const lsig = algosdk.makeLogicSig(program);
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
    it('should fail on invalid program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      program[0] = 128;
      assert.throws(() => new algosdk.LogicSigAccount(program));
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
    lsigObject:
      | ReturnType<typeof algosdk.makeLogicSig>
      | algosdk.LogicSigAccount,
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
      const lsig = algosdk.makeLogicSig(program, args);

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
      const lsig = algosdk.makeLogicSig(program, args);
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
      const lsig = algosdk.makeLogicSig(program, args);
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
    const lsig = algosdk.makeLogicSig(program);

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

describe('Program validation', () => {
  describe('Varint', () => {
    it('should parse binary data correctly', () => {
      let data = Uint8Array.from([1]);
      let [value, length] = logic.parseUvarint(data);
      assert.strictEqual(length, 1);
      assert.strictEqual(value, 1);

      data = Uint8Array.from([123]);
      [value, length] = logic.parseUvarint(data);
      assert.strictEqual(length, 1);
      assert.strictEqual(value, 123);

      data = Uint8Array.from([200, 3]);
      [value, length] = logic.parseUvarint(data);
      assert.strictEqual(length, 2);
      assert.strictEqual(value, 456);
    });
  });
  describe('Const blocks', () => {
    it('should parse int const block correctly', () => {
      const data = Uint8Array.from([32, 5, 0, 1, 200, 3, 123, 2]);
      const size = logic.checkIntConstBlock(data, 0);
      assert.strictEqual(size, data.length);
    });
    it('should parse bytes const block correctly', () => {
      const data = Uint8Array.from([
        38,
        2,
        13,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        48,
        49,
        50,
        51,
        2,
        1,
        2,
      ]);
      const size = logic.checkByteConstBlock(data, 0);
      assert.strictEqual(size, data.length);
    });
    it('should parse int push op correctly', () => {
      const data = Uint8Array.from([0x81, 0x80, 0x80, 0x04]);
      const size = logic.checkPushIntOp(data, 0);
      assert.strictEqual(size, data.length);
    });
    it('should parse byte push op correctly', () => {
      const data = Uint8Array.from([
        0x80,
        0x0b,
        0x68,
        0x65,
        0x6c,
        0x6c,
        0x6f,
        0x20,
        0x77,
        0x6f,
        0x72,
        0x6c,
        0x64,
      ]);
      const size = logic.checkPushByteOp(data, 0);
      assert.strictEqual(size, data.length);
    });
  });
  describe('Program checker', () => {
    it('should assess correct programs right', () => {
      let program = Uint8Array.from([1, 32, 1, 1, 34]);
      let result = logic.checkProgram(program);
      assert.strictEqual(result, true);

      const args = [Uint8Array.from([1, 2, 3])];

      result = logic.checkProgram(program, args);
      assert.strictEqual(result, true);

      program = utils.concatArrays(program, new Array(10).fill(0x22));
      result = logic.checkProgram(program, args);
      assert.strictEqual(result, true);
    });
    it('should fail on long input', () => {
      assert.throws(
        () => (logic.checkProgram as any)(),
        new Error('empty program')
      );
      let program = Uint8Array.from([1, 32, 1, 1, 34]);
      assert.throws(
        () => logic.checkProgram(program, [new Uint8Array(1000).fill(55)]),
        new Error('program too long')
      );

      program = utils.concatArrays(program, new Uint8Array(1000).fill(34));
      assert.throws(
        () => logic.checkProgram(program),
        new Error('program too long')
      );
    });
    it('should fail on invalid program', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34, 255]);
      assert.throws(
        () => logic.checkProgram(program),
        new Error('invalid instruction')
      );
    });
    it('should fail on invalid args', () => {
      const program = Uint8Array.from([1, 32, 1, 1, 34]);
      assert.throws(
        () => logic.checkProgram(program, '123' as any),
        new Error('invalid arguments')
      );
    });
    it('should fail on costly program', () => {
      let program = Uint8Array.from([1, 38, 1, 1, 1, 40, 2]); // byte 0x01 + keccak256
      let result = logic.checkProgram(program);
      assert.strictEqual(result, true);

      // 10x keccak256 more is fine
      program = utils.concatArrays(program, new Uint8Array(10).fill(2));
      result = logic.checkProgram(program);
      assert.strictEqual(result, true);

      // 800x keccak256 more is too costly
      program = utils.concatArrays(program, new Uint8Array(800).fill(2));
      //  old versions
      const oldVersions = [0x1, 0x2, 0x3];
      let i;
      for (i = 0; i < oldVersions.length; i++) {
        program[0] = oldVersions[i];
        assert.throws(
          () => logic.checkProgram(program),
          new Error(
            'program too costly for Teal version < 4. consider using v4.'
          )
        );
      }
      //  new versions
      const newVersions = [0x4];
      for (i = 0; i < newVersions.length; i++) {
        program[0] = newVersions[i];
        assert.ok(logic.checkProgram(program));
      }
    });
    it('should support TEAL v2 opcodes', () => {
      assert.ok(logic.langspecEvalMaxVersion >= 2);
      assert.ok(logic.langspecLogicSigVersion >= 2);

      // balance
      let program = Uint8Array.from([0x02, 0x20, 0x01, 0x00, 0x22, 0x60]); // int 0; balance
      let result = logic.checkProgram(program);
      assert.strictEqual(result, true);

      // app_opted_in
      program = Uint8Array.from([0x02, 0x20, 0x01, 0x00, 0x22, 0x22, 0x61]); // int 0; int 0; app_opted_in
      result = logic.checkProgram(program);
      assert.strictEqual(result, true);

      // 800x keccak256 more is to costly
      // prettier-ignore
      program = Uint8Array.from([0x02, 0x20, 0x01, 0x00, 0x22, 0x22, 0x70, 0x00 ]); // int 0; int 0; asset_holding_get Balance
      result = logic.checkProgram(program);
      assert.strictEqual(result, true);
    });
    it('should support TEAL v3 opcodes', () => {
      assert.ok(logic.langspecEvalMaxVersion >= 3);
      assert.ok(logic.langspecLogicSigVersion >= 3);

      // min_balance
      let program = Uint8Array.from([0x03, 0x20, 0x01, 0x00, 0x22, 0x78]); // int 0; min_balance
      assert.ok(logic.checkProgram(program));

      // pushbytes
      program = Uint8Array.from([
        0x03,
        0x20,
        0x01,
        0x00,
        0x22,
        0x80,
        0x02,
        0x68,
        0x69,
        0x48,
      ]); // int 0; pushbytes "hi"; pop
      assert.ok(logic.checkProgram(program));

      // pushint
      program = Uint8Array.from([
        0x03,
        0x20,
        0x01,
        0x00,
        0x22,
        0x81,
        0x01,
        0x48,
      ]); // int 0; pushint 1; pop
      assert.ok(logic.checkProgram(program));

      // swap
      program = Uint8Array.from([
        0x03,
        0x20,
        0x02,
        0x00,
        0x01,
        0x22,
        0x23,
        0x4c,
        0x48,
      ]); // int 0; int 1; swap; pop
      assert.ok(logic.checkProgram(program));
    });
    it('should support TEAL v4 opcodes', () => {
      assert.ok(logic.langspecEvalMaxVersion >= 4);

      // divmodw
      let program = Uint8Array.from([
        0x04,
        0x20,
        0x03,
        0x01,
        0x00,
        0x02,
        0x22,
        0x81,
        0xd0,
        0x0f,
        0x23,
        0x24,
        0x1f,
      ]); // int 1; pushint 2000; int 0; int 2; divmodw
      assert.ok(logic.checkProgram(program));

      // gloads i
      program = Uint8Array.from([0x04, 0x20, 0x01, 0x00, 0x22, 0x3b, 0x00]); // int 0; gloads 0
      assert.ok(logic.checkProgram(program));

      // callsub
      program = Uint8Array.from([
        0x04,
        0x20,
        0x02,
        0x01,
        0x02,
        0x22,
        0x88,
        0x00,
        0x02,
        0x23,
        0x12,
        0x49,
      ]); // int 1; callsub double; int 2; ==; double: dup;
      assert.ok(logic.checkProgram(program));

      // b>=
      program = Uint8Array.from([
        0x04,
        0x26,
        0x02,
        0x01,
        0x11,
        0x01,
        0x10,
        0x28,
        0x29,
        0xa7,
      ]); // byte 0x11; byte 0x10; b>=
      assert.ok(logic.checkProgram(program));

      // b^
      program = Uint8Array.from([
        0x04,
        0x26,
        0x03,
        0x01,
        0x11,
        0x01,
        0x10,
        0x01,
        0x01,
        0x28,
        0x29,
        0xad,
        0x2a,
        0x12,
      ]); // byte 0x11; byte 0x10; b>=
      assert.ok(logic.checkProgram(program));

      // callsub, retsub
      program = Uint8Array.from([
        0x04,
        0x20,
        0x02,
        0x01,
        0x02,
        0x22,
        0x88,
        0x00,
        0x03,
        0x23,
        0x12,
        0x43,
        0x49,
        0x08,
        0x89,
      ]); // int 1; callsub double; int 2; ==; return; double: dup; +; retsub;
      assert.ok(logic.checkProgram(program));

      // loop
      program = Uint8Array.from([
        0x04,
        0x20,
        0x04,
        0x01,
        0x02,
        0x0a,
        0x10,
        0x22,
        0x23,
        0x0b,
        0x49,
        0x24,
        0x0c,
        0x40,
        0xff,
        0xf8,
        0x25,
        0x12,
      ]); // int 1; loop: int 2; *; dup; int 10; <; bnz loop; int 16; ==
      assert.ok(logic.checkProgram(program));
    });
    it('should support TEAL v5 opcodes', () => {
      assert.ok(logic.langspecEvalMaxVersion >= 5);

      // itxn ops
      let program = new Uint8Array(
        Buffer.from('052001c0843db18101b21022b2083100b207b3b4082212', 'hex')
      );
      // itxn_begin; int pay; itxn_field TypeEnum; int 1000000; itxn_field Amount; txn Sender; itxn_field Receiver; itxn_submit; itxn Amount; int 1000000; ==
      assert.ok(logic.checkProgram(program));

      // ECDSA ops
      program = new Uint8Array(
        Buffer.from(
          '058008746573746461746103802079bfa8245aeac0e714b7bd2b3252d03979e5e7a43cb039715a5f8109a7dd9ba180200753d317e54350d1d102289afbde3002add4529f10b9f7d3d223843985de62e0802103abfb5e6e331fb871e423f354e2bd78a384ef7cb07ac8bbf27d2dd1eca00e73c106000500',
          'hex'
        )
      );
      // byte "testdata"; sha512_256; byte 0x79bfa8245aeac0e714b7bd2b3252d03979e5e7a43cb039715a5f8109a7dd9ba1; byte 0x0753d317e54350d1d102289afbde3002add4529f10b9f7d3d223843985de62e0; byte 0x03abfb5e6e331fb871e423f354e2bd78a384ef7cb07ac8bbf27d2dd1eca00e73c1; ecdsa_pk_decompress Secp256k1; ecdsa_verify Secp256k1
      assert.ok(logic.checkProgram(program));
    });
  });
});

describe('Template logic validation', () => {
  describe('Split', () => {
    it('should match the goldens', () => {
      // Inputs
      const owner =
        'WO3QIJ6T4DZHBX5PWJH26JLHFSRT7W7M2DJOULPXDTUS6TUX7ZRIO4KDFY';
      const receivers = [
        'W6UUUSEAOGLBHT7VFT4H2SDATKKSG6ZBUIJXTZMSLW36YS44FRP5NVAU7U',
        'XCIBIN7RT4ZXGBMVAMU3QS6L5EKB7XGROC5EPCNHHYXUIBAA5Q6C5Y7NEU',
      ];
      const rat1 = 100;
      const rat2 = 30;
      const expiryRound = 123456;
      const minPay = 10000;
      const maxFee = 5000000;
      const split = new algosdk.LogicTemplates.Split(
        owner,
        receivers[0],
        receivers[1],
        rat1,
        rat2,
        expiryRound,
        minPay,
        maxFee
      );
      // Outputs
      const goldenProgram =
        'ASAIAcCWsQICAMDEBx5kkE4mAyCztwQn0+DycN+vsk+vJWcsoz/b7NDS6i33HOkvTpf+YiC3qUpIgHGWE8/1LPh9SGCalSN7IaITeeWSXbfsS5wsXyC4kBQ38Z8zcwWVAym4S8vpFB/c0XC6R4mnPi9EBADsPDEQIhIxASMMEDIEJBJAABkxCSgSMQcyAxIQMQglEhAxAiEEDRAiQAAuMwAAMwEAEjEJMgMSEDMABykSEDMBByoSEDMACCEFCzMBCCEGCxIQMwAIIQcPEBA=';
      const goldenBytes = Buffer.from(goldenProgram, 'base64');
      const actualBytes = split.getProgram();
      assert.deepStrictEqual(goldenBytes, actualBytes);
      const goldenAddress =
        'KPYGWKTV7CKMPMTLQRNGMEQRSYTYDHUOFNV4UDSBDLC44CLIJPQWRTCPBU';
      assert.deepStrictEqual(goldenAddress, split.getAddress());
    });
  });
  describe('HTLC', () => {
    it('sha256 should match the goldens', () => {
      // Inputs
      const owner =
        '726KBOYUJJNE5J5UHCSGQGWIBZWKCBN4WYD7YVSTEXEVNFPWUIJ7TAEOPM';
      const receiver =
        '42NJMHTPFVPXVSDGA6JGKUV6TARV5UZTMPFIREMLXHETRKIVW34QFSDFRE';
      const hashFn = 'sha256';
      const hashImg = 'EHZhE08h/HwCIj1Qq56zYAvD/8NxJCOh5Hux+anb9V8=';
      const expiryRound = 600000;
      const maxFee = 1000;
      const htlc = new algosdk.LogicTemplates.HTLC(
        owner,
        receiver,
        hashFn,
        hashImg,
        expiryRound,
        maxFee
      );
      // Outputs
      const goldenProgram =
        'ASAE6AcBAMDPJCYDIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5IBB2YRNPIfx8AiI9UKues2ALw//DcSQjoeR7sfmp2/VfIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITMQEiDjEQIxIQMQcyAxIQMQgkEhAxCSgSLQEpEhAxCSoSMQIlDRAREA==';
      const goldenBytes = Buffer.from(goldenProgram, 'base64');
      const actualBytes = htlc.getProgram();
      assert.deepStrictEqual(goldenBytes, actualBytes);
      const goldenAddress =
        'FBZIR3RWVT2BTGVOG25H3VAOLVD54RTCRNRLQCCJJO6SVSCT5IVDYKNCSU';
      assert.deepStrictEqual(goldenAddress, htlc.getAddress());
      const goldenLtxn =
        'gqRsc2lngqNhcmeRxAhwcmVpbWFnZaFsxJcBIAToBwEAwM8kJgMg5pqWHm8tX3rIZgeSZVK+mCNe0zNjyoiRi7nJOKkVtvkgEHZhE08h/HwCIj1Qq56zYAvD/8NxJCOh5Hux+anb9V8g/ryguxRKWk6ntDikaBrIDmyhBby2B/xWUyXJVpX2ohMxASIOMRAjEhAxBzIDEhAxCCQSEDEJKBItASkSEDEJKhIxAiUNEBEQo3R4boelY2xvc2XEIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5o2ZlZc0D6KJmdgGiZ2jEIH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpomx2ZKNzbmTEIChyiO42rPQZmq42un3UDl1H3kZii2K4CElLvSrIU+oqpHR5cGWjcGF5';
      const o = {
        from: goldenAddress,
        to: receiver,
        fee: 0,
        amount: 0,
        closeRemainderTo: receiver,
        firstRound: 1,
        lastRound: 100,
        genesisHash: 'f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=',
        type: 'pay',
      };
      const preImageAsBase64 = 'cHJlaW1hZ2U=';
      const actualTxn = algosdk.LogicTemplates.signTransactionWithHTLCUnlock(
        htlc.getProgram(),
        o,
        preImageAsBase64
      );
      assert.deepStrictEqual(
        Buffer.from(goldenLtxn, 'base64'),
        Buffer.from(actualTxn.blob)
      );
    });
    it('keccak256 should match the goldens', () => {
      // Inputs
      const owner =
        '726KBOYUJJNE5J5UHCSGQGWIBZWKCBN4WYD7YVSTEXEVNFPWUIJ7TAEOPM';
      const receiver =
        '42NJMHTPFVPXVSDGA6JGKUV6TARV5UZTMPFIREMLXHETRKIVW34QFSDFRE';
      const hashFn = 'keccak256';
      const hashImg = 'D7d4MrvBrOSyNSmUs0kzucuJ+/9DbLkA6OOOocywoAc=';
      const expiryRound = 600000;
      const maxFee = 1000;
      const htlc = new algosdk.LogicTemplates.HTLC(
        owner,
        receiver,
        hashFn,
        hashImg,
        expiryRound,
        maxFee
      );
      // Outputs
      const goldenProgram =
        'ASAE6AcBAMDPJCYDIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5IA+3eDK7wazksjUplLNJM7nLifv/Q2y5AOjjjqHMsKAHIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITMQEiDjEQIxIQMQcyAxIQMQgkEhAxCSgSLQIpEhAxCSoSMQIlDRAREA==';
      const goldenBytes = Buffer.from(goldenProgram, 'base64');
      const actualBytes = htlc.getProgram();
      assert.deepStrictEqual(goldenBytes, actualBytes);
      const goldenAddress =
        '3MJ6JY3P6AU4R6I2RASYSAOPNI3QMWPZ7HYXJRNRGBIAXCHAY7QZRBH5PQ';
      assert.deepStrictEqual(goldenAddress, htlc.getAddress());
      const goldenLtxn =
        'gqRsc2lngqNhcmeRxAhwcmVpbWFnZaFsxJcBIAToBwEAwM8kJgMg5pqWHm8tX3rIZgeSZVK+mCNe0zNjyoiRi7nJOKkVtvkgD7d4MrvBrOSyNSmUs0kzucuJ+/9DbLkA6OOOocywoAcg/ryguxRKWk6ntDikaBrIDmyhBby2B/xWUyXJVpX2ohMxASIOMRAjEhAxBzIDEhAxCCQSEDEJKBItAikSEDEJKhIxAiUNEBEQo3R4boelY2xvc2XEIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5o2ZlZc0D6KJmdgGiZ2jEIH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpomx2ZKNzbmTEINsT5ONv8CnI+RqIJYkBz2o3Bln5+fF0xbEwUAuI4MfhpHR5cGWjcGF5';
      const o = {
        from: goldenAddress,
        to: receiver,
        fee: 0,
        amount: 0,
        closeRemainderTo: receiver,
        firstRound: 1,
        lastRound: 100,
        genesisHash: 'f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=',
        type: 'pay',
      };
      const preImageAsBase64 = 'cHJlaW1hZ2U=';
      const actualTxn = algosdk.LogicTemplates.signTransactionWithHTLCUnlock(
        htlc.getProgram(),
        o,
        preImageAsBase64
      );
      assert.deepStrictEqual(
        Buffer.from(goldenLtxn, 'base64'),
        Buffer.from(actualTxn.blob)
      );
    });
    it('other hash function should fail', () => {
      // Inputs
      const owner =
        '726KBOYUJJNE5J5UHCSGQGWIBZWKCBN4WYD7YVSTEXEVNFPWUIJ7TAEOPM';
      const receiver =
        '42NJMHTPFVPXVSDGA6JGKUV6TARV5UZTMPFIREMLXHETRKIVW34QFSDFRE';
      const hashFn = 'made-up-hash-fn';
      const hashImg = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
      const expiryRound = 600000;
      const maxFee = 1000;
      assert.throws(
        () =>
          new algosdk.LogicTemplates.HTLC(
            owner,
            receiver,
            hashFn,
            hashImg,
            expiryRound,
            maxFee
          )
      );
    });
  });
  describe('Limit Order', () => {
    it('should match the goldens', () => {
      // Inputs
      const owner =
        '726KBOYUJJNE5J5UHCSGQGWIBZWKCBN4WYD7YVSTEXEVNFPWUIJ7TAEOPM';
      const assetid = 12345;
      const ratn = 30;
      const ratd = 100;
      const expiryRound = 123456;
      const minTrade = 10000;
      const maxFee = 5000000;
      const limitOrder = new algosdk.LogicTemplates.LimitOrder(
        owner,
        assetid,
        ratn,
        ratd,
        expiryRound,
        minTrade,
        maxFee
      );
      // Outputs
      const goldenProgram =
        'ASAKAAHAlrECApBOBLlgZB7AxAcmASD+vKC7FEpaTqe0OKRoGsgObKEFvLYH/FZTJclWlfaiEzEWIhIxECMSEDEBJA4QMgQjEkAAVTIEJRIxCCEEDRAxCTIDEhAzARAhBRIQMwERIQYSEDMBFCgSEDMBEzIDEhAzARIhBx01AjUBMQghCB01BDUDNAE0Aw1AACQ0ATQDEjQCNAQPEEAAFgAxCSgSMQIhCQ0QMQcyAxIQMQgiEhAQ';
      const goldenBytes = Buffer.from(goldenProgram, 'base64');
      const actualBytes = limitOrder.getProgram();
      assert.deepStrictEqual(goldenBytes, actualBytes);
      const goldenAddress =
        'LXQWT2XLIVNFS54VTLR63UY5K6AMIEWI7YTVE6LB4RWZDBZKH22ZO3S36I';
      assert.deepStrictEqual(goldenAddress, limitOrder.getAddress());
      const secretKey = Buffer.from(
        'DTKVj7KMON3GSWBwMX9McQHtaDDi8SDEBi0bt4rOxlHNRahLa0zVG+25BDIaHB1dSoIHIsUQ8FFcdnCdKoG+Bg==',
        'base64'
      );
      const actualBlob = algosdk.LogicTemplates.getSwapAssetsTransaction(
        actualBytes,
        3000,
        10000,
        secretKey,
        10,
        1234,
        2234,
        'f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk='
      );
      const expectedTxn1 = Buffer.from(
        'gqRsc2lngaFsxLcBIAoAAcCWsQICkE4EuWBkHsDEByYBIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITMRYiEjEQIxIQMQEkDhAyBCMSQABVMgQlEjEIIQQNEDEJMgMSEDMBECEFEhAzAREhBhIQMwEUKBIQMwETMgMSEDMBEiEHHTUCNQExCCEIHTUENQM0ATQDDUAAJDQBNAMSNAI0BA8QQAAWADEJKBIxAiEJDRAxBzIDEhAxCCISEBCjdHhuiaNhbXTNJxCjZmVlzQisomZ2zQTSomdoxCB/g7Flf/H8U7ktwYFIodZd/C1LH6PWdyhK3dIAEm2QaaNncnDEIKz368WOGpdE/Ww0L8wUu5Ly2u2bpG3ZSMKCJvcvGApTomx2zQi6o3JjdsQgzUWoS2tM1RvtuQQyGhwdXUqCByLFEPBRXHZwnSqBvgajc25kxCBd4Wnq60VaWXeVmuPt0x1XgMQSyP4nUnlh5G2Rhyo+taR0eXBlo3BheQ==',
        'base64'
      );
      const expectedTxn2 = Buffer.from(
        'gqNzaWfEQKXv8Z6OUDNmiZ5phpoQJHmfKyBal4gBZLPYsByYnlXCAlXMBeVFG5CLP1k5L6BPyEG2/XIbjbyM0CGG55CxxAKjdHhuiqRhYW10zQu4pGFyY3bEIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITo2ZlZc0JJKJmds0E0qJnaMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmjZ3JwxCCs9+vFjhqXRP1sNC/MFLuS8trtm6Rt2UjCgib3LxgKU6Jsds0IuqNzbmTEIM1FqEtrTNUb7bkEMhocHV1KggcixRDwUVx2cJ0qgb4GpHR5cGWlYXhmZXKkeGFpZM0wOQ==',
        'base64'
      );
      const expectedBlob = Buffer.concat([expectedTxn1, expectedTxn2]);
      assert.deepStrictEqual(expectedBlob, Buffer.from(actualBlob));
    });
  });
  describe('Periodic payment', () => {
    it('should match the goldens', () => {
      // Inputs
      const receiver =
        'SKXZDBHECM6AS73GVPGJHMIRDMJKEAN5TUGMUPSKJCQ44E6M6TC2H2UJ3I';
      const leaseb64 = 'AQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIAQIDBAUGBwg=';
      const amount = 500000;
      const withdrawalWindow = 95;
      const period = 100;
      const expiryRound = 2445756;
      const maxFee = 1000;
      const periodicPayment = new algosdk.LogicTemplates.PeriodicPayment(
        receiver,
        amount,
        withdrawalWindow,
        period,
        expiryRound,
        maxFee,
        leaseb64
      );
      // Outputs
      const goldenProgram =
        'ASAHAegHZABfoMIevKOVASYCIAECAwQFBgcIAQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIIJKvkYTkEzwJf2arzJOxERsSogG9nQzKPkpIoc4TzPTFMRAiEjEBIw4QMQIkGCUSEDEEIQQxAggSEDEGKBIQMQkyAxIxBykSEDEIIQUSEDEJKRIxBzIDEhAxAiEGDRAxCCUSEBEQ';
      const goldenBytes = Buffer.from(goldenProgram, 'base64');
      const actualBytes = periodicPayment.getProgram();
      assert.deepStrictEqual(goldenBytes, actualBytes);
      const goldenAddress =
        'JMS3K4LSHPULANJIVQBTEDP5PZK6HHMDQS4OKHIMHUZZ6OILYO3FVQW7IY';
      assert.deepStrictEqual(goldenAddress, periodicPayment.getAddress());
      const goldenGenesisHash = 'f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=';
      const goldenStx =
        'gqRsc2lngaFsxJkBIAcB6AdkAF+gwh68o5UBJgIgAQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIAQIDBAUGBwggkq+RhOQTPAl/ZqvMk7ERGxKiAb2dDMo+SkihzhPM9MUxECISMQEjDhAxAiQYJRIQMQQhBDECCBIQMQYoEhAxCTIDEjEHKRIQMQghBRIQMQkpEjEHMgMSEDECIQYNEDEIJRIQERCjdHhuiaNhbXTOAAehIKNmZWXNA+iiZnbNBLCiZ2jEIH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpomx2zQUPomx4xCABAgMEBQYHCAECAwQFBgcIAQIDBAUGBwgBAgMEBQYHCKNyY3bEIJKvkYTkEzwJf2arzJOxERsSogG9nQzKPkpIoc4TzPTFo3NuZMQgSyW1cXI76LA1KKwDMg39flXjnYOEuOUdDD0znzkLw7akdHlwZaNwYXk=';
      const goldenStxBlob = Buffer.from(goldenStx, 'base64');
      const stx = algosdk.LogicTemplates.getPeriodicPaymentWithdrawalTransaction(
        actualBytes,
        0,
        1200,
        goldenGenesisHash
      );
      const expectedDict = algosdk.decodeObj(new Uint8Array(goldenStxBlob));
      const actualDict = algosdk.decodeObj(stx.blob);
      assert.deepStrictEqual(expectedDict, actualDict);
    });
  });
  describe('Limit Order', () => {
    it('should match the goldens', () => {
      // Inputs
      const owner =
        '726KBOYUJJNE5J5UHCSGQGWIBZWKCBN4WYD7YVSTEXEVNFPWUIJ7TAEOPM';
      const assetid = 12345;
      const ratn = 30;
      const ratd = 100;
      const expiryRound = 123456;
      const minTrade = 10000;
      const maxFee = 5000000;
      const limitOrder = new algosdk.LogicTemplates.LimitOrder(
        owner,
        assetid,
        ratn,
        ratd,
        expiryRound,
        minTrade,
        maxFee
      );
      // Outputs
      const goldenProgram =
        'ASAKAAHAlrECApBOBLlgZB7AxAcmASD+vKC7FEpaTqe0OKRoGsgObKEFvLYH/FZTJclWlfaiEzEWIhIxECMSEDEBJA4QMgQjEkAAVTIEJRIxCCEEDRAxCTIDEhAzARAhBRIQMwERIQYSEDMBFCgSEDMBEzIDEhAzARIhBx01AjUBMQghCB01BDUDNAE0Aw1AACQ0ATQDEjQCNAQPEEAAFgAxCSgSMQIhCQ0QMQcyAxIQMQgiEhAQ';
      const goldenBytes = Buffer.from(goldenProgram, 'base64');
      const actualBytes = limitOrder.getProgram();
      assert.deepStrictEqual(goldenBytes, actualBytes);
      const goldenAddress =
        'LXQWT2XLIVNFS54VTLR63UY5K6AMIEWI7YTVE6LB4RWZDBZKH22ZO3S36I';
      assert.deepStrictEqual(goldenAddress, limitOrder.getAddress());
    });
  });
  describe('Periodic payment', () => {
    it('should match the goldens', () => {
      // Inputs
      const receiver =
        'SKXZDBHECM6AS73GVPGJHMIRDMJKEAN5TUGMUPSKJCQ44E6M6TC2H2UJ3I';
      const leaseb64 = 'AQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIAQIDBAUGBwg=';
      const amount = 500000;
      const withdrawalWindow = 95;
      const period = 100;
      const expiryRound = 2445756;
      const maxFee = 1000;
      const periodicPayment = new algosdk.LogicTemplates.PeriodicPayment(
        receiver,
        amount,
        withdrawalWindow,
        period,
        expiryRound,
        maxFee,
        leaseb64
      );
      // Outputs
      const goldenProgram =
        'ASAHAegHZABfoMIevKOVASYCIAECAwQFBgcIAQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIIJKvkYTkEzwJf2arzJOxERsSogG9nQzKPkpIoc4TzPTFMRAiEjEBIw4QMQIkGCUSEDEEIQQxAggSEDEGKBIQMQkyAxIxBykSEDEIIQUSEDEJKRIxBzIDEhAxAiEGDRAxCCUSEBEQ';
      const goldenBytes = Buffer.from(goldenProgram, 'base64');
      const actualBytes = periodicPayment.getProgram();
      assert.deepStrictEqual(goldenBytes, actualBytes);
      const goldenAddress =
        'JMS3K4LSHPULANJIVQBTEDP5PZK6HHMDQS4OKHIMHUZZ6OILYO3FVQW7IY';
      assert.deepStrictEqual(goldenAddress, periodicPayment.getAddress());
      const goldenGenesisHash = 'f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=';
      const goldenStx =
        'gqRsc2lngaFsxJkBIAcB6AdkAF+gwh68o5UBJgIgAQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIAQIDBAUGBwggkq+RhOQTPAl/ZqvMk7ERGxKiAb2dDMo+SkihzhPM9MUxECISMQEjDhAxAiQYJRIQMQQhBDECCBIQMQYoEhAxCTIDEjEHKRIQMQghBRIQMQkpEjEHMgMSEDECIQYNEDEIJRIQERCjdHhuiaNhbXTOAAehIKNmZWXNA+iiZnbNBLCiZ2jEIH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpomx2zQUPomx4xCABAgMEBQYHCAECAwQFBgcIAQIDBAUGBwgBAgMEBQYHCKNyY3bEIJKvkYTkEzwJf2arzJOxERsSogG9nQzKPkpIoc4TzPTFo3NuZMQgSyW1cXI76LA1KKwDMg39flXjnYOEuOUdDD0znzkLw7akdHlwZaNwYXk=';
      const goldenStxBlob = Buffer.from(goldenStx, 'base64');
      const stx = algosdk.LogicTemplates.getPeriodicPaymentWithdrawalTransaction(
        actualBytes,
        0,
        1200,
        goldenGenesisHash
      );
      const expectedDict = algosdk.decodeObj(new Uint8Array(goldenStxBlob));
      const actualDict = algosdk.decodeObj(stx.blob);
      assert.deepStrictEqual(expectedDict, actualDict);
    });
  });
  describe('Dynamic Fee', () => {
    it('should match the goldens', () => {
      // Inputs
      const receiver =
        '726KBOYUJJNE5J5UHCSGQGWIBZWKCBN4WYD7YVSTEXEVNFPWUIJ7TAEOPM';
      const amount = 5000;
      const firstValid = 12345;
      const lastValid = 12346;
      const closeRemainder =
        '42NJMHTPFVPXVSDGA6JGKUV6TARV5UZTMPFIREMLXHETRKIVW34QFSDFRE';
      const artificialLease = 'f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=';
      const leaseBytes = new Uint8Array(Buffer.from(artificialLease, 'base64'));
      const dynamicFee = new algosdk.LogicTemplates.DynamicFee(
        receiver,
        amount,
        firstValid,
        lastValid,
        closeRemainder,
        leaseBytes
      );
      // Outputs
      const goldenProgram =
        'ASAFAgGIJ7lgumAmAyD+vKC7FEpaTqe0OKRoGsgObKEFvLYH/FZTJclWlfaiEyDmmpYeby1feshmB5JlUr6YI17TM2PKiJGLuck4qRW2+SB/g7Flf/H8U7ktwYFIodZd/C1LH6PWdyhK3dIAEm2QaTIEIhIzABAjEhAzAAcxABIQMwAIMQESEDEWIxIQMRAjEhAxBygSEDEJKRIQMQgkEhAxAiUSEDEEIQQSEDEGKhIQ';
      const goldenBytes = Buffer.from(goldenProgram, 'base64');
      const actualBytes = dynamicFee.getProgram();
      assert.deepStrictEqual(goldenBytes, actualBytes);
      const goldenAddress =
        'GCI4WWDIWUFATVPOQ372OZYG52EULPUZKI7Y34MXK3ZJKIBZXHD2H5C5TI';
      assert.deepStrictEqual(goldenAddress, dynamicFee.getAddress());
      const privateKeyOneB64 =
        'cv8E0Ln24FSkwDgGeuXKStOTGcze5u8yldpXxgrBxumFPYdMJymqcGoxdDeyuM8t6Kxixfq0PJCyJP71uhYT7w==';
      const privateKeyOne = Buffer.from(privateKeyOneB64, 'base64');
      const goldenGenesisHash = 'f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=';
      const txnAndLsig = algosdk.LogicTemplates.signDynamicFee(
        actualBytes,
        privateKeyOne,
        goldenGenesisHash
      );
      const txnDict = txnAndLsig.txn;
      const txnObj = new algosdk.Transaction(txnDict);
      const txnBytes = txnObj.toByte();
      const goldenTxn =
        'iqNhbXTNE4ilY2xvc2XEIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5o2ZlZc0D6KJmds0wOaJnaMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmibHbNMDqibHjEIH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpo3JjdsQg/ryguxRKWk6ntDikaBrIDmyhBby2B/xWUyXJVpX2ohOjc25kxCCFPYdMJymqcGoxdDeyuM8t6Kxixfq0PJCyJP71uhYT76R0eXBlo3BheQ==';
      assert.deepStrictEqual(
        new Uint8Array(Buffer.from(goldenTxn, 'base64')),
        txnBytes
      );
      const { lsig } = txnAndLsig;
      const lsigBytes = lsig.toByte();
      const goldenLsig =
        'gqFsxLEBIAUCAYgnuWC6YCYDIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5IH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpMgQiEjMAECMSEDMABzEAEhAzAAgxARIQMRYjEhAxECMSEDEHKBIQMQkpEhAxCCQSEDECJRIQMQQhBBIQMQYqEhCjc2lnxEAhLNdfdDp9Wbi0YwsEQCpP7TVHbHG7y41F4MoESNW/vL1guS+5Wj4f5V9fmM63/VKTSMFidHOSwm5o+pbV5lYH';
      assert.deepStrictEqual(
        new Uint8Array(Buffer.from(goldenLsig, 'base64')),
        lsigBytes
      );
      const privateKeyTwoB64 =
        '2qjz96Vj9M6YOqtNlfJUOKac13EHCXyDty94ozCjuwwriI+jzFgStFx9E6kEk1l4+lFsW4Te2PY1KV8kNcccRg==';
      const privateKeyTwo = Buffer.from(privateKeyTwoB64, 'base64');
      const stxns = algosdk.LogicTemplates.getDynamicFeeTransactions(
        txnDict,
        lsig,
        privateKeyTwo,
        1234,
        firstValid,
        lastValid
      );
      const goldenStxns =
        'gqNzaWfEQJBNVry9qdpnco+uQzwFicUWHteYUIxwDkdHqY5Qw2Q8Fc2StrQUgN+2k8q4rC0LKrTMJQnE+mLWhZgMMJvq3QCjdHhuiqNhbXTOAAWq6qNmZWXOAATzvqJmds0wOaJnaMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmjZ3JwxCCCVfqhCinRBXKMIq9eSrJQIXZ+7iXUTig91oGd/mZEAqJsds0wOqJseMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmjcmN2xCCFPYdMJymqcGoxdDeyuM8t6Kxixfq0PJCyJP71uhYT76NzbmTEICuIj6PMWBK0XH0TqQSTWXj6UWxbhN7Y9jUpXyQ1xxxGpHR5cGWjcGF5gqRsc2lngqFsxLEBIAUCAYgnuWC6YCYDIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5IH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpMgQiEjMAECMSEDMABzEAEhAzAAgxARIQMRYjEhAxECMSEDEHKBIQMQkpEhAxCCQSEDECJRIQMQQhBBIQMQYqEhCjc2lnxEAhLNdfdDp9Wbi0YwsEQCpP7TVHbHG7y41F4MoESNW/vL1guS+5Wj4f5V9fmM63/VKTSMFidHOSwm5o+pbV5lYHo3R4boujYW10zROIpWNsb3NlxCDmmpYeby1feshmB5JlUr6YI17TM2PKiJGLuck4qRW2+aNmZWXOAAWq6qJmds0wOaJnaMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmjZ3JwxCCCVfqhCinRBXKMIq9eSrJQIXZ+7iXUTig91oGd/mZEAqJsds0wOqJseMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmjcmN2xCD+vKC7FEpaTqe0OKRoGsgObKEFvLYH/FZTJclWlfaiE6NzbmTEIIU9h0wnKapwajF0N7K4zy3orGLF+rQ8kLIk/vW6FhPvpHR5cGWjcGF5';
      const goldenStxnBytes = Buffer.from(goldenStxns, 'base64');
      assert.deepStrictEqual(new Uint8Array(goldenStxnBytes), stxns);
    });
  });
});
