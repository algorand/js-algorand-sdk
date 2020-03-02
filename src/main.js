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

let Algod = algod.Algod;
let Kmd = kmd.Kmd;

const SIGN_BYTES_PREFIX = Buffer.from([77, 88]); // "MX"
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
 * Payment transaction fields: to, amount, fee, firstRound, lastRound, genesisHash,
 * note(optional), GenesisID(optional), closeRemainderTo(optional)
 * 
 * Key registration fields: fee, firstRound, lastRound, voteKey, selectionKey, voteFirst,
 * voteLast, voteKeyDilution, genesisHash, note(optional), GenesisID(optional)
 * @param txn object with either payment or key registration fields
 * @param sk Algorand Secret Key
 * @returns object contains the binary signed transaction and its txID
 */
function signTransaction(txn, sk) {
    // Get pk from sk
    let key = nacl.keyPairFromSecretKey(sk);
    txn.from = address.encode(key.publicKey);
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
 * @param {Object} txn transaction object
 * @param {LogicSig} lsig logicsig object
 * @returns {Object} Object containing txID and blob representing signed transaction.
 * @throws error on failure
 */
function signLogicSigTransaction(txn, lsig) {
    if (!lsig.verify(address.decode(txn.from).publicKey)) {
        throw new Error("invalid signature");
    }

    let algoTxn = new txnBuilder.Transaction(txn);

    let lstx = {
        lsig: lsig.get_obj_for_encoding(),
        txn: algoTxn.get_obj_for_encoding()
    };

    return {
        "txID": algoTxn.txID().toString(),
        "blob": encoding.encode(lstx)
    };
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
 * @returns {Transaction}
 */
function makePaymentTxn(from, to, fee, amount, closeRemainderTo, firstRound, lastRound, note, genesisHash, genesisID) {
    let o = {
        "from": from,
        "to": to,
        "fee": fee,
        "amount": amount,
        "closeRemainderTo": closeRemainderTo,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "note": note,
        "genesisHash": genesisHash,
        "genesisID": genesisID,
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
 * @returns {Transaction}
 */
function makeKeyRegistrationTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                                voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution) {
    let o = {
        "from": from,
        "fee": fee,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "note": note,
        "genesisHash": genesisHash,
        "voteKey": voteKey,
        "selectionKey": selectionKey,
        "voteFirst": voteFirst,
        "voteLast": voteLast,
        "voteKeyDilution": voteKeyDilution,
        "genesisID": genesisID,
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
 * @returns {Transaction}
 */
function makeAssetCreateTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                            total, decimals, defaultFrozen, manager, reserve, freeze,
                            clawback, unitName, assetName, assetURL, assetMetadataHash) {
    let o = {
        "from": from,
        "fee": fee,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "note": note,
        "genesisHash": genesisHash,
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
        "genesisID": genesisID,
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
 * @returns {Transaction}
 */
function makeAssetConfigTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                            assetIndex, manager, reserve, freeze, clawback, strictEmptyAddressChecking=true) {
    if (strictEmptyAddressChecking && ((manager === undefined) || (reserve === undefined) || (freeze === undefined) || (clawback === undefined))) {
        throw Error("strict empty address checking was turned on, but at least one empty address was provided");
    }
    let o = {
        "from": from,
        "fee": fee,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "genesisHash": genesisHash,
        "genesisID": genesisID,
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
 * @returns {Transaction}
 */
function makeAssetDestroyTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID, assetIndex) {
    let o = {
        "from": from,
        "fee": fee,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "genesisHash": genesisHash,
        "genesisID": genesisID,
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
 * @returns {Transaction}
 */
function makeAssetFreezeTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                            assetIndex, freezeTarget, freezeState) {
    let o = {
        "from": from,
        "fee": fee,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "genesisHash": genesisHash,
        "type": "afrz",
        "freezeAccount": freezeTarget,
        "assetIndex": assetIndex,
        "freezeState" : freezeState,
        "note": note
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
 * @param lease - see makePaymentTxn
 * @returns {Transaction}
 */
function makeAssetTransferTxn(from, to, closeRemainderTo, revocationTarget,
                              fee, amount, firstRound, lastRound, note, genesisHash, genesisID, assetIndex) {
    let o = {
        "type": "axfer",
        "from": from,
        "to": to,
        "amount": amount,
        "fee": fee,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "assetIndex": assetIndex,
        "note": note,
        "assetRevocationTarget": revocationTarget,
        "closeRemainderTo": closeRemainderTo
    };
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
    makePaymentTxn,
    makeKeyRegistrationTxn,
    makeAssetCreateTxn,
    makeAssetConfigTxn,
    makeAssetDestroyTxn,
    makeAssetFreezeTxn,
    makeAssetTransferTxn,
};