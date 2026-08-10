import * as nacl from './nacl/naclWrappers.js';
import { Address, addressFromPQSig } from './encoding/address.js';
import * as encoding from './encoding/encoding.js';
import * as utils from './utils/utils.js';
import { SignedTransaction } from './signedTransaction.js';
import { Transaction } from './transaction.js';
import { LogicSig, LogicSigAccount, sanityCheckProgram } from './logicsig.js';
import { addressFromMultisigPreImg } from './multisig.js';
import type { TransactionSigner } from './signer.js';

export const SIGN_BYTES_PREFIX = Uint8Array.from([77, 88]); // "MX"

/**
 * @deprecated Use signTransactionWithSigner
 *
 * signTransaction takes an object with either payment or key registration fields and
 * a secret key and returns a signed blob.
 *
 * Payment transaction fields: from, to, amount, fee, firstValid, lastValid, genesisHash,
 * note(optional), GenesisID(optional), closeRemainderTo(optional)
 *
 * Key registration fields: fee, firstValid, lastValid, voteKey, selectionKey, voteFirst,
 * voteLast, voteKeyDilution, genesisHash, note(optional), GenesisID(optional)
 *
 * If flatFee is not set and the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param txn - object with either payment or key registration fields
 * @param sk - Algorand Secret Key
 * @returns object contains the binary signed transaction and its txID
 */
export function signTransaction(txn: Transaction, sk: Uint8Array) {
  return {
    txID: txn.txID(),
    blob: txn.signTxn(sk),
  };
}

export async function signTransactionWithSigner(
  txn: Transaction,
  signer: TransactionSigner
): Promise<ReturnType<typeof signTransaction> & { stxn: SignedTransaction }> {
  const [blob] = await signer([txn], [0]);

  return {
    blob,
    txID: txn.txID(),
    stxn: encoding.decodeMsgpack(blob, SignedTransaction),
  };
}

/**
 * signBytes takes arbitrary bytes and a secret key, prepends the bytes with "MX" for domain separation, signs the bytes
 * with the private key, and returns the signature.
 * @param bytes - Uint8array
 * @param sk - Algorand secret key
 * @returns binary signature
 */
export function signBytes(bytes: Uint8Array, sk: Uint8Array) {
  const toBeSigned = utils.concatArrays(SIGN_BYTES_PREFIX, bytes);
  const sig = nacl.sign(toBeSigned, sk);
  return sig;
}

/**
 * verifyBytes takes array of bytes, an address, and a signature and verifies if the signature is correct for the public
 * key and the bytes (the bytes should have been signed with "MX" prepended for domain separation).
 * @param bytes - Uint8Array
 * @param signature - binary signature
 * @param addr - string address
 * @returns bool
 */
export function verifyBytes(
  bytes: Uint8Array,
  signature: Uint8Array,
  addr: string | Address
) {
  const toBeVerified = utils.concatArrays(SIGN_BYTES_PREFIX, bytes);
  const addrObj = typeof addr === 'string' ? Address.fromString(addr) : addr;
  return nacl.verify(toBeVerified, signature, addrObj.publicKey);
}

function signLogicSigTransactionWithAddress(
  txn: Transaction,
  lsig: LogicSig,
  lsigAddress: Address
) {
  // `lsig.verify` enforces this for the non-PQ paths, but the PQ path below
  // skips it, so check it up front for every path.
  const sigCount = [lsig.sig, lsig.msig, lsig.lmsig, lsig.pqsig].filter(
    Boolean
  ).length;
  if (sigCount > 1) {
    throw new Error(
      'LogicSig has too many signatures. At most one of sig, msig, lmsig, or pqsig may be present'
    );
  }

  if (lsig.pqsig) {
    // This SDK cannot validate the post-quantum signature itself, so it checks
    // what it can and leaves the signature to the network: the program must be
    // well-formed, and the signature's scheme, salt and public key must derive
    // the delegating address.
    try {
      sanityCheckProgram(lsig.logic);
    } catch (e) {
      throw new Error(
        `Logic signature verification failed. Ensure the program is valid: ${(e as Error).message}`
      );
    }
  } else if (!lsig.verify(lsigAddress.publicKey)) {
    throw new Error(
      'Logic signature verification failed. Ensure the program and signature are valid.'
    );
  }

  let sgnr: Address | undefined;
  if (!nacl.bytesEqual(lsigAddress.publicKey, txn.sender.publicKey)) {
    sgnr = lsigAddress;
  }

  const signedTxn = new SignedTransaction({
    lsig,
    txn,
    sgnr,
  });

  return {
    txID: txn.txID(),
    blob: encoding.encodeMsgpack(signedTxn),
  };
}

/**
 * signLogicSigTransactionObject takes a transaction and a LogicSig object and
 * returns a signed transaction.
 *
 * @param txn - The transaction to sign.
 * @param lsigObject - The LogicSig object that will sign the transaction.
 *
 * @returns Object containing txID and blob representing signed transaction.
 */
export function signLogicSigTransactionObject(
  txn: Transaction,
  lsigObject: LogicSig | LogicSigAccount
) {
  let lsig: LogicSig;
  let lsigAddress: Address;

  if (lsigObject instanceof LogicSigAccount) {
    lsig = lsigObject.lsig;
    lsigAddress = lsigObject.address();
  } else {
    lsig = lsigObject;

    if (lsig.pqsig) {
      // A PQ signature carries the scheme, salt and public key of the
      // delegating account, so its address is derivable. This is what lets a
      // bare PQ-delegated LogicSig authorize a transaction whose sender was
      // rekeyed to the delegating account.
      lsigAddress = addressFromPQSig(lsig.pqsig);
    } else if (lsig.sig) {
      // For an ed25519 LogicSig with a non-multisig delegating account, we
      // cannot derive the address of that account from only its signature, so
      // assume the delegating account is the sender. If that's not the case,
      // the signing will fail.
      lsigAddress = new Address(txn.sender.publicKey);
    } else if (lsig.lmsig) {
      const msigMetadata = {
        version: lsig.lmsig.v,
        threshold: lsig.lmsig.thr,
        pks: lsig.lmsig.subsig.map((subsig) => subsig.pk),
      };
      lsigAddress = addressFromMultisigPreImg(msigMetadata);
    } else {
      lsigAddress = lsig.address();
    }
  }

  return signLogicSigTransactionWithAddress(txn, lsig, lsigAddress);
}

/**
 * signLogicSigTransaction takes a transaction and a LogicSig object and returns
 * a signed transaction.
 *
 * @param txn - The transaction to sign.
 * @param lsigObject - The LogicSig object that will sign the transaction.
 *
 * @returns Object containing txID and blob representing signed transaction.
 * @throws error on failure
 */
export function signLogicSigTransaction(
  txn: Transaction,
  lsigObject: LogicSig | LogicSigAccount
) {
  return signLogicSigTransactionObject(txn, lsigObject);
}
