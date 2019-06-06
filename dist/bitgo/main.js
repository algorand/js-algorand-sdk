"use strict";

const nacl = require('./nacl/naclWrappers');

const address = require('./encoding/address');

const Seed = require('./encoding/seed');

const mnemonic = require('./mnemonic/mnemonic');

const encoding = require('./encoding/encoding');

const txnBuilder = require('./transaction');

const multisig = require('./multisig');

const bidBuilder = require('./bid');

const algod = require('./client/algod');

const kmd = require('./client/kmd');

const utils = require('./utils/utils');

let Algod = algod.Algod;
let Kmd = kmd.Kmd; // Errors

const ERROR_MULTISIG_BAD_SENDER = new Error("The transaction sender address and multisig preimage do not match.");
/**
 * GenerateAddress returns a new Algorand address and its corresponding secret key
 * @returns {{sk: Uint8Array, addr: string}}
 */

function generateAccount() {
  let keys = nacl.keyPair();
  let encodedPk = address.encode(keys.publicKey);
  return {
    addr: encodedPk,
    sk: keys.secretKey
  };
}
/**
 * Generates an account (key pair) from a seed and returns a new Algorand
 * address and its corresponding secret key
 * @param {Uint8Array} [seed] - Algorand seed
 * @returns {{sk: Uint8Array, addr: string}}
 */


function generateAccountFromSeed(seed) {
  const keys = nacl.keyPairFromSeed(seed);
  return {
    addr: address.encode(keys.publicKey),
    sk: keys.secretKey
  };
}
/**
 * Takes an Algorand seed and checks if valid
 * @param {String} seed - Algorand seed
 * @returns {Boolean} true if valid, false otherwise
 */


function isValidSeed(seed) {
  return Seed.isValidSeed(seed);
}
/**
 * isValidAddress takes an Algorand address and checks if valid.
 * @param addr Algorand address
 * @returns {boolean}n true if valid, false otherwise
 */


function isValidAddress(addr) {
  return address.isValidAddress(addr);
}
/**
 * mnemonicToSecretKey takes a mnemonic string and returns the corresponding Algorand address and its secret key.
 * @param mn 25 words Algorand mnemonic
 * @returns {{sk: Uint8Array, addr: string}}
 * @throws error if fails to decode the mnemonic
 */


function mnemonicToSecretKey(mn) {
  let seed = mnemonic.seedFromMnemonic(mn);
  let keys = nacl.keyPairFromSeed(seed);
  let encodedPk = address.encode(keys.publicKey);
  return {
    addr: encodedPk,
    sk: keys.secretKey
  };
}
/**
 * secretKeyToMnemonic takes an Algorand secret key and returns the corresponding mnemonic.
 * @param sk Uint8Array
 * @returns string mnemonic
 */


function secretKeyToMnemonic(sk) {
  // get the seed from the sk
  let seed = sk.slice(0, nacl.SEED_BYTES_LENGTH);
  return mnemonic.mnemonicFromSeed(seed);
}
/**
 * mnemonicToMasterDerivationKey takes a mnemonic string and returns the corresponding master derivation key.
 * @param mn 25 words Algorand mnemonic
 * @returns Uint8Array
 * @throws error if fails to decode the mnemonic
 */


function mnemonicToMasterDerivationKey(mn) {
  return mnemonic.seedFromMnemonic(mn);
}
/**
 * masterDerivationKeyToMnemonic takes a master derivation key and returns the corresponding mnemonic.
 * @param mdk Uint8Array
 * @returns string mnemonic
 */


function masterDerivationKeyToMnemonic(mdk) {
  return mnemonic.mnemonicFromSeed(mdk);
}
/**
 * signTransaction takes an object with the following fields: to, amount, fee per byte, firstRound, lastRound,
 * and note(optional),GenesisID(optional) and a secret key and returns a signed blob
 * @param txn object with the following fields -  to, amount, fee per byte, firstRound, lastRound, and note(optional)
 * @param sk Algorand Secret Key
 * @returns object contains the binary signed transaction and it's txID
 */


function signTransaction(txn, sk) {
  // Get pk from sk
  let key = nacl.keyPairFromSecretKey(sk);
  txn.from = address.encode(key.publicKey);
  let algoTxn = new txnBuilder.Transaction(txn);
  return {
    "txID": algoTxn.txID().toString(),
    "blob": algoTxn.signTxn(sk)
  };
}
/**
 * signBid takes an object with the following fields: bidder key, bid amount, max price, bid ID, auctionKey, auction ID,
 * and a secret key and returns a signed blob to be inserted into a transaction Algorand note field.
 * @param bid Algorand Bid
 * @param sk Algorand secret key
 * @returns Uint8Array binary signed bid
 */


