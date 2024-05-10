/**
 * NOTICE: This file was generated. Editing this file manually is not recommended.
 */

/* eslint-disable no-use-before-define */
import { ensureBigInt, ensureSafeInteger } from '../../../../utils/utils.js';
import { Encodable, Schema } from '../../../../encoding/encoding.js';
import {
  NamedMapSchema,
  ArraySchema,
  Uint64Schema,
  StringSchema,
  BooleanSchema,
  ByteArraySchema,
} from '../../../../encoding/schema/index.js';
import { base64ToBytes } from '../../../../encoding/binarydata.js';
import BlockHeader, {
  blockHeaderFromEncodingData,
  blockHeaderToEncodingData,
  BLOCK_HEADER_SCHEMA,
} from '../../../../types/blockHeader.js';
import { SignedTransaction } from '../../../../signedTransaction.js';
import { Address } from '../../../../encoding/address.js';
import { UntypedValue } from '../../untypedmodel.js';

/**
 * Account information at a given round.
 * Definition:
 * data/basics/userBalance.go : AccountData
 */
export class Account implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'address',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'amount',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'amount-without-pending-rewards',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'min-balance',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'pending-rewards',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'rewards',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'status',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'total-apps-opted-in',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'total-assets-opted-in',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'total-created-apps',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'total-created-assets',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'apps-local-state',
          valueSchema: new ArraySchema(ApplicationLocalState.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'apps-total-extra-pages',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'apps-total-schema',
          valueSchema: ApplicationStateSchema.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'assets',
          valueSchema: new ArraySchema(AssetHolding.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'auth-addr',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'created-apps',
          valueSchema: new ArraySchema(Application.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'created-assets',
          valueSchema: new ArraySchema(Asset.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'incentive-eligible',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'last-heartbeat',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'last-proposed',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'participation',
          valueSchema: AccountParticipation.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'reward-base',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'sig-type',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'total-box-bytes',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'total-boxes',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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
  public authAddr?: Address;

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
   * Whether or not the account can receive block incentives if its balance is in
   * range at proposal time.
   */
  public incentiveEligible?: boolean;

  /**
   * The round in which this account last went online, or explicitly renewed their
   * online status.
   */
  public lastHeartbeat?: number;

  /**
   * The round in which this account last proposed the block.
   */
  public lastProposed?: number;

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
   * @param incentiveEligible - Whether or not the account can receive block incentives if its balance is in
   * range at proposal time.
   * @param lastHeartbeat - The round in which this account last went online, or explicitly renewed their
   * online status.
   * @param lastProposed - The round in which this account last proposed the block.
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
    incentiveEligible,
    lastHeartbeat,
    lastProposed,
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
    authAddr?: Address | string;
    createdApps?: Application[];
    createdAssets?: Asset[];
    incentiveEligible?: boolean;
    lastHeartbeat?: number | bigint;
    lastProposed?: number | bigint;
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
    this.authAddr =
      typeof authAddr === 'string' ? Address.fromString(authAddr) : authAddr;
    this.createdApps = createdApps;
    this.createdAssets = createdAssets;
    this.incentiveEligible = incentiveEligible;
    this.lastHeartbeat =
      typeof lastHeartbeat === 'undefined'
        ? undefined
        : ensureSafeInteger(lastHeartbeat);
    this.lastProposed =
      typeof lastProposed === 'undefined'
        ? undefined
        : ensureSafeInteger(lastProposed);
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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Account.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
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
        this.appsLocalState.map((v) => v.toEncodingData())
      );
    }
    if (this.appsTotalExtraPages) {
      data.set('apps-total-extra-pages', this.appsTotalExtraPages);
    }
    if (this.appsTotalSchema) {
      data.set('apps-total-schema', this.appsTotalSchema.toEncodingData());
    }
    if (this.assets && this.assets.length) {
      data.set(
        'assets',
        this.assets.map((v) => v.toEncodingData())
      );
    }
    if (this.authAddr) {
      data.set('auth-addr', this.authAddr.toString());
    }
    if (this.createdApps && this.createdApps.length) {
      data.set(
        'created-apps',
        this.createdApps.map((v) => v.toEncodingData())
      );
    }
    if (this.createdAssets && this.createdAssets.length) {
      data.set(
        'created-assets',
        this.createdAssets.map((v) => v.toEncodingData())
      );
    }
    if (this.incentiveEligible) {
      data.set('incentive-eligible', this.incentiveEligible);
    }
    if (this.lastHeartbeat) {
      data.set('last-heartbeat', this.lastHeartbeat);
    }
    if (this.lastProposed) {
      data.set('last-proposed', this.lastProposed);
    }
    if (this.participation) {
      data.set('participation', this.participation.toEncodingData());
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

  static fromEncodingData(data: unknown): Account {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Account({
      address: data.get('address'),
      amount: data.get('amount'),
      amountWithoutPendingRewards: data.get('amount-without-pending-rewards'),
      minBalance: data.get('min-balance'),
      pendingRewards: data.get('pending-rewards'),
      rewards: data.get('rewards'),
      round: data.get('round'),
      status: data.get('status'),
      totalAppsOptedIn: data.get('total-apps-opted-in'),
      totalAssetsOptedIn: data.get('total-assets-opted-in'),
      totalCreatedApps: data.get('total-created-apps'),
      totalCreatedAssets: data.get('total-created-assets'),
      appsLocalState:
        typeof data.get('apps-local-state') !== 'undefined'
          ? data
              .get('apps-local-state')
              .map(ApplicationLocalState.fromEncodingData)
          : undefined,
      appsTotalExtraPages: data.get('apps-total-extra-pages'),
      appsTotalSchema:
        typeof data.get('apps-total-schema') !== 'undefined'
          ? ApplicationStateSchema.fromEncodingData(
              data.get('apps-total-schema')
            )
          : undefined,
      assets:
        typeof data.get('assets') !== 'undefined'
          ? data.get('assets').map(AssetHolding.fromEncodingData)
          : undefined,
      authAddr: data.get('auth-addr'),
      createdApps:
        typeof data.get('created-apps') !== 'undefined'
          ? data.get('created-apps').map(Application.fromEncodingData)
          : undefined,
      createdAssets:
        typeof data.get('created-assets') !== 'undefined'
          ? data.get('created-assets').map(Asset.fromEncodingData)
          : undefined,
      incentiveEligible: data.get('incentive-eligible'),
      lastHeartbeat: data.get('last-heartbeat'),
      lastProposed: data.get('last-proposed'),
      participation:
        typeof data.get('participation') !== 'undefined'
          ? AccountParticipation.fromEncodingData(data.get('participation'))
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
export class AccountApplicationResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'app-local-state',
          valueSchema: ApplicationLocalState.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'created-app',
          valueSchema: ApplicationParams.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AccountApplicationResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['round', this.round]]);
    if (this.appLocalState) {
      data.set('app-local-state', this.appLocalState.toEncodingData());
    }
    if (this.createdApp) {
      data.set('created-app', this.createdApp.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): AccountApplicationResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountApplicationResponse({
      round: data.get('round'),
      appLocalState:
        typeof data.get('app-local-state') !== 'undefined'
          ? ApplicationLocalState.fromEncodingData(data.get('app-local-state'))
          : undefined,
      createdApp:
        typeof data.get('created-app') !== 'undefined'
          ? ApplicationParams.fromEncodingData(data.get('created-app'))
          : undefined,
    });
  }
}

/**
 * AccountAssetHolding describes the account's asset holding and asset parameters
 * (if either exist) for a specific asset ID.
 */
export class AccountAssetHolding implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'asset-holding',
          valueSchema: AssetHolding.encodingSchema,
          required: true,
          omitEmpty: true,
        },
        {
          key: 'asset-params',
          valueSchema: AssetParams.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (asset) Details about the asset held by this account.
   * The raw account uses `AssetHolding` for this type.
   */
  public assetHolding: AssetHolding;

  /**
   * (apar) parameters of the asset held by this account.
   * The raw account uses `AssetParams` for this type.
   */
  public assetParams?: AssetParams;

  /**
   * Creates a new `AccountAssetHolding` object.
   * @param assetHolding - (asset) Details about the asset held by this account.
   * The raw account uses `AssetHolding` for this type.
   * @param assetParams - (apar) parameters of the asset held by this account.
   * The raw account uses `AssetParams` for this type.
   */
  constructor({
    assetHolding,
    assetParams,
  }: {
    assetHolding: AssetHolding;
    assetParams?: AssetParams;
  }) {
    this.assetHolding = assetHolding;
    this.assetParams = assetParams;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AccountAssetHolding.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['asset-holding', this.assetHolding.toEncodingData()],
    ]);
    if (this.assetParams) {
      data.set('asset-params', this.assetParams.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): AccountAssetHolding {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountAssetHolding({
      assetHolding: AssetHolding.fromEncodingData(
        data.get('asset-holding') ?? {}
      ),
      assetParams:
        typeof data.get('asset-params') !== 'undefined'
          ? AssetParams.fromEncodingData(data.get('asset-params'))
          : undefined,
    });
  }
}

/**
 * AccountAssetResponse describes the account's asset holding and asset parameters
 * (if either exist) for a specific asset ID. Asset parameters will only be
 * returned if the provided address is the asset's creator.
 */
export class AccountAssetResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'asset-holding',
          valueSchema: AssetHolding.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'created-asset',
          valueSchema: AssetParams.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AccountAssetResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['round', this.round]]);
    if (this.assetHolding) {
      data.set('asset-holding', this.assetHolding.toEncodingData());
    }
    if (this.createdAsset) {
      data.set('created-asset', this.createdAsset.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): AccountAssetResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountAssetResponse({
      round: data.get('round'),
      assetHolding:
        typeof data.get('asset-holding') !== 'undefined'
          ? AssetHolding.fromEncodingData(data.get('asset-holding'))
          : undefined,
      createdAsset:
        typeof data.get('created-asset') !== 'undefined'
          ? AssetParams.fromEncodingData(data.get('created-asset'))
          : undefined,
    });
  }
}

