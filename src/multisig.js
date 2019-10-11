const nacl = require('./nacl/naclWrappers');
const address = require('./encoding/address');
const encoding = require('./encoding/encoding');
const txnBuilder = require('./transaction');
const utils = require('./utils/utils');

/**
 Utilities for manipulating multisig transaction blobs.
 */

const ERROR_MULTISIG_MERGE_LESSTHANTWO = new Error("Not enough multisig transactions to merge. Need at least two");
const ERROR_MULTISIG_MERGE_MISMATCH = new Error("Cannot merge txs. txIDs differ");
const ERROR_MULTISIG_MERGE_WRONG_PREIMAGE = new Error("Cannot merge txs. Multisig preimages differ");
const ERROR_MULTISIG_MERGE_SIG_MISMATCH = new Error("Cannot merge txs. subsigs are mismatched.");
const ERROR_MULTISIG_BAD_FROM_FIELD = new Error("The transaction from field and multisig preimage do not match.");
const ERROR_MULTISIG_KEY_NOT_EXIST = new Error("Key does not exist");

/**
 * MultisigTransaction is a Transaction that also supports creating partially-signed multisig transactions.
 */
class MultisigTransaction extends txnBuilder.Transaction {
    get_obj_for_encoding() {
        if (this.hasOwnProperty("objForEncoding")) {
            // if set, use the value for encoding. This allows us to sign existing non-payment type transactions.
            return this.objForEncoding;
        }
        return super.get_obj_for_encoding();
    }

    static from_obj_for_encoding(txnForEnc) {
        if (txnForEnc.type !== "pay") {
            // we don't support decoding this txn yet - but we can keep signing it since we have the
            // encoded format. We trust that the caller knows what they are trying to sign.
            let txn = Object.create(this.prototype);
            txn.name = "Transaction";
            txn.tag = Buffer.from([84, 88]); // "TX"

            txn.objForEncoding = txnForEnc;
            return txn;
        }
        return super.from_obj_for_encoding(txnForEnc);
    }

    /**
     * partialSignTxn partially signs this transaction and returns a partially-signed multisig transaction,
     * encoded with msgpack as a typed array.
     * @param version multisig version
     * @param threshold multisig threshold
     * @param pks multisig public key list, order is important.
     * @param sk an Algorand secret key to sign with.
     * @returns an encoded, partially signed multisig transaction.
     */
    partialSignTxn({version, threshold, pks}, sk) {
        // verify one more time that the from field is correct
        if (!this.hasOwnProperty("objForEncoding")) {
            let expectedFromRaw = address.fromMultisigPreImg({version, threshold, pks});
            if (address.encode(this.from.publicKey) !== address.encode(expectedFromRaw)) {
                throw ERROR_MULTISIG_BAD_FROM_FIELD;
            }
        }
        // get signature verifier
        let myPk = nacl.keyPairFromSecretKey(sk).publicKey;
        return createMultisigTransaction(
            this.get_obj_for_encoding(),
            {"rawSig": this.rawSignTxn(sk), myPk},
            {version, threshold, pks},
        );
    }
}

/**
 * createMultisigTransaction creates a multisig transaction blob.
 * @param txnForEncoding the actual transaction to sign.
 * @param rawSig a Buffer raw signature of that transaction
 * @param myPk a public key that corresponds with rawSig
 * @param version multisig version
 * @param threshold mutlisig threshold
 * @param pks ordered list of public keys in this multisig
 * @returns encoded multisig blob
 */
function createMultisigTransaction(txnForEncoding, {rawSig, myPk}, {version, threshold, pks}) {
    let keyExist = false;
    // construct the appendable multisigned transaction format
    let subsigs = pks.map(pk => {
        if (nacl.bytesEqual(pk, myPk)) {
            keyExist = true;
            return {
                "pk": Buffer.from(pk),
                "s" : rawSig,
            };
        }
        return {"pk": Buffer.from(pk)};
    });
    if (keyExist === false) {
        throw ERROR_MULTISIG_KEY_NOT_EXIST;
    }
    let msig = {
        "v": version,
        "thr": threshold,
        "subsig": subsigs,
    };
    let sTxn = {
        "msig": msig,
        "txn": txnForEncoding,
    };
    return new Uint8Array(encoding.encode(sTxn));
}

