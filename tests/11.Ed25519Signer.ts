/* eslint-env mocha */
import assert from 'assert';
import algosdk, {
  addressWithSignersFromRawEd25519Signer,
  Ed25519SigningKey,
} from '../src/index';
import * as nacl from '../src/nacl/naclWrappers';

const sampleAccount1 = algosdk.mnemonicToSecretKey(
  'auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch'
);
const sampleAccount2 = algosdk.mnemonicToSecretKey(
  'since during average anxiety protect cherry club long lawsuit loan expand embark forum theory winter park twenty ball kangaroo cram burst board host ability left'
);
const sampleAccount3 = algosdk.mnemonicToSecretKey(
  'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor'
);

const sampleProgram = Uint8Array.from([1, 32, 1, 1, 34]); // int 1

const sampleSuggestedParams: algosdk.SuggestedParams = {
  minFee: 1000,
  fee: 0,
  firstValid: 51,
  lastValid: 61,
  genesisHash: algosdk.base64ToBytes(
    'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
  ),
  genesisID: 'mock-network',
};

/**
 * Build an Ed25519SigningKey backed by a sample account's secret key. This is
 * the "raw signer" abstraction: it only knows how to produce a detached
 * ed25519 signature over arbitrary bytes.
 */
function signingKeyForAccount(account: algosdk.Account): Ed25519SigningKey {
  return {
    ed25519PublicKey: account.addr.publicKey,
    ed25519Signer: async (bytesToSign: Uint8Array) =>
      nacl.sign(bytesToSign, account.sk),
  };
}

function makePaymentTxn(sender: string | algosdk.Address): algosdk.Transaction {
  return new algosdk.Transaction({
    type: algosdk.TransactionType.pay,
    sender,
    paymentParams: {
      receiver: sampleAccount2.addr,
      amount: 847,
    },
    suggestedParams: sampleSuggestedParams,
  });
}

