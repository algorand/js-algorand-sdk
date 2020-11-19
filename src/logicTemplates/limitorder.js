const { Buffer } = require('buffer');
const address = require('../encoding/address');
const makeTxn = require('../makeTxn');
const group = require('../group');
const logic = require('../logic/logic');
const logicSig = require('../logicsig');
const nacl = require('../nacl/naclWrappers');
const templates = require('./templates');
const utils = require('../utils/utils');

class LimitOrder {
    /**
     * MakeLimitOrder allows a user to exchange some number of assets for some number of algos.
     * Fund the contract with some number of Algos to limit the maximum number of
     * Algos you're willing to trade for some other asset.
     *
     * Works on two cases:
     * * trading Algos for some other asset
     * * closing out Algos back to the originator after a timeout
     *
     * trade case, a 2 transaction group:
     * gtxn[0] (this txn) Algos from Me to Other
     * gtxn[1] asset from Other to Me
     *
     * We want to get _at least_ some amount of the other asset per our Algos
     * gtxn[1].AssetAmount / gtxn[0].Amount >= N / D
     * ===
     * gtxn[1].AssetAmount * D >= gtxn[0].Amount * N
     *
     * close-out case:
     * txn alone, close out value after timeout
     * Constructor Parameters:
     * @param {string} owner: the address to refund funds to on timeout
     * @param {int} assetid: the ID of the transferred asset
     * @param {int} ratn: exchange rate (N asset per D Algos, or better)
     * @param {int} ratd: exchange rate (N asset per D Algos, or better)
     * @param {int} expiryRound: the round at which the account expires
     * @param {int} minTrade: the minimum amount (of Algos) to be traded away
     * @param {int} maxFee: maximum fee used by the limit order transaction
     * @returns {LimitOrder}
     */
    constructor(owner, assetid, ratn, ratd, expiryRound, minTrade, maxFee) {
        // don't need to validate owner - it will be validated by template.insert
        if (!Number.isSafeInteger(assetid) || assetid < 0) throw Error("assetid must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(ratn) || ratn < 0) throw Error("ratn must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(ratd) || ratd < 0) throw Error("ratd must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(expiryRound) || expiryRound < 0) throw Error("expiryRound must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(minTrade) || minTrade < 0) throw Error("minTrade must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(maxFee) || maxFee < 0) throw Error("maxFee must be a positive number and smaller than 2^53-1");

        const referenceProgramB64 = "ASAKAAEFAgYEBwgJCiYBIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITMRYiEjEQIxIQMQEkDhAyBCMSQABVMgQlEjEIIQQNEDEJMgMSEDMBECEFEhAzAREhBhIQMwEUKBIQMwETMgMSEDMBEiEHHTUCNQExCCEIHTUENQM0ATQDDUAAJDQBNAMSNAI0BA8QQAAWADEJKBIxAiEJDRAxBzIDEhAxCCISEBA=";
        let referenceProgramBytes = Buffer.from(referenceProgramB64, "base64");
        let referenceOffsets = [ /*maxFee*/ 5 /*minTrade*/, 7 /*assetID*/, 9 /*ratd*/, 10 /*ratn*/, 11 /*expiryRound*/, 12 /*owner*/, 16];
        let injectionVector =  [maxFee, minTrade, assetid, ratd, ratn, expiryRound, owner];
        let injectionTypes = [templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.INT, templates.valTypes.ADDRESS];
        let injectedBytes = templates.inject(referenceProgramBytes, referenceOffsets, injectionVector, injectionTypes);
        this.programBytes = injectedBytes;
        let lsig = new logicSig.LogicSig(injectedBytes, undefined);
        this.address = lsig.address();
        this.owner = owner;
        this.assetid = assetid;
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
 * @param {Uint8Array} contract: byteform of the contract from the payer
 * @param {int} assetAmount: the amount of assets to be sent
 * @param {int} microAlgoAmount: number of microAlgos to transfer
 * @param {Uint8Array} secretKey: secret key for signing transaction
 * @param {int} fee: the fee per byte to pay in microAlgos
 * @param {int} firstRound: the first round on which these txns will be valid
 * @param {int} lastRound: the last round on which these txns will be valid
 * @param {string} genesisHash: the b64-encoded genesis hash indicating the network for this transaction
 * @returns {Uint8Array}
 * the first payment sends money (Algos) from contract to the recipient (we'll call him Buyer), closing the rest of the account to Owner
 * the second payment sends money (the asset) from Buyer to the Owner
 * these transactions will be rejected if they do not meet the restrictions set by the contract
 * @throws error if arguments fail contract validation
 */
function getSwapAssetsTransaction(contract, assetAmount, microAlgoAmount, secretKey, fee, firstRound, lastRound, genesisHash) {
    let buyerKeyPair = nacl.keyPairFromSecretKey(secretKey);
    let buyerAddr = address.encodeAddress(buyerKeyPair.publicKey);
    let programOutputs = logic.readProgram(contract, undefined);
    let ints = programOutputs[0];
    let byteArrays = programOutputs[1];

    let noCloseRemainder = undefined;
    let noAssetRevocationTarget = undefined;
    let contractAssetID = ints[6];
    let contractOwner = address.encodeAddress(byteArrays[0]);
    let lsig = logicSig.makeLogicSig(contract, undefined);
    let contractAddress = lsig.address();
    let algosForAssets = makeTxn.makePaymentTxn(contractAddress, buyerAddr, fee, microAlgoAmount, noCloseRemainder, firstRound, lastRound, undefined, genesisHash, undefined);
    let assetsForAlgos = makeTxn.makeAssetTransferTxn(buyerAddr, contractOwner, noCloseRemainder, noAssetRevocationTarget, fee, assetAmount, firstRound, lastRound, undefined, genesisHash, undefined, contractAssetID);
    let txns = [algosForAssets, assetsForAlgos];
    let txGroup = group.assignGroupID(txns);

    let ratd = ints[7];
    let ratn = ints[8];
    if ((assetAmount * ratd) < (microAlgoAmount * ratn)) {
        throw new Error("bad payment ratio, " + assetAmount.toString() + "*" + ratd.toString() + " !>= " + microAlgoAmount.toString() + "*" + ratn.toString())
    }
    let minTrade = ints[4];
    if (microAlgoAmount < minTrade) {
        throw new Error("payment amount " + microAlgoAmount.toString() + " less than minimum trade " + minTrade.toString())
    }
    let maxFee = ints[2];
    if (txGroup[0].fee > maxFee) {
        throw new Error("final fee of payment transaction " + txGroup[0].fee.toString() + " greater than transaction max fee " + maxFee.toString())
    }
    if (txGroup[1].fee > maxFee) {
        throw new Error("final fee of asset transaction " + txGroup[1].fee.toString() + " greater than transaction max fee " + maxFee.toString())
    }

    let algosForAssetsSigned = logicSig.signLogicSigTransactionObject(txGroup[0], lsig);
    let assetsForAlgosSigned = txGroup[1].signTxn(secretKey);
    return utils.concatArrays(algosForAssetsSigned.blob, assetsForAlgosSigned);
}

module.exports = {
    LimitOrder,
    getSwapAssetsTransaction
};