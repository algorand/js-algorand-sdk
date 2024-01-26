import * as nacl from './nacl/naclWrappers.js';
import {
  Address,
  ALGORAND_ADDRESS_BYTE_LENGTH,
  ALGORAND_CHECKSUM_BYTE_LENGTH,
} from './encoding/address.js';
import * as encoding from './encoding/encoding.js';
import { Transaction } from './transaction.js';
import * as utils from './utils/utils.js';
import {
  EncodedMultisig,
  EncodedSignedTransaction,
} from './types/transactions/encoded.js';

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
export const MULTISIG_SIGNATURE_LENGTH_ERROR_MSG =
  'Cannot add multisig signature. Signature is not of the correct length.';

/**
 * Required options for creating a multisignature
 *
 * Documentation available at: https://developer.algorand.org/docs/get-details/transactions/signatures/#multisignatures
 */
export interface MultisigMetadata {
  /**
   * Multisig version
   */
  version: number;

  /**
   * Multisig threshold value. Authorization requires a subset of signatures,
   * equal to or greater than the threshold value.
   */
  threshold: number;

  /**
   * A list of Algorand addresses representing possible signers for this multisig. Order is important.
   */
  addrs: Array<string | Address>;
}

interface MultisigOptions {
  rawSig: Uint8Array;
  myPk: Uint8Array;
}

interface MultisigMetadataWithPks extends Omit<MultisigMetadata, 'addrs'> {
  pks: Uint8Array[];
}

// Convert "MultisigAddr" UTF-8 to byte array
const MULTISIG_PREIMG2ADDR_PREFIX = new Uint8Array([
  77, 117, 108, 116, 105, 115, 105, 103, 65, 100, 100, 114,
]);

const INVALID_MSIG_VERSION_ERROR_MSG = 'invalid multisig version';
const INVALID_MSIG_THRESHOLD_ERROR_MSG = 'bad multisig threshold';
const INVALID_MSIG_PK_ERROR_MSG = 'bad multisig public key - wrong length';
const UNEXPECTED_PK_LEN_ERROR_MSG = 'nacl public key length is not 32 bytes';

export function pksFromAddresses(addrs: Array<string | Address>): Uint8Array[] {
  return addrs.map((addr) => {
    if (typeof addr === 'string') {
      return Address.fromString(addr).publicKey;
    }
    return addr.publicKey;
  });
}

/**
 * fromMultisigPreImg takes multisig parameters and returns a 32 byte typed array public key,
 * representing an address that identifies the "exact group, version, and public keys" that are required for signing.
 * Hash("MultisigAddr" || version uint8 || threshold uint8 || PK1 || PK2 || ...)
 * Encoding this output yields a human readable address.
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param pks - array of typed array public keys
 */
export function addressFromMultisigPreImg({
  version,
  threshold,
  pks,
}: Omit<MultisigMetadata, 'addrs'> & {
  pks: Uint8Array[];
}): Address {
  if (version !== 1 || version > 255 || version < 0) {
    // ^ a tad redundant, but in case in the future version != 1, still check for uint8
    throw new Error(INVALID_MSIG_VERSION_ERROR_MSG);
  }
  if (
    threshold === 0 ||
    pks.length === 0 ||
    threshold > pks.length ||
    threshold > 255
  ) {
    throw new Error(INVALID_MSIG_THRESHOLD_ERROR_MSG);
  }
  const pkLen = ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH;
  if (pkLen !== nacl.PUBLIC_KEY_LENGTH) {
    throw new Error(UNEXPECTED_PK_LEN_ERROR_MSG);
  }
  const merged = new Uint8Array(
    MULTISIG_PREIMG2ADDR_PREFIX.length + 2 + pkLen * pks.length
  );
  merged.set(MULTISIG_PREIMG2ADDR_PREFIX, 0);
  merged.set([version], MULTISIG_PREIMG2ADDR_PREFIX.length);
  merged.set([threshold], MULTISIG_PREIMG2ADDR_PREFIX.length + 1);
  for (let i = 0; i < pks.length; i++) {
    if (pks[i].length !== pkLen) {
      throw new Error(INVALID_MSIG_PK_ERROR_MSG);
    }
    merged.set(pks[i], MULTISIG_PREIMG2ADDR_PREFIX.length + 2 + i * pkLen);
  }
  return new Address(Uint8Array.from(nacl.genericHash(merged)));
}

/**
 * fromMultisigPreImgAddrs takes multisig parameters and returns a human readable Algorand address.
 * This is equivalent to fromMultisigPreImg, but interfaces with encoded addresses.
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param addrs - array of encoded addresses
 */
export function addressFromMultisigPreImgAddrs({
  version,
  threshold,
  addrs,
}: MultisigMetadata): Address {
  const pks = pksFromAddresses(addrs);
  return addressFromMultisigPreImg({ version, threshold, pks });
}

/**
 * createMultisigTransaction creates a raw, unsigned multisig transaction blob.
 * @param txn - the actual transaction.
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param pks - ordered list of public keys in this multisig
 * @returns encoded multisig blob
 */
