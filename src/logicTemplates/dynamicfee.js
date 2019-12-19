const templates = require('./templates');
const algosdk = require('../main');
const logicSig = require('../logicsig');

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
    DynamicFee
};
