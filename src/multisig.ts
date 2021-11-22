import * as nacl from './nacl/naclWrappers';
import * as address from './encoding/address';
import * as encoding from './encoding/encoding';
import * as txnBuilder from './transaction';
import * as utils from './utils/utils';
import AnyTransaction, { EncodedTransaction } from './types/transactions';
import { MultisigMetadata } from './types/multisig';
import {
  EncodedMultisig,
  EncodedSignedTransaction,
} from './types/transactions/encoded';

/**
 Utilities for manipulating multisig transaction blobs.
 */

export const MULTISIG_MERGE_LESSTHANTWO_ERROR_MSG =
  'Not enough multisig transactions to merge. Need at least two';
export const MULTISIG_MERGE_MISMATCH_ERROR_MSG =
  'Cannot merge txs. txIDs differ';
export const MULTISIG_MERGE_MISMATCH_AUTH_ADDR_MSG =
  'Cannot merge txs. Auth addrs differ';
export const MULTISIG_MERGE_WRONG_PREIMAGE_ERROR_MSG =
  'Cannot merge txs. Multisig preimages differ';
export const MULTISIG_MERGE_SIG_MISMATCH_ERROR_MSG =
  'Cannot merge txs. subsigs are mismatched.';
const MULTISIG_KEY_NOT_EXIST_ERROR_MSG = 'Key does not exist';
export const MULTISIG_NO_MUTATE_ERROR_MSG =
  'Cannot mutate a multisig field as it would invalidate all existing signatures.';
export const MULTISIG_USE_PARTIAL_SIGN_ERROR_MSG =
  'Cannot sign a multisig transaction using `signTxn`. Use `partialSignTxn` instead.';

interface MultisigOptions {
  rawSig: Uint8Array;
  myPk: Uint8Array;
}

interface MultisigMetadataWithPks extends Omit<MultisigMetadata, 'addrs'> {
  pks: Uint8Array[];
}

/**
 * createMultisigTransaction creates a multisig transaction blob.
 * @param txnForEncoding - the actual transaction to sign.
 * @param rawSig - a Buffer raw signature of that transaction
 * @param myPk - a public key that corresponds with rawSig
 * @param version - multisig version
 * @param threshold - mutlisig threshold
 * @param pks - ordered list of public keys in this multisig
 * @returns encoded multisig blob
 */
function createMultisigTransaction(
  txnForEncoding: EncodedTransaction,
  { rawSig, myPk }: MultisigOptions,
  { version, threshold, pks }: MultisigMetadataWithPks
) {
  let keyExist = false;
  // construct the appendable multisigned transaction format
  const subsigs = pks.map((pk) => {
    if (nacl.bytesEqual(pk, myPk)) {
      keyExist = true;
      return {
        pk: Buffer.from(pk),
        s: rawSig,
      };
    }
    return { pk: Buffer.from(pk) };
  });
  if (keyExist === false) {
    throw new Error(MULTISIG_KEY_NOT_EXIST_ERROR_MSG);
  }

  const msig: EncodedMultisig = {
    v: version,
    thr: threshold,
    subsig: subsigs,
  };
  const signedTxn: EncodedSignedTransaction = {
    msig,
    txn: txnForEncoding,
  };

  // if the address of this multisig is different from the transaction sender,
  // we need to add the auth-addr field
  const msigAddr = address.fromMultisigPreImg({
    version,
    threshold,
    pks,
  });
  if (
    address.encodeAddress(txnForEncoding.snd) !==
    address.encodeAddress(msigAddr)
  ) {
    signedTxn.sgnr = Buffer.from(msigAddr);
  }

  return new Uint8Array(encoding.encode(signedTxn));
}

/**
 * MultisigTransaction is a Transaction that also supports creating partially-signed multisig transactions.
 */
export class MultisigTransaction extends txnBuilder.Transaction {
  /* eslint-disable class-methods-use-this,@typescript-eslint/no-unused-vars,no-dupe-class-members */
  /**
   * Override inherited method to throw an error, as mutating transactions are prohibited in this context
   */
  addLease() {
    throw new Error(MULTISIG_NO_MUTATE_ERROR_MSG);
  }

  /**
   * Override inherited method to throw an error, as mutating transactions are prohibited in this context
   */
  addRekey() {
    throw new Error(MULTISIG_NO_MUTATE_ERROR_MSG);
  }

  /**
   * Override inherited method to throw an error, as traditional signing is not allowed
   */
  signTxn(sk: Uint8Array): Uint8Array; // This overload ensures that the override has a compatible type definition with the parent method
  signTxn(sk: any): any {
    throw new Error(MULTISIG_USE_PARTIAL_SIGN_ERROR_MSG);
  }
  /* eslint-enable class-methods-use-this,@typescript-eslint/no-unused-vars,no-dupe-class-members */

