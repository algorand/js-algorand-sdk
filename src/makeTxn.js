const txnBuilder = require('./transaction');

/**
 * makePaymentTxn takes payment arguments and returns a Transaction object
 * @param from - string representation of Algorand address of sender
 * @param to - string representation of Algorand address of recipient
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 * If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param amount - integer amount to send, in microAlgos
 * @param closeRemainderTo - optionally close out remaining account balance to this account, represented as string rep of Algorand address
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makePaymentTxn(from, to, fee, amount, closeRemainderTo, firstRound, lastRound, note, genesisHash, genesisID, rekeyTo=undefined) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makePaymentTxnWithSuggestedParams(from, to, amount, closeRemainderTo, note, suggestedParams, rekeyTo);
}

/**
 * makePaymentTxnWithSuggestedParams takes payment arguments and returns a Transaction object
 * @param from - string representation of Algorand address of sender
 * @param to - string representation of Algorand address of recipient
 * @param amount - integer amount to send, in microAlgos
 * @param closeRemainderTo - optionally close out remaining account balance to this account, represented as string rep of Algorand address
 * @param note - uint8array of arbitrary data for sender to store
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *      If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makePaymentTxnWithSuggestedParams(from, to, amount, closeRemainderTo, note, suggestedParams, rekeyTo=undefined) {
    let o = {
        "from": from,
        "to": to,
        "amount": amount,
        "closeRemainderTo": closeRemainderTo,
        "note": note,
        "suggestedParams": suggestedParams,
        "type": "pay",
        "rekeyTo": rekeyTo
    };
    return new txnBuilder.Transaction(o);
}

// helper for above makePaymentTxnWithSuggestedParams, instead accepting an arguments object
function makePaymentTxnWithSuggestedParamsFromObject(o) {
    return makePaymentTxnWithSuggestedParams(o.from, o.to, o.amount, o.closeRemainderTo,
        o.note, o.suggestedParams, o.rekeyTo);
}

/**
 * makeKeyRegistrationTxn takes key registration arguments and returns a Transaction object for
 * that key registration operation
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param voteKey - string representation of voting key. for key deregistration, leave undefined
 * @param selectionKey - string representation of selection key. for key deregistration, leave undefined
 * @param voteFirst - first round on which voteKey is valid
 * @param voteLast - last round on which voteKey is valid
 * @param voteKeyDilution - integer
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeKeyRegistrationTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                                voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, rekeyTo=undefined) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeKeyRegistrationTxnWithSuggestedParams(from, note, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, suggestedParams, rekeyTo);
}

/**
 * makeKeyRegistrationTxnWithSuggestedParams takes key registration arguments and returns a Transaction object for
 * that key registration operation
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param voteKey - string representation of voting key. for key deregistration, leave undefined
 * @param selectionKey - string representation of selection key. for key deregistration, leave undefined
 * @param voteFirst - first round on which voteKey is valid
 * @param voteLast - last round on which voteKey is valid
 * @param voteKeyDilution - integer
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeKeyRegistrationTxnWithSuggestedParams(from, note, voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution, suggestedParams, rekeyTo=undefined) {
    let o = {
        "from": from,
        "note": note,
        "voteKey": voteKey,
        "selectionKey": selectionKey,
        "voteFirst": voteFirst,
        "voteLast": voteLast,
        "voteKeyDilution": voteKeyDilution,
        "suggestedParams": suggestedParams,
        "type": "keyreg",
        "rekeyTo": rekeyTo
    };
    return new txnBuilder.Transaction(o);
}

// helper for above makeKeyRegistrationTxnWithSuggestedParams, instead accepting an arguments object
function makeKeyRegistrationTxnWithSuggestedParamsFromObject(o) {
    return makeKeyRegistrationTxnWithSuggestedParams(o.from, o.note, o.voteKey, o.selectionKey, o.voteFirst, o.voteLast,
        o.voteKeyDilution, o.suggestedParams, o.rekeyTo);
}

/** makeAssetCreateTxn takes asset creation arguments and returns a Transaction object
 * for creating that asset
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param total - integer total supply of the asset
 * @param decimals - integer number of decimals for asset unit calculation
 * @param defaultFrozen - boolean whether asset accounts should default to being frozen
 * @param manager - string representation of Algorand address in charge of reserve, freeze, clawback, destruction, etc
 * @param reserve - string representation of Algorand address representing asset reserve
 * @param freeze - string representation of Algorand address with power to freeze/unfreeze asset holdings
 * @param clawback - string representation of Algorand address with power to revoke asset holdings
 * @param unitName - string units name for this asset
 * @param assetName - string name for this asset
 * @param assetURL - string URL relating to this asset
 * @param assetMetadataHash - string representation of some sort of hash commitment with respect to the asset
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetCreateTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                            total, decimals, defaultFrozen, manager, reserve, freeze,
                            clawback, unitName, assetName, assetURL, assetMetadataHash, rekeyTo=undefined) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetCreateTxnWithSuggestedParams(from, note, total, decimals, defaultFrozen, manager, reserve, freeze, clawback,
        unitName, assetName, assetURL, assetMetadataHash, suggestedParams, rekeyTo);
}

/** makeAssetCreateTxnWithSuggestedParams takes asset creation arguments and returns a Transaction object
 * for creating that asset
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param total - integer total supply of the asset
 * @param decimals - integer number of decimals for asset unit calculation
 * @param defaultFrozen - boolean whether asset accounts should default to being frozen
 * @param manager - string representation of Algorand address in charge of reserve, freeze, clawback, destruction, etc
 * @param reserve - string representation of Algorand address representing asset reserve
 * @param freeze - string representation of Algorand address with power to freeze/unfreeze asset holdings
 * @param clawback - string representation of Algorand address with power to revoke asset holdings
 * @param unitName - string units name for this asset
 * @param assetName - string name for this asset
 * @param assetURL - string URL relating to this asset
 * @param assetMetadataHash - string representation of some sort of hash commitment with respect to the asset
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param rekeyTo - rekeyTo address, optional
 * @returns {Transaction}
 */