/**
 * AccountAssetsInformationResponse contains a list of assets held by an account.
 */
export class AccountAssetsInformationResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'asset-holdings',
          valueSchema: new ArraySchema(AccountAssetHolding.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * The round for which this information is relevant.
   */
  public round: number;

  public assetHoldings?: AccountAssetHolding[];

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `AccountAssetsInformationResponse` object.
   * @param round - The round for which this information is relevant.
   * @param assetHoldings -
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    round,
    assetHoldings,
    nextToken,
  }: {
    round: number | bigint;
    assetHoldings?: AccountAssetHolding[];
    nextToken?: string;
  }) {
    this.round = ensureSafeInteger(round);
    this.assetHoldings = assetHoldings;
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AccountAssetsInformationResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['round', this.round]]);
    if (this.assetHoldings && this.assetHoldings.length) {
      data.set(
        'asset-holdings',
        this.assetHoldings.map((v) => v.toEncodingData())
      );
    }
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): AccountAssetsInformationResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountAssetsInformationResponse({
      round: data.get('round'),
      assetHoldings:
        typeof data.get('asset-holdings') !== 'undefined'
          ? data.get('asset-holdings').map(AccountAssetHolding.fromEncodingData)
          : undefined,
      nextToken: data.get('next-token'),
    });
  }
}

/**
 * AccountParticipation describes the parameters used by this account in consensus
 * protocol.
 */
export class AccountParticipation implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'selection-participation-key',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'vote-first-valid',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'vote-key-dilution',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'vote-last-valid',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'vote-participation-key',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'state-proof-key',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AccountParticipation.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
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

  static fromEncodingData(data: unknown): AccountParticipation {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountParticipation({
      selectionParticipationKey: data.get('selection-participation-key'),
      voteFirstValid: data.get('vote-first-valid'),
      voteKeyDilution: data.get('vote-key-dilution'),
      voteLastValid: data.get('vote-last-valid'),
      voteParticipationKey: data.get('vote-participation-key'),
      stateProofKey: data.get('state-proof-key'),
    });
  }
}

/**
 * Application state delta.
 */
export class AccountStateDelta implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'address',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'delta',
          valueSchema: new ArraySchema(EvalDeltaKeyValue.encodingSchema),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AccountStateDelta.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['address', this.address],
      ['delta', this.delta.map((v) => v.toEncodingData())],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): AccountStateDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountStateDelta({
      address: data.get('address'),
      delta: (data.get('delta') ?? []).map(EvalDeltaKeyValue.fromEncodingData),
    });
  }
}

/**
 * The logged messages from an app call along with the app ID and outer transaction
 * ID. Logs appear in the same order that they were emitted.
 */
export class AppCallLogs implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'application-index',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'logs',
          valueSchema: new ArraySchema(new ByteArraySchema()),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'txId',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * The application from which the logs were generated
   */
  public applicationIndex: number;

  /**
   * An array of logs
   */
  public logs: Uint8Array[];

  /**
   * The transaction ID of the outer app call that lead to these logs
   */
  public txid: string;

  /**
   * Creates a new `AppCallLogs` object.
   * @param applicationIndex - The application from which the logs were generated
   * @param logs - An array of logs
   * @param txid - The transaction ID of the outer app call that lead to these logs
   */
  constructor({
    applicationIndex,
    logs,
    txid,
  }: {
    applicationIndex: number | bigint;
    logs: Uint8Array[];
    txid: string;
  }) {
    this.applicationIndex = ensureSafeInteger(applicationIndex);
    this.logs = logs;
    this.txid = txid;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AppCallLogs.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['application-index', this.applicationIndex],
      ['logs', this.logs],
      ['txId', this.txid],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): AppCallLogs {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AppCallLogs({
      applicationIndex: data.get('application-index'),
      logs: data.get('logs'),
      txid: data.get('txId'),
    });
  }
}

/**
 * Application index and its parameters
 */
export class Application implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'params',
          valueSchema: ApplicationParams.encodingSchema,
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Application.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['id', this.id],
      ['params', this.params.toEncodingData()],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): Application {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Application({
      id: data.get('id'),
      params: ApplicationParams.fromEncodingData(data.get('params') ?? {}),
    });
  }
}

/**
 * An application's initial global/local/box states that were accessed during
 * simulation.
 */
export class ApplicationInitialStates implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'app-boxes',
          valueSchema: ApplicationKVStorage.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'app-globals',
          valueSchema: ApplicationKVStorage.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'app-locals',
          valueSchema: new ArraySchema(ApplicationKVStorage.encodingSchema),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationInitialStates.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['id', this.id]]);
    if (this.appBoxes) {
      data.set('app-boxes', this.appBoxes.toEncodingData());
    }
    if (this.appGlobals) {
      data.set('app-globals', this.appGlobals.toEncodingData());
    }
    if (this.appLocals && this.appLocals.length) {
      data.set(
        'app-locals',
        this.appLocals.map((v) => v.toEncodingData())
      );
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationInitialStates {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationInitialStates({
      id: data.get('id'),
      appBoxes:
        typeof data.get('app-boxes') !== 'undefined'
          ? ApplicationKVStorage.fromEncodingData(data.get('app-boxes'))
          : undefined,
      appGlobals:
        typeof data.get('app-globals') !== 'undefined'
          ? ApplicationKVStorage.fromEncodingData(data.get('app-globals'))
          : undefined,
      appLocals:
        typeof data.get('app-locals') !== 'undefined'
          ? data.get('app-locals').map(ApplicationKVStorage.fromEncodingData)
          : undefined,
    });
  }
}

/**
 * An application's global/local/box state.
 */
export class ApplicationKVStorage implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'kvs',
          valueSchema: new ArraySchema(AvmKeyValue.encodingSchema),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'account',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Key-Value pairs representing application states.
   */
  public kvs: AvmKeyValue[];

  /**
   * The address of the account associated with the local state.
   */
  public account?: Address;

  /**
   * Creates a new `ApplicationKVStorage` object.
   * @param kvs - Key-Value pairs representing application states.
   * @param account - The address of the account associated with the local state.
   */
  constructor({
    kvs,
    account,
  }: {
    kvs: AvmKeyValue[];
    account?: Address | string;
  }) {
    this.kvs = kvs;
    this.account =
      typeof account === 'string' ? Address.fromString(account) : account;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationKVStorage.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['kvs', this.kvs.map((v) => v.toEncodingData())],
    ]);
    if (this.account) {
      data.set('account', this.account.toString());
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationKVStorage {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationKVStorage({
      kvs: (data.get('kvs') ?? []).map(AvmKeyValue.fromEncodingData),
      account: data.get('account'),
    });
  }
}

/**
 * References an account's local state for an application.
 */