  /**
   * partialSignTxn partially signs this transaction and returns a partially-signed multisig transaction,
   * encoded with msgpack as a typed array.
   * @param version - multisig version
   * @param threshold - multisig threshold
   * @param pks - multisig public key list, order is important.
   * @param sk - an Algorand secret key to sign with.
   * @returns an encoded, partially signed multisig transaction.
   */
  partialSignTxn(
    { version, threshold, pks }: MultisigMetadataWithPks,
    sk: Uint8Array
  ) {
    // get signature verifier
    const myPk = nacl.keyPairFromSecretKey(sk).publicKey;
    return createMultisigTransaction(
      this.get_obj_for_encoding(),
      { rawSig: this.rawSignTxn(sk), myPk },
      { version, threshold, pks }
    );
  }

  // eslint-disable-next-line camelcase
  static from_obj_for_encoding(
    txnForEnc: EncodedTransaction
  ): MultisigTransaction {
    return super.from_obj_for_encoding(txnForEnc) as MultisigTransaction;
  }
}

/**
 * mergeMultisigTransactions takes a list of multisig transaction blobs, and merges them.
 * @param multisigTxnBlobs - a list of blobs representing encoded multisig txns
 * @returns typed array msg-pack encoded multisig txn
 */
export function mergeMultisigTransactions(multisigTxnBlobs: Uint8Array[]) {
  if (multisigTxnBlobs.length < 2) {
    throw new Error(MULTISIG_MERGE_LESSTHANTWO_ERROR_MSG);
  }
  const refSigTx = encoding.decode(
    multisigTxnBlobs[0]
  ) as EncodedSignedTransaction;
  const refTxID = MultisigTransaction.from_obj_for_encoding(
    refSigTx.txn
  ).txID();
  const refAuthAddr = refSigTx.sgnr
    ? address.encodeAddress(refSigTx.sgnr)
    : undefined;
  const refPreImage = {
    version: refSigTx.msig.v,
    threshold: refSigTx.msig.thr,
    pks: refSigTx.msig.subsig.map((subsig) => subsig.pk),
  };
  const refMsigAddr = address.encodeAddress(
    address.fromMultisigPreImg(refPreImage)
  );

  let newSubsigs = refSigTx.msig.subsig;
  for (let i = 0; i < multisigTxnBlobs.length; i++) {
    const unisig = encoding.decode(
      multisigTxnBlobs[i]
    ) as EncodedSignedTransaction;

    const unisigAlgoTxn = MultisigTransaction.from_obj_for_encoding(unisig.txn);
    if (unisigAlgoTxn.txID() !== refTxID) {
      throw new Error(MULTISIG_MERGE_MISMATCH_ERROR_MSG);
    }

    const authAddr = unisig.sgnr
      ? address.encodeAddress(unisig.sgnr)
      : undefined;
    if (refAuthAddr !== authAddr) {
      throw new Error(MULTISIG_MERGE_MISMATCH_AUTH_ADDR_MSG);
    }

    // check multisig has same preimage as reference
    if (unisig.msig.subsig.length !== refSigTx.msig.subsig.length) {
      throw new Error(MULTISIG_MERGE_WRONG_PREIMAGE_ERROR_MSG);
    }
    const preimg: MultisigMetadataWithPks = {
      version: unisig.msig.v,
      threshold: unisig.msig.thr,
      pks: unisig.msig.subsig.map((subsig) => subsig.pk),
    };
    const msgigAddr = address.encodeAddress(address.fromMultisigPreImg(preimg));
    if (refMsigAddr !== msgigAddr) {
      throw new Error(MULTISIG_MERGE_WRONG_PREIMAGE_ERROR_MSG);
    }

    // now, we can merge
    newSubsigs = unisig.msig.subsig.map((uniSubsig, index) => {
      const current = refSigTx.msig.subsig[index];
      if (current.s) {
        // we convert the Uint8Arrays uniSubsig.s and current.s to Buffers here because (as
        // of Dec 2020) React overrides the buffer package with an older version that does
        // not support Uint8Arrays in the comparison function. See this thread for more
        // info: https://github.com/algorand/js-algorand-sdk/issues/252
        if (
          uniSubsig.s &&
          Buffer.compare(Buffer.from(uniSubsig.s), Buffer.from(current.s)) !== 0
        ) {
          // mismatch
          throw new Error(MULTISIG_MERGE_SIG_MISMATCH_ERROR_MSG);
        }
        return {
          pk: current.pk,
          s: current.s,
        };
      }
      if (uniSubsig.s) {
        return {
          pk: current.pk,
          s: uniSubsig.s,
        };
      }
      return current;
    });
  }
  const msig: EncodedMultisig = {
    v: refSigTx.msig.v,
    thr: refSigTx.msig.thr,
    subsig: newSubsigs,
  };
  const signedTxn: EncodedSignedTransaction = {
    msig,
    txn: refSigTx.txn,
  };
  if (typeof refAuthAddr !== 'undefined') {
    signedTxn.sgnr = Buffer.from(address.decodeAddress(refAuthAddr).publicKey);
  }
  return new Uint8Array(encoding.encode(signedTxn));
}

