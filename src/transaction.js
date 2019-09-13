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
    constructor({from, to, fee, amount, firstRound, lastRound, note, genesisID, genesisHash, closeRemainderTo, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, type="pay", flatFee=false}) {
        this.name = "Transaction";
        this.tag = Buffer.from([84, 88]); // "TX"

        from = address.decode(from);
        if (to !== undefined) to = address.decode(to);

        if (closeRemainderTo !== undefined) closeRemainderTo = address.decode(closeRemainderTo);

        if (genesisHash === undefined) throw Error("genesis hash must be specified and in a base64 string.");

        genesisHash = Buffer.from(genesisHash, 'base64');

        if (amount !== undefined && (!Number.isSafeInteger(amount) || amount < 0)) throw Error("Amount must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(fee) || fee < 0) throw Error("fee must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(firstRound) || firstRound < 0) throw Error("firstRound must be a positive number");
        if (!Number.isSafeInteger(lastRound) || lastRound < 0) throw Error("lastRound must be a positive number");

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
            from, to, fee, amount, firstRound, lastRound, note, genesisHash, genesisID, closeRemainderTo, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, type
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
    }

    static from_obj_for_encoding(txnForEnc) {
        let txn = Object.create(this.prototype);
        txn.name = "Transaction";
        txn.tag = Buffer.from([84, 88]); // "TX"

        txn.genesisID = txnForEnc.gen;
        txn.genesisHash = Buffer.from(txnForEnc.gh);
        txn.type = txnForEnc.type;
        txn.fee = txnForEnc.fee;
        txn.firstRound = txnForEnc.fv;
        txn.lastRound = txnForEnc.lv;
        txn.note = new Uint8Array(txnForEnc.note);
        txn.from = address.decode(address.encode(new Uint8Array(txnForEnc.snd)));

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
