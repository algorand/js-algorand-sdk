/**
 * NOTICE: This file was generated. Editing this file manually is not recommended.
 */

/* eslint-disable no-use-before-define */
import { ensureBigInt, ensureSafeInteger } from '../../../../utils/utils.js';
import {
  MsgpackEncodable,
  MsgpackEncodingData,
  JSONEncodable,
  JSONEncodingData,
} from '../../../../encoding/encoding.js';
import {
  base64ToBytes,
  bytesToBase64,
} from '../../../../encoding/binarydata.js';
import BlockHeader, {
  blockHeaderMsgpackPrepare,
  blockHeaderFromDecodedMsgpack,
  blockHeaderJSONPrepare,
  blockHeaderFromDecodedJSON,
} from '../../../../types/blockHeader.js';
import { SignedTransaction } from '../../../../signedTransaction.js';
import { UntypedValue } from '../../untypedmodel.js';
// import BaseModel from '../../basemodel.js';

/**
 * Account information at a given round.
 * Definition:
 * data/basics/userBalance.go : AccountData
 */
export class Account implements MsgpackEncodable, JSONEncodable {
  /**
   * the account public key
   */
  public address: string;

  /**
   * (algo) total number of MicroAlgos in the account
   */
  public amount: bigint;

  /**
   * specifies the amount of MicroAlgos in the account, without the pending rewards.
   */
  public amountWithoutPendingRewards: bigint;

  /**
   * MicroAlgo balance required by the account.
   * The requirement grows based on asset and application usage.
   */
  public minBalance: bigint;

  /**
   * amount of MicroAlgos of pending rewards in this account.
   */
  public pendingRewards: bigint;

  /**
   * (ern) total rewards of MicroAlgos the account has received, including pending
   * rewards.
   */
  public rewards: bigint;

  /**
   * The round for which this information is relevant.
   */
  public round: bigint;

  /**
   * (onl) delegation status of the account's MicroAlgos
   * * Offline - indicates that the associated account is delegated.
   * * Online - indicates that the associated account used as part of the delegation
   * pool.
   * * NotParticipating - indicates that the associated account is neither a
   * delegator nor a delegate.
   */
  public status: string;

  /**
   * The count of all applications that have been opted in, equivalent to the count
   * of application local data (AppLocalState objects) stored in this account.
   */
  public totalAppsOptedIn: number;

  /**
   * The count of all assets that have been opted in, equivalent to the count of
   * AssetHolding objects held by this account.
   */
  public totalAssetsOptedIn: number;

  /**
   * The count of all apps (AppParams objects) created by this account.
   */
  public totalCreatedApps: number;

  /**
   * The count of all assets (AssetParams objects) created by this account.
   */
  public totalCreatedAssets: number;

  /**
   * (appl) applications local data stored in this account.
   * Note the raw object uses `map[int] -> AppLocalState` for this type.
   */
  public appsLocalState?: ApplicationLocalState[];

  /**
   * (teap) the sum of all extra application program pages for this account.
   */
  public appsTotalExtraPages?: number;

  /**
   * (tsch) stores the sum of all of the local schemas and global schemas in this
   * account.
   * Note: the raw account uses `StateSchema` for this type.
   */
  public appsTotalSchema?: ApplicationStateSchema;

  /**
   * (asset) assets held by this account.
   * Note the raw object uses `map[int] -> AssetHolding` for this type.
   */
  public assets?: AssetHolding[];

  /**
   * (spend) the address against which signing should be checked. If empty, the
   * address of the current account is used. This field can be updated in any
   * transaction by setting the RekeyTo field.
   */
  public authAddr?: string;

  /**
   * (appp) parameters of applications created by this account including app global
   * data.
   * Note: the raw account uses `map[int] -> AppParams` for this type.
   */
  public createdApps?: Application[];

  /**
   * (apar) parameters of assets created by this account.
   * Note: the raw account uses `map[int] -> Asset` for this type.
   */
  public createdAssets?: Asset[];

  /**
   * AccountParticipation describes the parameters used by this account in consensus
   * protocol.
   */
  public participation?: AccountParticipation;

  /**
   * (ebase) used as part of the rewards computation. Only applicable to accounts
   * which are participating.
   */
  public rewardBase?: bigint;

  /**
   * Indicates what type of signature is used by this account, must be one of:
   * * sig
   * * msig
   * * lsig
   */
  public sigType?: string;

  /**
   * (tbxb) The total number of bytes used by this account's app's box keys and
   * values.
   */
  public totalBoxBytes?: number;

  /**
   * (tbx) The number of existing boxes created by this account's app.
   */
  public totalBoxes?: number;