function signBid(bid, sk) {
  let signedBid = new bidBuilder.Bid(bid);
  return signedBid.signBid(sk);
}
/**
 * signMultisigTransaction takes a raw transaction (see signTransaction), a multisig preimage, a secret key, and returns
 * a multisig transaction, which is a blob representing a transaction and multisignature account preimage. The returned
 * multisig txn can accumulate additional signatures through mergeMultisigTransactions or appendMultisigTransaction.
 * @param txn object with the following fields -  to, amount, fee per byte, firstRound, lastRound, and note(optional)
 * @param version multisig version
 * @param threshold multisig threshold
 * @param addrs a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param sk Algorand secret key. The corresponding pk should be in the pre image.
 * @returns object containing txID, and blob of partially signed multisig transaction (with multisig preimage information)
 */


function signMultisigTransaction(txn, {
  version,
  threshold,
  addrs
}, sk) {
  // check that the from field matches the mSigPreImage. If from field is not populated, fill it in.
  let expectedFromRaw = address.fromMultisigPreImgAddrs({
    version,
    threshold,
    addrs
  });

  if (txn.hasOwnProperty('from')) {
    if (txn.from !== expectedFromRaw) {
      throw ERROR_MULTISIG_BAD_SENDER;
    }
  } else {
    txn.from = expectedFromRaw;
  }

  let algoTxn = new multisig.MultiSigTransaction(txn);
  const pks = addrs.map(addr => {
    return address.decode(addr).publicKey;
  });
  return {
    "txID": algoTxn.txID().toString(),
    "blob": algoTxn.partialSignTxn({
      version,
      threshold,
      pks
    }, sk)
  };
}
/**
 * appendSignMultisigTransaction takes a multisig transaction blob, and appends our signature to it.
 * While we could derive public key preimagery from the partially-signed multisig transaction,
 * we ask the caller to pass it back in, to ensure they know what they are signing.
 * @param multisigTxnBlob an encoded multisig txn. Supports non-payment txn types.
 * @param version multisig version
 * @param threshold mutlisig threshold
 * @param addrs a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param sk Algorand secret key
 * @returns object containing txID, and blob representing encoded multisig txn
 */


function appendSignMultisigTransaction(multisigTxnBlob, {
  version,
  threshold,
  addrs
}, sk) {
  const pks = addrs.map(addr => {
    return address.decode(addr).publicKey;
  }); // obtain underlying txn, sign it, and merge it

  let multisigTxObj = encoding.decode(multisigTxnBlob);
  let msigTxn = multisig.MultiSigTransaction.from_obj_for_encoding(multisigTxObj.txn);
  let partialSignedBlob = msigTxn.partialSignTxn({
    version,
    threshold,
    pks
  }, sk);
  return {
    "txID": msigTxn.txID().toString(),
    "blob": mergeMultisigTransactions([multisigTxnBlob, partialSignedBlob])
  };
}
/**
 * mergeMultisigTransactions takes a list of multisig transaction blobs, and merges them.
 * @param multisigTxnBlobs a list of blobs representing encoded multisig txns
 * @returns blob representing encoded multisig txn
 */


function mergeMultisigTransactions(multisigTxnBlobs) {
  return multisig.mergeMultisigTransactions(multisigTxnBlobs);
}
/**
 * multisigAddress takes multisig metadata (preimage) and returns the corresponding human readable Algorand address.
 * @param version mutlisig version
 * @param threshold multisig threshold
 * @param addrs list of Algorand addresses
 */


function multisigAddress({
  version,
  threshold,
  addrs
}) {
  return address.fromMultisigPreImgAddrs({
    version,
    threshold,
    addrs
  });
}
/**
 * encodeObj takes a javascript object and returns its msgpack encoding
 * Note that the encoding sorts the fields alphabetically
 * @param o js obj
 * @returns Uint8Array binary representation
 */


function encodeObj(o) {
  return new Uint8Array(encoding.encode(o));
}
/**
 * decodeObj takes a Uint8Array and returns its javascript obj
 * @param o Uint8Array to decode
 * @returns object
 */


function decodeObj(o) {
  return encoding.decode(o);
}

module.exports = {
  isValidAddress,
  isValidSeed,
  generateAccount,
  generateAccountFromSeed,
  secretKeyToMnemonic,
  mnemonicToSecretKey,
  signTransaction,
  signBid,
  encodeObj,
  decodeObj,
  Algod,
  Kmd,
  mnemonicToMasterDerivationKey,
  masterDerivationKeyToMnemonic,
  appendSignMultisigTransaction,
  mergeMultisigTransactions,
  signMultisigTransaction,
  multisigAddress,
  ERROR_MULTISIG_BAD_SENDER,
  Multisig: multisig,
  Transaction: txnBuilder,
  Address: address,
  Encoding: encoding,
  Seed,
  Mnemonic: mnemonic,
  NaclWrapper: nacl,
  Utils: utils
};