const address = require("./encoding/address");
const encoding = require("./encoding/encoding");
const nacl = require("./nacl/naclWrappers");
const utils = require("./utils/utils");
const base32 = require('hi-base32');

const ALGORAND_TRANSACTION_LENGTH = 52;
const ALGORAND_MIN_TX_FEE = 1000; // version v5
const ALGORAND_TRANSACTION_LEASE_LENGTH = 32;
const ALGORAND_MAX_TX_GROUP_SIZE = 16;
const ALGORAND_MAX_ASSET_DECIMALS = 19;

/**
 * Transaction enables construction of Algorand transactions
 * */
class Transaction {
    constructor({from, to, fee, amount, firstRound, lastRound, note, genesisID, genesisHash, lease,
                 closeRemainderTo, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, 
                 assetIndex, assetTotal, assetDecimals, assetDefaultFrozen, assetManager, assetReserve,
                 assetFreeze, assetClawback, assetUnitName, assetName, assetURL, assetMetadataHash,
                 freezeAccount, freezeState, assetRevocationTarget, type="pay", flatFee=false}) {
        this.name = "Transaction";
        this.tag = Buffer.from("TX");

        from = address.decode(from);
        if (to !== undefined) to = address.decode(to);
        if (closeRemainderTo !== undefined) closeRemainderTo = address.decode(closeRemainderTo);
        if (assetManager !== undefined) assetManager = address.decode(assetManager);
        if (assetReserve !== undefined) assetReserve = address.decode(assetReserve);
        if (assetFreeze !== undefined) assetFreeze = address.decode(assetFreeze);
        if (assetClawback !== undefined) assetClawback = address.decode(assetClawback);
        if (assetRevocationTarget !== undefined) assetRevocationTarget = address.decode(assetRevocationTarget);
        if (freezeAccount !== undefined) freezeAccount = address.decode(freezeAccount);
        if (genesisHash === undefined) throw Error("genesis hash must be specified and in a base64 string.");

        genesisHash = Buffer.from(genesisHash, 'base64');

        if (amount !== undefined && (!Number.isSafeInteger(amount) || amount < 0)) throw Error("Amount must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(fee) || fee < 0) throw Error("fee must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(firstRound) || firstRound < 0) throw Error("firstRound must be a positive number");
        if (!Number.isSafeInteger(lastRound) || lastRound < 0) throw Error("lastRound must be a positive number");
        if (assetTotal !== undefined && (!Number.isSafeInteger(assetTotal) || assetTotal < 0)) throw Error("Total asset issuance must be a positive number and smaller than 2^53-1");
        if (assetDecimals !== undefined && (!Number.isSafeInteger(assetDecimals) || assetDecimals < 0 || assetDecimals > ALGORAND_MAX_ASSET_DECIMALS)) throw Error("assetDecimals must be a positive number and smaller than " + ALGORAND_MAX_ASSET_DECIMALS.toString());
        if (assetIndex !== undefined && (!Number.isSafeInteger(assetIndex) || assetIndex < 0)) throw Error("Asset index must be a positive number and smaller than 2^53-1");

        if (note !== undefined) {
            if (note.constructor !== Uint8Array) throw Error("note must be a Uint8Array.");
        }
        else {
          note = new Uint8Array(0);
        }
        if (lease !== undefined) {
            if (lease.constructor !== Uint8Array) throw Error("lease must be a Uint8Array.");
            if (lease.length !== ALGORAND_TRANSACTION_LEASE_LENGTH) throw Error("lease must be of length " + ALGORAND_TRANSACTION_LEASE_LENGTH.toString() + ".");
        }
        else {
            lease = new Uint8Array(0);
        }
        if (voteKey !== undefined) {
            voteKey = Buffer.from(voteKey, "base64");
        }
        if (selectionKey !== undefined) {
            selectionKey = Buffer.from(selectionKey, "base64");
        }

        Object.assign(this, {
            from, to, fee, amount, firstRound, lastRound, note, genesisID, genesisHash, lease,
            closeRemainderTo, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution,
            assetIndex, assetTotal, assetDecimals, assetDefaultFrozen, assetManager, assetReserve,
            assetFreeze, assetClawback, assetUnitName, assetName, assetURL, assetMetadataHash,
            freezeAccount, freezeState, assetRevocationTarget, type
        });

        // Modify Fee
        if (!flatFee){
            this.fee *= this.estimateSize();
        }
        // If suggested fee too small and will be rejected, set to min tx fee
        if (this.fee < ALGORAND_MIN_TX_FEE) {
            this.fee = ALGORAND_MIN_TX_FEE;
        }

        // say we are aware of groups
        this.group = undefined;
    }

