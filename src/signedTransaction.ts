import {
  MsgpackEncodable,
  MsgpackEncodingData,
  JSONEncodable,
  JSONEncodingData,
  encodeMsgpack,
  decodeMsgpack,
} from './encoding/encoding.js';
import { Address } from './encoding/address.js';
import { base64ToBytes, bytesToBase64 } from './encoding/binarydata.js';
import { Transaction } from './transaction.js';
import { LogicSig } from './logicsig.js';
import {
  EncodedMultisig,
  encodedMultiSigMsgpackPrepare,
  encodedMultiSigFromDecodedMsgpack,
  encodedMultiSigJSONPrepare,
  encodedMultiSigFromDecodedJSON,
} from './types/transactions/index.js';

export class SignedTransaction implements MsgpackEncodable, JSONEncodable {
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

  public msgpackPrepare(): MsgpackEncodingData {
    const data: Map<string, MsgpackEncodingData> = new Map([
      ['txn', this.txn.msgpackPrepare()],
    ]);
    if (this.sig) {
      data.set('sig', this.sig);
    }
    if (this.msig) {
      data.set('msig', encodedMultiSigMsgpackPrepare(this.msig));
    }
    if (this.lsig) {
      data.set('lsig', this.lsig.msgpackPrepare());
    }
    if (this.sgnr) {
      data.set('sgnr', this.sgnr.publicKey);
    }
    return data;
  }

  public static fromDecodedMsgpack(data: unknown): SignedTransaction {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded SignedTransaction: ${data}`);
    }
    return new SignedTransaction({
      txn: Transaction.fromDecodedMsgpack(data.get('txn')),
      sig: data.get('sig'),
      msig: data.get('msig')
        ? encodedMultiSigFromDecodedMsgpack(data.get('msig'))
        : undefined,
      lsig: data.get('lsig')
        ? LogicSig.fromDecodedMsgpack(data.get('lsig'))
        : undefined,
      sgnr: data.get('sgnr') ? new Address(data.get('sgnr')) : undefined,
    });
  }

  public jsonPrepare(): JSONEncodingData {
    const data: { [key: string]: JSONEncodingData } = {
      txn: this.txn.jsonPrepare(),
    };
    if (this.sig) {
      data.sig = bytesToBase64(this.sig);
    }
    if (this.msig) {
      data.msig = encodedMultiSigJSONPrepare(this.msig);
    }
    if (this.lsig) {
      data.lsig = this.lsig.jsonPrepare();
    }
    if (this.sgnr) {
      data.sgnr = this.sgnr.toString();
    }
    return data;
  }

  public static fromDecodedJSON(data: unknown): SignedTransaction {
    if (data === null || typeof data !== 'object') {
      throw new Error(`Invalid decoded SignedTransaction: ${data}`);
    }
    const obj = data as Record<string, any>;
    return new SignedTransaction({
      txn: Transaction.fromDecodedJSON(obj.txn),
      sig: obj.sig ? base64ToBytes(obj.sig) : undefined,
      msig: obj.msig ? encodedMultiSigFromDecodedJSON(obj.msig) : undefined,
      lsig: obj.lsig ? LogicSig.fromDecodedJSON(obj.lsig) : undefined,
      sgnr: obj.sgnr ? Address.fromString(obj.sgnr) : undefined,
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
