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
  OptionalSchema,
} from '../../../../encoding/schema/index.js';
import { base64ToBytes } from '../../../../encoding/binarydata.js';
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'address', valueSchema: new StringSchema(), omitEmpty: true },
        { key: 'amount', valueSchema: new Uint64Schema(), omitEmpty: true },
        {
          key: 'amount-without-pending-rewards',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'min-balance',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'pending-rewards',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        { key: 'rewards', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'round', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'status', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'total-apps-opted-in',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'total-assets-opted-in',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'total-box-bytes',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'total-boxes',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'total-created-apps',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'total-created-assets',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'apps-local-state',
          valueSchema: new OptionalSchema(
            new ArraySchema(ApplicationLocalState.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'apps-total-extra-pages',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'apps-total-schema',
          valueSchema: new OptionalSchema(
            ApplicationStateSchema.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'assets',
          valueSchema: new OptionalSchema(
            new ArraySchema(AssetHolding.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'auth-addr',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'closed-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'created-apps',
          valueSchema: new OptionalSchema(
            new ArraySchema(Application.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'created-assets',
          valueSchema: new OptionalSchema(
            new ArraySchema(Asset.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'created-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'deleted',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'incentive-eligible',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'last-heartbeat',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'last-proposed',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'participation',
          valueSchema: new OptionalSchema(AccountParticipation.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'reward-base',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'sig-type',
          valueSchema: new OptionalSchema(new StringSchema()),
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
   * total number of MicroAlgos in the account
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
  public minBalance: number;

  /**
   * amount of MicroAlgos of pending rewards in this account.
   */
  public pendingRewards: bigint;

  /**
   * total rewards of MicroAlgos the account has received, including pending rewards.
   */
  public rewards: bigint;

  /**
   * The round for which this information is relevant.
   */
  public round: bigint;

  /**
   * voting status of the account's MicroAlgos
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
   * For app-accounts only. The total number of bytes allocated for the keys and
   * values of boxes which belong to the associated application.
   */
  public totalBoxBytes: number;

  /**
   * For app-accounts only. The total number of boxes which belong to the associated
   * application.
   */
  public totalBoxes: number;

  /**
   * The count of all apps (AppParams objects) created by this account.
   */
  public totalCreatedApps: number;

  /**
   * The count of all assets (AssetParams objects) created by this account.
   */
  public totalCreatedAssets: number;

  /**
   * application local data stored in this account.
   * Note the raw object uses `map[int] -> AppLocalState` for this type.
   */
  public appsLocalState?: ApplicationLocalState[];

  /**
   * the sum of all extra application program pages for this account.
   */
  public appsTotalExtraPages?: number;

  /**
   * the sum of all of the local schemas and global schemas in this account.
   * Note: the raw account uses `StateSchema` for this type.
   */
  public appsTotalSchema?: ApplicationStateSchema;

  /**
   * assets held by this account.
   * Note the raw object uses `map[int] -> AssetHolding` for this type.
   */
  public assets?: AssetHolding[];

  /**
   * The address against which signing should be checked. If empty, the address of
   * the current account is used. This field can be updated in any transaction by
   * setting the RekeyTo field.
   */
  public authAddr?: Address;

  /**
   * Round during which this account was most recently closed.
   */
  public closedAtRound?: bigint;

  /**
   * parameters of applications created by this account including app global data.
   * Note: the raw account uses `map[int] -> AppParams` for this type.
   */
  public createdApps?: Application[];

  /**
   * parameters of assets created by this account.
   * Note: the raw account uses `map[int] -> Asset` for this type.
   */
  public createdAssets?: Asset[];

  /**
   * Round during which this account first appeared in a transaction.
   */
  public createdAtRound?: bigint;

  /**
   * Whether or not this account is currently closed.
   */
  public deleted?: boolean;

  /**
   * can the account receive block incentives if its balance is in range at proposal
   * time.
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
   * used as part of the rewards computation. Only applicable to accounts which are
   * participating.
   */
  public rewardBase?: bigint;

  /**
   * the type of signature used by this account, must be one of:
   * * sig
   * * msig
   * * lsig
   * * or null if unknown
   */
  public sigType?: string;

  /**
   * Creates a new `Account` object.
   * @param address - the account public key
   * @param amount - total number of MicroAlgos in the account
   * @param amountWithoutPendingRewards - specifies the amount of MicroAlgos in the account, without the pending rewards.
   * @param minBalance - MicroAlgo balance required by the account.
   * The requirement grows based on asset and application usage.
   * @param pendingRewards - amount of MicroAlgos of pending rewards in this account.
   * @param rewards - total rewards of MicroAlgos the account has received, including pending rewards.
   * @param round - The round for which this information is relevant.
   * @param status - voting status of the account's MicroAlgos
   * * Offline - indicates that the associated account is delegated.
   * * Online - indicates that the associated account used as part of the delegation
   * pool.
   * * NotParticipating - indicates that the associated account is neither a
   * delegator nor a delegate.
   * @param totalAppsOptedIn - The count of all applications that have been opted in, equivalent to the count
   * of application local data (AppLocalState objects) stored in this account.
   * @param totalAssetsOptedIn - The count of all assets that have been opted in, equivalent to the count of
   * AssetHolding objects held by this account.
   * @param totalBoxBytes - For app-accounts only. The total number of bytes allocated for the keys and
   * values of boxes which belong to the associated application.
   * @param totalBoxes - For app-accounts only. The total number of boxes which belong to the associated
   * application.
   * @param totalCreatedApps - The count of all apps (AppParams objects) created by this account.
   * @param totalCreatedAssets - The count of all assets (AssetParams objects) created by this account.
   * @param appsLocalState - application local data stored in this account.
   * Note the raw object uses `map[int] -> AppLocalState` for this type.
   * @param appsTotalExtraPages - the sum of all extra application program pages for this account.
   * @param appsTotalSchema - the sum of all of the local schemas and global schemas in this account.
   * Note: the raw account uses `StateSchema` for this type.
   * @param assets - assets held by this account.
   * Note the raw object uses `map[int] -> AssetHolding` for this type.
   * @param authAddr - The address against which signing should be checked. If empty, the address of
   * the current account is used. This field can be updated in any transaction by
   * setting the RekeyTo field.
   * @param closedAtRound - Round during which this account was most recently closed.
   * @param createdApps - parameters of applications created by this account including app global data.
   * Note: the raw account uses `map[int] -> AppParams` for this type.
   * @param createdAssets - parameters of assets created by this account.
   * Note: the raw account uses `map[int] -> Asset` for this type.
   * @param createdAtRound - Round during which this account first appeared in a transaction.
   * @param deleted - Whether or not this account is currently closed.
   * @param incentiveEligible - can the account receive block incentives if its balance is in range at proposal
   * time.
   * @param lastHeartbeat - The round in which this account last went online, or explicitly renewed their
   * online status.
   * @param lastProposed - The round in which this account last proposed the block.
   * @param participation - AccountParticipation describes the parameters used by this account in consensus
   * protocol.
   * @param rewardBase - used as part of the rewards computation. Only applicable to accounts which are
   * participating.
   * @param sigType - the type of signature used by this account, must be one of:
   * * sig
   * * msig
   * * lsig
   * * or null if unknown
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
    totalBoxBytes,
    totalBoxes,
    totalCreatedApps,
    totalCreatedAssets,
    appsLocalState,
    appsTotalExtraPages,
    appsTotalSchema,
    assets,
    authAddr,
    closedAtRound,
    createdApps,
    createdAssets,
    createdAtRound,
    deleted,
    incentiveEligible,
    lastHeartbeat,
    lastProposed,
    participation,
    rewardBase,
    sigType,
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
    totalBoxBytes: number | bigint;
    totalBoxes: number | bigint;
    totalCreatedApps: number | bigint;
    totalCreatedAssets: number | bigint;
    appsLocalState?: ApplicationLocalState[];
    appsTotalExtraPages?: number | bigint;
    appsTotalSchema?: ApplicationStateSchema;
    assets?: AssetHolding[];
    authAddr?: Address | string;
    closedAtRound?: number | bigint;
    createdApps?: Application[];
    createdAssets?: Asset[];
    createdAtRound?: number | bigint;
    deleted?: boolean;
    incentiveEligible?: boolean;
    lastHeartbeat?: number | bigint;
    lastProposed?: number | bigint;
    participation?: AccountParticipation;
    rewardBase?: number | bigint;
    sigType?: string;
  }) {
    this.address = address;
    this.amount = ensureBigInt(amount);
    this.amountWithoutPendingRewards = ensureBigInt(
      amountWithoutPendingRewards
    );
    this.minBalance = ensureSafeInteger(minBalance);
    this.pendingRewards = ensureBigInt(pendingRewards);
    this.rewards = ensureBigInt(rewards);
    this.round = ensureBigInt(round);
    this.status = status;
    this.totalAppsOptedIn = ensureSafeInteger(totalAppsOptedIn);
    this.totalAssetsOptedIn = ensureSafeInteger(totalAssetsOptedIn);
    this.totalBoxBytes = ensureSafeInteger(totalBoxBytes);
    this.totalBoxes = ensureSafeInteger(totalBoxes);
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
    this.closedAtRound =
      typeof closedAtRound === 'undefined'
        ? undefined
        : ensureBigInt(closedAtRound);
    this.createdApps = createdApps;
    this.createdAssets = createdAssets;
    this.createdAtRound =
      typeof createdAtRound === 'undefined'
        ? undefined
        : ensureBigInt(createdAtRound);
    this.deleted = deleted;
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
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Account.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
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
      ['total-box-bytes', this.totalBoxBytes],
      ['total-boxes', this.totalBoxes],
      ['total-created-apps', this.totalCreatedApps],
      ['total-created-assets', this.totalCreatedAssets],
      [
        'apps-local-state',
        typeof this.appsLocalState !== 'undefined'
          ? this.appsLocalState.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['apps-total-extra-pages', this.appsTotalExtraPages],
      [
        'apps-total-schema',
        typeof this.appsTotalSchema !== 'undefined'
          ? this.appsTotalSchema.toEncodingData()
          : undefined,
      ],
      [
        'assets',
        typeof this.assets !== 'undefined'
          ? this.assets.map((v) => v.toEncodingData())
          : undefined,
      ],
      [
        'auth-addr',
        typeof this.authAddr !== 'undefined'
          ? this.authAddr.toString()
          : undefined,
      ],
      ['closed-at-round', this.closedAtRound],
      [
        'created-apps',
        typeof this.createdApps !== 'undefined'
          ? this.createdApps.map((v) => v.toEncodingData())
          : undefined,
      ],
      [
        'created-assets',
        typeof this.createdAssets !== 'undefined'
          ? this.createdAssets.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['created-at-round', this.createdAtRound],
      ['deleted', this.deleted],
      ['incentive-eligible', this.incentiveEligible],
      ['last-heartbeat', this.lastHeartbeat],
      ['last-proposed', this.lastProposed],
      [
        'participation',
        typeof this.participation !== 'undefined'
          ? this.participation.toEncodingData()
          : undefined,
      ],
      ['reward-base', this.rewardBase],
      ['sig-type', this.sigType],
    ]);
  }

  static fromEncodingData(data: unknown): Account {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded Account: ${data}`);
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
      totalBoxBytes: data.get('total-box-bytes'),
      totalBoxes: data.get('total-boxes'),
      totalCreatedApps: data.get('total-created-apps'),
      totalCreatedAssets: data.get('total-created-assets'),
      appsLocalState:
        typeof data.get('apps-local-state') !== 'undefined'
          ? data
              .get('apps-local-state')
              .map((v: unknown) => ApplicationLocalState.fromEncodingData(v))
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
          ? data
              .get('assets')
              .map((v: unknown) => AssetHolding.fromEncodingData(v))
          : undefined,
      authAddr: data.get('auth-addr'),
      closedAtRound: data.get('closed-at-round'),
      createdApps:
        typeof data.get('created-apps') !== 'undefined'
          ? data
              .get('created-apps')
              .map((v: unknown) => Application.fromEncodingData(v))
          : undefined,
      createdAssets:
        typeof data.get('created-assets') !== 'undefined'
          ? data
              .get('created-assets')
              .map((v: unknown) => Asset.fromEncodingData(v))
          : undefined,
      createdAtRound: data.get('created-at-round'),
      deleted: data.get('deleted'),
      incentiveEligible: data.get('incentive-eligible'),
      lastHeartbeat: data.get('last-heartbeat'),
      lastProposed: data.get('last-proposed'),
      participation:
        typeof data.get('participation') !== 'undefined'
          ? AccountParticipation.fromEncodingData(data.get('participation'))
          : undefined,
      rewardBase: data.get('reward-base'),
      sigType: data.get('sig-type'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'selection-participation-key',
          valueSchema: new ByteArraySchema(),
          omitEmpty: true,
        },
        {
          key: 'vote-first-valid',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'vote-key-dilution',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'vote-last-valid',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'vote-participation-key',
          valueSchema: new ByteArraySchema(),
          omitEmpty: true,
        },
        {
          key: 'state-proof-key',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Selection public key (if any) currently registered for this round.
   */
  public selectionParticipationKey: Uint8Array;

  /**
   * First round for which this participation is valid.
   */
  public voteFirstValid: bigint;

  /**
   * Number of subkeys in each batch of participation keys.
   */
  public voteKeyDilution: bigint;

  /**
   * Last round for which this participation is valid.
   */
  public voteLastValid: bigint;

  /**
   * root participation public key (if any) currently registered for this round.
   */
  public voteParticipationKey: Uint8Array;

  /**
   * Root of the state proof key (if any)
   */
  public stateProofKey?: Uint8Array;

  /**
   * Creates a new `AccountParticipation` object.
   * @param selectionParticipationKey - Selection public key (if any) currently registered for this round.
   * @param voteFirstValid - First round for which this participation is valid.
   * @param voteKeyDilution - Number of subkeys in each batch of participation keys.
   * @param voteLastValid - Last round for which this participation is valid.
   * @param voteParticipationKey - root participation public key (if any) currently registered for this round.
   * @param stateProofKey - Root of the state proof key (if any)
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
    return new Map<string, unknown>([
      ['selection-participation-key', this.selectionParticipationKey],
      ['vote-first-valid', this.voteFirstValid],
      ['vote-key-dilution', this.voteKeyDilution],
      ['vote-last-valid', this.voteLastValid],
      ['vote-participation-key', this.voteParticipationKey],
      ['state-proof-key', this.stateProofKey],
    ]);
  }

  static fromEncodingData(data: unknown): AccountParticipation {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AccountParticipation: ${data}`);
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
 *
 */
export class AccountResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'account',
          valueSchema: Account.encodingSchema,
          omitEmpty: true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Account information at a given round.
   * Definition:
   * data/basics/userBalance.go : AccountData
   */
  public account: Account;

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Creates a new `AccountResponse` object.
   * @param account - Account information at a given round.
   * Definition:
   * data/basics/userBalance.go : AccountData
   * @param currentRound - Round at which the results were computed.
   */
  constructor({
    account,
    currentRound,
  }: {
    account: Account;
    currentRound: number | bigint;
  }) {
    this.account = account;
    this.currentRound = ensureBigInt(currentRound);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AccountResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['account', this.account.toEncodingData()],
      ['current-round', this.currentRound],
    ]);
  }

  static fromEncodingData(data: unknown): AccountResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AccountResponse: ${data}`);
    }
    return new AccountResponse({
      account: Account.fromEncodingData(data.get('account') ?? new Map()),
      currentRound: data.get('current-round'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'address', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'delta',
          valueSchema: new ArraySchema(EvalDeltaKeyValue.encodingSchema),
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
    return new Map<string, unknown>([
      ['address', this.address],
      ['delta', this.delta.map((v) => v.toEncodingData())],
    ]);
  }

  static fromEncodingData(data: unknown): AccountStateDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AccountStateDelta: ${data}`);
    }
    return new AccountStateDelta({
      address: data.get('address'),
      delta: (data.get('delta') ?? []).map((v: unknown) =>
        EvalDeltaKeyValue.fromEncodingData(v)
      ),
    });
  }
}

/**
 *
 */
export class AccountsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'accounts',
          valueSchema: new ArraySchema(Account.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public accounts: Account[];

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `AccountsResponse` object.
   * @param accounts -
   * @param currentRound - Round at which the results were computed.
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    accounts,
    currentRound,
    nextToken,
  }: {
    accounts: Account[];
    currentRound: number | bigint;
    nextToken?: string;
  }) {
    this.accounts = accounts;
    this.currentRound = ensureBigInt(currentRound);
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AccountsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['accounts', this.accounts.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): AccountsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AccountsResponse: ${data}`);
    }
    return new AccountsResponse({
      accounts: (data.get('accounts') ?? []).map((v: unknown) =>
        Account.fromEncodingData(v)
      ),
      currentRound: data.get('current-round'),
      nextToken: data.get('next-token'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'id', valueSchema: new Uint64Schema(), omitEmpty: true },
        {
          key: 'params',
          valueSchema: ApplicationParams.encodingSchema,
          omitEmpty: true,
        },
        {
          key: 'created-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'deleted',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'deleted-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * application index.
   */
  public id: bigint;

  /**
   * application parameters.
   */
  public params: ApplicationParams;

  /**
   * Round when this application was created.
   */
  public createdAtRound?: bigint;

  /**
   * Whether or not this application is currently deleted.
   */
  public deleted?: boolean;

  /**
   * Round when this application was deleted.
   */
  public deletedAtRound?: bigint;

  /**
   * Creates a new `Application` object.
   * @param id - application index.
   * @param params - application parameters.
   * @param createdAtRound - Round when this application was created.
   * @param deleted - Whether or not this application is currently deleted.
   * @param deletedAtRound - Round when this application was deleted.
   */
  constructor({
    id,
    params,
    createdAtRound,
    deleted,
    deletedAtRound,
  }: {
    id: number | bigint;
    params: ApplicationParams;
    createdAtRound?: number | bigint;
    deleted?: boolean;
    deletedAtRound?: number | bigint;
  }) {
    this.id = ensureBigInt(id);
    this.params = params;
    this.createdAtRound =
      typeof createdAtRound === 'undefined'
        ? undefined
        : ensureBigInt(createdAtRound);
    this.deleted = deleted;
    this.deletedAtRound =
      typeof deletedAtRound === 'undefined'
        ? undefined
        : ensureBigInt(deletedAtRound);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Application.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['id', this.id],
      ['params', this.params.toEncodingData()],
      ['created-at-round', this.createdAtRound],
      ['deleted', this.deleted],
      ['deleted-at-round', this.deletedAtRound],
    ]);
  }

  static fromEncodingData(data: unknown): Application {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded Application: ${data}`);
    }
    return new Application({
      id: data.get('id'),
      params: ApplicationParams.fromEncodingData(
        data.get('params') ?? new Map()
      ),
      createdAtRound: data.get('created-at-round'),
      deleted: data.get('deleted'),
      deletedAtRound: data.get('deleted-at-round'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'id', valueSchema: new Uint64Schema(), omitEmpty: true },
        {
          key: 'schema',
          valueSchema: ApplicationStateSchema.encodingSchema,
          omitEmpty: true,
        },
        {
          key: 'closed-out-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'deleted',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'key-value',
          valueSchema: new OptionalSchema(
            new ArraySchema(TealKeyValue.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'opted-in-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
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
   * schema.
   */
  public schema: ApplicationStateSchema;

  /**
   * Round when account closed out of the application.
   */
  public closedOutAtRound?: bigint;

  /**
   * Whether or not the application local state is currently deleted from its
   * account.
   */
  public deleted?: boolean;

  /**
   * storage.
   */
  public keyValue?: TealKeyValue[];

  /**
   * Round when the account opted into the application.
   */
  public optedInAtRound?: bigint;

  /**
   * Creates a new `ApplicationLocalState` object.
   * @param id - The application which this local state is for.
   * @param schema - schema.
   * @param closedOutAtRound - Round when account closed out of the application.
   * @param deleted - Whether or not the application local state is currently deleted from its
   * account.
   * @param keyValue - storage.
   * @param optedInAtRound - Round when the account opted into the application.
   */
  constructor({
    id,
    schema,
    closedOutAtRound,
    deleted,
    keyValue,
    optedInAtRound,
  }: {
    id: number | bigint;
    schema: ApplicationStateSchema;
    closedOutAtRound?: number | bigint;
    deleted?: boolean;
    keyValue?: TealKeyValue[];
    optedInAtRound?: number | bigint;
  }) {
    this.id = ensureBigInt(id);
    this.schema = schema;
    this.closedOutAtRound =
      typeof closedOutAtRound === 'undefined'
        ? undefined
        : ensureBigInt(closedOutAtRound);
    this.deleted = deleted;
    this.keyValue = keyValue;
    this.optedInAtRound =
      typeof optedInAtRound === 'undefined'
        ? undefined
        : ensureBigInt(optedInAtRound);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationLocalState.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['id', this.id],
      ['schema', this.schema.toEncodingData()],
      ['closed-out-at-round', this.closedOutAtRound],
      ['deleted', this.deleted],
      [
        'key-value',
        typeof this.keyValue !== 'undefined'
          ? this.keyValue.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['opted-in-at-round', this.optedInAtRound],
    ]);
  }

  static fromEncodingData(data: unknown): ApplicationLocalState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ApplicationLocalState: ${data}`);
    }
    return new ApplicationLocalState({
      id: data.get('id'),
      schema: ApplicationStateSchema.fromEncodingData(
        data.get('schema') ?? new Map()
      ),
      closedOutAtRound: data.get('closed-out-at-round'),
      deleted: data.get('deleted'),
      keyValue:
        typeof data.get('key-value') !== 'undefined'
          ? data
              .get('key-value')
              .map((v: unknown) => TealKeyValue.fromEncodingData(v))
          : undefined,
      optedInAtRound: data.get('opted-in-at-round'),
    });
  }
}

/**
 *
 */
export class ApplicationLocalStatesResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'apps-local-states',
          valueSchema: new ArraySchema(ApplicationLocalState.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public appsLocalStates: ApplicationLocalState[];

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `ApplicationLocalStatesResponse` object.
   * @param appsLocalStates -
   * @param currentRound - Round at which the results were computed.
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    appsLocalStates,
    currentRound,
    nextToken,
  }: {
    appsLocalStates: ApplicationLocalState[];
    currentRound: number | bigint;
    nextToken?: string;
  }) {
    this.appsLocalStates = appsLocalStates;
    this.currentRound = ensureBigInt(currentRound);
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationLocalStatesResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'apps-local-states',
        this.appsLocalStates.map((v) => v.toEncodingData()),
      ],
      ['current-round', this.currentRound],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): ApplicationLocalStatesResponse {
    if (!(data instanceof Map)) {
      throw new Error(
        `Invalid decoded ApplicationLocalStatesResponse: ${data}`
      );
    }
    return new ApplicationLocalStatesResponse({
      appsLocalStates: (data.get('apps-local-states') ?? []).map((v: unknown) =>
        ApplicationLocalState.fromEncodingData(v)
      ),
      currentRound: data.get('current-round'),
      nextToken: data.get('next-token'),
    });
  }
}

/**
 * Stores the global information associated with an application.
 */
export class ApplicationLogData implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'logs',
          valueSchema: new ArraySchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        { key: 'txid', valueSchema: new StringSchema(), omitEmpty: true }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Logs for the application being executed by the transaction.
   */
  public logs: Uint8Array[];

  /**
   * Transaction ID
   */
  public txid: string;

  /**
   * Creates a new `ApplicationLogData` object.
   * @param logs - Logs for the application being executed by the transaction.
   * @param txid - Transaction ID
   */
  constructor({ logs, txid }: { logs: Uint8Array[]; txid: string }) {
    this.logs = logs;
    this.txid = txid;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationLogData.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['logs', this.logs],
      ['txid', this.txid],
    ]);
  }

  static fromEncodingData(data: unknown): ApplicationLogData {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ApplicationLogData: ${data}`);
    }
    return new ApplicationLogData({
      logs: data.get('logs'),
      txid: data.get('txid'),
    });
  }
}

/**
 *
 */
export class ApplicationLogsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'application-id',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'log-data',
          valueSchema: new OptionalSchema(
            new ArraySchema(ApplicationLogData.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (appidx) application index.
   */
  public applicationId: bigint;

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  public logData?: ApplicationLogData[];

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `ApplicationLogsResponse` object.
   * @param applicationId - (appidx) application index.
   * @param currentRound - Round at which the results were computed.
   * @param logData -
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    applicationId,
    currentRound,
    logData,
    nextToken,
  }: {
    applicationId: number | bigint;
    currentRound: number | bigint;
    logData?: ApplicationLogData[];
    nextToken?: string;
  }) {
    this.applicationId = ensureBigInt(applicationId);
    this.currentRound = ensureBigInt(currentRound);
    this.logData = logData;
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationLogsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['application-id', this.applicationId],
      ['current-round', this.currentRound],
      [
        'log-data',
        typeof this.logData !== 'undefined'
          ? this.logData.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): ApplicationLogsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ApplicationLogsResponse: ${data}`);
    }
    return new ApplicationLogsResponse({
      applicationId: data.get('application-id'),
      currentRound: data.get('current-round'),
      logData:
        typeof data.get('log-data') !== 'undefined'
          ? data
              .get('log-data')
              .map((v: unknown) => ApplicationLogData.fromEncodingData(v))
          : undefined,
      nextToken: data.get('next-token'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'approval-program',
          valueSchema: new ByteArraySchema(),
          omitEmpty: true,
        },
        {
          key: 'clear-state-program',
          valueSchema: new ByteArraySchema(),
          omitEmpty: true,
        },
        {
          key: 'creator',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'extra-program-pages',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'global-state',
          valueSchema: new OptionalSchema(
            new ArraySchema(TealKeyValue.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'global-state-schema',
          valueSchema: new OptionalSchema(
            ApplicationStateSchema.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'local-state-schema',
          valueSchema: new OptionalSchema(
            ApplicationStateSchema.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'version',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * approval program.
   */
  public approvalProgram: Uint8Array;

  /**
   * clear state program.
   */
  public clearStateProgram: Uint8Array;

  /**
   * The address that created this application. This is the address where the
   * parameters and global state for this application can be found.
   */
  public creator?: Address;

  /**
   * the number of extra program pages available to this app.
   */
  public extraProgramPages?: number;

  /**
   * global state
   */
  public globalState?: TealKeyValue[];

  /**
   * global schema
   */
  public globalStateSchema?: ApplicationStateSchema;

  /**
   * local schema
   */
  public localStateSchema?: ApplicationStateSchema;

  /**
   * the number of updates to the application programs
   */
  public version?: number;

  /**
   * Creates a new `ApplicationParams` object.
   * @param approvalProgram - approval program.
   * @param clearStateProgram - clear state program.
   * @param creator - The address that created this application. This is the address where the
   * parameters and global state for this application can be found.
   * @param extraProgramPages - the number of extra program pages available to this app.
   * @param globalState - global state
   * @param globalStateSchema - global schema
   * @param localStateSchema - local schema
   * @param version - the number of updates to the application programs
   */
  constructor({
    approvalProgram,
    clearStateProgram,
    creator,
    extraProgramPages,
    globalState,
    globalStateSchema,
    localStateSchema,
    version,
  }: {
    approvalProgram: string | Uint8Array;
    clearStateProgram: string | Uint8Array;
    creator?: Address | string;
    extraProgramPages?: number | bigint;
    globalState?: TealKeyValue[];
    globalStateSchema?: ApplicationStateSchema;
    localStateSchema?: ApplicationStateSchema;
    version?: number | bigint;
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
    this.version =
      typeof version === 'undefined' ? undefined : ensureSafeInteger(version);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationParams.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['approval-program', this.approvalProgram],
      ['clear-state-program', this.clearStateProgram],
      [
        'creator',
        typeof this.creator !== 'undefined'
          ? this.creator.toString()
          : undefined,
      ],
      ['extra-program-pages', this.extraProgramPages],
      [
        'global-state',
        typeof this.globalState !== 'undefined'
          ? this.globalState.map((v) => v.toEncodingData())
          : undefined,
      ],
      [
        'global-state-schema',
        typeof this.globalStateSchema !== 'undefined'
          ? this.globalStateSchema.toEncodingData()
          : undefined,
      ],
      [
        'local-state-schema',
        typeof this.localStateSchema !== 'undefined'
          ? this.localStateSchema.toEncodingData()
          : undefined,
      ],
      ['version', this.version],
    ]);
  }

  static fromEncodingData(data: unknown): ApplicationParams {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ApplicationParams: ${data}`);
    }
    return new ApplicationParams({
      approvalProgram: data.get('approval-program'),
      clearStateProgram: data.get('clear-state-program'),
      creator: data.get('creator'),
      extraProgramPages: data.get('extra-program-pages'),
      globalState:
        typeof data.get('global-state') !== 'undefined'
          ? data
              .get('global-state')
              .map((v: unknown) => TealKeyValue.fromEncodingData(v))
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
      version: data.get('version'),
    });
  }
}

/**
 *
 */
export class ApplicationResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'application',
          valueSchema: new OptionalSchema(Application.encodingSchema),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Application index and its parameters
   */
  public application?: Application;

  /**
   * Creates a new `ApplicationResponse` object.
   * @param currentRound - Round at which the results were computed.
   * @param application - Application index and its parameters
   */
  constructor({
    currentRound,
    application,
  }: {
    currentRound: number | bigint;
    application?: Application;
  }) {
    this.currentRound = ensureBigInt(currentRound);
    this.application = application;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['current-round', this.currentRound],
      [
        'application',
        typeof this.application !== 'undefined'
          ? this.application.toEncodingData()
          : undefined,
      ],
    ]);
  }

  static fromEncodingData(data: unknown): ApplicationResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ApplicationResponse: ${data}`);
    }
    return new ApplicationResponse({
      currentRound: data.get('current-round'),
      application:
        typeof data.get('application') !== 'undefined'
          ? Application.fromEncodingData(data.get('application'))
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'num-byte-slice',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        { key: 'num-uint', valueSchema: new Uint64Schema(), omitEmpty: true }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * number of byte slices.
   */
  public numByteSlice: number;

  /**
   * number of uints.
   */
  public numUint: number;

  /**
   * Creates a new `ApplicationStateSchema` object.
   * @param numByteSlice - number of byte slices.
   * @param numUint - number of uints.
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
    return new Map<string, unknown>([
      ['num-byte-slice', this.numByteSlice],
      ['num-uint', this.numUint],
    ]);
  }

  static fromEncodingData(data: unknown): ApplicationStateSchema {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ApplicationStateSchema: ${data}`);
    }
    return new ApplicationStateSchema({
      numByteSlice: data.get('num-byte-slice'),
      numUint: data.get('num-uint'),
    });
  }
}