function makeAssetCreateTxnWithSuggestedParams(from, note, total, decimals, defaultFrozen, manager, reserve, freeze,
                            clawback, unitName, assetName, assetURL, assetMetadataHash, suggestedParams, rekeyTo=undefined) {
    let o = {
        "from": from,
        "note": note,
        "suggestedParams": suggestedParams,
        "assetTotal": total,
        "assetDecimals": decimals,
        "assetDefaultFrozen": defaultFrozen,
        "assetUnitName": unitName,
        "assetName": assetName,
        "assetURL": assetURL,
        "assetMetadataHash": assetMetadataHash,
        "assetManager": manager,
        "assetReserve": reserve,
        "assetFreeze": freeze,
        "assetClawback": clawback,
        "type": "acfg",
        "rekeyTo": rekeyTo
    };
    return new txnBuilder.Transaction(o);
}

// helper for above makeAssetCreateTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetCreateTxnWithSuggestedParamsFromObject(o) {
    return makeAssetCreateTxnWithSuggestedParams(o.from, o.note, o.total, o.decimals, o.defaultFrozen, o.manager,
        o.reserve, o.freeze, o.clawback, o.unitName, o.assetName, o.assetURL, o.assetMetadataHash, o.suggestedParams,
        o.rekeyTo) ;
}

/** makeAssetConfigTxn can be issued by the asset manager to change the manager, reserve, freeze, or clawback
 * you must respecify existing addresses to keep them the same; leaving a field blank is the same as turning
 * that feature off for this asset
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param manager - string representation of new asset manager Algorand address
 * @param reserve - string representation of new reserve Algorand address
 * @param freeze - string representation of new freeze manager Algorand address
 * @param clawback - string representation of new revocation manager Algorand address
 * @param strictEmptyAddressChecking - boolean - throw an error if any of manager, reserve, freeze, or clawback are undefined. optional, defaults to true.
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetConfigTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                            assetIndex, manager, reserve, freeze, clawback, strictEmptyAddressChecking=true, rekeyTo=undefined) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetConfigTxnWithSuggestedParams(from, note, assetIndex, manager, reserve, freeze, clawback, suggestedParams, strictEmptyAddressChecking, rekeyTo);
}

/** makeAssetConfigTxnWithSuggestedParams can be issued by the asset manager to change the manager, reserve, freeze, or clawback
 * you must respecify existing addresses to keep them the same; leaving a field blank is the same as turning
 * that feature off for this asset
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param manager - string representation of new asset manager Algorand address
 * @param reserve - string representation of new reserve Algorand address
 * @param freeze - string representation of new freeze manager Algorand address
 * @param clawback - string representation of new revocation manager Algorand address
 * @param strictEmptyAddressChecking - boolean - throw an error if any of manager, reserve, freeze, or clawback are undefined. optional, defaults to true.
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param rekeyTo - rekeyTo address, optional
 * @returns {Transaction}
 */
