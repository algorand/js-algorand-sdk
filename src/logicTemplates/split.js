const templates = require('./templates');
const algosdk = require('../main');
const logicSig = require('../logicsig');

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
        let lsig = new logicSig.LogicSig(injectedBytes, undefined);
        this.address = lsig.address();
        this.ratn = ratn;
        this.ratd = ratd;
        this.receiverOne = receiverOne;
        this.receiverTwo = receiverTwo;
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
     * returns a group transactions array which transfer funds according to the contract's ratio
     * @param {int} amount: the amount to be transferred
     * @param {int} firstRound: the first round on which the transaction group will be valid
     * @param {int} lastRound: the last round on which the transaction group will be valid
     * @param {int} fee: the fee to pay in microAlgos
     * @param {string} genesisHash: the b64-encoded genesis hash indicating the network for this transaction
     * @param {boolean} precise, optional, precise treats the case where amount is not perfectly divisible based on the ratio.
     *  When set to False, the amount will be divided as close as possible but one address will get
     *  slightly more. When True, an error will be raised.
     * @returns {Uint8Array}
     */
    getSendFundsTransaction(amount, firstRound, lastRound, fee, genesisHash, precise=true) {
        let amountForReceiverOne = 0;
        // reduce fractions
        var gcdFn = function(a, b) {
            if ((typeof a !== 'number') || (typeof b !== 'number')) throw "gcd operates only on positive integers";
            if (!b) {
                return a;
            }
            return gcdFn(b, a % b);
        };
        let gcd = gcdFn(this.ratn, this.ratd);
        let ratn = Math.floor(this.ratn / gcd);
        let ratd = Math.floor(this.ratd / gcd);
        if (amount % ratd === 0) {
            amountForReceiverOne = Math.floor(amount * ratn / ratd);
        } else if (precise) {
            throw Error("precise splitting requested but amount and contract ratio cannot be split precisely");
        } else {
            amountForReceiverOne = Math.round(amount * ratn / ratd);
        }
        let amountForReceiverTwo = amount - amountForReceiverOne;

        let from = this.address;

        let tx1 = algosdk.makePaymentTxn(from, this.receiverOne, fee, amountForReceiverOne, firstRound, lastRound, undefined, genesisHash, undefined);
        let tx2 = algosdk.makePaymentTxn(from, this.receiverTwo, fee, amountForReceiverTwo, firstRound, lastRound, undefined, genesisHash, undefined);

        let txns = [tx1, tx2];
        let txGroup = algosdk.assignGroupID(txns);

        let logicSig = algosdk.makeLogicSig(this.getProgram(), undefined); // no args
        let signedTxns = [];
        for (let idx in txGroup) {
            let stxn = algosdk.signLogicSigTransaction(txGroup[idx], logicSig);
            signedTxns.push(stxn)
        }
        return utils.concatArrays(signedTxns[0], signedTxns[1]);
    }
}

module.exports = {
    Split
};
