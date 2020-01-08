const templates = require('./templates');
const algosdk = require('../main');
const logicSig = require('../logicsig');
const logic = require('../logic/logic');
const nacl = require("../nacl/naclWrappers");
const address = require("../encoding/address");
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
        // don't need to validate receiver, it's validated by template insert
        if (!Number.isSafeInteger(amount) || amount < 0) throw Error("amount must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(withdrawalWindow) || withdrawalWindow < 0) throw Error("withdrawalWindow must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(period) || period < 0) throw Error("period must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(expiryRound) || expiryRound < 0) throw Error("expiryRound must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(maxFee) || maxFee < 0) throw Error("maxFee must be a positive number and smaller than 2^53-1");

        if (lease === undefined) {
            let leaseBytes = nacl.randomBytes(32);
            lease = Buffer.from(leaseBytes).toString('base64');
        }
        const referenceProgramB64 = "ASAHAQYFAAQDByYCIAECAwQFBgcIAQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIIJKvkYTkEzwJf2arzJOxERsSogG9nQzKPkpIoc4TzPTFMRAiEjEBIw4QMQIkGCUSEDEEIQQxAggSEDEGKBIQMQkyAxIxBykSEDEIIQUSEDEJKRIxBzIDEhAxAiEGDRAxCCUSEBEQ";
        let referenceProgramBytes = Buffer.from(referenceProgramB64, 'base64');
        let referenceOffsets = [ /*fee*/ 4 /*period*/, 5 /*withdrawWindow*/, 7 /*amount*/, 8 /*expiryRound*/, 9 /*lease*/, 12 /*receiver*/, 46];
        let injectionVector =  [maxFee, period, withdrawalWindow,
                                amount, expiryRound, lease,
                                receiver];
        let injectionTypes = [templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT,
                                templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.BASE64,
                                templates.valTypes.ADDRESS];
        let injectedBytes = templates.inject(referenceProgramBytes, referenceOffsets, injectionVector, injectionTypes);
        this.programBytes = injectedBytes;
        let lsig = new logicSig.LogicSig(injectedBytes, undefined);
        this.address = lsig.address();
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
     * getWithdrawalTransaction returns a signed transaction extracting funds form the contract
     * @param {Uint8Array} contract: the bytearray defining the contract, received from the payer
     * @param {int} firstValid: the first round on which the txn will be valid
     * @param {string} genesisHash: the hash representing the network for the txn
     * @returns {Object} Object containing txID and blob representing signed transaction
     * @throws error on failure
     */
    getWithdrawalTransaction(contract, firstValid, genesisHash) {
        let [ints, byteArrays, _] = logic.readProgram(contract, undefined);
        let fee = ints[1];
        let period = ints[2];
        let duration = ints[4];
        let amount = ints[5];
        if ((firstValid % period) !== 0) {
            throw new Error("firstValid round was not a multiple of contract period")
        }

        // extract receiver and convert as needed
        let receiverBytes = byteArrays[1];
        let receiver = address.encode(receiverBytes);
        // extract lease
        let lease = byteArrays[0];

        let lastValid = firstValid + duration;
        let to = receiver;
        let noCloseRemainder = undefined;
        let noNote = undefined;
        let lsig = algosdk.makeLogicSig(contract, undefined);
        let from = lsig.address();
        let txn = algosdk.makePaymentTxn(from, to, fee, amount, noCloseRemainder, firstValid, lastValid, noNote, genesisHash, "");
        txn.addLease(lease, fee);
        return algosdk.signLogicSigTransaction(txn, logicSig);
    }
}

module.exports = {
    PeriodicPayment
};
