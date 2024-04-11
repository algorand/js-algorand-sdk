import {
  Encodable,
  encodeMsgpack2 as encodeMsgpack,
  decodeMsgpack2 as decodeMsgpack,
} from './encoding/encoding.js';
import { Address } from './encoding/address.js';
import { Transaction } from './transaction.js';
import { LogicSig } from './logicsig.js';
import {
  EncodedMultisig,
  encodedMultiSigMsgpackPrepare,
  encodedMultiSigFromDecodedMsgpack,
  ENCODED_MULTISIG_SCHEMA,
} from './types/transactions/index.js';
import {
  AddressSchema,
  FixedLengthByteArraySchema,
  NamedMapSchema,
} from './encoding/schema/index.js';

export class SignedTransaction implements Encodable {
  static encodingSchema = new NamedMapSchema([
    {
      key: 'txn',
      valueSchema: Transaction.encodingSchema,
      required: true,
      omitEmpty: true,
    },
    {
      key: 'sig',
      valueSchema: new FixedLengthByteArraySchema(64),
      required: false,
      omitEmpty: true,
    },
    {
      key: 'msig',
      valueSchema: ENCODED_MULTISIG_SCHEMA,
      required: false,
      omitEmpty: true,
    },
    {
      key: 'lsig',
      valueSchema: LogicSig.encodingSchema,
      required: false,
      omitEmpty: true,
    },
    {
      key: 'sgnr',
      valueSchema: new AddressSchema(),
      required: false,
      omitEmpty: true,
    },
  ]);

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
    const data = new Map<string, unknown>([['txn', this.txn.toEncodingData()]]);
    if (this.sig) {
      data.set('sig', this.sig);
    }
    if (this.msig) {
      data.set('msig', encodedMultiSigMsgpackPrepare(this.msig));
    }
    if (this.lsig) {
      data.set('lsig', this.lsig.toEncodingData());
    }
    if (this.sgnr) {
      data.set('sgnr', this.sgnr);
    }
    return data;
  }

  public static fromEncodingData(data: unknown): SignedTransaction {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded SignedTransaction: ${data}`);
    }
    return new SignedTransaction({
      txn: Transaction.fromEncodingData(data.get('txn')),
      sig: data.get('sig'),
      msig: data.get('msig')
        ? encodedMultiSigFromDecodedMsgpack(data.get('msig'))
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