    get_obj_for_encoding() {
        if (this.type == "pay") {
            let txn = {
                "amt": this.amount,
                "fee": this.fee,
                "fv": this.firstRound,
                "lv": this.lastRound,
                "note": Buffer.from(this.note),
                "rcv": Buffer.from(this.to.publicKey),
                "snd": Buffer.from(this.from.publicKey),
                "type": "pay",
                "gen": this.genesisID,
                "gh": this.genesisHash,
                "lx": Buffer.from(this.lease),
                "grp": this.group,
            };

            // parse close address
            if (this.closeRemainderTo !== undefined) txn.close = Buffer.from(this.closeRemainderTo.publicKey);

            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.amt) delete txn.amt;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;
            if (txn.grp === undefined) delete txn.grp;
            if (!txn.lx.length) delete txn.lx;

            return txn;
        }
        else if (this.type == "keyreg") {
            let txn = {
                "fee": this.fee,
                "fv": this.firstRound,
                "lv": this.lastRound,
                "note": Buffer.from(this.note),
                "snd": Buffer.from(this.from.publicKey),
                "type": this.type,
                "gen": this.genesisID,
                "gh": this.genesisHash,
                "lx": Buffer.from(this.lease),
                "grp": this.group,
                "votekey": this.voteKey,
                "selkey": this.selectionKey,
                "votefst": this.voteFirst,
                "votelst": this.voteLast,
                "votekd": this.voteKeyDilution
            };
            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.lx.length) delete txn.lx;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;

            if (txn.grp === undefined) delete txn.grp;

