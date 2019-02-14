const address = require("./encoding/address");
const encoding = require("./encoding/encoding");
const nacl = require("./nacl/naclWrappers");
const utils = require("./utils/utils");
const base32 = require('hi-base32');

const ALGORAND_TRANSACTION_LENGTH = 52;

/**
 * Transaction enables construction of Algorand transactions
 * */
class Transaction {
    constructor({from, to, fee, amount, firstRound, lastRound, note}) {
        this.name = "Transaction";
        this.tag = Buffer.from([84, 88]); // "TX"

        from = address.decode(from);
        to = address.decode(to);

        if (!Number.isSafeInteger(amount) || amount < 0) throw Error("Amount must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(fee) || fee < 0) throw Error("fee must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(firstRound) || firstRound < 0) throw Error("firstRound must be a positive number");
        if (!Number.isSafeInteger(lastRound) || lastRound < 0) throw Error("lastRound must be a positive number");

        if (note !== undefined) {
            if (note.constructor !== Uint8Array) throw Error("note must be a Uint8Array.");
        }

        Object.assign(this, {
            from, to, fee, amount, firstRound, lastRound, note
        });
    }

    get_obj_for_encoding() {
        let txn = {
            "amt": this.amount,
            "fee": this.fee,
            "fv": this.firstRound,
            "lv": this.lastRound,
            "note": Buffer.from(this.note),
            "rcv": Buffer.from(this.to.publicKey),
            "snd": Buffer.from(this.from.publicKey),
            "type": "pay",
        };

        // allowed empty values
        if (txn.note.length === 0) delete txn.note;
        if (txn.amt === 0) delete txn.amt;

        return txn;
    }

    signTxn(sk) {
        const encodedMsg = encoding.encode(this.get_obj_for_encoding());
        const toBeSigned = Buffer.from(utils.concatArrays(this.tag, encodedMsg));
        const sig = nacl.sign(toBeSigned, sk);

        // construct signed message
        let sTxn = {
            "sig": Buffer.from(sig),
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