function makeAssetConfigTxnWithSuggestedParams(from, note, assetIndex,
                                      manager, reserve, freeze, clawback, suggestedParams, strictEmptyAddressChecking=true, rekeyTo=undefined) {
    if (strictEmptyAddressChecking && ((manager === undefined) || (reserve === undefined) || (freeze === undefined) || (clawback === undefined))) {
        throw Error("strict empty address checking was turned on, but at least one empty address was provided");
    }
    let o = {
        "from": from,
        "suggestedParams": suggestedParams,
        "assetIndex": assetIndex,
        "assetManager": manager,
        "assetReserve": reserve,
        "assetFreeze": freeze,
        "assetClawback": clawback,
        "type": "acfg",
        "note": note,
        "rekeyTo": rekeyTo
    };
    return new txnBuilder.Transaction(o);
}

// helper for above makeAssetConfigTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetConfigTxnWithSuggestedParamsFromObject(o) {
    return makeAssetConfigTxnWithSuggestedParams(o.from, o.note, o.assetIndex,
        o.manager, o.reserve, o.freeze, o.clawback, o.suggestedParams, o.strictEmptyAddressChecking, o.rekeyTo) ;
}

/** makeAssetDestroyTxn will allow the asset's manager to remove this asset from the ledger, so long
 * as all outstanding assets are held by the creator.
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetDestroyTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID, assetIndex, rekeyTo=undefined) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetDestroyTxnWithSuggestedParams(from, note, assetIndex, suggestedParams, rekeyTo);
}

/** makeAssetDestroyTxnWithSuggestedParams will allow the asset's manager to remove this asset from the ledger, so long
 * as all outstanding assets are held by the creator.
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param rekeyTo - rekeyTo address, optional
 * @returns {Transaction}
 */
function makeAssetDestroyTxnWithSuggestedParams(from, note, assetIndex, suggestedParams, rekeyTo=undefined) {
    let o = {
        "from": from,
        "suggestedParams": suggestedParams,
        "assetIndex": assetIndex,
        "type": "acfg",
        "note": note,
        "rekeyTo": rekeyTo
    };
    return new txnBuilder.Transaction(o);
}

// helper for above makeAssetDestroyTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetDestroyTxnWithSuggestedParamsFromObject(o) {
    return makeAssetDestroyTxnWithSuggestedParams(o.from, o.note, o.assetIndex, o.suggestedParams, o.rekeyTo);
}

/** makeAssetFreezeTxn will allow the asset's freeze manager to freeze or un-freeze an account,
 * blocking or allowing asset transfers to and from the targeted account.
 *
 * @param from - string representation of Algorand address of sender
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param freezeTarget - string representation of Algorand address being frozen or unfrozen
 * @param freezeState - true if freezeTarget should be frozen, false if freezeTarget should be allowed to transact
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetFreezeTxn(from, fee, firstRound, lastRound, note, genesisHash, genesisID,
                            assetIndex, freezeTarget, freezeState, rekeyTo=undefined) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetFreezeTxnWithSuggestedParams(from, note, assetIndex, freezeTarget, freezeState, suggestedParams, rekeyTo);
}

/** makeAssetFreezeTxnWithSuggestedParams will allow the asset's freeze manager to freeze or un-freeze an account,
 * blocking or allowing asset transfers to and from the targeted account.
 *
 * @param from - string representation of Algorand address of sender
 * @param note - uint8array of arbitrary data for sender to store
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param freezeTarget - string representation of Algorand address being frozen or unfrozen
 * @param freezeState - true if freezeTarget should be frozen, false if freezeTarget should be allowed to transact
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param rekeyTo - rekeyTo address, optional
 * @returns {Transaction}
 */
function makeAssetFreezeTxnWithSuggestedParams(from, note, assetIndex, freezeTarget, freezeState, suggestedParams, rekeyTo=undefined) {
    let o = {
        "from": from,
        "type": "afrz",
        "freezeAccount": freezeTarget,
        "assetIndex": assetIndex,
        "freezeState" : freezeState,
        "note": note,
        "suggestedParams": suggestedParams,
        "rekeyTo": rekeyTo
    };
    return new txnBuilder.Transaction(o);
}

// helper for above makeAssetFreezeTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetFreezeTxnWithSuggestedParamsFromObject(o) {
    return makeAssetFreezeTxnWithSuggestedParams(o.from, o.note, o.assetIndex, o.freezeTarget,
        o.freezeState, o.suggestedParams, o.rekeyTo);
}

