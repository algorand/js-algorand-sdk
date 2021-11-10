import {
  ABIType,
  ABITupleType,
  ABIValue,
  ABIMethod,
  abiTypeIsTransaction,
} from './abi';
import { decodeSignedTransaction } from './transaction';
import { makeApplicationCallTxnFromObject } from './makeTxn';
import { assignGroupID } from './group';
import { waitForConfirmation } from './wait';
import Algodv2 from './client/v2/algod/algod';
import {
  TransactionSigner,
  TransactionWithSigner,
  isTransactionWithSigner,
} from './signer';
import {
  OnApplicationComplete,
  SuggestedParams,
} from './types/transactions/base';

export type ABIMethodArgument = ABIValue | TransactionWithSigner;

/** Represents the output from a successful ABI method call. */
export interface ABIResult {
  /** The TxID of the transaction that invoked the ABI method call. */
  txID: string;
  /**
   * The raw bytes of the return value from the ABI method call. This will be empty if the method
   * does not return a value (return type "void").
   */
  rawReturnValue: Uint8Array;
  /**
   * The return value from the ABI method call. This will be undefined if the method does not return
   * a value (return type "void"), or if the SDK was unable to decode the returned value.
   */
  returnValue?: ABIValue;
  /** If the SDK was unable to decode a return value, the error will be here. */
  decodeError?: Error;
}

export enum AtomicTransactionComposerStatus {
  /** The atomic group is still under construction. */
  BUILDING,

  /** The atomic group has been finalized, but not yet signed. */
  BUILT,

  /** The atomic group has been finalized and signed, but not yet submitted to the network. */
  SIGNED,

  /** The atomic group has been finalized, signed, and submitted to the network. */
  SUBMITTED,

  /** The atomic group has been finalized, signed, submitted, and successfully committed to a block. */
  COMMITTED,
}

/** A class used to construct and execute atomic transaction groups */
export class AtomicTransactionComposer {
  /** The maximum size of an atomic transaction group. */
  static MAX_GROUP_SIZE: number = 16;

  private status = AtomicTransactionComposerStatus.BUILDING;
  private transactions: TransactionWithSigner[] = [];
  private methodCalls: Map<number, ABIMethod> = new Map();
  private signedTxns: Uint8Array[] = [];
  private txIDs: string[] = [];

  /**
   * Get the status of this composer's transaction group.
   */
  getStatus(): AtomicTransactionComposerStatus {
    return this.status;
  }

  /**
   * Get the number of transactions currently in this atomic group.
   */
  count(): number {
    return this.transactions.length;
  }

  /**
   * Create a new composer with the same underlying transactions. The new composer's status will be
   * BUILDING, so additional transactions may be added to it.
   */
  clone(): AtomicTransactionComposer {
    const theClone = new AtomicTransactionComposer();

    // TODO: deep copy the transactions
    theClone.transactions = this.transactions.map((txn) => txn);
    theClone.methodCalls = new Map(this.methodCalls);
    theClone.signedTxns = this.signedTxns.slice();
    theClone.txIDs = this.txIDs.slice();

    return theClone;
  }

  /**
   * Add a transaction to this atomic group.
   *
   * An error will be thrown if the transaction has a nonzero group ID, the composer's status is
   * not BUILDING, or if adding this transaction causes the current group to exceed MAX_GROUP_SIZE.
   */
  addTransaction(txnAndSigner: TransactionWithSigner): void {
    if (this.status !== AtomicTransactionComposerStatus.BUILDING) {
      throw new Error(
        'Cannot add transactions when composer status is not BUILDING'
      );
    }

    if (this.transactions.length === AtomicTransactionComposer.MAX_GROUP_SIZE) {
      throw new Error(
        `Adding an additional transaction exceeds the maximum atomic group size of ${AtomicTransactionComposer.MAX_GROUP_SIZE}`
      );
    }

    if (txnAndSigner.txn.group && txnAndSigner.txn.group.some((v) => v !== 0)) {
      throw new Error('Cannot add a transaction with nonzero group ID');
    }

    this.transactions.push(txnAndSigner);
  }

