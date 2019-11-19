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
     * @param {int} minPay: minimum amount to be paid out of the account
     * @param {int} expiryRound: the round at which the account expires
     * @param {int} maxFee: half of the maximum fee used by each split forwarding group transaction
     * @returns {Split}
     */
    constructor(owner, receiverOne, receiverTwo, ratn, ratd, expiryRound, minPay, maxFee) {

    }

    /**
     * returns the b64 string representation of the program bytes
     * @returns {string}
     */
     getProgram() {
        return this.program;
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
     * @param {Uint8Array} genesisHash: the genesis hash indicating the network for this transaction
     * @param {bool} precise, optional, precise treats the case where amount is not perfectly divisible based on the ratio.
     *  When set to False, the amount will be divided as close as possible but one address will get
     *  slightly more. When True, an error will be raised.
     * @returns {[transaction, transaction]}
     */
    getSendFundsTransaction(amount, precise=false) {
        return null;
    }
}

module.exports = {
    Split
};