/**
 * mergeMultisigTransactions takes a list of multisig transaction blobs, and merges them.
 * @param multisigTxnBlobs a list of blobs representing encoded multisig txns
 * @returns typed array msg-pack encoded multisig txn
 */
function mergeMultisigTransactions(multisigTxnBlobs) {
    if (multisigTxnBlobs.length < 2) {
        throw ERROR_MULTISIG_MERGE_LESSTHANTWO;
    }
    const refSigTx = encoding.decode(multisigTxnBlobs[0]);
    const refSigAlgoTx = MultisigTransaction.from_obj_for_encoding(refSigTx.txn);
    const refTxIDStr = refSigAlgoTx.txID().toString();
    const from = address.encode(refSigTx.txn.snd);

    let newSubsigs = refSigTx.msig.subsig;
    for (let i = 0; i < multisigTxnBlobs.length; i++) {
        let unisig = encoding.decode(multisigTxnBlobs[i]);
        let unisigAlgoTxn = MultisigTransaction.from_obj_for_encoding(unisig.txn);
        if (unisigAlgoTxn.txID().toString() !== refTxIDStr) {
            throw ERROR_MULTISIG_MERGE_MISMATCH;
        }
        // check multisig has same preimage as reference
        if (unisig.msig.subsig.length !== refSigTx.msig.subsig.length) {
            throw ERROR_MULTISIG_MERGE_WRONG_PREIMAGE;
        }
        let preimg = {
            "version": unisig.msig.v,
            "threshold": unisig.msig.thr,
            "pks": unisig.msig.subsig.map(subsig => {
                return subsig.pk;
            }),
        };
        if (from !== address.encode(address.fromMultisigPreImg(preimg))) {
            throw ERROR_MULTISIG_MERGE_WRONG_PREIMAGE;
        }
        // now, we can merge
        newSubsigs = unisig.msig.subsig.map((uniSubsig, index) => {
            let current = newSubsigs[index];
            if (current.s) {
                if (uniSubsig.s && Buffer.compare(uniSubsig.s, current.s) !== 0) {
                    // mismatch
                    throw ERROR_MULTISIG_MERGE_SIG_MISMATCH;
                }
                return {
                    "pk": current.pk,
                    "s": current.s,
                }
            } else if (uniSubsig.s) {
                return {
                    "pk": current.pk,
                    "s": uniSubsig.s,
                }
            }
            return current;
        });
    }
    let msig = {
        "v": refSigTx.msig.v,
        "thr": refSigTx.msig.thr,
        "subsig": newSubsigs,
    };
    let sTxn = {
        "msig": msig,
        "txn": refSigTx.txn,
    };
    return new Uint8Array(encoding.encode(sTxn));
}

function verifyMultisig(toBeVerified, msig, publicKey) {
    const version = msig.v;
    const threshold = msig.thr;
    const subsigs = msig.subsig;

    let pks = subsigs.map(
        (subsig) => subsig.pk
    );
    if (msig.subsig.length < threshold) {
        return false;
    }

    let pk;
    try {
        pk = address.fromMultisigPreImg({version, threshold, pks});
    } catch (e) {
        return false;
    }

    if (!utils.arrayEqual(pk, publicKey)) {
        return false;
    }

    let counter = 0;
    for (let subsig of subsigs) {
        if (subsig.s !== undefined) {
            counter += 1;
        }
    }
    if (counter < threshold) {
        return false;
    }

    let verifiedCounter = 0;
    for (let subsig of subsigs) {
        if (subsig.s !== undefined) {
            if (nacl.verify(toBeVerified, subsig.s, subsig.pk)) {
                verifiedCounter += 1;
            }
        }
    }

    if (verifiedCounter < threshold) {
        return false;
    }

    return true;
}

module.exports = {
    MultisigTransaction,
    mergeMultisigTransactions,
    createMultisigTransaction,
    verifyMultisig,
    ERROR_MULTISIG_MERGE_LESSTHANTWO,
    ERROR_MULTISIG_MERGE_MISMATCH,
    ERROR_MULTISIG_MERGE_WRONG_PREIMAGE,
    ERROR_MULTISIG_MERGE_SIG_MISMATCH,
};