/** makeAssetTransferTxn allows for the creation of an asset transfer transaction.
 * Special case: to begin accepting assets, set amount=0 and from=to.
 *
 * @param from - string representation of Algorand address of sender
 * @param to - string representation of Algorand address of asset recipient
 * @param closeRemainderTo - optional - string representation of Algorand address - if provided,
 * send all remaining assets after transfer to the "closeRemainderTo" address and close "from"'s asset holdings
 * @param revocationTarget - optional - string representation of Algorand address - if provided,
 * and if "from" is the asset's revocation manager, then deduct from "revocationTarget" rather than "from"
 * @param fee - integer fee per byte, in microAlgos. for a flat fee, overwrite the fee property on the returned object
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param amount - integer amount of assets to send
 * @param firstRound - integer first protocol round on which this txn is valid
 * @param lastRound - integer last protocol round on which this txn is valid
 * @param note - uint8array of arbitrary data for sender to store
 * @param genesisHash - string specifies hash genesis block of network in use
 * @param genesisID - string specifies genesis ID of network in use
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 * @returns {Transaction}
 */
function makeAssetTransferTxn(from, to, closeRemainderTo, revocationTarget,
                              fee, amount, firstRound, lastRound, note, genesisHash, genesisID, assetIndex, rekeyTo=undefined) {
    let suggestedParams = {
        "genesisHash": genesisHash,
        "genesisID": genesisID,
        "firstRound": firstRound,
        "lastRound": lastRound,
        "fee": fee
    };
    return makeAssetTransferTxnWithSuggestedParams(from, to, closeRemainderTo, revocationTarget, amount, note, assetIndex, suggestedParams, rekeyTo);
}

/** makeAssetTransferTxnWithSuggestedParams allows for the creation of an asset transfer transaction.
 * Special case: to begin accepting assets, set amount=0 and from=to.
 *
 * @param from - string representation of Algorand address of sender
 * @param to - string representation of Algorand address of asset recipient
 * @param closeRemainderTo - optional - string representation of Algorand address - if provided,
 * send all remaining assets after transfer to the "closeRemainderTo" address and close "from"'s asset holdings
 * @param revocationTarget - optional - string representation of Algorand address - if provided,
 * and if "from" is the asset's revocation manager, then deduct from "revocationTarget" rather than "from"
 * @param amount - integer amount of assets to send
 * @param note - uint8array of arbitrary data for sender to store
 * @param assetIndex - int asset index uniquely specifying the asset
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param rekeyTo - rekeyTo address, optional
 * @returns {Transaction}
 */
function makeAssetTransferTxnWithSuggestedParams(from, to, closeRemainderTo, revocationTarget,
                              amount, note, assetIndex, suggestedParams, rekeyTo=undefined) {
    let o = {
        "type": "axfer",
        "from": from,
        "to": to,
        "amount": amount,
        "suggestedParams": suggestedParams,
        "assetIndex": assetIndex,
        "note": note,
        "assetRevocationTarget": revocationTarget,
        "closeRemainderTo": closeRemainderTo,
        "rekeyTo": rekeyTo
    };
    return new txnBuilder.Transaction(o);
}

// helper for above makeAssetTransferTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetTransferTxnWithSuggestedParamsFromObject(o) {
    return makeAssetTransferTxnWithSuggestedParams(o.from, o.to, o.closeRemainderTo, o.revocationTarget,
        o.amount, o.note, o.assetIndex, o.suggestedParams, o.rekeyTo);
}

/*
 * Enums for application transactions on-transaction-complete behavior
 */
let OnApplicationComplete = {
    // NoOpOC indicates that an application transaction will simply call its
    // ApprovalProgram
    NoOpOC : 0,
    // OptInOC indicates that an application transaction will allocate some
    // LocalState for the application in the sender's account
    OptInOC : 1,
    // CloseOutOC indicates that an application transaction will deallocate
    // some LocalState for the application from the user's account
    CloseOutOC : 2,
    // ClearStateOC is similar to CloseOutOC, but may never fail. This
    // allows users to reclaim their minimum balance from an application
    // they no longer wish to opt in to.
    ClearStateOC : 3,
    // UpdateApplicationOC indicates that an application transaction will
    // update the ApprovalProgram and ClearStateProgram for the application
    UpdateApplicationOC : 4,
    // DeleteApplicationOC indicates that an application transaction will
    // delete the AppParams for the application from the creator's balance
    // record
    DeleteApplicationOC : 5
}

