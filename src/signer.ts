import Account from './types/account.js';
import { Transaction } from './transaction.js';
import { encodeUnsignedSimulateTransaction } from './signedTransaction.js';
import { LogicSigAccount } from './logicsig.js';
import { signLogicSigTransactionObject } from './signing.js';
import { MultisigMetadata } from './multisig.js';
import {
  signMultisigTransaction,
  mergeMultisigTransactions,
} from './multisigSigning.js';
import type { Address } from './encoding/address.js';
import type {
  EncodedMultisig,
  EncodedPQSig,
} from './types/transactions/encoded.js';
import type { LogicSig } from './logicsig.js';

/**
 * Something that has an Algorand address associated with it.
 * It could be logic sig, single-signer account, multisig, app, etc.
 */
export interface Addressable {
  address: Address;
}

/**
 * This type represents a function which can sign transactions from an atomic transaction group.
 * @param txnGroup - The atomic group containing transactions to be signed
 * @param indexesToSign - An array of indexes in the atomic transaction group that should be signed
 * @returns A promise which resolves an array of encoded signed transactions. The length of the
 *   array will be the same as the length of indexesToSign, and each index i in the array
 *   corresponds to the signed transaction from txnGroup[indexesToSign[i]]
 */
export type TransactionSigner = (
  txnGroup: Transaction[],
  indexesToSign: number[]
) => Promise<Uint8Array[]>;

/**
 * An address paired with a signer able to sign transactions on its behalf.
 *
 * @remarks
 * `address` is the address transactions are sent from, which is not necessarily
 * the address that authorizes them: for a rekeyed account the two differ, and
 * `txnSigner` sets the transaction's `sgnr` field accordingly.
 */
export interface AddressWithTransactionSigner extends Addressable {
  txnSigner: TransactionSigner;
}

/**
 * An address paired with a signer that produces placeholder signatures for it.
 *
 * @remarks
 * Useful for post-quantum accounts, whose real signatures are large and slow to
 * produce, when only a simulation of the group is needed.
 */
export interface AddressWithEmptyTransactionSigner extends Addressable {
  /**
   * A TransactionSigner that produces unsigned (or placeholder-signed)
   * transactions. This must only be used to simulate transactions with the
   * `allowEmptySignatures` option enabled.
   */
  emptyTxnSigner: TransactionSigner;
}

/**
 * This type represents a function which can sign a LogicSig for delegation.
 *
 * @remarks
 * Exactly one of `sig`, `lmsig` and `pqsig` is returned, according to the kind
 * of key the signer holds and whether `msig` was supplied:
 *
 * - `sig` - an ed25519 signature from a single delegating account
 * - `lmsig` - a multisig containing this signer's subsignature, returned when
 *   `msig` is supplied
 * - `pqsig` - a post-quantum signature from a single delegating account
 *
 * @param lsig - The logic signature that is being signed for delegation
 * @param msig - Optional multisig account that should be set when a public key is signing as a subsigner of a multisig
 * @returns A promise which resolves to the signature and the address that
 *   produced it. When `msig` is omitted this is the delegating account; when
 *   `msig` is supplied it is the individual subsigner rather than the multisig.
 *   Either way it is an authorizing address, which is not necessarily the
 *   address the signer sends transactions from.
 */
export type DelegatedLsigSigner = (
  lsig: LogicSig,
  msig?: MultisigMetadata
) => Promise<
  { address: Address } & (
    | { sig: Uint8Array }
    | { lmsig: EncodedMultisig }
    | { pqsig: EncodedPQSig }
  )
>;

/**
 * An address paired with a signer able to delegate a LogicSig to it.
 */
export interface AddressWithDelegatedLsigSigner extends Addressable {
  delegatedLsigSigner: DelegatedLsigSigner;
}

/**
 * This type represents a function which can sign arbitrary bytes, for use with
 * {@link verifyBytes}.
 *
 * @remarks
 * The implementation is responsible for prepending the "MX" domain-separation
 * prefix ({@link SIGN_BYTES_PREFIX}) before signing, so `bytesToSign` is the
 * caller's bytes alone.
 *
 * @param bytesToSign - The bytes to sign, without any domain-separation prefix
 * @returns A promise which resolves to the raw signature
 */
export type MxBytesSigner = (bytesToSign: Uint8Array) => Promise<Uint8Array>;

/**
 * An address paired with a signer able to sign arbitrary bytes on its behalf.
 */
export interface AddressWithMxBytesSigner extends Addressable {
  mxBytesSigner: MxBytesSigner;
}

/**
 * This type represents a function which can sign data for use with the
 * `ed25519verify` opcode from within a LogicSig's program.
 *
 * @remarks
 * The implementation is responsible for prepending the "ProgData" prefix
 * ({@link SIGN_PROGRAM_DATA_PREFIX}) and the LogicSig's address before signing.
 *
 * @param data - The data to sign, without any prefix
 * @param lsig - The LogicSig whose program will verify the signature
 * @returns A promise which resolves to the raw signature
 */