export class ApplicationLocalReference implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'account',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'app',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Address of the account with the local state.
   */
  public account: Address;

  /**
   * Application ID of the local state application.
   */
  public app: bigint;

  /**
   * Creates a new `ApplicationLocalReference` object.
   * @param account - Address of the account with the local state.
   * @param app - Application ID of the local state application.
   */
  constructor({
    account,
    app,
  }: {
    account: Address | string;
    app: number | bigint;
  }) {
    this.account =
      typeof account === 'string' ? Address.fromString(account) : account;
    this.app = ensureBigInt(app);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationLocalReference.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['account', this.account.toString()],
      ['app', this.app],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationLocalReference {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationLocalReference({
      account: data.get('account'),
      app: data.get('app'),
    });
  }
}

/**
 * Stores local state associated with an application.
 */
export class ApplicationLocalState implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'schema',
          valueSchema: ApplicationStateSchema.encodingSchema,
          required: true,
          omitEmpty: true,
        },
        {
          key: 'key-value',
          valueSchema: new ArraySchema(TealKeyValue.encodingSchema),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationLocalState.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['id', this.id],
      ['schema', this.schema.toEncodingData()],
    ]);
    if (this.keyValue && this.keyValue.length) {
      data.set(
        'key-value',
        this.keyValue.map((v) => v.toEncodingData())
      );
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationLocalState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationLocalState({
      id: data.get('id'),
      schema: ApplicationStateSchema.fromEncodingData(data.get('schema') ?? {}),
      keyValue:
        typeof data.get('key-value') !== 'undefined'
          ? data.get('key-value').map(TealKeyValue.fromEncodingData)
          : undefined,
    });
  }
}

/**
 * Stores the global information associated with an application.
 */
export class ApplicationParams implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'approval-program',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'clear-state-program',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'creator',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'extra-program-pages',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'global-state',
          valueSchema: new ArraySchema(TealKeyValue.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'global-state-schema',
          valueSchema: ApplicationStateSchema.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'local-state-schema',
          valueSchema: ApplicationStateSchema.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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
  public creator: Address;

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
    creator: Address | string;
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
    this.creator =
      typeof creator === 'string' ? Address.fromString(creator) : creator;
    this.extraProgramPages =
      typeof extraProgramPages === 'undefined'
        ? undefined
        : ensureSafeInteger(extraProgramPages);
    this.globalState = globalState;
    this.globalStateSchema = globalStateSchema;
    this.localStateSchema = localStateSchema;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationParams.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['approval-program', this.approvalProgram],
      ['clear-state-program', this.clearStateProgram],
      ['creator', this.creator.toString()],
    ]);
    if (this.extraProgramPages) {
      data.set('extra-program-pages', this.extraProgramPages);
    }
    if (this.globalState && this.globalState.length) {
      data.set(
        'global-state',
        this.globalState.map((v) => v.toEncodingData())
      );
    }
    if (this.globalStateSchema) {
      data.set('global-state-schema', this.globalStateSchema.toEncodingData());
    }
    if (this.localStateSchema) {
      data.set('local-state-schema', this.localStateSchema.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationParams {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationParams({
      approvalProgram: data.get('approval-program'),
      clearStateProgram: data.get('clear-state-program'),
      creator: data.get('creator'),
      extraProgramPages: data.get('extra-program-pages'),
      globalState:
        typeof data.get('global-state') !== 'undefined'
          ? data.get('global-state').map(TealKeyValue.fromEncodingData)
          : undefined,
      globalStateSchema:
        typeof data.get('global-state-schema') !== 'undefined'
          ? ApplicationStateSchema.fromEncodingData(
              data.get('global-state-schema')
            )
          : undefined,
      localStateSchema:
        typeof data.get('local-state-schema') !== 'undefined'
          ? ApplicationStateSchema.fromEncodingData(
              data.get('local-state-schema')
            )
          : undefined,
    });
  }
}

/**
 * An operation against an application's global/local/box state.
 */
export class ApplicationStateOperation implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'app-state-type',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'key',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'operation',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'account',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'new-value',
          valueSchema: AvmValue.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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
  public account?: Address;

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
    account?: Address | string;
    newValue?: AvmValue;
  }) {
    this.appStateType = appStateType;
    this.key = typeof key === 'string' ? base64ToBytes(key) : key;
    this.operation = operation;
    this.account =
      typeof account === 'string' ? Address.fromString(account) : account;
    this.newValue = newValue;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationStateOperation.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['app-state-type', this.appStateType],
      ['key', this.key],
      ['operation', this.operation],
    ]);
    if (this.account) {
      data.set('account', this.account.toString());
    }
    if (this.newValue) {
      data.set('new-value', this.newValue.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationStateOperation {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationStateOperation({
      appStateType: data.get('app-state-type'),
      key: data.get('key'),
      operation: data.get('operation'),
      account: data.get('account'),
      newValue:
        typeof data.get('new-value') !== 'undefined'
          ? AvmValue.fromEncodingData(data.get('new-value'))
          : undefined,
    });
  }
}

/**
 * Specifies maximums on the number of each type that may be stored.
 */
export class ApplicationStateSchema implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'num-byte-slice',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'num-uint',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationStateSchema.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['num-byte-slice', this.numByteSlice],
      ['num-uint', this.numUint],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationStateSchema {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationStateSchema({
      numByteSlice: data.get('num-byte-slice'),
      numUint: data.get('num-uint'),
    });
  }
}

/**
 * Specifies both the unique identifier and the parameters for an asset
 */
export class Asset implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'index',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'params',
          valueSchema: AssetParams.encodingSchema,
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Asset.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['index', this.index],
      ['params', this.params.toEncodingData()],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): Asset {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Asset({
      index: data.get('index'),
      params: AssetParams.fromEncodingData(data.get('params') ?? {}),
    });
  }
}

/**
 * Describes an asset held by an account.
 * Definition:
 * data/basics/userBalance.go : AssetHolding
 */
export class AssetHolding implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'amount',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'asset-id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'is-frozen',
          valueSchema: new BooleanSchema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AssetHolding.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['amount', this.amount],
      ['asset-id', this.assetId],
      ['is-frozen', this.isFrozen],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): AssetHolding {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetHolding({
      amount: data.get('amount'),
      assetId: data.get('asset-id'),
      isFrozen: data.get('is-frozen'),
    });
  }
}

/**
 * References an asset held by an account.
 */
export class AssetHoldingReference implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'account',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'asset',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Address of the account holding the asset.
   */
  public account: Address;

  /**
   * Asset ID of the holding.
   */
  public asset: bigint;

  /**
   * Creates a new `AssetHoldingReference` object.
   * @param account - Address of the account holding the asset.
   * @param asset - Asset ID of the holding.
   */
  constructor({
    account,
    asset,
  }: {
    account: Address | string;
    asset: number | bigint;
  }) {
    this.account =
      typeof account === 'string' ? Address.fromString(account) : account;
    this.asset = ensureBigInt(asset);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AssetHoldingReference.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['account', this.account.toString()],
      ['asset', this.asset],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): AssetHoldingReference {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetHoldingReference({
      account: data.get('account'),
      asset: data.get('asset'),
    });
  }
}

/**
 * AssetParams specifies the parameters for an asset.
 * (apar) when part of an AssetConfig transaction.
 * Definition:
 * data/transactions/asset.go : AssetParams
 */
export class AssetParams implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'creator',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'decimals',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'total',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'clawback',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'default-frozen',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'freeze',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'manager',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'metadata-hash',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'name',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'name-b64',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'reserve',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'unit-name',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'unit-name-b64',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'url',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'url-b64',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AssetParams.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
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

  static fromEncodingData(data: unknown): AssetParams {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetParams({
      creator: data.get('creator'),
      decimals: data.get('decimals'),
      total: data.get('total'),
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
export class AvmKeyValue implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'key',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'value',
          valueSchema: AvmValue.encodingSchema,
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AvmKeyValue.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['key', this.key],
      ['value', this.value.toEncodingData()],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): AvmKeyValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AvmKeyValue({
      key: data.get('key'),
      value: AvmValue.fromEncodingData(data.get('value') ?? {}),
    });
  }
}

/**
 * Represents an AVM value.
 */
export class AvmValue implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'type',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'bytes',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'uint',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AvmValue.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['type', this.type]]);
    if (this.bytes) {
      data.set('bytes', this.bytes);
    }
    if (this.uint) {
      data.set('uint', this.uint);
    }
    return data;
  }

  static fromEncodingData(data: unknown): AvmValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AvmValue({
      type: data.get('type'),
      bytes: data.get('bytes'),
      uint: data.get('uint'),
    });
  }
}

/**
 * Hash of a block header.
 */
