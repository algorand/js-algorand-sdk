const { Buffer } = require('buffer');
const address = require("../encoding/address");
const makeTxn = require('../makeTxn');
const logic = require('../logic/logic');
const logicSig = require('../logicsig');
const nacl = require("../nacl/naclWrappers");
const templates = require('./templates');

class PeriodicPayment {
    /**
     * MakePeriodicPayment allows some account to execute periodic withdrawal of funds.
     * This is a contract account.
     *
     * This allows receiver to withdraw amount every
     * period rounds for withdrawWindow after every multiple
     * of period.
     *
     * After expiryRound, all remaining funds in the escrow
     * are available to receiver.
     *
     * Constructor Parameters:
     * @param {string} receiver: address which is authorized to receive withdrawals
     * @param {int} amount: the amount to send each period
     * @param {int} withdrawalWindow: the duration of a withdrawal period
     * @param {int} period: the time between a pair of withdrawal periods
     * @param {int} expiryRound: the round at which the account expires
     * @param {int} maxFee: maximum fee used by the withdrawal transaction
     * @param {string} lease: b64 representation of lease to use, or leave undefined to generate one
     * @returns {PeriodicPayment}
     */
    constructor(receiver, amount, withdrawalWindow, period, expiryRound, maxFee, lease) {
        // don't need to validate receiver or lease, it's validated by template insert
        this.receiver = receiver;
        if (!Number.isSafeInteger(amount) || amount < 0) throw Error("amount must be a positive number and smaller than 2^53-1");
        this.amount = amount;
        if (!Number.isSafeInteger(withdrawalWindow) || withdrawalWindow < 0) throw Error("withdrawalWindow must be a positive number and smaller than 2^53-1");
        this.withdrawalWindow = withdrawalWindow;
        if (!Number.isSafeInteger(period) || period < 0) throw Error("period must be a positive number and smaller than 2^53-1");
        this.period = period;
        if (!Number.isSafeInteger(expiryRound) || expiryRound < 0) throw Error("expiryRound must be a positive number and smaller than 2^53-1");
        this.expiryRound = expiryRound;
        if (!Number.isSafeInteger(maxFee) || maxFee < 0) throw Error("maxFee must be a positive number and smaller than 2^53-1");
        this.maxFee = maxFee;

        if (lease === undefined) {
            let leaseBytes = nacl.randomBytes(32);
            this.lease = Buffer.from(leaseBytes).toString('base64');
        } else {
            this.lease = lease
        }

        this.programBytes = this.getProgram();
        let lsig = new logicSig.LogicSig( this.programBytes, undefined);
        this.address = lsig.address();
    }

    /**
     * returns the program bytes
     * @returns {Uint8Array}
     */
    getProgram() {
        const referenceProgramB64 = "ASAHAQYFAAQDByYCIAECAwQFBgcIAQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIIJKvkYTkEzwJf2arzJOxERsSogG9nQzKPkpIoc4TzPTFMRAiEjEBIw4QMQIkGCUSEDEEIQQxAggSEDEGKBIQMQkyAxIxBykSEDEIIQUSEDEJKRIxBzIDEhAxAiEGDRAxCCUSEBEQ";
        let referenceProgramBytes = Buffer.from(referenceProgramB64, 'base64');
        let referenceOffsets = [ /*fee*/ 4 /*period*/, 5 /*withdrawWindow*/, 7 /*amount*/, 8 /*expiryRound*/, 9 /*lease*/, 12 /*receiver*/, 46];
        let injectionVector =  [this.maxFee, this.period, this.withdrawalWindow,
            this.amount, this.expiryRound, this.lease,
            this.receiver];
        let injectionTypes = [templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT,
            templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.BASE64,
            templates.valTypes.ADDRESS];
        return templates.inject(referenceProgramBytes, referenceOffsets, injectionVector, injectionTypes);
    }

    /**
     * returns the string address of the contract
     * @returns {string}
     */
    getAddress() {
        return this.address;
    }

}

/**
 * getPeriodicPaymentWithdrawalTransaction returns a signed transaction extracting funds form the contract
 * @param {Uint8Array} contract: the bytearray defining the contract, received from the payer
 * @param {int} fee: the fee per byte for the transaction
 * @param {int} firstValid: the first round on which the txn will be valid
 * @param {string} genesisHash: the hash representing the network for the txn
 * @returns {Object} Object containing txID and blob representing signed transaction
 * @throws error on failure
 */
function getPeriodicPaymentWithdrawalTransaction(contract, fee, firstValid, genesisHash) {
    let readResult = logic.readProgram(contract, undefined);
    let ints = readResult[0];
    let byteArrays = readResult[1];
    let period = ints[2];
    let duration = ints[4];
    let amount = ints[5];
    if ((firstValid % period) !== 0) {
        throw new Error("firstValid round " + firstValid.toString() + " was not a multiple of contract period " + period.toString())
    }

    // extract receiver and convert as needed
    let receiverBytes = byteArrays[1];
    let receiver = address.encodeAddress(receiverBytes);
    // extract lease and convert
    let leaseBuffer = byteArrays[0];
    let lease = new Uint8Array(leaseBuffer);
    let lastValid = firstValid + duration;
    let to = receiver;
    let noCloseRemainder = undefined;
    let noNote = undefined;
    let lsig = logicSig.makeLogicSig(contract, undefined);
    let from = lsig.address();
    let txn = {
        "from": from,
        "to": to,
        "fee": fee,
        "amount": amount,
        "closeRemainderTo": noCloseRemainder,
        "firstRound": firstValid,
        "lastRound": lastValid,
        "note": noNote,
        "genesisHash": genesisHash,
        "genesisID": "",
        "type": "pay",
        "lease": lease
    };

    // check fee
    let tempTxn = makeTxn.makePaymentTxn(from, to, fee, amount, noCloseRemainder, firstValid, lastValid, noNote, genesisHash, "");
    if (tempTxn.fee > ints[1]) {
        throw new Error("final fee of payment transaction" + tempTxn.fee.toString() + "greater than transaction max fee" + ints[1].toString())
    }

    return logicSig.signLogicSigTransaction(txn, lsig);
}
module.exports = {
    PeriodicPayment,
    getPeriodicPaymentWithdrawalTransaction
};