  /**
   * Creates a new `Account` object.
   * @param address - the account public key
   * @param amount - (algo) total number of MicroAlgos in the account
   * @param amountWithoutPendingRewards - specifies the amount of MicroAlgos in the account, without the pending rewards.
   * @param minBalance - MicroAlgo balance required by the account.
   * The requirement grows based on asset and application usage.
   * @param pendingRewards - amount of MicroAlgos of pending rewards in this account.
   * @param rewards - (ern) total rewards of MicroAlgos the account has received, including pending
   * rewards.
   * @param round - The round for which this information is relevant.
   * @param status - (onl) delegation status of the account's MicroAlgos
   * * Offline - indicates that the associated account is delegated.
   * * Online - indicates that the associated account used as part of the delegation
   * pool.
   * * NotParticipating - indicates that the associated account is neither a
   * delegator nor a delegate.
   * @param totalAppsOptedIn - The count of all applications that have been opted in, equivalent to the count
   * of application local data (AppLocalState objects) stored in this account.
   * @param totalAssetsOptedIn - The count of all assets that have been opted in, equivalent to the count of
   * AssetHolding objects held by this account.
   * @param totalCreatedApps - The count of all apps (AppParams objects) created by this account.
   * @param totalCreatedAssets - The count of all assets (AssetParams objects) created by this account.
   * @param appsLocalState - (appl) applications local data stored in this account.
   * Note the raw object uses `map[int] -> AppLocalState` for this type.
   * @param appsTotalExtraPages - (teap) the sum of all extra application program pages for this account.
   * @param appsTotalSchema - (tsch) stores the sum of all of the local schemas and global schemas in this
   * account.
   * Note: the raw account uses `StateSchema` for this type.
   * @param assets - (asset) assets held by this account.
   * Note the raw object uses `map[int] -> AssetHolding` for this type.
   * @param authAddr - (spend) the address against which signing should be checked. If empty, the
   * address of the current account is used. This field can be updated in any
   * transaction by setting the RekeyTo field.
   * @param createdApps - (appp) parameters of applications created by this account including app global
   * data.
   * Note: the raw account uses `map[int] -> AppParams` for this type.
   * @param createdAssets - (apar) parameters of assets created by this account.
   * Note: the raw account uses `map[int] -> Asset` for this type.
   * @param participation - AccountParticipation describes the parameters used by this account in consensus
   * protocol.
   * @param rewardBase - (ebase) used as part of the rewards computation. Only applicable to accounts
   * which are participating.
   * @param sigType - Indicates what type of signature is used by this account, must be one of:
   * * sig
   * * msig
   * * lsig
   * @param totalBoxBytes - (tbxb) The total number of bytes used by this account's app's box keys and
   * values.
   * @param totalBoxes - (tbx) The number of existing boxes created by this account's app.
   */
  constructor({
    address,
    amount,
    amountWithoutPendingRewards,
    minBalance,
    pendingRewards,
    rewards,
    round,
    status,
    totalAppsOptedIn,
    totalAssetsOptedIn,
    totalCreatedApps,
    totalCreatedAssets,
    appsLocalState,
    appsTotalExtraPages,
    appsTotalSchema,
    assets,
    authAddr,
    createdApps,
    createdAssets,
    participation,
    rewardBase,
    sigType,
    totalBoxBytes,
    totalBoxes,
  }: {
    address: string;
    amount: number | bigint;
    amountWithoutPendingRewards: number | bigint;
    minBalance: number | bigint;
    pendingRewards: number | bigint;
    rewards: number | bigint;
    round: number | bigint;
    status: string;
    totalAppsOptedIn: number | bigint;
    totalAssetsOptedIn: number | bigint;
    totalCreatedApps: number | bigint;
    totalCreatedAssets: number | bigint;
    appsLocalState?: ApplicationLocalState[];
    appsTotalExtraPages?: number | bigint;
    appsTotalSchema?: ApplicationStateSchema;
    assets?: AssetHolding[];
    authAddr?: string;
    createdApps?: Application[];
    createdAssets?: Asset[];
    participation?: AccountParticipation;
    rewardBase?: number | bigint;
    sigType?: string;
    totalBoxBytes?: number | bigint;
    totalBoxes?: number | bigint;
  }) {
    this.address = address;
    this.amount = ensureBigInt(amount);
    this.amountWithoutPendingRewards = ensureBigInt(
      amountWithoutPendingRewards
    );
    this.minBalance = ensureBigInt(minBalance);
    this.pendingRewards = ensureBigInt(pendingRewards);
    this.rewards = ensureBigInt(rewards);
    this.round = ensureBigInt(round);
    this.status = status;
    this.totalAppsOptedIn = ensureSafeInteger(totalAppsOptedIn);
    this.totalAssetsOptedIn = ensureSafeInteger(totalAssetsOptedIn);
    this.totalCreatedApps = ensureSafeInteger(totalCreatedApps);
    this.totalCreatedAssets = ensureSafeInteger(totalCreatedAssets);
    this.appsLocalState = appsLocalState;
    this.appsTotalExtraPages =
      typeof appsTotalExtraPages === 'undefined'
        ? undefined
        : ensureSafeInteger(appsTotalExtraPages);
    this.appsTotalSchema = appsTotalSchema;
    this.assets = assets;
    this.authAddr = authAddr;
    this.createdApps = createdApps;
    this.createdAssets = createdAssets;
    this.participation = participation;
    this.rewardBase =
      typeof rewardBase === 'undefined' ? undefined : ensureBigInt(rewardBase);
    this.sigType = sigType;
    this.totalBoxBytes =
      typeof totalBoxBytes === 'undefined'
        ? undefined
        : ensureSafeInteger(totalBoxBytes);
    this.totalBoxes =
      typeof totalBoxes === 'undefined'
        ? undefined
        : ensureSafeInteger(totalBoxes);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['address', this.address],
      ['amount', this.amount],
      ['amount-without-pending-rewards', this.amountWithoutPendingRewards],
      ['min-balance', this.minBalance],
      ['pending-rewards', this.pendingRewards],
      ['rewards', this.rewards],
      ['round', this.round],
      ['status', this.status],
      ['total-apps-opted-in', this.totalAppsOptedIn],
      ['total-assets-opted-in', this.totalAssetsOptedIn],
      ['total-created-apps', this.totalCreatedApps],
      ['total-created-assets', this.totalCreatedAssets],
    ]);
    if (this.appsLocalState && this.appsLocalState.length) {
      data.set(
        'apps-local-state',
        this.appsLocalState.map((v) => v.msgpackPrepare())
      );
    }
    if (this.appsTotalExtraPages) {
      data.set('apps-total-extra-pages', this.appsTotalExtraPages);
    }
    if (this.appsTotalSchema) {
      data.set('apps-total-schema', this.appsTotalSchema.msgpackPrepare());
    }
    if (this.assets && this.assets.length) {
      data.set(
        'assets',
        this.assets.map((v) => v.msgpackPrepare())
      );
    }
    if (this.authAddr) {
      data.set('auth-addr', this.authAddr);
    }
    if (this.createdApps && this.createdApps.length) {
      data.set(
        'created-apps',
        this.createdApps.map((v) => v.msgpackPrepare())
      );
    }
    if (this.createdAssets && this.createdAssets.length) {
      data.set(
        'created-assets',
        this.createdAssets.map((v) => v.msgpackPrepare())
      );
    }
    if (this.participation) {
      data.set('participation', this.participation.msgpackPrepare());
    }
    if (this.rewardBase) {
      data.set('reward-base', this.rewardBase);
    }
    if (this.sigType) {
      data.set('sig-type', this.sigType);
    }
    if (this.totalBoxBytes) {
      data.set('total-box-bytes', this.totalBoxBytes);
    }
    if (this.totalBoxes) {
      data.set('total-boxes', this.totalBoxes);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['address'] = this.address;
    obj['amount'] = this.amount;
    obj['amount-without-pending-rewards'] = this.amountWithoutPendingRewards;
    obj['min-balance'] = this.minBalance;
    obj['pending-rewards'] = this.pendingRewards;
    obj['rewards'] = this.rewards;
    obj['round'] = this.round;
    obj['status'] = this.status;
    obj['total-apps-opted-in'] = this.totalAppsOptedIn;
    obj['total-assets-opted-in'] = this.totalAssetsOptedIn;
    obj['total-created-apps'] = this.totalCreatedApps;
    obj['total-created-assets'] = this.totalCreatedAssets;
    if (this.appsLocalState && this.appsLocalState.length) {
      obj['apps-local-state'] = this.appsLocalState.map((v) => v.jsonPrepare());
    }
    if (this.appsTotalExtraPages) {
      obj['apps-total-extra-pages'] = this.appsTotalExtraPages;
    }
    if (this.appsTotalSchema) {
      obj['apps-total-schema'] = this.appsTotalSchema.jsonPrepare();
    }
    if (this.assets && this.assets.length) {
      obj['assets'] = this.assets.map((v) => v.jsonPrepare());
    }
    if (this.authAddr) {
      obj['auth-addr'] = this.authAddr;
    }
    if (this.createdApps && this.createdApps.length) {
      obj['created-apps'] = this.createdApps.map((v) => v.jsonPrepare());
    }
    if (this.createdAssets && this.createdAssets.length) {
      obj['created-assets'] = this.createdAssets.map((v) => v.jsonPrepare());
    }
    if (this.participation) {
      obj['participation'] = this.participation.jsonPrepare();
    }
    if (this.rewardBase) {
      obj['reward-base'] = this.rewardBase;
    }
    if (this.sigType) {
      obj['sig-type'] = this.sigType;
    }
    if (this.totalBoxBytes) {
      obj['total-box-bytes'] = this.totalBoxBytes;
    }
    if (this.totalBoxes) {
      obj['total-boxes'] = this.totalBoxes;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): Account {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded Account: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new Account({
      address: data['address'] ?? '',
      amount: data['amount'] ?? 0,
      amountWithoutPendingRewards: data['amount-without-pending-rewards'] ?? 0,
      minBalance: data['min-balance'] ?? 0,
      pendingRewards: data['pending-rewards'] ?? 0,
      rewards: data['rewards'] ?? 0,
      round: data['round'] ?? 0,
      status: data['status'] ?? '',
      totalAppsOptedIn: data['total-apps-opted-in'] ?? 0,
      totalAssetsOptedIn: data['total-assets-opted-in'] ?? 0,
      totalCreatedApps: data['total-created-apps'] ?? 0,
      totalCreatedAssets: data['total-created-assets'] ?? 0,
      appsLocalState:
        typeof data['apps-local-state'] !== 'undefined'
          ? data['apps-local-state'].map(ApplicationLocalState.fromDecodedJSON)
          : undefined,
      appsTotalExtraPages: data['apps-total-extra-pages'],
      appsTotalSchema:
        typeof data['apps-total-schema'] !== 'undefined'
          ? ApplicationStateSchema.fromDecodedJSON(data['apps-total-schema'])
          : undefined,
      assets:
        typeof data['assets'] !== 'undefined'
          ? data['assets'].map(AssetHolding.fromDecodedJSON)
          : undefined,
      authAddr: data['auth-addr'],
      createdApps:
        typeof data['created-apps'] !== 'undefined'
          ? data['created-apps'].map(Application.fromDecodedJSON)
          : undefined,
      createdAssets:
        typeof data['created-assets'] !== 'undefined'
          ? data['created-assets'].map(Asset.fromDecodedJSON)
          : undefined,
      participation:
        typeof data['participation'] !== 'undefined'
          ? AccountParticipation.fromDecodedJSON(data['participation'])
          : undefined,
      rewardBase: data['reward-base'],
      sigType: data['sig-type'],
      totalBoxBytes: data['total-box-bytes'],
      totalBoxes: data['total-boxes'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): Account {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Account({
      address: data.get('address') ?? '',
      amount: data.get('amount') ?? 0,
      amountWithoutPendingRewards:
        data.get('amount-without-pending-rewards') ?? 0,
      minBalance: data.get('min-balance') ?? 0,
      pendingRewards: data.get('pending-rewards') ?? 0,
      rewards: data.get('rewards') ?? 0,
      round: data.get('round') ?? 0,
      status: data.get('status') ?? '',
      totalAppsOptedIn: data.get('total-apps-opted-in') ?? 0,
      totalAssetsOptedIn: data.get('total-assets-opted-in') ?? 0,
      totalCreatedApps: data.get('total-created-apps') ?? 0,
      totalCreatedAssets: data.get('total-created-assets') ?? 0,
      appsLocalState:
        typeof data.get('apps-local-state') !== 'undefined'
          ? data
              .get('apps-local-state')
              .map(ApplicationLocalState.fromDecodedMsgpack)
          : undefined,
      appsTotalExtraPages: data.get('apps-total-extra-pages'),
      appsTotalSchema:
        typeof data.get('apps-total-schema') !== 'undefined'
          ? ApplicationStateSchema.fromDecodedMsgpack(
              data.get('apps-total-schema')
            )
          : undefined,
      assets:
        typeof data.get('assets') !== 'undefined'
          ? data.get('assets').map(AssetHolding.fromDecodedMsgpack)
          : undefined,
      authAddr: data.get('auth-addr'),
      createdApps:
        typeof data.get('created-apps') !== 'undefined'
          ? data.get('created-apps').map(Application.fromDecodedMsgpack)
          : undefined,
      createdAssets:
        typeof data.get('created-assets') !== 'undefined'
          ? data.get('created-assets').map(Asset.fromDecodedMsgpack)
          : undefined,
      participation:
        typeof data.get('participation') !== 'undefined'
          ? AccountParticipation.fromDecodedMsgpack(data.get('participation'))
          : undefined,
      rewardBase: data.get('reward-base'),
      sigType: data.get('sig-type'),
      totalBoxBytes: data.get('total-box-bytes'),
      totalBoxes: data.get('total-boxes'),
    });
  }
}

/**
 * AccountApplicationResponse describes the account's application local state and
 * global state (AppLocalState and AppParams, if either exists) for a specific
 * application ID. Global state will only be returned if the provided address is
 * the application's creator.
 */
export class AccountApplicationResponse
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * The round for which this information is relevant.
   */
  public round: bigint;

  /**
   * (appl) the application local data stored in this account.
   * The raw account uses `AppLocalState` for this type.
   */
  public appLocalState?: ApplicationLocalState;

  /**
   * (appp) parameters of the application created by this account including app
   * global data.
   * The raw account uses `AppParams` for this type.
   */
  public createdApp?: ApplicationParams;

  /**
   * Creates a new `AccountApplicationResponse` object.
   * @param round - The round for which this information is relevant.
   * @param appLocalState - (appl) the application local data stored in this account.
   * The raw account uses `AppLocalState` for this type.
   * @param createdApp - (appp) parameters of the application created by this account including app
   * global data.
   * The raw account uses `AppParams` for this type.
   */
  constructor({
    round,
    appLocalState,
    createdApp,
  }: {
    round: number | bigint;
    appLocalState?: ApplicationLocalState;
    createdApp?: ApplicationParams;
  }) {
    this.round = ensureBigInt(round);
    this.appLocalState = appLocalState;
    this.createdApp = createdApp;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([['round', this.round]]);
    if (this.appLocalState) {
      data.set('app-local-state', this.appLocalState.msgpackPrepare());
    }
    if (this.createdApp) {
      data.set('created-app', this.createdApp.msgpackPrepare());
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['round'] = this.round;
    if (this.appLocalState) {
      obj['app-local-state'] = this.appLocalState.jsonPrepare();
    }
    if (this.createdApp) {
      obj['created-app'] = this.createdApp.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): AccountApplicationResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded AccountApplicationResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new AccountApplicationResponse({
      round: data['round'] ?? 0,
      appLocalState:
        typeof data['app-local-state'] !== 'undefined'
          ? ApplicationLocalState.fromDecodedJSON(data['app-local-state'])
          : undefined,
      createdApp:
        typeof data['created-app'] !== 'undefined'
          ? ApplicationParams.fromDecodedJSON(data['created-app'])
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): AccountApplicationResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountApplicationResponse({
      round: data.get('round') ?? 0,
      appLocalState:
        typeof data.get('app-local-state') !== 'undefined'
          ? ApplicationLocalState.fromDecodedMsgpack(
              data.get('app-local-state')
            )
          : undefined,
      createdApp:
        typeof data.get('created-app') !== 'undefined'
          ? ApplicationParams.fromDecodedMsgpack(data.get('created-app'))
          : undefined,
    });
  }
}

/**
 * AccountAssetResponse describes the account's asset holding and asset parameters
 * (if either exist) for a specific asset ID. Asset parameters will only be
 * returned if the provided address is the asset's creator.
 */
export class AccountAssetResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * The round for which this information is relevant.
   */
  public round: bigint;

  /**
   * (asset) Details about the asset held by this account.
   * The raw account uses `AssetHolding` for this type.
   */
  public assetHolding?: AssetHolding;

  /**
   * (apar) parameters of the asset created by this account.
   * The raw account uses `AssetParams` for this type.
   */
  public createdAsset?: AssetParams;

  /**
   * Creates a new `AccountAssetResponse` object.
   * @param round - The round for which this information is relevant.
   * @param assetHolding - (asset) Details about the asset held by this account.
   * The raw account uses `AssetHolding` for this type.
   * @param createdAsset - (apar) parameters of the asset created by this account.
   * The raw account uses `AssetParams` for this type.
   */
  constructor({
    round,
    assetHolding,
    createdAsset,
  }: {
    round: number | bigint;
    assetHolding?: AssetHolding;
    createdAsset?: AssetParams;
  }) {
    this.round = ensureBigInt(round);
    this.assetHolding = assetHolding;
    this.createdAsset = createdAsset;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([['round', this.round]]);
    if (this.assetHolding) {
      data.set('asset-holding', this.assetHolding.msgpackPrepare());
    }
    if (this.createdAsset) {
      data.set('created-asset', this.createdAsset.msgpackPrepare());
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['round'] = this.round;
    if (this.assetHolding) {
      obj['asset-holding'] = this.assetHolding.jsonPrepare();
    }
    if (this.createdAsset) {
      obj['created-asset'] = this.createdAsset.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): AccountAssetResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded AccountAssetResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new AccountAssetResponse({
      round: data['round'] ?? 0,
      assetHolding:
        typeof data['asset-holding'] !== 'undefined'
          ? AssetHolding.fromDecodedJSON(data['asset-holding'])
          : undefined,
      createdAsset:
        typeof data['created-asset'] !== 'undefined'
          ? AssetParams.fromDecodedJSON(data['created-asset'])
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): AccountAssetResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountAssetResponse({
      round: data.get('round') ?? 0,
      assetHolding:
        typeof data.get('asset-holding') !== 'undefined'
          ? AssetHolding.fromDecodedMsgpack(data.get('asset-holding'))
          : undefined,
      createdAsset:
        typeof data.get('created-asset') !== 'undefined'
          ? AssetParams.fromDecodedMsgpack(data.get('created-asset'))
          : undefined,
    });
  }
}

/**
 * AccountParticipation describes the parameters used by this account in consensus
 * protocol.
 */
export class AccountParticipation implements MsgpackEncodable, JSONEncodable {
  /**
   * (sel) Selection public key (if any) currently registered for this round.
   */
  public selectionParticipationKey: Uint8Array;

  /**
   * (voteFst) First round for which this participation is valid.
   */
  public voteFirstValid: bigint;

  /**
   * (voteKD) Number of subkeys in each batch of participation keys.
   */
  public voteKeyDilution: bigint;

  /**
   * (voteLst) Last round for which this participation is valid.
   */
  public voteLastValid: bigint;

  /**
   * (vote) root participation public key (if any) currently registered for this
   * round.
   */
  public voteParticipationKey: Uint8Array;

  /**
   * (stprf) Root of the state proof key (if any)
   */
  public stateProofKey?: Uint8Array;

  /**
   * Creates a new `AccountParticipation` object.
   * @param selectionParticipationKey - (sel) Selection public key (if any) currently registered for this round.
   * @param voteFirstValid - (voteFst) First round for which this participation is valid.
   * @param voteKeyDilution - (voteKD) Number of subkeys in each batch of participation keys.
   * @param voteLastValid - (voteLst) Last round for which this participation is valid.
   * @param voteParticipationKey - (vote) root participation public key (if any) currently registered for this
   * round.
   * @param stateProofKey - (stprf) Root of the state proof key (if any)
   */
  constructor({
    selectionParticipationKey,
    voteFirstValid,
    voteKeyDilution,
    voteLastValid,
    voteParticipationKey,
    stateProofKey,
  }: {
    selectionParticipationKey: string | Uint8Array;
    voteFirstValid: number | bigint;
    voteKeyDilution: number | bigint;
    voteLastValid: number | bigint;
    voteParticipationKey: string | Uint8Array;
    stateProofKey?: string | Uint8Array;
  }) {
    this.selectionParticipationKey =
      typeof selectionParticipationKey === 'string'
        ? base64ToBytes(selectionParticipationKey)
        : selectionParticipationKey;
    this.voteFirstValid = ensureBigInt(voteFirstValid);
    this.voteKeyDilution = ensureBigInt(voteKeyDilution);
    this.voteLastValid = ensureBigInt(voteLastValid);
    this.voteParticipationKey =
      typeof voteParticipationKey === 'string'
        ? base64ToBytes(voteParticipationKey)
        : voteParticipationKey;
    this.stateProofKey =
      typeof stateProofKey === 'string'
        ? base64ToBytes(stateProofKey)
        : stateProofKey;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['selection-participation-key', this.selectionParticipationKey],
      ['vote-first-valid', this.voteFirstValid],
      ['vote-key-dilution', this.voteKeyDilution],
      ['vote-last-valid', this.voteLastValid],
      ['vote-participation-key', this.voteParticipationKey],
    ]);
    if (this.stateProofKey) {
      data.set('state-proof-key', this.stateProofKey);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['selection-participation-key'] = bytesToBase64(
      this.selectionParticipationKey
    );
    obj['vote-first-valid'] = this.voteFirstValid;
    obj['vote-key-dilution'] = this.voteKeyDilution;
    obj['vote-last-valid'] = this.voteLastValid;
    obj['vote-participation-key'] = bytesToBase64(this.voteParticipationKey);
    if (this.stateProofKey) {
      obj['state-proof-key'] = bytesToBase64(this.stateProofKey);
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): AccountParticipation {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded AccountParticipation: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new AccountParticipation({
      selectionParticipationKey:
        data['selection-participation-key'] ?? new Uint8Array(),
      voteFirstValid: data['vote-first-valid'] ?? 0,
      voteKeyDilution: data['vote-key-dilution'] ?? 0,
      voteLastValid: data['vote-last-valid'] ?? 0,
      voteParticipationKey: data['vote-participation-key'] ?? new Uint8Array(),
      stateProofKey: data['state-proof-key'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): AccountParticipation {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountParticipation({
      selectionParticipationKey:
        data.get('selection-participation-key') ?? new Uint8Array(),
      voteFirstValid: data.get('vote-first-valid') ?? 0,
      voteKeyDilution: data.get('vote-key-dilution') ?? 0,
      voteLastValid: data.get('vote-last-valid') ?? 0,
      voteParticipationKey:
        data.get('vote-participation-key') ?? new Uint8Array(),
      stateProofKey: data.get('state-proof-key'),
    });
  }
}

/**
 * Application state delta.
 */
export class AccountStateDelta implements MsgpackEncodable, JSONEncodable {
  public address: string;

  /**
   * Application state delta.
   */
  public delta: EvalDeltaKeyValue[];

  /**
   * Creates a new `AccountStateDelta` object.
   * @param address -
   * @param delta - Application state delta.
   */
  constructor({
    address,
    delta,
  }: {
    address: string;
    delta: EvalDeltaKeyValue[];
  }) {
    this.address = address;
    this.delta = delta;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['address', this.address],
      ['delta', this.delta.map((v) => v.msgpackPrepare())],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['address'] = this.address;
    obj['delta'] = this.delta.map((v) => v.jsonPrepare());
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): AccountStateDelta {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded AccountStateDelta: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new AccountStateDelta({
      address: data['address'] ?? '',
      delta: (data['delta'] ?? []).map(EvalDeltaKeyValue.fromDecodedJSON),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): AccountStateDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountStateDelta({
      address: data.get('address') ?? '',
      delta: (data.get('delta') ?? []).map(
        EvalDeltaKeyValue.fromDecodedMsgpack
      ),
    });
  }
}

/**
 * Application index and its parameters
 */
export class Application implements MsgpackEncodable, JSONEncodable {
  /**
   * (appidx) application index.
   */
  public id: bigint;

  /**
   * (appparams) application parameters.
   */
  public params: ApplicationParams;

  /**
   * Creates a new `Application` object.
   * @param id - (appidx) application index.
   * @param params - (appparams) application parameters.
   */
  constructor({
    id,
    params,
  }: {
    id: number | bigint;
    params: ApplicationParams;
  }) {
    this.id = ensureBigInt(id);
    this.params = params;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['id', this.id],
      ['params', this.params.msgpackPrepare()],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['id'] = this.id;
    obj['params'] = this.params.jsonPrepare();
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): Application {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded Application: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new Application({
      id: data['id'] ?? 0,
      params: ApplicationParams.fromDecodedJSON(data['params'] ?? {}),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): Application {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Application({
      id: data.get('id') ?? 0,
      params: ApplicationParams.fromDecodedMsgpack(data.get('params') ?? {}),
    });
  }
}

/**
 * An application's initial global/local/box states that were accessed during
 * simulation.
 */
export class ApplicationInitialStates
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * Application index.
   */
  public id: bigint;

  /**
   * An application's global/local/box state.
   */
  public appBoxes?: ApplicationKVStorage;

  /**
   * An application's global/local/box state.
   */
  public appGlobals?: ApplicationKVStorage;

  /**
   * An application's initial local states tied to different accounts.
   */
  public appLocals?: ApplicationKVStorage[];

  /**
   * Creates a new `ApplicationInitialStates` object.
   * @param id - Application index.
   * @param appBoxes - An application's global/local/box state.
   * @param appGlobals - An application's global/local/box state.
   * @param appLocals - An application's initial local states tied to different accounts.
   */
  constructor({
    id,
    appBoxes,
    appGlobals,
    appLocals,
  }: {
    id: number | bigint;
    appBoxes?: ApplicationKVStorage;
    appGlobals?: ApplicationKVStorage;
    appLocals?: ApplicationKVStorage[];
  }) {
    this.id = ensureBigInt(id);
    this.appBoxes = appBoxes;
    this.appGlobals = appGlobals;
    this.appLocals = appLocals;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([['id', this.id]]);
    if (this.appBoxes) {
      data.set('app-boxes', this.appBoxes.msgpackPrepare());
    }
    if (this.appGlobals) {
      data.set('app-globals', this.appGlobals.msgpackPrepare());
    }
    if (this.appLocals && this.appLocals.length) {
      data.set(
        'app-locals',
        this.appLocals.map((v) => v.msgpackPrepare())
      );
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['id'] = this.id;
    if (this.appBoxes) {
      obj['app-boxes'] = this.appBoxes.jsonPrepare();
    }
    if (this.appGlobals) {
      obj['app-globals'] = this.appGlobals.jsonPrepare();
    }
    if (this.appLocals && this.appLocals.length) {
      obj['app-locals'] = this.appLocals.map((v) => v.jsonPrepare());
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): ApplicationInitialStates {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded ApplicationInitialStates: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new ApplicationInitialStates({
      id: data['id'] ?? 0,
      appBoxes:
        typeof data['app-boxes'] !== 'undefined'
          ? ApplicationKVStorage.fromDecodedJSON(data['app-boxes'])
          : undefined,
      appGlobals:
        typeof data['app-globals'] !== 'undefined'
          ? ApplicationKVStorage.fromDecodedJSON(data['app-globals'])
          : undefined,
      appLocals:
        typeof data['app-locals'] !== 'undefined'
          ? data['app-locals'].map(ApplicationKVStorage.fromDecodedJSON)
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): ApplicationInitialStates {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationInitialStates({
      id: data.get('id') ?? 0,
      appBoxes:
        typeof data.get('app-boxes') !== 'undefined'
          ? ApplicationKVStorage.fromDecodedMsgpack(data.get('app-boxes'))
          : undefined,
      appGlobals:
        typeof data.get('app-globals') !== 'undefined'
          ? ApplicationKVStorage.fromDecodedMsgpack(data.get('app-globals'))
          : undefined,
      appLocals:
        typeof data.get('app-locals') !== 'undefined'
          ? data.get('app-locals').map(ApplicationKVStorage.fromDecodedMsgpack)
          : undefined,
    });
  }
}

/**
 * An application's global/local/box state.
 */
export class ApplicationKVStorage implements MsgpackEncodable, JSONEncodable {
  /**
   * Key-Value pairs representing application states.
   */
  public kvs: AvmKeyValue[];

  /**
   * The address of the account associated with the local state.
   */
  public account?: string;

  /**
   * Creates a new `ApplicationKVStorage` object.
   * @param kvs - Key-Value pairs representing application states.
   * @param account - The address of the account associated with the local state.
   */
  constructor({ kvs, account }: { kvs: AvmKeyValue[]; account?: string }) {
    this.kvs = kvs;
    this.account = account;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['kvs', this.kvs.map((v) => v.msgpackPrepare())],
    ]);
    if (this.account) {
      data.set('account', this.account);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['kvs'] = this.kvs.map((v) => v.jsonPrepare());
    if (this.account) {
      obj['account'] = this.account;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): ApplicationKVStorage {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded ApplicationKVStorage: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new ApplicationKVStorage({
      kvs: (data['kvs'] ?? []).map(AvmKeyValue.fromDecodedJSON),
      account: data['account'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): ApplicationKVStorage {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationKVStorage({
      kvs: (data.get('kvs') ?? []).map(AvmKeyValue.fromDecodedMsgpack),
      account: data.get('account'),
    });
  }
}

/**
 * References an account's local state for an application.
 */
export class ApplicationLocalReference
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * Address of the account with the local state.
   */
  public account: string;

  /**
   * Application ID of the local state application.
   */
  public app: bigint;

  /**
   * Creates a new `ApplicationLocalReference` object.
   * @param account - Address of the account with the local state.
   * @param app - Application ID of the local state application.
   */
  constructor({ account, app }: { account: string; app: number | bigint }) {
    this.account = account;
    this.app = ensureBigInt(app);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['account', this.account],
      ['app', this.app],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['account'] = this.account;
    obj['app'] = this.app;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): ApplicationLocalReference {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded ApplicationLocalReference: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new ApplicationLocalReference({
      account: data['account'] ?? '',
      app: data['app'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): ApplicationLocalReference {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationLocalReference({
      account: data.get('account') ?? '',
      app: data.get('app') ?? 0,
    });
  }
}

/**
 * Stores local state associated with an application.
 */
export class ApplicationLocalState implements MsgpackEncodable, JSONEncodable {
  /**
   * The application which this local state is for.
   */
  public id: bigint;

  /**
   * (hsch) schema.
   */
  public schema: ApplicationStateSchema;

  /**
   * (tkv) storage.
   */
  public keyValue?: TealKeyValue[];

  /**
   * Creates a new `ApplicationLocalState` object.
   * @param id - The application which this local state is for.
   * @param schema - (hsch) schema.
   * @param keyValue - (tkv) storage.
   */
  constructor({
    id,
    schema,
    keyValue,
  }: {
    id: number | bigint;
    schema: ApplicationStateSchema;
    keyValue?: TealKeyValue[];
  }) {
    this.id = ensureBigInt(id);
    this.schema = schema;
    this.keyValue = keyValue;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['id', this.id],
      ['schema', this.schema.msgpackPrepare()],
    ]);
    if (this.keyValue && this.keyValue.length) {
      data.set(
        'key-value',
        this.keyValue.map((v) => v.msgpackPrepare())
      );
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['id'] = this.id;
    obj['schema'] = this.schema.jsonPrepare();
    if (this.keyValue && this.keyValue.length) {
      obj['key-value'] = this.keyValue.map((v) => v.jsonPrepare());
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): ApplicationLocalState {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded ApplicationLocalState: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new ApplicationLocalState({
      id: data['id'] ?? 0,
      schema: ApplicationStateSchema.fromDecodedJSON(data['schema'] ?? {}),
      keyValue:
        typeof data['key-value'] !== 'undefined'
          ? data['key-value'].map(TealKeyValue.fromDecodedJSON)
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): ApplicationLocalState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationLocalState({
      id: data.get('id') ?? 0,
      schema: ApplicationStateSchema.fromDecodedMsgpack(
        data.get('schema') ?? {}
      ),
      keyValue:
        typeof data.get('key-value') !== 'undefined'
          ? data.get('key-value').map(TealKeyValue.fromDecodedMsgpack)
          : undefined,
    });
  }
}

/**
 * Stores the global information associated with an application.
 */
export class ApplicationParams implements MsgpackEncodable, JSONEncodable {
  /**
   * (approv) approval program.
   */
  public approvalProgram: Uint8Array;

  /**
   * (clearp) approval program.
   */
  public clearStateProgram: Uint8Array;

  /**
   * The address that created this application. This is the address where the
   * parameters and global state for this application can be found.
   */
  public creator: string;

  /**
   * (epp) the amount of extra program pages available to this app.
   */
  public extraProgramPages?: number;

  /**
   * (gs) global state
   */
  public globalState?: TealKeyValue[];

  /**
   * (gsch) global schema
   */
  public globalStateSchema?: ApplicationStateSchema;

  /**
   * (lsch) local schema
   */
  public localStateSchema?: ApplicationStateSchema;

  /**
   * Creates a new `ApplicationParams` object.
   * @param approvalProgram - (approv) approval program.
   * @param clearStateProgram - (clearp) approval program.
   * @param creator - The address that created this application. This is the address where the
   * parameters and global state for this application can be found.
   * @param extraProgramPages - (epp) the amount of extra program pages available to this app.
   * @param globalState - (gs) global state
   * @param globalStateSchema - (gsch) global schema
   * @param localStateSchema - (lsch) local schema
   */
  constructor({
    approvalProgram,
    clearStateProgram,
    creator,
    extraProgramPages,
    globalState,
    globalStateSchema,
    localStateSchema,
  }: {
    approvalProgram: string | Uint8Array;
    clearStateProgram: string | Uint8Array;
    creator: string;
    extraProgramPages?: number | bigint;
    globalState?: TealKeyValue[];
    globalStateSchema?: ApplicationStateSchema;
    localStateSchema?: ApplicationStateSchema;
  }) {
    this.approvalProgram =
      typeof approvalProgram === 'string'
        ? base64ToBytes(approvalProgram)
        : approvalProgram;
    this.clearStateProgram =
      typeof clearStateProgram === 'string'
        ? base64ToBytes(clearStateProgram)
        : clearStateProgram;
    this.creator = creator;
    this.extraProgramPages =
      typeof extraProgramPages === 'undefined'
        ? undefined
        : ensureSafeInteger(extraProgramPages);
    this.globalState = globalState;
    this.globalStateSchema = globalStateSchema;
    this.localStateSchema = localStateSchema;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['approval-program', this.approvalProgram],
      ['clear-state-program', this.clearStateProgram],
      ['creator', this.creator],
    ]);
    if (this.extraProgramPages) {
      data.set('extra-program-pages', this.extraProgramPages);
    }
    if (this.globalState && this.globalState.length) {
      data.set(
        'global-state',
        this.globalState.map((v) => v.msgpackPrepare())
      );
    }
    if (this.globalStateSchema) {
      data.set('global-state-schema', this.globalStateSchema.msgpackPrepare());
    }
    if (this.localStateSchema) {
      data.set('local-state-schema', this.localStateSchema.msgpackPrepare());
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['approval-program'] = bytesToBase64(this.approvalProgram);
    obj['clear-state-program'] = bytesToBase64(this.clearStateProgram);
    obj['creator'] = this.creator;
    if (this.extraProgramPages) {
      obj['extra-program-pages'] = this.extraProgramPages;
    }
    if (this.globalState && this.globalState.length) {
      obj['global-state'] = this.globalState.map((v) => v.jsonPrepare());
    }
    if (this.globalStateSchema) {
      obj['global-state-schema'] = this.globalStateSchema.jsonPrepare();
    }
    if (this.localStateSchema) {
      obj['local-state-schema'] = this.localStateSchema.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): ApplicationParams {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded ApplicationParams: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new ApplicationParams({
      approvalProgram: data['approval-program'] ?? new Uint8Array(),
      clearStateProgram: data['clear-state-program'] ?? new Uint8Array(),
      creator: data['creator'] ?? '',
      extraProgramPages: data['extra-program-pages'],
      globalState:
        typeof data['global-state'] !== 'undefined'
          ? data['global-state'].map(TealKeyValue.fromDecodedJSON)
          : undefined,
      globalStateSchema:
        typeof data['global-state-schema'] !== 'undefined'
          ? ApplicationStateSchema.fromDecodedJSON(data['global-state-schema'])
          : undefined,
      localStateSchema:
        typeof data['local-state-schema'] !== 'undefined'
          ? ApplicationStateSchema.fromDecodedJSON(data['local-state-schema'])
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): ApplicationParams {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationParams({
      approvalProgram: data.get('approval-program') ?? new Uint8Array(),
      clearStateProgram: data.get('clear-state-program') ?? new Uint8Array(),
      creator: data.get('creator') ?? '',
      extraProgramPages: data.get('extra-program-pages'),
      globalState:
        typeof data.get('global-state') !== 'undefined'
          ? data.get('global-state').map(TealKeyValue.fromDecodedMsgpack)
          : undefined,
      globalStateSchema:
        typeof data.get('global-state-schema') !== 'undefined'
          ? ApplicationStateSchema.fromDecodedMsgpack(
              data.get('global-state-schema')
            )
          : undefined,
      localStateSchema:
        typeof data.get('local-state-schema') !== 'undefined'
          ? ApplicationStateSchema.fromDecodedMsgpack(
              data.get('local-state-schema')
            )
          : undefined,
    });
  }
}

/**
 * An operation against an application's global/local/box state.
 */
export class ApplicationStateOperation
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * Type of application state. Value `g` is **global state**, `l` is **local
   * state**, `b` is **boxes**.
   */
  public appStateType: string;

  /**
   * The key (name) of the global/local/box state.
   */
  public key: Uint8Array;

  /**
   * Operation type. Value `w` is **write**, `d` is **delete**.
   */
  public operation: string;

  /**
   * For local state changes, the address of the account associated with the local
   * state.
   */
  public account?: string;

  /**
   * Represents an AVM value.
   */
  public newValue?: AvmValue;

  /**
   * Creates a new `ApplicationStateOperation` object.
   * @param appStateType - Type of application state. Value `g` is **global state**, `l` is **local
   * state**, `b` is **boxes**.
   * @param key - The key (name) of the global/local/box state.
   * @param operation - Operation type. Value `w` is **write**, `d` is **delete**.
   * @param account - For local state changes, the address of the account associated with the local
   * state.
   * @param newValue - Represents an AVM value.
   */
  constructor({
    appStateType,
    key,
    operation,
    account,
    newValue,
  }: {
    appStateType: string;
    key: string | Uint8Array;
    operation: string;
    account?: string;
    newValue?: AvmValue;
  }) {
    this.appStateType = appStateType;
    this.key = typeof key === 'string' ? base64ToBytes(key) : key;
    this.operation = operation;
    this.account = account;
    this.newValue = newValue;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['app-state-type', this.appStateType],
      ['key', this.key],
      ['operation', this.operation],
    ]);
    if (this.account) {
      data.set('account', this.account);
    }
    if (this.newValue) {
      data.set('new-value', this.newValue.msgpackPrepare());
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['app-state-type'] = this.appStateType;
    obj['key'] = bytesToBase64(this.key);
    obj['operation'] = this.operation;
    if (this.account) {
      obj['account'] = this.account;
    }
    if (this.newValue) {
      obj['new-value'] = this.newValue.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): ApplicationStateOperation {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded ApplicationStateOperation: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new ApplicationStateOperation({
      appStateType: data['app-state-type'] ?? '',
      key: data['key'] ?? new Uint8Array(),
      operation: data['operation'] ?? '',
      account: data['account'],
      newValue:
        typeof data['new-value'] !== 'undefined'
          ? AvmValue.fromDecodedJSON(data['new-value'])
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): ApplicationStateOperation {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationStateOperation({
      appStateType: data.get('app-state-type') ?? '',
      key: data.get('key') ?? new Uint8Array(),
      operation: data.get('operation') ?? '',
      account: data.get('account'),
      newValue:
        typeof data.get('new-value') !== 'undefined'
          ? AvmValue.fromDecodedMsgpack(data.get('new-value'))
          : undefined,
    });
  }
}

/**
 * Specifies maximums on the number of each type that may be stored.
 */
export class ApplicationStateSchema implements MsgpackEncodable, JSONEncodable {
  /**
   * (nbs) num of byte slices.
   */
  public numByteSlice: number;

  /**
   * (nui) num of uints.
   */
  public numUint: number;

  /**
   * Creates a new `ApplicationStateSchema` object.
   * @param numByteSlice - (nbs) num of byte slices.
   * @param numUint - (nui) num of uints.
   */
  constructor({
    numByteSlice,
    numUint,
  }: {
    numByteSlice: number | bigint;
    numUint: number | bigint;
  }) {
    this.numByteSlice = ensureSafeInteger(numByteSlice);
    this.numUint = ensureSafeInteger(numUint);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['num-byte-slice', this.numByteSlice],
      ['num-uint', this.numUint],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['num-byte-slice'] = this.numByteSlice;
    obj['num-uint'] = this.numUint;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): ApplicationStateSchema {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded ApplicationStateSchema: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new ApplicationStateSchema({
      numByteSlice: data['num-byte-slice'] ?? 0,
      numUint: data['num-uint'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): ApplicationStateSchema {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationStateSchema({
      numByteSlice: data.get('num-byte-slice') ?? 0,
      numUint: data.get('num-uint') ?? 0,
    });
  }
}

/**
 * Specifies both the unique identifier and the parameters for an asset
 */
export class Asset implements MsgpackEncodable, JSONEncodable {
  /**
   * unique asset identifier
   */
  public index: bigint;

  /**
   * AssetParams specifies the parameters for an asset.
   * (apar) when part of an AssetConfig transaction.
   * Definition:
   * data/transactions/asset.go : AssetParams
   */
  public params: AssetParams;

  /**
   * Creates a new `Asset` object.
   * @param index - unique asset identifier
   * @param params - AssetParams specifies the parameters for an asset.
   * (apar) when part of an AssetConfig transaction.
   * Definition:
   * data/transactions/asset.go : AssetParams
   */
  constructor({
    index,
    params,
  }: {
    index: number | bigint;
    params: AssetParams;
  }) {
    this.index = ensureBigInt(index);
    this.params = params;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['index', this.index],
      ['params', this.params.msgpackPrepare()],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['index'] = this.index;
    obj['params'] = this.params.jsonPrepare();
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): Asset {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded Asset: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new Asset({
      index: data['index'] ?? 0,
      params: AssetParams.fromDecodedJSON(data['params'] ?? {}),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): Asset {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Asset({
      index: data.get('index') ?? 0,
      params: AssetParams.fromDecodedMsgpack(data.get('params') ?? {}),
    });
  }
}

/**
 * Describes an asset held by an account.
 * Definition:
 * data/basics/userBalance.go : AssetHolding
 */
export class AssetHolding implements MsgpackEncodable, JSONEncodable {
  /**
   * (a) number of units held.
   */
  public amount: bigint;

  /**
   * Asset ID of the holding.
   */
  public assetId: bigint;

  /**
   * (f) whether or not the holding is frozen.
   */
  public isFrozen: boolean;

  /**
   * Creates a new `AssetHolding` object.
   * @param amount - (a) number of units held.
   * @param assetId - Asset ID of the holding.
   * @param isFrozen - (f) whether or not the holding is frozen.
   */
  constructor({
    amount,
    assetId,
    isFrozen,
  }: {
    amount: number | bigint;
    assetId: number | bigint;
    isFrozen: boolean;
  }) {
    this.amount = ensureBigInt(amount);
    this.assetId = ensureBigInt(assetId);
    this.isFrozen = isFrozen;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['amount', this.amount],
      ['asset-id', this.assetId],
      ['is-frozen', this.isFrozen],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['amount'] = this.amount;
    obj['asset-id'] = this.assetId;
    obj['is-frozen'] = this.isFrozen;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): AssetHolding {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded AssetHolding: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new AssetHolding({
      amount: data['amount'] ?? 0,
      assetId: data['asset-id'] ?? 0,
      isFrozen: data['is-frozen'] ?? false,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): AssetHolding {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetHolding({
      amount: data.get('amount') ?? 0,
      assetId: data.get('asset-id') ?? 0,
      isFrozen: data.get('is-frozen') ?? false,
    });
  }
}

/**
 * References an asset held by an account.
 */
export class AssetHoldingReference implements MsgpackEncodable, JSONEncodable {
  /**
   * Address of the account holding the asset.
   */
  public account: string;

  /**
   * Asset ID of the holding.
   */
  public asset: bigint;

  /**
   * Creates a new `AssetHoldingReference` object.
   * @param account - Address of the account holding the asset.
   * @param asset - Asset ID of the holding.
   */
  constructor({ account, asset }: { account: string; asset: number | bigint }) {
    this.account = account;
    this.asset = ensureBigInt(asset);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['account', this.account],
      ['asset', this.asset],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['account'] = this.account;
    obj['asset'] = this.asset;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): AssetHoldingReference {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded AssetHoldingReference: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new AssetHoldingReference({
      account: data['account'] ?? '',
      asset: data['asset'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): AssetHoldingReference {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetHoldingReference({
      account: data.get('account') ?? '',
      asset: data.get('asset') ?? 0,
    });
  }
}

/**
 * AssetParams specifies the parameters for an asset.
 * (apar) when part of an AssetConfig transaction.
 * Definition:
 * data/transactions/asset.go : AssetParams
 */
export class AssetParams implements MsgpackEncodable, JSONEncodable {
  /**
   * The address that created this asset. This is the address where the parameters
   * for this asset can be found, and also the address where unwanted asset units can
   * be sent in the worst case.
   */
  public creator: string;

  /**
   * (dc) The number of digits to use after the decimal point when displaying this
   * asset. If 0, the asset is not divisible. If 1, the base unit of the asset is in
   * tenths. If 2, the base unit of the asset is in hundredths, and so on. This value
   * must be between 0 and 19 (inclusive).
   */
  public decimals: number;

  /**
   * (t) The total number of units of this asset.
   */
  public total: bigint;

  /**
   * (c) Address of account used to clawback holdings of this asset. If empty,
   * clawback is not permitted.
   */
  public clawback?: string;

  /**
   * (df) Whether holdings of this asset are frozen by default.
   */
  public defaultFrozen?: boolean;

  /**
   * (f) Address of account used to freeze holdings of this asset. If empty, freezing
   * is not permitted.
   */
  public freeze?: string;

  /**
   * (m) Address of account used to manage the keys of this asset and to destroy it.
   */
  public manager?: string;

  /**
   * (am) A commitment to some unspecified asset metadata. The format of this
   * metadata is up to the application.
   */
  public metadataHash?: Uint8Array;

  /**
   * (an) Name of this asset, as supplied by the creator. Included only when the
   * asset name is composed of printable utf-8 characters.
   */
  public name?: string;

  /**
   * Base64 encoded name of this asset, as supplied by the creator.
   */
  public nameB64?: Uint8Array;

  /**
   * (r) Address of account holding reserve (non-minted) units of this asset.
   */
  public reserve?: string;

  /**
   * (un) Name of a unit of this asset, as supplied by the creator. Included only
   * when the name of a unit of this asset is composed of printable utf-8 characters.
   */
  public unitName?: string;

  /**
   * Base64 encoded name of a unit of this asset, as supplied by the creator.
   */
  public unitNameB64?: Uint8Array;

  /**
   * (au) URL where more information about the asset can be retrieved. Included only
   * when the URL is composed of printable utf-8 characters.
   */
  public url?: string;

  /**
   * Base64 encoded URL where more information about the asset can be retrieved.
   */
  public urlB64?: Uint8Array;

  /**
   * Creates a new `AssetParams` object.
   * @param creator - The address that created this asset. This is the address where the parameters
   * for this asset can be found, and also the address where unwanted asset units can
   * be sent in the worst case.
   * @param decimals - (dc) The number of digits to use after the decimal point when displaying this
   * asset. If 0, the asset is not divisible. If 1, the base unit of the asset is in
   * tenths. If 2, the base unit of the asset is in hundredths, and so on. This value
   * must be between 0 and 19 (inclusive).
   * @param total - (t) The total number of units of this asset.
   * @param clawback - (c) Address of account used to clawback holdings of this asset. If empty,
   * clawback is not permitted.
   * @param defaultFrozen - (df) Whether holdings of this asset are frozen by default.
   * @param freeze - (f) Address of account used to freeze holdings of this asset. If empty, freezing
   * is not permitted.
   * @param manager - (m) Address of account used to manage the keys of this asset and to destroy it.
   * @param metadataHash - (am) A commitment to some unspecified asset metadata. The format of this
   * metadata is up to the application.
   * @param name - (an) Name of this asset, as supplied by the creator. Included only when the
   * asset name is composed of printable utf-8 characters.
   * @param nameB64 - Base64 encoded name of this asset, as supplied by the creator.
   * @param reserve - (r) Address of account holding reserve (non-minted) units of this asset.
   * @param unitName - (un) Name of a unit of this asset, as supplied by the creator. Included only
   * when the name of a unit of this asset is composed of printable utf-8 characters.
   * @param unitNameB64 - Base64 encoded name of a unit of this asset, as supplied by the creator.
   * @param url - (au) URL where more information about the asset can be retrieved. Included only
   * when the URL is composed of printable utf-8 characters.
   * @param urlB64 - Base64 encoded URL where more information about the asset can be retrieved.
   */
  constructor({
    creator,
    decimals,
    total,
    clawback,
    defaultFrozen,
    freeze,
    manager,
    metadataHash,
    name,
    nameB64,
    reserve,
    unitName,
    unitNameB64,
    url,
    urlB64,
  }: {
    creator: string;
    decimals: number | bigint;
    total: number | bigint;
    clawback?: string;
    defaultFrozen?: boolean;
    freeze?: string;
    manager?: string;
    metadataHash?: string | Uint8Array;
    name?: string;
    nameB64?: string | Uint8Array;
    reserve?: string;
    unitName?: string;
    unitNameB64?: string | Uint8Array;
    url?: string;
    urlB64?: string | Uint8Array;
  }) {
    this.creator = creator;
    this.decimals = ensureSafeInteger(decimals);
    this.total = ensureBigInt(total);
    this.clawback = clawback;
    this.defaultFrozen = defaultFrozen;
    this.freeze = freeze;
    this.manager = manager;
    this.metadataHash =
      typeof metadataHash === 'string'
        ? base64ToBytes(metadataHash)
        : metadataHash;
    this.name = name;
    this.nameB64 =
      typeof nameB64 === 'string' ? base64ToBytes(nameB64) : nameB64;
    this.reserve = reserve;
    this.unitName = unitName;
    this.unitNameB64 =
      typeof unitNameB64 === 'string'
        ? base64ToBytes(unitNameB64)
        : unitNameB64;
    this.url = url;
    this.urlB64 = typeof urlB64 === 'string' ? base64ToBytes(urlB64) : urlB64;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['creator', this.creator],
      ['decimals', this.decimals],
      ['total', this.total],
    ]);
    if (this.clawback) {
      data.set('clawback', this.clawback);
    }
    if (this.defaultFrozen) {
      data.set('default-frozen', this.defaultFrozen);
    }
    if (this.freeze) {
      data.set('freeze', this.freeze);
    }
    if (this.manager) {
      data.set('manager', this.manager);
    }
    if (this.metadataHash) {
      data.set('metadata-hash', this.metadataHash);
    }
    if (this.name) {
      data.set('name', this.name);
    }
    if (this.nameB64) {
      data.set('name-b64', this.nameB64);
    }
    if (this.reserve) {
      data.set('reserve', this.reserve);
    }
    if (this.unitName) {
      data.set('unit-name', this.unitName);
    }
    if (this.unitNameB64) {
      data.set('unit-name-b64', this.unitNameB64);
    }
    if (this.url) {
      data.set('url', this.url);
    }
    if (this.urlB64) {
      data.set('url-b64', this.urlB64);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['creator'] = this.creator;
    obj['decimals'] = this.decimals;
    obj['total'] = this.total;
    if (this.clawback) {
      obj['clawback'] = this.clawback;
    }
    if (this.defaultFrozen) {
      obj['default-frozen'] = this.defaultFrozen;
    }
    if (this.freeze) {
      obj['freeze'] = this.freeze;
    }
    if (this.manager) {
      obj['manager'] = this.manager;
    }
    if (this.metadataHash) {
      obj['metadata-hash'] = bytesToBase64(this.metadataHash);
    }
    if (this.name) {
      obj['name'] = this.name;
    }
    if (this.nameB64) {
      obj['name-b64'] = bytesToBase64(this.nameB64);
    }
    if (this.reserve) {
      obj['reserve'] = this.reserve;
    }
    if (this.unitName) {
      obj['unit-name'] = this.unitName;
    }
    if (this.unitNameB64) {
      obj['unit-name-b64'] = bytesToBase64(this.unitNameB64);
    }
    if (this.url) {
      obj['url'] = this.url;
    }
    if (this.urlB64) {
      obj['url-b64'] = bytesToBase64(this.urlB64);
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): AssetParams {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded AssetParams: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new AssetParams({
      creator: data['creator'] ?? '',
      decimals: data['decimals'] ?? 0,
      total: data['total'] ?? 0,
      clawback: data['clawback'],
      defaultFrozen: data['default-frozen'],
      freeze: data['freeze'],
      manager: data['manager'],
      metadataHash: data['metadata-hash'],
      name: data['name'],
      nameB64: data['name-b64'],
      reserve: data['reserve'],
      unitName: data['unit-name'],
      unitNameB64: data['unit-name-b64'],
      url: data['url'],
      urlB64: data['url-b64'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): AssetParams {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetParams({
      creator: data.get('creator') ?? '',
      decimals: data.get('decimals') ?? 0,
      total: data.get('total') ?? 0,
      clawback: data.get('clawback'),
      defaultFrozen: data.get('default-frozen'),
      freeze: data.get('freeze'),
      manager: data.get('manager'),
      metadataHash: data.get('metadata-hash'),
      name: data.get('name'),
      nameB64: data.get('name-b64'),
      reserve: data.get('reserve'),
      unitName: data.get('unit-name'),
      unitNameB64: data.get('unit-name-b64'),
      url: data.get('url'),
      urlB64: data.get('url-b64'),
    });
  }
}

/**
 * Represents an AVM key-value pair in an application store.
 */
export class AvmKeyValue implements MsgpackEncodable, JSONEncodable {
  public key: Uint8Array;

  /**
   * Represents an AVM value.
   */
  public value: AvmValue;

  /**
   * Creates a new `AvmKeyValue` object.
   * @param key -
   * @param value - Represents an AVM value.
   */
  constructor({ key, value }: { key: string | Uint8Array; value: AvmValue }) {
    this.key = typeof key === 'string' ? base64ToBytes(key) : key;
    this.value = value;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['key', this.key],
      ['value', this.value.msgpackPrepare()],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['key'] = bytesToBase64(this.key);
    obj['value'] = this.value.jsonPrepare();
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): AvmKeyValue {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded AvmKeyValue: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new AvmKeyValue({
      key: data['key'] ?? new Uint8Array(),
      value: AvmValue.fromDecodedJSON(data['value'] ?? {}),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): AvmKeyValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AvmKeyValue({
      key: data.get('key') ?? new Uint8Array(),
      value: AvmValue.fromDecodedMsgpack(data.get('value') ?? {}),
    });
  }
}

/**
 * Represents an AVM value.
 */
export class AvmValue implements MsgpackEncodable, JSONEncodable {
  /**
   * value type. Value `1` refers to **bytes**, value `2` refers to **uint64**
   */
  public type: number;

  /**
   * bytes value.
   */
  public bytes?: Uint8Array;

  /**
   * uint value.
   */
  public uint?: bigint;

  /**
   * Creates a new `AvmValue` object.
   * @param type - value type. Value `1` refers to **bytes**, value `2` refers to **uint64**
   * @param bytes - bytes value.
   * @param uint - uint value.
   */
  constructor({
    type,
    bytes,
    uint,
  }: {
    type: number | bigint;
    bytes?: string | Uint8Array;
    uint?: number | bigint;
  }) {
    this.type = ensureSafeInteger(type);
    this.bytes = typeof bytes === 'string' ? base64ToBytes(bytes) : bytes;
    this.uint = typeof uint === 'undefined' ? undefined : ensureBigInt(uint);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([['type', this.type]]);
    if (this.bytes) {
      data.set('bytes', this.bytes);
    }
    if (this.uint) {
      data.set('uint', this.uint);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['type'] = this.type;
    if (this.bytes) {
      obj['bytes'] = bytesToBase64(this.bytes);
    }
    if (this.uint) {
      obj['uint'] = this.uint;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): AvmValue {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded AvmValue: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new AvmValue({
      type: data['type'] ?? 0,
      bytes: data['bytes'],
      uint: data['uint'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): AvmValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AvmValue({
      type: data.get('type') ?? 0,
      bytes: data.get('bytes'),
      uint: data.get('uint'),
    });
  }
}

/**
 * Hash of a block header.
 */
export class BlockHashResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * Block header hash.
   */
  public blockhash: string;

  /**
   * Creates a new `BlockHashResponse` object.
   * @param blockhash - Block header hash.
   */
  constructor({ blockhash }: { blockhash: string }) {
    this.blockhash = blockhash;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['blockHash', this.blockhash],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['blockHash'] = this.blockhash;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): BlockHashResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded BlockHashResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new BlockHashResponse({
      blockhash: data['blockHash'] ?? '',
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): BlockHashResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BlockHashResponse({
      blockhash: data.get('blockHash') ?? '',
    });
  }
}

/**
 * Encoded block object.
 */
export class BlockResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * Block header data.
   */
  public block: BlockHeader;

  /**
   * Optional certificate object. This is only included when the format is set to
   * message pack.
   */
  public cert?: UntypedValue;

  /**
   * Creates a new `BlockResponse` object.
   * @param block - Block header data.
   * @param cert - Optional certificate object. This is only included when the format is set to
   * message pack.
   */
  constructor({ block, cert }: { block: BlockHeader; cert?: UntypedValue }) {
    this.block = block;
    this.cert = cert;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['block', blockHeaderMsgpackPrepare(this.block)],
    ]);
    if (this.cert) {
      data.set('cert', this.cert.msgpackPrepare());
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['block'] = blockHeaderJSONPrepare(this.block);
    if (this.cert) {
      obj['cert'] = this.cert.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): BlockResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded BlockResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new BlockResponse({
      block: blockHeaderFromDecodedJSON(data['block']),
      cert:
        typeof data['cert'] !== 'undefined'
          ? UntypedValue.fromDecodedJSON(data['cert'])
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): BlockResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BlockResponse({
      block: blockHeaderFromDecodedMsgpack(data.get('block')),
      cert:
        typeof data.get('cert') !== 'undefined'
          ? UntypedValue.fromDecodedMsgpack(data.get('cert'))
          : undefined,
    });
  }
}

/**
 * Top level transaction IDs in a block.
 */
export class BlockTxidsResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * Block transaction IDs.
   */
  public blocktxids: string[];

  /**
   * Creates a new `BlockTxidsResponse` object.
   * @param blocktxids - Block transaction IDs.
   */
  constructor({ blocktxids }: { blocktxids: string[] }) {
    this.blocktxids = blocktxids;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['blockTxids', this.blocktxids],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['blockTxids'] = this.blocktxids;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): BlockTxidsResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded BlockTxidsResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new BlockTxidsResponse({
      blocktxids: data['blockTxids'] ?? [],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): BlockTxidsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BlockTxidsResponse({
      blocktxids: data.get('blockTxids') ?? [],
    });
  }
}

/**
 * Box name and its content.
 */
export class Box implements MsgpackEncodable, JSONEncodable {
  /**
   * (name) box name, base64 encoded
   */
  public name: Uint8Array;

  /**
   * The round for which this information is relevant
   */
  public round: bigint;

  /**
   * (value) box value, base64 encoded.
   */
  public value: Uint8Array;

  /**
   * Creates a new `Box` object.
   * @param name - (name) box name, base64 encoded
   * @param round - The round for which this information is relevant
   * @param value - (value) box value, base64 encoded.
   */
  constructor({
    name,
    round,
    value,
  }: {
    name: string | Uint8Array;
    round: number | bigint;
    value: string | Uint8Array;
  }) {
    this.name = typeof name === 'string' ? base64ToBytes(name) : name;
    this.round = ensureBigInt(round);
    this.value = typeof value === 'string' ? base64ToBytes(value) : value;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['name', this.name],
      ['round', this.round],
      ['value', this.value],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['name'] = bytesToBase64(this.name);
    obj['round'] = this.round;
    obj['value'] = bytesToBase64(this.value);
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): Box {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded Box: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new Box({
      name: data['name'] ?? new Uint8Array(),
      round: data['round'] ?? 0,
      value: data['value'] ?? new Uint8Array(),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): Box {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Box({
      name: data.get('name') ?? new Uint8Array(),
      round: data.get('round') ?? 0,
      value: data.get('value') ?? new Uint8Array(),
    });
  }
}

/**
 * Box descriptor describes a Box.
 */
export class BoxDescriptor implements MsgpackEncodable, JSONEncodable {
  /**
   * Base64 encoded box name
   */
  public name: Uint8Array;

  /**
   * Creates a new `BoxDescriptor` object.
   * @param name - Base64 encoded box name
   */
  constructor({ name }: { name: string | Uint8Array }) {
    this.name = typeof name === 'string' ? base64ToBytes(name) : name;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([['name', this.name]]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['name'] = bytesToBase64(this.name);
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): BoxDescriptor {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded BoxDescriptor: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new BoxDescriptor({
      name: data['name'] ?? new Uint8Array(),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): BoxDescriptor {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BoxDescriptor({
      name: data.get('name') ?? new Uint8Array(),
    });
  }
}

/**
 * References a box of an application.
 */
export class BoxReference implements MsgpackEncodable, JSONEncodable {
  /**
   * Application ID which this box belongs to
   */
  public app: bigint;

  /**
   * Base64 encoded box name
   */
  public name: Uint8Array;

  /**
   * Creates a new `BoxReference` object.
   * @param app - Application ID which this box belongs to
   * @param name - Base64 encoded box name
   */
  constructor({
    app,
    name,
  }: {
    app: number | bigint;
    name: string | Uint8Array;
  }) {
    this.app = ensureBigInt(app);
    this.name = typeof name === 'string' ? base64ToBytes(name) : name;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['app', this.app],
      ['name', this.name],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['app'] = this.app;
    obj['name'] = bytesToBase64(this.name);
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): BoxReference {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded BoxReference: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new BoxReference({
      app: data['app'] ?? 0,
      name: data['name'] ?? new Uint8Array(),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): BoxReference {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BoxReference({
      app: data.get('app') ?? 0,
      name: data.get('name') ?? new Uint8Array(),
    });
  }
}

/**
 * Box names of an application
 */
export class BoxesResponse implements MsgpackEncodable, JSONEncodable {
  public boxes: BoxDescriptor[];

  /**
   * Creates a new `BoxesResponse` object.
   * @param boxes -
   */
  constructor({ boxes }: { boxes: BoxDescriptor[] }) {
    this.boxes = boxes;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['boxes', this.boxes.map((v) => v.msgpackPrepare())],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['boxes'] = this.boxes.map((v) => v.jsonPrepare());
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): BoxesResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded BoxesResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new BoxesResponse({
      boxes: (data['boxes'] ?? []).map(BoxDescriptor.fromDecodedJSON),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): BoxesResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BoxesResponse({
      boxes: (data.get('boxes') ?? []).map(BoxDescriptor.fromDecodedMsgpack),
    });
  }
}

export class BuildVersion implements MsgpackEncodable, JSONEncodable {
  public branch: string;

  public buildNumber: number;

  public channel: string;

  public commitHash: string;

  public major: number;

  public minor: number;

  /**
   * Creates a new `BuildVersion` object.
   * @param branch -
   * @param buildNumber -
   * @param channel -
   * @param commitHash -
   * @param major -
   * @param minor -
   */
  constructor({
    branch,
    buildNumber,
    channel,
    commitHash,
    major,
    minor,
  }: {
    branch: string;
    buildNumber: number | bigint;
    channel: string;
    commitHash: string;
    major: number | bigint;
    minor: number | bigint;
  }) {
    this.branch = branch;
    this.buildNumber = ensureSafeInteger(buildNumber);
    this.channel = channel;
    this.commitHash = commitHash;
    this.major = ensureSafeInteger(major);
    this.minor = ensureSafeInteger(minor);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['branch', this.branch],
      ['build_number', this.buildNumber],
      ['channel', this.channel],
      ['commit_hash', this.commitHash],
      ['major', this.major],
      ['minor', this.minor],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['branch'] = this.branch;
    obj['build_number'] = this.buildNumber;
    obj['channel'] = this.channel;
    obj['commit_hash'] = this.commitHash;
    obj['major'] = this.major;
    obj['minor'] = this.minor;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): BuildVersion {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded BuildVersion: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new BuildVersion({
      branch: data['branch'] ?? '',
      buildNumber: data['build_number'] ?? 0,
      channel: data['channel'] ?? '',
      commitHash: data['commit_hash'] ?? '',
      major: data['major'] ?? 0,
      minor: data['minor'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): BuildVersion {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BuildVersion({
      branch: data.get('branch') ?? '',
      buildNumber: data.get('build_number') ?? 0,
      channel: data.get('channel') ?? '',
      commitHash: data.get('commit_hash') ?? '',
      major: data.get('major') ?? 0,
      minor: data.get('minor') ?? 0,
    });
  }
}

/**
 * Teal compile Result
 */
export class CompileResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * base32 SHA512_256 of program bytes (Address style)
   */
  public hash: string;

  /**
   * base64 encoded program bytes
   */
  public result: string;

  /**
   * JSON of the source map
   */
  public sourcemap?: UntypedValue;

  /**
   * Creates a new `CompileResponse` object.
   * @param hash - base32 SHA512_256 of program bytes (Address style)
   * @param result - base64 encoded program bytes
   * @param sourcemap - JSON of the source map
   */
  constructor({
    hash,
    result,
    sourcemap,
  }: {
    hash: string;
    result: string;
    sourcemap?: UntypedValue;
  }) {
    this.hash = hash;
    this.result = result;
    this.sourcemap = sourcemap;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['hash', this.hash],
      ['result', this.result],
    ]);
    if (this.sourcemap) {
      data.set('sourcemap', this.sourcemap.msgpackPrepare());
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['hash'] = this.hash;
    obj['result'] = this.result;
    if (this.sourcemap) {
      obj['sourcemap'] = this.sourcemap.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): CompileResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded CompileResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new CompileResponse({
      hash: data['hash'] ?? '',
      result: data['result'] ?? '',
      sourcemap:
        typeof data['sourcemap'] !== 'undefined'
          ? UntypedValue.fromDecodedJSON(data['sourcemap'])
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): CompileResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new CompileResponse({
      hash: data.get('hash') ?? '',
      result: data.get('result') ?? '',
      sourcemap:
        typeof data.get('sourcemap') !== 'undefined'
          ? UntypedValue.fromDecodedMsgpack(data.get('sourcemap'))
          : undefined,
    });
  }
}

/**
 * Teal disassembly Result
 */
export class DisassembleResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * disassembled Teal code
   */
  public result: string;

  /**
   * Creates a new `DisassembleResponse` object.
   * @param result - disassembled Teal code
   */
  constructor({ result }: { result: string }) {
    this.result = result;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['result', this.result],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['result'] = this.result;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): DisassembleResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded DisassembleResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new DisassembleResponse({
      result: data['result'] ?? '',
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): DisassembleResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DisassembleResponse({
      result: data.get('result') ?? '',
    });
  }
}

/**
 * Request data type for dryrun endpoint. Given the Transactions and simulated
 * ledger state upload, run TEAL scripts and return debugging information.
 */
export class DryrunRequest implements MsgpackEncodable, JSONEncodable {
  public accounts: Account[];

  public apps: Application[];

  /**
   * LatestTimestamp is available to some TEAL scripts. Defaults to the latest
   * confirmed timestamp this algod is attached to.
   */
  public latestTimestamp: number;

  /**
   * ProtocolVersion specifies a specific version string to operate under, otherwise
   * whatever the current protocol of the network this algod is running in.
   */
  public protocolVersion: string;

  /**
   * Round is available to some TEAL scripts. Defaults to the current round on the
   * network this algod is attached to.
   */
  public round: bigint;

  public sources: DryrunSource[];

  public txns: SignedTransaction[];

  /**
   * Creates a new `DryrunRequest` object.
   * @param accounts -
   * @param apps -
   * @param latestTimestamp - LatestTimestamp is available to some TEAL scripts. Defaults to the latest
   * confirmed timestamp this algod is attached to.
   * @param protocolVersion - ProtocolVersion specifies a specific version string to operate under, otherwise
   * whatever the current protocol of the network this algod is running in.
   * @param round - Round is available to some TEAL scripts. Defaults to the current round on the
   * network this algod is attached to.
   * @param sources -
   * @param txns -
   */
  constructor({
    accounts,
    apps,
    latestTimestamp,
    protocolVersion,
    round,
    sources,
    txns,
  }: {
    accounts: Account[];
    apps: Application[];
    latestTimestamp: number | bigint;
    protocolVersion: string;
    round: number | bigint;
    sources: DryrunSource[];
    txns: SignedTransaction[];
  }) {
    this.accounts = accounts;
    this.apps = apps;
    this.latestTimestamp = ensureSafeInteger(latestTimestamp);
    this.protocolVersion = protocolVersion;
    this.round = ensureBigInt(round);
    this.sources = sources;
    this.txns = txns;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['accounts', this.accounts.map((v) => v.msgpackPrepare())],
      ['apps', this.apps.map((v) => v.msgpackPrepare())],
      ['latest-timestamp', this.latestTimestamp],
      ['protocol-version', this.protocolVersion],
      ['round', this.round],
      ['sources', this.sources.map((v) => v.msgpackPrepare())],
      ['txns', this.txns.map((v) => v.msgpackPrepare())],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['accounts'] = this.accounts.map((v) => v.jsonPrepare());
    obj['apps'] = this.apps.map((v) => v.jsonPrepare());
    obj['latest-timestamp'] = this.latestTimestamp;
    obj['protocol-version'] = this.protocolVersion;
    obj['round'] = this.round;
    obj['sources'] = this.sources.map((v) => v.jsonPrepare());
    obj['txns'] = this.txns.map((v) => v.jsonPrepare());
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): DryrunRequest {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded DryrunRequest: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new DryrunRequest({
      accounts: (data['accounts'] ?? []).map(Account.fromDecodedJSON),
      apps: (data['apps'] ?? []).map(Application.fromDecodedJSON),
      latestTimestamp: data['latest-timestamp'] ?? 0,
      protocolVersion: data['protocol-version'] ?? '',
      round: data['round'] ?? 0,
      sources: (data['sources'] ?? []).map(DryrunSource.fromDecodedJSON),
      txns: (data['txns'] ?? []).map(SignedTransaction.fromDecodedJSON),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): DryrunRequest {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunRequest({
      accounts: (data.get('accounts') ?? []).map(Account.fromDecodedMsgpack),
      apps: (data.get('apps') ?? []).map(Application.fromDecodedMsgpack),
      latestTimestamp: data.get('latest-timestamp') ?? 0,
      protocolVersion: data.get('protocol-version') ?? '',
      round: data.get('round') ?? 0,
      sources: (data.get('sources') ?? []).map(DryrunSource.fromDecodedMsgpack),
      txns: (data.get('txns') ?? []).map(SignedTransaction.fromDecodedMsgpack),
    });
  }
}

/**
 * DryrunResponse contains per-txn debug information from a dryrun.
 */
export class DryrunResponse implements MsgpackEncodable, JSONEncodable {
  public error: string;

  /**
   * Protocol version is the protocol version Dryrun was operated under.
   */
  public protocolVersion: string;

  public txns: DryrunTxnResult[];

  /**
   * Creates a new `DryrunResponse` object.
   * @param error -
   * @param protocolVersion - Protocol version is the protocol version Dryrun was operated under.
   * @param txns -
   */
  constructor({
    error,
    protocolVersion,
    txns,
  }: {
    error: string;
    protocolVersion: string;
    txns: DryrunTxnResult[];
  }) {
    this.error = error;
    this.protocolVersion = protocolVersion;
    this.txns = txns;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['error', this.error],
      ['protocol-version', this.protocolVersion],
      ['txns', this.txns.map((v) => v.msgpackPrepare())],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['error'] = this.error;
    obj['protocol-version'] = this.protocolVersion;
    obj['txns'] = this.txns.map((v) => v.jsonPrepare());
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): DryrunResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded DryrunResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new DryrunResponse({
      error: data['error'] ?? '',
      protocolVersion: data['protocol-version'] ?? '',
      txns: (data['txns'] ?? []).map(DryrunTxnResult.fromDecodedJSON),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): DryrunResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunResponse({
      error: data.get('error') ?? '',
      protocolVersion: data.get('protocol-version') ?? '',
      txns: (data.get('txns') ?? []).map(DryrunTxnResult.fromDecodedMsgpack),
    });
  }
}

/**
 * DryrunSource is TEAL source text that gets uploaded, compiled, and inserted into
 * transactions or application state.
 */
export class DryrunSource implements MsgpackEncodable, JSONEncodable {
  public appIndex: bigint;

  /**
   * FieldName is what kind of sources this is. If lsig then it goes into the
   * transactions[this.TxnIndex].LogicSig. If approv or clearp it goes into the
   * Approval Program or Clear State Program of application[this.AppIndex].
   */
  public fieldName: string;

  public source: string;

  public txnIndex: number;

  /**
   * Creates a new `DryrunSource` object.
   * @param appIndex -
   * @param fieldName - FieldName is what kind of sources this is. If lsig then it goes into the
   * transactions[this.TxnIndex].LogicSig. If approv or clearp it goes into the
   * Approval Program or Clear State Program of application[this.AppIndex].
   * @param source -
   * @param txnIndex -
   */
  constructor({
    appIndex,
    fieldName,
    source,
    txnIndex,
  }: {
    appIndex: number | bigint;
    fieldName: string;
    source: string;
    txnIndex: number | bigint;
  }) {
    this.appIndex = ensureBigInt(appIndex);
    this.fieldName = fieldName;
    this.source = source;
    this.txnIndex = ensureSafeInteger(txnIndex);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['app-index', this.appIndex],
      ['field-name', this.fieldName],
      ['source', this.source],
      ['txn-index', this.txnIndex],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['app-index'] = this.appIndex;
    obj['field-name'] = this.fieldName;
    obj['source'] = this.source;
    obj['txn-index'] = this.txnIndex;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): DryrunSource {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded DryrunSource: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new DryrunSource({
      appIndex: data['app-index'] ?? 0,
      fieldName: data['field-name'] ?? '',
      source: data['source'] ?? '',
      txnIndex: data['txn-index'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): DryrunSource {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunSource({
      appIndex: data.get('app-index') ?? 0,
      fieldName: data.get('field-name') ?? '',
      source: data.get('source') ?? '',
      txnIndex: data.get('txn-index') ?? 0,
    });
  }
}

/**
 * Stores the TEAL eval step data
 */
export class DryrunState implements MsgpackEncodable, JSONEncodable {
  /**
   * Line number
   */
  public line: number;

  /**
   * Program counter
   */
  public pc: number;

  public stack: TealValue[];

  /**
   * Evaluation error if any
   */
  public error?: string;

  public scratch?: TealValue[];

  /**
   * Creates a new `DryrunState` object.
   * @param line - Line number
   * @param pc - Program counter
   * @param stack -
   * @param error - Evaluation error if any
   * @param scratch -
   */
  constructor({
    line,
    pc,
    stack,
    error,
    scratch,
  }: {
    line: number | bigint;
    pc: number | bigint;
    stack: TealValue[];
    error?: string;
    scratch?: TealValue[];
  }) {
    this.line = ensureSafeInteger(line);
    this.pc = ensureSafeInteger(pc);
    this.stack = stack;
    this.error = error;
    this.scratch = scratch;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['line', this.line],
      ['pc', this.pc],
      ['stack', this.stack.map((v) => v.msgpackPrepare())],
    ]);
    if (this.error) {
      data.set('error', this.error);
    }
    if (this.scratch && this.scratch.length) {
      data.set(
        'scratch',
        this.scratch.map((v) => v.msgpackPrepare())
      );
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['line'] = this.line;
    obj['pc'] = this.pc;
    obj['stack'] = this.stack.map((v) => v.jsonPrepare());
    if (this.error) {
      obj['error'] = this.error;
    }
    if (this.scratch && this.scratch.length) {
      obj['scratch'] = this.scratch.map((v) => v.jsonPrepare());
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): DryrunState {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded DryrunState: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new DryrunState({
      line: data['line'] ?? 0,
      pc: data['pc'] ?? 0,
      stack: (data['stack'] ?? []).map(TealValue.fromDecodedJSON),
      error: data['error'],
      scratch:
        typeof data['scratch'] !== 'undefined'
          ? data['scratch'].map(TealValue.fromDecodedJSON)
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): DryrunState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunState({
      line: data.get('line') ?? 0,
      pc: data.get('pc') ?? 0,
      stack: (data.get('stack') ?? []).map(TealValue.fromDecodedMsgpack),
      error: data.get('error'),
      scratch:
        typeof data.get('scratch') !== 'undefined'
          ? data.get('scratch').map(TealValue.fromDecodedMsgpack)
          : undefined,
    });
  }
}

/**
 * DryrunTxnResult contains any LogicSig or ApplicationCall program debug
 * information and state updates from a dryrun.
 */
export class DryrunTxnResult implements MsgpackEncodable, JSONEncodable {
  /**
   * Disassembled program line by line.
   */
  public disassembly: string[];

  public appCallMessages?: string[];

  public appCallTrace?: DryrunState[];

  /**
   * Budget added during execution of app call transaction.
   */
  public budgetAdded?: number;

  /**
   * Budget consumed during execution of app call transaction.
   */
  public budgetConsumed?: number;

  /**
   * Application state delta.
   */
  public globalDelta?: EvalDeltaKeyValue[];

  public localDeltas?: AccountStateDelta[];

  /**
   * Disassembled lsig program line by line.
   */
  public logicSigDisassembly?: string[];

  public logicSigMessages?: string[];

  public logicSigTrace?: DryrunState[];

  public logs?: Uint8Array[];

  /**
   * Creates a new `DryrunTxnResult` object.
   * @param disassembly - Disassembled program line by line.
   * @param appCallMessages -
   * @param appCallTrace -
   * @param budgetAdded - Budget added during execution of app call transaction.
   * @param budgetConsumed - Budget consumed during execution of app call transaction.
   * @param globalDelta - Application state delta.
   * @param localDeltas -
   * @param logicSigDisassembly - Disassembled lsig program line by line.
   * @param logicSigMessages -
   * @param logicSigTrace -
   * @param logs -
   */
  constructor({
    disassembly,
    appCallMessages,
    appCallTrace,
    budgetAdded,
    budgetConsumed,
    globalDelta,
    localDeltas,
    logicSigDisassembly,
    logicSigMessages,
    logicSigTrace,
    logs,
  }: {
    disassembly: string[];
    appCallMessages?: string[];
    appCallTrace?: DryrunState[];
    budgetAdded?: number | bigint;
    budgetConsumed?: number | bigint;
    globalDelta?: EvalDeltaKeyValue[];
    localDeltas?: AccountStateDelta[];
    logicSigDisassembly?: string[];
    logicSigMessages?: string[];
    logicSigTrace?: DryrunState[];
    logs?: Uint8Array[];
  }) {
    this.disassembly = disassembly;
    this.appCallMessages = appCallMessages;
    this.appCallTrace = appCallTrace;
    this.budgetAdded =
      typeof budgetAdded === 'undefined'
        ? undefined
        : ensureSafeInteger(budgetAdded);
    this.budgetConsumed =
      typeof budgetConsumed === 'undefined'
        ? undefined
        : ensureSafeInteger(budgetConsumed);
    this.globalDelta = globalDelta;
    this.localDeltas = localDeltas;
    this.logicSigDisassembly = logicSigDisassembly;
    this.logicSigMessages = logicSigMessages;
    this.logicSigTrace = logicSigTrace;
    this.logs = logs;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['disassembly', this.disassembly],
    ]);
    if (this.appCallMessages && this.appCallMessages.length) {
      data.set('app-call-messages', this.appCallMessages);
    }
    if (this.appCallTrace && this.appCallTrace.length) {
      data.set(
        'app-call-trace',
        this.appCallTrace.map((v) => v.msgpackPrepare())
      );
    }
    if (this.budgetAdded) {
      data.set('budget-added', this.budgetAdded);
    }
    if (this.budgetConsumed) {
      data.set('budget-consumed', this.budgetConsumed);
    }
    if (this.globalDelta && this.globalDelta.length) {
      data.set(
        'global-delta',
        this.globalDelta.map((v) => v.msgpackPrepare())
      );
    }
    if (this.localDeltas && this.localDeltas.length) {
      data.set(
        'local-deltas',
        this.localDeltas.map((v) => v.msgpackPrepare())
      );
    }
    if (this.logicSigDisassembly && this.logicSigDisassembly.length) {
      data.set('logic-sig-disassembly', this.logicSigDisassembly);
    }
    if (this.logicSigMessages && this.logicSigMessages.length) {
      data.set('logic-sig-messages', this.logicSigMessages);
    }
    if (this.logicSigTrace && this.logicSigTrace.length) {
      data.set(
        'logic-sig-trace',
        this.logicSigTrace.map((v) => v.msgpackPrepare())
      );
    }
    if (this.logs && this.logs.length) {
      data.set('logs', this.logs);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['disassembly'] = this.disassembly;
    if (this.appCallMessages && this.appCallMessages.length) {
      obj['app-call-messages'] = this.appCallMessages;
    }
    if (this.appCallTrace && this.appCallTrace.length) {
      obj['app-call-trace'] = this.appCallTrace.map((v) => v.jsonPrepare());
    }
    if (this.budgetAdded) {
      obj['budget-added'] = this.budgetAdded;
    }
    if (this.budgetConsumed) {
      obj['budget-consumed'] = this.budgetConsumed;
    }
    if (this.globalDelta && this.globalDelta.length) {
      obj['global-delta'] = this.globalDelta.map((v) => v.jsonPrepare());
    }
    if (this.localDeltas && this.localDeltas.length) {
      obj['local-deltas'] = this.localDeltas.map((v) => v.jsonPrepare());
    }
    if (this.logicSigDisassembly && this.logicSigDisassembly.length) {
      obj['logic-sig-disassembly'] = this.logicSigDisassembly;
    }
    if (this.logicSigMessages && this.logicSigMessages.length) {
      obj['logic-sig-messages'] = this.logicSigMessages;
    }
    if (this.logicSigTrace && this.logicSigTrace.length) {
      obj['logic-sig-trace'] = this.logicSigTrace.map((v) => v.jsonPrepare());
    }
    if (this.logs && this.logs.length) {
      obj['logs'] = this.logs.map(bytesToBase64);
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): DryrunTxnResult {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded DryrunTxnResult: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new DryrunTxnResult({
      disassembly: data['disassembly'] ?? [],
      appCallMessages: data['app-call-messages'],
      appCallTrace:
        typeof data['app-call-trace'] !== 'undefined'
          ? data['app-call-trace'].map(DryrunState.fromDecodedJSON)
          : undefined,
      budgetAdded: data['budget-added'],
      budgetConsumed: data['budget-consumed'],
      globalDelta:
        typeof data['global-delta'] !== 'undefined'
          ? data['global-delta'].map(EvalDeltaKeyValue.fromDecodedJSON)
          : undefined,
      localDeltas:
        typeof data['local-deltas'] !== 'undefined'
          ? data['local-deltas'].map(AccountStateDelta.fromDecodedJSON)
          : undefined,
      logicSigDisassembly: data['logic-sig-disassembly'],
      logicSigMessages: data['logic-sig-messages'],
      logicSigTrace:
        typeof data['logic-sig-trace'] !== 'undefined'
          ? data['logic-sig-trace'].map(DryrunState.fromDecodedJSON)
          : undefined,
      logs: data['logs'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): DryrunTxnResult {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunTxnResult({
      disassembly: data.get('disassembly') ?? [],
      appCallMessages: data.get('app-call-messages'),
      appCallTrace:
        typeof data.get('app-call-trace') !== 'undefined'
          ? data.get('app-call-trace').map(DryrunState.fromDecodedMsgpack)
          : undefined,
      budgetAdded: data.get('budget-added'),
      budgetConsumed: data.get('budget-consumed'),
      globalDelta:
        typeof data.get('global-delta') !== 'undefined'
          ? data.get('global-delta').map(EvalDeltaKeyValue.fromDecodedMsgpack)
          : undefined,
      localDeltas:
        typeof data.get('local-deltas') !== 'undefined'
          ? data.get('local-deltas').map(AccountStateDelta.fromDecodedMsgpack)
          : undefined,
      logicSigDisassembly: data.get('logic-sig-disassembly'),
      logicSigMessages: data.get('logic-sig-messages'),
      logicSigTrace:
        typeof data.get('logic-sig-trace') !== 'undefined'
          ? data.get('logic-sig-trace').map(DryrunState.fromDecodedMsgpack)
          : undefined,
      logs: data.get('logs'),
    });
  }
}

/**
 * An error response with optional data field.
 */
export class ErrorResponse implements MsgpackEncodable, JSONEncodable {
  public message: string;

  public data?: UntypedValue;

  /**
   * Creates a new `ErrorResponse` object.
   * @param message -
   * @param data -
   */
  constructor({ message, data }: { message: string; data?: UntypedValue }) {
    this.message = message;
    this.data = data;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['message', this.message],
    ]);
    if (this.data) {
      data.set('data', this.data.msgpackPrepare());
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['message'] = this.message;
    if (this.data) {
      obj['data'] = this.data.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): ErrorResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded ErrorResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new ErrorResponse({
      message: data['message'] ?? '',
      data:
        typeof data['data'] !== 'undefined'
          ? UntypedValue.fromDecodedJSON(data['data'])
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): ErrorResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ErrorResponse({
      message: data.get('message') ?? '',
      data:
        typeof data.get('data') !== 'undefined'
          ? UntypedValue.fromDecodedMsgpack(data.get('data'))
          : undefined,
    });
  }
}

/**
 * Represents a TEAL value delta.
 */
export class EvalDelta implements MsgpackEncodable, JSONEncodable {
  /**
   * (at) delta action.
   */
  public action: number;

  /**
   * (bs) bytes value.
   */
  public bytes?: string;

  /**
   * (ui) uint value.
   */
  public uint?: bigint;

  /**
   * Creates a new `EvalDelta` object.
   * @param action - (at) delta action.
   * @param bytes - (bs) bytes value.
   * @param uint - (ui) uint value.
   */
  constructor({
    action,
    bytes,
    uint,
  }: {
    action: number | bigint;
    bytes?: string;
    uint?: number | bigint;
  }) {
    this.action = ensureSafeInteger(action);
    this.bytes = bytes;
    this.uint = typeof uint === 'undefined' ? undefined : ensureBigInt(uint);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['action', this.action],
    ]);
    if (this.bytes) {
      data.set('bytes', this.bytes);
    }
    if (this.uint) {
      data.set('uint', this.uint);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['action'] = this.action;
    if (this.bytes) {
      obj['bytes'] = this.bytes;
    }
    if (this.uint) {
      obj['uint'] = this.uint;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): EvalDelta {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded EvalDelta: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new EvalDelta({
      action: data['action'] ?? 0,
      bytes: data['bytes'],
      uint: data['uint'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): EvalDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new EvalDelta({
      action: data.get('action') ?? 0,
      bytes: data.get('bytes'),
      uint: data.get('uint'),
    });
  }
}

/**
 * Key-value pairs for StateDelta.
 */
export class EvalDeltaKeyValue implements MsgpackEncodable, JSONEncodable {
  public key: string;

  /**
   * Represents a TEAL value delta.
   */
  public value: EvalDelta;

  /**
   * Creates a new `EvalDeltaKeyValue` object.
   * @param key -
   * @param value - Represents a TEAL value delta.
   */
  constructor({ key, value }: { key: string; value: EvalDelta }) {
    this.key = key;
    this.value = value;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['key', this.key],
      ['value', this.value.msgpackPrepare()],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['key'] = this.key;
    obj['value'] = this.value.jsonPrepare();
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): EvalDeltaKeyValue {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded EvalDeltaKeyValue: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new EvalDeltaKeyValue({
      key: data['key'] ?? '',
      value: EvalDelta.fromDecodedJSON(data['value'] ?? {}),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): EvalDeltaKeyValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new EvalDeltaKeyValue({
      key: data.get('key') ?? '',
      value: EvalDelta.fromDecodedMsgpack(data.get('value') ?? {}),
    });
  }
}

/**
 * Response containing the timestamp offset in seconds
 */
export class GetBlockTimeStampOffsetResponse
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * Timestamp offset in seconds.
   */
  public offset: number;

  /**
   * Creates a new `GetBlockTimeStampOffsetResponse` object.
   * @param offset - Timestamp offset in seconds.
   */
  constructor({ offset }: { offset: number | bigint }) {
    this.offset = ensureSafeInteger(offset);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['offset', this.offset],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['offset'] = this.offset;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): GetBlockTimeStampOffsetResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(
        `Invalid decoded GetBlockTimeStampOffsetResponse: ${encoded}`
      );
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new GetBlockTimeStampOffsetResponse({
      offset: data['offset'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): GetBlockTimeStampOffsetResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new GetBlockTimeStampOffsetResponse({
      offset: data.get('offset') ?? 0,
    });
  }
}

/**
 * Response containing the ledger's minimum sync round
 */
export class GetSyncRoundResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * The minimum sync round for the ledger.
   */
  public round: bigint;

  /**
   * Creates a new `GetSyncRoundResponse` object.
   * @param round - The minimum sync round for the ledger.
   */
  constructor({ round }: { round: number | bigint }) {
    this.round = ensureBigInt(round);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([['round', this.round]]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['round'] = this.round;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): GetSyncRoundResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded GetSyncRoundResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new GetSyncRoundResponse({
      round: data['round'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): GetSyncRoundResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new GetSyncRoundResponse({
      round: data.get('round') ?? 0,
    });
  }
}

/**
 * A single Delta containing the key, the previous value and the current value for
 * a single round.
 */
export class KvDelta implements MsgpackEncodable, JSONEncodable {
  /**
   * The key, base64 encoded.
   */
  public key?: Uint8Array;

  /**
   * The new value of the KV store entry, base64 encoded.
   */
  public value?: Uint8Array;

  /**
   * Creates a new `KvDelta` object.
   * @param key - The key, base64 encoded.
   * @param value - The new value of the KV store entry, base64 encoded.
   */
  constructor({
    key,
    value,
  }: {
    key?: string | Uint8Array;
    value?: string | Uint8Array;
  }) {
    this.key = typeof key === 'string' ? base64ToBytes(key) : key;
    this.value = typeof value === 'string' ? base64ToBytes(value) : value;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([]);
    if (this.key) {
      data.set('key', this.key);
    }
    if (this.value) {
      data.set('value', this.value);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    if (this.key) {
      obj['key'] = bytesToBase64(this.key);
    }
    if (this.value) {
      obj['value'] = bytesToBase64(this.value);
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): KvDelta {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded KvDelta: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new KvDelta({
      key: data['key'],
      value: data['value'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): KvDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new KvDelta({
      key: data.get('key'),
      value: data.get('value'),
    });
  }
}

/**
 * Contains a ledger delta for a single transaction group
 */
export class LedgerStateDeltaForTransactionGroup
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * Ledger StateDelta object
   */
  public delta: UntypedValue;

  public ids: string[];

  /**
   * Creates a new `LedgerStateDeltaForTransactionGroup` object.
   * @param delta - Ledger StateDelta object
   * @param ids -
   */
  constructor({ delta, ids }: { delta: UntypedValue; ids: string[] }) {
    this.delta = delta;
    this.ids = ids;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['Delta', this.delta.msgpackPrepare()],
      ['Ids', this.ids],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['Delta'] = this.delta.jsonPrepare();
    obj['Ids'] = this.ids;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(
    encoded: unknown
  ): LedgerStateDeltaForTransactionGroup {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(
        `Invalid decoded LedgerStateDeltaForTransactionGroup: ${encoded}`
      );
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new LedgerStateDeltaForTransactionGroup({
      delta: UntypedValue.fromDecodedJSON(data['Delta'] ?? {}),
      ids: data['Ids'] ?? [],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(
    data: unknown
  ): LedgerStateDeltaForTransactionGroup {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new LedgerStateDeltaForTransactionGroup({
      delta: UntypedValue.fromDecodedMsgpack(data.get('Delta') ?? {}),
      ids: data.get('Ids') ?? [],
    });
  }
}

/**
 * Proof of membership and position of a light block header.
 */
export class LightBlockHeaderProof implements MsgpackEncodable, JSONEncodable {
  /**
   * The index of the light block header in the vector commitment tree
   */
  public index: number;

  /**
   * The encoded proof.
   */
  public proof: Uint8Array;

  /**
   * Represents the depth of the tree that is being proven, i.e. the number of edges
   * from a leaf to the root.
   */
  public treedepth: number;

  /**
   * Creates a new `LightBlockHeaderProof` object.
   * @param index - The index of the light block header in the vector commitment tree
   * @param proof - The encoded proof.
   * @param treedepth - Represents the depth of the tree that is being proven, i.e. the number of edges
   * from a leaf to the root.
   */
  constructor({
    index,
    proof,
    treedepth,
  }: {
    index: number | bigint;
    proof: string | Uint8Array;
    treedepth: number | bigint;
  }) {
    this.index = ensureSafeInteger(index);
    this.proof = typeof proof === 'string' ? base64ToBytes(proof) : proof;
    this.treedepth = ensureSafeInteger(treedepth);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['index', this.index],
      ['proof', this.proof],
      ['treedepth', this.treedepth],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['index'] = this.index;
    obj['proof'] = bytesToBase64(this.proof);
    obj['treedepth'] = this.treedepth;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): LightBlockHeaderProof {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded LightBlockHeaderProof: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new LightBlockHeaderProof({
      index: data['index'] ?? 0,
      proof: data['proof'] ?? new Uint8Array(),
      treedepth: data['treedepth'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): LightBlockHeaderProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new LightBlockHeaderProof({
      index: data.get('index') ?? 0,
      proof: data.get('proof') ?? new Uint8Array(),
      treedepth: data.get('treedepth') ?? 0,
    });
  }
}

/**
 *
 */
export class NodeStatusResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * CatchupTime in nanoseconds
   */
  public catchupTime: bigint;

  /**
   * LastRound indicates the last round seen
   */
  public lastRound: bigint;

  /**
   * LastVersion indicates the last consensus version supported
   */
  public lastVersion: string;

  /**
   * NextVersion of consensus protocol to use
   */
  public nextVersion: string;

  /**
   * NextVersionRound is the round at which the next consensus version will apply
   */
  public nextVersionRound: bigint;

  /**
   * NextVersionSupported indicates whether the next consensus version is supported
   * by this node
   */
  public nextVersionSupported: boolean;

  /**
   * StoppedAtUnsupportedRound indicates that the node does not support the new
   * rounds and has stopped making progress
   */
  public stoppedAtUnsupportedRound: boolean;

  /**
   * TimeSinceLastRound in nanoseconds
   */
  public timeSinceLastRound: bigint;

  /**
   * The current catchpoint that is being caught up to
   */
  public catchpoint?: string;

  /**
   * The number of blocks that have already been obtained by the node as part of the
   * catchup
   */
  public catchpointAcquiredBlocks?: number;

  /**
   * The number of accounts from the current catchpoint that have been processed so
   * far as part of the catchup
   */
  public catchpointProcessedAccounts?: number;

  /**
   * The number of key-values (KVs) from the current catchpoint that have been
   * processed so far as part of the catchup
   */
  public catchpointProcessedKvs?: number;

  /**
   * The total number of accounts included in the current catchpoint
   */
  public catchpointTotalAccounts?: number;

  /**
   * The total number of blocks that are required to complete the current catchpoint
   * catchup
   */
  public catchpointTotalBlocks?: number;

  /**
   * The total number of key-values (KVs) included in the current catchpoint
   */
  public catchpointTotalKvs?: number;

  /**
   * The number of accounts from the current catchpoint that have been verified so
   * far as part of the catchup
   */
  public catchpointVerifiedAccounts?: number;

  /**
   * The number of key-values (KVs) from the current catchpoint that have been
   * verified so far as part of the catchup
   */
  public catchpointVerifiedKvs?: number;

  /**
   * The last catchpoint seen by the node
   */
  public lastCatchpoint?: string;

  /**
   * Upgrade delay
   */
  public upgradeDelay?: bigint;

  /**
   * Next protocol round
   */
  public upgradeNextProtocolVoteBefore?: bigint;

  /**
   * No votes cast for consensus upgrade
   */
  public upgradeNoVotes?: number;

  /**
   * This node's upgrade vote
   */
  public upgradeNodeVote?: boolean;

  /**
   * Total voting rounds for current upgrade
   */
  public upgradeVoteRounds?: number;

  /**
   * Total votes cast for consensus upgrade
   */
  public upgradeVotes?: number;

  /**
   * Yes votes required for consensus upgrade
   */
  public upgradeVotesRequired?: number;

  /**
   * Yes votes cast for consensus upgrade
   */
  public upgradeYesVotes?: number;

  /**
   * Creates a new `NodeStatusResponse` object.
   * @param catchupTime - CatchupTime in nanoseconds
   * @param lastRound - LastRound indicates the last round seen
   * @param lastVersion - LastVersion indicates the last consensus version supported
   * @param nextVersion - NextVersion of consensus protocol to use
   * @param nextVersionRound - NextVersionRound is the round at which the next consensus version will apply
   * @param nextVersionSupported - NextVersionSupported indicates whether the next consensus version is supported
   * by this node
   * @param stoppedAtUnsupportedRound - StoppedAtUnsupportedRound indicates that the node does not support the new
   * rounds and has stopped making progress
   * @param timeSinceLastRound - TimeSinceLastRound in nanoseconds
   * @param catchpoint - The current catchpoint that is being caught up to
   * @param catchpointAcquiredBlocks - The number of blocks that have already been obtained by the node as part of the
   * catchup
   * @param catchpointProcessedAccounts - The number of accounts from the current catchpoint that have been processed so
   * far as part of the catchup
   * @param catchpointProcessedKvs - The number of key-values (KVs) from the current catchpoint that have been
   * processed so far as part of the catchup
   * @param catchpointTotalAccounts - The total number of accounts included in the current catchpoint
   * @param catchpointTotalBlocks - The total number of blocks that are required to complete the current catchpoint
   * catchup
   * @param catchpointTotalKvs - The total number of key-values (KVs) included in the current catchpoint
   * @param catchpointVerifiedAccounts - The number of accounts from the current catchpoint that have been verified so
   * far as part of the catchup
   * @param catchpointVerifiedKvs - The number of key-values (KVs) from the current catchpoint that have been
   * verified so far as part of the catchup
   * @param lastCatchpoint - The last catchpoint seen by the node
   * @param upgradeDelay - Upgrade delay
   * @param upgradeNextProtocolVoteBefore - Next protocol round
   * @param upgradeNoVotes - No votes cast for consensus upgrade
   * @param upgradeNodeVote - This node's upgrade vote
   * @param upgradeVoteRounds - Total voting rounds for current upgrade
   * @param upgradeVotes - Total votes cast for consensus upgrade
   * @param upgradeVotesRequired - Yes votes required for consensus upgrade
   * @param upgradeYesVotes - Yes votes cast for consensus upgrade
   */
  constructor({
    catchupTime,
    lastRound,
    lastVersion,
    nextVersion,
    nextVersionRound,
    nextVersionSupported,
    stoppedAtUnsupportedRound,
    timeSinceLastRound,
    catchpoint,
    catchpointAcquiredBlocks,
    catchpointProcessedAccounts,
    catchpointProcessedKvs,
    catchpointTotalAccounts,
    catchpointTotalBlocks,
    catchpointTotalKvs,
    catchpointVerifiedAccounts,
    catchpointVerifiedKvs,
    lastCatchpoint,
    upgradeDelay,
    upgradeNextProtocolVoteBefore,
    upgradeNoVotes,
    upgradeNodeVote,
    upgradeVoteRounds,
    upgradeVotes,
    upgradeVotesRequired,
    upgradeYesVotes,
  }: {
    catchupTime: number | bigint;
    lastRound: number | bigint;
    lastVersion: string;
    nextVersion: string;
    nextVersionRound: number | bigint;
    nextVersionSupported: boolean;
    stoppedAtUnsupportedRound: boolean;
    timeSinceLastRound: number | bigint;
    catchpoint?: string;
    catchpointAcquiredBlocks?: number | bigint;
    catchpointProcessedAccounts?: number | bigint;
    catchpointProcessedKvs?: number | bigint;
    catchpointTotalAccounts?: number | bigint;
    catchpointTotalBlocks?: number | bigint;
    catchpointTotalKvs?: number | bigint;
    catchpointVerifiedAccounts?: number | bigint;
    catchpointVerifiedKvs?: number | bigint;
    lastCatchpoint?: string;
    upgradeDelay?: number | bigint;
    upgradeNextProtocolVoteBefore?: number | bigint;
    upgradeNoVotes?: number | bigint;
    upgradeNodeVote?: boolean;
    upgradeVoteRounds?: number | bigint;
    upgradeVotes?: number | bigint;
    upgradeVotesRequired?: number | bigint;
    upgradeYesVotes?: number | bigint;
  }) {
    this.catchupTime = ensureBigInt(catchupTime);
    this.lastRound = ensureBigInt(lastRound);
    this.lastVersion = lastVersion;
    this.nextVersion = nextVersion;
    this.nextVersionRound = ensureBigInt(nextVersionRound);
    this.nextVersionSupported = nextVersionSupported;
    this.stoppedAtUnsupportedRound = stoppedAtUnsupportedRound;
    this.timeSinceLastRound = ensureBigInt(timeSinceLastRound);
    this.catchpoint = catchpoint;
    this.catchpointAcquiredBlocks =
      typeof catchpointAcquiredBlocks === 'undefined'
        ? undefined
        : ensureSafeInteger(catchpointAcquiredBlocks);
    this.catchpointProcessedAccounts =
      typeof catchpointProcessedAccounts === 'undefined'
        ? undefined
        : ensureSafeInteger(catchpointProcessedAccounts);
    this.catchpointProcessedKvs =
      typeof catchpointProcessedKvs === 'undefined'
        ? undefined
        : ensureSafeInteger(catchpointProcessedKvs);
    this.catchpointTotalAccounts =
      typeof catchpointTotalAccounts === 'undefined'
        ? undefined
        : ensureSafeInteger(catchpointTotalAccounts);
    this.catchpointTotalBlocks =
      typeof catchpointTotalBlocks === 'undefined'
        ? undefined
        : ensureSafeInteger(catchpointTotalBlocks);
    this.catchpointTotalKvs =
      typeof catchpointTotalKvs === 'undefined'
        ? undefined
        : ensureSafeInteger(catchpointTotalKvs);
    this.catchpointVerifiedAccounts =
      typeof catchpointVerifiedAccounts === 'undefined'
        ? undefined
        : ensureSafeInteger(catchpointVerifiedAccounts);
    this.catchpointVerifiedKvs =
      typeof catchpointVerifiedKvs === 'undefined'
        ? undefined
        : ensureSafeInteger(catchpointVerifiedKvs);
    this.lastCatchpoint = lastCatchpoint;
    this.upgradeDelay =
      typeof upgradeDelay === 'undefined'
        ? undefined
        : ensureBigInt(upgradeDelay);
    this.upgradeNextProtocolVoteBefore =
      typeof upgradeNextProtocolVoteBefore === 'undefined'
        ? undefined
        : ensureBigInt(upgradeNextProtocolVoteBefore);
    this.upgradeNoVotes =
      typeof upgradeNoVotes === 'undefined'
        ? undefined
        : ensureSafeInteger(upgradeNoVotes);
    this.upgradeNodeVote = upgradeNodeVote;
    this.upgradeVoteRounds =
      typeof upgradeVoteRounds === 'undefined'
        ? undefined
        : ensureSafeInteger(upgradeVoteRounds);
    this.upgradeVotes =
      typeof upgradeVotes === 'undefined'
        ? undefined
        : ensureSafeInteger(upgradeVotes);
    this.upgradeVotesRequired =
      typeof upgradeVotesRequired === 'undefined'
        ? undefined
        : ensureSafeInteger(upgradeVotesRequired);
    this.upgradeYesVotes =
      typeof upgradeYesVotes === 'undefined'
        ? undefined
        : ensureSafeInteger(upgradeYesVotes);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['catchup-time', this.catchupTime],
      ['last-round', this.lastRound],
      ['last-version', this.lastVersion],
      ['next-version', this.nextVersion],
      ['next-version-round', this.nextVersionRound],
      ['next-version-supported', this.nextVersionSupported],
      ['stopped-at-unsupported-round', this.stoppedAtUnsupportedRound],
      ['time-since-last-round', this.timeSinceLastRound],
    ]);
    if (this.catchpoint) {
      data.set('catchpoint', this.catchpoint);
    }
    if (this.catchpointAcquiredBlocks) {
      data.set('catchpoint-acquired-blocks', this.catchpointAcquiredBlocks);
    }
    if (this.catchpointProcessedAccounts) {
      data.set(
        'catchpoint-processed-accounts',
        this.catchpointProcessedAccounts
      );
    }
    if (this.catchpointProcessedKvs) {
      data.set('catchpoint-processed-kvs', this.catchpointProcessedKvs);
    }
    if (this.catchpointTotalAccounts) {
      data.set('catchpoint-total-accounts', this.catchpointTotalAccounts);
    }
    if (this.catchpointTotalBlocks) {
      data.set('catchpoint-total-blocks', this.catchpointTotalBlocks);
    }
    if (this.catchpointTotalKvs) {
      data.set('catchpoint-total-kvs', this.catchpointTotalKvs);
    }
    if (this.catchpointVerifiedAccounts) {
      data.set('catchpoint-verified-accounts', this.catchpointVerifiedAccounts);
    }
    if (this.catchpointVerifiedKvs) {
      data.set('catchpoint-verified-kvs', this.catchpointVerifiedKvs);
    }
    if (this.lastCatchpoint) {
      data.set('last-catchpoint', this.lastCatchpoint);
    }
    if (this.upgradeDelay) {
      data.set('upgrade-delay', this.upgradeDelay);
    }
    if (this.upgradeNextProtocolVoteBefore) {
      data.set(
        'upgrade-next-protocol-vote-before',
        this.upgradeNextProtocolVoteBefore
      );
    }
    if (this.upgradeNoVotes) {
      data.set('upgrade-no-votes', this.upgradeNoVotes);
    }
    if (this.upgradeNodeVote) {
      data.set('upgrade-node-vote', this.upgradeNodeVote);
    }
    if (this.upgradeVoteRounds) {
      data.set('upgrade-vote-rounds', this.upgradeVoteRounds);
    }
    if (this.upgradeVotes) {
      data.set('upgrade-votes', this.upgradeVotes);
    }
    if (this.upgradeVotesRequired) {
      data.set('upgrade-votes-required', this.upgradeVotesRequired);
    }
    if (this.upgradeYesVotes) {
      data.set('upgrade-yes-votes', this.upgradeYesVotes);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['catchup-time'] = this.catchupTime;
    obj['last-round'] = this.lastRound;
    obj['last-version'] = this.lastVersion;
    obj['next-version'] = this.nextVersion;
    obj['next-version-round'] = this.nextVersionRound;
    obj['next-version-supported'] = this.nextVersionSupported;
    obj['stopped-at-unsupported-round'] = this.stoppedAtUnsupportedRound;
    obj['time-since-last-round'] = this.timeSinceLastRound;
    if (this.catchpoint) {
      obj['catchpoint'] = this.catchpoint;
    }
    if (this.catchpointAcquiredBlocks) {
      obj['catchpoint-acquired-blocks'] = this.catchpointAcquiredBlocks;
    }
    if (this.catchpointProcessedAccounts) {
      obj['catchpoint-processed-accounts'] = this.catchpointProcessedAccounts;
    }
    if (this.catchpointProcessedKvs) {
      obj['catchpoint-processed-kvs'] = this.catchpointProcessedKvs;
    }
    if (this.catchpointTotalAccounts) {
      obj['catchpoint-total-accounts'] = this.catchpointTotalAccounts;
    }
    if (this.catchpointTotalBlocks) {
      obj['catchpoint-total-blocks'] = this.catchpointTotalBlocks;
    }
    if (this.catchpointTotalKvs) {
      obj['catchpoint-total-kvs'] = this.catchpointTotalKvs;
    }
    if (this.catchpointVerifiedAccounts) {
      obj['catchpoint-verified-accounts'] = this.catchpointVerifiedAccounts;
    }
    if (this.catchpointVerifiedKvs) {
      obj['catchpoint-verified-kvs'] = this.catchpointVerifiedKvs;
    }
    if (this.lastCatchpoint) {
      obj['last-catchpoint'] = this.lastCatchpoint;
    }
    if (this.upgradeDelay) {
      obj['upgrade-delay'] = this.upgradeDelay;
    }
    if (this.upgradeNextProtocolVoteBefore) {
      obj['upgrade-next-protocol-vote-before'] =
        this.upgradeNextProtocolVoteBefore;
    }
    if (this.upgradeNoVotes) {
      obj['upgrade-no-votes'] = this.upgradeNoVotes;
    }
    if (this.upgradeNodeVote) {
      obj['upgrade-node-vote'] = this.upgradeNodeVote;
    }
    if (this.upgradeVoteRounds) {
      obj['upgrade-vote-rounds'] = this.upgradeVoteRounds;
    }
    if (this.upgradeVotes) {
      obj['upgrade-votes'] = this.upgradeVotes;
    }
    if (this.upgradeVotesRequired) {
      obj['upgrade-votes-required'] = this.upgradeVotesRequired;
    }
    if (this.upgradeYesVotes) {
      obj['upgrade-yes-votes'] = this.upgradeYesVotes;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): NodeStatusResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded NodeStatusResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new NodeStatusResponse({
      catchupTime: data['catchup-time'] ?? 0,
      lastRound: data['last-round'] ?? 0,
      lastVersion: data['last-version'] ?? '',
      nextVersion: data['next-version'] ?? '',
      nextVersionRound: data['next-version-round'] ?? 0,
      nextVersionSupported: data['next-version-supported'] ?? false,
      stoppedAtUnsupportedRound: data['stopped-at-unsupported-round'] ?? false,
      timeSinceLastRound: data['time-since-last-round'] ?? 0,
      catchpoint: data['catchpoint'],
      catchpointAcquiredBlocks: data['catchpoint-acquired-blocks'],
      catchpointProcessedAccounts: data['catchpoint-processed-accounts'],
      catchpointProcessedKvs: data['catchpoint-processed-kvs'],
      catchpointTotalAccounts: data['catchpoint-total-accounts'],
      catchpointTotalBlocks: data['catchpoint-total-blocks'],
      catchpointTotalKvs: data['catchpoint-total-kvs'],
      catchpointVerifiedAccounts: data['catchpoint-verified-accounts'],
      catchpointVerifiedKvs: data['catchpoint-verified-kvs'],
      lastCatchpoint: data['last-catchpoint'],
      upgradeDelay: data['upgrade-delay'],
      upgradeNextProtocolVoteBefore: data['upgrade-next-protocol-vote-before'],
      upgradeNoVotes: data['upgrade-no-votes'],
      upgradeNodeVote: data['upgrade-node-vote'],
      upgradeVoteRounds: data['upgrade-vote-rounds'],
      upgradeVotes: data['upgrade-votes'],
      upgradeVotesRequired: data['upgrade-votes-required'],
      upgradeYesVotes: data['upgrade-yes-votes'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): NodeStatusResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new NodeStatusResponse({
      catchupTime: data.get('catchup-time') ?? 0,
      lastRound: data.get('last-round') ?? 0,
      lastVersion: data.get('last-version') ?? '',
      nextVersion: data.get('next-version') ?? '',
      nextVersionRound: data.get('next-version-round') ?? 0,
      nextVersionSupported: data.get('next-version-supported') ?? false,
      stoppedAtUnsupportedRound:
        data.get('stopped-at-unsupported-round') ?? false,
      timeSinceLastRound: data.get('time-since-last-round') ?? 0,
      catchpoint: data.get('catchpoint'),
      catchpointAcquiredBlocks: data.get('catchpoint-acquired-blocks'),
      catchpointProcessedAccounts: data.get('catchpoint-processed-accounts'),
      catchpointProcessedKvs: data.get('catchpoint-processed-kvs'),
      catchpointTotalAccounts: data.get('catchpoint-total-accounts'),
      catchpointTotalBlocks: data.get('catchpoint-total-blocks'),
      catchpointTotalKvs: data.get('catchpoint-total-kvs'),
      catchpointVerifiedAccounts: data.get('catchpoint-verified-accounts'),
      catchpointVerifiedKvs: data.get('catchpoint-verified-kvs'),
      lastCatchpoint: data.get('last-catchpoint'),
      upgradeDelay: data.get('upgrade-delay'),
      upgradeNextProtocolVoteBefore: data.get(
        'upgrade-next-protocol-vote-before'
      ),
      upgradeNoVotes: data.get('upgrade-no-votes'),
      upgradeNodeVote: data.get('upgrade-node-vote'),
      upgradeVoteRounds: data.get('upgrade-vote-rounds'),
      upgradeVotes: data.get('upgrade-votes'),
      upgradeVotesRequired: data.get('upgrade-votes-required'),
      upgradeYesVotes: data.get('upgrade-yes-votes'),
    });
  }
}

/**
 * Details about a pending transaction. If the transaction was recently confirmed,
 * includes confirmation details like the round and reward details.
 */
export class PendingTransactionResponse
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * Indicates that the transaction was kicked out of this node's transaction pool
   * (and specifies why that happened). An empty string indicates the transaction
   * wasn't kicked out of this node's txpool due to an error.
   */
  public poolError: string;

  /**
   * The raw signed transaction.
   */
  public txn: SignedTransaction;

  /**
   * The application index if the transaction was found and it created an
   * application.
   */
  public applicationIndex?: bigint;

  /**
   * The number of the asset's unit that were transferred to the close-to address.
   */
  public assetClosingAmount?: bigint;

  /**
   * The asset index if the transaction was found and it created an asset.
   */
  public assetIndex?: bigint;

  /**
   * Rewards in microalgos applied to the close remainder to account.
   */
  public closeRewards?: bigint;

  /**
   * Closing amount for the transaction.
   */
  public closingAmount?: bigint;

  /**
   * The round where this transaction was confirmed, if present.
   */
  public confirmedRound?: bigint;

  /**
   * Global state key/value changes for the application being executed by this
   * transaction.
   */
  public globalStateDelta?: EvalDeltaKeyValue[];

  /**
   * Inner transactions produced by application execution.
   */
  public innerTxns?: PendingTransactionResponse[];

  /**
   * Local state key/value changes for the application being executed by this
   * transaction.
   */
  public localStateDelta?: AccountStateDelta[];

  /**
   * Logs for the application being executed by this transaction.
   */
  public logs?: Uint8Array[];

  /**
   * Rewards in microalgos applied to the receiver account.
   */
  public receiverRewards?: bigint;

  /**
   * Rewards in microalgos applied to the sender account.
   */
  public senderRewards?: bigint;

  /**
   * Creates a new `PendingTransactionResponse` object.
   * @param poolError - Indicates that the transaction was kicked out of this node's transaction pool
   * (and specifies why that happened). An empty string indicates the transaction
   * wasn't kicked out of this node's txpool due to an error.
   * @param txn - The raw signed transaction.
   * @param applicationIndex - The application index if the transaction was found and it created an
   * application.
   * @param assetClosingAmount - The number of the asset's unit that were transferred to the close-to address.
   * @param assetIndex - The asset index if the transaction was found and it created an asset.
   * @param closeRewards - Rewards in microalgos applied to the close remainder to account.
   * @param closingAmount - Closing amount for the transaction.
   * @param confirmedRound - The round where this transaction was confirmed, if present.
   * @param globalStateDelta - Global state key/value changes for the application being executed by this
   * transaction.
   * @param innerTxns - Inner transactions produced by application execution.
   * @param localStateDelta - Local state key/value changes for the application being executed by this
   * transaction.
   * @param logs - Logs for the application being executed by this transaction.
   * @param receiverRewards - Rewards in microalgos applied to the receiver account.
   * @param senderRewards - Rewards in microalgos applied to the sender account.
   */
  constructor({
    poolError,
    txn,
    applicationIndex,
    assetClosingAmount,
    assetIndex,
    closeRewards,
    closingAmount,
    confirmedRound,
    globalStateDelta,
    innerTxns,
    localStateDelta,
    logs,
    receiverRewards,
    senderRewards,
  }: {
    poolError: string;
    txn: SignedTransaction;
    applicationIndex?: number | bigint;
    assetClosingAmount?: number | bigint;
    assetIndex?: number | bigint;
    closeRewards?: number | bigint;
    closingAmount?: number | bigint;
    confirmedRound?: number | bigint;
    globalStateDelta?: EvalDeltaKeyValue[];
    innerTxns?: PendingTransactionResponse[];
    localStateDelta?: AccountStateDelta[];
    logs?: Uint8Array[];
    receiverRewards?: number | bigint;
    senderRewards?: number | bigint;
  }) {
    this.poolError = poolError;
    this.txn = txn;
    this.applicationIndex =
      typeof applicationIndex === 'undefined'
        ? undefined
        : ensureBigInt(applicationIndex);
    this.assetClosingAmount =
      typeof assetClosingAmount === 'undefined'
        ? undefined
        : ensureBigInt(assetClosingAmount);
    this.assetIndex =
      typeof assetIndex === 'undefined' ? undefined : ensureBigInt(assetIndex);
    this.closeRewards =
      typeof closeRewards === 'undefined'
        ? undefined
        : ensureBigInt(closeRewards);
    this.closingAmount =
      typeof closingAmount === 'undefined'
        ? undefined
        : ensureBigInt(closingAmount);
    this.confirmedRound =
      typeof confirmedRound === 'undefined'
        ? undefined
        : ensureBigInt(confirmedRound);
    this.globalStateDelta = globalStateDelta;
    this.innerTxns = innerTxns;
    this.localStateDelta = localStateDelta;
    this.logs = logs;
    this.receiverRewards =
      typeof receiverRewards === 'undefined'
        ? undefined
        : ensureBigInt(receiverRewards);
    this.senderRewards =
      typeof senderRewards === 'undefined'
        ? undefined
        : ensureBigInt(senderRewards);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['pool-error', this.poolError],
      ['txn', this.txn.msgpackPrepare()],
    ]);
    if (this.applicationIndex) {
      data.set('application-index', this.applicationIndex);
    }
    if (this.assetClosingAmount) {
      data.set('asset-closing-amount', this.assetClosingAmount);
    }
    if (this.assetIndex) {
      data.set('asset-index', this.assetIndex);
    }
    if (this.closeRewards) {
      data.set('close-rewards', this.closeRewards);
    }
    if (this.closingAmount) {
      data.set('closing-amount', this.closingAmount);
    }
    if (this.confirmedRound) {
      data.set('confirmed-round', this.confirmedRound);
    }
    if (this.globalStateDelta && this.globalStateDelta.length) {
      data.set(
        'global-state-delta',
        this.globalStateDelta.map((v) => v.msgpackPrepare())
      );
    }
    if (this.innerTxns && this.innerTxns.length) {
      data.set(
        'inner-txns',
        this.innerTxns.map((v) => v.msgpackPrepare())
      );
    }
    if (this.localStateDelta && this.localStateDelta.length) {
      data.set(
        'local-state-delta',
        this.localStateDelta.map((v) => v.msgpackPrepare())
      );
    }
    if (this.logs && this.logs.length) {
      data.set('logs', this.logs);
    }
    if (this.receiverRewards) {
      data.set('receiver-rewards', this.receiverRewards);
    }
    if (this.senderRewards) {
      data.set('sender-rewards', this.senderRewards);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['pool-error'] = this.poolError;
    obj['txn'] = this.txn.jsonPrepare();
    if (this.applicationIndex) {
      obj['application-index'] = this.applicationIndex;
    }
    if (this.assetClosingAmount) {
      obj['asset-closing-amount'] = this.assetClosingAmount;
    }
    if (this.assetIndex) {
      obj['asset-index'] = this.assetIndex;
    }
    if (this.closeRewards) {
      obj['close-rewards'] = this.closeRewards;
    }
    if (this.closingAmount) {
      obj['closing-amount'] = this.closingAmount;
    }
    if (this.confirmedRound) {
      obj['confirmed-round'] = this.confirmedRound;
    }
    if (this.globalStateDelta && this.globalStateDelta.length) {
      obj['global-state-delta'] = this.globalStateDelta.map((v) =>
        v.jsonPrepare()
      );
    }
    if (this.innerTxns && this.innerTxns.length) {
      obj['inner-txns'] = this.innerTxns.map((v) => v.jsonPrepare());
    }
    if (this.localStateDelta && this.localStateDelta.length) {
      obj['local-state-delta'] = this.localStateDelta.map((v) =>
        v.jsonPrepare()
      );
    }
    if (this.logs && this.logs.length) {
      obj['logs'] = this.logs.map(bytesToBase64);
    }
    if (this.receiverRewards) {
      obj['receiver-rewards'] = this.receiverRewards;
    }
    if (this.senderRewards) {
      obj['sender-rewards'] = this.senderRewards;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): PendingTransactionResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded PendingTransactionResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new PendingTransactionResponse({
      poolError: data['pool-error'] ?? '',
      txn: SignedTransaction.fromDecodedJSON(data['txn'] ?? {}),
      applicationIndex: data['application-index'],
      assetClosingAmount: data['asset-closing-amount'],
      assetIndex: data['asset-index'],
      closeRewards: data['close-rewards'],
      closingAmount: data['closing-amount'],
      confirmedRound: data['confirmed-round'],
      globalStateDelta:
        typeof data['global-state-delta'] !== 'undefined'
          ? data['global-state-delta'].map(EvalDeltaKeyValue.fromDecodedJSON)
          : undefined,
      innerTxns:
        typeof data['inner-txns'] !== 'undefined'
          ? data['inner-txns'].map(PendingTransactionResponse.fromDecodedJSON)
          : undefined,
      localStateDelta:
        typeof data['local-state-delta'] !== 'undefined'
          ? data['local-state-delta'].map(AccountStateDelta.fromDecodedJSON)
          : undefined,
      logs: data['logs'],
      receiverRewards: data['receiver-rewards'],
      senderRewards: data['sender-rewards'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): PendingTransactionResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new PendingTransactionResponse({
      poolError: data.get('pool-error') ?? '',
      txn: SignedTransaction.fromDecodedMsgpack(data.get('txn') ?? {}),
      applicationIndex: data.get('application-index'),
      assetClosingAmount: data.get('asset-closing-amount'),
      assetIndex: data.get('asset-index'),
      closeRewards: data.get('close-rewards'),
      closingAmount: data.get('closing-amount'),
      confirmedRound: data.get('confirmed-round'),
      globalStateDelta:
        typeof data.get('global-state-delta') !== 'undefined'
          ? data
              .get('global-state-delta')
              .map(EvalDeltaKeyValue.fromDecodedMsgpack)
          : undefined,
      innerTxns:
        typeof data.get('inner-txns') !== 'undefined'
          ? data
              .get('inner-txns')
              .map(PendingTransactionResponse.fromDecodedMsgpack)
          : undefined,
      localStateDelta:
        typeof data.get('local-state-delta') !== 'undefined'
          ? data
              .get('local-state-delta')
              .map(AccountStateDelta.fromDecodedMsgpack)
          : undefined,
      logs: data.get('logs'),
      receiverRewards: data.get('receiver-rewards'),
      senderRewards: data.get('sender-rewards'),
    });
  }
}

/**
 * A potentially truncated list of transactions currently in the node's transaction
 * pool. You can compute whether or not the list is truncated if the number of
 * elements in the **top-transactions** array is fewer than **total-transactions**.
 */
export class PendingTransactionsResponse
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * An array of signed transaction objects.
   */
  public topTransactions: SignedTransaction[];

  /**
   * Total number of transactions in the pool.
   */
  public totalTransactions: number;

  /**
   * Creates a new `PendingTransactionsResponse` object.
   * @param topTransactions - An array of signed transaction objects.
   * @param totalTransactions - Total number of transactions in the pool.
   */
  constructor({
    topTransactions,
    totalTransactions,
  }: {
    topTransactions: SignedTransaction[];
    totalTransactions: number | bigint;
  }) {
    this.topTransactions = topTransactions;
    this.totalTransactions = ensureSafeInteger(totalTransactions);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['top-transactions', this.topTransactions.map((v) => v.msgpackPrepare())],
      ['total-transactions', this.totalTransactions],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['top-transactions'] = this.topTransactions.map((v) => v.jsonPrepare());
    obj['total-transactions'] = this.totalTransactions;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): PendingTransactionsResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(
        `Invalid decoded PendingTransactionsResponse: ${encoded}`
      );
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new PendingTransactionsResponse({
      topTransactions: (data['top-transactions'] ?? []).map(
        SignedTransaction.fromDecodedJSON
      ),
      totalTransactions: data['total-transactions'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): PendingTransactionsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new PendingTransactionsResponse({
      topTransactions: (data.get('top-transactions') ?? []).map(
        SignedTransaction.fromDecodedMsgpack
      ),
      totalTransactions: data.get('total-transactions') ?? 0,
    });
  }
}

/**
 * Transaction ID of the submission.
 */
export class PostTransactionsResponse
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * encoding of the transaction hash.
   */
  public txid: string;

  /**
   * Creates a new `PostTransactionsResponse` object.
   * @param txid - encoding of the transaction hash.
   */
  constructor({ txid }: { txid: string }) {
    this.txid = txid;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([['txId', this.txid]]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['txId'] = this.txid;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): PostTransactionsResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded PostTransactionsResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new PostTransactionsResponse({
      txid: data['txId'] ?? '',
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): PostTransactionsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new PostTransactionsResponse({
      txid: data.get('txId') ?? '',
    });
  }
}

/**
 * A write operation into a scratch slot.
 */
export class ScratchChange implements MsgpackEncodable, JSONEncodable {
  /**
   * Represents an AVM value.
   */
  public newValue: AvmValue;

  /**
   * The scratch slot written.
   */
  public slot: number;

  /**
   * Creates a new `ScratchChange` object.
   * @param newValue - Represents an AVM value.
   * @param slot - The scratch slot written.
   */
  constructor({
    newValue,
    slot,
  }: {
    newValue: AvmValue;
    slot: number | bigint;
  }) {
    this.newValue = newValue;
    this.slot = ensureSafeInteger(slot);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['new-value', this.newValue.msgpackPrepare()],
      ['slot', this.slot],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['new-value'] = this.newValue.jsonPrepare();
    obj['slot'] = this.slot;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): ScratchChange {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded ScratchChange: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new ScratchChange({
      newValue: AvmValue.fromDecodedJSON(data['new-value'] ?? {}),
      slot: data['slot'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): ScratchChange {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ScratchChange({
      newValue: AvmValue.fromDecodedMsgpack(data.get('new-value') ?? {}),
      slot: data.get('slot') ?? 0,
    });
  }
}

/**
 * Initial states of resources that were accessed during simulation.
 */
export class SimulateInitialStates implements MsgpackEncodable, JSONEncodable {
  /**
   * The initial states of accessed application before simulation. The order of this
   * array is arbitrary.
   */
  public appInitialStates?: ApplicationInitialStates[];

  /**
   * Creates a new `SimulateInitialStates` object.
   * @param appInitialStates - The initial states of accessed application before simulation. The order of this
   * array is arbitrary.
   */
  constructor({
    appInitialStates,
  }: {
    appInitialStates?: ApplicationInitialStates[];
  }) {
    this.appInitialStates = appInitialStates;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([]);
    if (this.appInitialStates && this.appInitialStates.length) {
      data.set(
        'app-initial-states',
        this.appInitialStates.map((v) => v.msgpackPrepare())
      );
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    if (this.appInitialStates && this.appInitialStates.length) {
      obj['app-initial-states'] = this.appInitialStates.map((v) =>
        v.jsonPrepare()
      );
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulateInitialStates {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded SimulateInitialStates: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulateInitialStates({
      appInitialStates:
        typeof data['app-initial-states'] !== 'undefined'
          ? data['app-initial-states'].map(
              ApplicationInitialStates.fromDecodedJSON
            )
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulateInitialStates {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateInitialStates({
      appInitialStates:
        typeof data.get('app-initial-states') !== 'undefined'
          ? data
              .get('app-initial-states')
              .map(ApplicationInitialStates.fromDecodedMsgpack)
          : undefined,
    });
  }
}

/**
 * Request type for simulation endpoint.
 */
export class SimulateRequest implements MsgpackEncodable, JSONEncodable {
  /**
   * The transaction groups to simulate.
   */
  public txnGroups: SimulateRequestTransactionGroup[];

  /**
   * Allows transactions without signatures to be simulated as if they had correct
   * signatures.
   */
  public allowEmptySignatures?: boolean;

  /**
   * Lifts limits on log opcode usage during simulation.
   */
  public allowMoreLogging?: boolean;

  /**
   * Allows access to unnamed resources during simulation.
   */
  public allowUnnamedResources?: boolean;

  /**
   * An object that configures simulation execution trace.
   */
  public execTraceConfig?: SimulateTraceConfig;

  /**
   * Applies extra opcode budget during simulation for each transaction group.
   */
  public extraOpcodeBudget?: number;

  /**
   * If provided, specifies the round preceding the simulation. State changes through
   * this round will be used to run this simulation. Usually only the 4 most recent
   * rounds will be available (controlled by the node config value MaxAcctLookback).
   * If not specified, defaults to the latest available round.
   */
  public round?: bigint;

  /**
   * Creates a new `SimulateRequest` object.
   * @param txnGroups - The transaction groups to simulate.
   * @param allowEmptySignatures - Allows transactions without signatures to be simulated as if they had correct
   * signatures.
   * @param allowMoreLogging - Lifts limits on log opcode usage during simulation.
   * @param allowUnnamedResources - Allows access to unnamed resources during simulation.
   * @param execTraceConfig - An object that configures simulation execution trace.
   * @param extraOpcodeBudget - Applies extra opcode budget during simulation for each transaction group.
   * @param round - If provided, specifies the round preceding the simulation. State changes through
   * this round will be used to run this simulation. Usually only the 4 most recent
   * rounds will be available (controlled by the node config value MaxAcctLookback).
   * If not specified, defaults to the latest available round.
   */
  constructor({
    txnGroups,
    allowEmptySignatures,
    allowMoreLogging,
    allowUnnamedResources,
    execTraceConfig,
    extraOpcodeBudget,
    round,
  }: {
    txnGroups: SimulateRequestTransactionGroup[];
    allowEmptySignatures?: boolean;
    allowMoreLogging?: boolean;
    allowUnnamedResources?: boolean;
    execTraceConfig?: SimulateTraceConfig;
    extraOpcodeBudget?: number | bigint;
    round?: number | bigint;
  }) {
    this.txnGroups = txnGroups;
    this.allowEmptySignatures = allowEmptySignatures;
    this.allowMoreLogging = allowMoreLogging;
    this.allowUnnamedResources = allowUnnamedResources;
    this.execTraceConfig = execTraceConfig;
    this.extraOpcodeBudget =
      typeof extraOpcodeBudget === 'undefined'
        ? undefined
        : ensureSafeInteger(extraOpcodeBudget);
    this.round = typeof round === 'undefined' ? undefined : ensureBigInt(round);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['txn-groups', this.txnGroups.map((v) => v.msgpackPrepare())],
    ]);
    if (this.allowEmptySignatures) {
      data.set('allow-empty-signatures', this.allowEmptySignatures);
    }
    if (this.allowMoreLogging) {
      data.set('allow-more-logging', this.allowMoreLogging);
    }
    if (this.allowUnnamedResources) {
      data.set('allow-unnamed-resources', this.allowUnnamedResources);
    }
    if (this.execTraceConfig) {
      data.set('exec-trace-config', this.execTraceConfig.msgpackPrepare());
    }
    if (this.extraOpcodeBudget) {
      data.set('extra-opcode-budget', this.extraOpcodeBudget);
    }
    if (this.round) {
      data.set('round', this.round);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['txn-groups'] = this.txnGroups.map((v) => v.jsonPrepare());
    if (this.allowEmptySignatures) {
      obj['allow-empty-signatures'] = this.allowEmptySignatures;
    }
    if (this.allowMoreLogging) {
      obj['allow-more-logging'] = this.allowMoreLogging;
    }
    if (this.allowUnnamedResources) {
      obj['allow-unnamed-resources'] = this.allowUnnamedResources;
    }
    if (this.execTraceConfig) {
      obj['exec-trace-config'] = this.execTraceConfig.jsonPrepare();
    }
    if (this.extraOpcodeBudget) {
      obj['extra-opcode-budget'] = this.extraOpcodeBudget;
    }
    if (this.round) {
      obj['round'] = this.round;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulateRequest {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded SimulateRequest: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulateRequest({
      txnGroups: (data['txn-groups'] ?? []).map(
        SimulateRequestTransactionGroup.fromDecodedJSON
      ),
      allowEmptySignatures: data['allow-empty-signatures'],
      allowMoreLogging: data['allow-more-logging'],
      allowUnnamedResources: data['allow-unnamed-resources'],
      execTraceConfig:
        typeof data['exec-trace-config'] !== 'undefined'
          ? SimulateTraceConfig.fromDecodedJSON(data['exec-trace-config'])
          : undefined,
      extraOpcodeBudget: data['extra-opcode-budget'],
      round: data['round'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulateRequest {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateRequest({
      txnGroups: (data.get('txn-groups') ?? []).map(
        SimulateRequestTransactionGroup.fromDecodedMsgpack
      ),
      allowEmptySignatures: data.get('allow-empty-signatures'),
      allowMoreLogging: data.get('allow-more-logging'),
      allowUnnamedResources: data.get('allow-unnamed-resources'),
      execTraceConfig:
        typeof data.get('exec-trace-config') !== 'undefined'
          ? SimulateTraceConfig.fromDecodedMsgpack(
              data.get('exec-trace-config')
            )
          : undefined,
      extraOpcodeBudget: data.get('extra-opcode-budget'),
      round: data.get('round'),
    });
  }
}

/**
 * A transaction group to simulate.
 */
export class SimulateRequestTransactionGroup
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * An atomic transaction group.
   */
  public txns: SignedTransaction[];

  /**
   * Creates a new `SimulateRequestTransactionGroup` object.
   * @param txns - An atomic transaction group.
   */
  constructor({ txns }: { txns: SignedTransaction[] }) {
    this.txns = txns;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['txns', this.txns.map((v) => v.msgpackPrepare())],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['txns'] = this.txns.map((v) => v.jsonPrepare());
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulateRequestTransactionGroup {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(
        `Invalid decoded SimulateRequestTransactionGroup: ${encoded}`
      );
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulateRequestTransactionGroup({
      txns: (data['txns'] ?? []).map(SignedTransaction.fromDecodedJSON),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulateRequestTransactionGroup {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateRequestTransactionGroup({
      txns: (data.get('txns') ?? []).map(SignedTransaction.fromDecodedMsgpack),
    });
  }
}

/**
 * Result of a transaction group simulation.
 */
export class SimulateResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * The round immediately preceding this simulation. State changes through this
   * round were used to run this simulation.
   */
  public lastRound: bigint;

  /**
   * A result object for each transaction group that was simulated.
   */
  public txnGroups: SimulateTransactionGroupResult[];

  /**
   * The version of this response object.
   */
  public version: number;

  /**
   * The set of parameters and limits override during simulation. If this set of
   * parameters is present, then evaluation parameters may differ from standard
   * evaluation in certain ways.
   */
  public evalOverrides?: SimulationEvalOverrides;

  /**
   * An object that configures simulation execution trace.
   */
  public execTraceConfig?: SimulateTraceConfig;

  /**
   * Initial states of resources that were accessed during simulation.
   */
  public initialStates?: SimulateInitialStates;

  /**
   * Creates a new `SimulateResponse` object.
   * @param lastRound - The round immediately preceding this simulation. State changes through this
   * round were used to run this simulation.
   * @param txnGroups - A result object for each transaction group that was simulated.
   * @param version - The version of this response object.
   * @param evalOverrides - The set of parameters and limits override during simulation. If this set of
   * parameters is present, then evaluation parameters may differ from standard
   * evaluation in certain ways.
   * @param execTraceConfig - An object that configures simulation execution trace.
   * @param initialStates - Initial states of resources that were accessed during simulation.
   */
  constructor({
    lastRound,
    txnGroups,
    version,
    evalOverrides,
    execTraceConfig,
    initialStates,
  }: {
    lastRound: number | bigint;
    txnGroups: SimulateTransactionGroupResult[];
    version: number | bigint;
    evalOverrides?: SimulationEvalOverrides;
    execTraceConfig?: SimulateTraceConfig;
    initialStates?: SimulateInitialStates;
  }) {
    this.lastRound = ensureBigInt(lastRound);
    this.txnGroups = txnGroups;
    this.version = ensureSafeInteger(version);
    this.evalOverrides = evalOverrides;
    this.execTraceConfig = execTraceConfig;
    this.initialStates = initialStates;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['last-round', this.lastRound],
      ['txn-groups', this.txnGroups.map((v) => v.msgpackPrepare())],
      ['version', this.version],
    ]);
    if (this.evalOverrides) {
      data.set('eval-overrides', this.evalOverrides.msgpackPrepare());
    }
    if (this.execTraceConfig) {
      data.set('exec-trace-config', this.execTraceConfig.msgpackPrepare());
    }
    if (this.initialStates) {
      data.set('initial-states', this.initialStates.msgpackPrepare());
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['last-round'] = this.lastRound;
    obj['txn-groups'] = this.txnGroups.map((v) => v.jsonPrepare());
    obj['version'] = this.version;
    if (this.evalOverrides) {
      obj['eval-overrides'] = this.evalOverrides.jsonPrepare();
    }
    if (this.execTraceConfig) {
      obj['exec-trace-config'] = this.execTraceConfig.jsonPrepare();
    }
    if (this.initialStates) {
      obj['initial-states'] = this.initialStates.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulateResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded SimulateResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulateResponse({
      lastRound: data['last-round'] ?? 0,
      txnGroups: (data['txn-groups'] ?? []).map(
        SimulateTransactionGroupResult.fromDecodedJSON
      ),
      version: data['version'] ?? 0,
      evalOverrides:
        typeof data['eval-overrides'] !== 'undefined'
          ? SimulationEvalOverrides.fromDecodedJSON(data['eval-overrides'])
          : undefined,
      execTraceConfig:
        typeof data['exec-trace-config'] !== 'undefined'
          ? SimulateTraceConfig.fromDecodedJSON(data['exec-trace-config'])
          : undefined,
      initialStates:
        typeof data['initial-states'] !== 'undefined'
          ? SimulateInitialStates.fromDecodedJSON(data['initial-states'])
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulateResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateResponse({
      lastRound: data.get('last-round') ?? 0,
      txnGroups: (data.get('txn-groups') ?? []).map(
        SimulateTransactionGroupResult.fromDecodedMsgpack
      ),
      version: data.get('version') ?? 0,
      evalOverrides:
        typeof data.get('eval-overrides') !== 'undefined'
          ? SimulationEvalOverrides.fromDecodedMsgpack(
              data.get('eval-overrides')
            )
          : undefined,
      execTraceConfig:
        typeof data.get('exec-trace-config') !== 'undefined'
          ? SimulateTraceConfig.fromDecodedMsgpack(
              data.get('exec-trace-config')
            )
          : undefined,
      initialStates:
        typeof data.get('initial-states') !== 'undefined'
          ? SimulateInitialStates.fromDecodedMsgpack(data.get('initial-states'))
          : undefined,
    });
  }
}

/**
 * An object that configures simulation execution trace.
 */
export class SimulateTraceConfig implements MsgpackEncodable, JSONEncodable {
  /**
   * A boolean option for opting in execution trace features simulation endpoint.
   */
  public enable?: boolean;

  /**
   * A boolean option enabling returning scratch slot changes together with execution
   * trace during simulation.
   */
  public scratchChange?: boolean;

  /**
   * A boolean option enabling returning stack changes together with execution trace
   * during simulation.
   */
  public stackChange?: boolean;

  /**
   * A boolean option enabling returning application state changes (global, local,
   * and box changes) with the execution trace during simulation.
   */
  public stateChange?: boolean;

  /**
   * Creates a new `SimulateTraceConfig` object.
   * @param enable - A boolean option for opting in execution trace features simulation endpoint.
   * @param scratchChange - A boolean option enabling returning scratch slot changes together with execution
   * trace during simulation.
   * @param stackChange - A boolean option enabling returning stack changes together with execution trace
   * during simulation.
   * @param stateChange - A boolean option enabling returning application state changes (global, local,
   * and box changes) with the execution trace during simulation.
   */
  constructor({
    enable,
    scratchChange,
    stackChange,
    stateChange,
  }: {
    enable?: boolean;
    scratchChange?: boolean;
    stackChange?: boolean;
    stateChange?: boolean;
  }) {
    this.enable = enable;
    this.scratchChange = scratchChange;
    this.stackChange = stackChange;
    this.stateChange = stateChange;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([]);
    if (this.enable) {
      data.set('enable', this.enable);
    }
    if (this.scratchChange) {
      data.set('scratch-change', this.scratchChange);
    }
    if (this.stackChange) {
      data.set('stack-change', this.stackChange);
    }
    if (this.stateChange) {
      data.set('state-change', this.stateChange);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    if (this.enable) {
      obj['enable'] = this.enable;
    }
    if (this.scratchChange) {
      obj['scratch-change'] = this.scratchChange;
    }
    if (this.stackChange) {
      obj['stack-change'] = this.stackChange;
    }
    if (this.stateChange) {
      obj['state-change'] = this.stateChange;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulateTraceConfig {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded SimulateTraceConfig: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulateTraceConfig({
      enable: data['enable'],
      scratchChange: data['scratch-change'],
      stackChange: data['stack-change'],
      stateChange: data['state-change'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulateTraceConfig {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateTraceConfig({
      enable: data.get('enable'),
      scratchChange: data.get('scratch-change'),
      stackChange: data.get('stack-change'),
      stateChange: data.get('state-change'),
    });
  }
}

/**
 * Simulation result for an atomic transaction group
 */
export class SimulateTransactionGroupResult
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * Simulation result for individual transactions
   */
  public txnResults: SimulateTransactionResult[];

  /**
   * Total budget added during execution of app calls in the transaction group.
   */
  public appBudgetAdded?: number;

  /**
   * Total budget consumed during execution of app calls in the transaction group.
   */
  public appBudgetConsumed?: number;

  /**
   * If present, indicates which transaction in this group caused the failure. This
   * array represents the path to the failing transaction. Indexes are zero based,
   * the first element indicates the top-level transaction, and successive elements
   * indicate deeper inner transactions.
   */
  public failedAt?: number[];

  /**
   * If present, indicates that the transaction group failed and specifies why that
   * happened
   */
  public failureMessage?: string;

  /**
   * These are resources that were accessed by this group that would normally have
   * caused failure, but were allowed in simulation. Depending on where this object
   * is in the response, the unnamed resources it contains may or may not qualify for
   * group resource sharing. If this is a field in SimulateTransactionGroupResult,
   * the resources do qualify, but if this is a field in SimulateTransactionResult,
   * they do not qualify. In order to make this group valid for actual submission,
   * resources that qualify for group sharing can be made available by any
   * transaction of the group; otherwise, resources must be placed in the same
   * transaction which accessed them.
   */
  public unnamedResourcesAccessed?: SimulateUnnamedResourcesAccessed;

  /**
   * Creates a new `SimulateTransactionGroupResult` object.
   * @param txnResults - Simulation result for individual transactions
   * @param appBudgetAdded - Total budget added during execution of app calls in the transaction group.
   * @param appBudgetConsumed - Total budget consumed during execution of app calls in the transaction group.
   * @param failedAt - If present, indicates which transaction in this group caused the failure. This
   * array represents the path to the failing transaction. Indexes are zero based,
   * the first element indicates the top-level transaction, and successive elements
   * indicate deeper inner transactions.
   * @param failureMessage - If present, indicates that the transaction group failed and specifies why that
   * happened
   * @param unnamedResourcesAccessed - These are resources that were accessed by this group that would normally have
   * caused failure, but were allowed in simulation. Depending on where this object
   * is in the response, the unnamed resources it contains may or may not qualify for
   * group resource sharing. If this is a field in SimulateTransactionGroupResult,
   * the resources do qualify, but if this is a field in SimulateTransactionResult,
   * they do not qualify. In order to make this group valid for actual submission,
   * resources that qualify for group sharing can be made available by any
   * transaction of the group; otherwise, resources must be placed in the same
   * transaction which accessed them.
   */
  constructor({
    txnResults,
    appBudgetAdded,
    appBudgetConsumed,
    failedAt,
    failureMessage,
    unnamedResourcesAccessed,
  }: {
    txnResults: SimulateTransactionResult[];
    appBudgetAdded?: number | bigint;
    appBudgetConsumed?: number | bigint;
    failedAt?: (number | bigint)[];
    failureMessage?: string;
    unnamedResourcesAccessed?: SimulateUnnamedResourcesAccessed;
  }) {
    this.txnResults = txnResults;
    this.appBudgetAdded =
      typeof appBudgetAdded === 'undefined'
        ? undefined
        : ensureSafeInteger(appBudgetAdded);
    this.appBudgetConsumed =
      typeof appBudgetConsumed === 'undefined'
        ? undefined
        : ensureSafeInteger(appBudgetConsumed);
    this.failedAt =
      typeof failedAt === 'undefined'
        ? undefined
        : failedAt.map(ensureSafeInteger);
    this.failureMessage = failureMessage;
    this.unnamedResourcesAccessed = unnamedResourcesAccessed;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['txn-results', this.txnResults.map((v) => v.msgpackPrepare())],
    ]);
    if (this.appBudgetAdded) {
      data.set('app-budget-added', this.appBudgetAdded);
    }
    if (this.appBudgetConsumed) {
      data.set('app-budget-consumed', this.appBudgetConsumed);
    }
    if (this.failedAt && this.failedAt.length) {
      data.set('failed-at', this.failedAt);
    }
    if (this.failureMessage) {
      data.set('failure-message', this.failureMessage);
    }
    if (this.unnamedResourcesAccessed) {
      data.set(
        'unnamed-resources-accessed',
        this.unnamedResourcesAccessed.msgpackPrepare()
      );
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['txn-results'] = this.txnResults.map((v) => v.jsonPrepare());
    if (this.appBudgetAdded) {
      obj['app-budget-added'] = this.appBudgetAdded;
    }
    if (this.appBudgetConsumed) {
      obj['app-budget-consumed'] = this.appBudgetConsumed;
    }
    if (this.failedAt && this.failedAt.length) {
      obj['failed-at'] = this.failedAt;
    }
    if (this.failureMessage) {
      obj['failure-message'] = this.failureMessage;
    }
    if (this.unnamedResourcesAccessed) {
      obj['unnamed-resources-accessed'] =
        this.unnamedResourcesAccessed.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulateTransactionGroupResult {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(
        `Invalid decoded SimulateTransactionGroupResult: ${encoded}`
      );
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulateTransactionGroupResult({
      txnResults: (data['txn-results'] ?? []).map(
        SimulateTransactionResult.fromDecodedJSON
      ),
      appBudgetAdded: data['app-budget-added'],
      appBudgetConsumed: data['app-budget-consumed'],
      failedAt: data['failed-at'],
      failureMessage: data['failure-message'],
      unnamedResourcesAccessed:
        typeof data['unnamed-resources-accessed'] !== 'undefined'
          ? SimulateUnnamedResourcesAccessed.fromDecodedJSON(
              data['unnamed-resources-accessed']
            )
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulateTransactionGroupResult {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateTransactionGroupResult({
      txnResults: (data.get('txn-results') ?? []).map(
        SimulateTransactionResult.fromDecodedMsgpack
      ),
      appBudgetAdded: data.get('app-budget-added'),
      appBudgetConsumed: data.get('app-budget-consumed'),
      failedAt: data.get('failed-at'),
      failureMessage: data.get('failure-message'),
      unnamedResourcesAccessed:
        typeof data.get('unnamed-resources-accessed') !== 'undefined'
          ? SimulateUnnamedResourcesAccessed.fromDecodedMsgpack(
              data.get('unnamed-resources-accessed')
            )
          : undefined,
    });
  }
}

/**
 * Simulation result for an individual transaction
 */
export class SimulateTransactionResult
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * Details about a pending transaction. If the transaction was recently confirmed,
   * includes confirmation details like the round and reward details.
   */
  public txnResult: PendingTransactionResponse;

  /**
   * Budget used during execution of an app call transaction. This value includes
   * budged used by inner app calls spawned by this transaction.
   */
  public appBudgetConsumed?: number;

  /**
   * The execution trace of calling an app or a logic sig, containing the inner app
   * call trace in a recursive way.
   */
  public execTrace?: SimulationTransactionExecTrace;

  /**
   * Budget used during execution of a logic sig transaction.
   */
  public logicSigBudgetConsumed?: number;

  /**
   * These are resources that were accessed by this group that would normally have
   * caused failure, but were allowed in simulation. Depending on where this object
   * is in the response, the unnamed resources it contains may or may not qualify for
   * group resource sharing. If this is a field in SimulateTransactionGroupResult,
   * the resources do qualify, but if this is a field in SimulateTransactionResult,
   * they do not qualify. In order to make this group valid for actual submission,
   * resources that qualify for group sharing can be made available by any
   * transaction of the group; otherwise, resources must be placed in the same
   * transaction which accessed them.
   */
  public unnamedResourcesAccessed?: SimulateUnnamedResourcesAccessed;

  /**
   * Creates a new `SimulateTransactionResult` object.
   * @param txnResult - Details about a pending transaction. If the transaction was recently confirmed,
   * includes confirmation details like the round and reward details.
   * @param appBudgetConsumed - Budget used during execution of an app call transaction. This value includes
   * budged used by inner app calls spawned by this transaction.
   * @param execTrace - The execution trace of calling an app or a logic sig, containing the inner app
   * call trace in a recursive way.
   * @param logicSigBudgetConsumed - Budget used during execution of a logic sig transaction.
   * @param unnamedResourcesAccessed - These are resources that were accessed by this group that would normally have
   * caused failure, but were allowed in simulation. Depending on where this object
   * is in the response, the unnamed resources it contains may or may not qualify for
   * group resource sharing. If this is a field in SimulateTransactionGroupResult,
   * the resources do qualify, but if this is a field in SimulateTransactionResult,
   * they do not qualify. In order to make this group valid for actual submission,
   * resources that qualify for group sharing can be made available by any
   * transaction of the group; otherwise, resources must be placed in the same
   * transaction which accessed them.
   */
  constructor({
    txnResult,
    appBudgetConsumed,
    execTrace,
    logicSigBudgetConsumed,
    unnamedResourcesAccessed,
  }: {
    txnResult: PendingTransactionResponse;
    appBudgetConsumed?: number | bigint;
    execTrace?: SimulationTransactionExecTrace;
    logicSigBudgetConsumed?: number | bigint;
    unnamedResourcesAccessed?: SimulateUnnamedResourcesAccessed;
  }) {
    this.txnResult = txnResult;
    this.appBudgetConsumed =
      typeof appBudgetConsumed === 'undefined'
        ? undefined
        : ensureSafeInteger(appBudgetConsumed);
    this.execTrace = execTrace;
    this.logicSigBudgetConsumed =
      typeof logicSigBudgetConsumed === 'undefined'
        ? undefined
        : ensureSafeInteger(logicSigBudgetConsumed);
    this.unnamedResourcesAccessed = unnamedResourcesAccessed;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['txn-result', this.txnResult.msgpackPrepare()],
    ]);
    if (this.appBudgetConsumed) {
      data.set('app-budget-consumed', this.appBudgetConsumed);
    }
    if (this.execTrace) {
      data.set('exec-trace', this.execTrace.msgpackPrepare());
    }
    if (this.logicSigBudgetConsumed) {
      data.set('logic-sig-budget-consumed', this.logicSigBudgetConsumed);
    }
    if (this.unnamedResourcesAccessed) {
      data.set(
        'unnamed-resources-accessed',
        this.unnamedResourcesAccessed.msgpackPrepare()
      );
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['txn-result'] = this.txnResult.jsonPrepare();
    if (this.appBudgetConsumed) {
      obj['app-budget-consumed'] = this.appBudgetConsumed;
    }
    if (this.execTrace) {
      obj['exec-trace'] = this.execTrace.jsonPrepare();
    }
    if (this.logicSigBudgetConsumed) {
      obj['logic-sig-budget-consumed'] = this.logicSigBudgetConsumed;
    }
    if (this.unnamedResourcesAccessed) {
      obj['unnamed-resources-accessed'] =
        this.unnamedResourcesAccessed.jsonPrepare();
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulateTransactionResult {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded SimulateTransactionResult: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulateTransactionResult({
      txnResult: PendingTransactionResponse.fromDecodedJSON(
        data['txn-result'] ?? {}
      ),
      appBudgetConsumed: data['app-budget-consumed'],
      execTrace:
        typeof data['exec-trace'] !== 'undefined'
          ? SimulationTransactionExecTrace.fromDecodedJSON(data['exec-trace'])
          : undefined,
      logicSigBudgetConsumed: data['logic-sig-budget-consumed'],
      unnamedResourcesAccessed:
        typeof data['unnamed-resources-accessed'] !== 'undefined'
          ? SimulateUnnamedResourcesAccessed.fromDecodedJSON(
              data['unnamed-resources-accessed']
            )
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulateTransactionResult {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateTransactionResult({
      txnResult: PendingTransactionResponse.fromDecodedMsgpack(
        data.get('txn-result') ?? {}
      ),
      appBudgetConsumed: data.get('app-budget-consumed'),
      execTrace:
        typeof data.get('exec-trace') !== 'undefined'
          ? SimulationTransactionExecTrace.fromDecodedMsgpack(
              data.get('exec-trace')
            )
          : undefined,
      logicSigBudgetConsumed: data.get('logic-sig-budget-consumed'),
      unnamedResourcesAccessed:
        typeof data.get('unnamed-resources-accessed') !== 'undefined'
          ? SimulateUnnamedResourcesAccessed.fromDecodedMsgpack(
              data.get('unnamed-resources-accessed')
            )
          : undefined,
    });
  }
}

/**
 * These are resources that were accessed by this group that would normally have
 * caused failure, but were allowed in simulation. Depending on where this object
 * is in the response, the unnamed resources it contains may or may not qualify for
 * group resource sharing. If this is a field in SimulateTransactionGroupResult,
 * the resources do qualify, but if this is a field in SimulateTransactionResult,
 * they do not qualify. In order to make this group valid for actual submission,
 * resources that qualify for group sharing can be made available by any
 * transaction of the group; otherwise, resources must be placed in the same
 * transaction which accessed them.
 */
export class SimulateUnnamedResourcesAccessed
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * The unnamed accounts that were referenced. The order of this array is arbitrary.
   */
  public accounts?: string[];

  /**
   * The unnamed application local states that were referenced. The order of this
   * array is arbitrary.
   */
  public appLocals?: ApplicationLocalReference[];

  /**
   * The unnamed applications that were referenced. The order of this array is
   * arbitrary.
   */
  public apps?: bigint[];

  /**
   * The unnamed asset holdings that were referenced. The order of this array is
   * arbitrary.
   */
  public assetHoldings?: AssetHoldingReference[];

  /**
   * The unnamed assets that were referenced. The order of this array is arbitrary.
   */
  public assets?: bigint[];

  /**
   * The unnamed boxes that were referenced. The order of this array is arbitrary.
   */
  public boxes?: BoxReference[];

  /**
   * The number of extra box references used to increase the IO budget. This is in
   * addition to the references defined in the input transaction group and any
   * referenced to unnamed boxes.
   */
  public extraBoxRefs?: number;

  /**
   * Creates a new `SimulateUnnamedResourcesAccessed` object.
   * @param accounts - The unnamed accounts that were referenced. The order of this array is arbitrary.
   * @param appLocals - The unnamed application local states that were referenced. The order of this
   * array is arbitrary.
   * @param apps - The unnamed applications that were referenced. The order of this array is
   * arbitrary.
   * @param assetHoldings - The unnamed asset holdings that were referenced. The order of this array is
   * arbitrary.
   * @param assets - The unnamed assets that were referenced. The order of this array is arbitrary.
   * @param boxes - The unnamed boxes that were referenced. The order of this array is arbitrary.
   * @param extraBoxRefs - The number of extra box references used to increase the IO budget. This is in
   * addition to the references defined in the input transaction group and any
   * referenced to unnamed boxes.
   */
  constructor({
    accounts,
    appLocals,
    apps,
    assetHoldings,
    assets,
    boxes,
    extraBoxRefs,
  }: {
    accounts?: string[];
    appLocals?: ApplicationLocalReference[];
    apps?: (number | bigint)[];
    assetHoldings?: AssetHoldingReference[];
    assets?: (number | bigint)[];
    boxes?: BoxReference[];
    extraBoxRefs?: number | bigint;
  }) {
    this.accounts = accounts;
    this.appLocals = appLocals;
    this.apps =
      typeof apps === 'undefined' ? undefined : apps.map(ensureBigInt);
    this.assetHoldings = assetHoldings;
    this.assets =
      typeof assets === 'undefined' ? undefined : assets.map(ensureBigInt);
    this.boxes = boxes;
    this.extraBoxRefs =
      typeof extraBoxRefs === 'undefined'
        ? undefined
        : ensureSafeInteger(extraBoxRefs);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([]);
    if (this.accounts && this.accounts.length) {
      data.set('accounts', this.accounts);
    }
    if (this.appLocals && this.appLocals.length) {
      data.set(
        'app-locals',
        this.appLocals.map((v) => v.msgpackPrepare())
      );
    }
    if (this.apps && this.apps.length) {
      data.set('apps', this.apps);
    }
    if (this.assetHoldings && this.assetHoldings.length) {
      data.set(
        'asset-holdings',
        this.assetHoldings.map((v) => v.msgpackPrepare())
      );
    }
    if (this.assets && this.assets.length) {
      data.set('assets', this.assets);
    }
    if (this.boxes && this.boxes.length) {
      data.set(
        'boxes',
        this.boxes.map((v) => v.msgpackPrepare())
      );
    }
    if (this.extraBoxRefs) {
      data.set('extra-box-refs', this.extraBoxRefs);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    if (this.accounts && this.accounts.length) {
      obj['accounts'] = this.accounts;
    }
    if (this.appLocals && this.appLocals.length) {
      obj['app-locals'] = this.appLocals.map((v) => v.jsonPrepare());
    }
    if (this.apps && this.apps.length) {
      obj['apps'] = this.apps;
    }
    if (this.assetHoldings && this.assetHoldings.length) {
      obj['asset-holdings'] = this.assetHoldings.map((v) => v.jsonPrepare());
    }
    if (this.assets && this.assets.length) {
      obj['assets'] = this.assets;
    }
    if (this.boxes && this.boxes.length) {
      obj['boxes'] = this.boxes.map((v) => v.jsonPrepare());
    }
    if (this.extraBoxRefs) {
      obj['extra-box-refs'] = this.extraBoxRefs;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulateUnnamedResourcesAccessed {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(
        `Invalid decoded SimulateUnnamedResourcesAccessed: ${encoded}`
      );
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulateUnnamedResourcesAccessed({
      accounts: data['accounts'],
      appLocals:
        typeof data['app-locals'] !== 'undefined'
          ? data['app-locals'].map(ApplicationLocalReference.fromDecodedJSON)
          : undefined,
      apps: data['apps'],
      assetHoldings:
        typeof data['asset-holdings'] !== 'undefined'
          ? data['asset-holdings'].map(AssetHoldingReference.fromDecodedJSON)
          : undefined,
      assets: data['assets'],
      boxes:
        typeof data['boxes'] !== 'undefined'
          ? data['boxes'].map(BoxReference.fromDecodedJSON)
          : undefined,
      extraBoxRefs: data['extra-box-refs'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulateUnnamedResourcesAccessed {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateUnnamedResourcesAccessed({
      accounts: data.get('accounts'),
      appLocals:
        typeof data.get('app-locals') !== 'undefined'
          ? data
              .get('app-locals')
              .map(ApplicationLocalReference.fromDecodedMsgpack)
          : undefined,
      apps: data.get('apps'),
      assetHoldings:
        typeof data.get('asset-holdings') !== 'undefined'
          ? data
              .get('asset-holdings')
              .map(AssetHoldingReference.fromDecodedMsgpack)
          : undefined,
      assets: data.get('assets'),
      boxes:
        typeof data.get('boxes') !== 'undefined'
          ? data.get('boxes').map(BoxReference.fromDecodedMsgpack)
          : undefined,
      extraBoxRefs: data.get('extra-box-refs'),
    });
  }
}

/**
 * The set of parameters and limits override during simulation. If this set of
 * parameters is present, then evaluation parameters may differ from standard
 * evaluation in certain ways.
 */
export class SimulationEvalOverrides
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * If true, transactions without signatures are allowed and simulated as if they
   * were properly signed.
   */
  public allowEmptySignatures?: boolean;

  /**
   * If true, allows access to unnamed resources during simulation.
   */
  public allowUnnamedResources?: boolean;

  /**
   * The extra opcode budget added to each transaction group during simulation
   */
  public extraOpcodeBudget?: number;

  /**
   * The maximum log calls one can make during simulation
   */
  public maxLogCalls?: number;

  /**
   * The maximum byte number to log during simulation
   */
  public maxLogSize?: number;

  /**
   * Creates a new `SimulationEvalOverrides` object.
   * @param allowEmptySignatures - If true, transactions without signatures are allowed and simulated as if they
   * were properly signed.
   * @param allowUnnamedResources - If true, allows access to unnamed resources during simulation.
   * @param extraOpcodeBudget - The extra opcode budget added to each transaction group during simulation
   * @param maxLogCalls - The maximum log calls one can make during simulation
   * @param maxLogSize - The maximum byte number to log during simulation
   */
  constructor({
    allowEmptySignatures,
    allowUnnamedResources,
    extraOpcodeBudget,
    maxLogCalls,
    maxLogSize,
  }: {
    allowEmptySignatures?: boolean;
    allowUnnamedResources?: boolean;
    extraOpcodeBudget?: number | bigint;
    maxLogCalls?: number | bigint;
    maxLogSize?: number | bigint;
  }) {
    this.allowEmptySignatures = allowEmptySignatures;
    this.allowUnnamedResources = allowUnnamedResources;
    this.extraOpcodeBudget =
      typeof extraOpcodeBudget === 'undefined'
        ? undefined
        : ensureSafeInteger(extraOpcodeBudget);
    this.maxLogCalls =
      typeof maxLogCalls === 'undefined'
        ? undefined
        : ensureSafeInteger(maxLogCalls);
    this.maxLogSize =
      typeof maxLogSize === 'undefined'
        ? undefined
        : ensureSafeInteger(maxLogSize);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([]);
    if (this.allowEmptySignatures) {
      data.set('allow-empty-signatures', this.allowEmptySignatures);
    }
    if (this.allowUnnamedResources) {
      data.set('allow-unnamed-resources', this.allowUnnamedResources);
    }
    if (this.extraOpcodeBudget) {
      data.set('extra-opcode-budget', this.extraOpcodeBudget);
    }
    if (this.maxLogCalls) {
      data.set('max-log-calls', this.maxLogCalls);
    }
    if (this.maxLogSize) {
      data.set('max-log-size', this.maxLogSize);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    if (this.allowEmptySignatures) {
      obj['allow-empty-signatures'] = this.allowEmptySignatures;
    }
    if (this.allowUnnamedResources) {
      obj['allow-unnamed-resources'] = this.allowUnnamedResources;
    }
    if (this.extraOpcodeBudget) {
      obj['extra-opcode-budget'] = this.extraOpcodeBudget;
    }
    if (this.maxLogCalls) {
      obj['max-log-calls'] = this.maxLogCalls;
    }
    if (this.maxLogSize) {
      obj['max-log-size'] = this.maxLogSize;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulationEvalOverrides {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded SimulationEvalOverrides: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulationEvalOverrides({
      allowEmptySignatures: data['allow-empty-signatures'],
      allowUnnamedResources: data['allow-unnamed-resources'],
      extraOpcodeBudget: data['extra-opcode-budget'],
      maxLogCalls: data['max-log-calls'],
      maxLogSize: data['max-log-size'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulationEvalOverrides {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulationEvalOverrides({
      allowEmptySignatures: data.get('allow-empty-signatures'),
      allowUnnamedResources: data.get('allow-unnamed-resources'),
      extraOpcodeBudget: data.get('extra-opcode-budget'),
      maxLogCalls: data.get('max-log-calls'),
      maxLogSize: data.get('max-log-size'),
    });
  }
}

/**
 * The set of trace information and effect from evaluating a single opcode.
 */
export class SimulationOpcodeTraceUnit
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * The program counter of the current opcode being evaluated.
   */
  public pc: number;

  /**
   * The writes into scratch slots.
   */
  public scratchChanges?: ScratchChange[];

  /**
   * The indexes of the traces for inner transactions spawned by this opcode, if any.
   */
  public spawnedInners?: number[];

  /**
   * The values added by this opcode to the stack.
   */
  public stackAdditions?: AvmValue[];

  /**
   * The number of deleted stack values by this opcode.
   */
  public stackPopCount?: number;

  /**
   * The operations against the current application's states.
   */
  public stateChanges?: ApplicationStateOperation[];

  /**
   * Creates a new `SimulationOpcodeTraceUnit` object.
   * @param pc - The program counter of the current opcode being evaluated.
   * @param scratchChanges - The writes into scratch slots.
   * @param spawnedInners - The indexes of the traces for inner transactions spawned by this opcode, if any.
   * @param stackAdditions - The values added by this opcode to the stack.
   * @param stackPopCount - The number of deleted stack values by this opcode.
   * @param stateChanges - The operations against the current application's states.
   */
  constructor({
    pc,
    scratchChanges,
    spawnedInners,
    stackAdditions,
    stackPopCount,
    stateChanges,
  }: {
    pc: number | bigint;
    scratchChanges?: ScratchChange[];
    spawnedInners?: (number | bigint)[];
    stackAdditions?: AvmValue[];
    stackPopCount?: number | bigint;
    stateChanges?: ApplicationStateOperation[];
  }) {
    this.pc = ensureSafeInteger(pc);
    this.scratchChanges = scratchChanges;
    this.spawnedInners =
      typeof spawnedInners === 'undefined'
        ? undefined
        : spawnedInners.map(ensureSafeInteger);
    this.stackAdditions = stackAdditions;
    this.stackPopCount =
      typeof stackPopCount === 'undefined'
        ? undefined
        : ensureSafeInteger(stackPopCount);
    this.stateChanges = stateChanges;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([['pc', this.pc]]);
    if (this.scratchChanges && this.scratchChanges.length) {
      data.set(
        'scratch-changes',
        this.scratchChanges.map((v) => v.msgpackPrepare())
      );
    }
    if (this.spawnedInners && this.spawnedInners.length) {
      data.set('spawned-inners', this.spawnedInners);
    }
    if (this.stackAdditions && this.stackAdditions.length) {
      data.set(
        'stack-additions',
        this.stackAdditions.map((v) => v.msgpackPrepare())
      );
    }
    if (this.stackPopCount) {
      data.set('stack-pop-count', this.stackPopCount);
    }
    if (this.stateChanges && this.stateChanges.length) {
      data.set(
        'state-changes',
        this.stateChanges.map((v) => v.msgpackPrepare())
      );
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['pc'] = this.pc;
    if (this.scratchChanges && this.scratchChanges.length) {
      obj['scratch-changes'] = this.scratchChanges.map((v) => v.jsonPrepare());
    }
    if (this.spawnedInners && this.spawnedInners.length) {
      obj['spawned-inners'] = this.spawnedInners;
    }
    if (this.stackAdditions && this.stackAdditions.length) {
      obj['stack-additions'] = this.stackAdditions.map((v) => v.jsonPrepare());
    }
    if (this.stackPopCount) {
      obj['stack-pop-count'] = this.stackPopCount;
    }
    if (this.stateChanges && this.stateChanges.length) {
      obj['state-changes'] = this.stateChanges.map((v) => v.jsonPrepare());
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulationOpcodeTraceUnit {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded SimulationOpcodeTraceUnit: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulationOpcodeTraceUnit({
      pc: data['pc'] ?? 0,
      scratchChanges:
        typeof data['scratch-changes'] !== 'undefined'
          ? data['scratch-changes'].map(ScratchChange.fromDecodedJSON)
          : undefined,
      spawnedInners: data['spawned-inners'],
      stackAdditions:
        typeof data['stack-additions'] !== 'undefined'
          ? data['stack-additions'].map(AvmValue.fromDecodedJSON)
          : undefined,
      stackPopCount: data['stack-pop-count'],
      stateChanges:
        typeof data['state-changes'] !== 'undefined'
          ? data['state-changes'].map(ApplicationStateOperation.fromDecodedJSON)
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulationOpcodeTraceUnit {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulationOpcodeTraceUnit({
      pc: data.get('pc') ?? 0,
      scratchChanges:
        typeof data.get('scratch-changes') !== 'undefined'
          ? data.get('scratch-changes').map(ScratchChange.fromDecodedMsgpack)
          : undefined,
      spawnedInners: data.get('spawned-inners'),
      stackAdditions:
        typeof data.get('stack-additions') !== 'undefined'
          ? data.get('stack-additions').map(AvmValue.fromDecodedMsgpack)
          : undefined,
      stackPopCount: data.get('stack-pop-count'),
      stateChanges:
        typeof data.get('state-changes') !== 'undefined'
          ? data
              .get('state-changes')
              .map(ApplicationStateOperation.fromDecodedMsgpack)
          : undefined,
    });
  }
}

/**
 * The execution trace of calling an app or a logic sig, containing the inner app
 * call trace in a recursive way.
 */
export class SimulationTransactionExecTrace
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * SHA512_256 hash digest of the approval program executed in transaction.
   */
  public approvalProgramHash?: Uint8Array;

  /**
   * Program trace that contains a trace of opcode effects in an approval program.
   */
  public approvalProgramTrace?: SimulationOpcodeTraceUnit[];

  /**
   * SHA512_256 hash digest of the clear state program executed in transaction.
   */
  public clearStateProgramHash?: Uint8Array;

  /**
   * Program trace that contains a trace of opcode effects in a clear state program.
   */
  public clearStateProgramTrace?: SimulationOpcodeTraceUnit[];

  /**
   * If true, indicates that the clear state program failed and any persistent state
   * changes it produced should be reverted once the program exits.
   */
  public clearStateRollback?: boolean;

  /**
   * The error message explaining why the clear state program failed. This field will
   * only be populated if clear-state-rollback is true and the failure was due to an
   * execution error.
   */
  public clearStateRollbackError?: string;

  /**
   * An array of SimulationTransactionExecTrace representing the execution trace of
   * any inner transactions executed.
   */
  public innerTrace?: SimulationTransactionExecTrace[];

  /**
   * SHA512_256 hash digest of the logic sig executed in transaction.
   */
  public logicSigHash?: Uint8Array;

  /**
   * Program trace that contains a trace of opcode effects in a logic sig.
   */
  public logicSigTrace?: SimulationOpcodeTraceUnit[];

  /**
   * Creates a new `SimulationTransactionExecTrace` object.
   * @param approvalProgramHash - SHA512_256 hash digest of the approval program executed in transaction.
   * @param approvalProgramTrace - Program trace that contains a trace of opcode effects in an approval program.
   * @param clearStateProgramHash - SHA512_256 hash digest of the clear state program executed in transaction.
   * @param clearStateProgramTrace - Program trace that contains a trace of opcode effects in a clear state program.
   * @param clearStateRollback - If true, indicates that the clear state program failed and any persistent state
   * changes it produced should be reverted once the program exits.
   * @param clearStateRollbackError - The error message explaining why the clear state program failed. This field will
   * only be populated if clear-state-rollback is true and the failure was due to an
   * execution error.
   * @param innerTrace - An array of SimulationTransactionExecTrace representing the execution trace of
   * any inner transactions executed.
   * @param logicSigHash - SHA512_256 hash digest of the logic sig executed in transaction.
   * @param logicSigTrace - Program trace that contains a trace of opcode effects in a logic sig.
   */
  constructor({
    approvalProgramHash,
    approvalProgramTrace,
    clearStateProgramHash,
    clearStateProgramTrace,
    clearStateRollback,
    clearStateRollbackError,
    innerTrace,
    logicSigHash,
    logicSigTrace,
  }: {
    approvalProgramHash?: string | Uint8Array;
    approvalProgramTrace?: SimulationOpcodeTraceUnit[];
    clearStateProgramHash?: string | Uint8Array;
    clearStateProgramTrace?: SimulationOpcodeTraceUnit[];
    clearStateRollback?: boolean;
    clearStateRollbackError?: string;
    innerTrace?: SimulationTransactionExecTrace[];
    logicSigHash?: string | Uint8Array;
    logicSigTrace?: SimulationOpcodeTraceUnit[];
  }) {
    this.approvalProgramHash =
      typeof approvalProgramHash === 'string'
        ? base64ToBytes(approvalProgramHash)
        : approvalProgramHash;
    this.approvalProgramTrace = approvalProgramTrace;
    this.clearStateProgramHash =
      typeof clearStateProgramHash === 'string'
        ? base64ToBytes(clearStateProgramHash)
        : clearStateProgramHash;
    this.clearStateProgramTrace = clearStateProgramTrace;
    this.clearStateRollback = clearStateRollback;
    this.clearStateRollbackError = clearStateRollbackError;
    this.innerTrace = innerTrace;
    this.logicSigHash =
      typeof logicSigHash === 'string'
        ? base64ToBytes(logicSigHash)
        : logicSigHash;
    this.logicSigTrace = logicSigTrace;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([]);
    if (this.approvalProgramHash) {
      data.set('approval-program-hash', this.approvalProgramHash);
    }
    if (this.approvalProgramTrace && this.approvalProgramTrace.length) {
      data.set(
        'approval-program-trace',
        this.approvalProgramTrace.map((v) => v.msgpackPrepare())
      );
    }
    if (this.clearStateProgramHash) {
      data.set('clear-state-program-hash', this.clearStateProgramHash);
    }
    if (this.clearStateProgramTrace && this.clearStateProgramTrace.length) {
      data.set(
        'clear-state-program-trace',
        this.clearStateProgramTrace.map((v) => v.msgpackPrepare())
      );
    }
    if (this.clearStateRollback) {
      data.set('clear-state-rollback', this.clearStateRollback);
    }
    if (this.clearStateRollbackError) {
      data.set('clear-state-rollback-error', this.clearStateRollbackError);
    }
    if (this.innerTrace && this.innerTrace.length) {
      data.set(
        'inner-trace',
        this.innerTrace.map((v) => v.msgpackPrepare())
      );
    }
    if (this.logicSigHash) {
      data.set('logic-sig-hash', this.logicSigHash);
    }
    if (this.logicSigTrace && this.logicSigTrace.length) {
      data.set(
        'logic-sig-trace',
        this.logicSigTrace.map((v) => v.msgpackPrepare())
      );
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    if (this.approvalProgramHash) {
      obj['approval-program-hash'] = bytesToBase64(this.approvalProgramHash);
    }
    if (this.approvalProgramTrace && this.approvalProgramTrace.length) {
      obj['approval-program-trace'] = this.approvalProgramTrace.map((v) =>
        v.jsonPrepare()
      );
    }
    if (this.clearStateProgramHash) {
      obj['clear-state-program-hash'] = bytesToBase64(
        this.clearStateProgramHash
      );
    }
    if (this.clearStateProgramTrace && this.clearStateProgramTrace.length) {
      obj['clear-state-program-trace'] = this.clearStateProgramTrace.map((v) =>
        v.jsonPrepare()
      );
    }
    if (this.clearStateRollback) {
      obj['clear-state-rollback'] = this.clearStateRollback;
    }
    if (this.clearStateRollbackError) {
      obj['clear-state-rollback-error'] = this.clearStateRollbackError;
    }
    if (this.innerTrace && this.innerTrace.length) {
      obj['inner-trace'] = this.innerTrace.map((v) => v.jsonPrepare());
    }
    if (this.logicSigHash) {
      obj['logic-sig-hash'] = bytesToBase64(this.logicSigHash);
    }
    if (this.logicSigTrace && this.logicSigTrace.length) {
      obj['logic-sig-trace'] = this.logicSigTrace.map((v) => v.jsonPrepare());
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SimulationTransactionExecTrace {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(
        `Invalid decoded SimulationTransactionExecTrace: ${encoded}`
      );
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SimulationTransactionExecTrace({
      approvalProgramHash: data['approval-program-hash'],
      approvalProgramTrace:
        typeof data['approval-program-trace'] !== 'undefined'
          ? data['approval-program-trace'].map(
              SimulationOpcodeTraceUnit.fromDecodedJSON
            )
          : undefined,
      clearStateProgramHash: data['clear-state-program-hash'],
      clearStateProgramTrace:
        typeof data['clear-state-program-trace'] !== 'undefined'
          ? data['clear-state-program-trace'].map(
              SimulationOpcodeTraceUnit.fromDecodedJSON
            )
          : undefined,
      clearStateRollback: data['clear-state-rollback'],
      clearStateRollbackError: data['clear-state-rollback-error'],
      innerTrace:
        typeof data['inner-trace'] !== 'undefined'
          ? data['inner-trace'].map(
              SimulationTransactionExecTrace.fromDecodedJSON
            )
          : undefined,
      logicSigHash: data['logic-sig-hash'],
      logicSigTrace:
        typeof data['logic-sig-trace'] !== 'undefined'
          ? data['logic-sig-trace'].map(
              SimulationOpcodeTraceUnit.fromDecodedJSON
            )
          : undefined,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SimulationTransactionExecTrace {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulationTransactionExecTrace({
      approvalProgramHash: data.get('approval-program-hash'),
      approvalProgramTrace:
        typeof data.get('approval-program-trace') !== 'undefined'
          ? data
              .get('approval-program-trace')
              .map(SimulationOpcodeTraceUnit.fromDecodedMsgpack)
          : undefined,
      clearStateProgramHash: data.get('clear-state-program-hash'),
      clearStateProgramTrace:
        typeof data.get('clear-state-program-trace') !== 'undefined'
          ? data
              .get('clear-state-program-trace')
              .map(SimulationOpcodeTraceUnit.fromDecodedMsgpack)
          : undefined,
      clearStateRollback: data.get('clear-state-rollback'),
      clearStateRollbackError: data.get('clear-state-rollback-error'),
      innerTrace:
        typeof data.get('inner-trace') !== 'undefined'
          ? data
              .get('inner-trace')
              .map(SimulationTransactionExecTrace.fromDecodedMsgpack)
          : undefined,
      logicSigHash: data.get('logic-sig-hash'),
      logicSigTrace:
        typeof data.get('logic-sig-trace') !== 'undefined'
          ? data
              .get('logic-sig-trace')
              .map(SimulationOpcodeTraceUnit.fromDecodedMsgpack)
          : undefined,
    });
  }
}

/**
 * Represents a state proof and its corresponding message
 */
export class StateProof implements MsgpackEncodable, JSONEncodable {
  /**
   * Represents the message that the state proofs are attesting to.
   */
  public message: StateProofMessage;

  /**
   * The encoded StateProof for the message.
   */
  public stateproof: Uint8Array;

  /**
   * Creates a new `StateProof` object.
   * @param message - Represents the message that the state proofs are attesting to.
   * @param stateproof - The encoded StateProof for the message.
   */
  constructor({
    message,
    stateproof,
  }: {
    message: StateProofMessage;
    stateproof: string | Uint8Array;
  }) {
    this.message = message;
    this.stateproof =
      typeof stateproof === 'string' ? base64ToBytes(stateproof) : stateproof;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['Message', this.message.msgpackPrepare()],
      ['StateProof', this.stateproof],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['Message'] = this.message.jsonPrepare();
    obj['StateProof'] = bytesToBase64(this.stateproof);
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): StateProof {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded StateProof: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new StateProof({
      message: StateProofMessage.fromDecodedJSON(data['Message'] ?? {}),
      stateproof: data['StateProof'] ?? new Uint8Array(),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): StateProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new StateProof({
      message: StateProofMessage.fromDecodedMsgpack(data.get('Message') ?? {}),
      stateproof: data.get('StateProof') ?? new Uint8Array(),
    });
  }
}

/**
 * Represents the message that the state proofs are attesting to.
 */
export class StateProofMessage implements MsgpackEncodable, JSONEncodable {
  /**
   * The vector commitment root on all light block headers within a state proof
   * interval.
   */
  public blockheaderscommitment: Uint8Array;

  /**
   * The first round the message attests to.
   */
  public firstattestedround: bigint;

  /**
   * The last round the message attests to.
   */
  public lastattestedround: bigint;

  /**
   * An integer value representing the natural log of the proven weight with 16 bits
   * of precision. This value would be used to verify the next state proof.
   */
  public lnprovenweight: bigint;

  /**
   * The vector commitment root of the top N accounts to sign the next StateProof.
   */
  public voterscommitment: Uint8Array;

  /**
   * Creates a new `StateProofMessage` object.
   * @param blockheaderscommitment - The vector commitment root on all light block headers within a state proof
   * interval.
   * @param firstattestedround - The first round the message attests to.
   * @param lastattestedround - The last round the message attests to.
   * @param lnprovenweight - An integer value representing the natural log of the proven weight with 16 bits
   * of precision. This value would be used to verify the next state proof.
   * @param voterscommitment - The vector commitment root of the top N accounts to sign the next StateProof.
   */
  constructor({
    blockheaderscommitment,
    firstattestedround,
    lastattestedround,
    lnprovenweight,
    voterscommitment,
  }: {
    blockheaderscommitment: string | Uint8Array;
    firstattestedround: number | bigint;
    lastattestedround: number | bigint;
    lnprovenweight: number | bigint;
    voterscommitment: string | Uint8Array;
  }) {
    this.blockheaderscommitment =
      typeof blockheaderscommitment === 'string'
        ? base64ToBytes(blockheaderscommitment)
        : blockheaderscommitment;
    this.firstattestedround = ensureBigInt(firstattestedround);
    this.lastattestedround = ensureBigInt(lastattestedround);
    this.lnprovenweight = ensureBigInt(lnprovenweight);
    this.voterscommitment =
      typeof voterscommitment === 'string'
        ? base64ToBytes(voterscommitment)
        : voterscommitment;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['BlockHeadersCommitment', this.blockheaderscommitment],
      ['FirstAttestedRound', this.firstattestedround],
      ['LastAttestedRound', this.lastattestedround],
      ['LnProvenWeight', this.lnprovenweight],
      ['VotersCommitment', this.voterscommitment],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['BlockHeadersCommitment'] = bytesToBase64(this.blockheaderscommitment);
    obj['FirstAttestedRound'] = this.firstattestedround;
    obj['LastAttestedRound'] = this.lastattestedround;
    obj['LnProvenWeight'] = this.lnprovenweight;
    obj['VotersCommitment'] = bytesToBase64(this.voterscommitment);
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): StateProofMessage {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded StateProofMessage: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new StateProofMessage({
      blockheaderscommitment:
        data['BlockHeadersCommitment'] ?? new Uint8Array(),
      firstattestedround: data['FirstAttestedRound'] ?? 0,
      lastattestedround: data['LastAttestedRound'] ?? 0,
      lnprovenweight: data['LnProvenWeight'] ?? 0,
      voterscommitment: data['VotersCommitment'] ?? new Uint8Array(),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): StateProofMessage {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new StateProofMessage({
      blockheaderscommitment:
        data.get('BlockHeadersCommitment') ?? new Uint8Array(),
      firstattestedround: data.get('FirstAttestedRound') ?? 0,
      lastattestedround: data.get('LastAttestedRound') ?? 0,
      lnprovenweight: data.get('LnProvenWeight') ?? 0,
      voterscommitment: data.get('VotersCommitment') ?? new Uint8Array(),
    });
  }
}

/**
 * Supply represents the current supply of MicroAlgos in the system.
 */
export class SupplyResponse implements MsgpackEncodable, JSONEncodable {
  /**
   * Round
   */
  public currentRound: bigint;

  /**
   * OnlineMoney
   */
  public onlineMoney: bigint;

  /**
   * TotalMoney
   */
  public totalMoney: bigint;

  /**
   * Creates a new `SupplyResponse` object.
   * @param currentRound - Round
   * @param onlineMoney - OnlineMoney
   * @param totalMoney - TotalMoney
   */
  constructor({
    currentRound,
    onlineMoney,
    totalMoney,
  }: {
    currentRound: number | bigint;
    onlineMoney: number | bigint;
    totalMoney: number | bigint;
  }) {
    this.currentRound = ensureBigInt(currentRound);
    this.onlineMoney = ensureBigInt(onlineMoney);
    this.totalMoney = ensureBigInt(totalMoney);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['current_round', this.currentRound],
      ['online-money', this.onlineMoney],
      ['total-money', this.totalMoney],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['current_round'] = this.currentRound;
    obj['online-money'] = this.onlineMoney;
    obj['total-money'] = this.totalMoney;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): SupplyResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded SupplyResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new SupplyResponse({
      currentRound: data['current_round'] ?? 0,
      onlineMoney: data['online-money'] ?? 0,
      totalMoney: data['total-money'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): SupplyResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SupplyResponse({
      currentRound: data.get('current_round') ?? 0,
      onlineMoney: data.get('online-money') ?? 0,
      totalMoney: data.get('total-money') ?? 0,
    });
  }
}

/**
 * Represents a key-value pair in an application store.
 */
export class TealKeyValue implements MsgpackEncodable, JSONEncodable {
  public key: string;

  /**
   * Represents a TEAL value.
   */
  public value: TealValue;

  /**
   * Creates a new `TealKeyValue` object.
   * @param key -
   * @param value - Represents a TEAL value.
   */
  constructor({ key, value }: { key: string; value: TealValue }) {
    this.key = key;
    this.value = value;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['key', this.key],
      ['value', this.value.msgpackPrepare()],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['key'] = this.key;
    obj['value'] = this.value.jsonPrepare();
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): TealKeyValue {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded TealKeyValue: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new TealKeyValue({
      key: data['key'] ?? '',
      value: TealValue.fromDecodedJSON(data['value'] ?? {}),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): TealKeyValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TealKeyValue({
      key: data.get('key') ?? '',
      value: TealValue.fromDecodedMsgpack(data.get('value') ?? {}),
    });
  }
}

/**
 * Represents a TEAL value.
 */
export class TealValue implements MsgpackEncodable, JSONEncodable {
  /**
   * (tb) bytes value.
   */
  public bytes: string;

  /**
   * (tt) value type. Value `1` refers to **bytes**, value `2` refers to **uint**
   */
  public type: number;

  /**
   * (ui) uint value.
   */
  public uint: bigint;

  /**
   * Creates a new `TealValue` object.
   * @param bytes - (tb) bytes value.
   * @param type - (tt) value type. Value `1` refers to **bytes**, value `2` refers to **uint**
   * @param uint - (ui) uint value.
   */
  constructor({
    bytes,
    type,
    uint,
  }: {
    bytes: string;
    type: number | bigint;
    uint: number | bigint;
  }) {
    this.bytes = bytes;
    this.type = ensureSafeInteger(type);
    this.uint = ensureBigInt(uint);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['bytes', this.bytes],
      ['type', this.type],
      ['uint', this.uint],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['bytes'] = this.bytes;
    obj['type'] = this.type;
    obj['uint'] = this.uint;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): TealValue {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded TealValue: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new TealValue({
      bytes: data['bytes'] ?? '',
      type: data['type'] ?? 0,
      uint: data['uint'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): TealValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TealValue({
      bytes: data.get('bytes') ?? '',
      type: data.get('type') ?? 0,
      uint: data.get('uint') ?? 0,
    });
  }
}

/**
 * Response containing all ledger state deltas for transaction groups, with their
 * associated Ids, in a single round.
 */
export class TransactionGroupLedgerStateDeltasForRoundResponse
  implements MsgpackEncodable, JSONEncodable
{
  public deltas: LedgerStateDeltaForTransactionGroup[];

  /**
   * Creates a new `TransactionGroupLedgerStateDeltasForRoundResponse` object.
   * @param deltas -
   */
  constructor({ deltas }: { deltas: LedgerStateDeltaForTransactionGroup[] }) {
    this.deltas = deltas;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['Deltas', this.deltas.map((v) => v.msgpackPrepare())],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['Deltas'] = this.deltas.map((v) => v.jsonPrepare());
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(
    encoded: unknown
  ): TransactionGroupLedgerStateDeltasForRoundResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(
        `Invalid decoded TransactionGroupLedgerStateDeltasForRoundResponse: ${encoded}`
      );
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new TransactionGroupLedgerStateDeltasForRoundResponse({
      deltas: (data['Deltas'] ?? []).map(
        LedgerStateDeltaForTransactionGroup.fromDecodedJSON
      ),
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(
    data: unknown
  ): TransactionGroupLedgerStateDeltasForRoundResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionGroupLedgerStateDeltasForRoundResponse({
      deltas: (data.get('Deltas') ?? []).map(
        LedgerStateDeltaForTransactionGroup.fromDecodedMsgpack
      ),
    });
  }
}

/**
 * TransactionParams contains the parameters that help a client construct a new
 * transaction.
 */
export class TransactionParametersResponse
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * ConsensusVersion indicates the consensus protocol version
   * as of LastRound.
   */
  public consensusVersion: string;

  /**
   * Fee is the suggested transaction fee
   * Fee is in units of micro-Algos per byte.
   * Fee may fall to zero but transactions must still have a fee of
   * at least MinTxnFee for the current network protocol.
   */
  public fee: bigint;

  /**
   * GenesisHash is the hash of the genesis block.
   */
  public genesisHash: Uint8Array;

  /**
   * GenesisID is an ID listed in the genesis block.
   */
  public genesisId: string;

  /**
   * LastRound indicates the last round seen
   */
  public lastRound: bigint;

  /**
   * The minimum transaction fee (not per byte) required for the
   * txn to validate for the current network protocol.
   */
  public minFee: bigint;

  /**
   * Creates a new `TransactionParametersResponse` object.
   * @param consensusVersion - ConsensusVersion indicates the consensus protocol version
   * as of LastRound.
   * @param fee - Fee is the suggested transaction fee
   * Fee is in units of micro-Algos per byte.
   * Fee may fall to zero but transactions must still have a fee of
   * at least MinTxnFee for the current network protocol.
   * @param genesisHash - GenesisHash is the hash of the genesis block.
   * @param genesisId - GenesisID is an ID listed in the genesis block.
   * @param lastRound - LastRound indicates the last round seen
   * @param minFee - The minimum transaction fee (not per byte) required for the
   * txn to validate for the current network protocol.
   */
  constructor({
    consensusVersion,
    fee,
    genesisHash,
    genesisId,
    lastRound,
    minFee,
  }: {
    consensusVersion: string;
    fee: number | bigint;
    genesisHash: string | Uint8Array;
    genesisId: string;
    lastRound: number | bigint;
    minFee: number | bigint;
  }) {
    this.consensusVersion = consensusVersion;
    this.fee = ensureBigInt(fee);
    this.genesisHash =
      typeof genesisHash === 'string'
        ? base64ToBytes(genesisHash)
        : genesisHash;
    this.genesisId = genesisId;
    this.lastRound = ensureBigInt(lastRound);
    this.minFee = ensureBigInt(minFee);
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['consensus-version', this.consensusVersion],
      ['fee', this.fee],
      ['genesis-hash', this.genesisHash],
      ['genesis-id', this.genesisId],
      ['last-round', this.lastRound],
      ['min-fee', this.minFee],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['consensus-version'] = this.consensusVersion;
    obj['fee'] = this.fee;
    obj['genesis-hash'] = bytesToBase64(this.genesisHash);
    obj['genesis-id'] = this.genesisId;
    obj['last-round'] = this.lastRound;
    obj['min-fee'] = this.minFee;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): TransactionParametersResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(
        `Invalid decoded TransactionParametersResponse: ${encoded}`
      );
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new TransactionParametersResponse({
      consensusVersion: data['consensus-version'] ?? '',
      fee: data['fee'] ?? 0,
      genesisHash: data['genesis-hash'] ?? new Uint8Array(),
      genesisId: data['genesis-id'] ?? '',
      lastRound: data['last-round'] ?? 0,
      minFee: data['min-fee'] ?? 0,
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): TransactionParametersResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionParametersResponse({
      consensusVersion: data.get('consensus-version') ?? '',
      fee: data.get('fee') ?? 0,
      genesisHash: data.get('genesis-hash') ?? new Uint8Array(),
      genesisId: data.get('genesis-id') ?? '',
      lastRound: data.get('last-round') ?? 0,
      minFee: data.get('min-fee') ?? 0,
    });
  }
}

/**
 * Proof of transaction in a block.
 */
export class TransactionProofResponse
  implements MsgpackEncodable, JSONEncodable
{
  /**
   * Index of the transaction in the block's payset.
   */
  public idx: number;

  /**
   * Proof of transaction membership.
   */
  public proof: Uint8Array;

  /**
   * Hash of SignedTxnInBlock for verifying proof.
   */
  public stibhash: Uint8Array;

  /**
   * Represents the depth of the tree that is being proven, i.e. the number of edges
   * from a leaf to the root.
   */
  public treedepth: number;

  /**
   * The type of hash function used to create the proof, must be one of:
   * * sha512_256
   * * sha256
   */
  public hashtype?: string;

  /**
   * Creates a new `TransactionProofResponse` object.
   * @param idx - Index of the transaction in the block's payset.
   * @param proof - Proof of transaction membership.
   * @param stibhash - Hash of SignedTxnInBlock for verifying proof.
   * @param treedepth - Represents the depth of the tree that is being proven, i.e. the number of edges
   * from a leaf to the root.
   * @param hashtype - The type of hash function used to create the proof, must be one of:
   * * sha512_256
   * * sha256
   */
  constructor({
    idx,
    proof,
    stibhash,
    treedepth,
    hashtype,
  }: {
    idx: number | bigint;
    proof: string | Uint8Array;
    stibhash: string | Uint8Array;
    treedepth: number | bigint;
    hashtype?: string;
  }) {
    this.idx = ensureSafeInteger(idx);
    this.proof = typeof proof === 'string' ? base64ToBytes(proof) : proof;
    this.stibhash =
      typeof stibhash === 'string' ? base64ToBytes(stibhash) : stibhash;
    this.treedepth = ensureSafeInteger(treedepth);
    this.hashtype = hashtype;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['idx', this.idx],
      ['proof', this.proof],
      ['stibhash', this.stibhash],
      ['treedepth', this.treedepth],
    ]);
    if (this.hashtype) {
      data.set('hashtype', this.hashtype);
    }
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['idx'] = this.idx;
    obj['proof'] = bytesToBase64(this.proof);
    obj['stibhash'] = bytesToBase64(this.stibhash);
    obj['treedepth'] = this.treedepth;
    if (this.hashtype) {
      obj['hashtype'] = this.hashtype;
    }
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): TransactionProofResponse {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded TransactionProofResponse: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new TransactionProofResponse({
      idx: data['idx'] ?? 0,
      proof: data['proof'] ?? new Uint8Array(),
      stibhash: data['stibhash'] ?? new Uint8Array(),
      treedepth: data['treedepth'] ?? 0,
      hashtype: data['hashtype'],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): TransactionProofResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionProofResponse({
      idx: data.get('idx') ?? 0,
      proof: data.get('proof') ?? new Uint8Array(),
      stibhash: data.get('stibhash') ?? new Uint8Array(),
      treedepth: data.get('treedepth') ?? 0,
      hashtype: data.get('hashtype'),
    });
  }
}

/**
 * algod version information.
 */
export class Version implements MsgpackEncodable, JSONEncodable {
  public build: BuildVersion;

  public genesisHashB64: Uint8Array;

  public genesisId: string;

  public versions: string[];

  /**
   * Creates a new `Version` object.
   * @param build -
   * @param genesisHashB64 -
   * @param genesisId -
   * @param versions -
   */
  constructor({
    build,
    genesisHashB64,
    genesisId,
    versions,
  }: {
    build: BuildVersion;
    genesisHashB64: string | Uint8Array;
    genesisId: string;
    versions: string[];
  }) {
    this.build = build;
    this.genesisHashB64 =
      typeof genesisHashB64 === 'string'
        ? base64ToBytes(genesisHashB64)
        : genesisHashB64;
    this.genesisId = genesisId;
    this.versions = versions;
  }

  msgpackPrepare(): Map<string, MsgpackEncodingData> {
    const data = new Map<string, MsgpackEncodingData>([
      ['build', this.build.msgpackPrepare()],
      ['genesis_hash_b64', this.genesisHashB64],
      ['genesis_id', this.genesisId],
      ['versions', this.versions],
    ]);
    return data;
  }

  jsonPrepare(): Record<string, JSONEncodingData> {
    const obj: Record<string, JSONEncodingData> = {};

    /* eslint-disable dot-notation */
    obj['build'] = this.build.jsonPrepare();
    obj['genesis_hash_b64'] = bytesToBase64(this.genesisHashB64);
    obj['genesis_id'] = this.genesisId;
    obj['versions'] = this.versions;
    /* eslint-enable dot-notation */

    return obj;
  }

  static fromDecodedJSON(encoded: unknown): Version {
    if (encoded === null || typeof encoded !== 'object') {
      throw new Error(`Invalid decoded Version: ${encoded}`);
    }
    const data = encoded as Record<string, any>;
    /* eslint-disable dot-notation */
    return new Version({
      build: BuildVersion.fromDecodedJSON(data['build'] ?? {}),
      genesisHashB64: data['genesis_hash_b64'] ?? new Uint8Array(),
      genesisId: data['genesis_id'] ?? '',
      versions: data['versions'] ?? [],
    });
    /* eslint-enable dot-notation */
  }

  static fromDecodedMsgpack(data: unknown): Version {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Version({
      build: BuildVersion.fromDecodedMsgpack(data.get('build') ?? {}),
      genesisHashB64: data.get('genesis_hash_b64') ?? new Uint8Array(),
      genesisId: data.get('genesis_id') ?? '',
      versions: data.get('versions') ?? [],
    });
  }
}