export class BlockHashResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'blockHash',
        valueSchema: new StringSchema(),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BlockHashResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['blockHash', this.blockhash]]);
    return data;
  }

  static fromEncodingData(data: unknown): BlockHashResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BlockHashResponse({
      blockhash: data.get('blockHash'),
    });
  }
}

/**
 * All logs emitted in the given round. Each app call, whether top-level or inner,
 * that contains logs results in a separate AppCallLogs object. Therefore there may
 * be multiple AppCallLogs with the same application ID and outer transaction ID in
 * the event of multiple inner app calls to the same app. App calls with no logs
 * are not included in the response. AppCallLogs are returned in the same order
 * that their corresponding app call appeared in the block (pre-order traversal of
 * inner app calls)
 */
export class BlockLogsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'logs',
        valueSchema: new ArraySchema(AppCallLogs.encodingSchema),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

  public logs: AppCallLogs[];

  /**
   * Creates a new `BlockLogsResponse` object.
   * @param logs -
   */
  constructor({ logs }: { logs: AppCallLogs[] }) {
    this.logs = logs;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BlockLogsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['logs', this.logs.map((v) => v.toEncodingData())],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): BlockLogsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BlockLogsResponse({
      logs: (data.get('logs') ?? []).map(AppCallLogs.fromEncodingData),
    });
  }
}

/**
 * Encoded block object.
 */
export class BlockResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'block',
          valueSchema: BLOCK_HEADER_SCHEMA,
          required: true,
          omitEmpty: true,
        },
        {
          key: 'cert',
          valueSchema: UntypedValue.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BlockResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['block', blockHeaderToEncodingData(this.block)],
    ]);
    if (this.cert) {
      data.set('cert', this.cert.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): BlockResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BlockResponse({
      block: blockHeaderFromEncodingData(data.get('block')),
      cert:
        typeof data.get('cert') !== 'undefined'
          ? UntypedValue.fromEncodingData(data.get('cert'))
          : undefined,
    });
  }
}

/**
 * Top level transaction IDs in a block.
 */
export class BlockTxidsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'blockTxids',
        valueSchema: new ArraySchema(new StringSchema()),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BlockTxidsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['blockTxids', this.blocktxids]]);
    return data;
  }

  static fromEncodingData(data: unknown): BlockTxidsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BlockTxidsResponse({
      blocktxids: data.get('blockTxids'),
    });
  }
}

/**
 * Box name and its content.
 */
export class Box implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'name',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'value',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Box.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['name', this.name],
      ['round', this.round],
      ['value', this.value],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): Box {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Box({
      name: data.get('name'),
      round: data.get('round'),
      value: data.get('value'),
    });
  }
}

/**
 * Box descriptor describes a Box.
 */
export class BoxDescriptor implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'name',
        valueSchema: new ByteArraySchema(),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BoxDescriptor.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['name', this.name]]);
    return data;
  }

  static fromEncodingData(data: unknown): BoxDescriptor {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BoxDescriptor({
      name: data.get('name'),
    });
  }
}

/**
 * References a box of an application.
 */
export class BoxReference implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'app',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'name',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BoxReference.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['app', this.app],
      ['name', this.name],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): BoxReference {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BoxReference({
      app: data.get('app'),
      name: data.get('name'),
    });
  }
}

/**
 * Box names of an application
 */
export class BoxesResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'boxes',
        valueSchema: new ArraySchema(BoxDescriptor.encodingSchema),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

  public boxes: BoxDescriptor[];

  /**
   * Creates a new `BoxesResponse` object.
   * @param boxes -
   */
  constructor({ boxes }: { boxes: BoxDescriptor[] }) {
    this.boxes = boxes;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BoxesResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['boxes', this.boxes.map((v) => v.toEncodingData())],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): BoxesResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BoxesResponse({
      boxes: (data.get('boxes') ?? []).map(BoxDescriptor.fromEncodingData),
    });
  }
}

export class BuildVersion implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'branch',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'build_number',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'channel',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'commit_hash',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'major',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'minor',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BuildVersion.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['branch', this.branch],
      ['build_number', this.buildNumber],
      ['channel', this.channel],
      ['commit_hash', this.commitHash],
      ['major', this.major],
      ['minor', this.minor],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): BuildVersion {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BuildVersion({
      branch: data.get('branch'),
      buildNumber: data.get('build_number'),
      channel: data.get('channel'),
      commitHash: data.get('commit_hash'),
      major: data.get('major'),
      minor: data.get('minor'),
    });
  }
}

/**
 * Teal compile Result
 */
export class CompileResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'hash',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'result',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'sourcemap',
          valueSchema: UntypedValue.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return CompileResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['hash', this.hash],
      ['result', this.result],
    ]);
    if (this.sourcemap) {
      data.set('sourcemap', this.sourcemap.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): CompileResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new CompileResponse({
      hash: data.get('hash'),
      result: data.get('result'),
      sourcemap:
        typeof data.get('sourcemap') !== 'undefined'
          ? UntypedValue.fromEncodingData(data.get('sourcemap'))
          : undefined,
    });
  }
}

/**
 * Teal disassembly Result
 */
export class DisassembleResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'result',
        valueSchema: new StringSchema(),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return DisassembleResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['result', this.result]]);
    return data;
  }

  static fromEncodingData(data: unknown): DisassembleResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DisassembleResponse({
      result: data.get('result'),
    });
  }
}

/**
 * Request data type for dryrun endpoint. Given the Transactions and simulated
 * ledger state upload, run TEAL scripts and return debugging information.
 */
export class DryrunRequest implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'accounts',
          valueSchema: new ArraySchema(Account.encodingSchema),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'apps',
          valueSchema: new ArraySchema(Application.encodingSchema),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'latest-timestamp',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'protocol-version',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'sources',
          valueSchema: new ArraySchema(DryrunSource.encodingSchema),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'txns',
          valueSchema: new ArraySchema(SignedTransaction.encodingSchema),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return DryrunRequest.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['accounts', this.accounts.map((v) => v.toEncodingData())],
      ['apps', this.apps.map((v) => v.toEncodingData())],
      ['latest-timestamp', this.latestTimestamp],
      ['protocol-version', this.protocolVersion],
      ['round', this.round],
      ['sources', this.sources.map((v) => v.toEncodingData())],
      ['txns', this.txns.map((v) => v.toEncodingData())],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): DryrunRequest {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunRequest({
      accounts: (data.get('accounts') ?? []).map(Account.fromEncodingData),
      apps: (data.get('apps') ?? []).map(Application.fromEncodingData),
      latestTimestamp: data.get('latest-timestamp'),
      protocolVersion: data.get('protocol-version'),
      round: data.get('round'),
      sources: (data.get('sources') ?? []).map(DryrunSource.fromEncodingData),
      txns: (data.get('txns') ?? []).map(SignedTransaction.fromEncodingData),
    });
  }
}

/**
 * DryrunResponse contains per-txn debug information from a dryrun.
 */
export class DryrunResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'error',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'protocol-version',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'txns',
          valueSchema: new ArraySchema(DryrunTxnResult.encodingSchema),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return DryrunResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['error', this.error],
      ['protocol-version', this.protocolVersion],
      ['txns', this.txns.map((v) => v.toEncodingData())],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): DryrunResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunResponse({
      error: data.get('error'),
      protocolVersion: data.get('protocol-version'),
      txns: (data.get('txns') ?? []).map(DryrunTxnResult.fromEncodingData),
    });
  }
}

/**
 * DryrunSource is TEAL source text that gets uploaded, compiled, and inserted into
 * transactions or application state.
 */
export class DryrunSource implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'app-index',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'field-name',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'source',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'txn-index',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return DryrunSource.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['app-index', this.appIndex],
      ['field-name', this.fieldName],
      ['source', this.source],
      ['txn-index', this.txnIndex],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): DryrunSource {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunSource({
      appIndex: data.get('app-index'),
      fieldName: data.get('field-name'),
      source: data.get('source'),
      txnIndex: data.get('txn-index'),
    });
  }
}

/**
 * Stores the TEAL eval step data
 */
export class DryrunState implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'line',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'pc',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'stack',
          valueSchema: new ArraySchema(TealValue.encodingSchema),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'error',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'scratch',
          valueSchema: new ArraySchema(TealValue.encodingSchema),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return DryrunState.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['line', this.line],
      ['pc', this.pc],
      ['stack', this.stack.map((v) => v.toEncodingData())],
    ]);
    if (this.error) {
      data.set('error', this.error);
    }
    if (this.scratch && this.scratch.length) {
      data.set(
        'scratch',
        this.scratch.map((v) => v.toEncodingData())
      );
    }
    return data;
  }

  static fromEncodingData(data: unknown): DryrunState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunState({
      line: data.get('line'),
      pc: data.get('pc'),
      stack: (data.get('stack') ?? []).map(TealValue.fromEncodingData),
      error: data.get('error'),
      scratch:
        typeof data.get('scratch') !== 'undefined'
          ? data.get('scratch').map(TealValue.fromEncodingData)
          : undefined,
    });
  }
}

