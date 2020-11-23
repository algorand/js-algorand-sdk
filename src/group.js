const { Buffer } = require("buffer");
const txnBuilder = require('./transaction');
const nacl = require('./nacl/naclWrappers');
const encoding = require('./encoding/encoding');
const address = require('./encoding/address');
const utils = require('./utils/utils');

const ALGORAND_MAX_TX_GROUP_SIZE = 16;

/**
 * Aux class for group id calculation of a group of transactions
 */
class TxGroup {
    constructor(hashes) {
        if (hashes.length > ALGORAND_MAX_TX_GROUP_SIZE) {
            let errorMsg = hashes.length.toString() + " transactions grouped together but max group size is " + ALGORAND_MAX_TX_GROUP_SIZE.toString();
            throw Error(errorMsg);
        }

        this.name = "Transaction group";
        this.tag = Buffer.from("TG");

        this.txGroupHashes = hashes;
    }

    get_obj_for_encoding() {
        const txgroup = {
            "txlist": this.txGroupHashes
        };
        return txgroup;
    }

    static from_obj_for_encoding(txgroupForEnc) {
        const txn = Object.create(this.prototype);
        txn.name = "Transaction group";
        txn.tag = Buffer.from("TG");
        txn.txGroupHashes = [];
        for (let hash of txgroupForEnc.txlist) {
            txn.txGroupHashes.push(new Buffer.from(hash));
        }
        return txn;
    }

    toByte() {
        return encoding.encode(this.get_obj_for_encoding());
    }

}

/**
 * computeGroupID returns group ID for a group of transactions
 * @param txns array of transactions (every element is a dict or Transaction)
 * @return Buffer
 */
function computeGroupID(txns) {
    const hashes = [];
    for (let txn of txns) {
        let tx = txn;
        if (!(txn instanceof txnBuilder.Transaction)) {
            tx = new txnBuilder.Transaction(txn);
        }
        hashes.push(tx.rawTxID());
    }

    const txgroup = new TxGroup(hashes);

    const bytes = txgroup.toByte();
    const toBeHashed = Buffer.from(utils.concatArrays(txgroup.tag, bytes));
    const gid = nacl.genericHash(toBeHashed)
    return Buffer.from(gid);
}

/**
 * assignGroupID assigns group id to a given list of unsigned transactions
 * @param txns array of transactions (every element is a dict or Transaction)
 * @param from optional sender address specifying which transaction return
 * @return possible list of matching transactions
 */
function assignGroupID(txns, from = undefined) {
    const gid = computeGroupID(txns);
    let result = [];
    for (let txn of txns) {
        if (!from || address.encodeAddress(txn.from.publicKey) == from) {
            let tx = txn;
            if (!(tx instanceof txnBuilder.Transaction)) {
                tx = new txnBuilder.Transaction(txn);
            }
            tx.group = gid;
            result.push(tx);
        }
    }
    return result;
}

module.exports = {
    TxGroup,
    computeGroupID,
    assignGroupID,
};