/**
 *
 */
export class ApplicationsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'applications',
          valueSchema: new ArraySchema(Application.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public applications: Application[];

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `ApplicationsResponse` object.
   * @param applications -
   * @param currentRound - Round at which the results were computed.
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    applications,
    currentRound,
    nextToken,
  }: {
    applications: Application[];
    currentRound: number | bigint;
    nextToken?: string;
  }) {
    this.applications = applications;
    this.currentRound = ensureBigInt(currentRound);
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ApplicationsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['applications', this.applications.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): ApplicationsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ApplicationsResponse: ${data}`);
    }
    return new ApplicationsResponse({
      applications: (data.get('applications') ?? []).map((v: unknown) =>
        Application.fromEncodingData(v)
      ),
      currentRound: data.get('current-round'),
      nextToken: data.get('next-token'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'index', valueSchema: new Uint64Schema(), omitEmpty: true },
        {
          key: 'params',
          valueSchema: AssetParams.encodingSchema,
          omitEmpty: true,
        },
        {
          key: 'created-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'deleted',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'destroyed-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
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
   * Round during which this asset was created.
   */
  public createdAtRound?: bigint;

  /**
   * Whether or not this asset is currently deleted.
   */
  public deleted?: boolean;

  /**
   * Round during which this asset was destroyed.
   */
  public destroyedAtRound?: bigint;

  /**
   * Creates a new `Asset` object.
   * @param index - unique asset identifier
   * @param params - AssetParams specifies the parameters for an asset.
   * (apar) when part of an AssetConfig transaction.
   * Definition:
   * data/transactions/asset.go : AssetParams
   * @param createdAtRound - Round during which this asset was created.
   * @param deleted - Whether or not this asset is currently deleted.
   * @param destroyedAtRound - Round during which this asset was destroyed.
   */
  constructor({
    index,
    params,
    createdAtRound,
    deleted,
    destroyedAtRound,
  }: {
    index: number | bigint;
    params: AssetParams;
    createdAtRound?: number | bigint;
    deleted?: boolean;
    destroyedAtRound?: number | bigint;
  }) {
    this.index = ensureBigInt(index);
    this.params = params;
    this.createdAtRound =
      typeof createdAtRound === 'undefined'
        ? undefined
        : ensureBigInt(createdAtRound);
    this.deleted = deleted;
    this.destroyedAtRound =
      typeof destroyedAtRound === 'undefined'
        ? undefined
        : ensureBigInt(destroyedAtRound);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Asset.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['index', this.index],
      ['params', this.params.toEncodingData()],
      ['created-at-round', this.createdAtRound],
      ['deleted', this.deleted],
      ['destroyed-at-round', this.destroyedAtRound],
    ]);
  }

  static fromEncodingData(data: unknown): Asset {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded Asset: ${data}`);
    }
    return new Asset({
      index: data.get('index'),
      params: AssetParams.fromEncodingData(data.get('params') ?? new Map()),
      createdAtRound: data.get('created-at-round'),
      deleted: data.get('deleted'),
      destroyedAtRound: data.get('destroyed-at-round'),
    });
  }
}

/**
 *
 */
export class AssetBalancesResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'balances',
          valueSchema: new ArraySchema(MiniAssetHolding.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public balances: MiniAssetHolding[];

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `AssetBalancesResponse` object.
   * @param balances -
   * @param currentRound - Round at which the results were computed.
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    balances,
    currentRound,
    nextToken,
  }: {
    balances: MiniAssetHolding[];
    currentRound: number | bigint;
    nextToken?: string;
  }) {
    this.balances = balances;
    this.currentRound = ensureBigInt(currentRound);
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AssetBalancesResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['balances', this.balances.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): AssetBalancesResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetBalancesResponse: ${data}`);
    }
    return new AssetBalancesResponse({
      balances: (data.get('balances') ?? []).map((v: unknown) =>
        MiniAssetHolding.fromEncodingData(v)
      ),
      currentRound: data.get('current-round'),
      nextToken: data.get('next-token'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'amount', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'asset-id', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'is-frozen', valueSchema: new BooleanSchema(), omitEmpty: true },
        {
          key: 'deleted',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'opted-in-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'opted-out-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * number of units held.
   */
  public amount: bigint;

  /**
   * Asset ID of the holding.
   */
  public assetId: bigint;

  /**
   * whether or not the holding is frozen.
   */
  public isFrozen: boolean;

  /**
   * Whether or not the asset holding is currently deleted from its account.
   */
  public deleted?: boolean;

  /**
   * Round during which the account opted into this asset holding.
   */
  public optedInAtRound?: bigint;

  /**
   * Round during which the account opted out of this asset holding.
   */
  public optedOutAtRound?: bigint;

  /**
   * Creates a new `AssetHolding` object.
   * @param amount - number of units held.
   * @param assetId - Asset ID of the holding.
   * @param isFrozen - whether or not the holding is frozen.
   * @param deleted - Whether or not the asset holding is currently deleted from its account.
   * @param optedInAtRound - Round during which the account opted into this asset holding.
   * @param optedOutAtRound - Round during which the account opted out of this asset holding.
   */
  constructor({
    amount,
    assetId,
    isFrozen,
    deleted,
    optedInAtRound,
    optedOutAtRound,
  }: {
    amount: number | bigint;
    assetId: number | bigint;
    isFrozen: boolean;
    deleted?: boolean;
    optedInAtRound?: number | bigint;
    optedOutAtRound?: number | bigint;
  }) {
    this.amount = ensureBigInt(amount);
    this.assetId = ensureBigInt(assetId);
    this.isFrozen = isFrozen;
    this.deleted = deleted;
    this.optedInAtRound =
      typeof optedInAtRound === 'undefined'
        ? undefined
        : ensureBigInt(optedInAtRound);
    this.optedOutAtRound =
      typeof optedOutAtRound === 'undefined'
        ? undefined
        : ensureBigInt(optedOutAtRound);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AssetHolding.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['amount', this.amount],
      ['asset-id', this.assetId],
      ['is-frozen', this.isFrozen],
      ['deleted', this.deleted],
      ['opted-in-at-round', this.optedInAtRound],
      ['opted-out-at-round', this.optedOutAtRound],
    ]);
  }

  static fromEncodingData(data: unknown): AssetHolding {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetHolding: ${data}`);
    }
    return new AssetHolding({
      amount: data.get('amount'),
      assetId: data.get('asset-id'),
      isFrozen: data.get('is-frozen'),
      deleted: data.get('deleted'),
      optedInAtRound: data.get('opted-in-at-round'),
      optedOutAtRound: data.get('opted-out-at-round'),
    });
  }
}

/**
 *
 */
export class AssetHoldingsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'assets',
          valueSchema: new ArraySchema(AssetHolding.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public assets: AssetHolding[];

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `AssetHoldingsResponse` object.
   * @param assets -
   * @param currentRound - Round at which the results were computed.
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    assets,
    currentRound,
    nextToken,
  }: {
    assets: AssetHolding[];
    currentRound: number | bigint;
    nextToken?: string;
  }) {
    this.assets = assets;
    this.currentRound = ensureBigInt(currentRound);
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AssetHoldingsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['assets', this.assets.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): AssetHoldingsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetHoldingsResponse: ${data}`);
    }
    return new AssetHoldingsResponse({
      assets: (data.get('assets') ?? []).map((v: unknown) =>
        AssetHolding.fromEncodingData(v)
      ),
      currentRound: data.get('current-round'),
      nextToken: data.get('next-token'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'creator', valueSchema: new StringSchema(), omitEmpty: true },
        { key: 'decimals', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'total', valueSchema: new Uint64Schema(), omitEmpty: true },
        {
          key: 'clawback',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'default-frozen',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'freeze',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'manager',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'metadata-hash',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'name',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'name-b64',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'reserve',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'unit-name',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'unit-name-b64',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'url',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'url-b64',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
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
   * The number of digits to use after the decimal point when displaying this asset.
   * If 0, the asset is not divisible. If 1, the base unit of the asset is in tenths.
   * If 2, the base unit of the asset is in hundredths, and so on. This value must be
   * between 0 and 19 (inclusive).
   */
  public decimals: number;

  /**
   * The total number of units of this asset.
   */
  public total: bigint;

  /**
   * Address of account used to clawback holdings of this asset. If empty, clawback
   * is not permitted.
   */
  public clawback?: string;

  /**
   * Whether holdings of this asset are frozen by default.
   */
  public defaultFrozen?: boolean;

  /**
   * Address of account used to freeze holdings of this asset. If empty, freezing is
   * not permitted.
   */
  public freeze?: string;

  /**
   * Address of account used to manage the keys of this asset and to destroy it.
   */
  public manager?: string;

  /**
   * A commitment to some unspecified asset metadata. The format of this metadata is
   * up to the application.
   */
  public metadataHash?: Uint8Array;

  /**
   * Name of this asset, as supplied by the creator. Included only when the asset
   * name is composed of printable utf-8 characters.
   */
  public name?: string;

  /**
   * Base64 encoded name of this asset, as supplied by the creator.
   */
  public nameB64?: Uint8Array;

  /**
   * Address of account holding reserve (non-minted) units of this asset.
   */
  public reserve?: string;

  /**
   * Name of a unit of this asset, as supplied by the creator. Included only when the
   * name of a unit of this asset is composed of printable utf-8 characters.
   */
  public unitName?: string;

  /**
   * Base64 encoded name of a unit of this asset, as supplied by the creator.
   */
  public unitNameB64?: Uint8Array;

  /**
   * URL where more information about the asset can be retrieved. Included only when
   * the URL is composed of printable utf-8 characters.
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
   * @param decimals - The number of digits to use after the decimal point when displaying this asset.
   * If 0, the asset is not divisible. If 1, the base unit of the asset is in tenths.
   * If 2, the base unit of the asset is in hundredths, and so on. This value must be
   * between 0 and 19 (inclusive).
   * @param total - The total number of units of this asset.
   * @param clawback - Address of account used to clawback holdings of this asset. If empty, clawback
   * is not permitted.
   * @param defaultFrozen - Whether holdings of this asset are frozen by default.
   * @param freeze - Address of account used to freeze holdings of this asset. If empty, freezing is
   * not permitted.
   * @param manager - Address of account used to manage the keys of this asset and to destroy it.
   * @param metadataHash - A commitment to some unspecified asset metadata. The format of this metadata is
   * up to the application.
   * @param name - Name of this asset, as supplied by the creator. Included only when the asset
   * name is composed of printable utf-8 characters.
   * @param nameB64 - Base64 encoded name of this asset, as supplied by the creator.
   * @param reserve - Address of account holding reserve (non-minted) units of this asset.
   * @param unitName - Name of a unit of this asset, as supplied by the creator. Included only when the
   * name of a unit of this asset is composed of printable utf-8 characters.
   * @param unitNameB64 - Base64 encoded name of a unit of this asset, as supplied by the creator.
   * @param url - URL where more information about the asset can be retrieved. Included only when
   * the URL is composed of printable utf-8 characters.
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
    return new Map<string, unknown>([
      ['creator', this.creator],
      ['decimals', this.decimals],
      ['total', this.total],
      ['clawback', this.clawback],
      ['default-frozen', this.defaultFrozen],
      ['freeze', this.freeze],
      ['manager', this.manager],
      ['metadata-hash', this.metadataHash],
      ['name', this.name],
      ['name-b64', this.nameB64],
      ['reserve', this.reserve],
      ['unit-name', this.unitName],
      ['unit-name-b64', this.unitNameB64],
      ['url', this.url],
      ['url-b64', this.urlB64],
    ]);
  }

  static fromEncodingData(data: unknown): AssetParams {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetParams: ${data}`);
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
 *
 */
export class AssetResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'asset', valueSchema: Asset.encodingSchema, omitEmpty: true },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Specifies both the unique identifier and the parameters for an asset
   */
  public asset: Asset;

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Creates a new `AssetResponse` object.
   * @param asset - Specifies both the unique identifier and the parameters for an asset
   * @param currentRound - Round at which the results were computed.
   */
  constructor({
    asset,
    currentRound,
  }: {
    asset: Asset;
    currentRound: number | bigint;
  }) {
    this.asset = asset;
    this.currentRound = ensureBigInt(currentRound);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AssetResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['asset', this.asset.toEncodingData()],
      ['current-round', this.currentRound],
    ]);
  }

  static fromEncodingData(data: unknown): AssetResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetResponse: ${data}`);
    }
    return new AssetResponse({
      asset: Asset.fromEncodingData(data.get('asset') ?? new Map()),
      currentRound: data.get('current-round'),
    });
  }
}

/**
 *
 */
export class AssetsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'assets',
          valueSchema: new ArraySchema(Asset.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public assets: Asset[];

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `AssetsResponse` object.
   * @param assets -
   * @param currentRound - Round at which the results were computed.
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    assets,
    currentRound,
    nextToken,
  }: {
    assets: Asset[];
    currentRound: number | bigint;
    nextToken?: string;
  }) {
    this.assets = assets;
    this.currentRound = ensureBigInt(currentRound);
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return AssetsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['assets', this.assets.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): AssetsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetsResponse: ${data}`);
    }
    return new AssetsResponse({
      assets: (data.get('assets') ?? []).map((v: unknown) =>
        Asset.fromEncodingData(v)
      ),
      currentRound: data.get('current-round'),
      nextToken: data.get('next-token'),
    });
  }
}

