import {
  Encodable,
  encodeMsgpack,
  decodeMsgpack,
} from './encoding/encoding.js';
import { Address } from './encoding/address.js';
import { Transaction } from './transaction.js';
import { LogicSig } from './logicsig.js';
import {
  EncodedMultisig,
  encodedMultiSigToEncodingData,
  encodedMultiSigFromEncodingData,
  ENCODED_MULTISIG_SCHEMA,
} from './types/transactions/index.js';
import {
  AddressSchema,
  FixedLengthByteArraySchema,
  OptionalSchema,
  NamedMapSchema,
  allOmitEmpty,
} from './encoding/schema/index.js';

export class SignedTransaction implements Encodable {
  static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'txn',
        valueSchema: Transaction.encodingSchema,
      },
      {
        key: 'sig',
        valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(64)),
      },
      {
        key: 'msig',
        valueSchema: new OptionalSchema(ENCODED_MULTISIG_SCHEMA),
      },
      {
        key: 'lsig',
        valueSchema: new OptionalSchema(LogicSig.encodingSchema),
      },
      {
        key: 'sgnr',
        valueSchema: new OptionalSchema(new AddressSchema()),
      },
    ])
  );

  /**
   * The transaction that was signed
   */
  public readonly txn: Transaction;

  /**
   * Transaction signature
   */
  public readonly sig?: Uint8Array;

  /**
   * Multisig structure
   */
  public readonly msig?: EncodedMultisig;

  /**
   * Logic signature
   */
  public readonly lsig?: LogicSig;

  /**
   * The signer, if signing with a different key than the Transaction type `sender` property indicates
   */
  public readonly sgnr?: Address;

  constructor({
    txn,
    sig,
    msig,
    lsig,
    sgnr,
  }: {
    txn: Transaction;
    sig?: Uint8Array;
    msig?: EncodedMultisig;
    lsig?: LogicSig;
    sgnr?: Address;
  }) {
    this.txn = txn;
    this.sig = sig;
    this.msig = msig;
    this.lsig = lsig;
    this.sgnr = sgnr;

    let numberOfSigs = 0;
    if (sig) numberOfSigs += 1;
    if (msig) numberOfSigs += 1;
    if (lsig) numberOfSigs += 1;
    if (numberOfSigs > 1) {
      throw new Error(
        `SignedTransaction must not have more than 1 signature. Got ${numberOfSigs}`
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema() {
    return SignedTransaction.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['txn', this.txn.toEncodingData()],
      ['sig', this.sig],
      [
        'msig',
        this.msig ? encodedMultiSigToEncodingData(this.msig) : undefined,
      ],
      ['lsig', this.lsig ? this.lsig.toEncodingData() : undefined],
      ['sgnr', this.sgnr],
    ]);
  }

  public static fromEncodingData(data: unknown): SignedTransaction {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded SignedTransaction: ${data}`);
    }
    return new SignedTransaction({
      txn: Transaction.fromEncodingData(data.get('txn')),
      sig: data.get('sig'),
      msig: data.get('msig')
        ? encodedMultiSigFromEncodingData(data.get('msig'))
        : undefined,
      lsig: data.get('lsig')
        ? LogicSig.fromEncodingData(data.get('lsig'))
        : undefined,
      sgnr: data.get('sgnr'),
    });
  }
}

/**
 * decodeSignedTransaction takes a Uint8Array (from transaction.signTxn) and converts it to an object
 * containing the Transaction (txn), the signature (sig), and the auth-addr field if applicable (sgnr)
 * @param transactionBuffer - the Uint8Array containing a transaction
 * @returns containing a Transaction, the signature, and possibly an auth-addr field
 */
export function decodeSignedTransaction(
  transactionBuffer: Uint8Array
): SignedTransaction {
  return decodeMsgpack(transactionBuffer, SignedTransaction);
}

/**
 * encodeUnsignedSimulateTransaction takes a txnBuilder.Transaction object,
 * converts it into a SignedTransaction-like object, and converts it to a Buffer.
 *
 * Note: this function should only be used to simulate unsigned transactions.
 *
 * @param txn - Transaction object to simulate.
 */
export function encodeUnsignedSimulateTransaction(txn: Transaction) {
  const stxn = new SignedTransaction({ txn });
  return encodeMsgpack(stxn);
}
