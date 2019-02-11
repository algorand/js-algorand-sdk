const nacl = require('./nacl/naclWrappers');
const address = require('./encoding/address');
const mnemonic = require('./mnemonic/mnemonic');
const txnBuilder = require('./transaction');
const bidBuilder = require('./bid');
const algod = require('./client/algod');

let Algod = algod.Algod;

// Errors
const ERROR_NOT_TRANSACTION_BUILDER = new Error("The transaction passed should be an Algorand transaction." +
    "Please use Transaction to construct one.");
const ERROR_NOT_BID_BUILDER = new Error("The bid passed should be an Algorand bid." +
    "Please use Bid to construct one.");

/**
 * GenerateAddress returns a new Algorand address and its corresponding secret key
 * @returns {{sk: Uint8Array, addr: string}}
 */
function generateAddress(){
    let keys = nacl.keyPair();
    let encodedPk = address.encode(keys.publicKey);
    return {addr: encodedPk, sk: keys.secretKey};
}

/**
 * isValidAddress takes an Algorand address and checks if valid.
 * @param addr Algorand address
 * @returns {boolean}n true if valid, false otherwise
 */
function isValidAddress(addr){
    return address.isValidAddress(addr);
}

/**
 * importMnemonic takes a mnemonic string and returns the corresponding Algorand address and its secret key.
 * @param mn 25 words Algorand mnemonic
 * @returns {{sk: Uint8Array, addr: string}}
 * @throws error if fails to decode the mnemonic
 */
function importMnemonic(mn) {
    let seed = mnemonic.seedFromMnemonic(mn);
    let keys = nacl.keyPairFromSeed(seed);
    let encodedPk = address.encode(keys.publicKey);
    return {addr: encodedPk, sk: keys.secretKey};
}

/**
 * exportMnemonic takes an Algorand secret key and returns the corresponding mnemonic.
 * @param sk Uint8Array
 * @returns string mnemonic
 */
function exportMnemonic(sk) {
    // get the seed from the sk
    let seed = sk.slice(0, nacl.SEED_BTYES_LENGTH);
    return mnemonic.mnemonicFromSeed(seed);
}

/**
 * signTransaction takes an object with the following fields: to, amount, fee, firstRound, lastRound,
 * and note(optional), and a secret key and returns a signed blob
 * @param txn object with the following fields -  to, amount, fee, firstRound, lastRound, and note(optional)
 * @param sk Algorand Secret Key
 * @returns object contains the binary signed transaction and it's txID
 */
function signTransaction(txn, sk){
    // Get pk from sk
    let key = nacl.keyPairFromSecretKey(sk);
    txn.from = address.encode(key.publicKey);
   let algoTxn = new txnBuilder.Transaction(txn);

   return {"txID": algoTxn.txID().toString(), "blob" : algoTxn.signTxn(sk)};
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

module.exports = {isValidAddress, generateAddress, importMnemonic, exportMnemonic, signTransaction, signBid, Algod};
module.exports.ERROR_NOT_TRANSACTION_BUILDER = ERROR_NOT_TRANSACTION_BUILDER;
module.exports.ERROR_NOT_BID_BUILDER = ERROR_NOT_BID_BUILDER;