/**
 * Block information.
 * Definition:
 * data/bookkeeping/block.go : Block
 */
export class Block implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'genesis-hash',
          valueSchema: new ByteArraySchema(),
          omitEmpty: true,
        },
        { key: 'genesis-id', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'previous-block-hash',
          valueSchema: new ByteArraySchema(),
          omitEmpty: true,
        },
        { key: 'round', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'seed', valueSchema: new ByteArraySchema(), omitEmpty: true },
        { key: 'timestamp', valueSchema: new Uint64Schema(), omitEmpty: true },
        {
          key: 'transactions-root',
          valueSchema: new ByteArraySchema(),
          omitEmpty: true,
        },
        {
          key: 'transactions-root-sha256',
          valueSchema: new ByteArraySchema(),
          omitEmpty: true,
        },
        {
          key: 'bonus',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'fees-collected',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'participation-updates',
          valueSchema: new OptionalSchema(ParticipationUpdates.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'previous-block-hash-512',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'proposer',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'proposer-payout',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'rewards',
          valueSchema: new OptionalSchema(BlockRewards.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'state-proof-tracking',
          valueSchema: new OptionalSchema(
            new ArraySchema(StateProofTracking.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'transactions',
          valueSchema: new OptionalSchema(
            new ArraySchema(Transaction.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'transactions-root-sha512',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'txn-counter',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'upgrade-state',
          valueSchema: new OptionalSchema(BlockUpgradeState.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'upgrade-vote',
          valueSchema: new OptionalSchema(BlockUpgradeVote.encodingSchema),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (gh) hash to which this block belongs.
   */
  public genesisHash: Uint8Array;

  /**
   * (gen) ID to which this block belongs.
   */
  public genesisId: string;

  /**
   * (prev) Previous block hash.
   */
  public previousBlockHash: Uint8Array;

  /**
   * (rnd) Current round on which this block was appended to the chain.
   */
  public round: bigint;

  /**
   * (seed) Sortition seed.
   */
  public seed: Uint8Array;

  /**
   * (ts) Block creation timestamp in seconds since eposh
   */
  public timestamp: number;

  /**
   * (txn) TransactionsRoot authenticates the set of transactions appearing in the
   * block. More specifically, it's the root of a merkle tree whose leaves are the
   * block's Txids, in lexicographic order. For the empty block, it's 0. Note that
   * the TxnRoot does not authenticate the signatures on the transactions, only the
   * transactions themselves. Two blocks with the same transactions but in a
   * different order and with different signatures will have the same TxnRoot.
   */
  public transactionsRoot: Uint8Array;

  /**
   * (txn256) TransactionsRootSHA256 is an auxiliary TransactionRoot, built using a
   * vector commitment instead of a merkle tree, and SHA256 hash function instead of
   * the default SHA512_256. This commitment can be used on environments where only
   * the SHA256 function exists.
   */
  public transactionsRootSha256: Uint8Array;

  /**
   * the potential bonus payout for this block.
   */
  public bonus?: number;

  /**
   * the sum of all fees paid by transactions in this block.
   */
  public feesCollected?: number;

  /**
   * Participation account data that needs to be checked/acted on by the network.
   */
  public participationUpdates?: ParticipationUpdates;

  /**
   * (prev512) Previous block hash, using SHA-512.
   */
  public previousBlockHash512?: Uint8Array;

  /**
   * the proposer of this block.
   */
  public proposer?: Address;

  /**
   * the actual amount transferred to the proposer from the fee sink.
   */
  public proposerPayout?: number;

  /**
   * Fields relating to rewards,
   */
  public rewards?: BlockRewards;

  /**
   * Tracks the status of state proofs.
   */
  public stateProofTracking?: StateProofTracking[];

  /**
   * (txns) list of transactions corresponding to a given round.
   */
  public transactions?: Transaction[];

  /**
   * (txn512) TransactionsRootSHA512 is an auxiliary TransactionRoot, built using a
   * vector commitment instead of a merkle tree, and SHA512 hash function instead of
   * the default SHA512_256.
   */
  public transactionsRootSha512?: Uint8Array;

  /**
   * (tc) TxnCounter counts the number of transactions committed in the ledger, from
   * the time at which support for this feature was introduced.
   * Specifically, TxnCounter is the number of the next transaction that will be
   * committed after this block. It is 0 when no transactions have ever been
   * committed (since TxnCounter started being supported).
   */
  public txnCounter?: number;

  /**
   * Fields relating to a protocol upgrade.
   */
  public upgradeState?: BlockUpgradeState;

  /**
   * Fields relating to voting for a protocol upgrade.
   */
  public upgradeVote?: BlockUpgradeVote;

  /**
   * Creates a new `Block` object.
   * @param genesisHash - (gh) hash to which this block belongs.
   * @param genesisId - (gen) ID to which this block belongs.
   * @param previousBlockHash - (prev) Previous block hash.
   * @param round - (rnd) Current round on which this block was appended to the chain.
   * @param seed - (seed) Sortition seed.
   * @param timestamp - (ts) Block creation timestamp in seconds since eposh
   * @param transactionsRoot - (txn) TransactionsRoot authenticates the set of transactions appearing in the
   * block. More specifically, it's the root of a merkle tree whose leaves are the
   * block's Txids, in lexicographic order. For the empty block, it's 0. Note that
   * the TxnRoot does not authenticate the signatures on the transactions, only the
   * transactions themselves. Two blocks with the same transactions but in a
   * different order and with different signatures will have the same TxnRoot.
   * @param transactionsRootSha256 - (txn256) TransactionsRootSHA256 is an auxiliary TransactionRoot, built using a
   * vector commitment instead of a merkle tree, and SHA256 hash function instead of
   * the default SHA512_256. This commitment can be used on environments where only
   * the SHA256 function exists.
   * @param bonus - the potential bonus payout for this block.
   * @param feesCollected - the sum of all fees paid by transactions in this block.
   * @param participationUpdates - Participation account data that needs to be checked/acted on by the network.
   * @param previousBlockHash512 - (prev512) Previous block hash, using SHA-512.
   * @param proposer - the proposer of this block.
   * @param proposerPayout - the actual amount transferred to the proposer from the fee sink.
   * @param rewards - Fields relating to rewards,
   * @param stateProofTracking - Tracks the status of state proofs.
   * @param transactions - (txns) list of transactions corresponding to a given round.
   * @param transactionsRootSha512 - (txn512) TransactionsRootSHA512 is an auxiliary TransactionRoot, built using a
   * vector commitment instead of a merkle tree, and SHA512 hash function instead of
   * the default SHA512_256.
   * @param txnCounter - (tc) TxnCounter counts the number of transactions committed in the ledger, from
   * the time at which support for this feature was introduced.
   * Specifically, TxnCounter is the number of the next transaction that will be
   * committed after this block. It is 0 when no transactions have ever been
   * committed (since TxnCounter started being supported).
   * @param upgradeState - Fields relating to a protocol upgrade.
   * @param upgradeVote - Fields relating to voting for a protocol upgrade.
   */
  constructor({
    genesisHash,
    genesisId,
    previousBlockHash,
    round,
    seed,
    timestamp,
    transactionsRoot,
    transactionsRootSha256,
    bonus,
    feesCollected,
    participationUpdates,
    previousBlockHash512,
    proposer,
    proposerPayout,
    rewards,
    stateProofTracking,
    transactions,
    transactionsRootSha512,
    txnCounter,
    upgradeState,
    upgradeVote,
  }: {
    genesisHash: string | Uint8Array;
    genesisId: string;
    previousBlockHash: string | Uint8Array;
    round: number | bigint;
    seed: string | Uint8Array;
    timestamp: number | bigint;
    transactionsRoot: string | Uint8Array;
    transactionsRootSha256: string | Uint8Array;
    bonus?: number | bigint;
    feesCollected?: number | bigint;
    participationUpdates?: ParticipationUpdates;
    previousBlockHash512?: string | Uint8Array;
    proposer?: Address | string;
    proposerPayout?: number | bigint;
    rewards?: BlockRewards;
    stateProofTracking?: StateProofTracking[];
    transactions?: Transaction[];
    transactionsRootSha512?: string | Uint8Array;
    txnCounter?: number | bigint;
    upgradeState?: BlockUpgradeState;
    upgradeVote?: BlockUpgradeVote;
  }) {
    this.genesisHash =
      typeof genesisHash === 'string'
        ? base64ToBytes(genesisHash)
        : genesisHash;
    this.genesisId = genesisId;
    this.previousBlockHash =
      typeof previousBlockHash === 'string'
        ? base64ToBytes(previousBlockHash)
        : previousBlockHash;
    this.round = ensureBigInt(round);
    this.seed = typeof seed === 'string' ? base64ToBytes(seed) : seed;
    this.timestamp = ensureSafeInteger(timestamp);
    this.transactionsRoot =
      typeof transactionsRoot === 'string'
        ? base64ToBytes(transactionsRoot)
        : transactionsRoot;
    this.transactionsRootSha256 =
      typeof transactionsRootSha256 === 'string'
        ? base64ToBytes(transactionsRootSha256)
        : transactionsRootSha256;
    this.bonus =
      typeof bonus === 'undefined' ? undefined : ensureSafeInteger(bonus);
    this.feesCollected =
      typeof feesCollected === 'undefined'
        ? undefined
        : ensureSafeInteger(feesCollected);
    this.participationUpdates = participationUpdates;
    this.previousBlockHash512 =
      typeof previousBlockHash512 === 'string'
        ? base64ToBytes(previousBlockHash512)
        : previousBlockHash512;
    this.proposer =
      typeof proposer === 'string' ? Address.fromString(proposer) : proposer;
    this.proposerPayout =
      typeof proposerPayout === 'undefined'
        ? undefined
        : ensureSafeInteger(proposerPayout);
    this.rewards = rewards;
    this.stateProofTracking = stateProofTracking;
    this.transactions = transactions;
    this.transactionsRootSha512 =
      typeof transactionsRootSha512 === 'string'
        ? base64ToBytes(transactionsRootSha512)
        : transactionsRootSha512;
    this.txnCounter =
      typeof txnCounter === 'undefined'
        ? undefined
        : ensureSafeInteger(txnCounter);
    this.upgradeState = upgradeState;
    this.upgradeVote = upgradeVote;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Block.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['genesis-hash', this.genesisHash],
      ['genesis-id', this.genesisId],
      ['previous-block-hash', this.previousBlockHash],
      ['round', this.round],
      ['seed', this.seed],
      ['timestamp', this.timestamp],
      ['transactions-root', this.transactionsRoot],
      ['transactions-root-sha256', this.transactionsRootSha256],
      ['bonus', this.bonus],
      ['fees-collected', this.feesCollected],
      [
        'participation-updates',
        typeof this.participationUpdates !== 'undefined'
          ? this.participationUpdates.toEncodingData()
          : undefined,
      ],
      ['previous-block-hash-512', this.previousBlockHash512],
      [
        'proposer',
        typeof this.proposer !== 'undefined'
          ? this.proposer.toString()
          : undefined,
      ],
      ['proposer-payout', this.proposerPayout],
      [
        'rewards',
        typeof this.rewards !== 'undefined'
          ? this.rewards.toEncodingData()
          : undefined,
      ],
      [
        'state-proof-tracking',
        typeof this.stateProofTracking !== 'undefined'
          ? this.stateProofTracking.map((v) => v.toEncodingData())
          : undefined,
      ],
      [
        'transactions',
        typeof this.transactions !== 'undefined'
          ? this.transactions.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['transactions-root-sha512', this.transactionsRootSha512],
      ['txn-counter', this.txnCounter],
      [
        'upgrade-state',
        typeof this.upgradeState !== 'undefined'
          ? this.upgradeState.toEncodingData()
          : undefined,
      ],
      [
        'upgrade-vote',
        typeof this.upgradeVote !== 'undefined'
          ? this.upgradeVote.toEncodingData()
          : undefined,
      ],
    ]);
  }

  static fromEncodingData(data: unknown): Block {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded Block: ${data}`);
    }
    return new Block({
      genesisHash: data.get('genesis-hash'),
      genesisId: data.get('genesis-id'),
      previousBlockHash: data.get('previous-block-hash'),
      round: data.get('round'),
      seed: data.get('seed'),
      timestamp: data.get('timestamp'),
      transactionsRoot: data.get('transactions-root'),
      transactionsRootSha256: data.get('transactions-root-sha256'),
      bonus: data.get('bonus'),
      feesCollected: data.get('fees-collected'),
      participationUpdates:
        typeof data.get('participation-updates') !== 'undefined'
          ? ParticipationUpdates.fromEncodingData(
              data.get('participation-updates')
            )
          : undefined,
      previousBlockHash512: data.get('previous-block-hash-512'),
      proposer: data.get('proposer'),
      proposerPayout: data.get('proposer-payout'),
      rewards:
        typeof data.get('rewards') !== 'undefined'
          ? BlockRewards.fromEncodingData(data.get('rewards'))
          : undefined,
      stateProofTracking:
        typeof data.get('state-proof-tracking') !== 'undefined'
          ? data
              .get('state-proof-tracking')
              .map((v: unknown) => StateProofTracking.fromEncodingData(v))
          : undefined,
      transactions:
        typeof data.get('transactions') !== 'undefined'
          ? data
              .get('transactions')
              .map((v: unknown) => Transaction.fromEncodingData(v))
          : undefined,
      transactionsRootSha512: data.get('transactions-root-sha512'),
      txnCounter: data.get('txn-counter'),
      upgradeState:
        typeof data.get('upgrade-state') !== 'undefined'
          ? BlockUpgradeState.fromEncodingData(data.get('upgrade-state'))
          : undefined,
      upgradeVote:
        typeof data.get('upgrade-vote') !== 'undefined'
          ? BlockUpgradeVote.fromEncodingData(data.get('upgrade-vote'))
          : undefined,
    });
  }
}

/**
 *
 */
export class BlockHeadersResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'blocks',
          valueSchema: new ArraySchema(Block.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public blocks: Block[];

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `BlockHeadersResponse` object.
   * @param blocks -
   * @param currentRound - Round at which the results were computed.
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    blocks,
    currentRound,
    nextToken,
  }: {
    blocks: Block[];
    currentRound: number | bigint;
    nextToken?: string;
  }) {
    this.blocks = blocks;
    this.currentRound = ensureBigInt(currentRound);
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BlockHeadersResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['blocks', this.blocks.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): BlockHeadersResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BlockHeadersResponse: ${data}`);
    }
    return new BlockHeadersResponse({
      blocks: (data.get('blocks') ?? []).map((v: unknown) =>
        Block.fromEncodingData(v)
      ),
      currentRound: data.get('current-round'),
      nextToken: data.get('next-token'),
    });
  }
}

/**
 * Fields relating to rewards,
 */
export class BlockRewards implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'fee-sink', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'rewards-calculation-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'rewards-level',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'rewards-pool',
          valueSchema: new StringSchema(),
          omitEmpty: true,
        },
        {
          key: 'rewards-rate',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'rewards-residue',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (fees) accepts transaction fees, it can only spend to the incentive pool.
   */
  public feeSink: string;

  /**
   * (rwcalr) number of leftover MicroAlgos after the distribution of rewards-rate
   * MicroAlgos for every reward unit in the next round.
   */
  public rewardsCalculationRound: bigint;

  /**
   * (earn) How many rewards, in MicroAlgos, have been distributed to each RewardUnit
   * of MicroAlgos since genesis.
   */
  public rewardsLevel: bigint;

  /**
   * (rwd) accepts periodic injections from the fee-sink and continually
   * redistributes them as rewards.
   */
  public rewardsPool: string;

  /**
   * (rate) Number of new MicroAlgos added to the participation stake from rewards at
   * the next round.
   */
  public rewardsRate: bigint;

  /**
   * (frac) Number of leftover MicroAlgos after the distribution of
   * RewardsRate/rewardUnits MicroAlgos for every reward unit in the next round.
   */
  public rewardsResidue: bigint;

  /**
   * Creates a new `BlockRewards` object.
   * @param feeSink - (fees) accepts transaction fees, it can only spend to the incentive pool.
   * @param rewardsCalculationRound - (rwcalr) number of leftover MicroAlgos after the distribution of rewards-rate
   * MicroAlgos for every reward unit in the next round.
   * @param rewardsLevel - (earn) How many rewards, in MicroAlgos, have been distributed to each RewardUnit
   * of MicroAlgos since genesis.
   * @param rewardsPool - (rwd) accepts periodic injections from the fee-sink and continually
   * redistributes them as rewards.
   * @param rewardsRate - (rate) Number of new MicroAlgos added to the participation stake from rewards at
   * the next round.
   * @param rewardsResidue - (frac) Number of leftover MicroAlgos after the distribution of
   * RewardsRate/rewardUnits MicroAlgos for every reward unit in the next round.
   */
  constructor({
    feeSink,
    rewardsCalculationRound,
    rewardsLevel,
    rewardsPool,
    rewardsRate,
    rewardsResidue,
  }: {
    feeSink: string;
    rewardsCalculationRound: number | bigint;
    rewardsLevel: number | bigint;
    rewardsPool: string;
    rewardsRate: number | bigint;
    rewardsResidue: number | bigint;
  }) {
    this.feeSink = feeSink;
    this.rewardsCalculationRound = ensureBigInt(rewardsCalculationRound);
    this.rewardsLevel = ensureBigInt(rewardsLevel);
    this.rewardsPool = rewardsPool;
    this.rewardsRate = ensureBigInt(rewardsRate);
    this.rewardsResidue = ensureBigInt(rewardsResidue);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BlockRewards.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['fee-sink', this.feeSink],
      ['rewards-calculation-round', this.rewardsCalculationRound],
      ['rewards-level', this.rewardsLevel],
      ['rewards-pool', this.rewardsPool],
      ['rewards-rate', this.rewardsRate],
      ['rewards-residue', this.rewardsResidue],
    ]);
  }

  static fromEncodingData(data: unknown): BlockRewards {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BlockRewards: ${data}`);
    }
    return new BlockRewards({
      feeSink: data.get('fee-sink'),
      rewardsCalculationRound: data.get('rewards-calculation-round'),
      rewardsLevel: data.get('rewards-level'),
      rewardsPool: data.get('rewards-pool'),
      rewardsRate: data.get('rewards-rate'),
      rewardsResidue: data.get('rewards-residue'),
    });
  }
}

/**
 * Fields relating to a protocol upgrade.
 */
export class BlockUpgradeState implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'current-protocol',
          valueSchema: new StringSchema(),
          omitEmpty: true,
        },
        {
          key: 'next-protocol',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'next-protocol-approvals',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'next-protocol-switch-on',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'next-protocol-vote-before',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (proto) The current protocol version.
   */
  public currentProtocol: string;

  /**
   * (nextproto) The next proposed protocol version.
   */
  public nextProtocol?: string;

  /**
   * (nextyes) Number of blocks which approved the protocol upgrade.
   */
  public nextProtocolApprovals?: number;

  /**
   * (nextswitch) Round on which the protocol upgrade will take effect.
   */
  public nextProtocolSwitchOn?: bigint;

  /**
   * (nextbefore) Deadline round for this protocol upgrade (No votes will be consider
   * after this round).
   */
  public nextProtocolVoteBefore?: bigint;

  /**
   * Creates a new `BlockUpgradeState` object.
   * @param currentProtocol - (proto) The current protocol version.
   * @param nextProtocol - (nextproto) The next proposed protocol version.
   * @param nextProtocolApprovals - (nextyes) Number of blocks which approved the protocol upgrade.
   * @param nextProtocolSwitchOn - (nextswitch) Round on which the protocol upgrade will take effect.
   * @param nextProtocolVoteBefore - (nextbefore) Deadline round for this protocol upgrade (No votes will be consider
   * after this round).
   */
  constructor({
    currentProtocol,
    nextProtocol,
    nextProtocolApprovals,
    nextProtocolSwitchOn,
    nextProtocolVoteBefore,
  }: {
    currentProtocol: string;
    nextProtocol?: string;
    nextProtocolApprovals?: number | bigint;
    nextProtocolSwitchOn?: number | bigint;
    nextProtocolVoteBefore?: number | bigint;
  }) {
    this.currentProtocol = currentProtocol;
    this.nextProtocol = nextProtocol;
    this.nextProtocolApprovals =
      typeof nextProtocolApprovals === 'undefined'
        ? undefined
        : ensureSafeInteger(nextProtocolApprovals);
    this.nextProtocolSwitchOn =
      typeof nextProtocolSwitchOn === 'undefined'
        ? undefined
        : ensureBigInt(nextProtocolSwitchOn);
    this.nextProtocolVoteBefore =
      typeof nextProtocolVoteBefore === 'undefined'
        ? undefined
        : ensureBigInt(nextProtocolVoteBefore);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BlockUpgradeState.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['current-protocol', this.currentProtocol],
      ['next-protocol', this.nextProtocol],
      ['next-protocol-approvals', this.nextProtocolApprovals],
      ['next-protocol-switch-on', this.nextProtocolSwitchOn],
      ['next-protocol-vote-before', this.nextProtocolVoteBefore],
    ]);
  }

  static fromEncodingData(data: unknown): BlockUpgradeState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BlockUpgradeState: ${data}`);
    }
    return new BlockUpgradeState({
      currentProtocol: data.get('current-protocol'),
      nextProtocol: data.get('next-protocol'),
      nextProtocolApprovals: data.get('next-protocol-approvals'),
      nextProtocolSwitchOn: data.get('next-protocol-switch-on'),
      nextProtocolVoteBefore: data.get('next-protocol-vote-before'),
    });
  }
}