  /**
   * Add a smart contract method call to this atomic group.
   *
   * An error will be thrown if the composer's status is not BUILDING, if adding this transaction
   * causes the current group to exceed MAX_GROUP_SIZE, or if the provided arguments are invalid
   * for the given method.
   */
  addMethodCall({
    appID,
    method,
    methodArgs,
    sender,
    suggestedParams,
    onComplete,
    note,
    lease,
    rekeyTo,
    signer,
  }: {
    /** The ID of the smart contract to call */
    appID: number;
    /** The method to call on the smart contract */
    method: ABIMethod;
    /** The arguments to include in the method call. If omitted, no arguments will be passed to the method. */
    methodArgs?: ABIMethodArgument[];
    /** The address of the sender of this application call */
    sender: string;
    /** Transactions params to use for this application call */
    suggestedParams: SuggestedParams;
    /** The OnComplete action to take for this application call. If omitted, OnApplicationComplete.NoOpOC will be used. */
    onComplete?: OnApplicationComplete;
    /** The note value for this application call */
    note?: Uint8Array;
    /** The lease value for this application call */
    lease?: Uint8Array;
    /** If provided, the address that the sender will be rekeyed to at the conclusion of this application call */
    rekeyTo?: string;
    /** A transaction signer that can authorize this application call from sender */
    signer: TransactionSigner;
  }): void {
    if (this.status !== AtomicTransactionComposerStatus.BUILDING) {
      throw new Error(
        'Cannot add transactions when composer status is not BUILDING'
      );
    }

    if (
      this.transactions.length + method.txnCount() >
      AtomicTransactionComposer.MAX_GROUP_SIZE
    ) {
      throw new Error(
        `Adding additional transactions exceeds the maximum atomic group size of ${AtomicTransactionComposer.MAX_GROUP_SIZE}`
      );
    }

    if (methodArgs.length !== method.args.length) {
      throw new Error(
        `Incorrect number of method arguments. Expected ${method.args.length}, got ${methodArgs.length}`
      );
    }

    let appArgTypes: ABIType[] = [];
    let appArgValues: ABIValue[] = [];
    const txnArgs: TransactionWithSigner[] = [];

    for (let i = 0; i < methodArgs.length; i++) {
      const argSpec = method.args[i];
      const argValue = methodArgs[i];

      if (abiTypeIsTransaction(argSpec.type)) {
        if (
          !isTransactionWithSigner(argValue) ||
          argSpec.type !== argValue.txn.type
        ) {
          throw new Error(
            `Expected ${argSpec.type} transaction for argument at index ${i}`
          );
        }
        if (argValue.txn.group && argValue.txn.group.some((v) => v !== 0)) {
          throw new Error('Cannot add a transaction with nonzero group ID');
        }
        txnArgs.push(argValue);
        continue;
      }

      if (isTransactionWithSigner(argValue)) {
        throw new Error(
          `Expected non-transaction value for argument at index ${i}`
        );
      }

      appArgTypes.push(ABIType.from(argSpec.type));
      appArgValues.push(argValue);
    }

    if (appArgTypes.length > 14) {
      const lastArgTupleTypes = appArgTypes.slice(14);
      const lastArgTupleValues = appArgValues.slice(14);

      appArgTypes = appArgTypes.slice(0, 14);
      appArgValues = appArgValues.slice(0, 14);

      appArgTypes.push(new ABITupleType(lastArgTupleTypes));
      appArgValues.push(lastArgTupleValues);
    }

    const appArgsEncoded: Uint8Array[] = [method.getSelector()];
    for (let i = 0; i < appArgTypes.length; i++) {
      appArgsEncoded.push(appArgTypes[i].encode(appArgValues[i]));
    }

    if (appID === 0) {
      throw new Error('Application create call not supported');
    }

    const appCall = {
      txn: makeApplicationCallTxnFromObject({
        from: sender,
        appIndex: appID,
        appArgs: appArgsEncoded,
        onComplete:
          onComplete == null ? OnApplicationComplete.NoOpOC : onComplete,
        lease,
        note,
        rekeyTo,
        suggestedParams,
      }),
      signer,
    };

    this.transactions.push(...txnArgs, appCall);
    this.methodCalls.set(this.transactions.length - 1, method);
  }

  /**
   * Finalize the transaction group and returned the finalized transactions.
   *
   * The composer's status will be at least BUILT after executing this method.
   */
  buildGroup(): TransactionWithSigner[] {
    if (this.status === AtomicTransactionComposerStatus.BUILDING) {
      assignGroupID(
        this.transactions.map((txnWithSigner) => txnWithSigner.txn)
      );
      this.status = AtomicTransactionComposerStatus.BUILT;
    }
    return this.transactions;
  }

  /**
   * Obtain signatures for each transaction in this group. If signatures have already been obtained,
   * this method will return cached versions of the signatures.
   *
   * The composer's status will be at least SIGNED after executing this method.
   *
   * An error will be thrown if signing any of the transactions fails.
   *
   * @returns A promise that resolves to an array of signed transactions.
   */
  async gatherSignatures(): Promise<Uint8Array[]> {
    if (this.status >= AtomicTransactionComposerStatus.SIGNED) {
      return this.signedTxns;
    }

    // retrieve built transactions and verify status is BUILT
    const txnsWithSigners = this.buildGroup();
    const txnGroup = txnsWithSigners.map((txnWithSigner) => txnWithSigner.txn);

    const indexesPerSigner: Map<TransactionSigner, number[]> = new Map();

    for (let i = 0; i < txnsWithSigners.length; i++) {
      const { signer } = txnsWithSigners[i];

      if (!indexesPerSigner.has(signer)) {
        indexesPerSigner.set(signer, []);
      }

      indexesPerSigner.get(signer).push(i);
    }

    const orderedSigners = Array.from(indexesPerSigner);

    const batchedSigs = await Promise.all(
      orderedSigners.map(([signer, indexes]) => signer(txnGroup, indexes))
    );

    const signedTxns: Array<Uint8Array | null> = txnsWithSigners.map(
      () => null
    );

    for (
      let signerIndex = 0;
      signerIndex < orderedSigners.length;
      signerIndex++
    ) {
      const indexes = orderedSigners[signerIndex][1];
      const sigs = batchedSigs[signerIndex];

      for (let i = 0; i < indexes.length; i++) {
        signedTxns[indexes[i]] = sigs[i];
      }
    }

    if (!signedTxns.every((sig) => sig != null)) {
      throw new Error(`Missing signatures. Got ${signedTxns}`);
    }

    const txIDs = signedTxns.map((stxn, index) => {
      try {
        return decodeSignedTransaction(stxn).txn.txID();
      } catch (err) {
        throw new Error(
          `Cannot decode signed transaction at index ${index}. ${err}`
        );
      }
    });

    this.signedTxns = signedTxns;
    this.txIDs = txIDs;
    this.status = AtomicTransactionComposerStatus.SIGNED;

    return signedTxns;
  }

