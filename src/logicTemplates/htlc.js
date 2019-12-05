const templates = require('./templates');
const logicSig = require('../logicsig');

class HTLC {
    /**
     * MakeHTLC allows a user to recieve the Algo prior to a deadline (in terms of a round) by proving a knowledge
     * of a special value or to forfeit the ability to claim, returing it to the payer.
     * This contract is usually used to perform cross-chained atomic swaps
     *
     * More formally -
     * Algos can be transferred under only two circumstances:
     * 1. To receiver if hash_function(arg_0) = hash_value
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
        // don't need to validate owner, receiver - they'll be validated by template.insert
        if (!Number.isSafeInteger(expiryRound) || expiryRound < 0) throw Error("expiryRound must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(maxFee) || maxFee < 0) throw Error("maxFee must be a positive number and smaller than 2^53-1");

        let referenceProgramB64 = "";
        if (hashFunction === "sha256") {
            referenceProgramB64 = "ASAECAEACSYDIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5IH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITMQEiDjEQIxIQMQcyAxIQMQgkEhAxCSgSLQEpEhAxCSoSMQIlDRAREA==";
        } else if (hashFunction === "keccak256") {
            referenceProgramB64 = "ASAECAEACSYDIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5IH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITMQEiDjEQIxIQMQcyAxIQMQgkEhAxCSgSLQIpEhAxCSoSMQIlDRAREA==";
        } else {
            throw Error("hash function unrecognized");
        }
        // validate hashImage length
        let hashImageBytes = Buffer.from(hashImage, 'base64');
        if (hashImageBytes.length !== 32) throw Error("hash image must be 32 bytes");

        let referenceProgramBytes = Buffer.from(referenceProgramB64, 'base64');
        let referenceOffsets = [ /*fee*/ 3 /*expiryRound*/, 6 /*receiver*/, 10 /*hashImage*/, 42 /*owner*/, 76];
        let injectionVector =  [maxFee, expiryRound, receiver, hashImage, owner];
        let injectionTypes = [templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.ADDRESS, templates.valTypes.BASE64, templates.valTypes.ADDRESS];
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
}

module.exports = {
    HTLC
};