/**
 * DryrunTxnResult contains any LogicSig or ApplicationCall program debug
 * information and state updates from a dryrun.
 */
export class DryrunTxnResult implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'disassembly',
          valueSchema: new ArraySchema(new StringSchema()),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'app-call-messages',
          valueSchema: new ArraySchema(new StringSchema()),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'app-call-trace',
          valueSchema: new ArraySchema(DryrunState.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'budget-added',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'budget-consumed',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'global-delta',
          valueSchema: new ArraySchema(EvalDeltaKeyValue.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'local-deltas',
          valueSchema: new ArraySchema(AccountStateDelta.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'logic-sig-disassembly',
          valueSchema: new ArraySchema(new StringSchema()),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'logic-sig-messages',
          valueSchema: new ArraySchema(new StringSchema()),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'logic-sig-trace',
          valueSchema: new ArraySchema(DryrunState.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'logs',
          valueSchema: new ArraySchema(new ByteArraySchema()),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return DryrunTxnResult.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['disassembly', this.disassembly]]);
    if (this.appCallMessages && this.appCallMessages.length) {
      data.set('app-call-messages', this.appCallMessages);
    }
    if (this.appCallTrace && this.appCallTrace.length) {
      data.set(
        'app-call-trace',
        this.appCallTrace.map((v) => v.toEncodingData())
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
        this.globalDelta.map((v) => v.toEncodingData())
      );
    }
    if (this.localDeltas && this.localDeltas.length) {
      data.set(
        'local-deltas',
        this.localDeltas.map((v) => v.toEncodingData())
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
        this.logicSigTrace.map((v) => v.toEncodingData())
      );
    }
    if (this.logs && this.logs.length) {
      data.set('logs', this.logs);
    }
    return data;
  }

  static fromEncodingData(data: unknown): DryrunTxnResult {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new DryrunTxnResult({
      disassembly: data.get('disassembly'),
      appCallMessages: data.get('app-call-messages'),
      appCallTrace:
        typeof data.get('app-call-trace') !== 'undefined'
          ? data.get('app-call-trace').map(DryrunState.fromEncodingData)
          : undefined,
      budgetAdded: data.get('budget-added'),
      budgetConsumed: data.get('budget-consumed'),
      globalDelta:
        typeof data.get('global-delta') !== 'undefined'
          ? data.get('global-delta').map(EvalDeltaKeyValue.fromEncodingData)
          : undefined,
      localDeltas:
        typeof data.get('local-deltas') !== 'undefined'
          ? data.get('local-deltas').map(AccountStateDelta.fromEncodingData)
          : undefined,
      logicSigDisassembly: data.get('logic-sig-disassembly'),
      logicSigMessages: data.get('logic-sig-messages'),
      logicSigTrace:
        typeof data.get('logic-sig-trace') !== 'undefined'
          ? data.get('logic-sig-trace').map(DryrunState.fromEncodingData)
          : undefined,
      logs: data.get('logs'),
    });
  }
}

/**
 * An error response with optional data field.
 */
export class ErrorResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'message',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'data',
          valueSchema: UntypedValue.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ErrorResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['message', this.message]]);
    if (this.data) {
      data.set('data', this.data.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): ErrorResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ErrorResponse({
      message: data.get('message'),
      data:
        typeof data.get('data') !== 'undefined'
          ? UntypedValue.fromEncodingData(data.get('data'))
          : undefined,
    });
  }
}

/**
 * Represents a TEAL value delta.
 */
export class EvalDelta implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'action',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'bytes',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'uint',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return EvalDelta.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['action', this.action]]);
    if (this.bytes) {
      data.set('bytes', this.bytes);
    }
    if (this.uint) {
      data.set('uint', this.uint);
    }
    return data;
  }

  static fromEncodingData(data: unknown): EvalDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new EvalDelta({
      action: data.get('action'),
      bytes: data.get('bytes'),
      uint: data.get('uint'),
    });
  }
}

/**
 * Key-value pairs for StateDelta.
 */
export class EvalDeltaKeyValue implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'key',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'value',
          valueSchema: EvalDelta.encodingSchema,
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return EvalDeltaKeyValue.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['key', this.key],
      ['value', this.value.toEncodingData()],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): EvalDeltaKeyValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new EvalDeltaKeyValue({
      key: data.get('key'),
      value: EvalDelta.fromEncodingData(data.get('value') ?? {}),
    });
  }
}

/**
 * Response containing the timestamp offset in seconds
 */
export class GetBlockTimeStampOffsetResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'offset',
        valueSchema: new Uint64Schema(),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return GetBlockTimeStampOffsetResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['offset', this.offset]]);
    return data;
  }

  static fromEncodingData(data: unknown): GetBlockTimeStampOffsetResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new GetBlockTimeStampOffsetResponse({
      offset: data.get('offset'),
    });
  }
}

/**
 * Response containing the ledger's minimum sync round
 */
export class GetSyncRoundResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'round',
        valueSchema: new Uint64Schema(),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return GetSyncRoundResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['round', this.round]]);
    return data;
  }

  static fromEncodingData(data: unknown): GetSyncRoundResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new GetSyncRoundResponse({
      round: data.get('round'),
    });
  }
}

/**
 * A single Delta containing the key, the previous value and the current value for
 * a single round.
 */
export class KvDelta implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'key',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'value',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return KvDelta.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([]);
    if (this.key) {
      data.set('key', this.key);
    }
    if (this.value) {
      data.set('value', this.value);
    }
    return data;
  }

  static fromEncodingData(data: unknown): KvDelta {
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
export class LedgerStateDeltaForTransactionGroup implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'Delta',
          valueSchema: UntypedValue.encodingSchema,
          required: true,
          omitEmpty: true,
        },
        {
          key: 'Ids',
          valueSchema: new ArraySchema(new StringSchema()),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return LedgerStateDeltaForTransactionGroup.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['Delta', this.delta.toEncodingData()],
      ['Ids', this.ids],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): LedgerStateDeltaForTransactionGroup {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new LedgerStateDeltaForTransactionGroup({
      delta: UntypedValue.fromEncodingData(data.get('Delta') ?? {}),
      ids: data.get('Ids'),
    });
  }
}

/**
 * Proof of membership and position of a light block header.
 */
export class LightBlockHeaderProof implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'index',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'proof',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'treedepth',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return LightBlockHeaderProof.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['index', this.index],
      ['proof', this.proof],
      ['treedepth', this.treedepth],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): LightBlockHeaderProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new LightBlockHeaderProof({
      index: data.get('index'),
      proof: data.get('proof'),
      treedepth: data.get('treedepth'),
    });
  }
}

/**
 *
 */