  /**
   * Send the transaction group to the network, but don't wait for it to be committed to a block. An
   * error will be thrown if submission fails.
   *
   * The composer's status must be SUBMITTED or lower before calling this method. If submission is
   * successful, this composer's status will update to SUBMITTED.
   *
   * Note: a group can only be submitted again if it fails.
   *
   * @param client - An Algodv2 client
   *
   * @returns A promise that, upon success, resolves to a list of TxIDs of the submitted transactions.
   */
  async submit(client: Algodv2): Promise<string[]> {
    if (this.status > AtomicTransactionComposerStatus.SUBMITTED) {
      throw new Error('Transaction group cannot be resubmitted');
    }

    const stxns = await this.gatherSignatures();

    await client.sendRawTransaction(stxns).do();

    this.status = AtomicTransactionComposerStatus.SUBMITTED;

    return this.txIDs;
  }

  /**
   * Send the transaction group to the network and wait until it's committed to a block. An error
   * will be thrown if submission or execution fails.
   *
   * The composer's status must be SUBMITTED or lower before calling this method, since execution is
   * only allowed once. If submission is successful, this composer's status will update to SUBMITTED.
   * If the execution is also successful, this composer's status will update to COMMITTED.
   *
   * Note: a group can only be submitted again if it fails.
   *
   * @param client - An Algodv2 client
   * @param waitRounds - The maximum number of rounds to wait for transaction confirmation
   *
   * @returns A promise that, upon success, resolves to an object containing the confirmed round for
   *   this transaction, the txIDs of the submitted transactions, and an array of results containing
   *   one element for each method call transaction in this group.
   */
  async execute(
    client: Algodv2,
    waitRounds: number
  ): Promise<{
    confirmedRound: number;
    txIDs: string[];
    methodResults: ABIResult[];
  }> {
    if (this.status === AtomicTransactionComposerStatus.COMMITTED) {
      throw new Error(
        'Transaction group has already been executed successfully'
      );
    }

    const txIDs = await this.submit(client);

    const firstMethodCallIndex = this.transactions.findIndex((_, index) =>
      this.methodCalls.has(index)
    );
    const indexToWaitFor =
      firstMethodCallIndex === -1 ? 0 : firstMethodCallIndex;
    const confirmedTxnInfo = await waitForConfirmation(
      client,
      txIDs[indexToWaitFor],
      waitRounds
    );

    this.status = AtomicTransactionComposerStatus.COMMITTED;

    const confirmedRound: number = confirmedTxnInfo['confirmed-round'];

    const methodResults: ABIResult[] = [];

    for (const [txnIndex, method] of this.methodCalls) {
      const txID = txIDs[txnIndex];

      const methodResult: ABIResult = {
        txID,
        rawReturnValue: new Uint8Array(),
      };

      try {
        if (method.returns) {
          const pendingInfo =
            txnIndex === firstMethodCallIndex
              ? confirmedTxnInfo
              : // eslint-disable-next-line no-await-in-loop
                await client.pendingTransactionInformation(txID).do();

          const logs: string[] = pendingInfo.logs || [];

          // first 4 bytes of SHA-512/256 hash of "return"
          const returnPrefix = Uint8Array.from([21, 31, 124, 117]);

          let returnValueEncoded: Buffer | undefined;

          for (let i = logs.length - 1; i >= 0; i--) {
            const log = Buffer.from(logs[i], 'base64');
            if (log.byteLength >= 4 && log.slice(0, 4).equals(returnPrefix)) {
              returnValueEncoded = log.slice(4);
              break;
            }
          }

          if (returnValueEncoded == null) {
            throw new Error('App call transaction did not log a return value');
          }

          methodResult.returnValue = ABIType.from(method.returns.type).decode(
            new Uint8Array(returnValueEncoded)
          );
        }
      } catch (err) {
        methodResult.decodeError = err;
      }

      methodResults.push(methodResult);
    }

    return {
      confirmedRound,
      txIDs,
      methodResults,
    };
  }
}