/**
 * Fields relating to voting for a protocol upgrade.
 */
export class BlockUpgradeVote implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'upgrade-approve',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'upgrade-delay',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'upgrade-propose',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (upgradeyes) Indicates a yes vote for the current proposal.
   */
  public upgradeApprove?: boolean;

  /**
   * (upgradedelay) Indicates the time between acceptance and execution.
   */
  public upgradeDelay?: bigint;

  /**
   * (upgradeprop) Indicates a proposed upgrade.
   */
  public upgradePropose?: string;

  /**
   * Creates a new `BlockUpgradeVote` object.
   * @param upgradeApprove - (upgradeyes) Indicates a yes vote for the current proposal.
   * @param upgradeDelay - (upgradedelay) Indicates the time between acceptance and execution.
   * @param upgradePropose - (upgradeprop) Indicates a proposed upgrade.
   */
  constructor({
    upgradeApprove,
    upgradeDelay,
    upgradePropose,
  }: {
    upgradeApprove?: boolean;
    upgradeDelay?: number | bigint;
    upgradePropose?: string;
  }) {
    this.upgradeApprove = upgradeApprove;
    this.upgradeDelay =
      typeof upgradeDelay === 'undefined'
        ? undefined
        : ensureBigInt(upgradeDelay);
    this.upgradePropose = upgradePropose;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BlockUpgradeVote.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['upgrade-approve', this.upgradeApprove],
      ['upgrade-delay', this.upgradeDelay],
      ['upgrade-propose', this.upgradePropose],
    ]);
  }

  static fromEncodingData(data: unknown): BlockUpgradeVote {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BlockUpgradeVote: ${data}`);
    }
    return new BlockUpgradeVote({
      upgradeApprove: data.get('upgrade-approve'),
      upgradeDelay: data.get('upgrade-delay'),
      upgradePropose: data.get('upgrade-propose'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'name', valueSchema: new ByteArraySchema(), omitEmpty: true },
        { key: 'round', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'value', valueSchema: new ByteArraySchema(), omitEmpty: true }
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
    return new Map<string, unknown>([
      ['name', this.name],
      ['round', this.round],
      ['value', this.value],
    ]);
  }

  static fromEncodingData(data: unknown): Box {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded Box: ${data}`);
    }
    return new Box({
      name: data.get('name'),
      round: data.get('round'),
      value: data.get('value'),
    });
  }
}

/**
 * Box descriptor describes an app box without a value.
 */
export class BoxDescriptor implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries({
        key: 'name',
        valueSchema: new ByteArraySchema(),
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
    return new Map<string, unknown>([['name', this.name]]);
  }

  static fromEncodingData(data: unknown): BoxDescriptor {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BoxDescriptor: ${data}`);
    }
    return new BoxDescriptor({
      name: data.get('name'),
    });
  }
}

/**
 * BoxReference names a box by its name and the application ID it belongs to.
 */
export class BoxReference implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'app', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'name', valueSchema: new ByteArraySchema(), omitEmpty: true }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Application ID to which the box belongs, or zero if referring to the called
   * application.
   */
  public app: number;

  /**
   * Base64 encoded box name
   */
  public name: Uint8Array;

  /**
   * Creates a new `BoxReference` object.
   * @param app - Application ID to which the box belongs, or zero if referring to the called
   * application.
   * @param name - Base64 encoded box name
   */
  constructor({
    app,
    name,
  }: {
    app: number | bigint;
    name: string | Uint8Array;
  }) {
    this.app = ensureSafeInteger(app);
    this.name = typeof name === 'string' ? base64ToBytes(name) : name;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BoxReference.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['app', this.app],
      ['name', this.name],
    ]);
  }

  static fromEncodingData(data: unknown): BoxReference {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BoxReference: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'application-id',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'boxes',
          valueSchema: new ArraySchema(BoxDescriptor.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (appidx) application index.
   */
  public applicationId: bigint;

  public boxes: BoxDescriptor[];

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `BoxesResponse` object.
   * @param applicationId - (appidx) application index.
   * @param boxes -
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    applicationId,
    boxes,
    nextToken,
  }: {
    applicationId: number | bigint;
    boxes: BoxDescriptor[];
    nextToken?: string;
  }) {
    this.applicationId = ensureBigInt(applicationId);
    this.boxes = boxes;
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return BoxesResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['application-id', this.applicationId],
      ['boxes', this.boxes.map((v) => v.toEncodingData())],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): BoxesResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BoxesResponse: ${data}`);
    }
    return new BoxesResponse({
      applicationId: data.get('application-id'),
      boxes: (data.get('boxes') ?? []).map((v: unknown) =>
        BoxDescriptor.fromEncodingData(v)
      ),
      nextToken: data.get('next-token'),
    });
  }
}

/**
 * Response for errors
 */
export class ErrorResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'message', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'data',
          valueSchema: new OptionalSchema(UntypedValue.encodingSchema),
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
    return new Map<string, unknown>([
      ['message', this.message],
      [
        'data',
        typeof this.data !== 'undefined'
          ? this.data.toEncodingData()
          : undefined,
      ],
    ]);
  }

  static fromEncodingData(data: unknown): ErrorResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ErrorResponse: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'action', valueSchema: new Uint64Schema(), omitEmpty: true },
        {
          key: 'bytes',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'uint',
          valueSchema: new OptionalSchema(new Uint64Schema()),
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
    return new Map<string, unknown>([
      ['action', this.action],
      ['bytes', this.bytes],
      ['uint', this.uint],
    ]);
  }

  static fromEncodingData(data: unknown): EvalDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded EvalDelta: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'key', valueSchema: new StringSchema(), omitEmpty: true },
        { key: 'value', valueSchema: EvalDelta.encodingSchema, omitEmpty: true }
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
    return new Map<string, unknown>([
      ['key', this.key],
      ['value', this.value.toEncodingData()],
    ]);
  }

  static fromEncodingData(data: unknown): EvalDeltaKeyValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded EvalDeltaKeyValue: ${data}`);
    }
    return new EvalDeltaKeyValue({
      key: data.get('key'),
      value: EvalDelta.fromEncodingData(data.get('value') ?? new Map()),
    });
  }
}

export class HashFactory implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries({
        key: 'hash-type',
        valueSchema: new OptionalSchema(new Uint64Schema()),
        omitEmpty: true,
      });
    }
    return this.encodingSchemaValue;
  }

  /**
   * (t)
   */
  public hashType?: number;

  /**
   * Creates a new `HashFactory` object.
   * @param hashType - (t)
   */
  constructor({ hashType }: { hashType?: number | bigint }) {
    this.hashType =
      typeof hashType === 'undefined' ? undefined : ensureSafeInteger(hashType);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return HashFactory.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([['hash-type', this.hashType]]);
  }

  static fromEncodingData(data: unknown): HashFactory {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded HashFactory: ${data}`);
    }
    return new HashFactory({
      hashType: data.get('hash-type'),
    });
  }
}

/**
 * (hbprf) HbProof is a signature using HeartbeatAddress's partkey, thereby showing
 * it is online.
 */
export class HbProofFields implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'hb-pk',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'hb-pk1sig',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'hb-pk2',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'hb-pk2sig',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'hb-sig',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (p) Public key of the heartbeat message.
   */
  public hbPk?: Uint8Array;

  /**
   * (p1s) Signature of OneTimeSignatureSubkeyOffsetID(PK, Batch, Offset) under the
   * key PK2.
   */
  public hbPk1sig?: Uint8Array;

  /**
   * (p2) Key for new-style two-level ephemeral signature.
   */
  public hbPk2?: Uint8Array;

  /**
   * (p2s) Signature of OneTimeSignatureSubkeyBatchID(PK2, Batch) under the master
   * key (OneTimeSignatureVerifier).
   */
  public hbPk2sig?: Uint8Array;

  /**
   * (s) Signature of the heartbeat message.
   */
  public hbSig?: Uint8Array;

  /**
   * Creates a new `HbProofFields` object.
   * @param hbPk - (p) Public key of the heartbeat message.
   * @param hbPk1sig - (p1s) Signature of OneTimeSignatureSubkeyOffsetID(PK, Batch, Offset) under the
   * key PK2.
   * @param hbPk2 - (p2) Key for new-style two-level ephemeral signature.
   * @param hbPk2sig - (p2s) Signature of OneTimeSignatureSubkeyBatchID(PK2, Batch) under the master
   * key (OneTimeSignatureVerifier).
   * @param hbSig - (s) Signature of the heartbeat message.
   */
  constructor({
    hbPk,
    hbPk1sig,
    hbPk2,
    hbPk2sig,
    hbSig,
  }: {
    hbPk?: string | Uint8Array;
    hbPk1sig?: string | Uint8Array;
    hbPk2?: string | Uint8Array;
    hbPk2sig?: string | Uint8Array;
    hbSig?: string | Uint8Array;
  }) {
    this.hbPk = typeof hbPk === 'string' ? base64ToBytes(hbPk) : hbPk;
    this.hbPk1sig =
      typeof hbPk1sig === 'string' ? base64ToBytes(hbPk1sig) : hbPk1sig;
    this.hbPk2 = typeof hbPk2 === 'string' ? base64ToBytes(hbPk2) : hbPk2;
    this.hbPk2sig =
      typeof hbPk2sig === 'string' ? base64ToBytes(hbPk2sig) : hbPk2sig;
    this.hbSig = typeof hbSig === 'string' ? base64ToBytes(hbSig) : hbSig;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return HbProofFields.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['hb-pk', this.hbPk],
      ['hb-pk1sig', this.hbPk1sig],
      ['hb-pk2', this.hbPk2],
      ['hb-pk2sig', this.hbPk2sig],
      ['hb-sig', this.hbSig],
    ]);
  }

  static fromEncodingData(data: unknown): HbProofFields {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded HbProofFields: ${data}`);
    }
    return new HbProofFields({
      hbPk: data.get('hb-pk'),
      hbPk1sig: data.get('hb-pk1sig'),
      hbPk2: data.get('hb-pk2'),
      hbPk2sig: data.get('hb-pk2sig'),
      hbSig: data.get('hb-sig'),
    });
  }
}

/**
 * A health check response.
 */
export class HealthCheck implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'db-available',
          valueSchema: new BooleanSchema(),
          omitEmpty: true,
        },
        {
          key: 'is-migrating',
          valueSchema: new BooleanSchema(),
          omitEmpty: true,
        },
        { key: 'message', valueSchema: new StringSchema(), omitEmpty: true },
        { key: 'round', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'version', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'data',
          valueSchema: new OptionalSchema(UntypedValue.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'errors',
          valueSchema: new OptionalSchema(new ArraySchema(new StringSchema())),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public dbAvailable: boolean;

  public isMigrating: boolean;

  public message: string;

  public round: bigint;

  /**
   * Current version.
   */
  public version: string;

  public data?: UntypedValue;

  public errors?: string[];

  /**
   * Creates a new `HealthCheck` object.
   * @param dbAvailable -
   * @param isMigrating -
   * @param message -
   * @param round -
   * @param version - Current version.
   * @param data -
   * @param errors -
   */
  constructor({
    dbAvailable,
    isMigrating,
    message,
    round,
    version,
    data,
    errors,
  }: {
    dbAvailable: boolean;
    isMigrating: boolean;
    message: string;
    round: number | bigint;
    version: string;
    data?: UntypedValue;
    errors?: string[];
  }) {
    this.dbAvailable = dbAvailable;
    this.isMigrating = isMigrating;
    this.message = message;
    this.round = ensureBigInt(round);
    this.version = version;
    this.data = data;
    this.errors = errors;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return HealthCheck.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['db-available', this.dbAvailable],
      ['is-migrating', this.isMigrating],
      ['message', this.message],
      ['round', this.round],
      ['version', this.version],
      [
        'data',
        typeof this.data !== 'undefined'
          ? this.data.toEncodingData()
          : undefined,
      ],
      ['errors', this.errors],
    ]);
  }

  static fromEncodingData(data: unknown): HealthCheck {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded HealthCheck: ${data}`);
    }
    return new HealthCheck({
      dbAvailable: data.get('db-available'),
      isMigrating: data.get('is-migrating'),
      message: data.get('message'),
      round: data.get('round'),
      version: data.get('version'),
      data:
        typeof data.get('data') !== 'undefined'
          ? UntypedValue.fromEncodingData(data.get('data'))
          : undefined,
      errors: data.get('errors'),
    });
  }
}

/**
 * HoldingRef names a holding by referring to an Address and Asset it belongs to.
 */
export class HoldingRef implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'address', valueSchema: new StringSchema(), omitEmpty: true },
        { key: 'asset', valueSchema: new Uint64Schema(), omitEmpty: true }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (d) Address in access list, or the sender of the transaction.
   */
  public address: Address;

  /**
   * (s) Asset ID for asset in access list.
   */
  public asset: number;

  /**
   * Creates a new `HoldingRef` object.
   * @param address - (d) Address in access list, or the sender of the transaction.
   * @param asset - (s) Asset ID for asset in access list.
   */
  constructor({
    address,
    asset,
  }: {
    address: Address | string;
    asset: number | bigint;
  }) {
    this.address =
      typeof address === 'string' ? Address.fromString(address) : address;
    this.asset = ensureSafeInteger(asset);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return HoldingRef.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['address', this.address.toString()],
      ['asset', this.asset],
    ]);
  }

  static fromEncodingData(data: unknown): HoldingRef {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded HoldingRef: ${data}`);
    }
    return new HoldingRef({
      address: data.get('address'),
      asset: data.get('asset'),
    });
  }
}

export class IndexerStateProofMessage implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'block-headers-commitment',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'first-attested-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'latest-attested-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'ln-proven-weight',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'voters-commitment',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (b)
   */
  public blockHeadersCommitment?: Uint8Array;

  /**
   * (f)
   */
  public firstAttestedRound?: bigint;

  /**
   * (l)
   */
  public latestAttestedRound?: bigint;

  /**
   * (P)
   */
  public lnProvenWeight?: bigint;

  /**
   * (v)
   */
  public votersCommitment?: Uint8Array;

  /**
   * Creates a new `IndexerStateProofMessage` object.
   * @param blockHeadersCommitment - (b)
   * @param firstAttestedRound - (f)
   * @param latestAttestedRound - (l)
   * @param lnProvenWeight - (P)
   * @param votersCommitment - (v)
   */
  constructor({
    blockHeadersCommitment,
    firstAttestedRound,
    latestAttestedRound,
    lnProvenWeight,
    votersCommitment,
  }: {
    blockHeadersCommitment?: string | Uint8Array;
    firstAttestedRound?: number | bigint;
    latestAttestedRound?: number | bigint;
    lnProvenWeight?: number | bigint;
    votersCommitment?: string | Uint8Array;
  }) {
    this.blockHeadersCommitment =
      typeof blockHeadersCommitment === 'string'
        ? base64ToBytes(blockHeadersCommitment)
        : blockHeadersCommitment;
    this.firstAttestedRound =
      typeof firstAttestedRound === 'undefined'
        ? undefined
        : ensureBigInt(firstAttestedRound);
    this.latestAttestedRound =
      typeof latestAttestedRound === 'undefined'
        ? undefined
        : ensureBigInt(latestAttestedRound);
    this.lnProvenWeight =
      typeof lnProvenWeight === 'undefined'
        ? undefined
        : ensureBigInt(lnProvenWeight);
    this.votersCommitment =
      typeof votersCommitment === 'string'
        ? base64ToBytes(votersCommitment)
        : votersCommitment;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return IndexerStateProofMessage.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['block-headers-commitment', this.blockHeadersCommitment],
      ['first-attested-round', this.firstAttestedRound],
      ['latest-attested-round', this.latestAttestedRound],
      ['ln-proven-weight', this.lnProvenWeight],
      ['voters-commitment', this.votersCommitment],
    ]);
  }

  static fromEncodingData(data: unknown): IndexerStateProofMessage {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded IndexerStateProofMessage: ${data}`);
    }
    return new IndexerStateProofMessage({
      blockHeadersCommitment: data.get('block-headers-commitment'),
      firstAttestedRound: data.get('first-attested-round'),
      latestAttestedRound: data.get('latest-attested-round'),
      lnProvenWeight: data.get('ln-proven-weight'),
      votersCommitment: data.get('voters-commitment'),
    });
  }
}

/**
 * LocalsRef names a local state by referring to an Address and App it belongs to.
 */
export class LocalsRef implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'address', valueSchema: new StringSchema(), omitEmpty: true },
        { key: 'app', valueSchema: new Uint64Schema(), omitEmpty: true }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (d) Address in access list, or the sender of the transaction.
   */
  public address: Address;

  /**
   * (p) Application ID for app in access list, or zero if referring to the called
   * application.
   */
  public app: number;

  /**
   * Creates a new `LocalsRef` object.
   * @param address - (d) Address in access list, or the sender of the transaction.
   * @param app - (p) Application ID for app in access list, or zero if referring to the called
   * application.
   */
  constructor({
    address,
    app,
  }: {
    address: Address | string;
    app: number | bigint;
  }) {
    this.address =
      typeof address === 'string' ? Address.fromString(address) : address;
    this.app = ensureSafeInteger(app);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return LocalsRef.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['address', this.address.toString()],
      ['app', this.app],
    ]);
  }

  static fromEncodingData(data: unknown): LocalsRef {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded LocalsRef: ${data}`);
    }
    return new LocalsRef({
      address: data.get('address'),
      app: data.get('app'),
    });
  }
}

export class MerkleArrayProof implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'hash-factory',
          valueSchema: new OptionalSchema(HashFactory.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'path',
          valueSchema: new OptionalSchema(
            new ArraySchema(new ByteArraySchema())
          ),
          omitEmpty: true,
        },
        {
          key: 'tree-depth',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public hashFactory?: HashFactory;

  /**
   * (pth)
   */
  public path?: Uint8Array[];

  /**
   * (td)
   */
  public treeDepth?: number;

  /**
   * Creates a new `MerkleArrayProof` object.
   * @param hashFactory -
   * @param path - (pth)
   * @param treeDepth - (td)
   */
  constructor({
    hashFactory,
    path,
    treeDepth,
  }: {
    hashFactory?: HashFactory;
    path?: Uint8Array[];
    treeDepth?: number | bigint;
  }) {
    this.hashFactory = hashFactory;
    this.path = path;
    this.treeDepth =
      typeof treeDepth === 'undefined'
        ? undefined
        : ensureSafeInteger(treeDepth);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return MerkleArrayProof.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'hash-factory',
        typeof this.hashFactory !== 'undefined'
          ? this.hashFactory.toEncodingData()
          : undefined,
      ],
      ['path', this.path],
      ['tree-depth', this.treeDepth],
    ]);
  }

  static fromEncodingData(data: unknown): MerkleArrayProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded MerkleArrayProof: ${data}`);
    }
    return new MerkleArrayProof({
      hashFactory:
        typeof data.get('hash-factory') !== 'undefined'
          ? HashFactory.fromEncodingData(data.get('hash-factory'))
          : undefined,
      path: data.get('path'),
      treeDepth: data.get('tree-depth'),
    });
  }
}

/**
 * A simplified version of AssetHolding
 */
export class MiniAssetHolding implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'address', valueSchema: new StringSchema(), omitEmpty: true },
        { key: 'amount', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'is-frozen', valueSchema: new BooleanSchema(), omitEmpty: true },
        {
          key: 'deleted',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'opted-in-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'opted-out-at-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public address: string;

  public amount: bigint;

  public isFrozen: boolean;

  /**
   * Whether or not this asset holding is currently deleted from its account.
   */
  public deleted?: boolean;

  /**
   * Round during which the account opted into the asset.
   */
  public optedInAtRound?: bigint;

  /**
   * Round during which the account opted out of the asset.
   */
  public optedOutAtRound?: bigint;

  /**
   * Creates a new `MiniAssetHolding` object.
   * @param address -
   * @param amount -
   * @param isFrozen -
   * @param deleted - Whether or not this asset holding is currently deleted from its account.
   * @param optedInAtRound - Round during which the account opted into the asset.
   * @param optedOutAtRound - Round during which the account opted out of the asset.
   */
  constructor({
    address,
    amount,
    isFrozen,
    deleted,
    optedInAtRound,
    optedOutAtRound,
  }: {
    address: string;
    amount: number | bigint;
    isFrozen: boolean;
    deleted?: boolean;
    optedInAtRound?: number | bigint;
    optedOutAtRound?: number | bigint;
  }) {
    this.address = address;
    this.amount = ensureBigInt(amount);
    this.isFrozen = isFrozen;
    this.deleted = deleted;
    this.optedInAtRound =
      typeof optedInAtRound === 'undefined'
        ? undefined
        : ensureBigInt(optedInAtRound);
    this.optedOutAtRound =
      typeof optedOutAtRound === 'undefined'
        ? undefined
        : ensureBigInt(optedOutAtRound);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return MiniAssetHolding.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['address', this.address],
      ['amount', this.amount],
      ['is-frozen', this.isFrozen],
      ['deleted', this.deleted],
      ['opted-in-at-round', this.optedInAtRound],
      ['opted-out-at-round', this.optedOutAtRound],
    ]);
  }

  static fromEncodingData(data: unknown): MiniAssetHolding {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded MiniAssetHolding: ${data}`);
    }
    return new MiniAssetHolding({
      address: data.get('address'),
      amount: data.get('amount'),
      isFrozen: data.get('is-frozen'),
      deleted: data.get('deleted'),
      optedInAtRound: data.get('opted-in-at-round'),
      optedOutAtRound: data.get('opted-out-at-round'),
    });
  }
}

/**
 * Participation account data that needs to be checked/acted on by the network.
 */
export class ParticipationUpdates implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'absent-participation-accounts',
          valueSchema: new OptionalSchema(new ArraySchema(new StringSchema())),
          omitEmpty: true,
        },
        {
          key: 'expired-participation-accounts',
          valueSchema: new OptionalSchema(new ArraySchema(new StringSchema())),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (partupabs) a list of online accounts that need to be suspended.
   */
  public absentParticipationAccounts?: string[];

  /**
   * (partupdrmv) a list of online accounts that needs to be converted to offline
   * since their participation key expired.
   */
  public expiredParticipationAccounts?: string[];

  /**
   * Creates a new `ParticipationUpdates` object.
   * @param absentParticipationAccounts - (partupabs) a list of online accounts that need to be suspended.
   * @param expiredParticipationAccounts - (partupdrmv) a list of online accounts that needs to be converted to offline
   * since their participation key expired.
   */
  constructor({
    absentParticipationAccounts,
    expiredParticipationAccounts,
  }: {
    absentParticipationAccounts?: string[];
    expiredParticipationAccounts?: string[];
  }) {
    this.absentParticipationAccounts = absentParticipationAccounts;
    this.expiredParticipationAccounts = expiredParticipationAccounts;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ParticipationUpdates.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['absent-participation-accounts', this.absentParticipationAccounts],
      ['expired-participation-accounts', this.expiredParticipationAccounts],
    ]);
  }

  static fromEncodingData(data: unknown): ParticipationUpdates {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ParticipationUpdates: ${data}`);
    }
    return new ParticipationUpdates({
      absentParticipationAccounts: data.get('absent-participation-accounts'),
      expiredParticipationAccounts: data.get('expired-participation-accounts'),
    });
  }
}

