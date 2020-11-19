const { Buffer } = require('buffer');
const nacl = require('./nacl/naclWrappers');
const address = require('./encoding/address');
const mnemonic = require('./mnemonic/mnemonic');
const encoding = require('./encoding/encoding');
const account = require('./account');
const txnBuilder = require('./transaction');
const makeTxn = require('./makeTxn');
const group = require('./group');
const multisig = require('./multisig');
const bidBuilder = require('./bid');
const algod = require('./client/algod');
const kmd = require('./client/kmd');
const convert = require('./convert');
const utils = require('./utils/utils');
const logicsig = require('./logicsig');
const LogicTemplates = require('./logicTemplates');
const algodv2 = require('./client/v2/algod/algod')
const modelsv2 = require('./client/v2/algod/models/types')
const indexer = require('./client/v2/indexer/indexer')

let Algod = algod.Algod;
let Kmd = kmd.Kmd;
let Algodv2 = algodv2.AlgodClient
let Indexer = indexer.IndexerClient

const SIGN_BYTES_PREFIX = Buffer.from([77, 88]); // "MX"

// Errors
const ERROR_MULTISIG_BAD_SENDER = new Error("The transaction sender address and multisig preimage do not match.");

/**
 * signTransaction takes an object with either payment or key registration fields and 
 * a secret key and returns a signed blob.
 * 
 * Payment transaction fields: from, to, amount, fee, firstRound, lastRound, genesisHash,
 * note(optional), GenesisID(optional), closeRemainderTo(optional)
 * 
 * Key registration fields: fee, firstRound, lastRound, voteKey, selectionKey, voteFirst,
 * voteLast, voteKeyDilution, genesisHash, note(optional), GenesisID(optional)
 *
 * If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param txn object with either payment or key registration fields
 * @param sk Algorand Secret Key
 * @returns object contains the binary signed transaction and its txID
 */