export class NodeStatusResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'catchup-time',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'last-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'last-version',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'next-version',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'next-version-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'next-version-supported',
          valueSchema: new BooleanSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'stopped-at-unsupported-round',
          valueSchema: new BooleanSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'time-since-last-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'catchpoint',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'catchpoint-acquired-blocks',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'catchpoint-processed-accounts',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'catchpoint-processed-kvs',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'catchpoint-total-accounts',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'catchpoint-total-blocks',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'catchpoint-total-kvs',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'catchpoint-verified-accounts',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'catchpoint-verified-kvs',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'last-catchpoint',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'upgrade-delay',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'upgrade-next-protocol-vote-before',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'upgrade-no-votes',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'upgrade-node-vote',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'upgrade-vote-rounds',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'upgrade-votes',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'upgrade-votes-required',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'upgrade-yes-votes',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return NodeStatusResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
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

  static fromEncodingData(data: unknown): NodeStatusResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new NodeStatusResponse({
      catchupTime: data.get('catchup-time'),
      lastRound: data.get('last-round'),
      lastVersion: data.get('last-version'),
      nextVersion: data.get('next-version'),
      nextVersionRound: data.get('next-version-round'),
      nextVersionSupported: data.get('next-version-supported'),
      stoppedAtUnsupportedRound: data.get('stopped-at-unsupported-round'),
      timeSinceLastRound: data.get('time-since-last-round'),
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
export class PendingTransactionResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'pool-error',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'txn',
          valueSchema: SignedTransaction.encodingSchema,
          required: true,
          omitEmpty: true,
        },
        {
          key: 'application-index',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'asset-closing-amount',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'asset-index',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'close-rewards',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'closing-amount',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'confirmed-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'global-state-delta',
          valueSchema: new ArraySchema(EvalDeltaKeyValue.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'inner-txns',
          valueSchema: new ArraySchema(
            PendingTransactionResponse.encodingSchema
          ),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'local-state-delta',
          valueSchema: new ArraySchema(AccountStateDelta.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'logs',
          valueSchema: new ArraySchema(new ByteArraySchema()),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'receiver-rewards',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'sender-rewards',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return PendingTransactionResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['pool-error', this.poolError],
      ['txn', this.txn.toEncodingData()],
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
        this.globalStateDelta.map((v) => v.toEncodingData())
      );
    }
    if (this.innerTxns && this.innerTxns.length) {
      data.set(
        'inner-txns',
        this.innerTxns.map((v) => v.toEncodingData())
      );
    }
    if (this.localStateDelta && this.localStateDelta.length) {
      data.set(
        'local-state-delta',
        this.localStateDelta.map((v) => v.toEncodingData())
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

  static fromEncodingData(data: unknown): PendingTransactionResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new PendingTransactionResponse({
      poolError: data.get('pool-error'),
      txn: SignedTransaction.fromEncodingData(data.get('txn') ?? {}),
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
              .map(EvalDeltaKeyValue.fromEncodingData)
          : undefined,
      innerTxns:
        typeof data.get('inner-txns') !== 'undefined'
          ? data
              .get('inner-txns')
              .map(PendingTransactionResponse.fromEncodingData)
          : undefined,
      localStateDelta:
        typeof data.get('local-state-delta') !== 'undefined'
          ? data
              .get('local-state-delta')
              .map(AccountStateDelta.fromEncodingData)
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
export class PendingTransactionsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'top-transactions',
          valueSchema: new ArraySchema(SignedTransaction.encodingSchema),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'total-transactions',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return PendingTransactionsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['top-transactions', this.topTransactions.map((v) => v.toEncodingData())],
      ['total-transactions', this.totalTransactions],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): PendingTransactionsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new PendingTransactionsResponse({
      topTransactions: (data.get('top-transactions') ?? []).map(
        SignedTransaction.fromEncodingData
      ),
      totalTransactions: data.get('total-transactions'),
    });
  }
}

/**
 * Transaction ID of the submission.
 */
export class PostTransactionsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'txId',
        valueSchema: new StringSchema(),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return PostTransactionsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['txId', this.txid]]);
    return data;
  }

  static fromEncodingData(data: unknown): PostTransactionsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new PostTransactionsResponse({
      txid: data.get('txId'),
    });
  }
}

/**
 * A write operation into a scratch slot.
 */
export class ScratchChange implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'new-value',
          valueSchema: AvmValue.encodingSchema,
          required: true,
          omitEmpty: true,
        },
        {
          key: 'slot',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ScratchChange.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['new-value', this.newValue.toEncodingData()],
      ['slot', this.slot],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): ScratchChange {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ScratchChange({
      newValue: AvmValue.fromEncodingData(data.get('new-value') ?? {}),
      slot: data.get('slot'),
    });
  }
}

/**
 * Initial states of resources that were accessed during simulation.
 */
export class SimulateInitialStates implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'app-initial-states',
        valueSchema: new ArraySchema(ApplicationInitialStates.encodingSchema),
        required: false,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulateInitialStates.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([]);
    if (this.appInitialStates && this.appInitialStates.length) {
      data.set(
        'app-initial-states',
        this.appInitialStates.map((v) => v.toEncodingData())
      );
    }
    return data;
  }

  static fromEncodingData(data: unknown): SimulateInitialStates {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateInitialStates({
      appInitialStates:
        typeof data.get('app-initial-states') !== 'undefined'
          ? data
              .get('app-initial-states')
              .map(ApplicationInitialStates.fromEncodingData)
          : undefined,
    });
  }
}

/**
 * Request type for simulation endpoint.
 */
export class SimulateRequest implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'txn-groups',
          valueSchema: new ArraySchema(
            SimulateRequestTransactionGroup.encodingSchema
          ),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'allow-empty-signatures',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'allow-more-logging',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'allow-unnamed-resources',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'exec-trace-config',
          valueSchema: SimulateTraceConfig.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'extra-opcode-budget',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulateRequest.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['txn-groups', this.txnGroups.map((v) => v.toEncodingData())],
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
      data.set('exec-trace-config', this.execTraceConfig.toEncodingData());
    }
    if (this.extraOpcodeBudget) {
      data.set('extra-opcode-budget', this.extraOpcodeBudget);
    }
    if (this.round) {
      data.set('round', this.round);
    }
    return data;
  }

  static fromEncodingData(data: unknown): SimulateRequest {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateRequest({
      txnGroups: (data.get('txn-groups') ?? []).map(
        SimulateRequestTransactionGroup.fromEncodingData
      ),
      allowEmptySignatures: data.get('allow-empty-signatures'),
      allowMoreLogging: data.get('allow-more-logging'),
      allowUnnamedResources: data.get('allow-unnamed-resources'),
      execTraceConfig:
        typeof data.get('exec-trace-config') !== 'undefined'
          ? SimulateTraceConfig.fromEncodingData(data.get('exec-trace-config'))
          : undefined,
      extraOpcodeBudget: data.get('extra-opcode-budget'),
      round: data.get('round'),
    });
  }
}

/**
 * A transaction group to simulate.
 */
export class SimulateRequestTransactionGroup implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'txns',
        valueSchema: new ArraySchema(SignedTransaction.encodingSchema),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulateRequestTransactionGroup.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['txns', this.txns.map((v) => v.toEncodingData())],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): SimulateRequestTransactionGroup {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateRequestTransactionGroup({
      txns: (data.get('txns') ?? []).map(SignedTransaction.fromEncodingData),
    });
  }
}

/**
 * Result of a transaction group simulation.
 */
export class SimulateResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'last-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'txn-groups',
          valueSchema: new ArraySchema(
            SimulateTransactionGroupResult.encodingSchema
          ),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'version',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'eval-overrides',
          valueSchema: SimulationEvalOverrides.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'exec-trace-config',
          valueSchema: SimulateTraceConfig.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'initial-states',
          valueSchema: SimulateInitialStates.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulateResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['last-round', this.lastRound],
      ['txn-groups', this.txnGroups.map((v) => v.toEncodingData())],
      ['version', this.version],
    ]);
    if (this.evalOverrides) {
      data.set('eval-overrides', this.evalOverrides.toEncodingData());
    }
    if (this.execTraceConfig) {
      data.set('exec-trace-config', this.execTraceConfig.toEncodingData());
    }
    if (this.initialStates) {
      data.set('initial-states', this.initialStates.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): SimulateResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateResponse({
      lastRound: data.get('last-round'),
      txnGroups: (data.get('txn-groups') ?? []).map(
        SimulateTransactionGroupResult.fromEncodingData
      ),
      version: data.get('version'),
      evalOverrides:
        typeof data.get('eval-overrides') !== 'undefined'
          ? SimulationEvalOverrides.fromEncodingData(data.get('eval-overrides'))
          : undefined,
      execTraceConfig:
        typeof data.get('exec-trace-config') !== 'undefined'
          ? SimulateTraceConfig.fromEncodingData(data.get('exec-trace-config'))
          : undefined,
      initialStates:
        typeof data.get('initial-states') !== 'undefined'
          ? SimulateInitialStates.fromEncodingData(data.get('initial-states'))
          : undefined,
    });
  }
}

/**
 * An object that configures simulation execution trace.
 */
