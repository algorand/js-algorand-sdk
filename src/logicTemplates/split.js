const address = require('../encoding/address');
const algosdk = require('../main');
const logic = require('../logic/logic');
const logicSig = require('../logicsig');
const templates = require('./templates');

class Split {
    /**
    * Split splits money sent to some account to two recipients at some ratio.
    * This is a contract account.
    *
    * This allows either a two-transaction group, for executing a
    * split, or single transaction, for closing the account.
    *
    * Withdrawals from this account are allowed as a group transaction which
    * sends receiverOne and receiverTwo amounts with exactly the ratio of
    * ratn/ratd.  At least minPay must be sent to receiverOne.
    * (CloseRemainderTo must be zero.)
    *
    * After expiryRound passes, all funds can be refunded to owner.
    * Constructor Parameters:
     * @param {string} owner: the address to refund funds to on timeout
     * @param {string} receiverOne: the first recipient in the split account
     * @param {string} receiverTwo: the second recipient in the split account
     * @param {int} ratn: fraction of money to be paid to the first recipient (numerator)
     * @param {int} ratd: fraction of money to be paid to the first recipient (denominator)
     * @param {int} expiryRound: the round at which the account expires
     * @param {int} minPay: minimum amount to be paid out of the account
     * @param {int} maxFee: half of the maximum fee used by each split forwarding group transaction
     * @returns {Split}
     */
    constructor(owner, receiverOne, receiverTwo, ratn, ratd, expiryRound, minPay, maxFee) {
        // don't need to validate owner, receiverone, receivertwo - they'll be validated by template.insert
        if (!Number.isSafeInteger(ratn) || ratn < 0) throw Error("ratn must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(ratd) || ratd < 0) throw Error("ratd must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(expiryRound) || expiryRound < 0) throw Error("expiryRound must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(minPay) || minPay < 0) throw Error("minPay must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(maxFee) || maxFee < 0) throw Error("maxFee must be a positive number and smaller than 2^53-1");

        const referenceProgramB64 = "ASAIAQUCAAYHCAkmAyCztwQn0+DycN+vsk+vJWcsoz/b7NDS6i33HOkvTpf+YiC3qUpIgHGWE8/1LPh9SGCalSN7IaITeeWSXbfsS5wsXyC4kBQ38Z8zcwWVAym4S8vpFB/c0XC6R4mnPi9EBADsPDEQIhIxASMMEDIEJBJAABkxCSgSMQcyAxIQMQglEhAxAiEEDRAiQAAuMwAAMwEAEjEJMgMSEDMABykSEDMBByoSEDMACCEFCzMBCCEGCxIQMwAIIQcPEBA=";
        let referenceProgramBytes = Buffer.from(referenceProgramB64, 'base64');
        let referenceOffsets = [ /*fee*/ 4 /*timeout*/, 7 /*ratn*/, 8 /*ratd*/, 9 /*minPay*/, 10 /*owner*/, 14 /*receiver1*/, 47 /*receiver2*/, 80];
        let injectionVector =  [maxFee, expiryRound, ratn, ratd, minPay, owner, receiverOne, receiverTwo];
        let injectionTypes = [templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.ADDRESS, templates.valTypes.ADDRESS, templates.valTypes.ADDRESS];
        let injectedBytes = templates.inject(referenceProgramBytes, referenceOffsets, injectionVector, injectionTypes);
        this.programBytes = injectedBytes;
        let lsig = algosdk.makeLogicSig(injectedBytes, undefined);
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

}
/**
 * returns a group transactions array which transfer funds according to the contract's ratio
 * @param {Uint8Array} contract: bytes representing the contract in question
 * @param {int} amount: the amount to be transferred
 * @param {int} firstRound: the first round on which the transaction group will be valid
 * @param {int} lastRound: the last round on which the transaction group will be valid
 * @param {int} fee: the fee to pay in microAlgos
 * @param {string} genesisHash: the b64-encoded genesis hash indicating the network for this transaction
 * @returns {Uint8Array}
 */
function getSplitFundsTransaction(contract, amount, firstRound, lastRound, fee, genesisHash) {
    let programOutputs = logic.readProgram(contract, undefined);
    let ints = programOutputs[0];
    let byteArrays = programOutputs[1];
    let ratn = ints[6];
    let ratd = ints[5];
    let amountForReceiverOne = 0;
    // reduce fractions
    let gcdFn = function(a, b) {
        if ((typeof a !== 'number') || (typeof b !== 'number')) throw "gcd operates only on positive integers";
        if (!b) {
            return a;
        }
        return gcdFn(b, a % b);
    };
    let gcd = gcdFn(ratn, ratd);
    ratn = Math.floor(ratn / gcd);
    ratd = Math.floor(ratd / gcd);
    let ratio = ratd / ratn;
    amountForReceiverOne = Math.floor(amount / (1 + ratio));
    let amountForReceiverTwo = amount - amountForReceiverOne;
    if ((ratd*amountForReceiverOne) != (ratn*amountForReceiverTwo)) {
        throw Error("could not split funds in a way that satisfied the contract ratio");
    }

    let logicSig = algosdk.makeLogicSig(contract, undefined); // no args
    let from = lsig.address();
    let receiverOne = address.encode(byteArrays[1]);
    let receiverTwo = address.encode(byteArrays[2]);
    let tx1 = algosdk.makePaymentTxn(from, receiverOne, fee, amountForReceiverOne, firstRound, lastRound, undefined, genesisHash, undefined);
    let tx2 = algosdk.makePaymentTxn(from, receiverTwo, fee, amountForReceiverTwo, firstRound, lastRound, undefined, genesisHash, undefined);

    let txns = [tx1, tx2];
    let txGroup = algosdk.assignGroupID(txns);

    let signedTxns = [];
    for (let idx in txGroup) {
        let stxn = algosdk.signLogicSigTransaction(txGroup[idx], logicSig);
        signedTxns.push(stxn)
    }
    return utils.concatArrays(signedTxns[0], signedTxns[1]);
}

module.exports = {
    Split,
    getSplitFundsTransaction
};
