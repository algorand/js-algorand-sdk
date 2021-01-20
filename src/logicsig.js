const { Buffer } = require('buffer');
const nacl = require('./nacl/naclWrappers');
const address = require('./encoding/address');
const encoding = require('./encoding/encoding');
const logic = require('./logic/logic');
const multisig = require('./multisig');
const utils = require('./utils/utils');
const txnBuilder = require('./transaction');

/**
 LogicSig implementation
 */

class LogicSig {
    constructor(program, args) {
        this.tag = Buffer.from("Program");

        if (!logic.checkProgram(program, args)) {
            throw new Error("Invalid program");
        }
        if (args) {
            function checkType(arg) {
                let theType = typeof arg;
                return ((theType == "string") || (theType == "number") || (arg.constructor == Uint8Array) || (Buffer.isBuffer(arg)));
            }
            if (!Array.isArray(args) || !args.every(checkType)) {
                throw new TypeError("Invalid arguments");
            }
        }

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
        return address.encodeAddress(hash);
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
                return {"pk": address.decodeAddress(addr).publicKey};
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

/**
 * makeLogicSig creates LogicSig object from program and arguments
 *
 * @param {Uint8Array} program Program to make LogicSig from
 * @param {[Uint8Array]} args Arguments as array of Uint8Array
 * @returns {LogicSig} LogicSig object
 */
function makeLogicSig(program, args) {
    return new LogicSig(program, args);
}

/**
 * signLogicSigTransaction takes  a raw transaction and a LogicSig object and returns a logicsig
 * transaction which is a blob representing a transaction and logicsig object.
 * @param {Object} dictionary containing constructor arguments for a transaction
 * @param {LogicSig} lsig logicsig object
 * @returns {Object} Object containing txID and blob representing signed transaction.
 * @throws error on failure
 */
function signLogicSigTransaction(txn, lsig) {
    let algoTxn = new txnBuilder.Transaction(txn);
    return signLogicSigTransactionObject(algoTxn, lsig);
}

/**
 * signLogicSigTransactionObject takes transaction.Transaction and a LogicSig object and returns a logicsig
 * transaction which is a blob representing a transaction and logicsig object.
 * @param {Object} txn transaction.Transaction
 * @param {LogicSig} lsig logicsig object
 * @returns {Object} Object containing txID and blob representing signed transaction.
 */
function signLogicSigTransactionObject(txn, lsig) {
    const lstx = {
        lsig: lsig.get_obj_for_encoding(),
        txn: txn.get_obj_for_encoding()
    };

    const isDelegated = lsig.sig || lsig.msig;
    if (isDelegated) {
        if (!lsig.verify(txn.from.publicKey)) {
            throw new Error("invalid signature");
        }
    } else {
        // add AuthAddr if signing with a different program than From indicates for non-delegated LogicSig
        const programAddr = lsig.address();
        if (programAddr !== address.encodeAddress(txn.from.publicKey)) {
            lstx.sgnr = Buffer.from(address.decodeAddress(programAddr).publicKey);
        }
    }

    return {
        "txID": txn.txID().toString(),
        "blob": encoding.encode(lstx)
    };
}

/**
 * logicSigFromByte accepts encoded logic sig bytes and attempts to call logicsig.fromByte on it,
 * returning the result
 */
function logicSigFromByte(encoded) {
    return LogicSig.fromByte(encoded);
}

const SIGN_PROGRAM_DATA_PREFIX = Buffer.from("ProgData");

/**
 * tealSign creates a signature compatible with ed25519verify opcode from contract address
 * @param sk - uint8array with secret key
 * @param data - buffer with data to sign
 * @param contractAddress string representation of teal contract address (program hash)
 */
function tealSign(sk, data, contractAddress) {
    const parts = utils.concatArrays(address.decodeAddress(contractAddress).publicKey, data);
    const toBeSigned = Buffer.from(utils.concatArrays(SIGN_PROGRAM_DATA_PREFIX, parts));
    return nacl.sign(toBeSigned, sk);
}

/**
 * tealSignFromProgram creates a signature compatible with ed25519verify opcode from raw program bytes
 * @param sk - uint8array with secret key
 * @param data - buffer with data to sign
 * @param program - buffer with teal program
 */
function tealSignFromProgram(sk, data, program) {
    const lsig = makeLogicSig(program);
    const contractAddress = lsig.address();
    return tealSign(sk, data, contractAddress);
}

module.exports = {
    LogicSig,
    makeLogicSig,
    signLogicSigTransaction,
    signLogicSigTransactionObject,
    logicSigFromByte,
    tealSign,
    tealSignFromProgram,
};
