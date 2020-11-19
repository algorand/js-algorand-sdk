const { Buffer } = require("buffer");
const address = require("./encoding/address");
const encoding = require("./encoding/encoding");
const nacl = require("./nacl/naclWrappers");
const utils = require("./utils/utils");
const base32 = require('hi-base32');

const ALGORAND_TRANSACTION_LENGTH = 52;
const ALGORAND_MIN_TX_FEE = 1000; // version v5
const ALGORAND_TRANSACTION_LEASE_LENGTH = 32;
const ALGORAND_MAX_ASSET_DECIMALS = 19;
const NUM_ADDL_BYTES_AFTER_SIGNING = 75; // NUM_ADDL_BYTES_AFTER_SIGNING is the number of bytes added to a txn after signing it
const ALGORAND_TRANSACTION_LEASE_LABEL_LENGTH = 5
const ALGORAND_TRANSACTION_ADDRESS_LENGTH = 32;
const ALGORAND_TRANSACTION_REKEY_LABEL_LENGTH = 5;
/**
 * Transaction enables construction of Algorand transactions
 * */
class Transaction {
    constructor({from, to, fee, amount, firstRound, lastRound, note, genesisID, genesisHash, lease,
                 closeRemainderTo, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, 
                 assetIndex, assetTotal, assetDecimals, assetDefaultFrozen, assetManager, assetReserve,
                 assetFreeze, assetClawback, assetUnitName, assetName, assetURL, assetMetadataHash,
                 freezeAccount, freezeState, assetRevocationTarget,
                 appIndex, appOnComplete, appLocalInts, appLocalByteSlices,
                 appGlobalInts, appGlobalByteSlices, appApprovalProgram, appClearProgram,
                 appArgs, appAccounts, appForeignApps, appForeignAssets,
                 type="pay", flatFee=false, suggestedParams=undefined,
                 reKeyTo=undefined}) {
        this.name = "Transaction";
        this.tag = Buffer.from("TX");

        if (suggestedParams !== undefined) {
            genesisHash = suggestedParams.genesisHash;
            fee = suggestedParams.fee;
            if (suggestedParams.flatFee !== undefined) flatFee = suggestedParams.flatFee;
            firstRound = suggestedParams.firstRound;
            lastRound = suggestedParams.lastRound;
            genesisID = suggestedParams.genesisID;
        }

        from = address.decodeAddress(from);
        if (to !== undefined) to = address.decodeAddress(to);
        if (closeRemainderTo !== undefined) closeRemainderTo = address.decodeAddress(closeRemainderTo);
        if (assetManager !== undefined) assetManager = address.decodeAddress(assetManager);
        if (assetReserve !== undefined) assetReserve = address.decodeAddress(assetReserve);
        if (assetFreeze !== undefined) assetFreeze = address.decodeAddress(assetFreeze);
        if (assetClawback !== undefined) assetClawback = address.decodeAddress(assetClawback);
        if (assetRevocationTarget !== undefined) assetRevocationTarget = address.decodeAddress(assetRevocationTarget);
        if (freezeAccount !== undefined) freezeAccount = address.decodeAddress(freezeAccount);
        if (reKeyTo !== undefined) reKeyTo = address.decodeAddress(reKeyTo);
        if (genesisHash === undefined) throw Error("genesis hash must be specified and in a base64 string.");

        genesisHash = Buffer.from(genesisHash, 'base64');

        if (amount !== undefined && (!Number.isSafeInteger(amount) || amount < 0)) throw Error("Amount must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(fee) || fee < 0) throw Error("fee must be a positive number and smaller than 2^53-1");
        if (!Number.isSafeInteger(firstRound) || firstRound < 0) throw Error("firstRound must be a positive number");
        if (!Number.isSafeInteger(lastRound) || lastRound < 0) throw Error("lastRound must be a positive number");
        if (assetTotal !== undefined && (!Number.isSafeInteger(assetTotal) || assetTotal < 0)) throw Error("Total asset issuance must be a positive number and smaller than 2^53-1");
        if (assetDecimals !== undefined && (!Number.isSafeInteger(assetDecimals) || assetDecimals < 0 || assetDecimals > ALGORAND_MAX_ASSET_DECIMALS)) throw Error("assetDecimals must be a positive number and smaller than " + ALGORAND_MAX_ASSET_DECIMALS.toString());
        if (assetIndex !== undefined && (!Number.isSafeInteger(assetIndex) || assetIndex < 0)) throw Error("Asset index must be a positive number and smaller than 2^53-1");
        if (appIndex !== undefined && (!Number.isSafeInteger(appIndex) || appIndex < 0)) throw Error("Application index must be a positive number and smaller than 2^53-1");
        if (appLocalInts !== undefined && (!Number.isSafeInteger(appLocalInts) || appLocalInts < 0)) throw Error("Application local ints count must be a positive number and smaller than 2^53-1");
        if (appLocalByteSlices !== undefined && (!Number.isSafeInteger(appLocalByteSlices) || appLocalByteSlices < 0)) throw Error("Application local byte slices count must be a positive number and smaller than 2^53-1");
        if (appGlobalInts !== undefined && (!Number.isSafeInteger(appGlobalInts) || appGlobalInts < 0)) throw Error("Application global ints count must be a positive number and smaller than 2^53-1");
        if (appGlobalByteSlices !== undefined && (!Number.isSafeInteger(appGlobalByteSlices) || appGlobalByteSlices < 0)) throw Error("Application global byte slices count must be a positive number and smaller than 2^53-1")
        if (appApprovalProgram !== undefined) {
            if (appApprovalProgram.constructor !== Uint8Array) throw Error("appApprovalProgram must be a Uint8Array.");
        }
        if (appClearProgram !== undefined) {
            if (appClearProgram.constructor !== Uint8Array) throw Error("appClearProgram must be a Uint8Array.");
        }
        if (appArgs !== undefined) {
            if (!Array.isArray(appArgs)) throw Error("appArgs must be an Array of Uint8Array.");
            appArgs.forEach((arg) => {
                if (arg.constructor !== Uint8Array) throw Error("each element of AppArgs must be a Uint8Array.");
            });
        } else {
            appArgs = new Uint8Array(0);
        }
        if (appAccounts !== undefined) {
            appAccounts.forEach((addressAsString, index) => {
               appAccounts[index] = address.decodeAddress(addressAsString);
            })
        }
        if (appForeignApps !== undefined) {
            appForeignApps.forEach((foreignAppIndex) => {
               if (!Number.isSafeInteger(foreignAppIndex) || foreignAppIndex < 0) throw Error("each foreign application index must be a positive number and smaller than 2^53-1");
            });
        }
        if (appForeignAssets !== undefined) {
            appForeignAssets.forEach((foreignAssetIndex) => {
                if (!Number.isSafeInteger(foreignAssetIndex) || foreignAssetIndex < 0) throw Error("each foreign asset index must be a positive number and smaller than 2^53-1");
            });
        }
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
            freezeAccount, freezeState, assetRevocationTarget,
            appIndex, appOnComplete, appLocalInts, appLocalByteSlices, appGlobalInts, appGlobalByteSlices,
            appApprovalProgram, appClearProgram, appArgs, appAccounts, appForeignApps, appForeignAssets,
            type, reKeyTo
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
                "snd": Buffer.from(this.from.publicKey),
                "type": "pay",
                "gen": this.genesisID,
                "gh": this.genesisHash,
                "lx": Buffer.from(this.lease),
                "grp": this.group,
            };

            // parse close address
            if ((this.closeRemainderTo !== undefined) && (address.encodeAddress(this.closeRemainderTo.publicKey) !== address.ALGORAND_ZERO_ADDRESS_STRING)) {
                txn.close = Buffer.from(this.closeRemainderTo.publicKey);
            }
            if ((this.reKeyTo !== undefined)) {
                txn.rekey = Buffer.from(this.reKeyTo.publicKey)
            }
            // allowed zero values
            if (this.to !== undefined) txn.rcv = Buffer.from(this.to.publicKey);
            if (!txn.note.length) delete txn.note;
            if (!txn.amt) delete txn.amt;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;
            if (txn.grp === undefined) delete txn.grp;
            if (!txn.lx.length) delete txn.lx;
            if (!txn.rekey) delete txn.rekey;
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
                "votekd": this.voteKeyDilution,
            };
            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.lx.length) delete txn.lx;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;
            if (txn.grp === undefined) delete txn.grp;
            if ((this.reKeyTo !== undefined)) {
                txn.rekey = Buffer.from(this.reKeyTo.publicKey)
            }
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
                "grp": this.group,
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
            if ((this.reKeyTo !== undefined)) {
                txn.rekey = Buffer.from(this.reKeyTo.publicKey)
            }

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
                "grp": this.group,
                "xaid": this.assetIndex,
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
            if (!txn.rekey) delete txn.rekey;
            if ((this.reKeyTo !== undefined)) {
                txn.rekey = Buffer.from(this.reKeyTo.publicKey)
            }
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
                "grp": this.group,
                "faid": this.assetIndex,
                "afrz": this.freezeState,
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
            if ((this.reKeyTo !== undefined)) {
                txn.rekey = Buffer.from(this.reKeyTo.publicKey)
            }
            return txn;
        }
        else if (this.type == "appl") {
            // application call of some kind
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
                "apid": this.appIndex,
                "apan": this.appOnComplete,
                "apls": {
                    "nui": this.appLocalInts,
                    "nbs": this.appLocalByteSlices
                },
                "apgs": {
                    "nui": this.appGlobalInts,
                    "nbs": this.appGlobalByteSlices
                },
                "apfa": this.appForeignApps,
                "apas": this.appForeignAssets,
            };
            if ((this.reKeyTo !== undefined)) {
                txn.rekey = Buffer.from(this.reKeyTo.publicKey)
            }
            if (this.appApprovalProgram !== undefined) {
                txn.apap = Buffer.from(this.appApprovalProgram);
            }
            if (this.appClearProgram !== undefined) {
                txn.apsu = Buffer.from(this.appClearProgram);
            }
            if (this.appArgs !== undefined) {
                txn.apaa = [];
                this.appArgs.forEach((arg) => {
                    txn.apaa.push(Buffer.from(arg));
                });
            }
            if (this.appAccounts !== undefined) {
                txn.apat = [];
                this.appAccounts.forEach((decodedAddress) => {
                    txn.apat.push(Buffer.from(decodedAddress.publicKey));
                });
            }
            // allowed zero values
            if (!txn.note.length) delete txn.note;
            if (!txn.lx.length) delete txn.lx;
            if (!txn.amt) delete txn.amt;
            if (!txn.fee) delete txn.fee;
            if (!txn.gen) delete txn.gen;
            if (!txn.apid) delete txn.apid;
            if (!txn.apls.nui) delete txn.apls.nui;
            if (!txn.apls.nbs) delete txn.apls.nbs;
            if ((!txn.apls.nui) && (!txn.apls.nbs)) delete txn.apls;
            if (!txn.apgs.nui) delete txn.apgs.nui;
            if (!txn.apgs.nbs) delete txn.apgs.nbs;
            if (!txn.apaa || !txn.apaa.length) delete txn.apaa;
            if ((!txn.apgs.nui) && (!txn.apgs.nbs)) delete txn.apgs;
            if (!txn.apap) delete txn.apap;
            if (!txn.apsu) delete txn.apsu;
            if (!txn.apan) delete txn.apan;
            if (!txn.apfa) delete txn.apfa;
            if (!txn.apas) delete txn.apas;
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
        txn.from = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.snd)));
        if (txnForEnc.grp !== undefined) txn.group = Buffer.from(txnForEnc.grp);
        if (txnForEnc.rekey !== undefined) txn.reKeyTo = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.rekey)));

        if (txnForEnc.type === "pay") {
            txn.amount = txnForEnc.amt;
            txn.to = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.rcv)));
            if (txnForEnc.close !== undefined) txn.closeRemainderTo = address.decodeAddress(address.encodeAddress(txnForEnc.close));
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
                if (txnForEnc.apar.m !== undefined) txn.assetManager = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.apar.m)));
                if (txnForEnc.apar.r !== undefined) txn.assetReserve = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.apar.r)));
                if (txnForEnc.apar.f !== undefined) txn.assetFreeze = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.apar.f)));
                if (txnForEnc.apar.c !== undefined) txn.assetClawback = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.apar.c)));
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
                txn.closeRemainderTo = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.aclose)));
            }
            if (txnForEnc.asnd !== undefined) {
                txn.assetRevocationTarget = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.asnd)));
            }
            txn.to = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.arcv)));
        }
        else if (txnForEnc.type === "afrz") {
            if (txnForEnc.afrz !== undefined) {
                txn.freezeState = txnForEnc.afrz;
            }
            if (txnForEnc.faid !== undefined) {
                txn.assetIndex = txnForEnc.faid;
            }
            txn.freezeAccount = address.decodeAddress(address.encodeAddress(new Uint8Array(txnForEnc.fadd)));
        } else if (txnForEnc.type === "appl") {
            if (txnForEnc.apid !== undefined) {
                txn.appIndex = txnForEnc.apid;
            }
            if (txnForEnc.apan !== undefined) {
                txn.appOnComplete = txnForEnc.apan;
            }
            if (txnForEnc.apls !== undefined) {
                if (txnForEnc.apls.nui !== undefined) txn.appLocalInts = txnForEnc.apls.nui;
                if (txnForEnc.apls.nbs !== undefined) txn.appLocalByteSlices = txnForEnc.apls.nbs;
            }
            if (txnForEnc.apgs !== undefined) {
                if (txnForEnc.apgs.nui !== undefined) txn.appGlobalInts = txnForEnc.apgs.nui;
                if (txnForEnc.apgs.nbs !== undefined) txn.appGlobalByteSlices = txnForEnc.apgs.nbs;
            }
            if (txnForEnc.apap !== undefined) {
                txn.appApprovalProgram = new Uint8Array(txnForEnc.apap);
            }
            if (txnForEnc.apsu !== undefined) {
                txn.appClearProgram = new Uint8Array(txnForEnc.apsu);
            }
            if (txnForEnc.apaa !== undefined) {
                txn.appArgs = [];
                txnForEnc.apaa.forEach((arg) => {
                    txn.appArgs.push(new Uint8Array(arg));
                });
            }
            if (txnForEnc.apat !== undefined) {
                txn.appAccounts = [];
                txnForEnc.apat.forEach((addressBytes) => {
                   txn.appAccounts.push(address.decodeAddress(address.encodeAddress(new Uint8Array(addressBytes))));
                });
            }
            if (txnForEnc.apfa !== undefined) {
                txn.appForeignApps = txnForEnc.apfa;
            }
            if (txnForEnc.apas !== undefined) {
                txn.appForeignAssets = txnForEnc.apas;
            }
        }
        return txn;
    }

    estimateSize() {
        return (this.toByte().length + NUM_ADDL_BYTES_AFTER_SIGNING)
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
        // add AuthAddr if signing with a different key than From indicates
        let keypair = nacl.keyPairFromSecretKey(sk);
        let pubKeyFromSk = keypair["publicKey"];
        if (address.encodeAddress(pubKeyFromSk) != address.encodeAddress(this.from["publicKey"])) {
            sTxn["sgnr"] = Buffer.from(pubKeyFromSk);
        }
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
            this.fee += (ALGORAND_TRANSACTION_LEASE_LABEL_LENGTH + ALGORAND_TRANSACTION_LEASE_LENGTH) * feePerByte;
        }
    }

    // add the rekey-to field to a transaction not yet having it
    // supply feePerByte to increment fee accordingly
    addRekey(reKeyTo, feePerByte=0) {
        if (reKeyTo !== undefined) {
            this.reKeyTo = address.decodeAddress(reKeyTo);
        }
        if (feePerByte !== 0) {
            this.fee += (ALGORAND_TRANSACTION_REKEY_LABEL_LENGTH + ALGORAND_TRANSACTION_ADDRESS_LENGTH) * feePerByte;
        }
    }

    // build display dict for prettyPrint and toString
    _getDictForDisplay() {
        let forPrinting = {
            ...this
        };
        forPrinting.tag = forPrinting.tag.toString();
        forPrinting.from = address.encodeAddress(forPrinting.from.publicKey);
        if (forPrinting.to !== undefined) forPrinting.to = address.encodeAddress(forPrinting.to.publicKey);
        // things that need fixing:
        if (forPrinting.closeRemainderTo !== undefined) forPrinting.closeRemainderTo = address.encodeAddress(forPrinting.closeRemainderTo.publicKey);
        if (forPrinting.assetManager !== undefined) forPrinting.assetManager = address.encodeAddress(forPrinting.assetManager.publicKey);
        if (forPrinting.assetReserve !== undefined) forPrinting.assetReserve = address.encodeAddress(forPrinting.assetReserve.publicKey);
        if (forPrinting.assetFreeze !== undefined) forPrinting.assetFreeze = address.encodeAddress(forPrinting.assetFreeze.publicKey);
        if (forPrinting.assetClawback !== undefined) forPrinting.assetClawback = address.encodeAddress(forPrinting.assetClawback.publicKey);
        if (forPrinting.assetRevocationTarget !== undefined) forPrinting.assetRevocationTarget = address.encodeAddress(forPrinting.assetRevocationTarget.publicKey);
        if (forPrinting.reKeyTo !== undefined) forPrinting.reKeyTo = address.encodeAddress(forPrinting.reKeyTo.publicKey);
        forPrinting.genesisHash = forPrinting.genesisHash.toString('base64');
        return forPrinting;
    }

    // pretty print the transaction to console
    prettyPrint() {
        console.log(this._getDictForDisplay());
    }

    // get string representation
    toString() {
        return JSON.stringify(this._getDictForDisplay());
    }
}

