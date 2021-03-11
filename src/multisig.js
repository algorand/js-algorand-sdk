const { Buffer } = require('buffer');
const nacl = require('./nacl/naclWrappers');
const address = require('./encoding/address');
const encoding = require('./encoding/encoding');
const txnBuilder = require('./transaction');
const utils = require('./utils/utils');

/**
 Utilities for manipulating multisig transaction blobs.
 */

const MULTISIG_MERGE_LESSTHANTWO_ERROR_MSG =
  'Not enough multisig transactions to merge. Need at least two';
const MULTISIG_MERGE_MISMATCH_ERROR_MSG = 'Cannot merge txs. txIDs differ';
const MULTISIG_MERGE_WRONG_PREIMAGE_ERROR_MSG =
  'Cannot merge txs. Multisig preimages differ';
const MULTISIG_MERGE_SIG_MISMATCH_ERROR_MSG =
  'Cannot merge txs. subsigs are mismatched.';
const MULTISIG_BAD_FROM_FIELD_ERROR_MSG =
  'The transaction from field and multisig preimage do not match.';
const MULTISIG_KEY_NOT_EXIST_ERROR_MSG = 'Key does not exist';
const MULTISIG_NO_MUTATE_ERROR_MSG =
  'Cannot mutate a multisig field as it would invalidate all existing signatures.';
const MULTISIG_USE_PARTIAL_SIGN_ERROR_MSG =
  'Cannot sign a multisig transaction using `signTxn`. Use `partialSignTxn` instead.';

/**
 * createMultisigTransaction creates a multisig transaction blob.
 * @param txnForEncoding the actual transaction to sign.
 * @param rawSig a Buffer raw signature of that transaction
 * @param myPk a public key that corresponds with rawSig
 * @param version multisig version
 * @param threshold mutlisig threshold
 * @param pks ordered list of public keys in this multisig
 * @returns encoded multisig blob
 */
function createMultisigTransaction(
  txnForEncoding,
  { rawSig, myPk },
  { version, threshold, pks }
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
  const msig = {
    v: version,
    thr: threshold,
    subsig: subsigs,
  };
  const sTxn = {
    msig,
    txn: txnForEncoding,
  };
  return new Uint8Array(encoding.encode(sTxn));
}

/**
 * MultisigTransaction is a Transaction that also supports creating partially-signed multisig transactions.
 */
class MultisigTransaction extends txnBuilder.Transaction {
  /* eslint-disable class-methods-use-this */
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
  signTxn() {
    throw new Error(MULTISIG_USE_PARTIAL_SIGN_ERROR_MSG);
  }
  /* eslint-enable class-methods-use-this */

  /**
   * partialSignTxn partially signs this transaction and returns a partially-signed multisig transaction,
   * encoded with msgpack as a typed array.
   * @param version multisig version
   * @param threshold multisig threshold
   * @param pks multisig public key list, order is important.
   * @param sk an Algorand secret key to sign with.
   * @returns an encoded, partially signed multisig transaction.
   */
  partialSignTxn({ version, threshold, pks }, sk) {
    const expectedFromRaw = address.fromMultisigPreImg({
      version,
      threshold,
      pks,
    });
    if (
      address.encodeAddress(this.from.publicKey) !==
      address.encodeAddress(expectedFromRaw)
    ) {
      throw new Error(MULTISIG_BAD_FROM_FIELD_ERROR_MSG);
    }

    // get signature verifier
    const myPk = nacl.keyPairFromSecretKey(sk).publicKey;
    return createMultisigTransaction(
      this.get_obj_for_encoding(),
      { rawSig: this.rawSignTxn(sk), myPk },
      { version, threshold, pks }
    );
  }
}

/**
 * mergeMultisigTransactions takes a list of multisig transaction blobs, and merges them.
 * @param multisigTxnBlobs a list of blobs representing encoded multisig txns
 * @returns typed array msg-pack encoded multisig txn
 */
function mergeMultisigTransactions(multisigTxnBlobs) {
  if (multisigTxnBlobs.length < 2) {
    throw new Error(MULTISIG_MERGE_LESSTHANTWO_ERROR_MSG);
  }
  const refSigTx = encoding.decode(multisigTxnBlobs[0]);
  const refSigAlgoTx = MultisigTransaction.from_obj_for_encoding(refSigTx.txn);
  const refTxIDStr = refSigAlgoTx.txID().toString();
  const from = address.encodeAddress(refSigTx.txn.snd);

  let newSubsigs = refSigTx.msig.subsig;
  for (let i = 0; i < multisigTxnBlobs.length; i++) {
    const unisig = encoding.decode(multisigTxnBlobs[i]);
    const unisigAlgoTxn = MultisigTransaction.from_obj_for_encoding(unisig.txn);
    if (unisigAlgoTxn.txID().toString() !== refTxIDStr) {
      throw new Error(MULTISIG_MERGE_MISMATCH_ERROR_MSG);
    }
    // check multisig has same preimage as reference
    if (unisig.msig.subsig.length !== refSigTx.msig.subsig.length) {
      throw new Error(MULTISIG_MERGE_WRONG_PREIMAGE_ERROR_MSG);
    }
    const preimg = {
      version: unisig.msig.v,
      threshold: unisig.msig.thr,
      pks: unisig.msig.subsig.map((subsig) => subsig.pk),
    };
    if (from !== address.encodeAddress(address.fromMultisigPreImg(preimg))) {
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
  const msig = {
    v: refSigTx.msig.v,
    thr: refSigTx.msig.thr,
    subsig: newSubsigs,
  };
  const sTxn = {
    msig,
    txn: refSigTx.txn,
  };
  return new Uint8Array(encoding.encode(sTxn));
}

function verifyMultisig(toBeVerified, msig, publicKey) {
  const version = msig.v;
  const threshold = msig.thr;
  const subsigs = msig.subsig;

  const pks = subsigs.map((subsig) => subsig.pk);
  if (msig.subsig.length < threshold) {
    return false;
  }

  let pk;
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

module.exports = {
  MultisigTransaction,
  mergeMultisigTransactions,
  createMultisigTransaction,
  verifyMultisig,
  MULTISIG_MERGE_LESSTHANTWO_ERROR_MSG,
  MULTISIG_MERGE_MISMATCH_ERROR_MSG,
  MULTISIG_MERGE_WRONG_PREIMAGE_ERROR_MSG,
  MULTISIG_MERGE_SIG_MISMATCH_ERROR_MSG,
  MULTISIG_NO_MUTATE_ERROR_MSG,
  MULTISIG_USE_PARTIAL_SIGN_ERROR_MSG,
};