/**
 * ResourceRef names a single resource. Only one of the fields should be set.
 */
export class ResourceRef implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'address',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'application-id',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'asset-id',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'box',
          valueSchema: new OptionalSchema(BoxReference.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'holding',
          valueSchema: new OptionalSchema(HoldingRef.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'local',
          valueSchema: new OptionalSchema(LocalsRef.encodingSchema),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (d) Account whose balance record is accessible by the executing ApprovalProgram
   * or ClearStateProgram.
   */
  public address?: Address;

  /**
   * (p) Application id whose GlobalState may be read by the executing
   * ApprovalProgram or ClearStateProgram.
   */
  public applicationId?: number;

  /**
   * (s) Asset whose AssetParams may be read by the executing
   * ApprovalProgram or ClearStateProgram.
   */
  public assetId?: number;

  /**
   * BoxReference names a box by its name and the application ID it belongs to.
   */
  public box?: BoxReference;

  /**
   * HoldingRef names a holding by referring to an Address and Asset it belongs to.
   */
  public holding?: HoldingRef;

  /**
   * LocalsRef names a local state by referring to an Address and App it belongs to.
   */
  public local?: LocalsRef;

  /**
   * Creates a new `ResourceRef` object.
   * @param address - (d) Account whose balance record is accessible by the executing ApprovalProgram
   * or ClearStateProgram.
   * @param applicationId - (p) Application id whose GlobalState may be read by the executing
   * ApprovalProgram or ClearStateProgram.
   * @param assetId - (s) Asset whose AssetParams may be read by the executing
   * ApprovalProgram or ClearStateProgram.
   * @param box - BoxReference names a box by its name and the application ID it belongs to.
   * @param holding - HoldingRef names a holding by referring to an Address and Asset it belongs to.
   * @param local - LocalsRef names a local state by referring to an Address and App it belongs to.
   */
  constructor({
    address,
    applicationId,
    assetId,
    box,
    holding,
    local,
  }: {
    address?: Address | string;
    applicationId?: number | bigint;
    assetId?: number | bigint;
    box?: BoxReference;
    holding?: HoldingRef;
    local?: LocalsRef;
  }) {
    this.address =
      typeof address === 'string' ? Address.fromString(address) : address;
    this.applicationId =
      typeof applicationId === 'undefined'
        ? undefined
        : ensureSafeInteger(applicationId);
    this.assetId =
      typeof assetId === 'undefined' ? undefined : ensureSafeInteger(assetId);
    this.box = box;
    this.holding = holding;
    this.local = local;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ResourceRef.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'address',
        typeof this.address !== 'undefined'
          ? this.address.toString()
          : undefined,
      ],
      ['application-id', this.applicationId],
      ['asset-id', this.assetId],
      [
        'box',
        typeof this.box !== 'undefined' ? this.box.toEncodingData() : undefined,
      ],
      [
        'holding',
        typeof this.holding !== 'undefined'
          ? this.holding.toEncodingData()
          : undefined,
      ],
      [
        'local',
        typeof this.local !== 'undefined'
          ? this.local.toEncodingData()
          : undefined,
      ],
    ]);
  }

  static fromEncodingData(data: unknown): ResourceRef {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ResourceRef: ${data}`);
    }
    return new ResourceRef({
      address: data.get('address'),
      applicationId: data.get('application-id'),
      assetId: data.get('asset-id'),
      box:
        typeof data.get('box') !== 'undefined'
          ? BoxReference.fromEncodingData(data.get('box'))
          : undefined,
      holding:
        typeof data.get('holding') !== 'undefined'
          ? HoldingRef.fromEncodingData(data.get('holding'))
          : undefined,
      local:
        typeof data.get('local') !== 'undefined'
          ? LocalsRef.fromEncodingData(data.get('local'))
          : undefined,
    });
  }
}

/**
 * (sp) represents a state proof.
 * Definition:
 * crypto/stateproof/structs.go : StateProof
 */
export class StateProofFields implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'part-proofs',
          valueSchema: new OptionalSchema(MerkleArrayProof.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'positions-to-reveal',
          valueSchema: new OptionalSchema(new ArraySchema(new Uint64Schema())),
          omitEmpty: true,
        },
        {
          key: 'reveals',
          valueSchema: new OptionalSchema(
            new ArraySchema(StateProofReveal.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'salt-version',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'sig-commit',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'sig-proofs',
          valueSchema: new OptionalSchema(MerkleArrayProof.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'signed-weight',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (P)
   */
  public partProofs?: MerkleArrayProof;

  /**
   * (pr) Sequence of reveal positions.
   */
  public positionsToReveal?: bigint[];

  /**
   * (r) Note that this is actually stored as a map[uint64] - Reveal in the actual
   * msgp
   */
  public reveals?: StateProofReveal[];

  /**
   * (v) Salt version of the merkle signature.
   */
  public saltVersion?: number;

  /**
   * (c)
   */
  public sigCommit?: Uint8Array;

  /**
   * (S)
   */
  public sigProofs?: MerkleArrayProof;

  /**
   * (w)
   */
  public signedWeight?: bigint;

  /**
   * Creates a new `StateProofFields` object.
   * @param partProofs - (P)
   * @param positionsToReveal - (pr) Sequence of reveal positions.
   * @param reveals - (r) Note that this is actually stored as a map[uint64] - Reveal in the actual
   * msgp
   * @param saltVersion - (v) Salt version of the merkle signature.
   * @param sigCommit - (c)
   * @param sigProofs - (S)
   * @param signedWeight - (w)
   */
  constructor({
    partProofs,
    positionsToReveal,
    reveals,
    saltVersion,
    sigCommit,
    sigProofs,
    signedWeight,
  }: {
    partProofs?: MerkleArrayProof;
    positionsToReveal?: (number | bigint)[];
    reveals?: StateProofReveal[];
    saltVersion?: number | bigint;
    sigCommit?: string | Uint8Array;
    sigProofs?: MerkleArrayProof;
    signedWeight?: number | bigint;
  }) {
    this.partProofs = partProofs;
    this.positionsToReveal =
      typeof positionsToReveal === 'undefined'
        ? undefined
        : positionsToReveal.map(ensureBigInt);
    this.reveals = reveals;
    this.saltVersion =
      typeof saltVersion === 'undefined'
        ? undefined
        : ensureSafeInteger(saltVersion);
    this.sigCommit =
      typeof sigCommit === 'string' ? base64ToBytes(sigCommit) : sigCommit;
    this.sigProofs = sigProofs;
    this.signedWeight =
      typeof signedWeight === 'undefined'
        ? undefined
        : ensureBigInt(signedWeight);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return StateProofFields.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'part-proofs',
        typeof this.partProofs !== 'undefined'
          ? this.partProofs.toEncodingData()
          : undefined,
      ],
      ['positions-to-reveal', this.positionsToReveal],
      [
        'reveals',
        typeof this.reveals !== 'undefined'
          ? this.reveals.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['salt-version', this.saltVersion],
      ['sig-commit', this.sigCommit],
      [
        'sig-proofs',
        typeof this.sigProofs !== 'undefined'
          ? this.sigProofs.toEncodingData()
          : undefined,
      ],
      ['signed-weight', this.signedWeight],
    ]);
  }

  static fromEncodingData(data: unknown): StateProofFields {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProofFields: ${data}`);
    }
    return new StateProofFields({
      partProofs:
        typeof data.get('part-proofs') !== 'undefined'
          ? MerkleArrayProof.fromEncodingData(data.get('part-proofs'))
          : undefined,
      positionsToReveal: data.get('positions-to-reveal'),
      reveals:
        typeof data.get('reveals') !== 'undefined'
          ? data
              .get('reveals')
              .map((v: unknown) => StateProofReveal.fromEncodingData(v))
          : undefined,
      saltVersion: data.get('salt-version'),
      sigCommit: data.get('sig-commit'),
      sigProofs:
        typeof data.get('sig-proofs') !== 'undefined'
          ? MerkleArrayProof.fromEncodingData(data.get('sig-proofs'))
          : undefined,
      signedWeight: data.get('signed-weight'),
    });
  }
}

export class StateProofParticipant implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'verifier',
          valueSchema: new OptionalSchema(StateProofVerifier.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'weight',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (p)
   */
  public verifier?: StateProofVerifier;

  /**
   * (w)
   */
  public weight?: bigint;

  /**
   * Creates a new `StateProofParticipant` object.
   * @param verifier - (p)
   * @param weight - (w)
   */
  constructor({
    verifier,
    weight,
  }: {
    verifier?: StateProofVerifier;
    weight?: number | bigint;
  }) {
    this.verifier = verifier;
    this.weight =
      typeof weight === 'undefined' ? undefined : ensureBigInt(weight);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return StateProofParticipant.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'verifier',
        typeof this.verifier !== 'undefined'
          ? this.verifier.toEncodingData()
          : undefined,
      ],
      ['weight', this.weight],
    ]);
  }

  static fromEncodingData(data: unknown): StateProofParticipant {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProofParticipant: ${data}`);
    }
    return new StateProofParticipant({
      verifier:
        typeof data.get('verifier') !== 'undefined'
          ? StateProofVerifier.fromEncodingData(data.get('verifier'))
          : undefined,
      weight: data.get('weight'),
    });
  }
}

export class StateProofReveal implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'participant',
          valueSchema: new OptionalSchema(StateProofParticipant.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'position',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'sig-slot',
          valueSchema: new OptionalSchema(StateProofSigSlot.encodingSchema),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (p)
   */
  public participant?: StateProofParticipant;

  /**
   * The position in the signature and participants arrays corresponding to this
   * entry.
   */
  public position?: bigint;

  /**
   * (s)
   */
  public sigSlot?: StateProofSigSlot;

  /**
   * Creates a new `StateProofReveal` object.
   * @param participant - (p)
   * @param position - The position in the signature and participants arrays corresponding to this
   * entry.
   * @param sigSlot - (s)
   */
  constructor({
    participant,
    position,
    sigSlot,
  }: {
    participant?: StateProofParticipant;
    position?: number | bigint;
    sigSlot?: StateProofSigSlot;
  }) {
    this.participant = participant;
    this.position =
      typeof position === 'undefined' ? undefined : ensureBigInt(position);
    this.sigSlot = sigSlot;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return StateProofReveal.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'participant',
        typeof this.participant !== 'undefined'
          ? this.participant.toEncodingData()
          : undefined,
      ],
      ['position', this.position],
      [
        'sig-slot',
        typeof this.sigSlot !== 'undefined'
          ? this.sigSlot.toEncodingData()
          : undefined,
      ],
    ]);
  }

  static fromEncodingData(data: unknown): StateProofReveal {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProofReveal: ${data}`);
    }
    return new StateProofReveal({
      participant:
        typeof data.get('participant') !== 'undefined'
          ? StateProofParticipant.fromEncodingData(data.get('participant'))
          : undefined,
      position: data.get('position'),
      sigSlot:
        typeof data.get('sig-slot') !== 'undefined'
          ? StateProofSigSlot.fromEncodingData(data.get('sig-slot'))
          : undefined,
    });
  }
}

export class StateProofSigSlot implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'lower-sig-weight',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'signature',
          valueSchema: new OptionalSchema(StateProofSignature.encodingSchema),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (l) The total weight of signatures in the lower-numbered slots.
   */
  public lowerSigWeight?: bigint;

  public signature?: StateProofSignature;

  /**
   * Creates a new `StateProofSigSlot` object.
   * @param lowerSigWeight - (l) The total weight of signatures in the lower-numbered slots.
   * @param signature -
   */
  constructor({
    lowerSigWeight,
    signature,
  }: {
    lowerSigWeight?: number | bigint;
    signature?: StateProofSignature;
  }) {
    this.lowerSigWeight =
      typeof lowerSigWeight === 'undefined'
        ? undefined
        : ensureBigInt(lowerSigWeight);
    this.signature = signature;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return StateProofSigSlot.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['lower-sig-weight', this.lowerSigWeight],
      [
        'signature',
        typeof this.signature !== 'undefined'
          ? this.signature.toEncodingData()
          : undefined,
      ],
    ]);
  }

  static fromEncodingData(data: unknown): StateProofSigSlot {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProofSigSlot: ${data}`);
    }
    return new StateProofSigSlot({
      lowerSigWeight: data.get('lower-sig-weight'),
      signature:
        typeof data.get('signature') !== 'undefined'
          ? StateProofSignature.fromEncodingData(data.get('signature'))
          : undefined,
    });
  }
}

export class StateProofSignature implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'falcon-signature',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'merkle-array-index',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'proof',
          valueSchema: new OptionalSchema(MerkleArrayProof.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'verifying-key',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  public falconSignature?: Uint8Array;

  public merkleArrayIndex?: number;

  public proof?: MerkleArrayProof;

  /**
   * (vkey)
   */
  public verifyingKey?: Uint8Array;

  /**
   * Creates a new `StateProofSignature` object.
   * @param falconSignature -
   * @param merkleArrayIndex -
   * @param proof -
   * @param verifyingKey - (vkey)
   */
  constructor({
    falconSignature,
    merkleArrayIndex,
    proof,
    verifyingKey,
  }: {
    falconSignature?: string | Uint8Array;
    merkleArrayIndex?: number | bigint;
    proof?: MerkleArrayProof;
    verifyingKey?: string | Uint8Array;
  }) {
    this.falconSignature =
      typeof falconSignature === 'string'
        ? base64ToBytes(falconSignature)
        : falconSignature;
    this.merkleArrayIndex =
      typeof merkleArrayIndex === 'undefined'
        ? undefined
        : ensureSafeInteger(merkleArrayIndex);
    this.proof = proof;
    this.verifyingKey =
      typeof verifyingKey === 'string'
        ? base64ToBytes(verifyingKey)
        : verifyingKey;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return StateProofSignature.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['falcon-signature', this.falconSignature],
      ['merkle-array-index', this.merkleArrayIndex],
      [
        'proof',
        typeof this.proof !== 'undefined'
          ? this.proof.toEncodingData()
          : undefined,
      ],
      ['verifying-key', this.verifyingKey],
    ]);
  }

  static fromEncodingData(data: unknown): StateProofSignature {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProofSignature: ${data}`);
    }
    return new StateProofSignature({
      falconSignature: data.get('falcon-signature'),
      merkleArrayIndex: data.get('merkle-array-index'),
      proof:
        typeof data.get('proof') !== 'undefined'
          ? MerkleArrayProof.fromEncodingData(data.get('proof'))
          : undefined,
      verifyingKey: data.get('verifying-key'),
    });
  }
}

export class StateProofTracking implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'next-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'online-total-weight',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'type',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'voters-commitment',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (n) Next round for which we will accept a state proof transaction.
   */
  public nextRound?: bigint;

  /**
   * (t) The total number of microalgos held by the online accounts during the
   * StateProof round.
   */
  public onlineTotalWeight?: bigint;

  /**
   * State Proof Type. Note the raw object uses map with this as key.
   */
  public type?: number;

  /**
   * (v) Root of a vector commitment containing online accounts that will help sign
   * the proof.
   */
  public votersCommitment?: Uint8Array;

  /**
   * Creates a new `StateProofTracking` object.
   * @param nextRound - (n) Next round for which we will accept a state proof transaction.
   * @param onlineTotalWeight - (t) The total number of microalgos held by the online accounts during the
   * StateProof round.
   * @param type - State Proof Type. Note the raw object uses map with this as key.
   * @param votersCommitment - (v) Root of a vector commitment containing online accounts that will help sign
   * the proof.
   */
  constructor({
    nextRound,
    onlineTotalWeight,
    type,
    votersCommitment,
  }: {
    nextRound?: number | bigint;
    onlineTotalWeight?: number | bigint;
    type?: number | bigint;
    votersCommitment?: string | Uint8Array;
  }) {
    this.nextRound =
      typeof nextRound === 'undefined' ? undefined : ensureBigInt(nextRound);
    this.onlineTotalWeight =
      typeof onlineTotalWeight === 'undefined'
        ? undefined
        : ensureBigInt(onlineTotalWeight);
    this.type =
      typeof type === 'undefined' ? undefined : ensureSafeInteger(type);
    this.votersCommitment =
      typeof votersCommitment === 'string'
        ? base64ToBytes(votersCommitment)
        : votersCommitment;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return StateProofTracking.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['next-round', this.nextRound],
      ['online-total-weight', this.onlineTotalWeight],
      ['type', this.type],
      ['voters-commitment', this.votersCommitment],
    ]);
  }

  static fromEncodingData(data: unknown): StateProofTracking {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProofTracking: ${data}`);
    }
    return new StateProofTracking({
      nextRound: data.get('next-round'),
      onlineTotalWeight: data.get('online-total-weight'),
      type: data.get('type'),
      votersCommitment: data.get('voters-commitment'),
    });
  }
}

export class StateProofVerifier implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'commitment',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'key-lifetime',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (cmt) Represents the root of the vector commitment tree.
   */
  public commitment?: Uint8Array;

  /**
   * (lf) Key lifetime.
   */
  public keyLifetime?: bigint;

  /**
   * Creates a new `StateProofVerifier` object.
   * @param commitment - (cmt) Represents the root of the vector commitment tree.
   * @param keyLifetime - (lf) Key lifetime.
   */
  constructor({
    commitment,
    keyLifetime,
  }: {
    commitment?: string | Uint8Array;
    keyLifetime?: number | bigint;
  }) {
    this.commitment =
      typeof commitment === 'string' ? base64ToBytes(commitment) : commitment;
    this.keyLifetime =
      typeof keyLifetime === 'undefined'
        ? undefined
        : ensureBigInt(keyLifetime);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return StateProofVerifier.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['commitment', this.commitment],
      ['key-lifetime', this.keyLifetime],
    ]);
  }

  static fromEncodingData(data: unknown): StateProofVerifier {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProofVerifier: ${data}`);
    }
    return new StateProofVerifier({
      commitment: data.get('commitment'),
      keyLifetime: data.get('key-lifetime'),
    });
  }
}

/**
 * Represents a (apls) local-state or (apgs) global-state schema. These schemas
 * determine how much storage may be used in a local-state or global-state for an
 * application. The more space used, the larger minimum balance must be maintained
 * in the account holding the data.
 */
export class StateSchema implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'num-byte-slice',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        { key: 'num-uint', valueSchema: new Uint64Schema(), omitEmpty: true }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Maximum number of TEAL byte slices that may be stored in the key/value store.
   */
  public numByteSlice: number;

  /**
   * Maximum number of TEAL uints that may be stored in the key/value store.
   */
  public numUint: number;

  /**
   * Creates a new `StateSchema` object.
   * @param numByteSlice - Maximum number of TEAL byte slices that may be stored in the key/value store.
   * @param numUint - Maximum number of TEAL uints that may be stored in the key/value store.
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
    return StateSchema.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['num-byte-slice', this.numByteSlice],
      ['num-uint', this.numUint],
    ]);
  }

  static fromEncodingData(data: unknown): StateSchema {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateSchema: ${data}`);
    }
    return new StateSchema({
      numByteSlice: data.get('num-byte-slice'),
      numUint: data.get('num-uint'),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'key', valueSchema: new ByteArraySchema(), omitEmpty: true },
        { key: 'value', valueSchema: TealValue.encodingSchema, omitEmpty: true }
      );
    }
    return this.encodingSchemaValue;
  }

  public key: Uint8Array;

  /**
   * Represents a TEAL value.
   */
  public value: TealValue;

  /**
   * Creates a new `TealKeyValue` object.
   * @param key -
   * @param value - Represents a TEAL value.
   */
  constructor({ key, value }: { key: string | Uint8Array; value: TealValue }) {
    this.key = typeof key === 'string' ? base64ToBytes(key) : key;
    this.value = value;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TealKeyValue.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['key', this.key],
      ['value', this.value.toEncodingData()],
    ]);
  }

  static fromEncodingData(data: unknown): TealKeyValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TealKeyValue: ${data}`);
    }
    return new TealKeyValue({
      key: data.get('key'),
      value: TealValue.fromEncodingData(data.get('value') ?? new Map()),
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
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'bytes', valueSchema: new ByteArraySchema(), omitEmpty: true },
        { key: 'type', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'uint', valueSchema: new Uint64Schema(), omitEmpty: true }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * bytes value.
   */
  public bytes: Uint8Array;

  /**
   * type of the value. Value `1` refers to **bytes**, value `2` refers to **uint**
   */
  public type: number;

  /**
   * uint value.
   */
  public uint: bigint;

  /**
   * Creates a new `TealValue` object.
   * @param bytes - bytes value.
   * @param type - type of the value. Value `1` refers to **bytes**, value `2` refers to **uint**
   * @param uint - uint value.
   */
  constructor({
    bytes,
    type,
    uint,
  }: {
    bytes: string | Uint8Array;
    type: number | bigint;
    uint: number | bigint;
  }) {
    this.bytes = typeof bytes === 'string' ? base64ToBytes(bytes) : bytes;
    this.type = ensureSafeInteger(type);
    this.uint = ensureBigInt(uint);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TealValue.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['bytes', this.bytes],
      ['type', this.type],
      ['uint', this.uint],
    ]);
  }

  static fromEncodingData(data: unknown): TealValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TealValue: ${data}`);
    }
    return new TealValue({
      bytes: data.get('bytes'),
      type: data.get('type'),
      uint: data.get('uint'),
    });
  }
}

