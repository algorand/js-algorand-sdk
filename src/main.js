
const nacl = require('./nacl/naclWrappers');
const address = require('./encoding/address');
const mnemonic = require('./mnemonic/mnemonic');
const encoding = require('./encoding/encoding');
const txnBuilder = require('./transaction');
const multisig = require('./multisig');
const bidBuilder = require('./bid');
const algod = require('./client/algod');
const kmd = require('./client/kmd');
const utils = require('./utils/utils');
const logicsig = require('./logicsig');
const algodv2 = require('./client/v2/algod/algod')
const indexer = require('./client/v2/indexer/indexer')

let Algod = algod.Algod;
let Kmd = kmd.Kmd;
let Algodv2 = algodv2.AlgodClient
let Indexer = indexer.IndexerClient

const SIGN_BYTES_PREFIX = Buffer.from([77, 88]); // "MX"
const SIGN_PROGRAM_DATA_PREFIX = Buffer.from("ProgData");
const MICROALGOS_TO_ALGOS_RATIO = 1e6;
// Errors
const ERROR_MULTISIG_BAD_SENDER = new Error("The transaction sender address and multisig preimage do not match.");
const ERROR_INVALID_MICROALGOS = new Error("Microalgos should be positive and less than 2^53 - 1.")
/**
 * generateAccount returns a new Algorand address and its corresponding secret key
 * @returns {{sk: Uint8Array, addr: string}}
 */
function generateAccount() {
    let keys = nacl.keyPair();
    let encodedPk = address.encode(keys.publicKey);
    return {addr: encodedPk, sk: keys.secretKey};
}

/**
 * isValidAddress takes an Algorand address and checks if valid.
 * @param addr Algorand address
 * @returns {boolean} true if valid, false otherwise
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
    return {addr: encodedPk, sk: keys.secretKey};
}

/**
 * secretKeyToMnemonic takes an Algorand secret key and returns the corresponding mnemonic.
 * @param sk Uint8Array
 * @returns string mnemonic
 */