/**
 * Make a transaction that will create an application.
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param onComplete - algosdk.OnApplicationComplete, what application should do once the program is done being run
 * @param approvalProgram - Uint8Array, the compiled TEAL that approves a transaction
 * @param clearProgram - Uint8Array, the compiled TEAL that runs when clearing state
 * @param numLocalInts - restricts number of ints in per-user local state
 * @param numLocalByteSlices - restricts number of byte slices in per-user local state
 * @param numGlobalInts - restricts number of ints in global state
 * @param numGlobalByteSlices - restricts number of byte slices in global state
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param foreignAssets, optional - Array of int, any assets used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationCreateTxn(from, suggestedParams, onComplete, approvalProgram, clearProgram,
                                  numLocalInts, numLocalByteSlices, numGlobalInts, numGlobalByteSlices,
                                  appArgs= undefined, accounts= undefined, foreignApps= undefined,
                                  foreignAssets = undefined,
                                  note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": 0,
        "appOnComplete": onComplete,
        "appLocalInts": numLocalInts,
        "appLocalByteSlices": numLocalByteSlices,
        "appGlobalInts": numGlobalInts,
        "appGlobalByteSlices": numGlobalByteSlices,
        "appApprovalProgram": approvalProgram,
        "appClearProgram": clearProgram,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "appForeignAssets": foreignAssets,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationCreateTxn, instead accepting an arguments object
function makeApplicationCreateTxnFromObject(o) {
    return makeApplicationCreateTxn(o.from, o.suggestedParams, o.onComplete, o.approvalProgram, o.clearProgram,
        o.numLocalInts, o.numLocalByteSlices, o.numGlobalInts, o.numGlobalByteSlices,
        o.appArgs, o.accounts, o.foreignApps, o.foreignAssets, o.note, o.lease, o.rekeyTo);
}

/**
 * Make a transaction that changes an application's approval and clear programs
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to be updated
 * @param approvalProgram - Uint8Array, the compiled TEAL that approves a transaction
 * @param clearProgram - Uint8Array, the compiled TEAL that runs when clearing state
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param foreignAssets, optional - Array of int, any assets used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationUpdateTxn(from, suggestedParams, appIndex, approvalProgram, clearProgram,
                                  appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                  foreignAssets = undefined,
                                  note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appApprovalProgram": approvalProgram,
        "appOnComplete": OnApplicationComplete.UpdateApplicationOC,
        "appClearProgram": clearProgram,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "appForeignAssets": foreignAssets,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationUpdateTxn, instead accepting an arguments object
function makeApplicationUpdateTxnFromObject(o) {
    return makeApplicationUpdateTxn(o.from, o.suggestedParams, o.appIndex, o.approvalProgram, o.clearProgram,
        o.appArgs, o.accounts, o.foreignApps, o.foreignAssets, o.note, o.lease, o.rekeyTo);
}

/**
 * Make a transaction that deletes an application
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to be deleted
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param foreignAssets, optional - Array of int, any assets used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationDeleteTxn(from, suggestedParams, appIndex,
                                  appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                  foreignAssets = undefined,
                                  note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.DeleteApplicationOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "appForeignAssets": foreignAssets,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationDeleteTxn, instead accepting an arguments object
function makeApplicationDeleteTxnFromObject(o) {
   return makeApplicationDeleteTxn(o.from, o.suggestedParams, o.appIndex,
       o.appArgs, o.accounts, o.foreignApps, o.foreignAssets, o.note, o.lease, o.rekeyTo);
}

/**
 * Make a transaction that opts in to use an application
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to join
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param foreignAssets, optional - Array of int, any assets used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationOptInTxn(from, suggestedParams, appIndex,
                                 appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                 foreignAssets = undefined,
                                 note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.OptInOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "appForeignAssets": foreignAssets,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationOptInTxn, instead accepting an argument object
function makeApplicationOptInTxnFromObject(o) {
    return makeApplicationOptInTxn(o.from, o.suggestedParams, o.appIndex,
        o.appArgs, o.accounts, o.foreignApps, o.foreignAssets, o.note, o.lease, o.rekeyTo);
}

/**
 * Make a transaction that closes out a user's state in an application
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to use
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param foreignAssets, optional - Array of int, any assets used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationCloseOutTxn(from, suggestedParams, appIndex,
                                    appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                    foreignAssets = undefined,
                                    note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.CloseOutOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "appForeignAssets": foreignAssets,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationCloseOutTxn, instead accepting an argument object
function makeApplicationCloseOutTxnFromObject(o) {
    return makeApplicationCloseOutTxn(o.from, o.suggestedParams, o.appIndex,
        o.appArgs, o.accounts, o.foreignApps, o.foreignAssets, o.note, o.lease, o.rekeyTo);
}


/**
 * Make a transaction that clears a user's state in an application
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to use
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param foreignAssets, optional - Array of int, any assets used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationClearStateTxn(from, suggestedParams, appIndex,
                                      appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                      foreignAssets = undefined,
                                      note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.ClearStateOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "appForeignAssets": foreignAssets,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationClearStateTxn, instead accepting an argument object
function makeApplicationClearStateTxnFromObject(o) {
    return makeApplicationClearStateTxn(o.from, o.suggestedParams, o.appIndex,
        o.appArgs, o.accounts, o.foreignApps, o.foreignAssets, o.note, o.lease, o.rekeyTo)
}


/**
 * Make a transaction that just calls an application, doing nothing on completion
 * @param from - address of sender
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param appIndex - the ID of the app to use
 * @param appArgs, optional - Array of Uint8Array, any additional arguments to the application
 * @param accounts, optional - Array of Address strings, any additional accounts to supply to the application
 * @param foreignApps, optional - Array of int, any other apps used by the application, identified by index
 * @param foreignAssets, optional - Array of int, any assets used by the application, identified by index
 * @param note, optional
 * @param lease, optional
 * @param rekeyTo, optional
 */
