import txnBuilder from './transaction';
import { OnApplicationComplete } from './types/transactions/base';
import {
  // Transaction types
  PaymentTxn,
  KeyRegistrationTxn,

  // Utilities
  TransactionType,
  SuggestedParams,
  MustHaveSuggestedParams,
  MustHaveSuggestedParamsInline,
  AssetCreateTxn,
  AssetConfigTxn,
  AssetDestroyTxn,
  AssetFreezeTxn,
  AssetTransferTxn,
  AppCreateTxn,
  AppUpdateTxn,
  AppDeleteTxn,
  AppOptInTxn,
} from './types/transactions';
import { RenameProperties, RenameProperty } from './types/utils';

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
 */
function makePaymentTxnWithSuggestedParams(
  from: PaymentTxn['from'],
  to: PaymentTxn['to'],
  amount: PaymentTxn['amount'],
  closeRemainderTo: PaymentTxn['closeRemainderTo'],
  note: PaymentTxn['note'],
  suggestedParams: MustHaveSuggestedParams<PaymentTxn>['suggestedParams'],
  rekeyTo: PaymentTxn['reKeyTo']
) {
  const o: PaymentTxn = {
    from,
    to,
    amount,
    closeRemainderTo,
    note,
    suggestedParams,
    type: TransactionType.pay,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
}

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
 */
function makePaymentTxn(
  from: PaymentTxn['from'],
  to: PaymentTxn['to'],
  fee: MustHaveSuggestedParamsInline<PaymentTxn>['fee'],
  amount: PaymentTxn['amount'],
  closeRemainderTo: PaymentTxn['closeRemainderTo'],
  firstRound: MustHaveSuggestedParamsInline<PaymentTxn>['firstRound'],
  lastRound: MustHaveSuggestedParamsInline<PaymentTxn>['lastRound'],
  note: PaymentTxn['note'],
  genesisHash: MustHaveSuggestedParamsInline<PaymentTxn>['genesisHash'],
  genesisID: MustHaveSuggestedParamsInline<PaymentTxn>['genesisID'],
  reKeyTo: PaymentTxn['reKeyTo']
) {
  const suggestedParams: SuggestedParams = {
    genesisHash,
    genesisID,
    firstRound,
    lastRound,
    fee,
  };
  return makePaymentTxnWithSuggestedParams(
    from,
    to,
    amount,
    closeRemainderTo,
    note,
    suggestedParams,
    reKeyTo
  );
}

// helper for above makePaymentTxnWithSuggestedParams, instead accepting an arguments object
function makePaymentTxnWithSuggestedParamsFromObject(
  o: Pick<
    MustHaveSuggestedParams<PaymentTxn>,
    | 'from'
    | 'to'
    | 'amount'
    | 'closeRemainderTo'
    | 'note'
    | 'suggestedParams'
    | 'reKeyTo'
  >
) {
  return makePaymentTxnWithSuggestedParams(
    o.from,
    o.to,
    o.amount,
    o.closeRemainderTo,
    o.note,
    o.suggestedParams,
    o.reKeyTo
  );
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
 * @param nonParticipation - configure whether the address wants to stop participating. If true,
 *   voteKey, selectionKey, voteFirst, voteLast, and voteKeyDilution must be undefined.
 */
function makeKeyRegistrationTxnWithSuggestedParams(
  from: KeyRegistrationTxn['from'],
  note: KeyRegistrationTxn['note'],
  voteKey: KeyRegistrationTxn['voteKey'],
  selectionKey: KeyRegistrationTxn['selectionKey'],
  voteFirst: KeyRegistrationTxn['voteFirst'],
  voteLast: KeyRegistrationTxn['voteLast'],
  voteKeyDilution: KeyRegistrationTxn['voteKeyDilution'],
  suggestedParams: MustHaveSuggestedParams<KeyRegistrationTxn>['suggestedParams'],
  rekeyTo: KeyRegistrationTxn['reKeyTo'],
  nonParticipation: KeyRegistrationTxn['nonParticipation'] = false
) {
  const o: KeyRegistrationTxn = {
    from,
    note,
    voteKey,
    selectionKey,
    voteFirst,
    voteLast,
    voteKeyDilution,
    suggestedParams,
    type: TransactionType.keyreg,
    reKeyTo: rekeyTo,
    nonParticipation,
  };
  return new txnBuilder.Transaction(o);
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
 * @param nonParticipation - configure whether the address wants to stop participating. If true,
 *   voteKey, selectionKey, voteFirst, voteLast, and voteKeyDilution must be undefined.
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 */
function makeKeyRegistrationTxn(
  from: KeyRegistrationTxn['from'],
  fee: MustHaveSuggestedParamsInline<KeyRegistrationTxn>['fee'],
  firstRound: MustHaveSuggestedParamsInline<KeyRegistrationTxn>['firstRound'],
  lastRound: MustHaveSuggestedParamsInline<KeyRegistrationTxn>['lastRound'],
  note: KeyRegistrationTxn['note'],
  genesisHash: MustHaveSuggestedParamsInline<KeyRegistrationTxn>['genesisHash'],
  genesisID: MustHaveSuggestedParamsInline<KeyRegistrationTxn>['genesisID'],
  voteKey: KeyRegistrationTxn['voteKey'],
  selectionKey: KeyRegistrationTxn['selectionKey'],
  voteFirst: KeyRegistrationTxn['voteFirst'],
  voteLast: KeyRegistrationTxn['voteLast'],
  voteKeyDilution: KeyRegistrationTxn['voteKeyDilution'],
  rekeyTo: KeyRegistrationTxn['reKeyTo'],
  nonParticipation: KeyRegistrationTxn['nonParticipation'] = false
) {
  const suggestedParams: SuggestedParams = {
    genesisHash,
    genesisID,
    firstRound,
    lastRound,
    fee,
  };
  return makeKeyRegistrationTxnWithSuggestedParams(
    from,
    note,
    voteKey,
    selectionKey,
    voteFirst,
    voteLast,
    voteKeyDilution,
    suggestedParams,
    rekeyTo,
    nonParticipation
  );
}

// helper for above makeKeyRegistrationTxnWithSuggestedParams, instead accepting an arguments object
function makeKeyRegistrationTxnWithSuggestedParamsFromObject(
  o: Pick<
    RenameProperty<
      MustHaveSuggestedParams<KeyRegistrationTxn>,
      'reKeyTo',
      'rekeyTo'
    >,
    | 'from'
    | 'note'
    | 'voteKey'
    | 'selectionKey'
    | 'voteFirst'
    | 'voteLast'
    | 'voteKeyDilution'
    | 'suggestedParams'
    | 'rekeyTo'
    | 'nonParticipation'
  >
) {
  return makeKeyRegistrationTxnWithSuggestedParams(
    o.from,
    o.note,
    o.voteKey,
    o.selectionKey,
    o.voteFirst,
    o.voteLast,
    o.voteKeyDilution,
    o.suggestedParams,
    o.rekeyTo,
    o.nonParticipation
  );
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
 * @param assetMetadataHash - Uint8Array or UTF-8 string representation of a hash commitment with respect to the asset. Must be exactly 32 bytes long.
 * @param suggestedParams - a dict holding common-to-all-txns args:
 * fee - integer fee per byte, in microAlgos. for a flat fee, set flatFee to true
 * flatFee - bool optionally set this to true to specify fee as microalgos-per-txn
 *  If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * firstRound - integer first protocol round on which this txn is valid
 * lastRound - integer last protocol round on which this txn is valid
 * genesisHash - string specifies hash genesis block of network in use
 * genesisID - string specifies genesis ID of network in use
 * @param rekeyTo - rekeyTo address, optional
 */
function makeAssetCreateTxnWithSuggestedParams(
  from: AssetCreateTxn['from'],
  note: AssetCreateTxn['note'],
  total: AssetCreateTxn['assetTotal'],
  decimals: AssetCreateTxn['assetDecimals'],
  defaultFrozen: AssetCreateTxn['assetDefaultFrozen'],
  manager: AssetCreateTxn['assetManager'],
  reserve: AssetCreateTxn['assetReserve'],
  freeze: AssetCreateTxn['assetFreeze'],
  clawback: AssetCreateTxn['assetClawback'],
  unitName: AssetCreateTxn['assetUnitName'],
  assetName: AssetCreateTxn['assetName'],
  assetURL: AssetCreateTxn['assetURL'],
  assetMetadataHash: AssetCreateTxn['assetMetadataHash'],
  suggestedParams: MustHaveSuggestedParams<AssetCreateTxn>['suggestedParams'],
  rekeyTo: AssetCreateTxn['reKeyTo']
) {
  const o: AssetCreateTxn = {
    from,
    note,
    suggestedParams,
    assetTotal: total,
    assetDecimals: decimals,
    assetDefaultFrozen: defaultFrozen,
    assetUnitName: unitName,
    assetName,
    assetURL,
    assetMetadataHash,
    assetManager: manager,
    assetReserve: reserve,
    assetFreeze: freeze,
    assetClawback: clawback,
    type: TransactionType.acfg,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
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
 * @param assetMetadataHash - Uint8Array or UTF-8 string representation of a hash commitment with respect to the asset. Must be exactly 32 bytes long.
 * @param rekeyTo - rekeyTo address, optional
 * @Deprecated in version 2.0 this will change to use the "WithSuggestedParams" signature.
 */
function makeAssetCreateTxn(
  from: AssetCreateTxn['from'],
  fee: MustHaveSuggestedParamsInline<AssetCreateTxn>['fee'],
  firstRound: MustHaveSuggestedParamsInline<AssetCreateTxn>['firstRound'],
  lastRound: MustHaveSuggestedParamsInline<AssetCreateTxn>['lastRound'],
  note: AssetCreateTxn['note'],
  genesisHash: MustHaveSuggestedParamsInline<AssetCreateTxn>['genesisHash'],
  genesisID: MustHaveSuggestedParamsInline<AssetCreateTxn>['genesisID'],
  total: AssetCreateTxn['assetTotal'],
  decimals: AssetCreateTxn['assetDecimals'],
  defaultFrozen: AssetCreateTxn['assetDefaultFrozen'],
  manager: AssetCreateTxn['assetManager'],
  reserve: AssetCreateTxn['assetManager'],
  freeze: AssetCreateTxn['assetFreeze'],
  clawback: AssetCreateTxn['assetClawback'],
  unitName: AssetCreateTxn['assetUnitName'],
  assetName: AssetCreateTxn['assetName'],
  assetURL: AssetCreateTxn['assetURL'],
  assetMetadataHash: AssetCreateTxn['assetMetadataHash'],
  rekeyTo: AssetCreateTxn['reKeyTo']
) {
  const suggestedParams: SuggestedParams = {
    genesisHash,
    genesisID,
    firstRound,
    lastRound,
    fee,
  };
  return makeAssetCreateTxnWithSuggestedParams(
    from,
    note,
    total,
    decimals,
    defaultFrozen,
    manager,
    reserve,
    freeze,
    clawback,
    unitName,
    assetName,
    assetURL,
    assetMetadataHash,
    suggestedParams,
    rekeyTo
  );
}

// helper for above makeAssetCreateTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetCreateTxnWithSuggestedParamsFromObject(
  o: Pick<
    RenameProperties<
      MustHaveSuggestedParams<AssetCreateTxn>,
      {
        reKeyTo: 'rekeyTo';
        assetTotal: 'total';
        assetDecimals: 'decimals';
        assetDefaultFrozen: 'defaultFrozen';
        assetManager: 'manager';
        assetReserve: 'reserve';
        assetFreeze: 'freeze';
        assetClawback: 'clawback';
        assetUnitName: 'unitName';
      }
    >,
    | 'from'
    | 'note'
    | 'total'
    | 'decimals'
    | 'defaultFrozen'
    | 'manager'
    | 'reserve'
    | 'freeze'
    | 'clawback'
    | 'unitName'
    | 'assetName'
    | 'assetURL'
    | 'assetMetadataHash'
    | 'suggestedParams'
    | 'rekeyTo'
  >
) {
  return makeAssetCreateTxnWithSuggestedParams(
    o.from,
    o.note,
    o.total,
    o.decimals,
    o.defaultFrozen,
    o.manager,
    o.reserve,
    o.freeze,
    o.clawback,
    o.unitName,
    o.assetName,
    o.assetURL,
    o.assetMetadataHash,
    o.suggestedParams,
    o.rekeyTo
  );
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
 */
function makeAssetConfigTxnWithSuggestedParams(
  from: AssetConfigTxn['from'],
  note: AssetConfigTxn['note'],
  assetIndex: AssetConfigTxn['assetIndex'],
  manager: AssetConfigTxn['assetManager'],
  reserve: AssetConfigTxn['assetReserve'],
  freeze: AssetConfigTxn['assetFreeze'],
  clawback: AssetConfigTxn['assetClawback'],
  suggestedParams: MustHaveSuggestedParams<AssetConfigTxn>['suggestedParams'],
  strictEmptyAddressChecking = true,
  rekeyTo: AssetConfigTxn['reKeyTo']
) {
  if (
    strictEmptyAddressChecking &&
    (manager === undefined ||
      reserve === undefined ||
      freeze === undefined ||
      clawback === undefined)
  ) {
    throw Error(
      'strict empty address checking was turned on, but at least one empty address was provided'
    );
  }
  const o: AssetConfigTxn = {
    from,
    suggestedParams,
    assetIndex,
    assetManager: manager,
    assetReserve: reserve,
    assetFreeze: freeze,
    assetClawback: clawback,
    type: TransactionType.acfg,
    note,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
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
 */
function makeAssetConfigTxn(
  from: AssetConfigTxn['from'],
  fee: MustHaveSuggestedParamsInline<AssetConfigTxn>['fee'],
  firstRound: MustHaveSuggestedParamsInline<AssetConfigTxn>['firstRound'],
  lastRound: MustHaveSuggestedParamsInline<AssetConfigTxn>['lastRound'],
  note: AssetConfigTxn['note'],
  genesisHash: MustHaveSuggestedParamsInline<AssetConfigTxn>['genesisHash'],
  genesisID: MustHaveSuggestedParamsInline<AssetConfigTxn>['genesisID'],
  assetIndex: AssetConfigTxn['assetIndex'],
  manager: AssetConfigTxn['assetManager'],
  reserve: AssetConfigTxn['assetReserve'],
  freeze: AssetConfigTxn['assetFreeze'],
  clawback: AssetConfigTxn['assetClawback'],
  strictEmptyAddressChecking = true,
  rekeyTo: AssetConfigTxn['reKeyTo']
) {
  const suggestedParams: SuggestedParams = {
    genesisHash,
    genesisID,
    firstRound,
    lastRound,
    fee,
  };
  return makeAssetConfigTxnWithSuggestedParams(
    from,
    note,
    assetIndex,
    manager,
    reserve,
    freeze,
    clawback,
    suggestedParams,
    strictEmptyAddressChecking,
    rekeyTo
  );
}

// helper for above makeAssetConfigTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetConfigTxnWithSuggestedParamsFromObject(
  o: Pick<
    RenameProperties<
      MustHaveSuggestedParams<AssetConfigTxn>,
      {
        reKeyTo: 'rekeyTo';
        assetManager: 'manager';
        assetReserve: 'reserve';
        assetFreeze: 'freeze';
        assetClawback: 'clawback';
      }
    >,
    | 'from'
    | 'note'
    | 'assetIndex'
    | 'manager'
    | 'reserve'
    | 'freeze'
    | 'clawback'
    | 'suggestedParams'
    | 'rekeyTo'
  > & {
    strictEmptyAddressChecking: boolean;
  }
) {
  return makeAssetConfigTxnWithSuggestedParams(
    o.from,
    o.note,
    o.assetIndex,
    o.manager,
    o.reserve,
    o.freeze,
    o.clawback,
    o.suggestedParams,
    o.strictEmptyAddressChecking,
    o.rekeyTo
  );
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
 */
function makeAssetDestroyTxnWithSuggestedParams(
  from: AssetDestroyTxn['from'],
  note: AssetDestroyTxn['note'],
  assetIndex: AssetDestroyTxn['assetIndex'],
  suggestedParams: MustHaveSuggestedParams<AssetDestroyTxn>['suggestedParams'],
  rekeyTo: AssetDestroyTxn['reKeyTo']
) {
  const o: AssetDestroyTxn = {
    from,
    suggestedParams,
    assetIndex,
    type: TransactionType.acfg,
    note,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
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
 */
function makeAssetDestroyTxn(
  from: AssetDestroyTxn['from'],
  fee: MustHaveSuggestedParamsInline<AssetDestroyTxn>['fee'],
  firstRound: MustHaveSuggestedParamsInline<AssetDestroyTxn>['firstRound'],
  lastRound: MustHaveSuggestedParamsInline<AssetDestroyTxn>['lastRound'],
  note: AssetDestroyTxn['note'],
  genesisHash: MustHaveSuggestedParamsInline<AssetDestroyTxn>['genesisHash'],
  genesisID: MustHaveSuggestedParamsInline<AssetDestroyTxn>['genesisID'],
  assetIndex: AssetDestroyTxn['assetIndex'],
  rekeyTo: AssetDestroyTxn['reKeyTo']
) {
  const suggestedParams: SuggestedParams = {
    genesisHash,
    genesisID,
    firstRound,
    lastRound,
    fee,
  };
  return makeAssetDestroyTxnWithSuggestedParams(
    from,
    note,
    assetIndex,
    suggestedParams,
    rekeyTo
  );
}

// helper for above makeAssetDestroyTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetDestroyTxnWithSuggestedParamsFromObject(
  o: Pick<
    RenameProperty<
      MustHaveSuggestedParams<AssetDestroyTxn>,
      'reKeyTo',
      'rekeyTo'
    >,
    'from' | 'note' | 'assetIndex' | 'suggestedParams' | 'rekeyTo'
  >
) {
  return makeAssetDestroyTxnWithSuggestedParams(
    o.from,
    o.note,
    o.assetIndex,
    o.suggestedParams,
    o.rekeyTo
  );
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
 */
function makeAssetFreezeTxnWithSuggestedParams(
  from: AssetFreezeTxn['from'],
  note: AssetFreezeTxn['note'],
  assetIndex: AssetFreezeTxn['assetIndex'],
  freezeTarget: AssetFreezeTxn['freezeAccount'],
  freezeState: AssetFreezeTxn['freezeState'],
  suggestedParams: MustHaveSuggestedParams<AssetFreezeTxn>['suggestedParams'],
  rekeyTo: AssetFreezeTxn['reKeyTo']
) {
  const o: AssetFreezeTxn = {
    from,
    type: TransactionType.afrz,
    freezeAccount: freezeTarget,
    assetIndex,
    freezeState,
    note,
    suggestedParams,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
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
 */
function makeAssetFreezeTxn(
  from: AssetFreezeTxn['from'],
  fee: MustHaveSuggestedParamsInline<AssetFreezeTxn>['fee'],
  firstRound: MustHaveSuggestedParamsInline<AssetFreezeTxn>['firstRound'],
  lastRound: MustHaveSuggestedParamsInline<AssetFreezeTxn>['lastRound'],
  note: MustHaveSuggestedParamsInline<AssetFreezeTxn>['note'],
  genesisHash: MustHaveSuggestedParamsInline<AssetFreezeTxn>['genesisHash'],
  genesisID: MustHaveSuggestedParamsInline<AssetFreezeTxn>['genesisID'],
  assetIndex: AssetFreezeTxn['assetIndex'],
  freezeTarget: AssetFreezeTxn['freezeAccount'],
  freezeState: AssetFreezeTxn['freezeState'],
  rekeyTo: AssetFreezeTxn['reKeyTo']
) {
  const suggestedParams: SuggestedParams = {
    genesisHash,
    genesisID,
    firstRound,
    lastRound,
    fee,
  };
  return makeAssetFreezeTxnWithSuggestedParams(
    from,
    note,
    assetIndex,
    freezeTarget,
    freezeState,
    suggestedParams,
    rekeyTo
  );
}

// helper for above makeAssetFreezeTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetFreezeTxnWithSuggestedParamsFromObject(
  o: Pick<
    RenameProperties<
      MustHaveSuggestedParams<AssetFreezeTxn>,
      {
        freezeAccount: 'freezeTarget';
        reKeyTo: 'rekeyTo';
      }
    >,
    | 'from'
    | 'note'
    | 'assetIndex'
    | 'freezeTarget'
    | 'freezeState'
    | 'suggestedParams'
    | 'rekeyTo'
  >
) {
  return makeAssetFreezeTxnWithSuggestedParams(
    o.from,
    o.note,
    o.assetIndex,
    o.freezeTarget,
    o.freezeState,
    o.suggestedParams,
    o.rekeyTo
  );
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
 */
function makeAssetTransferTxnWithSuggestedParams(
  from: AssetTransferTxn['from'],
  to: AssetTransferTxn['to'],
  closeRemainderTo: AssetTransferTxn['closeRemainderTo'],
  revocationTarget: AssetTransferTxn['assetRevocationTarget'],
  amount: AssetTransferTxn['amount'],
  note: AssetTransferTxn['note'],
  assetIndex: AssetTransferTxn['assetIndex'],
  suggestedParams: MustHaveSuggestedParams<AssetTransferTxn>['suggestedParams'],
  rekeyTo: AssetTransferTxn['reKeyTo']
) {
  const o: AssetTransferTxn = {
    type: TransactionType.axfer,
    from,
    to,
    amount,
    suggestedParams,
    assetIndex,
    note,
    assetRevocationTarget: revocationTarget,
    closeRemainderTo,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
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
 */
function makeAssetTransferTxn(
  from: AssetTransferTxn['from'],
  to: AssetTransferTxn['to'],
  closeRemainderTo: AssetTransferTxn['closeRemainderTo'],
  revocationTarget: AssetTransferTxn['assetRevocationTarget'],
  fee: MustHaveSuggestedParamsInline<AssetTransferTxn>['fee'],
  amount: AssetTransferTxn['amount'],
  firstRound: MustHaveSuggestedParamsInline<AssetTransferTxn>['firstRound'],
  lastRound: MustHaveSuggestedParamsInline<AssetTransferTxn>['lastRound'],
  note: AssetTransferTxn['note'],
  genesisHash: MustHaveSuggestedParamsInline<AssetTransferTxn>['genesisHash'],
  genesisID: MustHaveSuggestedParamsInline<AssetTransferTxn>['genesisID'],
  assetIndex: AssetTransferTxn['assetIndex'],
  rekeyTo: AssetTransferTxn['reKeyTo']
) {
  const suggestedParams: SuggestedParams = {
    genesisHash,
    genesisID,
    firstRound,
    lastRound,
    fee,
  };
  return makeAssetTransferTxnWithSuggestedParams(
    from,
    to,
    closeRemainderTo,
    revocationTarget,
    amount,
    note,
    assetIndex,
    suggestedParams,
    rekeyTo
  );
}

// helper for above makeAssetTransferTxnWithSuggestedParams, instead accepting an arguments object
function makeAssetTransferTxnWithSuggestedParamsFromObject(
  o: Pick<
    RenameProperties<
      MustHaveSuggestedParams<AssetTransferTxn>,
      {
        assetRevocationTarget: 'revocationTarget';
        reKeyTo: 'rekeyTo';
      }
    >,
    | 'from'
    | 'to'
    | 'closeRemainderTo'
    | 'revocationTarget'
    | 'amount'
    | 'note'
    | 'assetIndex'
    | 'suggestedParams'
    | 'rekeyTo'
  >
) {
  return makeAssetTransferTxnWithSuggestedParams(
    o.from,
    o.to,
    o.closeRemainderTo,
    o.revocationTarget,
    o.amount,
    o.note,
    o.assetIndex,
    o.suggestedParams,
    o.rekeyTo
  );
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
function makeApplicationCreateTxn(
  from: AppCreateTxn['from'],
  suggestedParams: MustHaveSuggestedParams<AppCreateTxn>['suggestedParams'],
  onComplete: AppCreateTxn['appOnComplete'],
  approvalProgram: AppCreateTxn['appApprovalProgram'],
  clearProgram: AppCreateTxn['appClearProgram'],
  numLocalInts: AppCreateTxn['appLocalInts'],
  numLocalByteSlices: AppCreateTxn['appLocalByteSlices'],
  numGlobalInts: AppCreateTxn['appGlobalInts'],
  numGlobalByteSlices: AppCreateTxn['appGlobalByteSlices'],
  appArgs: AppCreateTxn['appArgs'],
  accounts: AppCreateTxn['appAccounts'],
  foreignApps: AppCreateTxn['appForeignApps'],
  foreignAssets: AppCreateTxn['appForeignAssets'],
  note: AppCreateTxn['note'],
  lease: AppCreateTxn['lease'],
  rekeyTo: AppCreateTxn['reKeyTo']
) {
  const o: AppCreateTxn = {
    type: TransactionType.appl,
    from,
    suggestedParams,
    appIndex: 0,
    appOnComplete: onComplete,
    appLocalInts: numLocalInts,
    appLocalByteSlices: numLocalByteSlices,
    appGlobalInts: numGlobalInts,
    appGlobalByteSlices: numGlobalByteSlices,
    appApprovalProgram: approvalProgram,
    appClearProgram: clearProgram,
    appArgs,
    appAccounts: accounts,
    appForeignApps: foreignApps,
    appForeignAssets: foreignAssets,
    note,
    lease,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationCreateTxn, instead accepting an arguments object
function makeApplicationCreateTxnFromObject(
  o: Pick<
    RenameProperties<
      MustHaveSuggestedParams<AppCreateTxn>,
      {
        appOnComplete: 'onComplete';
        appApprovalProgram: 'approvalProgram';
        appClearProgram: 'clearProgram';
        appLocalInts: 'numLocalInts';
        appLocalByteSlices: 'numLocalByteSlices';
        appGlobalInts: 'numGlobalInts';
        appGlobalByteSlices: 'numGlobalByteSlices';
        appAccounts: 'accounts';
        appForeignApps: 'foreignApps';
        appForeignAssets: 'foreignAssets';
        reKeyTo: 'rekeyTo';
      }
    >,
    | 'from'
    | 'suggestedParams'
    | 'onComplete'
    | 'approvalProgram'
    | 'clearProgram'
    | 'numLocalInts'
    | 'numLocalByteSlices'
    | 'numGlobalInts'
    | 'numGlobalByteSlices'
    | 'appArgs'
    | 'accounts'
    | 'foreignApps'
    | 'foreignAssets'
    | 'note'
    | 'lease'
    | 'rekeyTo'
  >
) {
  return makeApplicationCreateTxn(
    o.from,
    o.suggestedParams,
    o.onComplete,
    o.approvalProgram,
    o.clearProgram,
    o.numLocalInts,
    o.numLocalByteSlices,
    o.numGlobalInts,
    o.numGlobalByteSlices,
    o.appArgs,
    o.accounts,
    o.foreignApps,
    o.foreignAssets,
    o.note,
    o.lease,
    o.rekeyTo
  );
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
function makeApplicationUpdateTxn(
  from: AppUpdateTxn['from'],
  suggestedParams: MustHaveSuggestedParams<AppUpdateTxn>['suggestedParams'],
  appIndex: AppUpdateTxn['appIndex'],
  approvalProgram: AppUpdateTxn['appApprovalProgram'],
  clearProgram: AppUpdateTxn['appClearProgram'],
  appArgs: AppUpdateTxn['appArgs'],
  accounts: AppUpdateTxn['appAccounts'],
  foreignApps: AppUpdateTxn['appForeignApps'],
  foreignAssets: AppUpdateTxn['appForeignAssets'],
  note: AppUpdateTxn['note'],
  lease: AppUpdateTxn['lease'],
  rekeyTo: AppUpdateTxn['reKeyTo']
) {
  const o: AppUpdateTxn = {
    type: TransactionType.appl,
    from,
    suggestedParams,
    appIndex,
    appApprovalProgram: approvalProgram,
    appOnComplete: OnApplicationComplete.UpdateApplicationOC,
    appClearProgram: clearProgram,
    appArgs,
    appAccounts: accounts,
    appForeignApps: foreignApps,
    appForeignAssets: foreignAssets,
    note,
    lease,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationUpdateTxn, instead accepting an arguments object
function makeApplicationUpdateTxnFromObject(
  o: Pick<
    RenameProperties<
      MustHaveSuggestedParams<AppUpdateTxn>,
      {
        appApprovalProgram: 'approvalProgram';
        appClearProgram: 'clearProgram';
        appAccounts: 'accounts';
        appForeignApps: 'foreignApps';
        appForeignAssets: 'foreignAssets';
        reKeyTo: 'rekeyTo';
      }
    >,
    | 'from'
    | 'suggestedParams'
    | 'appIndex'
    | 'approvalProgram'
    | 'clearProgram'
    | 'appArgs'
    | 'accounts'
    | 'foreignApps'
    | 'foreignAssets'
    | 'note'
    | 'lease'
    | 'rekeyTo'
  >
) {
  return makeApplicationUpdateTxn(
    o.from,
    o.suggestedParams,
    o.appIndex,
    o.approvalProgram,
    o.clearProgram,
    o.appArgs,
    o.accounts,
    o.foreignApps,
    o.foreignAssets,
    o.note,
    o.lease,
    o.rekeyTo
  );
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
function makeApplicationDeleteTxn(
  from: AppDeleteTxn['from'],
  suggestedParams: MustHaveSuggestedParams<AppDeleteTxn>['suggestedParams'],
  appIndex: AppDeleteTxn['appIndex'],
  appArgs: AppDeleteTxn['appArgs'],
  accounts: AppDeleteTxn['appAccounts'],
  foreignApps: AppDeleteTxn['appForeignApps'],
  foreignAssets: AppDeleteTxn['appForeignAssets'],
  note: AppDeleteTxn['note'],
  lease: AppDeleteTxn['lease'],
  rekeyTo: AppDeleteTxn['reKeyTo']
) {
  const o: AppDeleteTxn = {
    type: TransactionType.appl,
    from,
    suggestedParams,
    appIndex,
    appOnComplete: OnApplicationComplete.DeleteApplicationOC,
    appArgs,
    appAccounts: accounts,
    appForeignApps: foreignApps,
    appForeignAssets: foreignAssets,
    note,
    lease,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationDeleteTxn, instead accepting an arguments object
function makeApplicationDeleteTxnFromObject(
  o: Pick<
    RenameProperties<
      MustHaveSuggestedParams<AppDeleteTxn>,
      {
        appAccounts: 'accounts';
        appForeignApps: 'foreignApps';
        appForeignAssets: 'foreignAssets';
        reKeyTo: 'rekeyTo';
      }
    >,
    | 'from'
    | 'suggestedParams'
    | 'appIndex'
    | 'appArgs'
    | 'accounts'
    | 'foreignApps'
    | 'foreignAssets'
    | 'note'
    | 'lease'
    | 'rekeyTo'
  >
) {
  return makeApplicationDeleteTxn(
    o.from,
    o.suggestedParams,
    o.appIndex,
    o.appArgs,
    o.accounts,
    o.foreignApps,
    o.foreignAssets,
    o.note,
    o.lease,
    o.rekeyTo
  );
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
function makeApplicationOptInTxn(
  from: AppOptInTxn['from'],
  suggestedParams: MustHaveSuggestedParams<AppOptInTxn>['suggestedParams'],
  appIndex: AppOptInTxn['appIndex'],
  appArgs: AppOptInTxn['appArgs'],
  accounts: AppOptInTxn['appAccounts'],
  foreignApps: AppOptInTxn['appForeignApps'],
  foreignAssets: AppOptInTxn['appForeignApps'],
  note: AppOptInTxn['note'],
  lease: AppOptInTxn['lease'],
  rekeyTo: AppOptInTxn['reKeyTo']
) {
  const o: AppOptInTxn = {
    type: TransactionType.appl,
    from,
    suggestedParams,
    appIndex,
    appOnComplete: OnApplicationComplete.OptInOC,
    appArgs,
    appAccounts: accounts,
    appForeignApps: foreignApps,
    appForeignAssets: foreignAssets,
    note,
    lease,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationOptInTxn, instead accepting an argument object
function makeApplicationOptInTxnFromObject(
  o: Pick<
    RenameProperties<
      MustHaveSuggestedParams<AppOptInTxn>,
      {
        appAccounts: 'accounts';
        appForeignApps: 'foreignApps';
        appForeignAssets: 'foreignAssets';
        reKeyTo: 'rekeyTo';
      }
    >,
    | 'from'
    | 'suggestedParams'
    | 'appIndex'
    | 'appArgs'
    | 'accounts'
    | 'foreignApps'
    | 'foreignAssets'
    | 'note'
    | 'lease'
    | 'rekeyTo'
  >
) {
  return makeApplicationOptInTxn(
    o.from,
    o.suggestedParams,
    o.appIndex,
    o.appArgs,
    o.accounts,
    o.foreignApps,
    o.foreignAssets,
    o.note,
    o.lease,
    o.rekeyTo
  );
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
function makeApplicationCloseOutTxn(
  from,
  suggestedParams,
  appIndex,
  appArgs = undefined,
  accounts = undefined,
  foreignApps = undefined,
  foreignAssets = undefined,
  note = undefined,
  lease = undefined,
  rekeyTo = undefined
) {
  const o = {
    type: 'appl',
    from,
    suggestedParams,
    appIndex,
    appOnComplete: OnApplicationComplete.CloseOutOC,
    appArgs,
    appAccounts: accounts,
    appForeignApps: foreignApps,
    appForeignAssets: foreignAssets,
    note,
    lease,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationCloseOutTxn, instead accepting an argument object
function makeApplicationCloseOutTxnFromObject(o) {
  return makeApplicationCloseOutTxn(
    o.from,
    o.suggestedParams,
    o.appIndex,
    o.appArgs,
    o.accounts,
    o.foreignApps,
    o.foreignAssets,
    o.note,
    o.lease,
    o.rekeyTo
  );
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
function makeApplicationClearStateTxn(
  from,
  suggestedParams,
  appIndex,
  appArgs = undefined,
  accounts = undefined,
  foreignApps = undefined,
  foreignAssets = undefined,
  note = undefined,
  lease = undefined,
  rekeyTo = undefined
) {
  const o = {
    type: 'appl',
    from,
    suggestedParams,
    appIndex,
    appOnComplete: OnApplicationComplete.ClearStateOC,
    appArgs,
    appAccounts: accounts,
    appForeignApps: foreignApps,
    appForeignAssets: foreignAssets,
    note,
    lease,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationClearStateTxn, instead accepting an argument object
function makeApplicationClearStateTxnFromObject(o) {
  return makeApplicationClearStateTxn(
    o.from,
    o.suggestedParams,
    o.appIndex,
    o.appArgs,
    o.accounts,
    o.foreignApps,
    o.foreignAssets,
    o.note,
    o.lease,
    o.rekeyTo
  );
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
function makeApplicationNoOpTxn(
  from,
  suggestedParams,
  appIndex,
  appArgs = undefined,
  accounts = undefined,
  foreignApps = undefined,
  foreignAssets = undefined,
  note = undefined,
  lease = undefined,
  rekeyTo = undefined
) {
  const o = {
    type: 'appl',
    from,
    suggestedParams,
    appIndex,
    appOnComplete: OnApplicationComplete.NoOpOC,
    appArgs,
    appAccounts: accounts,
    appForeignApps: foreignApps,
    appForeignAssets: foreignAssets,
    note,
    lease,
    reKeyTo: rekeyTo,
  };
  return new txnBuilder.Transaction(o);
}

// helper for above makeApplicationNoOpTxn, instead accepting an argument object
function makeApplicationNoOpTxnFromObject(o) {
  return makeApplicationNoOpTxn(
    o.from,
    o.suggestedParams,
    o.appIndex,
    o.appArgs,
    o.accounts,
    o.foreignApps,
    o.foreignAssets,
    o.note,
    o.lease,
    o.rekeyTo
  );
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