export class SimulateTraceConfig implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'enable',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'scratch-change',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'stack-change',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'state-change',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulateTraceConfig.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([]);
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

  static fromEncodingData(data: unknown): SimulateTraceConfig {
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
export class SimulateTransactionGroupResult implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'txn-results',
          valueSchema: new ArraySchema(
            SimulateTransactionResult.encodingSchema
          ),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'app-budget-added',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'app-budget-consumed',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'failed-at',
          valueSchema: new ArraySchema(new Uint64Schema()),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'failure-message',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'unnamed-resources-accessed',
          valueSchema: SimulateUnnamedResourcesAccessed.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulateTransactionGroupResult.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['txn-results', this.txnResults.map((v) => v.toEncodingData())],
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
        this.unnamedResourcesAccessed.toEncodingData()
      );
    }
    return data;
  }

  static fromEncodingData(data: unknown): SimulateTransactionGroupResult {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateTransactionGroupResult({
      txnResults: (data.get('txn-results') ?? []).map(
        SimulateTransactionResult.fromEncodingData
      ),
      appBudgetAdded: data.get('app-budget-added'),
      appBudgetConsumed: data.get('app-budget-consumed'),
      failedAt: data.get('failed-at'),
      failureMessage: data.get('failure-message'),
      unnamedResourcesAccessed:
        typeof data.get('unnamed-resources-accessed') !== 'undefined'
          ? SimulateUnnamedResourcesAccessed.fromEncodingData(
              data.get('unnamed-resources-accessed')
            )
          : undefined,
    });
  }
}

/**
 * Simulation result for an individual transaction
 */
export class SimulateTransactionResult implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'txn-result',
          valueSchema: PendingTransactionResponse.encodingSchema,
          required: true,
          omitEmpty: true,
        },
        {
          key: 'app-budget-consumed',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'exec-trace',
          valueSchema: SimulationTransactionExecTrace.encodingSchema,
          required: false,
          omitEmpty: true,
        },
        {
          key: 'logic-sig-budget-consumed',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'unnamed-resources-accessed',
          valueSchema: SimulateUnnamedResourcesAccessed.encodingSchema,
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulateTransactionResult.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['txn-result', this.txnResult.toEncodingData()],
    ]);
    if (this.appBudgetConsumed) {
      data.set('app-budget-consumed', this.appBudgetConsumed);
    }
    if (this.execTrace) {
      data.set('exec-trace', this.execTrace.toEncodingData());
    }
    if (this.logicSigBudgetConsumed) {
      data.set('logic-sig-budget-consumed', this.logicSigBudgetConsumed);
    }
    if (this.unnamedResourcesAccessed) {
      data.set(
        'unnamed-resources-accessed',
        this.unnamedResourcesAccessed.toEncodingData()
      );
    }
    return data;
  }

  static fromEncodingData(data: unknown): SimulateTransactionResult {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateTransactionResult({
      txnResult: PendingTransactionResponse.fromEncodingData(
        data.get('txn-result') ?? {}
      ),
      appBudgetConsumed: data.get('app-budget-consumed'),
      execTrace:
        typeof data.get('exec-trace') !== 'undefined'
          ? SimulationTransactionExecTrace.fromEncodingData(
              data.get('exec-trace')
            )
          : undefined,
      logicSigBudgetConsumed: data.get('logic-sig-budget-consumed'),
      unnamedResourcesAccessed:
        typeof data.get('unnamed-resources-accessed') !== 'undefined'
          ? SimulateUnnamedResourcesAccessed.fromEncodingData(
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
export class SimulateUnnamedResourcesAccessed implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'accounts',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'app-locals',
          valueSchema: new ArraySchema(
            ApplicationLocalReference.encodingSchema
          ),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'apps',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'asset-holdings',
          valueSchema: new ArraySchema(AssetHoldingReference.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'assets',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'boxes',
          valueSchema: new ArraySchema(BoxReference.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'extra-box-refs',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * The unnamed accounts that were referenced. The order of this array is arbitrary.
   */
  public accounts?: Address[];

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
    accounts?: (Address | string)[];
    appLocals?: ApplicationLocalReference[];
    apps?: (number | bigint)[];
    assetHoldings?: AssetHoldingReference[];
    assets?: (number | bigint)[];
    boxes?: BoxReference[];
    extraBoxRefs?: number | bigint;
  }) {
    this.accounts =
      typeof accounts !== 'undefined'
        ? accounts.map((addr) =>
            typeof addr === 'string' ? Address.fromString(addr) : addr
          )
        : undefined;
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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulateUnnamedResourcesAccessed.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([]);
    if (this.accounts && this.accounts.length) {
      data.set(
        'accounts',
        this.accounts.map((addr) => addr.toString())
      );
    }
    if (this.appLocals && this.appLocals.length) {
      data.set(
        'app-locals',
        this.appLocals.map((v) => v.toEncodingData())
      );
    }
    if (this.apps && this.apps.length) {
      data.set('apps', this.apps);
    }
    if (this.assetHoldings && this.assetHoldings.length) {
      data.set(
        'asset-holdings',
        this.assetHoldings.map((v) => v.toEncodingData())
      );
    }
    if (this.assets && this.assets.length) {
      data.set('assets', this.assets);
    }
    if (this.boxes && this.boxes.length) {
      data.set(
        'boxes',
        this.boxes.map((v) => v.toEncodingData())
      );
    }
    if (this.extraBoxRefs) {
      data.set('extra-box-refs', this.extraBoxRefs);
    }
    return data;
  }

  static fromEncodingData(data: unknown): SimulateUnnamedResourcesAccessed {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulateUnnamedResourcesAccessed({
      accounts: data.get('accounts'),
      appLocals:
        typeof data.get('app-locals') !== 'undefined'
          ? data
              .get('app-locals')
              .map(ApplicationLocalReference.fromEncodingData)
          : undefined,
      apps: data.get('apps'),
      assetHoldings:
        typeof data.get('asset-holdings') !== 'undefined'
          ? data
              .get('asset-holdings')
              .map(AssetHoldingReference.fromEncodingData)
          : undefined,
      assets: data.get('assets'),
      boxes:
        typeof data.get('boxes') !== 'undefined'
          ? data.get('boxes').map(BoxReference.fromEncodingData)
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
export class SimulationEvalOverrides implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'allow-empty-signatures',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'allow-unnamed-resources',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'extra-opcode-budget',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'max-log-calls',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'max-log-size',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulationEvalOverrides.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([]);
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

  static fromEncodingData(data: unknown): SimulationEvalOverrides {
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
export class SimulationOpcodeTraceUnit implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'pc',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'scratch-changes',
          valueSchema: new ArraySchema(ScratchChange.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'spawned-inners',
          valueSchema: new ArraySchema(new Uint64Schema()),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'stack-additions',
          valueSchema: new ArraySchema(AvmValue.encodingSchema),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'stack-pop-count',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'state-changes',
          valueSchema: new ArraySchema(
            ApplicationStateOperation.encodingSchema
          ),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulationOpcodeTraceUnit.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['pc', this.pc]]);
    if (this.scratchChanges && this.scratchChanges.length) {
      data.set(
        'scratch-changes',
        this.scratchChanges.map((v) => v.toEncodingData())
      );
    }
    if (this.spawnedInners && this.spawnedInners.length) {
      data.set('spawned-inners', this.spawnedInners);
    }
    if (this.stackAdditions && this.stackAdditions.length) {
      data.set(
        'stack-additions',
        this.stackAdditions.map((v) => v.toEncodingData())
      );
    }
    if (this.stackPopCount) {
      data.set('stack-pop-count', this.stackPopCount);
    }
    if (this.stateChanges && this.stateChanges.length) {
      data.set(
        'state-changes',
        this.stateChanges.map((v) => v.toEncodingData())
      );
    }
    return data;
  }

  static fromEncodingData(data: unknown): SimulationOpcodeTraceUnit {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulationOpcodeTraceUnit({
      pc: data.get('pc'),
      scratchChanges:
        typeof data.get('scratch-changes') !== 'undefined'
          ? data.get('scratch-changes').map(ScratchChange.fromEncodingData)
          : undefined,
      spawnedInners: data.get('spawned-inners'),
      stackAdditions:
        typeof data.get('stack-additions') !== 'undefined'
          ? data.get('stack-additions').map(AvmValue.fromEncodingData)
          : undefined,
      stackPopCount: data.get('stack-pop-count'),
      stateChanges:
        typeof data.get('state-changes') !== 'undefined'
          ? data
              .get('state-changes')
              .map(ApplicationStateOperation.fromEncodingData)
          : undefined,
    });
  }
}

/**
 * The execution trace of calling an app or a logic sig, containing the inner app
 * call trace in a recursive way.
 */
export class SimulationTransactionExecTrace implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'approval-program-hash',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'approval-program-trace',
          valueSchema: new ArraySchema(
            SimulationOpcodeTraceUnit.encodingSchema
          ),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'clear-state-program-hash',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'clear-state-program-trace',
          valueSchema: new ArraySchema(
            SimulationOpcodeTraceUnit.encodingSchema
          ),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'clear-state-rollback',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'clear-state-rollback-error',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'inner-trace',
          valueSchema: new ArraySchema(
            SimulationTransactionExecTrace.encodingSchema
          ),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'logic-sig-hash',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: true,
        },
        {
          key: 'logic-sig-trace',
          valueSchema: new ArraySchema(
            SimulationOpcodeTraceUnit.encodingSchema
          ),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SimulationTransactionExecTrace.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([]);
    if (this.approvalProgramHash) {
      data.set('approval-program-hash', this.approvalProgramHash);
    }
    if (this.approvalProgramTrace && this.approvalProgramTrace.length) {
      data.set(
        'approval-program-trace',
        this.approvalProgramTrace.map((v) => v.toEncodingData())
      );
    }
    if (this.clearStateProgramHash) {
      data.set('clear-state-program-hash', this.clearStateProgramHash);
    }
    if (this.clearStateProgramTrace && this.clearStateProgramTrace.length) {
      data.set(
        'clear-state-program-trace',
        this.clearStateProgramTrace.map((v) => v.toEncodingData())
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
        this.innerTrace.map((v) => v.toEncodingData())
      );
    }
    if (this.logicSigHash) {
      data.set('logic-sig-hash', this.logicSigHash);
    }
    if (this.logicSigTrace && this.logicSigTrace.length) {
      data.set(
        'logic-sig-trace',
        this.logicSigTrace.map((v) => v.toEncodingData())
      );
    }
    return data;
  }

  static fromEncodingData(data: unknown): SimulationTransactionExecTrace {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SimulationTransactionExecTrace({
      approvalProgramHash: data.get('approval-program-hash'),
      approvalProgramTrace:
        typeof data.get('approval-program-trace') !== 'undefined'
          ? data
              .get('approval-program-trace')
              .map(SimulationOpcodeTraceUnit.fromEncodingData)
          : undefined,
      clearStateProgramHash: data.get('clear-state-program-hash'),
      clearStateProgramTrace:
        typeof data.get('clear-state-program-trace') !== 'undefined'
          ? data
              .get('clear-state-program-trace')
              .map(SimulationOpcodeTraceUnit.fromEncodingData)
          : undefined,
      clearStateRollback: data.get('clear-state-rollback'),
      clearStateRollbackError: data.get('clear-state-rollback-error'),
      innerTrace:
        typeof data.get('inner-trace') !== 'undefined'
          ? data
              .get('inner-trace')
              .map(SimulationTransactionExecTrace.fromEncodingData)
          : undefined,
      logicSigHash: data.get('logic-sig-hash'),
      logicSigTrace:
        typeof data.get('logic-sig-trace') !== 'undefined'
          ? data
              .get('logic-sig-trace')
              .map(SimulationOpcodeTraceUnit.fromEncodingData)
          : undefined,
    });
  }
}

/**
 * Represents a state proof and its corresponding message
 */
export class StateProof implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'Message',
          valueSchema: StateProofMessage.encodingSchema,
          required: true,
          omitEmpty: true,
        },
        {
          key: 'StateProof',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return StateProof.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['Message', this.message.toEncodingData()],
      ['StateProof', this.stateproof],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): StateProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new StateProof({
      message: StateProofMessage.fromEncodingData(data.get('Message') ?? {}),
      stateproof: data.get('StateProof'),
    });
  }
}

