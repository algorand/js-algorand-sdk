const nacl = require('./nacl/naclWrappers');
const address = require('./encoding/address');
const encoding = require('./encoding/encoding');
const logic = require('./logic/logic');
const multisig = require('./multisig');

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
            this.logic.checkProgram(this.program, this.args);
        } catch (e) {
            return false;
        }

        let toBeSigned = utils.concatArrays(this.tag, this.logic);

        if (!this.sig && !this.msig) {
            let hash = nacl.genericHash(toBeSigned);
            return utils.arrayEqual(hash, publicKey)
        }

        if (this.sig) {
            return nacl.verify(toBeSigned, this.msig, publicKey);
        }

        return multisig.verifyMultisig(this.msig, toBeSigned);
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
     * @param {Object} msig Multisig account
     */
    sign(secretKey, msig) {
        if (msig === undefined) {
            this.sig = this.signProgram(secretKey);
        } else {
            let [sig, index] = this.singleSignMultisig(secretKey, msig);
            this.msig = msig;
            this.msig.subsigs[index].s = sig;
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
        this.msig.subsigs[index].s = sig;
    }

    signProgram(secretKey) {
        let toBeSigned = utils.concatArrays(this.tag, this.logic);
        const sig = nacl.sign(toBeSigned, secretKey);
        return sig;
    }

    singleSignMultisig(secretKey, msig) {
        let index = -1;
        let myPk = nacl.keyPairFromSecretKey(secretKey).publicKey;
        for (let i in msig.subsigs) {
            subsig = msig.subsigs[i]
            if (utils.arrayEqual(subsig.pk, myPk)) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            throw new Error("invalid secret key");
        }
        sig = this.signProgram(secretKey);
        return [sig, index];
    }

    toByte() {
        return encoding.encode(this.get_obj_for_encoding());
    }
}

module.exports = {
    LogicSig
};
