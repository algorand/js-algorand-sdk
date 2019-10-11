const assert = require('assert');
const nacl = require('./nacl/naclWrappers');
const address = require('./encoding/address');
const encoding = require('./encoding/encoding');
const logic = require('./logic/logic');
const multisig = require('./multisig');
const utils = require('./utils/utils');

/**
 LogicSig implementation
 */

class LogicSig {
    constructor(program, args) {
        this.tag = Buffer.from("Program");

        assert(logic.checkProgram(program, args));

        this.logic = program;
        this.args = args;
        this.sig = undefined;
        this.msig = undefined;
    }

    get_obj_for_encoding() {
        let obj = {
            l: this.logic,
        }
        if (this.args) {
            obj["arg"] = this.args;
        }
        if (this.sig) {
            obj["sig"] = this.sig;
        } else if (this.msig) {
            obj["msig"] = this.msig;
        }
        return obj;
    }

    static from_obj_for_encoding(encoded) {
        let lsig = new LogicSig(encoded.l, encoded.arg);
        lsig.sig = encoded.sig;
        lsig.msig = encoded.msig;
        return lsig;
    }

    /**
     * Performs signature verification
     * @param {Uint8Array} publicKey Verification key (derived from sender address or escrow address)
     * @returns {boolean}
     */
    verify(publicKey) {
        if (this.sig && this.msig) {
            return false;
        }

        try {
            logic.checkProgram(this.logic, this.args);
        } catch (e) {
            return false;
        }

        let toBeSigned = utils.concatArrays(this.tag, this.logic);

        if (!this.sig && !this.msig) {
            let hash = nacl.genericHash(toBeSigned);
            return utils.arrayEqual(hash, publicKey)
        }

        if (this.sig) {
            return nacl.verify(toBeSigned, this.sig, publicKey);
        }

        return multisig.verifyMultisig(toBeSigned, this.msig, publicKey);
    }

    /**
     * Compute hash of the logic sig program (that is the same as escrow account address) as string address
     * @returns {string} String representation of the address
     */
    address() {
        let toBeSigned = utils.concatArrays(this.tag, this.logic);
        let hash = nacl.genericHash(toBeSigned);
        return address.encode(hash);
    }

    /**
     * Creates signature (if no msig provided) or multi signature otherwise
     * @param {Uint8Array} secretKey Secret key to sign with
     * @param {Object} msig Multisig account as {version, threshold, addrs}
     */
    sign(secretKey, msig) {
        if (msig === undefined) {
            this.sig = this.signProgram(secretKey);
        } else {
            let subsigs = msig.addrs.map(addr => {
                return {"pk": address.decode(addr).publicKey};
            });

            this.msig = {
                "v": msig.version,
                "thr": msig.threshold,
                "subsig": subsigs
            };

            let [sig, index] = this.singleSignMultisig(secretKey, this.msig);
            this.msig.subsig[index].s = sig;
        }
    }

    /**
     * Appends a signature to multi signature
     * @param {Uint8Array} secretKey Secret key to sign with
     */
    appendToMultisig(secretKey) {
        if (this.msig === undefined) {
            throw new Error("no multisig present");
        }
        let [sig, index] = this.singleSignMultisig(secretKey, this.msig);
        this.msig.subsig[index].s = sig;
    }

    signProgram(secretKey) {
        let toBeSigned = utils.concatArrays(this.tag, this.logic);
        const sig = nacl.sign(toBeSigned, secretKey);
        return sig;
    }

    singleSignMultisig(secretKey, msig) {
        let index = -1;
        let myPk = nacl.keyPairFromSecretKey(secretKey).publicKey;
        for (let i = 0; i < msig.subsig.length; i++) {
            let pk = msig.subsig[i].pk;
            if (utils.arrayEqual(pk, myPk)) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            throw new Error("invalid secret key");
        }
        let sig = this.signProgram(secretKey);
        return [sig, index];
    }

    toByte() {
        return encoding.encode(this.get_obj_for_encoding());
    }

    static fromByte(encoded) {
        let decoded_obj = encoding.decode(encoded);
        return LogicSig.from_obj_for_encoding(decoded_obj);
    }
}

module.exports = {
    LogicSig
};