function secretKeyToMnemonic(sk) {
    // get the seed from the sk
    let seed = sk.slice(0, nacl.SEED_BTYES_LENGTH);
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
 * signTransaction takes an object with either payment or key registration fields and 
 * a secret key and returns a signed blob.
 * 
 * Payment transaction fields: from, to, amount, fee, firstRound, lastRound, genesisHash,
 * note(optional), GenesisID(optional), closeRemainderTo(optional)
 * 
 * Key registration fields: fee, firstRound, lastRound, voteKey, selectionKey, voteFirst,
 * voteLast, voteKeyDilution, genesisHash, note(optional), GenesisID(optional)
 * @param txn object with either payment or key registration fields
 * @param sk Algorand Secret Key
 * @returns object contains the binary signed transaction and its txID
 */
function signTransaction(txn, sk) {
    if (!txn.from) {
        // Get pk from sk if no sender specified
        let key = nacl.keyPairFromSecretKey(sk);
        txn.from = address.encode(key.publicKey);
    }
    let algoTxn = new txnBuilder.Transaction(txn);

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
    let pk = address.decode(addr).publicKey;
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
 */
function signMultisigTransaction(txn, {version, threshold, addrs}, sk) {
    // check that the from field matches the mSigPreImage. If from field is not populated, fill it in.
    let expectedFromRaw = address.fromMultisigPreImgAddrs({version, threshold, addrs});
    if (txn.hasOwnProperty('from')) {
        if (txn.from !== expectedFromRaw) {
            throw ERROR_MULTISIG_BAD_SENDER;
        }
    } else {
        txn.from = expectedFromRaw;
    }
    let algoTxn = new multisig.MultisigTransaction(txn);
    const pks = addrs.map(addr => {
        return address.decode(addr).publicKey;
    });
    return {
        "txID": algoTxn.txID().toString(),
        "blob": algoTxn.partialSignTxn({version, threshold, pks}, sk),
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
        return address.decode(addr).publicKey;
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

/**
 * microalgosToAlgos converts microalgos to algos
 * @param microalgos number
 * @returns number
 */
function microalgosToAlgos(microalgos) {
    if (microalgos < 0 || !Number.isSafeInteger(microalgos)){
        throw ERROR_INVALID_MICROALGOS;
    }
    return microalgos/MICROALGOS_TO_ALGOS_RATIO
}

/**
 * algosToMicroalgos converts algos to microalgos
 * @param algos number
 * @returns number
 */
function algosToMicroalgos(algos) {
    let microalgos = algos*MICROALGOS_TO_ALGOS_RATIO;
    return Math.round(microalgos)
}

/**
 * computeGroupID returns group ID for a group of transactions
 * @param txns array of transactions (every element is a dict or Transaction)
 * @return Buffer
 */
function computeGroupID(txns) {
    const hashes = [];
    for (let txn of txns)  {
        let tx = txn;
        if (!(txn instanceof txnBuilder.Transaction)) {
            tx = new txnBuilder.Transaction(txn);
        }
        hashes.push(tx.rawTxID());
    }

    const txgroup = new txnBuilder.TxGroup(hashes);

    const bytes = txgroup.toByte();
    const toBeHashed = Buffer.from(utils.concatArrays(txgroup.tag, bytes));
    const gid = nacl.genericHash(toBeHashed)
    return Buffer.from(gid);
}

/**
 * assignGroupID assigns group id to a given list of unsigned transactions
 * @param txns array of transactions (every element is a dict or Transaction)
 * @param from optional sender address specifying which transaction return
 * @return possible list of matching transactions
 */
function assignGroupID(txns, from = undefined) {
    const gid = computeGroupID(txns);
    let result = [];
    for (tx of txns) {
        if (!from || address.encode(tx.from.publicKey) == from) {
            tx.group = gid;
            result.push(tx);
        }
    }
    return result;
}

/**
 * makeLogicSig creates LogicSig object from program and arguments
 *
 * @param {Uint8Array} program Program to make LogicSig from
 * @param {[Uint8Array]} args Arguments as array of Uint8Array
 * @returns {LogicSig} LogicSig object
 */
function makeLogicSig(program, args) {
    return new logicsig.LogicSig(program, args);
}

/**
 * signLogicSigTransaction takes  a raw transaction and a LogicSig object and returns a logicsig
 * transaction which is a blob representing a transaction and logicsig object.
 * @param {Object} dictionary containing constructor arguments for a transaction
 * @param {LogicSig} lsig logicsig object
 * @returns {Object} Object containing txID and blob representing signed transaction.
 * @throws error on failure
 */
function signLogicSigTransaction(txn, lsig) {
    if (!lsig.verify(address.decode(txn.from).publicKey)) {
        throw new Error("invalid signature");
    }
    let algoTxn = new txnBuilder.Transaction(txn);
    return signLogicSigTransactionObject(algoTxn, lsig);
}

/**
 * signLogicSigTransactionObject takes transaction.Transaction and a LogicSig object and returns a logicsig
 * transaction which is a blob representing a transaction and logicsig object.
 * @param {Object} txn transaction.Transaction
 * @param {LogicSig} lsig logicsig object
 * @returns {Object} Object containing txID and blob representing signed transaction.
 */
function signLogicSigTransactionObject(txn, lsig) {
    let lstx = {
        lsig: lsig.get_obj_for_encoding(),
        txn: txn.get_obj_for_encoding()
    };

    return {
        "txID": txn.txID().toString(),
        "blob": encoding.encode(lstx)
    };
}

/**
 * logicSigFromByte accepts encoded logic sig bytes and attempts to call logicsig.fromByte on it,
 * returning the result
 */
function logicSigFromByte(encoded) {
    return logicsig.LogicSig.fromByte(encoded);
}

/**
 * tealSign creates a signature compatible with ed25519verify opcode from contract address
 * @param sk - uint8array with secret key
 * @param data - buffer with data to sign
 * @param contractAddress string representation of teal contract address (program hash)
 */
function tealSign(sk, data, contractAddress) {
    const parts = utils.concatArrays(address.decode(contractAddress).publicKey, data);
    const toBeSigned = Buffer.from(utils.concatArrays(SIGN_PROGRAM_DATA_PREFIX, parts));
    return nacl.sign(toBeSigned, sk);
}

/**
 * tealSignFromProgram creates a signature compatible with ed25519verify opcode from raw program bytes
 * @param sk - uint8array with secret key
 * @param data - buffer with data to sign
 * @param program - buffer with teal program
 */
function tealSignFromProgram(sk, data, program) {
    const lsig = makeLogicSig(program);
    const contractAddress = lsig.address();
    return tealSign(sk, data, contractAddress);
}

/**
 * makePaymentTxn takes payment arguments and returns a Transaction object
 * @param from - string representation of Algorand address of sender
 * @param to - string representation of Algorand address of recipient
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 * @param amount - integer amount to send, in microAlgos
 * @param closeRemainderTo - optionally close out remaining account balance to this account, represented as string rep of Algorand address
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makePaymentTxn(from, to, fee, amount, closeRemainderTo, firstRound, lastRound, note, genesisHash, genesisID) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makePaymentTxnWithSuggestedParams(from, to, amount, closeRemainderTo, note, suggestedParams);
}

/**
 * makePaymentTxnWithSuggestedParams takes payment arguments and returns a Transaction object
 * @param from - string representation of Algorand address of sender
 * @param to - string representation of Algorand address of recipient
 * @param amount - integer amount to send, in microAlgos
 * @param closeRemainderTo - optionally close out remaining account balance to this account, represented as string rep of Algorand address
 * @param note - uint8array of arbitrary data for sender to store
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makePaymentTxnWithSuggestedParams(from, to, amount, closeRemainderTo, note, suggestedParams) {
    let o = {
        "from": from,
        "to": to,
        "amount": amount,
        "closeRemainderTo": closeRemainderTo,
        "note": note,
        "suggestedParams": suggestedParams,
        "type": "pay"
    };
    return new txnBuilder.Transaction(o);
}

/**
 * makeKeyRegistrationTxn takes key registration arguments and returns a Transaction object for
 * that key registration operation
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param voteKey - string representation of voting key. for key deregistration, leave undefined
 * @param selectionKey - string representation of selection key. for key deregistration, leave undefined
 * @param voteFirst - first round on which voteKey is valid
 * @param voteLast - last round on which voteKey is valid
 * @param voteKeyDilution - integer
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeKeyRegistrationTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                                voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeKeyRegistrationTxnWithSuggestedParams(from, note, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, suggestedParams);
}

/**
 * makeKeyRegistrationTxnWithSuggestedParams takes key registration arguments and returns a Transaction object for
 * that key registration operation
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param voteKey - string representation of voting key. for key deregistration, leave undefined
 * @param selectionKey - string representation of selection key. for key deregistration, leave undefined
 * @param voteFirst - first round on which voteKey is valid
 * @param voteLast - last round on which voteKey is valid
 * @param voteKeyDilution - integer
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeKeyRegistrationTxnWithSuggestedParams(from, note, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, suggestedParams) {
    let o = {
        "from": from,
        "note": note,
        "voteKey": voteKey,
        "selectionKey": selectionKey,
        "voteFirst": voteFirst,
        "voteLast": voteLast,
        "voteKeyDilution": voteKeyDilution,
        "suggestedParams": suggestedParams,
        "type": "keyreg"
    };
    return new txnBuilder.Transaction(o);
}

/** makeAssetCreateTxn takes asset creation arguments and returns a Transaction object
 * for creating that asset
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param total - integer total supply of the asset
 * @param decimals - integer number of decimals for asset unit calculation
 * @param defaultFrozen - boolean whether asset accounts should default to being frozen
 * @param manager - string representation of Algorand address in charge of reserve, freeze, clawback, destruction, etc
 * @param reserve - string representation of Algorand address representing asset reserve
 * @param freeze - string representation of Algorand address with power to freeze/unfreeze asset holdings
 * @param clawback - string representation of Algorand address with power to revoke asset holdings
 * @param unitName - string units name for this asset
 * @param assetName - string name for this asset
 * @param assetURL - string URL relating to this asset
 * @param assetMetadataHash - string representation of some sort of hash commitment with respect to the asset
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetCreateTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                            total, decimals, defaultFrozen, manager, reserve, freeze,
                            clawback, unitName, assetName, assetURL, assetMetadataHash) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetCreateTxnWithSuggestedParams(from, note, total, decimals, defaultFrozen, manager, reserve, freeze, clawback,
        unitName, assetName, assetURL, assetMetadataHash, suggestedParams);
}

/** makeAssetCreateTxnWithSuggestedParams takes asset creation arguments and returns a Transaction object
 * for creating that asset
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param total - integer total supply of the asset
 * @param decimals - integer number of decimals for asset unit calculation
 * @param defaultFrozen - boolean whether asset accounts should default to being frozen
 * @param manager - string representation of Algorand address in charge of reserve, freeze, clawback, destruction, etc
 * @param reserve - string representation of Algorand address representing asset reserve
 * @param freeze - string representation of Algorand address with power to freeze/unfreeze asset holdings
 * @param clawback - string representation of Algorand address with power to revoke asset holdings
 * @param unitName - string units name for this asset
 * @param assetName - string name for this asset
 * @param assetURL - string URL relating to this asset
 * @param assetMetadataHash - string representation of some sort of hash commitment with respect to the asset
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @returns {Transaction}
 */
function makeAssetCreateTxnWithSuggestedParams(from, note, total, decimals, defaultFrozen, manager, reserve, freeze,
                            clawback, unitName, assetName, assetURL, assetMetadataHash, suggestedParams) {
    let o = {
        "from": from,
        "note": note,
        "suggestedParams": suggestedParams,
        "assetTotal": total,
        "assetDecimals": decimals,
        "assetDefaultFrozen": defaultFrozen,
        "assetUnitName": unitName,
        "assetName": assetName,
        "assetURL": assetURL,
        "assetMetadataHash": assetMetadataHash,
        "assetManager": manager,
        "assetReserve": reserve,
        "assetFreeze": freeze,
        "assetClawback": clawback,
        "type": "acfg"
    };
    return new txnBuilder.Transaction(o);
}

/** makeAssetConfigTxn can be issued by the asset manager to change the manager, reserve, freeze, or clawback
 * you must respecify existing addresses to keep them the same; leaving a field blank is the same as turning
 * that feature off for this asset
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param manager - string representation of new asset manager Algorand address
 * @param reserve - string representation of new reserve Algorand address
 * @param freeze - string representation of new freeze manager Algorand address
 * @param clawback - string representation of new revocation manager Algorand address
 * @param strictEmptyAddressChecking - boolean - throw an error if any of manager, reserve, freeze, or clawback are undefined. optional, defaults to true.
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetConfigTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                            assetIndex, manager, reserve, freeze, clawback, strictEmptyAddressChecking=true) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetConfigTxnWithSuggestedParams(from, note, assetIndex, manager, reserve, freeze, clawback, suggestedParams, strictEmptyAddressChecking);
}

/** makeAssetConfigTxnWithSuggestedParams can be issued by the asset manager to change the manager, reserve, freeze, or clawback
 * you must respecify existing addresses to keep them the same; leaving a field blank is the same as turning
 * that feature off for this asset
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param manager - string representation of new asset manager Algorand address
 * @param reserve - string representation of new reserve Algorand address
 * @param freeze - string representation of new freeze manager Algorand address
 * @param clawback - string representation of new revocation manager Algorand address
 * @param strictEmptyAddressChecking - boolean - throw an error if any of manager, reserve, freeze, or clawback are undefined. optional, defaults to true.
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @returns {Transaction}
 */
function makeAssetConfigTxnWithSuggestedParams(from, note, assetIndex,
                                      manager, reserve, freeze, clawback, suggestedParams, strictEmptyAddressChecking=true) {
    if (strictEmptyAddressChecking && ((manager === undefined) || (reserve === undefined) || (freeze === undefined) || (clawback === undefined))) {
        throw Error("strict empty address checking was turned on, but at least one empty address was provided");
    }
    let o = {
        "from": from,
        "suggestedParams": suggestedParams,
        "assetIndex": assetIndex,
        "assetManager": manager,
        "assetReserve": reserve,
        "assetFreeze": freeze,
        "assetClawback": clawback,
        "type": "acfg",
        "note": note
    };
    return new txnBuilder.Transaction(o);
}

/** makeAssetDestroyTxn will allow the asset's manager to remove this asset from the ledger, so long
 * as all outstanding assets are held by the creator.
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param assetIndex - int asset index uniquely specifying the asset
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetDestroyTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID, assetIndex) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetDestroyTxnWithSuggestedParams(from, note, assetIndex, suggestedParams);
}

/** makeAssetDestroyTxnWithSuggestedParams will allow the asset's manager to remove this asset from the ledger, so long
 * as all outstanding assets are held by the creator.
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @returns {Transaction}
 */
function makeAssetDestroyTxnWithSuggestedParams(from, note, assetIndex, suggestedParams) {
    let o = {
        "from": from,
        "suggestedParams": suggestedParams,
        "assetIndex": assetIndex,
        "type": "acfg",
        "note": note
    };
    return new txnBuilder.Transaction(o);
}

/** makeAssetFreezeTxn will allow the asset's freeze manager to freeze or un-freeze an account,
 * blocking or allowing asset transfers to and from the targeted account.
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param freezeTarget - string representation of Algorand address being frozen or unfrozen
 * @param freezeState - true if freezeTarget should be frozen, false if freezeTarget should be allowed to transact
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetFreezeTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                            assetIndex, freezeTarget, freezeState) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetFreezeTxnWithSuggestedParams(from, note, assetIndex, freezeTarget, freezeState, suggestedParams);
}

/** makeAssetFreezeTxnWithSuggestedParams will allow the asset's freeze manager to freeze or un-freeze an account,
 * blocking or allowing asset transfers to and from the targeted account.
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param freezeTarget - string representation of Algorand address being frozen or unfrozen
 * @param freezeState - true if freezeTarget should be frozen, false if freezeTarget should be allowed to transact
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @returns {Transaction}
 */
function makeAssetFreezeTxnWithSuggestedParams(from, note, assetIndex, freezeTarget, freezeState, suggestedParams) {
    let o = {
        "from": from,
        "type": "afrz",
        "freezeAccount": freezeTarget,
        "assetIndex": assetIndex,
        "freezeState" : freezeState,
        "note": note,
        "suggestedParams": suggestedParams
    };
    return new txnBuilder.Transaction(o);
}


/** makeAssetTransferTxn allows for the creation of an asset transfer transaction.
 * Special case: to begin accepting assets, set amount=0 and from=to.
 *
 * @param from - string representation of Algorand address of sender
 * @param to - string representation of Algorand address of asset recipient
 * @param closeRemainderTo - optional - string representation of Algorand address - if provided,
 * send all remaining assets after transfer to the "closeRemainderTo" address and close "from"'s asset holdings
 * @param revocationTarget - optional - string representation of Algorand address - if provided,
 * and if "from" is the asset's revocation manager, then deduct from "revocationTarget" rather than "from"
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 * @param amount - integer amount of assets to send
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param assetIndex - int asset index uniquely specifying the asset
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetTransferTxn(from, to, closeRemainderTo, revocationTarget,
                              fee, amount, firstRound, lastRound, note, genesisHash, genesisID, assetIndex) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetTransferTxnWithSuggestedParams(from, to, closeRemainderTo, revocationTarget, amount, note, assetIndex, suggestedParams);
}

/** makeAssetTransferTxnWithSuggestedParams allows for the creation of an asset transfer transaction.
 * Special case: to begin accepting assets, set amount=0 and from=to.
 *
 * @param from - string representation of Algorand address of sender
 * @param to - string representation of Algorand address of asset recipient
 * @param closeRemainderTo - optional - string representation of Algorand address - if provided,
 * send all remaining assets after transfer to the "closeRemainderTo" address and close "from"'s asset holdings
 * @param revocationTarget - optional - string representation of Algorand address - if provided,
 * and if "from" is the asset's revocation manager, then deduct from "revocationTarget" rather than "from"
 * @param amount - integer amount of assets to send
 * @param note - uint8array of arbitrary data for sender to store
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @returns {Transaction}
 */
function makeAssetTransferTxnWithSuggestedParams(from, to, closeRemainderTo, revocationTarget,
                              amount, note, assetIndex, suggestedParams) {
    let o = {
        "type": "axfer",
        "from": from,
        "to": to,
        "amount": amount,
        "suggestedParams": suggestedParams,
        "assetIndex": assetIndex,
        "note": note,
        "assetRevocationTarget": revocationTarget,
        "closeRemainderTo": closeRemainderTo
    };
    return new txnBuilder.Transaction(o);
}

/*
 * Enums for application transactions on-transaction-complete behavior
 */
let OnApplicationComplete = {
    // NoOpOC indicates that an application transaction will simply call its
    // ApprovalProgram
    NoOpOC : 0,
    // OptInOC indicates that an application transaction will allocate some
    // LocalState for the application in the sender's account
    OptInOC : 1,
    // CloseOutOC indicates that an application transaction will deallocate
    // some LocalState for the application from the user's account
    CloseOutOC : 2,
    // ClearStateOC is similar to CloseOutOC, but may never fail. This
    // allows users to reclaim their minimum balance from an application
    // they no longer wish to opt in to.
    ClearStateOC : 3,
    // UpdateApplicationOC indicates that an application transaction will
    // update the ApprovalProgram and ClearStateProgram for the application
    UpdateApplicationOC : 4,
    // DeleteApplicationOC indicates that an application transaction will
    // delete the AppParams for the application from the creator's balance
    // record
    DeleteApplicationOC : 5
}

/**
 * Make a transaction that will create an application.
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param onComplete - algosdk.OnApplicationComplete, what application should do once the program is done being run
 * @param approvalProgram - Uint8Array, the compiled TEAL that approves a transaction
 * @param clearProgram - Uint8Array, the compiled TEAL that runs when clearing state
 * @param numLocalInts - restricts number of ints in per-user local state
 * @param numLocalByteSlices - restricts number of byte slices in per-user local state
 * @param numGlobalInts - restricts number of ints in global state
 * @param numGlobalByteSlices - restricts number of byte slices in global state
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationCreateTxn(from, suggestedParams, onComplete, approvalProgram, clearProgram,
                                  numLocalInts, numLocalByteSlices, numGlobalInts, numGlobalByteSlices,
                                  appArgs= undefined, accounts= undefined, foreignApps= undefined,
                                  note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": 0,
        "appOnComplete": onComplete,
        "appLocalInts": numLocalInts,
        "appLocalByteSlices": numLocalByteSlices,
        "appGlobalInts": numGlobalInts,
        "appGlobalByteSlices": numGlobalByteSlices,
        "appApprovalProgram": approvalProgram,
        "appClearProgram": clearProgram,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}


/**
 * Make a transaction that changes an application's approval and clear programs
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to be updated
 * @param approvalProgram - Uint8Array, the compiled TEAL that approves a transaction
 * @param clearProgram - Uint8Array, the compiled TEAL that runs when clearing state
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationUpdateTxn(from, suggestedParams, appIndex, approvalProgram, clearProgram,
                                  appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                  note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appApprovalProgram": approvalProgram,
        "appOnComplete": OnApplicationComplete.UpdateApplicationOC,
        "appClearProgram": clearProgram,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

/**
 * Make a transaction that deletes an application
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to be deleted
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationDeleteTxn(from, suggestedParams, appIndex,
                                  appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                  note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.DeleteApplicationOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

/**
 * Make a transaction that opts in to use an application
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to join
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationOptInTxn(from, suggestedParams, appIndex,
                                 appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                 note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.OptInOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

/**
 * Make a transaction that closes out a user's state in an application
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to use
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationCloseOutTxn(from, suggestedParams, appIndex,
                                    appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                    note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.CloseOutOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

/**
 * Make a transaction that clears a user's state in an application
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to use
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationClearStateTxn(from, suggestedParams, appIndex,
                                      appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                      note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.ClearStateOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

/**
 * Make a transaction that just calls an application, doing nothing on completion
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to use
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationNoOpTxn(from, suggestedParams, appIndex,
                                appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.NoOpOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

module.exports = {
    isValidAddress,
    generateAccount,
    secretKeyToMnemonic,
    mnemonicToSecretKey,
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
    mnemonicToMasterDerivationKey,
    masterDerivationKeyToMnemonic,
    appendSignMultisigTransaction,
    mergeMultisigTransactions,
    signMultisigTransaction,
    multisigAddress,
    ERROR_MULTISIG_BAD_SENDER,
    ERROR_INVALID_MICROALGOS,
    microalgosToAlgos,
    algosToMicroalgos,
    computeGroupID,
    assignGroupID,
    makeLogicSig,
    signLogicSigTransaction,
    signLogicSigTransactionObject,
    logicSigFromByte,
    tealSign,
    tealSignFromProgram,
    makePaymentTxn,
    makeKeyRegistrationTxn,
    makeAssetCreateTxn,
    makeAssetConfigTxn,
    makeAssetDestroyTxn,
    makeAssetFreezeTxn,
    makeAssetTransferTxn,
    makePaymentTxnWithSuggestedParams,
    makeKeyRegistrationTxnWithSuggestedParams,
    makeAssetCreateTxnWithSuggestedParams,
    makeAssetConfigTxnWithSuggestedParams,
    makeAssetDestroyTxnWithSuggestedParams,
    makeAssetFreezeTxnWithSuggestedParams,
    makeAssetTransferTxnWithSuggestedParams,
    OnApplicationComplete,
    makeApplicationCreateTxn,
    makeApplicationUpdateTxn,
    makeApplicationDeleteTxn,
    makeApplicationOptInTxn,
    makeApplicationCloseOutTxn,
    makeApplicationClearStateTxn,
    makeApplicationNoOpTxn
};