export function createMultisigTransaction(
  txn: Transaction,
  { version, threshold, addrs }: MultisigMetadata
) {
  // construct the appendable multisigned transaction format
  const pks = pksFromAddresses(addrs);
  const subsigs = pks.map((pk) => ({ pk }));

  const msig: EncodedMultisig = {
    v: version,
    thr: threshold,
    subsig: subsigs,
  };
  const txnForEncoding = txn.get_obj_for_encoding();
  const signedTxn: EncodedSignedTransaction = {
    msig,
    txn: txnForEncoding,
  };

  // if the address of this multisig is different from the transaction sender,
  // we need to add the auth-addr field
  const msigAddr = addressFromMultisigPreImg({
    version,
    threshold,
    pks,
  });
  const senderAddr = txnForEncoding.snd
    ? new Address(txnForEncoding.snd)
    : Address.zeroAddress();
  if (!senderAddr.equals(msigAddr)) {
    signedTxn.sgnr = msigAddr.publicKey;
  }

  return new Uint8Array(encoding.encode(signedTxn));
}

/**
 * createMultisigTransactionWithSignature creates a multisig transaction blob with an included signature.
 * @param txn - the actual transaction to sign.
 * @param rawSig - a Uint8Array raw signature of that transaction
 * @param myPk - a public key that corresponds with rawSig
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param pks - ordered list of public keys in this multisig
 * @returns encoded multisig blob
 */
function createMultisigTransactionWithSignature(
  txn: Transaction,
  { rawSig, myPk }: MultisigOptions,
  { version, threshold, pks }: MultisigMetadataWithPks
): Uint8Array {
  // Create an empty encoded multisig transaction
  const encodedMsig = createMultisigTransaction(txn, {
    version,
    threshold,
    addrs: pks.map((pk) => new Address(pk)),
  });
  // note: this is not signed yet, but will be shortly
  const signedTxn = encoding.decode(encodedMsig) as EncodedSignedTransaction;

  let keyExist = false;
  // append the multisig signature to the corresponding public key in the multisig blob
  signedTxn.msig!.subsig.forEach((subsig, i) => {
    if (nacl.bytesEqual(subsig.pk, myPk)) {
      keyExist = true;
      signedTxn.msig!.subsig[i].s = rawSig;
    }
  });
  if (!keyExist) {
    throw new Error(MULTISIG_KEY_NOT_EXIST_ERROR_MSG);
  }

  // if the address of this multisig is different from the transaction sender,
  // we need to add the auth-addr field
  const msigAddr = addressFromMultisigPreImg({
    version,
    threshold,
    pks,
  });
  const senderAddr = signedTxn.txn.snd
    ? new Address(signedTxn.txn.snd)
    : Address.zeroAddress();
  if (!senderAddr.equals(msigAddr)) {
    signedTxn.sgnr = msigAddr.publicKey;
  }

  return new Uint8Array(encoding.encode(signedTxn));
}

/**
 * partialSignTxn partially signs this transaction and returns a partially-signed multisig transaction,
 * encoded with msgpack as a typed array.
 * @param transaction - The transaction to sign
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param pks - multisig public key list, order is important.
 * @param sk - an Algorand secret key to sign with.
 * @returns an encoded, partially signed multisig transaction.
 */
function partialSignTxn(
  transaction: Transaction,
  { version, threshold, pks }: MultisigMetadataWithPks,
  sk: Uint8Array
) {
  // get signature verifier
  const myPk = nacl.keyPairFromSecretKey(sk).publicKey;
  return createMultisigTransactionWithSignature(
    transaction,
    { rawSig: transaction.rawSignTxn(sk), myPk },
    { version, threshold, pks }
  );
}

/**
 * partialSignWithMultisigSignature partially signs this transaction with an external raw multisig signature and returns
 * a partially-signed multisig transaction, encoded with msgpack as a typed array.
 * @param transaction - The transaction to sign
 * @param metadata - multisig metadata
 * @param signerAddr - address of the signer
 * @param signature - raw multisig signature
 * @returns an encoded, partially signed multisig transaction.
 */