export function verifyMultisig(
  toBeVerified: Uint8Array,
  msig: EncodedMultisig,
  publicKey: Uint8Array
) {
  const version = msig.v;
  const threshold = msig.thr;
  const subsigs = msig.subsig;

  const pks = subsigs.map((subsig) => subsig.pk);
  if (msig.subsig.length < threshold) {
    return false;
  }

  let pk: Uint8Array;
  try {
    pk = address.fromMultisigPreImg({ version, threshold, pks });
  } catch (e) {
    return false;
  }

  if (!utils.arrayEqual(pk, publicKey)) {
    return false;
  }

  let counter = 0;
  for (const subsig of subsigs) {
    if (subsig.s !== undefined) {
      counter += 1;
    }
  }
  if (counter < threshold) {
    return false;
  }

  let verifiedCounter = 0;
  for (const subsig of subsigs) {
    if (subsig.s !== undefined) {
      if (nacl.verify(toBeVerified, subsig.s, subsig.pk)) {
        verifiedCounter += 1;
      }
    }
  }

  if (verifiedCounter < threshold) {
    return false;
  }

  return true;
}

/**
 * signMultisigTransaction takes a raw transaction (see signTransaction), a multisig preimage, a secret key, and returns
 * a multisig transaction, which is a blob representing a transaction and multisignature account preimage. The returned
 * multisig txn can accumulate additional signatures through mergeMultisigTransactions or appendMultisigTransaction.
 * @param txn - object with either payment or key registration fields
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param addrs - a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param sk - Algorand secret key. The corresponding pk should be in the pre image.
 * @returns object containing txID, and blob of partially signed multisig transaction (with multisig preimage information)
 * If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 */
export function signMultisigTransaction(
  txn: txnBuilder.TransactionLike,
  { version, threshold, addrs }: MultisigMetadata,
  sk: Uint8Array
) {
  // check that the from field matches the mSigPreImage. If from field is not populated, fill it in.
  const expectedFromRaw = address.fromMultisigPreImgAddrs({
    version,
    threshold,
    addrs,
  });
  if (!Object.prototype.hasOwnProperty.call(txn, 'from')) {
    // eslint-disable-next-line no-param-reassign
    txn.from = expectedFromRaw;
  }
  // build pks for partialSign
  const pks = addrs.map((addr) => address.decodeAddress(addr).publicKey);
  // `txn` needs to be handled differently if it's a constructed `Transaction` vs a dict of constructor args
  const txnAlreadyBuilt = txn instanceof txnBuilder.Transaction;
  let algoTxn: MultisigTransaction;
  let blob: Uint8Array;
  if (txnAlreadyBuilt) {
    algoTxn = (txn as unknown) as MultisigTransaction;
    blob = MultisigTransaction.prototype.partialSignTxn.call(
      algoTxn,
      { version, threshold, pks },
      sk
    );
  } else {
    algoTxn = new MultisigTransaction(txn as AnyTransaction);
    blob = algoTxn.partialSignTxn({ version, threshold, pks }, sk);
  }
  return {
    txID: algoTxn.txID().toString(),
    blob,
  };
}

/**
 * appendSignMultisigTransaction takes a multisig transaction blob, and appends our signature to it.
 * While we could derive public key preimagery from the partially-signed multisig transaction,
 * we ask the caller to pass it back in, to ensure they know what they are signing.
 * @param multisigTxnBlob - an encoded multisig txn. Supports non-payment txn types.
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param addrs - a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param sk - Algorand secret key
 * @returns object containing txID, and blob representing encoded multisig txn
 */
export function appendSignMultisigTransaction(
  multisigTxnBlob: Uint8Array,
  { version, threshold, addrs }: MultisigMetadata,
  sk: Uint8Array
) {
  const pks = addrs.map((addr) => address.decodeAddress(addr).publicKey);
  // obtain underlying txn, sign it, and merge it
  const multisigTxObj = encoding.decode(
    multisigTxnBlob
  ) as EncodedSignedTransaction;
  const msigTxn = MultisigTransaction.from_obj_for_encoding(multisigTxObj.txn);
  const partialSignedBlob = msigTxn.partialSignTxn(
    { version, threshold, pks },
    sk
  );
  return {
    txID: msigTxn.txID().toString(),
    blob: mergeMultisigTransactions([multisigTxnBlob, partialSignedBlob]),
  };
}

/**
 * multisigAddress takes multisig metadata (preimage) and returns the corresponding human readable Algorand address.
 * @param version - mutlisig version
 * @param threshold - multisig threshold
 * @param addrs - list of Algorand addresses
 */
export function multisigAddress({
  version,
  threshold,
  addrs,
}: MultisigMetadata) {
  return address.fromMultisigPreImgAddrs({ version, threshold, addrs });
}
