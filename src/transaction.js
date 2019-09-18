const address = require("./encoding/address");
const encoding = require("./encoding/encoding");
const nacl = require("./nacl/naclWrappers");
const utils = require("./utils/utils");
const base32 = require('hi-base32');

const ALGORAND_TRANSACTION_LENGTH = 52;
const ALGORAND_MIN_TX_FEE = 1000; // version v5

/**
 * Transaction enables construction of Algorand transactions
 * */
class Transaction {
    constructor({from, to, fee, amount, firstRound, lastRound, note, genesisID, genesisHash, closeRemainderTo, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, creator, index, assetTotal, assetDefaultFrozen, assetManager, assetReserve, assetFreeze, assetClawback, assetUnitName, assetName, type="pay", flatFee=false}) {
        this.name = "Transaction";
        this.tag = Buffer.from([84, 88]); // "TX"

        from = address.decode(from);
        if (to !== undefined) to = address.decode(to);
        if (closeRemainderTo !== undefined) closeRemainderTo = address.decode(closeRemainderTo);
        if (creator !== undefined) creator = address.decode(creator);
        if (assetManager !== undefined) assetManager = address.decode(assetManager);
        if (assetReserve !== undefined) assetReserve = address.decode(assetReserve);
        if (assetFreeze !== undefined) assetFreeze = address.decode(assetFreeze);
        if (assetClawback !== undefined) assetClawback = address.decode(assetClawback);

        if (genesisHash === undefined) throw Error("genesis hash must be specified and in a base64 string.");

        genesisHash = Buffer.from(genesisHash, 'base64');

        if (amount !== undefined && (!Number.isSafeInteger(amount) || amount < 0)) throw Error("Amount must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(fee) || fee < 0) throw Error("fee must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(firstRound) || firstRound < 0) throw Error("firstRound must be a positive number");
        if (!Number.isSafeInteger(lastRound) || lastRound < 0) throw Error("lastRound must be a positive number");
        if (assetTotal !== undefined && (!Number.isSafeInteger(assetTotal) || assetTotal < 0)) throw Error("Total asset issuance must be a positive number and smaller than 2^53-1");
        if (index !== undefined && (!Number.isSafeInteger(index) || index < 0)) throw Error("Asset index must be a positive number and smaller than 2^53-1");

        if (note !== undefined) {
            if (note.constructor !== Uint8Array) throw Error("note must be a Uint8Array.");
        }
        else {
          note = new Uint8Array(0);
        }
        if (voteKey !== undefined) {
            voteKey = Buffer.from(voteKey, "base64");
        }
        if (selectionKey !== undefined) {
            selectionKey = Buffer.from(selectionKey, "base64");
        }

        Object.assign(this, {
            from, to, fee, amount, firstRound, lastRound, note, genesisHash, genesisID, closeRemainderTo, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, creator, index, assetTotal, assetDefaultFrozen, assetManager, assetReserve, assetFreeze, assetClawback, assetUnitName, assetName, type
        });

        // Modify Fee
        if (!flatFee){
            this.fee *= this.estimateSize();
        }
        // If suggested fee too small and will be rejected, set to min tx fee
        if (this.fee < ALGORAND_MIN_TX_FEE) {
            this.fee = ALGORAND_MIN_TX_FEE;
        }
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
            };
    