function signTransaction(txn, sk) {
    if (!txn.from) {
        // Get pk from sk if no sender specified
        let key = nacl.keyPairFromSecretKey(sk);
        txn.from = address.encodeAddress(key.publicKey);
    }
    let algoTxn = txn;
    if (! (txn instanceof txnBuilder.Transaction)) {
        algoTxn = new txnBuilder.Transaction(txn);
    }

    return {"txID": algoTxn.txID().toString(), "blob": algoTxn.signTxn(sk)};
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
 * signBytes takes arbitrary bytes and a secret key, prepends the bytes with "MX" for domain separation, signs the bytes 
 * with the private key, and returns the signature.
 * @param bytes Uint8array
 * @param sk Algorand secret key
 * @returns binary signature
 */
function signBytes(bytes, sk) {
    let toBeSigned = Buffer.from(utils.concatArrays(SIGN_BYTES_PREFIX, bytes));
    let sig = nacl.sign(toBeSigned, sk);
    return sig;
}

/**
 * verifyBytes takes array of bytes, an address, and a signature and verifies if the signature is correct for the public
 * key and the bytes (the bytes should have been signed with "MX" prepended for domain separation).
 * @param bytes Uint8Array
 * @param signature binary signature
 * @param addr string address
 * @returns bool
 */
function verifyBytes(bytes, signature, addr) {
    toBeVerified = Buffer.from(utils.concatArrays(SIGN_BYTES_PREFIX, bytes));
    let pk = address.decodeAddress(addr).publicKey;
    return nacl.verify(toBeVerified, signature, pk);
}

/**
 * signMultisigTransaction takes a raw transaction (see signTransaction), a multisig preimage, a secret key, and returns
 * a multisig transaction, which is a blob representing a transaction and multisignature account preimage. The returned
 * multisig txn can accumulate additional signatures through mergeMultisigTransactions or appendMultisigTransaction.
 * @param txn object with either payment or key registration fields
 * @param version multisig version
 * @param threshold multisig threshold
 * @param addrs a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param sk Algorand secret key. The corresponding pk should be in the pre image.
 * @returns object containing txID, and blob of partially signed multisig transaction (with multisig preimage information)
 * If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 */
function signMultisigTransaction(txn, {version, threshold, addrs}, sk) {
    // check that the from field matches the mSigPreImage. If from field is not populated, fill it in.
    let expectedFromRaw = address.fromMultisigPreImgAddrs({version, threshold, addrs});
    if (txn.hasOwnProperty('from')) {
        if ((txn.from !== expectedFromRaw) && (address.encodeAddress(txn.from.publicKey) !== expectedFromRaw)) {
            throw ERROR_MULTISIG_BAD_SENDER;
        }
    } else {
        txn.from = expectedFromRaw;
    }
    // build pks for partialSign
    const pks = addrs.map(addr => {
        return address.decodeAddress(addr).publicKey;
    });
    // `txn` needs to be handled differently if it's a constructed `Transaction` vs a dict of constructor args
    let txnAlreadyBuilt = (txn instanceof txnBuilder.Transaction);
    let algoTxn;
    let blob;
    if (txnAlreadyBuilt) {
        algoTxn = txn;
        blob = multisig.MultisigTransaction.prototype.partialSignTxn.call(algoTxn, {version, threshold, pks}, sk);
    } else {
        algoTxn = new multisig.MultisigTransaction(txn);
        blob = algoTxn.partialSignTxn({version, threshold, pks}, sk);
    }
    return {
        "txID": algoTxn.txID().toString(),
        "blob": blob
    };
}

/**
 * appendSignMultisigTransaction takes a multisig transaction blob, and appends our signature to it.
 * While we could derive public key preimagery from the partially-signed multisig transaction,
 * we ask the caller to pass it back in, to ensure they know what they are signing.
 * @param multisigTxnBlob an encoded multisig txn. Supports non-payment txn types.
 * @param version multisig version
 * @param threshold multisig threshold
 * @param addrs a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param sk Algorand secret key
 * @returns object containing txID, and blob representing encoded multisig txn
 */
function appendSignMultisigTransaction(multisigTxnBlob, {version, threshold, addrs}, sk) {
    const pks = addrs.map(addr => {
        return address.decodeAddress(addr).publicKey;
    });
    // obtain underlying txn, sign it, and merge it
    let multisigTxObj = encoding.decode(multisigTxnBlob);
    let msigTxn = multisig.MultisigTransaction.from_obj_for_encoding(multisigTxObj.txn);
    let partialSignedBlob = msigTxn.partialSignTxn({version, threshold, pks}, sk);
    return {
        "txID": msigTxn.txID().toString(),
        "blob": mergeMultisigTransactions([multisigTxnBlob, partialSignedBlob]),
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
function multisigAddress({version, threshold, addrs}) {
    return address.fromMultisigPreImgAddrs({version, threshold, addrs});
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
    isValidAddress: address.isValidAddress,
    encodeAddress: address.encodeAddress,
    decodeAddress: address.decodeAddress,
    generateAccount: account.generateAccount,
    secretKeyToMnemonic: mnemonic.secretKeyToMnemonic,
    mnemonicToSecretKey: mnemonic.mnemonicToSecretKey,
    signTransaction,
    signBid,
    signBytes,
    verifyBytes,
    encodeObj,
    decodeObj,
    Algod,
    Kmd,
    Algodv2,
    Indexer,
    modelsv2,
    mnemonicToMasterDerivationKey: mnemonic.mnemonicToMasterDerivationKey,
    masterDerivationKeyToMnemonic: mnemonic.masterDerivationKeyToMnemonic,
    appendSignMultisigTransaction,
    mergeMultisigTransactions,
    signMultisigTransaction,
    multisigAddress,
    ERROR_MULTISIG_BAD_SENDER,
    ERROR_INVALID_MICROALGOS: convert.ERROR_INVALID_MICROALGOS,
    microalgosToAlgos: convert.microalgosToAlgos,
    algosToMicroalgos: convert.algosToMicroalgos,
    computeGroupID: group.computeGroupID,
    assignGroupID: group.assignGroupID,
    makeLogicSig: logicsig.makeLogicSig,
    signLogicSigTransaction: logicsig.signLogicSigTransaction,
    signLogicSigTransactionObject: logicsig.signLogicSigTransactionObject,
    logicSigFromByte: logicsig.logicSigFromByte,
    tealSign: logicsig.tealSign,
    tealSignFromProgram: logicsig.tealSignFromProgram,
    makePaymentTxn: makeTxn.makePaymentTxn,
    makeKeyRegistrationTxn: makeTxn.makeKeyRegistrationTxn,
    makeAssetCreateTxn: makeTxn.makeAssetCreateTxn,
    makeAssetConfigTxn: makeTxn.makeAssetConfigTxn,
    makeAssetDestroyTxn: makeTxn.makeAssetDestroyTxn,
    makeAssetFreezeTxn: makeTxn.makeAssetFreezeTxn,
    makeAssetTransferTxn: makeTxn.makeAssetTransferTxn,
    makePaymentTxnWithSuggestedParams: makeTxn.makePaymentTxnWithSuggestedParams,
    makeKeyRegistrationTxnWithSuggestedParams: makeTxn.makeKeyRegistrationTxnWithSuggestedParams,
    makeAssetCreateTxnWithSuggestedParams: makeTxn.makeAssetCreateTxnWithSuggestedParams,
    makeAssetConfigTxnWithSuggestedParams: makeTxn.makeAssetConfigTxnWithSuggestedParams,
    makeAssetDestroyTxnWithSuggestedParams: makeTxn.makeAssetDestroyTxnWithSuggestedParams,
    makeAssetFreezeTxnWithSuggestedParams: makeTxn.makeAssetFreezeTxnWithSuggestedParams,
    makeAssetTransferTxnWithSuggestedParams: makeTxn.makeAssetTransferTxnWithSuggestedParams,
    makePaymentTxnWithSuggestedParamsFromObject: makeTxn.makePaymentTxnWithSuggestedParamsFromObject,
    makeKeyRegistrationTxnWithSuggestedParamsFromObject: makeTxn.makeKeyRegistrationTxnWithSuggestedParamsFromObject,
    makeAssetCreateTxnWithSuggestedParamsFromObject: makeTxn.makeAssetCreateTxnWithSuggestedParamsFromObject,
    makeAssetConfigTxnWithSuggestedParamsFromObject: makeTxn.makeAssetConfigTxnWithSuggestedParamsFromObject,
    makeAssetDestroyTxnWithSuggestedParamsFromObject: makeTxn.makeAssetDestroyTxnWithSuggestedParamsFromObject,
    makeAssetFreezeTxnWithSuggestedParamsFromObject: makeTxn.makeAssetFreezeTxnWithSuggestedParamsFromObject,
    makeAssetTransferTxnWithSuggestedParamsFromObject: makeTxn.makeAssetTransferTxnWithSuggestedParamsFromObject,
    OnApplicationComplete: makeTxn.OnApplicationComplete,
    makeApplicationCreateTxn: makeTxn.makeApplicationCreateTxn,
    makeApplicationUpdateTxn: makeTxn.makeApplicationUpdateTxn,
    makeApplicationDeleteTxn: makeTxn.makeApplicationDeleteTxn,
    makeApplicationOptInTxn: makeTxn.makeApplicationOptInTxn,
    makeApplicationCloseOutTxn: makeTxn.makeApplicationCloseOutTxn,
    makeApplicationClearStateTxn: makeTxn.makeApplicationClearStateTxn,
    makeApplicationNoOpTxn: makeTxn.makeApplicationNoOpTxn,
    makeApplicationCreateTxnFromObject: makeTxn.makeApplicationCreateTxnFromObject,
    makeApplicationUpdateTxnFromObject: makeTxn.makeApplicationUpdateTxnFromObject,
    makeApplicationDeleteTxnFromObject: makeTxn.makeApplicationDeleteTxnFromObject,
    makeApplicationOptInTxnFromObject: makeTxn.makeApplicationOptInTxnFromObject,
    makeApplicationCloseOutTxnFromObject: makeTxn.makeApplicationCloseOutTxnFromObject,
    makeApplicationClearStateTxnFromObject: makeTxn.makeApplicationClearStateTxnFromObject,
    makeApplicationNoOpTxnFromObject: makeTxn.makeApplicationNoOpTxnFromObject,
    encodeUnsignedTransaction: txnBuilder.encodeUnsignedTransaction,
    decodeUnsignedTransaction: txnBuilder.decodeUnsignedTransaction,
    decodeSignedTransaction: txnBuilder.decodeSignedTransaction,
    Transaction: txnBuilder.Transaction,
    LogicTemplates,
};