export type ProgramDataSigner = (
  data: Uint8Array,
  lsig: LogicSig
) => Promise<Uint8Array>;

/**
 * An address paired with a signer able to sign program data on its behalf.
 */
export interface AddressWithProgramDataSigner extends Addressable {
  programDataSigner: ProgramDataSigner;
}

/**
 * Create a TransactionSigner that can sign transactions for the provided basic Account.
 */
export function makeBasicAccountTransactionSigner(
  account: Account
): TransactionSigner {
  return (txnGroup: Transaction[], indexesToSign: number[]) => {
    const signed: Uint8Array[] = [];

    for (const index of indexesToSign) {
      signed.push(txnGroup[index].signTxn(account.sk));
    }

    return Promise.resolve(signed);
  };
}

/**
 * Create a TransactionSigner that can sign transactions for the provided LogicSigAccount.
 */
export function makeLogicSigAccountTransactionSigner(
  account: LogicSigAccount
): TransactionSigner {
  return (txnGroup: Transaction[], indexesToSign: number[]) => {
    const signed: Uint8Array[] = [];

    for (const index of indexesToSign) {
      const { blob } = signLogicSigTransactionObject(txnGroup[index], account);
      signed.push(blob);
    }

    return Promise.resolve(signed);
  };
}

/**
 * Create a TransactionSigner that can sign transactions for the provided Multisig account.
 * @param msig - The Multisig account metadata
 * @param sks - An array of private keys belonging to the msig which should sign the transactions.
 */
export function makeMultiSigAccountTransactionSigner(
  msig: MultisigMetadata,
  sks: Uint8Array[]
): TransactionSigner {
  return (txnGroup: Transaction[], indexesToSign: number[]) => {
    const signed: Uint8Array[] = [];

    for (const index of indexesToSign) {
      const txn = txnGroup[index];
      const partialSigs: Uint8Array[] = [];

      for (const sk of sks) {
        const { blob } = signMultisigTransaction(txn, msig, sk);
        partialSigs.push(blob);
      }

      if (partialSigs.length > 1) {
        signed.push(mergeMultisigTransactions(partialSigs));
      } else {
        signed.push(partialSigs[0]);
      }
    }

    return Promise.resolve(signed);
  };
}

/**
 * Create a makeEmptyTransactionSigner that does not specify any signer or
 * signing capabilities. This should only be used to simulate transactions.
 */
export function makeEmptyTransactionSigner(): TransactionSigner {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (txnGroup: Transaction[], indexesToSign: number[]) => {
    const unsigned: Uint8Array[] = [];

    for (const index of indexesToSign) {
      unsigned.push(encodeUnsignedSimulateTransaction(txnGroup[index]));
    }

    return Promise.resolve(unsigned);
  };
}

/**
 * A function which can rewrite an atomic transaction group before it is built, e.g. to
 * change one of its transactions or to add new transactions to it (such as a fee-bump
 * or a cover transaction).
 *
 * @remarks
 * {@link AtomicTransactionComposer.buildGroupWithModifiers} runs the modifier of every
 * transaction that has one, in group order; each modifier sees the group as reshaped by
 * any modifier that ran before it. A transaction newly introduced by a modifier's output
 * is never itself checked for a `modifier`, so modifiers do not cascade within a single
 * build.
 *
 * @param txnGroup - The current transactions in the atomic group, in order
 * @returns A promise which resolves to the new list of transactions for the group, along
 *   with a map from each new transaction's index (in the returned `txns` array) to the
 *   index of the transaction in `txnGroup` it was derived from. A new transaction
 *   introduced by the modifier (not derived from an existing one) should be omitted from
 *   the map; the composer will sign it using the modifier-owning transaction's signer.
 */
export type GroupModifier = (
  // eslint-disable-next-line no-use-before-define
  txnGroup: Transaction[]
  // eslint-disable-next-line no-use-before-define
) => Promise<{ txns: Transaction[]; txnIndexMap: Map<number, number> }>;

/** Represents an unsigned transactions and a signer that can authorize that transaction. */
export interface TransactionWithSigner {
  /** An unsigned transaction */
  txn: Transaction;
  /** A transaction signer that can authorize txn */
  signer: TransactionSigner;
  /** An optional modifier that can rewrite the transaction group this transaction belongs to */
  modifier?: GroupModifier;
}

/**
 * Check if a value conforms to the TransactionWithSigner structure.
 * @param value - The value to check.
 * @returns True if an only if the value has the structure of a TransactionWithSigner.
 */
export function isTransactionWithSigner(
  value: any
): value is TransactionWithSigner {
  return (
    typeof value === 'object' &&
    Object.keys(value).length === 2 &&
    typeof value.txn === 'object' &&
    typeof value.signer === 'function'
  );
}