            // parse close address
            if (this.closeRemainderTo !== undefined) txn.close = Buffer.from(this.closeRemainderTo.publicKey);
    
            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.amt) delete txn.amt;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;

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
                "votekey": this.voteKey,
                "selkey": this.selectionKey,
                "votefst": this.voteFirst,
                "votelst": this.voteLast,
                "votekd": this.voteKeyDilution
            };
            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;
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
                "caid": {
                    "i": this.index
                },
                "apar": {
                    "t": this.assetTotal,
                    "df": this.assetDefaultFrozen,
                }
            };
            if (this.creator !== undefined) txn.caid.c = Buffer.from(this.creator.publicKey)
            if (this.assetManager !== undefined) txn.apar.m = Buffer.from(this.assetManager.publicKey)
            if (this.assetReserve !== undefined) txn.apar.r = Buffer.from(this.assetReserve.publicKey)
            if (this.assetFreeze !== undefined) txn.apar.f = Buffer.from(this.assetFreeze.publicKey)
            if (this.assetClawback !== undefined) txn.apar.c = Buffer.from(this.assetClawback.publicKey)
            if (this.assetName !== undefined) txn.apar.an = Buffer.from(this.assetName);
            if (this.assetUnitName !== undefined) txn.apar.un = Buffer.from(this.assetUnitName);
            
            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.amt) delete txn.amt;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;


            if ((!txn.caid.c) && (!txn.caid.i)) delete txn.caid;
            else {
                if (!txn.caid.i) delete txn.caid.i;
                if (!txn.caid.c) delete txn.caid.c;
            }
            if ((!txn.apar.t) &&
                (!txn.apar.un) &&
                (!txn.apar.an) &&
                (!txn.apar.df) &&
                (!txn.apar.m) &&
                (!txn.apar.r) &&
                (!txn.apar.f) &&
                (!txn.apar.c)){
                    delete txn.apar
            }
            else {
                if (!txn.apar.t) delete txn.apar.t;
                if (!txn.apar.un) delete txn.apar.un;
                if (!txn.apar.an) delete txn.apar.an;
                if (!txn.apar.df) delete txn.apar.df;
                if (!txn.apar.m) delete txn.apar.m;
                if (!txn.apar.r) delete txn.apar.r;
                if (!txn.apar.f) delete txn.apar.f;
                if (!txn.apar.c) delete txn.apar.c;
            }
            
            return txn;
        }
    }

    static from_obj_for_encoding(txnForEnc) {
        let txn = Object.create(this.prototype);
        txn.name = "Transaction";
        txn.tag = Buffer.from([84, 88]); // "TX"

        txn.genesisID = txnForEnc.gen;
        txn.genesisHash = txnForEnc.gh;
        txn.type = txnForEnc.type;
        txn.fee = txnForEnc.fee;
        txn.firstRound = txnForEnc.fv;
        txn.lastRound = txnForEnc.lv;
        txn.note = new Uint8Array(txnForEnc.note);
        txn.from = address.decode(address.encode(new Uint8Array(txnForEnc.snd)));

        if (txnForEnc.type === "pay") {
            txn.amount = txnForEnc.amt;
            txn.to = address.decode(address.encode(new Uint8Array(txnForEnc.rcv)));
            if (txnForEnc.close !== undefined) txn.closeRemainderTo = address.decode(address.encode(new Uint8Array(txnForEnc.close)));    
        }
        else if (txnForEnc.type === "keyreg") {
            txn.voteKey = txnForEnc.votekey;
            txn.selectionKey = txnForEnc.selkey;
            txn.voteKeyDilution = txnForEnc.votekd;
            txn.voteFirst = txnForEnc.votefst;
            txn.voteLast = txnForEnc.votelst;
        }
        else if (txnForEnc.type === "acfg") {
            // asset creation, or asset reconfigure, or asset destruction
            if (txnForEnc.caid !== undefined){
                txn.index = txnForEnc.caid.i
                if (txnForEnc.caid.c!== undefined) txn.creator = address.decode(address.encode(new Uint8Array(txnForEnc.caid.c)));
            }
            if (txnForEnc.apar !== undefined){
                txn.assetTotal = txnForEnc.apar.t;
                txn.assetDefaultFrozen = txnForEnc.apar.df;
                if (txnForEnc.apar.m !== undefined) txn.assetManager = address.decode(address.encode(new Uint8Array(txnForEnc.apar.m)));
                if (txnForEnc.apar.r !== undefined) txn.assetReserve = address.decode(address.encode(new Uint8Array(txnForEnc.apar.r)));
                if (txnForEnc.apar.f !== undefined) txn.assetFreeze = address.decode(address.encode(new Uint8Array(txnForEnc.apar.f)));
                if (txnForEnc.apar.c !== undefined) txn.assetClawback = address.decode(address.encode(new Uint8Array(txnForEnc.apar.c)));
                if (txnForEnc.apar.un !== undefined) txn.assetUnitName = txnForEnc.apar.un;
                if (txnForEnc.apar.an !== undefined) txn.assetName = txnForEnc.apar.an;
            }
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

    txID() {
        const en_msg = encoding.encode(this.get_obj_for_encoding());
        const gh = Buffer.from(utils.concatArrays(this.tag, en_msg));
        return base32.encode(nacl.genericHash(gh)).slice(0, ALGORAND_TRANSACTION_LENGTH);
    }
}

module.exports = {Transaction};