function makeApplicationNoOpTxn(from, suggestedParams, appIndex,
                                appArgs = undefined, accounts = undefined, foreignApps = undefined,
                                foreignAssets = undefined,
                                note = undefined, lease = undefined, rekeyTo = undefined) {
    let o = {
        "type" : "appl",
        "from": from,
        "suggestedParams": suggestedParams,
        "appIndex": appIndex,
        "appOnComplete": OnApplicationComplete.NoOpOC,
        "appArgs": appArgs,
        "appAccounts": accounts,
        "appForeignApps": foreignApps,
        "appForeignAssets": foreignAssets,
        "note": note,
        "lease": lease,
        "reKeyTo": rekeyTo
    }
    return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationNoOpTxn, instead accepting an argument object
function makeApplicationNoOpTxnFromObject(o) {
    return makeApplicationNoOpTxn(o.from, o.suggestedParams, o.appIndex,
        o.appArgs, o.accounts, o.foreignApps, o.foreignAssets, o.note, o.lease, o.rekeyTo);
}

module.exports = {
    makePaymentTxn,
    makePaymentTxnWithSuggestedParams,
    makePaymentTxnWithSuggestedParamsFromObject,
    makeKeyRegistrationTxn,
    makeKeyRegistrationTxnWithSuggestedParams,
    makeKeyRegistrationTxnWithSuggestedParamsFromObject,
    makeAssetCreateTxn,
    makeAssetCreateTxnWithSuggestedParams,
    makeAssetCreateTxnWithSuggestedParamsFromObject,
    makeAssetConfigTxn,
    makeAssetConfigTxnWithSuggestedParams,
    makeAssetConfigTxnWithSuggestedParamsFromObject,
    makeAssetDestroyTxn,
    makeAssetDestroyTxnWithSuggestedParams,
    makeAssetDestroyTxnWithSuggestedParamsFromObject,
    makeAssetFreezeTxn,
    makeAssetFreezeTxnWithSuggestedParams,
    makeAssetFreezeTxnWithSuggestedParamsFromObject,
    makeAssetTransferTxn,
    makeAssetTransferTxnWithSuggestedParams,
    makeAssetTransferTxnWithSuggestedParamsFromObject,
    OnApplicationComplete,
    makeApplicationCreateTxn,
    makeApplicationCreateTxnFromObject,
    makeApplicationUpdateTxn,
    makeApplicationUpdateTxnFromObject,
    makeApplicationDeleteTxn,
    makeApplicationDeleteTxnFromObject,
    makeApplicationOptInTxn,
    makeApplicationOptInTxnFromObject,
    makeApplicationCloseOutTxn,
    makeApplicationCloseOutTxnFromObject,
    makeApplicationClearStateTxn,
    makeApplicationClearStateTxnFromObject,
    makeApplicationNoOpTxn,
    makeApplicationNoOpTxnFromObject,
};