/**
 * Contains all fields common to all transactions and serves as an envelope to all
 * transactions type. Represents both regular and inner transactions.
 * Definition:
 * data/transactions/signedtxn.go : SignedTxn
 * data/transactions/transaction.go : Transaction
 */
export class Transaction implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'fee', valueSchema: new Uint64Schema(), omitEmpty: true },
        {
          key: 'first-valid',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        { key: 'last-valid', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'sender', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'application-transaction',
          valueSchema: new OptionalSchema(
            TransactionApplication.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'asset-config-transaction',
          valueSchema: new OptionalSchema(
            TransactionAssetConfig.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'asset-freeze-transaction',
          valueSchema: new OptionalSchema(
            TransactionAssetFreeze.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'asset-transfer-transaction',
          valueSchema: new OptionalSchema(
            TransactionAssetTransfer.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'auth-addr',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'close-rewards',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'closing-amount',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'confirmed-round',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'created-application-index',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'created-asset-index',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'genesis-hash',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'genesis-id',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'global-state-delta',
          valueSchema: new OptionalSchema(
            new ArraySchema(EvalDeltaKeyValue.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'group',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'heartbeat-transaction',
          valueSchema: new OptionalSchema(TransactionHeartbeat.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'id',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'inner-txns',
          valueSchema: new OptionalSchema(
            new ArraySchema(Transaction.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'intra-round-offset',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'keyreg-transaction',
          valueSchema: new OptionalSchema(TransactionKeyreg.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'lease',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'local-state-delta',
          valueSchema: new OptionalSchema(
            new ArraySchema(AccountStateDelta.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'logs',
          valueSchema: new OptionalSchema(
            new ArraySchema(new ByteArraySchema())
          ),
          omitEmpty: true,
        },
        {
          key: 'note',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'payment-transaction',
          valueSchema: new OptionalSchema(TransactionPayment.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'receiver-rewards',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'rekey-to',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'round-time',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'sender-rewards',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'signature',
          valueSchema: new OptionalSchema(TransactionSignature.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'state-proof-transaction',
          valueSchema: new OptionalSchema(TransactionStateProof.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'tx-type',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (fee) Transaction fee.
   */
  public fee: bigint;

  /**
   * (fv) First valid round for this transaction.
   */
  public firstValid: bigint;

  /**
   * (lv) Last valid round for this transaction.
   */
  public lastValid: bigint;

  /**
   * (snd) Sender's address.
   */
  public sender: string;

  /**
   * Fields for application transactions.
   * Definition:
   * data/transactions/application.go : ApplicationCallTxnFields
   */
  public applicationTransaction?: TransactionApplication;

  /**
   * Fields for asset allocation, re-configuration, and destruction.
   * A zero value for asset-id indicates asset creation.
   * A zero value for the params indicates asset destruction.
   * Definition:
   * data/transactions/asset.go : AssetConfigTxnFields
   */
  public assetConfigTransaction?: TransactionAssetConfig;

  /**
   * Fields for an asset freeze transaction.
   * Definition:
   * data/transactions/asset.go : AssetFreezeTxnFields
   */
  public assetFreezeTransaction?: TransactionAssetFreeze;

  /**
   * Fields for an asset transfer transaction.
   * Definition:
   * data/transactions/asset.go : AssetTransferTxnFields
   */
  public assetTransferTransaction?: TransactionAssetTransfer;

  /**
   * (sgnr) this is included with signed transactions when the signing address does
   * not equal the sender. The backend can use this to ensure that auth addr is equal
   * to the accounts auth addr.
   */
  public authAddr?: Address;

  /**
   * (rc) rewards applied to close-remainder-to account.
   */
  public closeRewards?: bigint;

  /**
   * (ca) closing amount for transaction.
   */
  public closingAmount?: bigint;

  /**
   * Round when the transaction was confirmed.
   */
  public confirmedRound?: bigint;

  /**
   * Specifies an application index (ID) if an application was created with this
   * transaction.
   */
  public createdApplicationIndex?: bigint;

  /**
   * Specifies an asset index (ID) if an asset was created with this transaction.
   */
  public createdAssetIndex?: bigint;

  /**
   * (gh) Hash of genesis block.
   */
  public genesisHash?: Uint8Array;

  /**
   * (gen) genesis block ID.
   */
  public genesisId?: string;

  /**
   * (gd) Global state key/value changes for the application being executed by this
   * transaction.
   */
  public globalStateDelta?: EvalDeltaKeyValue[];

  /**
   * (grp) Base64 encoded byte array of a sha512/256 digest. When present indicates
   * that this transaction is part of a transaction group and the value is the
   * sha512/256 hash of the transactions in that group.
   */
  public group?: Uint8Array;

  /**
   * Fields for a heartbeat transaction.
   * Definition:
   * data/transactions/heartbeat.go : HeartbeatTxnFields
   */
  public heartbeatTransaction?: TransactionHeartbeat;

  /**
   * Transaction ID
   */
  public id?: string;

  /**
   * Inner transactions produced by application execution.
   */
  public innerTxns?: Transaction[];

  /**
   * Offset into the round where this transaction was confirmed.
   */
  public intraRoundOffset?: number;

  /**
   * Fields for a keyreg transaction.
   * Definition:
   * data/transactions/keyreg.go : KeyregTxnFields
   */
  public keyregTransaction?: TransactionKeyreg;

  /**
   * (lx) Base64 encoded 32-byte array. Lease enforces mutual exclusion of
   * transactions. If this field is nonzero, then once the transaction is confirmed,
   * it acquires the lease identified by the (Sender, Lease) pair of the transaction
   * until the LastValid round passes. While this transaction possesses the lease, no
   * other transaction specifying this lease can be confirmed.
   */
  public lease?: Uint8Array;

  /**
   * (ld) Local state key/value changes for the application being executed by this
   * transaction.
   */
  public localStateDelta?: AccountStateDelta[];

  /**
   * (lg) Logs for the application being executed by this transaction.
   */
  public logs?: Uint8Array[];

  /**
   * (note) Free form data.
   */
  public note?: Uint8Array;

  /**
   * Fields for a payment transaction.
   * Definition:
   * data/transactions/payment.go : PaymentTxnFields
   */
  public paymentTransaction?: TransactionPayment;

  /**
   * (rr) rewards applied to receiver account.
   */
  public receiverRewards?: bigint;

  /**
   * (rekey) when included in a valid transaction, the accounts auth addr will be
   * updated with this value and future signatures must be signed with the key
   * represented by this address.
   */
  public rekeyTo?: Address;

  /**
   * Time when the block this transaction is in was confirmed.
   */
  public roundTime?: number;

  /**
   * (rs) rewards applied to sender account.
   */
  public senderRewards?: bigint;

  /**
   * Validation signature associated with some data. Only one of the signatures
   * should be provided.
   */
  public signature?: TransactionSignature;

  /**
   * Fields for a state proof transaction.
   * Definition:
   * data/transactions/stateproof.go : StateProofTxnFields
   */
  public stateProofTransaction?: TransactionStateProof;

  /**
   * (type) Indicates what type of transaction this is. Different types have
   * different fields.
   * Valid types, and where their fields are stored:
   * * (pay) payment-transaction
   * * (keyreg) keyreg-transaction
   * * (acfg) asset-config-transaction
   * * (axfer) asset-transfer-transaction
   * * (afrz) asset-freeze-transaction
   * * (appl) application-transaction
   * * (stpf) state-proof-transaction
   * * (hb) heartbeat-transaction
   */
  public txType?: string;

  /**
   * Creates a new `Transaction` object.
   * @param fee - (fee) Transaction fee.
   * @param firstValid - (fv) First valid round for this transaction.
   * @param lastValid - (lv) Last valid round for this transaction.
   * @param sender - (snd) Sender's address.
   * @param applicationTransaction - Fields for application transactions.
   * Definition:
   * data/transactions/application.go : ApplicationCallTxnFields
   * @param assetConfigTransaction - Fields for asset allocation, re-configuration, and destruction.
   * A zero value for asset-id indicates asset creation.
   * A zero value for the params indicates asset destruction.
   * Definition:
   * data/transactions/asset.go : AssetConfigTxnFields
   * @param assetFreezeTransaction - Fields for an asset freeze transaction.
   * Definition:
   * data/transactions/asset.go : AssetFreezeTxnFields
   * @param assetTransferTransaction - Fields for an asset transfer transaction.
   * Definition:
   * data/transactions/asset.go : AssetTransferTxnFields
   * @param authAddr - (sgnr) this is included with signed transactions when the signing address does
   * not equal the sender. The backend can use this to ensure that auth addr is equal
   * to the accounts auth addr.
   * @param closeRewards - (rc) rewards applied to close-remainder-to account.
   * @param closingAmount - (ca) closing amount for transaction.
   * @param confirmedRound - Round when the transaction was confirmed.
   * @param createdApplicationIndex - Specifies an application index (ID) if an application was created with this
   * transaction.
   * @param createdAssetIndex - Specifies an asset index (ID) if an asset was created with this transaction.
   * @param genesisHash - (gh) Hash of genesis block.
   * @param genesisId - (gen) genesis block ID.
   * @param globalStateDelta - (gd) Global state key/value changes for the application being executed by this
   * transaction.
   * @param group - (grp) Base64 encoded byte array of a sha512/256 digest. When present indicates
   * that this transaction is part of a transaction group and the value is the
   * sha512/256 hash of the transactions in that group.
   * @param heartbeatTransaction - Fields for a heartbeat transaction.
   * Definition:
   * data/transactions/heartbeat.go : HeartbeatTxnFields
   * @param id - Transaction ID
   * @param innerTxns - Inner transactions produced by application execution.
   * @param intraRoundOffset - Offset into the round where this transaction was confirmed.
   * @param keyregTransaction - Fields for a keyreg transaction.
   * Definition:
   * data/transactions/keyreg.go : KeyregTxnFields
   * @param lease - (lx) Base64 encoded 32-byte array. Lease enforces mutual exclusion of
   * transactions. If this field is nonzero, then once the transaction is confirmed,
   * it acquires the lease identified by the (Sender, Lease) pair of the transaction
   * until the LastValid round passes. While this transaction possesses the lease, no
   * other transaction specifying this lease can be confirmed.
   * @param localStateDelta - (ld) Local state key/value changes for the application being executed by this
   * transaction.
   * @param logs - (lg) Logs for the application being executed by this transaction.
   * @param note - (note) Free form data.
   * @param paymentTransaction - Fields for a payment transaction.
   * Definition:
   * data/transactions/payment.go : PaymentTxnFields
   * @param receiverRewards - (rr) rewards applied to receiver account.
   * @param rekeyTo - (rekey) when included in a valid transaction, the accounts auth addr will be
   * updated with this value and future signatures must be signed with the key
   * represented by this address.
   * @param roundTime - Time when the block this transaction is in was confirmed.
   * @param senderRewards - (rs) rewards applied to sender account.
   * @param signature - Validation signature associated with some data. Only one of the signatures
   * should be provided.
   * @param stateProofTransaction - Fields for a state proof transaction.
   * Definition:
   * data/transactions/stateproof.go : StateProofTxnFields
   * @param txType - (type) Indicates what type of transaction this is. Different types have
   * different fields.
   * Valid types, and where their fields are stored:
   * * (pay) payment-transaction
   * * (keyreg) keyreg-transaction
   * * (acfg) asset-config-transaction
   * * (axfer) asset-transfer-transaction
   * * (afrz) asset-freeze-transaction
   * * (appl) application-transaction
   * * (stpf) state-proof-transaction
   * * (hb) heartbeat-transaction
   */
  constructor({
    fee,
    firstValid,
    lastValid,
    sender,
    applicationTransaction,
    assetConfigTransaction,
    assetFreezeTransaction,
    assetTransferTransaction,
    authAddr,
    closeRewards,
    closingAmount,
    confirmedRound,
    createdApplicationIndex,
    createdAssetIndex,
    genesisHash,
    genesisId,
    globalStateDelta,
    group,
    heartbeatTransaction,
    id,
    innerTxns,
    intraRoundOffset,
    keyregTransaction,
    lease,
    localStateDelta,
    logs,
    note,
    paymentTransaction,
    receiverRewards,
    rekeyTo,
    roundTime,
    senderRewards,
    signature,
    stateProofTransaction,
    txType,
  }: {
    fee: number | bigint;
    firstValid: number | bigint;
    lastValid: number | bigint;
    sender: string;
    applicationTransaction?: TransactionApplication;
    assetConfigTransaction?: TransactionAssetConfig;
    assetFreezeTransaction?: TransactionAssetFreeze;
    assetTransferTransaction?: TransactionAssetTransfer;
    authAddr?: Address | string;
    closeRewards?: number | bigint;
    closingAmount?: number | bigint;
    confirmedRound?: number | bigint;
    createdApplicationIndex?: number | bigint;
    createdAssetIndex?: number | bigint;
    genesisHash?: string | Uint8Array;
    genesisId?: string;
    globalStateDelta?: EvalDeltaKeyValue[];
    group?: string | Uint8Array;
    heartbeatTransaction?: TransactionHeartbeat;
    id?: string;
    innerTxns?: Transaction[];
    intraRoundOffset?: number | bigint;
    keyregTransaction?: TransactionKeyreg;
    lease?: string | Uint8Array;
    localStateDelta?: AccountStateDelta[];
    logs?: Uint8Array[];
    note?: string | Uint8Array;
    paymentTransaction?: TransactionPayment;
    receiverRewards?: number | bigint;
    rekeyTo?: Address | string;
    roundTime?: number | bigint;
    senderRewards?: number | bigint;
    signature?: TransactionSignature;
    stateProofTransaction?: TransactionStateProof;
    txType?: string;
  }) {
    this.fee = ensureBigInt(fee);
    this.firstValid = ensureBigInt(firstValid);
    this.lastValid = ensureBigInt(lastValid);
    this.sender = sender;
    this.applicationTransaction = applicationTransaction;
    this.assetConfigTransaction = assetConfigTransaction;
    this.assetFreezeTransaction = assetFreezeTransaction;
    this.assetTransferTransaction = assetTransferTransaction;
    this.authAddr =
      typeof authAddr === 'string' ? Address.fromString(authAddr) : authAddr;
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
    this.createdApplicationIndex =
      typeof createdApplicationIndex === 'undefined'
        ? undefined
        : ensureBigInt(createdApplicationIndex);
    this.createdAssetIndex =
      typeof createdAssetIndex === 'undefined'
        ? undefined
        : ensureBigInt(createdAssetIndex);
    this.genesisHash =
      typeof genesisHash === 'string'
        ? base64ToBytes(genesisHash)
        : genesisHash;
    this.genesisId = genesisId;
    this.globalStateDelta = globalStateDelta;
    this.group = typeof group === 'string' ? base64ToBytes(group) : group;
    this.heartbeatTransaction = heartbeatTransaction;
    this.id = id;
    this.innerTxns = innerTxns;
    this.intraRoundOffset =
      typeof intraRoundOffset === 'undefined'
        ? undefined
        : ensureSafeInteger(intraRoundOffset);
    this.keyregTransaction = keyregTransaction;
    this.lease = typeof lease === 'string' ? base64ToBytes(lease) : lease;
    this.localStateDelta = localStateDelta;
    this.logs = logs;
    this.note = typeof note === 'string' ? base64ToBytes(note) : note;
    this.paymentTransaction = paymentTransaction;
    this.receiverRewards =
      typeof receiverRewards === 'undefined'
        ? undefined
        : ensureBigInt(receiverRewards);
    this.rekeyTo =
      typeof rekeyTo === 'string' ? Address.fromString(rekeyTo) : rekeyTo;
    this.roundTime =
      typeof roundTime === 'undefined'
        ? undefined
        : ensureSafeInteger(roundTime);
    this.senderRewards =
      typeof senderRewards === 'undefined'
        ? undefined
        : ensureBigInt(senderRewards);
    this.signature = signature;
    this.stateProofTransaction = stateProofTransaction;
    this.txType = txType;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return Transaction.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['fee', this.fee],
      ['first-valid', this.firstValid],
      ['last-valid', this.lastValid],
      ['sender', this.sender],
      [
        'application-transaction',
        typeof this.applicationTransaction !== 'undefined'
          ? this.applicationTransaction.toEncodingData()
          : undefined,
      ],
      [
        'asset-config-transaction',
        typeof this.assetConfigTransaction !== 'undefined'
          ? this.assetConfigTransaction.toEncodingData()
          : undefined,
      ],
      [
        'asset-freeze-transaction',
        typeof this.assetFreezeTransaction !== 'undefined'
          ? this.assetFreezeTransaction.toEncodingData()
          : undefined,
      ],
      [
        'asset-transfer-transaction',
        typeof this.assetTransferTransaction !== 'undefined'
          ? this.assetTransferTransaction.toEncodingData()
          : undefined,
      ],
      [
        'auth-addr',
        typeof this.authAddr !== 'undefined'
          ? this.authAddr.toString()
          : undefined,
      ],
      ['close-rewards', this.closeRewards],
      ['closing-amount', this.closingAmount],
      ['confirmed-round', this.confirmedRound],
      ['created-application-index', this.createdApplicationIndex],
      ['created-asset-index', this.createdAssetIndex],
      ['genesis-hash', this.genesisHash],
      ['genesis-id', this.genesisId],
      [
        'global-state-delta',
        typeof this.globalStateDelta !== 'undefined'
          ? this.globalStateDelta.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['group', this.group],
      [
        'heartbeat-transaction',
        typeof this.heartbeatTransaction !== 'undefined'
          ? this.heartbeatTransaction.toEncodingData()
          : undefined,
      ],
      ['id', this.id],
      [
        'inner-txns',
        typeof this.innerTxns !== 'undefined'
          ? this.innerTxns.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['intra-round-offset', this.intraRoundOffset],
      [
        'keyreg-transaction',
        typeof this.keyregTransaction !== 'undefined'
          ? this.keyregTransaction.toEncodingData()
          : undefined,
      ],
      ['lease', this.lease],
      [
        'local-state-delta',
        typeof this.localStateDelta !== 'undefined'
          ? this.localStateDelta.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['logs', this.logs],
      ['note', this.note],
      [
        'payment-transaction',
        typeof this.paymentTransaction !== 'undefined'
          ? this.paymentTransaction.toEncodingData()
          : undefined,
      ],
      ['receiver-rewards', this.receiverRewards],
      [
        'rekey-to',
        typeof this.rekeyTo !== 'undefined'
          ? this.rekeyTo.toString()
          : undefined,
      ],
      ['round-time', this.roundTime],
      ['sender-rewards', this.senderRewards],
      [
        'signature',
        typeof this.signature !== 'undefined'
          ? this.signature.toEncodingData()
          : undefined,
      ],
      [
        'state-proof-transaction',
        typeof this.stateProofTransaction !== 'undefined'
          ? this.stateProofTransaction.toEncodingData()
          : undefined,
      ],
      ['tx-type', this.txType],
    ]);
  }

  static fromEncodingData(data: unknown): Transaction {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded Transaction: ${data}`);
    }
    return new Transaction({
      fee: data.get('fee'),
      firstValid: data.get('first-valid'),
      lastValid: data.get('last-valid'),
      sender: data.get('sender'),
      applicationTransaction:
        typeof data.get('application-transaction') !== 'undefined'
          ? TransactionApplication.fromEncodingData(
              data.get('application-transaction')
            )
          : undefined,
      assetConfigTransaction:
        typeof data.get('asset-config-transaction') !== 'undefined'
          ? TransactionAssetConfig.fromEncodingData(
              data.get('asset-config-transaction')
            )
          : undefined,
      assetFreezeTransaction:
        typeof data.get('asset-freeze-transaction') !== 'undefined'
          ? TransactionAssetFreeze.fromEncodingData(
              data.get('asset-freeze-transaction')
            )
          : undefined,
      assetTransferTransaction:
        typeof data.get('asset-transfer-transaction') !== 'undefined'
          ? TransactionAssetTransfer.fromEncodingData(
              data.get('asset-transfer-transaction')
            )
          : undefined,
      authAddr: data.get('auth-addr'),
      closeRewards: data.get('close-rewards'),
      closingAmount: data.get('closing-amount'),
      confirmedRound: data.get('confirmed-round'),
      createdApplicationIndex: data.get('created-application-index'),
      createdAssetIndex: data.get('created-asset-index'),
      genesisHash: data.get('genesis-hash'),
      genesisId: data.get('genesis-id'),
      globalStateDelta:
        typeof data.get('global-state-delta') !== 'undefined'
          ? data
              .get('global-state-delta')
              .map((v: unknown) => EvalDeltaKeyValue.fromEncodingData(v))
          : undefined,
      group: data.get('group'),
      heartbeatTransaction:
        typeof data.get('heartbeat-transaction') !== 'undefined'
          ? TransactionHeartbeat.fromEncodingData(
              data.get('heartbeat-transaction')
            )
          : undefined,
      id: data.get('id'),
      innerTxns:
        typeof data.get('inner-txns') !== 'undefined'
          ? data
              .get('inner-txns')
              .map((v: unknown) => Transaction.fromEncodingData(v))
          : undefined,
      intraRoundOffset: data.get('intra-round-offset'),
      keyregTransaction:
        typeof data.get('keyreg-transaction') !== 'undefined'
          ? TransactionKeyreg.fromEncodingData(data.get('keyreg-transaction'))
          : undefined,
      lease: data.get('lease'),
      localStateDelta:
        typeof data.get('local-state-delta') !== 'undefined'
          ? data
              .get('local-state-delta')
              .map((v: unknown) => AccountStateDelta.fromEncodingData(v))
          : undefined,
      logs: data.get('logs'),
      note: data.get('note'),
      paymentTransaction:
        typeof data.get('payment-transaction') !== 'undefined'
          ? TransactionPayment.fromEncodingData(data.get('payment-transaction'))
          : undefined,
      receiverRewards: data.get('receiver-rewards'),
      rekeyTo: data.get('rekey-to'),
      roundTime: data.get('round-time'),
      senderRewards: data.get('sender-rewards'),
      signature:
        typeof data.get('signature') !== 'undefined'
          ? TransactionSignature.fromEncodingData(data.get('signature'))
          : undefined,
      stateProofTransaction:
        typeof data.get('state-proof-transaction') !== 'undefined'
          ? TransactionStateProof.fromEncodingData(
              data.get('state-proof-transaction')
            )
          : undefined,
      txType: data.get('tx-type'),
    });
  }
}

/**
 * Fields for application transactions.
 * Definition:
 * data/transactions/application.go : ApplicationCallTxnFields
 */
export class TransactionApplication implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'application-id',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'access',
          valueSchema: new OptionalSchema(
            new ArraySchema(ResourceRef.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'accounts',
          valueSchema: new OptionalSchema(new ArraySchema(new StringSchema())),
          omitEmpty: true,
        },
        {
          key: 'application-args',
          valueSchema: new OptionalSchema(
            new ArraySchema(new ByteArraySchema())
          ),
          omitEmpty: true,
        },
        {
          key: 'approval-program',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'box-references',
          valueSchema: new OptionalSchema(
            new ArraySchema(BoxReference.encodingSchema)
          ),
          omitEmpty: true,
        },
        {
          key: 'clear-state-program',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'extra-program-pages',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'foreign-apps',
          valueSchema: new OptionalSchema(new ArraySchema(new Uint64Schema())),
          omitEmpty: true,
        },
        {
          key: 'foreign-assets',
          valueSchema: new OptionalSchema(new ArraySchema(new Uint64Schema())),
          omitEmpty: true,
        },
        {
          key: 'global-state-schema',
          valueSchema: new OptionalSchema(StateSchema.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'local-state-schema',
          valueSchema: new OptionalSchema(StateSchema.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'on-completion',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'reject-version',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (apid) ID of the application being configured or empty if creating.
   */
  public applicationId: bigint;

  /**
   * (al) Access unifies `accounts`, `foreign-apps`, `foreign-assets`, and
   * `box-references` under a single list. If access is non-empty, these lists must
   * be empty. If access is empty, those lists may be non-empty.
   */
  public access?: ResourceRef[];

  /**
   * (apat) List of accounts in addition to the sender that may be accessed from the
   * application's approval-program and clear-state-program.
   */
  public accounts?: Address[];

  /**
   * (apaa) transaction specific arguments accessed from the application's
   * approval-program and clear-state-program.
   */
  public applicationArgs?: Uint8Array[];

  /**
   * (apap) Logic executed for every application transaction, except when
   * on-completion is set to "clear". It can read and write global state for the
   * application, as well as account-specific local state. Approval programs may
   * reject the transaction.
   */
  public approvalProgram?: Uint8Array;

  /**
   * (apbx) the boxes that can be accessed by this transaction (and others in the
   * same group).
   */
  public boxReferences?: BoxReference[];

  /**
   * (apsu) Logic executed for application transactions with on-completion set to
   * "clear". It can read and write global state for the application, as well as
   * account-specific local state. Clear state programs cannot reject the
   * transaction.
   */
  public clearStateProgram?: Uint8Array;

  /**
   * (epp) specifies the additional app program len requested in pages.
   */
  public extraProgramPages?: number;

  /**
   * (apfa) Lists the applications in addition to the application-id whose global
   * states may be accessed by this application's approval-program and
   * clear-state-program. The access is read-only.
   */
  public foreignApps?: bigint[];

  /**
   * (apas) lists the assets whose parameters may be accessed by this application's
   * ApprovalProgram and ClearStateProgram. The access is read-only.
   */
  public foreignAssets?: bigint[];

  /**
   * Represents a (apls) local-state or (apgs) global-state schema. These schemas
   * determine how much storage may be used in a local-state or global-state for an
   * application. The more space used, the larger minimum balance must be maintained
   * in the account holding the data.
   */
  public globalStateSchema?: StateSchema;

  /**
   * Represents a (apls) local-state or (apgs) global-state schema. These schemas
   * determine how much storage may be used in a local-state or global-state for an
   * application. The more space used, the larger minimum balance must be maintained
   * in the account holding the data.
   */
  public localStateSchema?: StateSchema;

  /**
   * (apan) defines the what additional actions occur with the transaction.
   * Valid types:
   * * noop
   * * optin
   * * closeout
   * * clear
   * * update
   * * update
   * * delete
   */
  public onCompletion?: string;

  /**
   * (aprv) the lowest application version for which this transaction should
   * immediately fail. 0 indicates that no version check should be performed.
   */
  public rejectVersion?: number;

  /**
   * Creates a new `TransactionApplication` object.
   * @param applicationId - (apid) ID of the application being configured or empty if creating.
   * @param access - (al) Access unifies `accounts`, `foreign-apps`, `foreign-assets`, and
   * `box-references` under a single list. If access is non-empty, these lists must
   * be empty. If access is empty, those lists may be non-empty.
   * @param accounts - (apat) List of accounts in addition to the sender that may be accessed from the
   * application's approval-program and clear-state-program.
   * @param applicationArgs - (apaa) transaction specific arguments accessed from the application's
   * approval-program and clear-state-program.
   * @param approvalProgram - (apap) Logic executed for every application transaction, except when
   * on-completion is set to "clear". It can read and write global state for the
   * application, as well as account-specific local state. Approval programs may
   * reject the transaction.
   * @param boxReferences - (apbx) the boxes that can be accessed by this transaction (and others in the
   * same group).
   * @param clearStateProgram - (apsu) Logic executed for application transactions with on-completion set to
   * "clear". It can read and write global state for the application, as well as
   * account-specific local state. Clear state programs cannot reject the
   * transaction.
   * @param extraProgramPages - (epp) specifies the additional app program len requested in pages.
   * @param foreignApps - (apfa) Lists the applications in addition to the application-id whose global
   * states may be accessed by this application's approval-program and
   * clear-state-program. The access is read-only.
   * @param foreignAssets - (apas) lists the assets whose parameters may be accessed by this application's
   * ApprovalProgram and ClearStateProgram. The access is read-only.
   * @param globalStateSchema - Represents a (apls) local-state or (apgs) global-state schema. These schemas
   * determine how much storage may be used in a local-state or global-state for an
   * application. The more space used, the larger minimum balance must be maintained
   * in the account holding the data.
   * @param localStateSchema - Represents a (apls) local-state or (apgs) global-state schema. These schemas
   * determine how much storage may be used in a local-state or global-state for an
   * application. The more space used, the larger minimum balance must be maintained
   * in the account holding the data.
   * @param onCompletion - (apan) defines the what additional actions occur with the transaction.
   * Valid types:
   * * noop
   * * optin
   * * closeout
   * * clear
   * * update
   * * update
   * * delete
   * @param rejectVersion - (aprv) the lowest application version for which this transaction should
   * immediately fail. 0 indicates that no version check should be performed.
   */
  constructor({
    applicationId,
    access,
    accounts,
    applicationArgs,
    approvalProgram,
    boxReferences,
    clearStateProgram,
    extraProgramPages,
    foreignApps,
    foreignAssets,
    globalStateSchema,
    localStateSchema,
    onCompletion,
    rejectVersion,
  }: {
    applicationId: number | bigint;
    access?: ResourceRef[];
    accounts?: (Address | string)[];
    applicationArgs?: Uint8Array[];
    approvalProgram?: string | Uint8Array;
    boxReferences?: BoxReference[];
    clearStateProgram?: string | Uint8Array;
    extraProgramPages?: number | bigint;
    foreignApps?: (number | bigint)[];
    foreignAssets?: (number | bigint)[];
    globalStateSchema?: StateSchema;
    localStateSchema?: StateSchema;
    onCompletion?: string;
    rejectVersion?: number | bigint;
  }) {
    this.applicationId = ensureBigInt(applicationId);
    this.access = access;
    this.accounts =
      typeof accounts !== 'undefined'
        ? accounts.map((addr) =>
            typeof addr === 'string' ? Address.fromString(addr) : addr
          )
        : undefined;
    this.applicationArgs = applicationArgs;
    this.approvalProgram =
      typeof approvalProgram === 'string'
        ? base64ToBytes(approvalProgram)
        : approvalProgram;
    this.boxReferences = boxReferences;
    this.clearStateProgram =
      typeof clearStateProgram === 'string'
        ? base64ToBytes(clearStateProgram)
        : clearStateProgram;
    this.extraProgramPages =
      typeof extraProgramPages === 'undefined'
        ? undefined
        : ensureSafeInteger(extraProgramPages);
    this.foreignApps =
      typeof foreignApps === 'undefined'
        ? undefined
        : foreignApps.map(ensureBigInt);
    this.foreignAssets =
      typeof foreignAssets === 'undefined'
        ? undefined
        : foreignAssets.map(ensureBigInt);
    this.globalStateSchema = globalStateSchema;
    this.localStateSchema = localStateSchema;
    this.onCompletion = onCompletion;
    this.rejectVersion =
      typeof rejectVersion === 'undefined'
        ? undefined
        : ensureSafeInteger(rejectVersion);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionApplication.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['application-id', this.applicationId],
      [
        'access',
        typeof this.access !== 'undefined'
          ? this.access.map((v) => v.toEncodingData())
          : undefined,
      ],
      [
        'accounts',
        typeof this.accounts !== 'undefined'
          ? this.accounts.map((v) => v.toString())
          : undefined,
      ],
      ['application-args', this.applicationArgs],
      ['approval-program', this.approvalProgram],
      [
        'box-references',
        typeof this.boxReferences !== 'undefined'
          ? this.boxReferences.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['clear-state-program', this.clearStateProgram],
      ['extra-program-pages', this.extraProgramPages],
      ['foreign-apps', this.foreignApps],
      ['foreign-assets', this.foreignAssets],
      [
        'global-state-schema',
        typeof this.globalStateSchema !== 'undefined'
          ? this.globalStateSchema.toEncodingData()
          : undefined,
      ],
      [
        'local-state-schema',
        typeof this.localStateSchema !== 'undefined'
          ? this.localStateSchema.toEncodingData()
          : undefined,
      ],
      ['on-completion', this.onCompletion],
      ['reject-version', this.rejectVersion],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionApplication {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionApplication: ${data}`);
    }
    return new TransactionApplication({
      applicationId: data.get('application-id'),
      access:
        typeof data.get('access') !== 'undefined'
          ? data
              .get('access')
              .map((v: unknown) => ResourceRef.fromEncodingData(v))
          : undefined,
      accounts: data.get('accounts'),
      applicationArgs: data.get('application-args'),
      approvalProgram: data.get('approval-program'),
      boxReferences:
        typeof data.get('box-references') !== 'undefined'
          ? data
              .get('box-references')
              .map((v: unknown) => BoxReference.fromEncodingData(v))
          : undefined,
      clearStateProgram: data.get('clear-state-program'),
      extraProgramPages: data.get('extra-program-pages'),
      foreignApps: data.get('foreign-apps'),
      foreignAssets: data.get('foreign-assets'),
      globalStateSchema:
        typeof data.get('global-state-schema') !== 'undefined'
          ? StateSchema.fromEncodingData(data.get('global-state-schema'))
          : undefined,
      localStateSchema:
        typeof data.get('local-state-schema') !== 'undefined'
          ? StateSchema.fromEncodingData(data.get('local-state-schema'))
          : undefined,
      onCompletion: data.get('on-completion'),
      rejectVersion: data.get('reject-version'),
    });
  }
}

/**
 * Fields for asset allocation, re-configuration, and destruction.
 * A zero value for asset-id indicates asset creation.
 * A zero value for the params indicates asset destruction.
 * Definition:
 * data/transactions/asset.go : AssetConfigTxnFields
 */
export class TransactionAssetConfig implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'asset-id',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'params',
          valueSchema: new OptionalSchema(AssetParams.encodingSchema),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (xaid) ID of the asset being configured or empty if creating.
   */
  public assetId?: bigint;

  /**
   * AssetParams specifies the parameters for an asset.
   * (apar) when part of an AssetConfig transaction.
   * Definition:
   * data/transactions/asset.go : AssetParams
   */
  public params?: AssetParams;

  /**
   * Creates a new `TransactionAssetConfig` object.
   * @param assetId - (xaid) ID of the asset being configured or empty if creating.
   * @param params - AssetParams specifies the parameters for an asset.
   * (apar) when part of an AssetConfig transaction.
   * Definition:
   * data/transactions/asset.go : AssetParams
   */
  constructor({
    assetId,
    params,
  }: {
    assetId?: number | bigint;
    params?: AssetParams;
  }) {
    this.assetId =
      typeof assetId === 'undefined' ? undefined : ensureBigInt(assetId);
    this.params = params;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionAssetConfig.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['asset-id', this.assetId],
      [
        'params',
        typeof this.params !== 'undefined'
          ? this.params.toEncodingData()
          : undefined,
      ],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionAssetConfig {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionAssetConfig: ${data}`);
    }
    return new TransactionAssetConfig({
      assetId: data.get('asset-id'),
      params:
        typeof data.get('params') !== 'undefined'
          ? AssetParams.fromEncodingData(data.get('params'))
          : undefined,
    });
  }
}

/**
 * Fields for an asset freeze transaction.
 * Definition:
 * data/transactions/asset.go : AssetFreezeTxnFields
 */
export class TransactionAssetFreeze implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'address', valueSchema: new StringSchema(), omitEmpty: true },
        { key: 'asset-id', valueSchema: new Uint64Schema(), omitEmpty: true },
        {
          key: 'new-freeze-status',
          valueSchema: new BooleanSchema(),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (fadd) Address of the account whose asset is being frozen or thawed.
   */
  public address: string;

  /**
   * (faid) ID of the asset being frozen or thawed.
   */
  public assetId: bigint;

  /**
   * (afrz) The new freeze status.
   */
  public newFreezeStatus: boolean;

  /**
   * Creates a new `TransactionAssetFreeze` object.
   * @param address - (fadd) Address of the account whose asset is being frozen or thawed.
   * @param assetId - (faid) ID of the asset being frozen or thawed.
   * @param newFreezeStatus - (afrz) The new freeze status.
   */
  constructor({
    address,
    assetId,
    newFreezeStatus,
  }: {
    address: string;
    assetId: number | bigint;
    newFreezeStatus: boolean;
  }) {
    this.address = address;
    this.assetId = ensureBigInt(assetId);
    this.newFreezeStatus = newFreezeStatus;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionAssetFreeze.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['address', this.address],
      ['asset-id', this.assetId],
      ['new-freeze-status', this.newFreezeStatus],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionAssetFreeze {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionAssetFreeze: ${data}`);
    }
    return new TransactionAssetFreeze({
      address: data.get('address'),
      assetId: data.get('asset-id'),
      newFreezeStatus: data.get('new-freeze-status'),
    });
  }
}

/**
 * Fields for an asset transfer transaction.
 * Definition:
 * data/transactions/asset.go : AssetTransferTxnFields
 */
export class TransactionAssetTransfer implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'amount', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'asset-id', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'receiver', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'close-amount',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'close-to',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        },
        {
          key: 'sender',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (aamt) Amount of asset to transfer. A zero amount transferred to self allocates
   * that asset in the account's Assets map.
   */
  public amount: bigint;

  /**
   * (xaid) ID of the asset being transferred.
   */
  public assetId: bigint;

  /**
   * (arcv) Recipient address of the transfer.
   */
  public receiver: string;

  /**
   * Number of assets transferred to the close-to account as part of the transaction.
   */
  public closeAmount?: bigint;

  /**
   * (aclose) Indicates that the asset should be removed from the account's Assets
   * map, and specifies where the remaining asset holdings should be transferred.
   * It's always valid to transfer remaining asset holdings to the creator account.
   */
  public closeTo?: string;

  /**
   * (asnd) The effective sender during a clawback transactions. If this is not a
   * zero value, the real transaction sender must be the Clawback address from the
   * AssetParams.
   */
  public sender?: string;

  /**
   * Creates a new `TransactionAssetTransfer` object.
   * @param amount - (aamt) Amount of asset to transfer. A zero amount transferred to self allocates
   * that asset in the account's Assets map.
   * @param assetId - (xaid) ID of the asset being transferred.
   * @param receiver - (arcv) Recipient address of the transfer.
   * @param closeAmount - Number of assets transferred to the close-to account as part of the transaction.
   * @param closeTo - (aclose) Indicates that the asset should be removed from the account's Assets
   * map, and specifies where the remaining asset holdings should be transferred.
   * It's always valid to transfer remaining asset holdings to the creator account.
   * @param sender - (asnd) The effective sender during a clawback transactions. If this is not a
   * zero value, the real transaction sender must be the Clawback address from the
   * AssetParams.
   */
  constructor({
    amount,
    assetId,
    receiver,
    closeAmount,
    closeTo,
    sender,
  }: {
    amount: number | bigint;
    assetId: number | bigint;
    receiver: string;
    closeAmount?: number | bigint;
    closeTo?: string;
    sender?: string;
  }) {
    this.amount = ensureBigInt(amount);
    this.assetId = ensureBigInt(assetId);
    this.receiver = receiver;
    this.closeAmount =
      typeof closeAmount === 'undefined'
        ? undefined
        : ensureBigInt(closeAmount);
    this.closeTo = closeTo;
    this.sender = sender;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionAssetTransfer.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['amount', this.amount],
      ['asset-id', this.assetId],
      ['receiver', this.receiver],
      ['close-amount', this.closeAmount],
      ['close-to', this.closeTo],
      ['sender', this.sender],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionAssetTransfer {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionAssetTransfer: ${data}`);
    }
    return new TransactionAssetTransfer({
      amount: data.get('amount'),
      assetId: data.get('asset-id'),
      receiver: data.get('receiver'),
      closeAmount: data.get('close-amount'),
      closeTo: data.get('close-to'),
      sender: data.get('sender'),
    });
  }
}

/**
 * Fields for a heartbeat transaction.
 * Definition:
 * data/transactions/heartbeat.go : HeartbeatTxnFields
 */
export class TransactionHeartbeat implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'hb-address', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'hb-key-dilution',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'hb-proof',
          valueSchema: HbProofFields.encodingSchema,
          omitEmpty: true,
        },
        { key: 'hb-seed', valueSchema: new ByteArraySchema(), omitEmpty: true },
        {
          key: 'hb-vote-id',
          valueSchema: new ByteArraySchema(),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (hbad) HbAddress is the account this txn is proving onlineness for.
   */
  public hbAddress: string;

  /**
   * (hbkd) HbKeyDilution must match HbAddress account's current KeyDilution.
   */
  public hbKeyDilution: bigint;

  /**
   * (hbprf) HbProof is a signature using HeartbeatAddress's partkey, thereby showing
   * it is online.
   */
  public hbProof: HbProofFields;

  /**
   * (hbsd) HbSeed must be the block seed for the this transaction's firstValid
   * block.
   */
  public hbSeed: Uint8Array;

  /**
   * (hbvid) HbVoteID must match the HbAddress account's current VoteID.
   */
  public hbVoteId: Uint8Array;

  /**
   * Creates a new `TransactionHeartbeat` object.
   * @param hbAddress - (hbad) HbAddress is the account this txn is proving onlineness for.
   * @param hbKeyDilution - (hbkd) HbKeyDilution must match HbAddress account's current KeyDilution.
   * @param hbProof - (hbprf) HbProof is a signature using HeartbeatAddress's partkey, thereby showing
   * it is online.
   * @param hbSeed - (hbsd) HbSeed must be the block seed for the this transaction's firstValid
   * block.
   * @param hbVoteId - (hbvid) HbVoteID must match the HbAddress account's current VoteID.
   */
  constructor({
    hbAddress,
    hbKeyDilution,
    hbProof,
    hbSeed,
    hbVoteId,
  }: {
    hbAddress: string;
    hbKeyDilution: number | bigint;
    hbProof: HbProofFields;
    hbSeed: string | Uint8Array;
    hbVoteId: string | Uint8Array;
  }) {
    this.hbAddress = hbAddress;
    this.hbKeyDilution = ensureBigInt(hbKeyDilution);
    this.hbProof = hbProof;
    this.hbSeed = typeof hbSeed === 'string' ? base64ToBytes(hbSeed) : hbSeed;
    this.hbVoteId =
      typeof hbVoteId === 'string' ? base64ToBytes(hbVoteId) : hbVoteId;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionHeartbeat.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['hb-address', this.hbAddress],
      ['hb-key-dilution', this.hbKeyDilution],
      ['hb-proof', this.hbProof.toEncodingData()],
      ['hb-seed', this.hbSeed],
      ['hb-vote-id', this.hbVoteId],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionHeartbeat {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionHeartbeat: ${data}`);
    }
    return new TransactionHeartbeat({
      hbAddress: data.get('hb-address'),
      hbKeyDilution: data.get('hb-key-dilution'),
      hbProof: HbProofFields.fromEncodingData(
        data.get('hb-proof') ?? new Map()
      ),
      hbSeed: data.get('hb-seed'),
      hbVoteId: data.get('hb-vote-id'),
    });
  }
}

/**
 * Fields for a keyreg transaction.
 * Definition:
 * data/transactions/keyreg.go : KeyregTxnFields
 */
export class TransactionKeyreg implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'non-participation',
          valueSchema: new OptionalSchema(new BooleanSchema()),
          omitEmpty: true,
        },
        {
          key: 'selection-participation-key',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'state-proof-key',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'vote-first-valid',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'vote-key-dilution',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'vote-last-valid',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'vote-participation-key',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (nonpart) Mark the account as participating or non-participating.
   */
  public nonParticipation?: boolean;

  /**
   * (selkey) Public key used with the Verified Random Function (VRF) result during
   * committee selection.
   */
  public selectionParticipationKey?: Uint8Array;

  /**
   * (sprfkey) State proof key used in key registration transactions.
   */
  public stateProofKey?: Uint8Array;

  /**
   * (votefst) First round this participation key is valid.
   */
  public voteFirstValid?: bigint;

  /**
   * (votekd) Number of subkeys in each batch of participation keys.
   */
  public voteKeyDilution?: bigint;

  /**
   * (votelst) Last round this participation key is valid.
   */
  public voteLastValid?: bigint;

  /**
   * (votekey) Participation public key used in key registration transactions.
   */
  public voteParticipationKey?: Uint8Array;

  /**
   * Creates a new `TransactionKeyreg` object.
   * @param nonParticipation - (nonpart) Mark the account as participating or non-participating.
   * @param selectionParticipationKey - (selkey) Public key used with the Verified Random Function (VRF) result during
   * committee selection.
   * @param stateProofKey - (sprfkey) State proof key used in key registration transactions.
   * @param voteFirstValid - (votefst) First round this participation key is valid.
   * @param voteKeyDilution - (votekd) Number of subkeys in each batch of participation keys.
   * @param voteLastValid - (votelst) Last round this participation key is valid.
   * @param voteParticipationKey - (votekey) Participation public key used in key registration transactions.
   */
  constructor({
    nonParticipation,
    selectionParticipationKey,
    stateProofKey,
    voteFirstValid,
    voteKeyDilution,
    voteLastValid,
    voteParticipationKey,
  }: {
    nonParticipation?: boolean;
    selectionParticipationKey?: string | Uint8Array;
    stateProofKey?: string | Uint8Array;
    voteFirstValid?: number | bigint;
    voteKeyDilution?: number | bigint;
    voteLastValid?: number | bigint;
    voteParticipationKey?: string | Uint8Array;
  }) {
    this.nonParticipation = nonParticipation;
    this.selectionParticipationKey =
      typeof selectionParticipationKey === 'string'
        ? base64ToBytes(selectionParticipationKey)
        : selectionParticipationKey;
    this.stateProofKey =
      typeof stateProofKey === 'string'
        ? base64ToBytes(stateProofKey)
        : stateProofKey;
    this.voteFirstValid =
      typeof voteFirstValid === 'undefined'
        ? undefined
        : ensureBigInt(voteFirstValid);
    this.voteKeyDilution =
      typeof voteKeyDilution === 'undefined'
        ? undefined
        : ensureBigInt(voteKeyDilution);
    this.voteLastValid =
      typeof voteLastValid === 'undefined'
        ? undefined
        : ensureBigInt(voteLastValid);
    this.voteParticipationKey =
      typeof voteParticipationKey === 'string'
        ? base64ToBytes(voteParticipationKey)
        : voteParticipationKey;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionKeyreg.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['non-participation', this.nonParticipation],
      ['selection-participation-key', this.selectionParticipationKey],
      ['state-proof-key', this.stateProofKey],
      ['vote-first-valid', this.voteFirstValid],
      ['vote-key-dilution', this.voteKeyDilution],
      ['vote-last-valid', this.voteLastValid],
      ['vote-participation-key', this.voteParticipationKey],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionKeyreg {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionKeyreg: ${data}`);
    }
    return new TransactionKeyreg({
      nonParticipation: data.get('non-participation'),
      selectionParticipationKey: data.get('selection-participation-key'),
      stateProofKey: data.get('state-proof-key'),
      voteFirstValid: data.get('vote-first-valid'),
      voteKeyDilution: data.get('vote-key-dilution'),
      voteLastValid: data.get('vote-last-valid'),
      voteParticipationKey: data.get('vote-participation-key'),
    });
  }
}

/**
 * Fields for a payment transaction.
 * Definition:
 * data/transactions/payment.go : PaymentTxnFields
 */
export class TransactionPayment implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'amount', valueSchema: new Uint64Schema(), omitEmpty: true },
        { key: 'receiver', valueSchema: new StringSchema(), omitEmpty: true },
        {
          key: 'close-amount',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'close-remainder-to',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (amt) number of MicroAlgos intended to be transferred.
   */
  public amount: bigint;

  /**
   * (rcv) receiver's address.
   */
  public receiver: string;

  /**
   * Number of MicroAlgos that were sent to the close-remainder-to address when
   * closing the sender account.
   */
  public closeAmount?: bigint;

  /**
   * (close) when set, indicates that the sending account should be closed and all
   * remaining funds be transferred to this address.
   */
  public closeRemainderTo?: string;

  /**
   * Creates a new `TransactionPayment` object.
   * @param amount - (amt) number of MicroAlgos intended to be transferred.
   * @param receiver - (rcv) receiver's address.
   * @param closeAmount - Number of MicroAlgos that were sent to the close-remainder-to address when
   * closing the sender account.
   * @param closeRemainderTo - (close) when set, indicates that the sending account should be closed and all
   * remaining funds be transferred to this address.
   */
  constructor({
    amount,
    receiver,
    closeAmount,
    closeRemainderTo,
  }: {
    amount: number | bigint;
    receiver: string;
    closeAmount?: number | bigint;
    closeRemainderTo?: string;
  }) {
    this.amount = ensureBigInt(amount);
    this.receiver = receiver;
    this.closeAmount =
      typeof closeAmount === 'undefined'
        ? undefined
        : ensureBigInt(closeAmount);
    this.closeRemainderTo = closeRemainderTo;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionPayment.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['amount', this.amount],
      ['receiver', this.receiver],
      ['close-amount', this.closeAmount],
      ['close-remainder-to', this.closeRemainderTo],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionPayment {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionPayment: ${data}`);
    }
    return new TransactionPayment({
      amount: data.get('amount'),
      receiver: data.get('receiver'),
      closeAmount: data.get('close-amount'),
      closeRemainderTo: data.get('close-remainder-to'),
    });
  }
}

/**
 *
 */
export class TransactionResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'transaction',
          valueSchema: Transaction.encodingSchema,
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  /**
   * Contains all fields common to all transactions and serves as an envelope to all
   * transactions type. Represents both regular and inner transactions.
   * Definition:
   * data/transactions/signedtxn.go : SignedTxn
   * data/transactions/transaction.go : Transaction
   */
  public transaction: Transaction;

  /**
   * Creates a new `TransactionResponse` object.
   * @param currentRound - Round at which the results were computed.
   * @param transaction - Contains all fields common to all transactions and serves as an envelope to all
   * transactions type. Represents both regular and inner transactions.
   * Definition:
   * data/transactions/signedtxn.go : SignedTxn
   * data/transactions/transaction.go : Transaction
   */
  constructor({
    currentRound,
    transaction,
  }: {
    currentRound: number | bigint;
    transaction: Transaction;
  }) {
    this.currentRound = ensureBigInt(currentRound);
    this.transaction = transaction;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['current-round', this.currentRound],
      ['transaction', this.transaction.toEncodingData()],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionResponse: ${data}`);
    }
    return new TransactionResponse({
      currentRound: data.get('current-round'),
      transaction: Transaction.fromEncodingData(
        data.get('transaction') ?? new Map()
      ),
    });
  }
}

/**
 * Validation signature associated with some data. Only one of the signatures
 * should be provided.
 */
export class TransactionSignature implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'logicsig',
          valueSchema: new OptionalSchema(
            TransactionSignatureLogicsig.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'multisig',
          valueSchema: new OptionalSchema(
            TransactionSignatureMultisig.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'sig',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (lsig) Programatic transaction signature.
   * Definition:
   * data/transactions/logicsig.go
   */
  public logicsig?: TransactionSignatureLogicsig;

  /**
   * structure holding multiple subsignatures.
   * Definition:
   * crypto/multisig.go : MultisigSig
   */
  public multisig?: TransactionSignatureMultisig;

  /**
   * (sig) Standard ed25519 signature.
   */
  public sig?: Uint8Array;

  /**
   * Creates a new `TransactionSignature` object.
   * @param logicsig - (lsig) Programatic transaction signature.
   * Definition:
   * data/transactions/logicsig.go
   * @param multisig - structure holding multiple subsignatures.
   * Definition:
   * crypto/multisig.go : MultisigSig
   * @param sig - (sig) Standard ed25519 signature.
   */
  constructor({
    logicsig,
    multisig,
    sig,
  }: {
    logicsig?: TransactionSignatureLogicsig;
    multisig?: TransactionSignatureMultisig;
    sig?: string | Uint8Array;
  }) {
    this.logicsig = logicsig;
    this.multisig = multisig;
    this.sig = typeof sig === 'string' ? base64ToBytes(sig) : sig;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionSignature.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'logicsig',
        typeof this.logicsig !== 'undefined'
          ? this.logicsig.toEncodingData()
          : undefined,
      ],
      [
        'multisig',
        typeof this.multisig !== 'undefined'
          ? this.multisig.toEncodingData()
          : undefined,
      ],
      ['sig', this.sig],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionSignature {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionSignature: ${data}`);
    }
    return new TransactionSignature({
      logicsig:
        typeof data.get('logicsig') !== 'undefined'
          ? TransactionSignatureLogicsig.fromEncodingData(data.get('logicsig'))
          : undefined,
      multisig:
        typeof data.get('multisig') !== 'undefined'
          ? TransactionSignatureMultisig.fromEncodingData(data.get('multisig'))
          : undefined,
      sig: data.get('sig'),
    });
  }
}

/**
 * (lsig) Programatic transaction signature.
 * Definition:
 * data/transactions/logicsig.go
 */
export class TransactionSignatureLogicsig implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        { key: 'logic', valueSchema: new ByteArraySchema(), omitEmpty: true },
        {
          key: 'args',
          valueSchema: new OptionalSchema(
            new ArraySchema(new ByteArraySchema())
          ),
          omitEmpty: true,
        },
        {
          key: 'logic-multisig-signature',
          valueSchema: new OptionalSchema(
            TransactionSignatureMultisig.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'multisig-signature',
          valueSchema: new OptionalSchema(
            TransactionSignatureMultisig.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'signature',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (l) Program signed by a signature or multi signature, or hashed to be the
   * address of ana ccount. Base64 encoded TEAL program.
   */
  public logic: Uint8Array;

  /**
   * (arg) Logic arguments, base64 encoded.
   */
  public args?: Uint8Array[];

  /**
   * structure holding multiple subsignatures.
   * Definition:
   * crypto/multisig.go : MultisigSig
   */
  public logicMultisigSignature?: TransactionSignatureMultisig;

  /**
   * structure holding multiple subsignatures.
   * Definition:
   * crypto/multisig.go : MultisigSig
   */
  public multisigSignature?: TransactionSignatureMultisig;

  /**
   * (sig) ed25519 signature.
   */
  public signature?: Uint8Array;

  /**
   * Creates a new `TransactionSignatureLogicsig` object.
   * @param logic - (l) Program signed by a signature or multi signature, or hashed to be the
   * address of ana ccount. Base64 encoded TEAL program.
   * @param args - (arg) Logic arguments, base64 encoded.
   * @param logicMultisigSignature - structure holding multiple subsignatures.
   * Definition:
   * crypto/multisig.go : MultisigSig
   * @param multisigSignature - structure holding multiple subsignatures.
   * Definition:
   * crypto/multisig.go : MultisigSig
   * @param signature - (sig) ed25519 signature.
   */
  constructor({
    logic,
    args,
    logicMultisigSignature,
    multisigSignature,
    signature,
  }: {
    logic: string | Uint8Array;
    args?: Uint8Array[];
    logicMultisigSignature?: TransactionSignatureMultisig;
    multisigSignature?: TransactionSignatureMultisig;
    signature?: string | Uint8Array;
  }) {
    this.logic = typeof logic === 'string' ? base64ToBytes(logic) : logic;
    this.args = args;
    this.logicMultisigSignature = logicMultisigSignature;
    this.multisigSignature = multisigSignature;
    this.signature =
      typeof signature === 'string' ? base64ToBytes(signature) : signature;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionSignatureLogicsig.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['logic', this.logic],
      ['args', this.args],
      [
        'logic-multisig-signature',
        typeof this.logicMultisigSignature !== 'undefined'
          ? this.logicMultisigSignature.toEncodingData()
          : undefined,
      ],
      [
        'multisig-signature',
        typeof this.multisigSignature !== 'undefined'
          ? this.multisigSignature.toEncodingData()
          : undefined,
      ],
      ['signature', this.signature],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionSignatureLogicsig {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionSignatureLogicsig: ${data}`);
    }
    return new TransactionSignatureLogicsig({
      logic: data.get('logic'),
      args: data.get('args'),
      logicMultisigSignature:
        typeof data.get('logic-multisig-signature') !== 'undefined'
          ? TransactionSignatureMultisig.fromEncodingData(
              data.get('logic-multisig-signature')
            )
          : undefined,
      multisigSignature:
        typeof data.get('multisig-signature') !== 'undefined'
          ? TransactionSignatureMultisig.fromEncodingData(
              data.get('multisig-signature')
            )
          : undefined,
      signature: data.get('signature'),
    });
  }
}

/**
 * structure holding multiple subsignatures.
 * Definition:
 * crypto/multisig.go : MultisigSig
 */
export class TransactionSignatureMultisig implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'subsignature',
          valueSchema: new OptionalSchema(
            new ArraySchema(
              TransactionSignatureMultisigSubsignature.encodingSchema
            )
          ),
          omitEmpty: true,
        },
        {
          key: 'threshold',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        },
        {
          key: 'version',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (subsig) holds pairs of public key and signatures.
   */
  public subsignature?: TransactionSignatureMultisigSubsignature[];

  /**
   * (thr)
   */
  public threshold?: number;

  /**
   * (v)
   */
  public version?: number;

  /**
   * Creates a new `TransactionSignatureMultisig` object.
   * @param subsignature - (subsig) holds pairs of public key and signatures.
   * @param threshold - (thr)
   * @param version - (v)
   */
  constructor({
    subsignature,
    threshold,
    version,
  }: {
    subsignature?: TransactionSignatureMultisigSubsignature[];
    threshold?: number | bigint;
    version?: number | bigint;
  }) {
    this.subsignature = subsignature;
    this.threshold =
      typeof threshold === 'undefined'
        ? undefined
        : ensureSafeInteger(threshold);
    this.version =
      typeof version === 'undefined' ? undefined : ensureSafeInteger(version);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionSignatureMultisig.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'subsignature',
        typeof this.subsignature !== 'undefined'
          ? this.subsignature.map((v) => v.toEncodingData())
          : undefined,
      ],
      ['threshold', this.threshold],
      ['version', this.version],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionSignatureMultisig {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionSignatureMultisig: ${data}`);
    }
    return new TransactionSignatureMultisig({
      subsignature:
        typeof data.get('subsignature') !== 'undefined'
          ? data
              .get('subsignature')
              .map((v: unknown) =>
                TransactionSignatureMultisigSubsignature.fromEncodingData(v)
              )
          : undefined,
      threshold: data.get('threshold'),
      version: data.get('version'),
    });
  }
}

export class TransactionSignatureMultisigSubsignature implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'public-key',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        },
        {
          key: 'signature',
          valueSchema: new OptionalSchema(new ByteArraySchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (pk)
   */
  public publicKey?: Uint8Array;

  /**
   * (s)
   */
  public signature?: Uint8Array;

  /**
   * Creates a new `TransactionSignatureMultisigSubsignature` object.
   * @param publicKey - (pk)
   * @param signature - (s)
   */
  constructor({
    publicKey,
    signature,
  }: {
    publicKey?: string | Uint8Array;
    signature?: string | Uint8Array;
  }) {
    this.publicKey =
      typeof publicKey === 'string' ? base64ToBytes(publicKey) : publicKey;
    this.signature =
      typeof signature === 'string' ? base64ToBytes(signature) : signature;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionSignatureMultisigSubsignature.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['public-key', this.publicKey],
      ['signature', this.signature],
    ]);
  }

  static fromEncodingData(
    data: unknown
  ): TransactionSignatureMultisigSubsignature {
    if (!(data instanceof Map)) {
      throw new Error(
        `Invalid decoded TransactionSignatureMultisigSubsignature: ${data}`
      );
    }
    return new TransactionSignatureMultisigSubsignature({
      publicKey: data.get('public-key'),
      signature: data.get('signature'),
    });
  }
}

/**
 * Fields for a state proof transaction.
 * Definition:
 * data/transactions/stateproof.go : StateProofTxnFields
 */
export class TransactionStateProof implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'message',
          valueSchema: new OptionalSchema(
            IndexerStateProofMessage.encodingSchema
          ),
          omitEmpty: true,
        },
        {
          key: 'state-proof',
          valueSchema: new OptionalSchema(StateProofFields.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'state-proof-type',
          valueSchema: new OptionalSchema(new Uint64Schema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (spmsg)
   */
  public message?: IndexerStateProofMessage;

  /**
   * (sp) represents a state proof.
   * Definition:
   * crypto/stateproof/structs.go : StateProof
   */
  public stateProof?: StateProofFields;

  /**
   * (sptype) Type of the state proof. Integer representing an entry defined in
   * protocol/stateproof.go
   */
  public stateProofType?: number;

  /**
   * Creates a new `TransactionStateProof` object.
   * @param message - (spmsg)
   * @param stateProof - (sp) represents a state proof.
   * Definition:
   * crypto/stateproof/structs.go : StateProof
   * @param stateProofType - (sptype) Type of the state proof. Integer representing an entry defined in
   * protocol/stateproof.go
   */
  constructor({
    message,
    stateProof,
    stateProofType,
  }: {
    message?: IndexerStateProofMessage;
    stateProof?: StateProofFields;
    stateProofType?: number | bigint;
  }) {
    this.message = message;
    this.stateProof = stateProof;
    this.stateProofType =
      typeof stateProofType === 'undefined'
        ? undefined
        : ensureSafeInteger(stateProofType);
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionStateProof.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'message',
        typeof this.message !== 'undefined'
          ? this.message.toEncodingData()
          : undefined,
      ],
      [
        'state-proof',
        typeof this.stateProof !== 'undefined'
          ? this.stateProof.toEncodingData()
          : undefined,
      ],
      ['state-proof-type', this.stateProofType],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionStateProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionStateProof: ${data}`);
    }
    return new TransactionStateProof({
      message:
        typeof data.get('message') !== 'undefined'
          ? IndexerStateProofMessage.fromEncodingData(data.get('message'))
          : undefined,
      stateProof:
        typeof data.get('state-proof') !== 'undefined'
          ? StateProofFields.fromEncodingData(data.get('state-proof'))
          : undefined,
      stateProofType: data.get('state-proof-type'),
    });
  }
}

/**
 *
 */
export class TransactionsResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          omitEmpty: true,
        },
        {
          key: 'transactions',
          valueSchema: new ArraySchema(Transaction.encodingSchema),
          omitEmpty: true,
        },
        {
          key: 'next-token',
          valueSchema: new OptionalSchema(new StringSchema()),
          omitEmpty: true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Round at which the results were computed.
   */
  public currentRound: bigint;

  public transactions: Transaction[];

  /**
   * Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  public nextToken?: string;

  /**
   * Creates a new `TransactionsResponse` object.
   * @param currentRound - Round at which the results were computed.
   * @param transactions -
   * @param nextToken - Used for pagination, when making another request provide this token with the
   * next parameter.
   */
  constructor({
    currentRound,
    transactions,
    nextToken,
  }: {
    currentRound: number | bigint;
    transactions: Transaction[];
    nextToken?: string;
  }) {
    this.currentRound = ensureBigInt(currentRound);
    this.transactions = transactions;
    this.nextToken = nextToken;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionsResponse.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['current-round', this.currentRound],
      ['transactions', this.transactions.map((v) => v.toEncodingData())],
      ['next-token', this.nextToken],
    ]);
  }

  static fromEncodingData(data: unknown): TransactionsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TransactionsResponse: ${data}`);
    }
    return new TransactionsResponse({
      currentRound: data.get('current-round'),
      transactions: (data.get('transactions') ?? []).map((v: unknown) =>
        Transaction.fromEncodingData(v)
      ),
      nextToken: data.get('next-token'),
    });
  }
}