describe('Ed25519Signer', () => {
  describe('addressWithSignersFromRawEd25519Signer', () => {
    it('defaults the sending address to the public key address', () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      assert.ok(signers.address.equals(sampleAccount1.addr));
    });

    it('honors a custom sending address', () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1),
        sampleAccount2.addr
      );
      assert.ok(signers.address.equals(sampleAccount2.addr));
    });

    it('exposes all signer functions', () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      assert.strictEqual(typeof signers.txnSigner, 'function');
      assert.strictEqual(typeof signers.delegatedLsigSigner, 'function');
      assert.strictEqual(typeof signers.mxBytesSigner, 'function');
      assert.strictEqual(typeof signers.programDataSigner, 'function');
    });
  });

  describe('txnSigner', () => {
    it('signs a single transaction with a valid signature and no sgnr', async () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      const txn = makePaymentTxn(sampleAccount1.addr);

      const blobs = await signers.txnSigner([txn], [0]);
      assert.strictEqual(blobs.length, 1);

      const stxn = algosdk.decodeMsgpack(blobs[0], algosdk.SignedTransaction);
      assert.ok(stxn.sig, 'expected a signature');
      assert.strictEqual(stxn.sgnr, undefined);
      assert.strictEqual(
        nacl.verify(
          txn.bytesToSign(),
          stxn.sig!,
          sampleAccount1.addr.publicKey
        ),
        true
      );
    });

    it('only signs the requested indexes', async () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      const txnGroup = [
        makePaymentTxn(sampleAccount1.addr),
        makePaymentTxn(sampleAccount1.addr),
        makePaymentTxn(sampleAccount1.addr),
      ];

      const blobs = await signers.txnSigner(txnGroup, [0, 2]);
      assert.strictEqual(blobs.length, 2);

      const stxn0 = algosdk.decodeMsgpack(blobs[0], algosdk.SignedTransaction);
      const stxn2 = algosdk.decodeMsgpack(blobs[1], algosdk.SignedTransaction);
      assert.strictEqual(
        nacl.verify(
          txnGroup[0].bytesToSign(),
          stxn0.sig!,
          sampleAccount1.addr.publicKey
        ),
        true
      );
      assert.strictEqual(
        nacl.verify(
          txnGroup[2].bytesToSign(),
          stxn2.sig!,
          sampleAccount1.addr.publicKey
        ),
        true
      );
    });

    it('sets sgnr to the auth address when signing on behalf of another sender', async () => {
      // The signing key belongs to account1, but the transaction is sent from
      // account3 (e.g. account3 was rekeyed to account1).
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      const txn = makePaymentTxn(sampleAccount3.addr);

      const [blob] = await signers.txnSigner([txn], [0]);
      const stxn = algosdk.decodeMsgpack(blob, algosdk.SignedTransaction);

      assert.ok(stxn.sgnr, 'expected an auth address (sgnr)');
      assert.ok(stxn.sgnr!.equals(sampleAccount1.addr));
      assert.strictEqual(
        nacl.verify(
          txn.bytesToSign(),
          stxn.sig!,
          sampleAccount1.addr.publicKey
        ),
        true
      );
    });

    it('still sets sgnr when a custom sending address is given', async () => {
      // account3 has been rekeyed to account1, and the signer is told to report
      // account3 as its sending address. `sgnr` is still required, because the
      // signature is made by account1's key, not account3's.
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1),
        sampleAccount3.addr
      );
      const txn = makePaymentTxn(sampleAccount3.addr);

      const [blob] = await signers.txnSigner([txn], [0]);
      const stxn = algosdk.decodeMsgpack(blob, algosdk.SignedTransaction);

      assert.ok(stxn.sgnr, 'expected an auth address (sgnr)');
      assert.ok(stxn.sgnr!.equals(sampleAccount1.addr));
      assert.strictEqual(
        nacl.verify(
          txn.bytesToSign(),
          stxn.sig!,
          sampleAccount1.addr.publicKey
        ),
        true
      );
    });

    it('omits sgnr when the sender is the signing key address', async () => {
      // The inverse case: a custom sending address must not cause a spurious
      // sgnr when the transaction is sent from the signing key's own address.
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1),
        sampleAccount3.addr
      );
      const txn = makePaymentTxn(sampleAccount1.addr);

      const [blob] = await signers.txnSigner([txn], [0]);
      const stxn = algosdk.decodeMsgpack(blob, algosdk.SignedTransaction);

      assert.strictEqual(stxn.sgnr, undefined);
    });
  });

  describe('multisig transaction signing', () => {
    const msigParams = {
      version: 1,
      threshold: 2,
      addrs: [sampleAccount1.addr, sampleAccount2.addr, sampleAccount3.addr],
    } satisfies algosdk.MultisigMetadata;
    const msigAddr = algosdk.multisigAddress(msigParams);

    it('attributes the subsignature to the signing key, not the sending address', async () => {
      // The signer holds account1's key but reports account3 as the address it
      // sends transactions from, as it would if account3 had been rekeyed to
      // account1. account3 is also a member of this multisig, so confusing the
      // two would silently file account1's signature under account3's subsig.
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1),
        sampleAccount3.addr
      );
      const txn = makePaymentTxn(msigAddr);

      const { blob } = await algosdk.signMultisigTransactionWithSigner(
        txn,
        msigParams,
        signers.txnSigner
      );

      const stxn = algosdk.decodeMsgpack(blob, algosdk.SignedTransaction);
      const signed = stxn.msig!.subsig.filter((s) => s.s);
      assert.strictEqual(signed.length, 1);
      assert.deepStrictEqual(signed[0].pk, sampleAccount1.addr.publicKey);
      assert.strictEqual(
        nacl.verify(
          txn.bytesToSign(),
          signed[0].s!,
          sampleAccount1.addr.publicKey
        ),
        true
      );
    });

    it('signs for a member whose sending address is not in the multisig', async () => {
      // Same rekey setup, but the sending address is not a member at all. The
      // signing key still is, so this must succeed.
      const twoOfTwo = {
        version: 1,
        threshold: 2,
        addrs: [sampleAccount1.addr, sampleAccount2.addr],
      } satisfies algosdk.MultisigMetadata;
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1),
        sampleAccount3.addr
      );
      const txn = makePaymentTxn(algosdk.multisigAddress(twoOfTwo));

      const { blob } = await algosdk.signMultisigTransactionWithSigner(
        txn,
        twoOfTwo,
        signers.txnSigner
      );

      const stxn = algosdk.decodeMsgpack(blob, algosdk.SignedTransaction);
      const signed = stxn.msig!.subsig.filter((s) => s.s);
      assert.strictEqual(signed.length, 1);
      assert.deepStrictEqual(signed[0].pk, sampleAccount1.addr.publicKey);
    });

    it('appends a second member signature to an existing blob', async () => {
      const txn = makePaymentTxn(msigAddr);

      const { blob: firstBlob } =
        await algosdk.signMultisigTransactionWithSigner(
          txn,
          msigParams,
          addressWithSignersFromRawEd25519Signer(
            signingKeyForAccount(sampleAccount1),
            sampleAccount3.addr
          ).txnSigner
        );

      const { blob } = await algosdk.appendSignMultisigTransactionWithSigner(
        firstBlob,
        msigParams,
        addressWithSignersFromRawEd25519Signer(
          signingKeyForAccount(sampleAccount2)
        ).txnSigner
      );

      const stxn = algosdk.decodeMsgpack(blob, algosdk.SignedTransaction);
      const signed = stxn.msig!.subsig.filter((s) => s.s);
      assert.strictEqual(signed.length, 2);
      assert.deepStrictEqual(signed[0].pk, sampleAccount1.addr.publicKey);
      assert.deepStrictEqual(signed[1].pk, sampleAccount2.addr.publicKey);
    });

    it('throws when the signing key is not a member of the multisig', async () => {
      const twoOfTwo = {
        version: 1,
        threshold: 2,
        addrs: [sampleAccount2.addr, sampleAccount3.addr],
      } satisfies algosdk.MultisigMetadata;

      await assert.rejects(
        algosdk.signMultisigTransactionWithSigner(
          makePaymentTxn(algosdk.multisigAddress(twoOfTwo)),
          twoOfTwo,
          addressWithSignersFromRawEd25519Signer(
            signingKeyForAccount(sampleAccount1)
          ).txnSigner
        ),
        /Key does not exist/
      );
    });

    it('throws when the signer does not identify its key via sgnr', async () => {
      // The signing key can only be identified by `sgnr`, so a signer that
      // omits it cannot be matched to a member. This must fail loudly rather
      // than attach the signature to the wrong subsig.
      const bareSigner: algosdk.TransactionSigner = async (group, indexes) =>
        indexes.map((i) =>
          algosdk.encodeMsgpack(
            new algosdk.SignedTransaction({
              txn: group[i],
              sig: nacl.sign(group[i].bytesToSign(), sampleAccount2.sk),
            })
          )
        );

      await assert.rejects(
        algosdk.signMultisigTransactionWithSigner(
          makePaymentTxn(msigAddr),
          msigParams,
          bareSigner
        ),
        /Key does not exist/
      );
    });
  });

  describe('delegated multisig lsig', () => {
    const msigParams = {
      version: 1,
      threshold: 2,
      addrs: [sampleAccount1.addr, sampleAccount2.addr, sampleAccount3.addr],
    } satisfies algosdk.MultisigMetadata;

    it('accumulates subsignatures from multiple members', async () => {
      const lsigAccount = new algosdk.LogicSigAccount(sampleProgram);

      await lsigAccount.signMultisigWithSigner(
        msigParams,
        addressWithSignersFromRawEd25519Signer(
          signingKeyForAccount(sampleAccount1)
        ).delegatedLsigSigner
      );
      assert.strictEqual(
        lsigAccount.lsig.lmsig!.subsig.filter((s) => s.s).length,
        1
      );

      await lsigAccount.appendToMultisigWithSigner(
        addressWithSignersFromRawEd25519Signer(
          signingKeyForAccount(sampleAccount2)
        ).delegatedLsigSigner
      );

      const signed = lsigAccount.lsig.lmsig!.subsig.filter((s) => s.s);
      assert.strictEqual(signed.length, 2);
      assert.deepStrictEqual(signed[0].pk, sampleAccount1.addr.publicKey);
      assert.deepStrictEqual(signed[1].pk, sampleAccount2.addr.publicKey);

      // With threshold 2 satisfied, the delegation verifies.
      assert.strictEqual(lsigAccount.verify(), true);
    });

    it('throws when appending a signer that is not in the multisig', async () => {
      const lsigAccount = new algosdk.LogicSigAccount(sampleProgram);
      await lsigAccount.signMultisigWithSigner(
        {
          version: 1,
          threshold: 2,
          addrs: [sampleAccount1.addr, sampleAccount2.addr],
        },
        addressWithSignersFromRawEd25519Signer(
          signingKeyForAccount(sampleAccount1)
        ).delegatedLsigSigner
      );

      await assert.rejects(
        lsigAccount.appendToMultisigWithSigner(
          addressWithSignersFromRawEd25519Signer(
            signingKeyForAccount(sampleAccount3)
          ).delegatedLsigSigner
        ),
        /could not find .* as a signer in the multisig/
      );
    });
  });

  describe('delegatedLsigSigner', () => {
    it('produces a delegated single signature that verifies', async () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      const lsig = new algosdk.LogicSig(sampleProgram);

      const result = await signers.delegatedLsigSigner(lsig);

      assert.ok(result.address.equals(sampleAccount1.addr));
      assert.ok('sig' in result && result.sig, 'expected a sig field');

      // Attach the signature and verify the lsig is valid for the signer's pk.
      const signedLsig = new algosdk.LogicSig(sampleProgram);
      signedLsig.sig = (result as { sig: Uint8Array }).sig;
      assert.strictEqual(
        signedLsig.verify(sampleAccount1.addr.publicKey),
        true
      );
    });

    it('produces a delegated multisig subsignature that verifies', async () => {
      const msigParams = {
        version: 1,
        threshold: 2,
        addrs: [sampleAccount1.addr, sampleAccount2.addr, sampleAccount3.addr],
      } satisfies algosdk.MultisigMetadata;

      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );

      const result = await signers.delegatedLsigSigner(
        new algosdk.LogicSig(sampleProgram),
        msigParams
      );

      assert.ok(result.address.equals(sampleAccount1.addr));
      assert.ok('lmsig' in result && result.lmsig, 'expected an lmsig field');

      const { lmsig } = result as { lmsig: algosdk.EncodedMultisig };
      assert.strictEqual(lmsig.v, msigParams.version);
      assert.strictEqual(lmsig.thr, msigParams.threshold);
      assert.strictEqual(lmsig.subsig.length, 3);

      // Only account1's subsig should be filled in.
      const signedSubsigs = lmsig.subsig.filter((s) => s.s);
      assert.strictEqual(signedSubsigs.length, 1);
      assert.deepStrictEqual(
        signedSubsigs[0].pk,
        sampleAccount1.addr.publicKey
      );
    });

    it('throws when the signer is not part of the multisig', async () => {
      const msigParams = {
        version: 1,
        threshold: 2,
        addrs: [sampleAccount2.addr, sampleAccount3.addr],
      } satisfies algosdk.MultisigMetadata;

      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );

      await assert.rejects(
        signers.delegatedLsigSigner(
          new algosdk.LogicSig(sampleProgram),
          msigParams
        ),
        /could not find .* as a signer in the multisig/
      );
    });
  });

  describe('mxBytesSigner', () => {
    it('signs arbitrary bytes with the "MX" prefix', async () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      const message = new TextEncoder().encode('hello world');

      const sig = await signers.mxBytesSigner(message);

      assert.strictEqual(
        algosdk.verifyBytes(message, sig, sampleAccount1.addr),
        true
      );
    });

    it('produces a signature that does not verify for other bytes', async () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      const message = new TextEncoder().encode('hello world');

      const sig = await signers.mxBytesSigner(message);

      assert.strictEqual(
        algosdk.verifyBytes(
          new TextEncoder().encode('goodbye world'),
          sig,
          sampleAccount1.addr
        ),
        false
      );
    });
  });

  describe('programDataSigner', () => {
    it('signs program data compatible with ed25519verify / verifyTealSign', async () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      const lsig = new algosdk.LogicSig(sampleProgram);
      const data = Uint8Array.from([1, 2, 3, 4, 5]);

      const sig = await signers.programDataSigner(data, lsig);

      assert.strictEqual(
        algosdk.verifyTealSign(
          data,
          lsig.address(),
          sig,
          sampleAccount1.addr.publicKey
        ),
        true
      );
    });

    it('matches the standalone tealSign output', async () => {
      const signers = addressWithSignersFromRawEd25519Signer(
        signingKeyForAccount(sampleAccount1)
      );
      const lsig = new algosdk.LogicSig(sampleProgram);
      const data = Uint8Array.from([9, 8, 7]);

      const sig = await signers.programDataSigner(data, lsig);
      const expected = algosdk.tealSign(
        sampleAccount1.sk,
        data,
        lsig.address()
      );

      assert.deepStrictEqual(sig, expected);
    });
  });
});