/**
 * Represents the message that the state proofs are attesting to.
 */
export class StateProofMessage implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'BlockHeadersCommitment',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'FirstAttestedRound',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'LastAttestedRound',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'LnProvenWeight',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'VotersCommitment',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return StateProofMessage.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['BlockHeadersCommitment', this.blockheaderscommitment],
      ['FirstAttestedRound', this.firstattestedround],
      ['LastAttestedRound', this.lastattestedround],
      ['LnProvenWeight', this.lnprovenweight],
      ['VotersCommitment', this.voterscommitment],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): StateProofMessage {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new StateProofMessage({
      blockheaderscommitment: data.get('BlockHeadersCommitment'),
      firstattestedround: data.get('FirstAttestedRound'),
      lastattestedround: data.get('LastAttestedRound'),
      lnprovenweight: data.get('LnProvenWeight'),
      voterscommitment: data.get('VotersCommitment'),
    });
  }
}

/**
 * Supply represents the current supply of MicroAlgos in the system.
 */
export class SupplyResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'current_round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'online-money',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'total-money',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return SupplyResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['current_round', this.currentRound],
      ['online-money', this.onlineMoney],
      ['total-money', this.totalMoney],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): SupplyResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new SupplyResponse({
      currentRound: data.get('current_round'),
      onlineMoney: data.get('online-money'),
      totalMoney: data.get('total-money'),
    });
  }
}

/**
 * Represents a key-value pair in an application store.
 */
export class TealKeyValue implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'key',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'value',
          valueSchema: TealValue.encodingSchema,
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TealKeyValue.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['key', this.key],
      ['value', this.value.toEncodingData()],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): TealKeyValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TealKeyValue({
      key: data.get('key'),
      value: TealValue.fromEncodingData(data.get('value') ?? {}),
    });
  }
}

/**
 * Represents a TEAL value.
 */
export class TealValue implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'bytes',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'type',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'uint',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TealValue.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['bytes', this.bytes],
      ['type', this.type],
      ['uint', this.uint],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): TealValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TealValue({
      bytes: data.get('bytes'),
      type: data.get('type'),
      uint: data.get('uint'),
    });
  }
}

/**
 * Response containing all ledger state deltas for transaction groups, with their
 * associated Ids, in a single round.
 */
export class TransactionGroupLedgerStateDeltasForRoundResponse
  implements Encodable
{
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'Deltas',
        valueSchema: new ArraySchema(
          LedgerStateDeltaForTransactionGroup.encodingSchema
        ),
        required: true,
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

  public deltas: LedgerStateDeltaForTransactionGroup[];

  /**
   * Creates a new `TransactionGroupLedgerStateDeltasForRoundResponse` object.
   * @param deltas -
   */
  constructor({ deltas }: { deltas: LedgerStateDeltaForTransactionGroup[] }) {
    this.deltas = deltas;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionGroupLedgerStateDeltasForRoundResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['Deltas', this.deltas.map((v) => v.toEncodingData())],
    ]);
    return data;
  }

  static fromEncodingData(
    data: unknown
  ): TransactionGroupLedgerStateDeltasForRoundResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionGroupLedgerStateDeltasForRoundResponse({
      deltas: (data.get('Deltas') ?? []).map(
        LedgerStateDeltaForTransactionGroup.fromEncodingData
      ),
    });
  }
}

/**
 * TransactionParams contains the parameters that help a client construct a new
 * transaction.
 */
export class TransactionParametersResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'consensus-version',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'fee',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'genesis-hash',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'genesis-id',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'last-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'min-fee',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionParametersResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['consensus-version', this.consensusVersion],
      ['fee', this.fee],
      ['genesis-hash', this.genesisHash],
      ['genesis-id', this.genesisId],
      ['last-round', this.lastRound],
      ['min-fee', this.minFee],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): TransactionParametersResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionParametersResponse({
      consensusVersion: data.get('consensus-version'),
      fee: data.get('fee'),
      genesisHash: data.get('genesis-hash'),
      genesisId: data.get('genesis-id'),
      lastRound: data.get('last-round'),
      minFee: data.get('min-fee'),
    });
  }
}

/**
 * Proof of transaction in a block.
 */
export class TransactionProofResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'idx',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'proof',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'stibhash',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'treedepth',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'hashtype',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionProofResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
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

  static fromEncodingData(data: unknown): TransactionProofResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionProofResponse({
      idx: data.get('idx'),
      proof: data.get('proof'),
      stibhash: data.get('stibhash'),
      treedepth: data.get('treedepth'),
      hashtype: data.get('hashtype'),
    });
  }
}

/**
 * algod version information.
 */
export class Version implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'build',
          valueSchema: BuildVersion.encodingSchema,
          required: true,
          omitEmpty: true,
        },
        {
          key: 'genesis_hash_b64',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'genesis_id',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: true,
        },
        {
          key: 'versions',
          valueSchema: new ArraySchema(new StringSchema()),
          required: true,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Version.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['build', this.build.toEncodingData()],
      ['genesis_hash_b64', this.genesisHashB64],
      ['genesis_id', this.genesisId],
      ['versions', this.versions],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): Version {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Version({
      build: BuildVersion.fromEncodingData(data.get('build') ?? {}),
      genesisHashB64: data.get('genesis_hash_b64'),
      genesisId: data.get('genesis_id'),
      versions: data.get('versions'),
    });
  }
}