            return txn;
        }
        else if (this.type == "acfg") {
            // asset creation, or asset reconfigure, or asset destruction
            let txn = {
                "fee": this.fee,
                "fv": this.firstRound,
                "lv": this.lastRound,
                "note": Buffer.from(this.note),
                "snd": Buffer.from(this.from.publicKey),
                "type": this.type,
                "gen": this.genesisID,
                "gh": this.genesisHash,
                "lx": Buffer.from(this.lease),
                "caid": this.assetIndex,
                "apar": {
                    "t": this.assetTotal,
                    "df": this.assetDefaultFrozen,
                    "dc": this.assetDecimals,
                }
            };
            if (this.assetManager !== undefined) txn.apar.m = Buffer.from(this.assetManager.publicKey);
            if (this.assetReserve !== undefined) txn.apar.r = Buffer.from(this.assetReserve.publicKey);
            if (this.assetFreeze !== undefined) txn.apar.f = Buffer.from(this.assetFreeze.publicKey);
            if (this.assetClawback !== undefined) txn.apar.c = Buffer.from(this.assetClawback.publicKey);
            if (this.assetName !== undefined) txn.apar.an =this.assetName;
            if (this.assetUnitName !== undefined) txn.apar.un = this.assetUnitName;
            if (this.assetURL !== undefined) txn.apar.au = this.assetURL;
            if (this.assetMetadataHash !== undefined) txn.apar.am = Buffer.from(this.assetMetadataHash);

            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.lx.length) delete txn.lx;
            if (!txn.amt) delete txn.amt;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;


            if (!txn.caid) delete txn.caid;
            if ((!txn.apar.t) &&
                (!txn.apar.un) &&
                (!txn.apar.an) &&
                (!txn.apar.df) &&
                (!txn.apar.m) &&
                (!txn.apar.r) &&
                (!txn.apar.f) &&
                (!txn.apar.c) &&
                (!txn.apar.au) &&
                (!txn.apar.am) &&
                (!txn.apar.dc)){
                    delete txn.apar
            }
            else {
                if (!txn.apar.t) delete txn.apar.t;
                if (!txn.apar.dc) delete txn.apar.dc;
                if (!txn.apar.un) delete txn.apar.un;
                if (!txn.apar.an) delete txn.apar.an;
                if (!txn.apar.df) delete txn.apar.df;
                if (!txn.apar.m) delete txn.apar.m;
                if (!txn.apar.r) delete txn.apar.r;
                if (!txn.apar.f) delete txn.apar.f;
                if (!txn.apar.c) delete txn.apar.c;
                if (!txn.apar.au) delete txn.apar.au;
                if (!txn.apar.am) delete txn.apar.am;
            }
            if (txn.grp === undefined) delete txn.grp;

            return txn;
        }
        else if (this.type == "axfer") {
            // asset transfer, acceptance, revocation, mint, or burn
            let txn = {
                "aamt": this.amount,
                "fee": this.fee,
                "fv": this.firstRound,
                "lv": this.lastRound,
                "note": Buffer.from(this.note),
                "snd": Buffer.from(this.from.publicKey),
                "arcv": Buffer.from(this.to.publicKey),
                "type": this.type,
                "gen": this.genesisID,
                "gh": this.genesisHash,
                "lx": Buffer.from(this.lease),
                "xaid": this.assetIndex
            };
            if (this.closeRemainderTo !== undefined) txn.aclose = Buffer.from(this.closeRemainderTo.publicKey);
            if (this.assetRevocationTarget !== undefined) txn.asnd = Buffer.from(this.assetRevocationTarget.publicKey);
            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.lx.length) delete txn.lx;
            if (!txn.aamt) delete txn.aamt;
            if (!txn.amt) delete txn.amt;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;
            if (txn.grp === undefined) delete txn.grp;
            if (!txn.aclose) delete txn.aclose;
            if (!txn.asnd) delete txn.asnd;
            return txn;
        }
        else if (this.type == "afrz") {
            // asset freeze or unfreeze
            let txn = {
                "fee": this.fee,
                "fv": this.firstRound,
                "lv": this.lastRound,
                "note": Buffer.from(this.note),
                "snd": Buffer.from(this.from.publicKey),
                "type": this.type,
                "gen": this.genesisID,
                "gh": this.genesisHash,
                "lx": Buffer.from(this.lease),
                "faid": this.assetIndex,
                "afrz": this.freezeState
            };
            if (this.freezeAccount !== undefined) txn.fadd = Buffer.from(this.freezeAccount.publicKey);
            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.lx.length) delete txn.lx;
            if (!txn.amt) delete txn.amt;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;
            if (!txn.afrz) delete txn.afrz;
            if (txn.grp === undefined) delete txn.grp;

            return txn;
        }
    }

    static from_obj_for_encoding(txnForEnc) {
        let txn = Object.create(this.prototype);
        txn.name = "Transaction";
        txn.tag = Buffer.from("TX");

        txn.genesisID = txnForEnc.gen;
        txn.genesisHash = Buffer.from(txnForEnc.gh);
        txn.type = txnForEnc.type;
        txn.fee = txnForEnc.fee;
        txn.firstRound = txnForEnc.fv;
        txn.lastRound = txnForEnc.lv;
        txn.note = new Uint8Array(txnForEnc.note);
        txn.lease = new Uint8Array(txnForEnc.lx);
        txn.from = address.decode(address.encode(new Uint8Array(txnForEnc.snd)));
        if (txnForEnc.grp !== undefined) txn.group = Buffer.from(txnForEnc.grp);

        if (txnForEnc.type === "pay") {
            txn.amount = txnForEnc.amt;
            txn.to = address.decode(address.encode(new Uint8Array(txnForEnc.rcv)));
            if (txnForEnc.close !== undefined) txn.closeRemainderTo = address.decode(address.encode(txnForEnc.close));
        }
        else if (txnForEnc.type === "keyreg") {
            txn.voteKey = Buffer.from(txnForEnc.votekey);
            txn.selectionKey = Buffer.from(txnForEnc.selkey);
            txn.voteKeyDilution = txnForEnc.votekd;
            txn.voteFirst = txnForEnc.votefst;
            txn.voteLast = txnForEnc.votelst;
        }
        else if (txnForEnc.type === "acfg") {
            // asset creation, or asset reconfigure, or asset destruction
            if (txnForEnc.caid !== undefined){
                txn.assetIndex = txnForEnc.caid;
            }
            if (txnForEnc.apar !== undefined){
                txn.assetTotal = txnForEnc.apar.t;
                txn.assetDefaultFrozen = txnForEnc.apar.df;
                if (txnForEnc.apar.dc !== undefined) txn.assetDecimals = txnForEnc.apar.dc;
                if (txnForEnc.apar.m !== undefined) txn.assetManager = address.decode(address.encode(new Uint8Array(txnForEnc.apar.m)));
                if (txnForEnc.apar.r !== undefined) txn.assetReserve = address.decode(address.encode(new Uint8Array(txnForEnc.apar.r)));
                if (txnForEnc.apar.f !== undefined) txn.assetFreeze = address.decode(address.encode(new Uint8Array(txnForEnc.apar.f)));
                if (txnForEnc.apar.c !== undefined) txn.assetClawback = address.decode(address.encode(new Uint8Array(txnForEnc.apar.c)));
                if (txnForEnc.apar.un !== undefined) txn.assetUnitName = txnForEnc.apar.un;
                if (txnForEnc.apar.an !== undefined) txn.assetName = txnForEnc.apar.an;
                if (txnForEnc.apar.au !== undefined) txn.assetURL = txnForEnc.apar.au;
                if (txnForEnc.apar.am !== undefined) txn.assetMetadataHash = txnForEnc.apar.am;
            }
        }
        else if (txnForEnc.type === "axfer") {
            // asset transfer, acceptance, revocation, mint, or burn
            if (txnForEnc.xaid !== undefined) {
                txn.assetIndex = txnForEnc.xaid;
            }
            if (txnForEnc.aamt !== undefined) txn.amount = txnForEnc.aamt;
            if (txnForEnc.aclose !== undefined) {
                txn.closeRemainderTo = address.decode(address.encode(new Uint8Array(txnForEnc.aclose)));
            }
            if (txnForEnc.asnd !== undefined) {
                txn.assetRevocationTarget = address.decode(address.encode(new Uint8Array(txnForEnc.asnd)));
            }
            txn.to = address.decode(address.encode(new Uint8Array(txnForEnc.arcv)));
        }
        else if (txnForEnc.type === "afrz") {
            if (txnForEnc.afrz !== undefined) {
                txn.freezeState = txnForEnc.afrz;
            }
            if (txnForEnc.faid !== undefined) {
                txn.assetIndex = txnForEnc.faid;
            }
            txn.freezeAccount = address.decode(address.encode(new Uint8Array(txnForEnc.fadd)));
        }
        return txn;
    }

    estimateSize() {
        // Generate random key
        let key = nacl.keyPair();
        return this.signTxn(key.secretKey).length;

    }

    bytesToSign() {
        let encodedMsg = this.toByte();
        return Buffer.from(utils.concatArrays(this.tag, encodedMsg));
    }

    toByte() {
        return encoding.encode(this.get_obj_for_encoding());
    }

    // returns the raw signature
    rawSignTxn(sk) {
        const toBeSigned = this.bytesToSign();
        const sig = nacl.sign(toBeSigned, sk);
        return Buffer.from(sig);
    }

    signTxn(sk) {
        // construct signed message
        let sTxn = {
            "sig": this.rawSignTxn(sk),
            "txn": this.get_obj_for_encoding(),
        };
        return new Uint8Array(encoding.encode(sTxn));
    }

    rawTxID() {
        const en_msg = this.toByte();
        const gh = Buffer.from(utils.concatArrays(this.tag, en_msg));
        return Buffer.from(nacl.genericHash(gh));
    }

    txID() {
        const hash = this.rawTxID();
        return base32.encode(hash).slice(0, ALGORAND_TRANSACTION_LENGTH);
    }

    // add a lease to a transaction not yet having
    // supply feePerByte to increment fee accordingly
    addLease(lease, feePerByte=0) {
        if (lease !== undefined) {
            if (lease.constructor !== Uint8Array) throw Error("lease must be a Uint8Array.");
            if (lease.length !== ALGORAND_TRANSACTION_LEASE_LENGTH) throw Error("lease must be of length " + ALGORAND_TRANSACTION_LEASE_LENGTH.toString() + ".");
        }
        else {
            lease = new Uint8Array(0);
        }
        this.lease = lease;
        if (feePerByte !== 0) {
            this.fee += 37 * feePerByte; // 32 bytes + 5 byte label
        }
    }
}

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

module.exports = {Transaction, TxGroup};
