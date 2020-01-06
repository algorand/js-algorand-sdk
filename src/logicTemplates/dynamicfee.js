const templates = require('./templates');
const transaction = require('../transaction');
const logicSig = require('../logicsig');
const algosdk = require('../main');
const nacl = require('../nacl/naclWrappers');

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
     * @returns {Object} object containing result of transaction building under key "txn" and result of logic sign sign under "lsig"
     */
    signDynamicFee(secretKey, genesisHash) {
        let from = somehowFromSecretKey;
        let to = this.receiver;
        let fee = 0;
        let amount = this.amount;
        let closeRemainderTo = this.closeRemainder;
        let firstRound = this.firstRound;
        let lastRound = this.lastRound;
        let note = undefined;
        let genesisID = undefined;
        let lease = this.lease;
        let txn = transaction.Transaction({
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
            "type": "pay",
            "lease": lease
        });

        let lsig = new logicSig.LogicSig(this.programBytes, undefined);
        let noMsig = undefined;
        return {"txn": txn, "lsig": lsig.sign(secretKey, noMsig)};
    }
}

/**
 * GetDynamicFeeTransactions creates and signs the secondary dynamic fee transaction, updates
 * transaction fields, and signs as the fee payer; it returns both
 * transactions as bytes suitable for sendRaw.
 * Parameters:
 * @param {Transaction} txn - main transaction from payer
 * @param {LogicSig} lsig - the signed logic received from the payer
 * @param {Uint8Array} privateKey - the private key for the account that pays the fee
 * @param {int} fee - fee per byte for both transactions
 * @param {int} firstValid - first protocol round on which both transactions will be valid
 * @param {int} lastValid - last protocol round on which both transactions will be valid
 *
 */
function getDynamicFeeTransactions (txn, lsig, privateKey, fee, firstValid, lastValid) {
    txn.firstRound = firstValid;
    txn.lastRound = lastValid;
    txn.fee = fee;
    txn.fee *= txn.estimateSize();
    if (txn.fee < transaction.ALGORAND_MIN_TX_FEE) {
        txn.fee = transaction.ALGORAND_MIN_TX_FEE
    }

    let keys = nacl.keyPairFromSecretKey(privateKey);
    let address = address.encode(keys.publicKey);

    let feePayTxn = transaction.Transaction({
        "from": address,
        "to": address.encode(txn.from),
        "fee": fee,
        "amount": 0,
        "closeRemainderTo": undefined,
        "firstRound": firstValid,
        "lastRound": lastValid,
        "note": undefined,
        "genesisHash": Buffer.from(txn.genesisHash).toString('base64'),
        "genesisID": txn.genesisID,
        "type": "pay",
        "lease": txn.lease
    });

    let txnGroup = algosdk.assignGroupID([txn, feePayTxn], undefined);

    let stx1 = algosdk.signLogicSigTransaction(txnGroup[0], lsig).blob;

    let stx2 = feePayTxn.signTxn(privateKey);

    return [stx1, stx2]
}

module.exports = {
    DynamicFee,
    getDynamicFeeTransactions
};