/**
 * encodeUnsignedTransaction takes a completed txnBuilder.Transaction object, such as from the makeFoo
 * family of transactions, and converts it to a Buffer
 * @param transactionObject the completed Transaction object
 * @returns {Uint8Array}
 */
function encodeUnsignedTransaction(transactionObject) {
    let objToEncode = transactionObject.get_obj_for_encoding();
    return encoding.encode(objToEncode);
}

/**
 * decodeUnsignedTransaction takes a Buffer (as if from encodeUnsignedTransaction) and converts it to a txnBuilder.Transaction object
 * @param transactionBuffer the Uint8Array containing a transaction
 * @returns {Transaction}
 */
function decodeUnsignedTransaction(transactionBuffer) {
    let partlyDecodedObject = encoding.decode(transactionBuffer);
    return Transaction.from_obj_for_encoding(partlyDecodedObject);
}

/**
 * decodeSignedTransaction takes a Buffer (from transaction.signTxn) and converts it to an object
 * containing the Transaction (txn), the signature (sig), and the auth-addr field if applicable (sgnr)
 * @param transactionBuffer the Uint8Array containing a transaction
 * @returns {Object} containing a Transaction, the signature, and possibly an auth-addr field
 */
function decodeSignedTransaction(transactionBuffer) {
    let stxnDecoded = encoding.decode(transactionBuffer);
    stxnDecoded.txn = Transaction.from_obj_for_encoding(stxnDecoded.txn);
    return stxnDecoded;
}

module.exports = {
    Transaction,
    ALGORAND_MIN_TX_FEE,
    encodeUnsignedTransaction,
    decodeUnsignedTransaction,
    decodeSignedTransaction,
};
