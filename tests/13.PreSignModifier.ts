/* eslint-env mocha */
import assert from 'assert';
import nacl from 'tweetnacl';
import {
  ABIMethod,
  Account,
  AtomicTransactionComposer,
  AtomicTransactionComposerStatus,
  PreSignModifier,
  SignedTransaction,
  base64ToBytes,
  decodeMsgpack,
  generateAccount,
  makeBasicAccountTransactionSigner,
  makePaymentTxnWithSuggestedParamsFromObject,
} from '../src';

describe('AtomicTransactionComposer pre-sign modifiers', () => {
  const suggestedParams = {
    genesisHash: base64ToBytes('SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='),
    genesisID: '',
    firstValid: 0,
    lastValid: 1000,
    fee: 1000,
    flatFee: true,
    minFee: 1000,
  };

  const method = ABIMethod.fromSignature('add(uint64,uint64)uint64');
  const appID = 1234;

  function decodeSignedTxns(stxns: Uint8Array[]): SignedTransaction[] {
    return stxns.map((stxn) => decodeMsgpack(stxn, SignedTransaction));
  }

  // AtomicTransactionComposer keeps its txnIndex -> ABIMethod map private; the
  // only way to observe that a pre-sign modifier correctly remapped a method call's
  // key (without standing up a mock AlgodClient for simulate/execute) is to read it
  // directly off the instance.
  function getMethodCalls(
    composer: AtomicTransactionComposer
  ): Map<number, ABIMethod> {
    return (composer as unknown as { methodCalls: Map<number, ABIMethod> })
      .methodCalls;
  }

  // Cryptographically verifies that `stxn` was signed by `signer`, i.e. that the
  // composer paired the right TransactionSigner with the right transaction index
  // even after the group was reshaped by a pre-sign modifier.
  function assertSignedBy(stxn: SignedTransaction, signer: Account): void {
    assert.ok(stxn.sig, 'expected transaction to carry a signature');
    assert.ok(
      nacl.sign.detached.verify(
        stxn.txn.bytesToSign(),
        stxn.sig,
        signer.addr.publicKey
      ),
      'signature does not verify against the expected signer'
    );
  }

  it('should allow a pre-sign modifier to change a transaction within the group', async () => {
    const composer = new AtomicTransactionComposer();
    const account1 = generateAccount();
    const account2 = generateAccount();
    const appCaller = generateAccount();

    const txnToModify = makePaymentTxnWithSuggestedParamsFromObject({
      sender: account1.addr,
      receiver: account2.addr,
      amount: 1000,
      suggestedParams,
    });
    const untouchedTxn = makePaymentTxnWithSuggestedParamsFromObject({
      sender: account2.addr,
      receiver: account1.addr,
      amount: 500,
      suggestedParams,
    });

    const modifyPreSignModifier: PreSignModifier = async (_txnGroup, [index]) => ({
      modifications: [
        {
          index,
          fee: txnToModify.fee * 3n,
          firstValid: 5n,
          lastValid: 1005n,
        },
      ],
    });

    composer.addTransaction({
      txn: txnToModify,
      signer: makeBasicAccountTransactionSigner(account1),
      preSignModifier: modifyPreSignModifier,
    });
    composer.addTransaction({
      txn: untouchedTxn,
      signer: makeBasicAccountTransactionSigner(account2),
    });
    composer.addMethodCall({
      appID,
      method,
      methodArgs: [1, 2],
      sender: appCaller.addr,
      suggestedParams,
      signer: makeBasicAccountTransactionSigner(appCaller),
    });

    const stxns = await composer.gatherSignatures();
    assert.strictEqual(stxns.length, 3);
    assert.strictEqual(
      composer.getStatus(),
      AtomicTransactionComposerStatus.SIGNED
    );

    const [modified, untouched, appCall] = decodeSignedTxns(stxns);

    assert.strictEqual(modified.txn.fee, 3000n);
    assert.strictEqual(modified.txn.firstValid, 5n);
    assert.strictEqual(modified.txn.lastValid, 1005n);
    assertSignedBy(modified, account1);

    assert.strictEqual(untouched.txn.fee, 1000n);
    assert.strictEqual(untouched.txn.firstValid, 0n);
    assert.strictEqual(untouched.txn.lastValid, 1000n);
    assertSignedBy(untouched, account2);

    assert.strictEqual(appCall.txn.applicationCall?.appIndex, BigInt(appID));
    assert.deepStrictEqual(
      appCall.txn.applicationCall?.appArgs[0],
      method.getSelector()
    );
    assertSignedBy(appCall, appCaller);

    // The group should still be a single, properly grouped atomic group
    assert.ok(modified.txn.group && modified.txn.group.length > 0);
    assert.deepStrictEqual(modified.txn.group, untouched.txn.group);
    assert.deepStrictEqual(modified.txn.group, appCall.txn.group);

    // A fee-only modification doesn't move any transaction, so the method
    // call's key in the internal methodCalls map should be unchanged.
    const methodCalls = getMethodCalls(composer);
    assert.strictEqual(methodCalls.size, 1);
    assert.strictEqual(methodCalls.get(2), method);
  });

  it('should call a shared pre-sign modifier once with all of its transaction indices', async () => {
    const composer = new AtomicTransactionComposer();
    const accounts = [generateAccount(), generateAccount(), generateAccount()];
    const txns = accounts.map((account, index) =>
      makePaymentTxnWithSuggestedParamsFromObject({
        sender: account.addr,
        receiver: accounts[(index + 1) % accounts.length].addr,
        amount: (index + 1) * 1000,
        suggestedParams,
      })
    );
    let preSignModifierCalls = 0;

    const sharedPreSignModifier: PreSignModifier = async (
      txnGroup,
      indexesToModify
    ) => {
      preSignModifierCalls += 1;
      assert.deepStrictEqual(txnGroup, txns);
      assert.deepStrictEqual(indexesToModify, [0, 2]);
      return {
        modifications: indexesToModify.map((index) => ({
          index,
          fee: txnGroup[index].fee + 1000n,
        })),
      };
    };

    txns.forEach((txn, index) => {
      composer.addTransaction({
        txn,
        signer: makeBasicAccountTransactionSigner(accounts[index]),
        preSignModifier: index === 1 ? undefined : sharedPreSignModifier,
      });
    });

    const stxns = decodeSignedTxns(await composer.gatherSignatures());

    assert.strictEqual(preSignModifierCalls, 1);
    assert.strictEqual(stxns[0].txn.fee, 2000n);
    assert.strictEqual(stxns[1].txn.fee, 1000n);
    assert.strictEqual(stxns[2].txn.fee, 2000n);
    stxns.forEach((stxn, index) => assertSignedBy(stxn, accounts[index]));
  });

  it('should reject changes to transactions not assigned to a pre-sign modifier', async () => {
    const composer = new AtomicTransactionComposer();
    const account1 = generateAccount();
    const account2 = generateAccount();
    const txn1 = makePaymentTxnWithSuggestedParamsFromObject({
      sender: account1.addr,
      receiver: account2.addr,
      amount: 1000,
      suggestedParams,
    });
    const txn2 = makePaymentTxnWithSuggestedParamsFromObject({
      sender: account2.addr,
      receiver: account1.addr,
      amount: 1000,
      suggestedParams,
    });
    const invalidPreSignModifier: PreSignModifier = async () => ({
      modifications: [{ index: 1, fee: 2000n }],
    });

    composer.addTransaction({
      txn: txn1,
      signer: makeBasicAccountTransactionSigner(account1),
      preSignModifier: invalidPreSignModifier,
    });
    composer.addTransaction({
      txn: txn2,
      signer: makeBasicAccountTransactionSigner(account2),
    });

    await assert.rejects(
      composer.buildGroupWithPreSignModifiers(),
      /cannot modify transaction at index 1/
    );
  });

  it('should allow a pre-sign modifier to add a transaction to the beginning of the group', async () => {
    const composer = new AtomicTransactionComposer();
    const account = generateAccount();
    const receiver = generateAccount();
    const appCaller = generateAccount();

    const originalTxn = makePaymentTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: receiver.addr,
      amount: 1000,
      suggestedParams,
    });

    const prependSponsorPreSignModifier: PreSignModifier = async (
      _txnGroup,
      [signerIndex]
    ) => {
      const sponsorTxn = makePaymentTxnWithSuggestedParamsFromObject({
        sender: account.addr,
        receiver: account.addr,
        amount: 0,
        suggestedParams,
      });
      return { prependTxns: [{ txn: sponsorTxn, signerIndex }] };
    };

    composer.addTransaction({
      txn: originalTxn,
      signer: makeBasicAccountTransactionSigner(account),
      preSignModifier: prependSponsorPreSignModifier,
    });
    composer.addMethodCall({
      appID,
      method,
      methodArgs: [1, 2],
      sender: appCaller.addr,
      suggestedParams,
      signer: makeBasicAccountTransactionSigner(appCaller),
    });

    assert.strictEqual(composer.count(), 2);

    const stxns = await composer.gatherSignatures();
    assert.strictEqual(stxns.length, 3);
    assert.strictEqual(composer.count(), 3);

    const [sponsor, original, appCall] = decodeSignedTxns(stxns);

    // The sponsor txn introduced by the pre-sign modifier is signed by the same
    // signer as the transaction that owned the pre-sign modifier.
    assert.ok(sponsor.txn.payment?.receiver.equals(account.addr));
    assert.strictEqual(sponsor.txn.payment?.amount, 0n);
    assertSignedBy(sponsor, account);

    assert.ok(original.txn.payment?.receiver.equals(receiver.addr));
    assert.strictEqual(original.txn.payment?.amount, 1000n);
    assertSignedBy(original, account);

    // The method call was pushed from index 1 to index 2 by the pre-sign modifier;
    // make sure it kept both its own content and its own (distinct) signer.
    assert.strictEqual(appCall.txn.applicationCall?.appIndex, BigInt(appID));
    assert.deepStrictEqual(
      appCall.txn.applicationCall?.appArgs[0],
      method.getSelector()
    );
    assertSignedBy(appCall, appCaller);

    assert.ok(sponsor.txn.group && sponsor.txn.group.length > 0);
    assert.deepStrictEqual(sponsor.txn.group, original.txn.group);
    assert.deepStrictEqual(sponsor.txn.group, appCall.txn.group);

    // The method call was originally added at index 1; the pre-sign modifier
    // prepended a txn ahead of it, so its key in the internal methodCalls map must
    // have been moved to index 2, not left stale at 1.
    const methodCalls = getMethodCalls(composer);
    assert.strictEqual(methodCalls.size, 1);
    assert.strictEqual(methodCalls.get(1), undefined);
    assert.strictEqual(methodCalls.get(2), method);
  });

  it('should allow a pre-sign modifier to add a transaction to the end of the group', async () => {
    const composer = new AtomicTransactionComposer();
    const account = generateAccount();
    const receiver = generateAccount();
    const appCaller = generateAccount();

    const originalTxn = makePaymentTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: receiver.addr,
      amount: 1000,
      suggestedParams,
    });

    const appendCleanupPreSignModifier: PreSignModifier = async (
      _txnGroup,
      [signerIndex]
    ) => {
      const cleanupTxn = makePaymentTxnWithSuggestedParamsFromObject({
        sender: account.addr,
        receiver: account.addr,
        amount: 0,
        suggestedParams,
      });
      return { appendTxns: [{ txn: cleanupTxn, signerIndex }] };
    };

    // The pre-sign-modifier-bearing transaction is added first and the method call
    // second, to demonstrate that appendTxns targets the true end of the whole group
    // -- not just "immediately after the transaction that owns the pre-sign modifier"
    // -- since the method call, added later, still ends up between the original txn
    // and the cleanup txn.
    composer.addTransaction({
      txn: originalTxn,
      signer: makeBasicAccountTransactionSigner(account),
      preSignModifier: appendCleanupPreSignModifier,
    });
    composer.addMethodCall({
      appID,
      method,
      methodArgs: [1, 2],
      sender: appCaller.addr,
      suggestedParams,
      signer: makeBasicAccountTransactionSigner(appCaller),
    });

    assert.strictEqual(composer.count(), 2);

    const stxns = await composer.gatherSignatures();
    assert.strictEqual(stxns.length, 3);
    assert.strictEqual(composer.count(), 3);

    const [original, appCall, cleanup] = decodeSignedTxns(stxns);

    assert.ok(original.txn.payment?.receiver.equals(receiver.addr));
    assert.strictEqual(original.txn.payment?.amount, 1000n);
    assertSignedBy(original, account);

    assert.strictEqual(appCall.txn.applicationCall?.appIndex, BigInt(appID));
    assert.deepStrictEqual(
      appCall.txn.applicationCall?.appArgs[0],
      method.getSelector()
    );
    assertSignedBy(appCall, appCaller);

    assert.ok(cleanup.txn.payment?.receiver.equals(account.addr));
    assert.strictEqual(cleanup.txn.payment?.amount, 0n);
    assertSignedBy(cleanup, account);

    assert.ok(cleanup.txn.group && cleanup.txn.group.length > 0);
    assert.deepStrictEqual(cleanup.txn.group, appCall.txn.group);
    assert.deepStrictEqual(cleanup.txn.group, original.txn.group);

    // The method call was added at index 1, after the pre-sign-modifier-bearing
    // transaction; nothing about the pre-sign modifier should have moved it.
    const methodCalls = getMethodCalls(composer);
    assert.strictEqual(methodCalls.size, 1);
    assert.strictEqual(methodCalls.get(1), method);
  });

  it('should not re-run a pre-sign modifier when a built composer is cloned', async () => {
    const composer = new AtomicTransactionComposer();
    const account = generateAccount();
    const receiver = generateAccount();

    const originalTxn = makePaymentTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: receiver.addr,
      amount: 1000,
      suggestedParams,
    });

    let preSignModifierCalls = 0;
    const prependSponsorPreSignModifier: PreSignModifier = async (
      _txnGroup,
      [signerIndex]
    ) => {
      preSignModifierCalls += 1;
      const sponsorTxn = makePaymentTxnWithSuggestedParamsFromObject({
        sender: account.addr,
        receiver: account.addr,
        amount: 0,
        suggestedParams,
      });
      return { prependTxns: [{ txn: sponsorTxn, signerIndex }] };
    };

    composer.addTransaction({
      txn: originalTxn,
      signer: makeBasicAccountTransactionSigner(account),
      preSignModifier: prependSponsorPreSignModifier,
    });

    const stxns = await composer.gatherSignatures();
    assert.strictEqual(stxns.length, 2);
    assert.strictEqual(preSignModifierCalls, 1);

    const clone = composer.clone();
    assert.strictEqual(
      clone.getStatus(),
      AtomicTransactionComposerStatus.BUILDING
    );

    const cloneStxns = await clone.gatherSignatures();
    assert.strictEqual(
      cloneStxns.length,
      2,
      'cloning an already-built composer should not re-apply its pre-sign modifiers'
    );
    assert.strictEqual(
      preSignModifierCalls,
      1,
      'the pre-sign modifier should not run again for the clone'
    );
  });
});