function partialSignWithMultisigSignature(
  transaction: Transaction,
  metadata: MultisigMetadataWithPks,
  signerAddr: string | Address,
  signature: Uint8Array
) {
  if (!nacl.isValidSignatureLength(signature.length)) {
    throw new Error(MULTISIG_SIGNATURE_LENGTH_ERROR_MSG);
  }
  const signerAddressObj =
    typeof signerAddr === 'string'
      ? Address.fromString(signerAddr)
      : signerAddr;
  return createMultisigTransactionWithSignature(
    transaction,
    {
      rawSig: signature,
      myPk: signerAddressObj.publicKey,
    },
    metadata
  );
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
  if (!refSigTx.msig) {
    throw new Error(
      'Invalid multisig transaction, multisig structure missing at index 0'
    );
  }
  const refTxID = Transaction.from_obj_for_encoding(refSigTx.txn).txID();
  const refAuthAddr = refSigTx.sgnr
    ? new Address(refSigTx.sgnr).toString()
    : undefined;
  const refPreImage = {
    version: refSigTx.msig.v,
    threshold: refSigTx.msig.thr,
    pks: refSigTx.msig.subsig.map((subsig) => subsig.pk),
  };
  const refMsigAddr = addressFromMultisigPreImg(refPreImage);

  const newSubsigs = refSigTx.msig.subsig.map((sig) => ({ ...sig }));
  for (let i = 1; i < multisigTxnBlobs.length; i++) {
    const unisig = encoding.decode(
      multisigTxnBlobs[i]
    ) as EncodedSignedTransaction;
    if (!unisig.msig) {
      throw new Error(
        `Invalid multisig transaction, multisig structure missing at index ${i}`
      );
    }

    const unisigAlgoTxn = Transaction.from_obj_for_encoding(unisig.txn);
    if (unisigAlgoTxn.txID() !== refTxID) {
      throw new Error(MULTISIG_MERGE_MISMATCH_ERROR_MSG);
    }

    const authAddr = unisig.sgnr
      ? new Address(unisig.sgnr).toString()
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
    const msgigAddr = addressFromMultisigPreImg(preimg);
    if (!refMsigAddr.equals(msgigAddr)) {
      throw new Error(MULTISIG_MERGE_WRONG_PREIMAGE_ERROR_MSG);
    }

    // now, we can merge
    unisig.msig.subsig.forEach((uniSubsig, index) => {
      if (!uniSubsig.s) return;
      const current = newSubsigs[index];
      if (current.s && !utils.arrayEqual(uniSubsig.s, current.s)) {
        // mismatch
        throw new Error(MULTISIG_MERGE_SIG_MISMATCH_ERROR_MSG);
      }
      current.s = uniSubsig.s;
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
    signedTxn.sgnr = Address.fromString(refAuthAddr).publicKey;
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
    pk = addressFromMultisigPreImg({ version, threshold, pks }).publicKey;
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
 * multisig txn can accumulate additional signatures through mergeMultisigTransactions or appendSignMultisigTransaction.
 * @param txn - object with either payment or key registration fields
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param addrs - a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param sk - Algorand secret key. The corresponding pk should be in the pre image.
 * @returns object containing txID, and blob of partially signed multisig transaction (with multisig preimage information)
 * If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 */
export function signMultisigTransaction(
  txn: Transaction,
  { version, threshold, addrs }: MultisigMetadata,
  sk: Uint8Array
) {
  // build pks for partialSign
  const pks = pksFromAddresses(addrs);
  const blob = partialSignTxn(txn, { version, threshold, pks }, sk);
  return {
    txID: txn.txID(),
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
  const pks = pksFromAddresses(addrs);
  // obtain underlying txn, sign it, and merge it
  const multisigTxObj = encoding.decode(
    multisigTxnBlob
  ) as EncodedSignedTransaction;
  const msigTxn = Transaction.from_obj_for_encoding(multisigTxObj.txn);
  const partialSignedBlob = partialSignTxn(
    msigTxn,
    { version, threshold, pks },
    sk
  );
  return {
    txID: msigTxn.txID(),
    blob: mergeMultisigTransactions([multisigTxnBlob, partialSignedBlob]),
  };
}

/**
 * appendMultisigTransactionSignature takes a multisig transaction blob, and appends a given raw signature to it.
 * This makes it possible to compile a multisig signature using only raw signatures from external methods.
 * @param multisigTxnBlob - an encoded multisig txn. Supports non-payment txn types.
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param addrs - a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param signerAddr - address of the signer
 * @param signature - raw multisig signature
 * @returns object containing txID, and blob representing encoded multisig txn
 */
export function appendSignRawMultisigSignature(
  multisigTxnBlob: Uint8Array,
  { version, threshold, addrs }: MultisigMetadata,
  signerAddr: string | Address,
  signature: Uint8Array
) {
  const pks = pksFromAddresses(addrs);
  // obtain underlying txn, sign it, and merge it
  const multisigTxObj = encoding.decode(
    multisigTxnBlob
  ) as EncodedSignedTransaction;
  const msigTxn = Transaction.from_obj_for_encoding(multisigTxObj.txn);
  const partialSignedBlob = partialSignWithMultisigSignature(
    msigTxn,
    { version, threshold, pks },
    signerAddr,
    signature
  );
  return {
    txID: msigTxn.txID(),
    blob: mergeMultisigTransactions([multisigTxnBlob, partialSignedBlob]),
  };
}

/**
 * multisigAddress takes multisig metadata (preimage) and returns the corresponding human readable Algorand address.
 * @param version - multisig version
 * @param threshold - multisig threshold
 * @param addrs - list of Algorand addresses
 */
export function multisigAddress({
  version,
  threshold,
  addrs,
}: MultisigMetadata): Address {
  return addressFromMultisigPreImgAddrs({ version, threshold, addrs });
}
