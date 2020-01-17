const templates = require('./templates');
const transaction = require('../transaction');
const logicSig = require('../logicsig');
const algosdk = require('../main');
const nacl = require('../nacl/naclWrappers');
const address = require('../encoding/address');
const encoding = require('../encoding/encoding');

class DynamicFee {
    zeroAddress = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    /**
     * DynamicFee contract allows you to create a transaction without
     * specifying the fee. The fee will be determined at the moment of
     * transfer.
     *
     * Constructor Parameters:
     * @param {string} receiver: address to receive the assets
     * @param {int} amount: amount of assets to transfer
     * @param {int} firstValid: first valid round for the transaction
     * @param {int} lastValid:  last valid round for the transaction
     * @param {string} closeRemainder: if you would like to close the account after the transfer, specify the address that would recieve the remainder, else leave undefined
     * @param {string} lease: leave undefined to generate a random lease, or supply a lease as base64
     * @returns {DynamicFee}
     */
    constructor(receiver, amount, firstValid, lastValid, closeRemainder, lease) {
        // don't need to validate receiver, closeremainderto - insert will handle that
        if (!Number.isSafeInteger(amount) || amount < 0) throw Error("amount must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(firstValid) || firstValid < 0) throw Error("firstValid must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(lastValid) || lastValid < 0) throw Error("lastValid must be a positive number and smaller than 2^53-1");

        if (closeRemainder === undefined) {
            closeRemainder = this.zeroAddress
        }
        if (lease === undefined) {
            let leaseBytes = nacl.randomBytes(32);
            lease = Buffer.from(leaseBytes).toString('base64');
        }

        const referenceProgramB64 = "ASAFAgEHBgUmAyD+vKC7FEpaTqe0OKRoGsgObKEFvLYH/FZTJclWlfaiEyDmmpYeby1feshmB5JlUr6YI17TM2PKiJGLuck4qRW2+SB/g7Flf/H8U7ktwYFIodZd/C1LH6PWdyhK3dIAEm2QaTIEIhIzABAjEhAzAAcxABIQMwAIMQESEDEWIxIQMRAjEhAxBygSEDEJKRIQMQgkEhAxAiUSEDEEIQQSEDEGKhIQ";
        let referenceProgramBytes = Buffer.from(referenceProgramB64, 'base64');
        let referenceOffsets = [ /*amount*/ 5 /*firstValid*/, 6 /*lastValid*/, 7 /*receiver*/, 11 /*closeRemainder*/, 44 /*lease*/, 76];
        let injectionVector =  [amount, firstValid, lastValid, receiver, closeRemainder, lease];
        let injectionTypes = [templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT,
            templates.valTypes.ADDRESS, templates.valTypes.ADDRESS, templates.valTypes.BASE64];
        let injectedBytes = templates.inject(referenceProgramBytes, referenceOffsets, injectionVector, injectionTypes);
        this.programBytes = injectedBytes;
        let lsig = new logicSig.LogicSig(injectedBytes, undefined);
        this.address = lsig.address();
        this.receiver = receiver;
        this.amount = amount;
        this.closeRemainder = closeRemainder;
        this.firstValid = firstValid;
        this.lastValid = lastValid;
        this.lease = lease;
    }

    /**
     * returns the program bytes
     * @returns {Uint8Array}
     */
    getProgram() {
        return this.programBytes;
    }

    /**
     * returns the string address of the contract
     * @returns {string}
     */
    getAddress() {
        return this.address;
    }

    /**
     * signDynamicFee returns the main transaction and signed logic needed to complete the transfer.
     * These should be sent to the fee payer, who can use GetDynamicFeeTransactions
     * @param {Uint8Array} secretKey: the secret key for building the logic sig
     * @param {string} genesisHash: the genesisHash to use for the txn
     * @returns {Object} object containing json of txnbuilder constructor arguments under "txn" and signed logicsig under "lsig"
     */
    signDynamicFee(secretKey, genesisHash) {
        let keys = nacl.keyPairFromSecretKey(secretKey);
        let from = address.encode(keys.publicKey);
        let to = this.receiver;
        let fee = 0;
        let amount = this.amount;
        let closeRemainderTo = this.closeRemainder;
        let firstRound = this.firstValid;
        let lastRound = this.lastValid;
        let lease = this.lease;
        let txn = {
            "from": from,
            "to": to,
            "fee": fee,
            "amount": amount,
            "closeRemainderTo": closeRemainderTo,
            "firstRound": firstRound,
            "lastRound": lastRound,
            "genesisHash": genesisHash,
            "type": "pay",
            "lease": lease
        };

        let lsig = new logicSig.LogicSig(new Uint8Array(this.programBytes), undefined);
        lsig.sign(secretKey);
        return {"txn": txn, "lsig": lsig};
    }
}

/**
 * getDynamicFeeTransactions creates and signs the secondary dynamic fee transaction, updates
 * transaction fields, and signs as the fee payer; it returns both
 * transactions as bytes suitable for sendRaw.
 * Parameters:
 * @param {dict} txn - main transaction from payer's signDynamicFee output (a dict of constructor arguments, NOT a transaction.Transaction)
 * @param {LogicSig} lsig - the signed logic received from the payer's signDynamicFee output
 * @param {Uint8Array} privateKey - the private key for the account that pays the fee
 * @param {int} fee - fee per byte for both transactions
 * @param {int} firstValid - first protocol round on which both transactions will be valid
 * @param {int} lastValid - last protocol round on which both transactions will be valid
 *
 * @throws on invalid lsig
 */
function getDynamicFeeTransactions (txn, lsig, privateKey, fee, firstValid, lastValid) {
    if (!lsig.verify(address.decode(txn.from).publicKey)) {
        throw new Error("invalid signature");
    }

    txn.firstRound = firstValid;
    txn.lastRound = lastValid;
    txn.fee = fee;
    if (txn.fee < transaction.ALGORAND_MIN_TX_FEE) {
        txn.fee = transaction.ALGORAND_MIN_TX_FEE
    }

    let keys = nacl.keyPairFromSecretKey(privateKey);
    let from = address.encode(keys.publicKey);

    // must remove lease and re-add using addLease so that fee calculation will match other SDKs
    let lease = txn.lease;
    delete txn.lease;

    let txnObj = new transaction.Transaction(txn);
    txnObj.addLease(lease, fee);

    let feePayTxn = {
        "from": from,
        "to": txn.from,
        "fee": fee,
        "amount": txnObj.fee, // calculated after txnObj is built to have the correct fee
        "firstRound": firstValid,
        "lastRound": lastValid,
        "genesisHash": txn.genesisHash,
        "type": "pay"
    };
    let feePayTxnObj = new transaction.Transaction(feePayTxn);
    feePayTxnObj.addLease(lease, fee);

    let txnGroup = algosdk.assignGroupID([txnObj, feePayTxnObj], undefined);
    let txnObjWithGroup = txnGroup[0];
    let feePayTxnWithGroup = txnGroup[1];

    let lstx = {
        lsig: lsig.get_obj_for_encoding(),
        txn: txnObjWithGroup.get_obj_for_encoding()
    };

    let stx1 = encoding.encode(lstx);
    let stx2 = feePayTxnWithGroup.signTxn(privateKey);

    let concatStx = new Uint8Array(stx1.length + stx2.length);
    concatStx.set(stx1);
    concatStx.set(stx2, stx1.length);

    return concatStx
}

module.exports = {
    DynamicFee,
    getDynamicFeeTransactions
};
