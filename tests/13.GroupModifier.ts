/* eslint-env mocha */
import assert from 'assert';
import nacl from 'tweetnacl';
import {
  ABIMethod,
  Account,
  AtomicTransactionComposer,
  AtomicTransactionComposerStatus,
  GroupModifier,
  SignedTransaction,
  base64ToBytes,
  decodeMsgpack,
  generateAccount,
  makeBasicAccountTransactionSigner,
  makePaymentTxnWithSuggestedParamsFromObject,
} from '../src';

describe('AtomicTransactionComposer group modifiers', () => {
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
  // only way to observe that a modifier correctly remapped a method call's key
  // (without standing up a mock AlgodClient for simulate/execute) is to read it
  // directly off the instance.
  function getMethodCalls(
    composer: AtomicTransactionComposer
  ): Map<number, ABIMethod> {
    return (composer as unknown as { methodCalls: Map<number, ABIMethod> })
      .methodCalls;
  }

  // Cryptographically verifies that `stxn` was signed by `signer`, i.e. that the
  // composer paired the right TransactionSigner with the right transaction index
  // even after the group was reshaped by a modifier.
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

  it('should allow a modifier to change a transaction within the group (fee)', async () => {
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

    const tripleFee: GroupModifier = async () => ({
      modifications: { fee: txnToModify.fee * 3n },
    });

    composer.addTransaction({
      txn: txnToModify,
      signer: makeBasicAccountTransactionSigner(account1),
      modifier: tripleFee,
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
    assertSignedBy(modified, account1);

    assert.strictEqual(untouched.txn.fee, 1000n);
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

  it('should allow a modifier to add a transaction to the beginning of the group', async () => {
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

    const prependSponsorTxn: GroupModifier = async () => {
      const sponsorTxn = makePaymentTxnWithSuggestedParamsFromObject({
        sender: account.addr,
        receiver: account.addr,
        amount: 0,
        suggestedParams,
      });
      return { prependTxns: [sponsorTxn] };
    };

    composer.addTransaction({
      txn: originalTxn,
      signer: makeBasicAccountTransactionSigner(account),
      modifier: prependSponsorTxn,
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

    // The sponsor txn introduced by the modifier is signed by the same signer
    // as the transaction that owned the modifier.
    assert.ok(sponsor.txn.payment?.receiver.equals(account.addr));
    assert.strictEqual(sponsor.txn.payment?.amount, 0n);
    assertSignedBy(sponsor, account);

    assert.ok(original.txn.payment?.receiver.equals(receiver.addr));
    assert.strictEqual(original.txn.payment?.amount, 1000n);
    assertSignedBy(original, account);

    // The method call was pushed from index 1 to index 2 by the modifier; make
    // sure it kept both its own content and its own (distinct) signer.
    assert.strictEqual(appCall.txn.applicationCall?.appIndex, BigInt(appID));
    assert.deepStrictEqual(
      appCall.txn.applicationCall?.appArgs[0],
      method.getSelector()
    );
    assertSignedBy(appCall, appCaller);

    assert.ok(sponsor.txn.group && sponsor.txn.group.length > 0);
    assert.deepStrictEqual(sponsor.txn.group, original.txn.group);
    assert.deepStrictEqual(sponsor.txn.group, appCall.txn.group);

    // The method call was originally added at index 1; the modifier prepended
    // a txn ahead of it, so its key in the internal methodCalls map must have
    // been moved to index 2, not left stale at 1.
    const methodCalls = getMethodCalls(composer);
    assert.strictEqual(methodCalls.size, 1);
    assert.strictEqual(methodCalls.get(1), undefined);
    assert.strictEqual(methodCalls.get(2), method);
  });

  it('should allow a modifier to add a transaction to the end of the group', async () => {
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

    const appendCleanupTxn: GroupModifier = async () => {
      const cleanupTxn = makePaymentTxnWithSuggestedParamsFromObject({
        sender: account.addr,
        receiver: account.addr,
        amount: 0,
        suggestedParams,
      });
      return { appendTxns: [cleanupTxn] };
    };

    // The modifier-bearing transaction is added first and the method call second, to
    // demonstrate that appendTxns targets the true end of the whole group -- not just
    // "immediately after the transaction that owns the modifier" -- since the method
    // call, added later, still ends up between the original txn and the cleanup txn.
    composer.addTransaction({
      txn: originalTxn,
      signer: makeBasicAccountTransactionSigner(account),
      modifier: appendCleanupTxn,
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

    // The method call was added at index 1, after the modifier-bearing
    // transaction; nothing about the modifier should have moved it.
    const methodCalls = getMethodCalls(composer);
    assert.strictEqual(methodCalls.size, 1);
    assert.strictEqual(methodCalls.get(1), method);
  });

  it('should not re-run a modifier when a built composer is cloned', async () => {
    const composer = new AtomicTransactionComposer();
    const account = generateAccount();
    const receiver = generateAccount();

    const originalTxn = makePaymentTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: receiver.addr,
      amount: 1000,
      suggestedParams,
    });

    let modifierCalls = 0;
    const prependSponsorTxn: GroupModifier = async () => {
      modifierCalls += 1;
      const sponsorTxn = makePaymentTxnWithSuggestedParamsFromObject({
        sender: account.addr,
        receiver: account.addr,
        amount: 0,
        suggestedParams,
      });
      return { prependTxns: [sponsorTxn] };
    };

    composer.addTransaction({
      txn: originalTxn,
      signer: makeBasicAccountTransactionSigner(account),
      modifier: prependSponsorTxn,
    });

    const stxns = await composer.gatherSignatures();
    assert.strictEqual(stxns.length, 2);
    assert.strictEqual(modifierCalls, 1);

    const clone = composer.clone();
    assert.strictEqual(
      clone.getStatus(),
      AtomicTransactionComposerStatus.BUILDING
    );

    const cloneStxns = await clone.gatherSignatures();
    assert.strictEqual(
      cloneStxns.length,
      2,
      'cloning an already-built composer should not re-apply its modifiers'
    );
    assert.strictEqual(
      modifierCalls,
      1,
      'the modifier should not run again for the clone'
    );
  });
});
