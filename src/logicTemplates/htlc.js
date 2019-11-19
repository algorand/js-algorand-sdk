class HTLC {
    /**
     * MakeHTLC allows a user to recieve the Algo prior to a deadline (in terms of a round) by proving a knowledge
     * of a special value or to forfeit the ability to claim, returing it to the payer.
     * This contract is usually used to perform cross-chained atomic swaps
     *
     * More formally -
     * Algos can be transferred under only two circumstances:
     * 1. To owner if hash_function(arg_0) = hash_value
     * 2. To owner if txn.FirstValid > expiry_round
     * ...
     *
     *Parameters
     *----------
     * @param {string} owner: an address that can receive the asset after the expiry round
     * @param {string} receiver: address to receive Algos
     * @param {string} hashFunction: the hash function to be used (must be either sha256 or keccak256)
     * @param {string} hashImage: the hash image in base64
     * @param {int} expiryRound: the round on which the assets can be transferred back to owner
     * @param {int} maxFee: the maximum fee that can be paid to the network by the account
     * @returns {HTLC}
     */
    constructor(owner, receiver, hashFunction, hashImage, expiryRound, maxFee) {

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
}

module.exports = {
    HTLC
};
