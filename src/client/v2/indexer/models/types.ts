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
import { Address } from '../../../../encoding/address.js';
import { UntypedValue } from '../../untypedmodel.js';
// import BaseModel from '../../basemodel.js';

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
          omitEmpty: !true,
        },
        {
          key: 'amount',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'amount-without-pending-rewards',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'pending-rewards',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'rewards',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'status',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'total-apps-opted-in',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'total-assets-opted-in',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'total-box-bytes',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'total-boxes',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'total-created-apps',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'total-created-assets',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'apps-local-state',
          valueSchema: new ArraySchema(ApplicationLocalState.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'apps-total-extra-pages',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'apps-total-schema',
          valueSchema: ApplicationStateSchema.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'assets',
          valueSchema: new ArraySchema(AssetHolding.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'auth-addr',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'closed-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'created-apps',
          valueSchema: new ArraySchema(Application.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'created-assets',
          valueSchema: new ArraySchema(Asset.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'created-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'deleted',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'participation',
          valueSchema: AccountParticipation.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'reward-base',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'sig-type',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
   * Round during which this account was most recently closed.
   */
  public closedAtRound?: bigint;

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
   * Round during which this account first appeared in a transaction.
   */
  public createdAtRound?: bigint;

  /**
   * Whether or not this account is currently closed.
   */
  public deleted?: boolean;

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
   * * or null if unknown
   */
  public sigType?: string;

  /**
   * Creates a new `Account` object.
   * @param address - the account public key
   * @param amount - (algo) total number of MicroAlgos in the account
   * @param amountWithoutPendingRewards - specifies the amount of MicroAlgos in the account, without the pending rewards.
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
   * @param totalBoxBytes - For app-accounts only. The total number of bytes allocated for the keys and
   * values of boxes which belong to the associated application.
   * @param totalBoxes - For app-accounts only. The total number of boxes which belong to the associated
   * application.
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
   * @param closedAtRound - Round during which this account was most recently closed.
   * @param createdApps - (appp) parameters of applications created by this account including app global
   * data.
   * Note: the raw account uses `map[int] -> AppParams` for this type.
   * @param createdAssets - (apar) parameters of assets created by this account.
   * Note: the raw account uses `map[int] -> Asset` for this type.
   * @param createdAtRound - Round during which this account first appeared in a transaction.
   * @param deleted - Whether or not this account is currently closed.
   * @param participation - AccountParticipation describes the parameters used by this account in consensus
   * protocol.
   * @param rewardBase - (ebase) used as part of the rewards computation. Only applicable to accounts
   * which are participating.
   * @param sigType - Indicates what type of signature is used by this account, must be one of:
   * * sig
   * * msig
   * * lsig
   * * or null if unknown
   */
  constructor({
    address,
    amount,
    amountWithoutPendingRewards,
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
    participation,
    rewardBase,
    sigType,
  }: {
    address: string;
    amount: number | bigint;
    amountWithoutPendingRewards: number | bigint;
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
    participation?: AccountParticipation;
    rewardBase?: number | bigint;
    sigType?: string;
  }) {
    this.address = address;
    this.amount = ensureBigInt(amount);
    this.amountWithoutPendingRewards = ensureBigInt(
      amountWithoutPendingRewards
    );
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
    const data = new Map<string, unknown>([
      ['address', this.address],
      ['amount', this.amount],
      ['amount-without-pending-rewards', this.amountWithoutPendingRewards],
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
    if (this.closedAtRound) {
      data.set('closed-at-round', this.closedAtRound);
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
    if (this.createdAtRound) {
      data.set('created-at-round', this.createdAtRound);
    }
    if (this.deleted) {
      data.set('deleted', this.deleted);
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
    return data;
  }

  static fromEncodingData(data: unknown): Account {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Account({
      address: data.get('address') ?? '',
      amount: data.get('amount') ?? 0,
      amountWithoutPendingRewards:
        data.get('amount-without-pending-rewards') ?? 0,
      pendingRewards: data.get('pending-rewards') ?? 0,
      rewards: data.get('rewards') ?? 0,
      round: data.get('round') ?? 0,
      status: data.get('status') ?? '',
      totalAppsOptedIn: data.get('total-apps-opted-in') ?? 0,
      totalAssetsOptedIn: data.get('total-assets-opted-in') ?? 0,
      totalBoxBytes: data.get('total-box-bytes') ?? 0,
      totalBoxes: data.get('total-boxes') ?? 0,
      totalCreatedApps: data.get('total-created-apps') ?? 0,
      totalCreatedAssets: data.get('total-created-assets') ?? 0,
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
      closedAtRound: data.get('closed-at-round'),
      createdApps:
        typeof data.get('created-apps') !== 'undefined'
          ? data.get('created-apps').map(Application.fromEncodingData)
          : undefined,
      createdAssets:
        typeof data.get('created-assets') !== 'undefined'
          ? data.get('created-assets').map(Asset.fromEncodingData)
          : undefined,
      createdAtRound: data.get('created-at-round'),
      deleted: data.get('deleted'),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'selection-participation-key',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'vote-first-valid',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'vote-key-dilution',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'vote-last-valid',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'vote-participation-key',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'state-proof-key',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
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
 *
 */
export class AccountResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'account',
          valueSchema: Account.encodingSchema,
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
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
    const data = new Map<string, unknown>([
      ['account', this.account.toEncodingData()],
      ['current-round', this.currentRound],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): AccountResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountResponse({
      account: Account.fromEncodingData(data.get('account') ?? {}),
      currentRound: data.get('current-round') ?? 0,
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
          omitEmpty: !true,
        },
        {
          key: 'delta',
          valueSchema: new ArraySchema(EvalDeltaKeyValue.encodingSchema),
          required: true,
          omitEmpty: !true,
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
      address: data.get('address') ?? '',
      delta: (data.get('delta') ?? []).map(EvalDeltaKeyValue.fromEncodingData),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'accounts',
          valueSchema: new ArraySchema(Account.encodingSchema),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['accounts', this.accounts.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
    ]);
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): AccountsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AccountsResponse({
      accounts: (data.get('accounts') ?? []).map(Account.fromEncodingData),
      currentRound: data.get('current-round') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'params',
          valueSchema: ApplicationParams.encodingSchema,
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'created-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'deleted',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'deleted-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
   * @param id - (appidx) application index.
   * @param params - (appparams) application parameters.
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
    const data = new Map<string, unknown>([
      ['id', this.id],
      ['params', this.params.toEncodingData()],
    ]);
    if (this.createdAtRound) {
      data.set('created-at-round', this.createdAtRound);
    }
    if (this.deleted) {
      data.set('deleted', this.deleted);
    }
    if (this.deletedAtRound) {
      data.set('deleted-at-round', this.deletedAtRound);
    }
    return data;
  }

  static fromEncodingData(data: unknown): Application {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Application({
      id: data.get('id') ?? 0,
      params: ApplicationParams.fromEncodingData(data.get('params') ?? {}),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'schema',
          valueSchema: ApplicationStateSchema.encodingSchema,
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'closed-out-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'deleted',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'key-value',
          valueSchema: new ArraySchema(TealKeyValue.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'opted-in-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
   * Round when account closed out of the application.
   */
  public closedOutAtRound?: bigint;

  /**
   * Whether or not the application local state is currently deleted from its
   * account.
   */
  public deleted?: boolean;

  /**
   * (tkv) storage.
   */
  public keyValue?: TealKeyValue[];

  /**
   * Round when the account opted into the application.
   */
  public optedInAtRound?: bigint;

  /**
   * Creates a new `ApplicationLocalState` object.
   * @param id - The application which this local state is for.
   * @param schema - (hsch) schema.
   * @param closedOutAtRound - Round when account closed out of the application.
   * @param deleted - Whether or not the application local state is currently deleted from its
   * account.
   * @param keyValue - (tkv) storage.
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
    const data = new Map<string, unknown>([
      ['id', this.id],
      ['schema', this.schema.toEncodingData()],
    ]);
    if (this.closedOutAtRound) {
      data.set('closed-out-at-round', this.closedOutAtRound);
    }
    if (this.deleted) {
      data.set('deleted', this.deleted);
    }
    if (this.keyValue && this.keyValue.length) {
      data.set(
        'key-value',
        this.keyValue.map((v) => v.toEncodingData())
      );
    }
    if (this.optedInAtRound) {
      data.set('opted-in-at-round', this.optedInAtRound);
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationLocalState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationLocalState({
      id: data.get('id') ?? 0,
      schema: ApplicationStateSchema.fromEncodingData(data.get('schema') ?? {}),
      closedOutAtRound: data.get('closed-out-at-round'),
      deleted: data.get('deleted'),
      keyValue:
        typeof data.get('key-value') !== 'undefined'
          ? data.get('key-value').map(TealKeyValue.fromEncodingData)
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'apps-local-states',
          valueSchema: new ArraySchema(ApplicationLocalState.encodingSchema),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      [
        'apps-local-states',
        this.appsLocalStates.map((v) => v.toEncodingData()),
      ],
      ['current-round', this.currentRound],
    ]);
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationLocalStatesResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationLocalStatesResponse({
      appsLocalStates: (data.get('apps-local-states') ?? []).map(
        ApplicationLocalState.fromEncodingData
      ),
      currentRound: data.get('current-round') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'logs',
          valueSchema: new ArraySchema(new ByteArraySchema()),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'txid',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        }
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * (lg) Logs for the application being executed by the transaction.
   */
  public logs: Uint8Array[];

  /**
   * Transaction ID
   */
  public txid: string;

  /**
   * Creates a new `ApplicationLogData` object.
   * @param logs - (lg) Logs for the application being executed by the transaction.
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
    const data = new Map<string, unknown>([
      ['logs', this.logs],
      ['txid', this.txid],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationLogData {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationLogData({
      logs: data.get('logs') ?? [],
      txid: data.get('txid') ?? '',
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'application-id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'log-data',
          valueSchema: new ArraySchema(ApplicationLogData.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['application-id', this.applicationId],
      ['current-round', this.currentRound],
    ]);
    if (this.logData && this.logData.length) {
      data.set(
        'log-data',
        this.logData.map((v) => v.toEncodingData())
      );
    }
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationLogsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationLogsResponse({
      applicationId: data.get('application-id') ?? 0,
      currentRound: data.get('current-round') ?? 0,
      logData:
        typeof data.get('log-data') !== 'undefined'
          ? data.get('log-data').map(ApplicationLogData.fromEncodingData)
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'approval-program',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'clear-state-program',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'creator',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'extra-program-pages',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'global-state',
          valueSchema: new ArraySchema(TealKeyValue.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'global-state-schema',
          valueSchema: ApplicationStateSchema.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'local-state-schema',
          valueSchema: ApplicationStateSchema.encodingSchema,
          required: false,
          omitEmpty: !false,
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
  public creator?: Address;

  /**
   * (epp) the amount of extra program pages available to this app.
   */
  public extraProgramPages?: number;

  /**
   * [\gs) global schema
   */
  public globalState?: TealKeyValue[];

  /**
   * [\gsch) global schema
   */
  public globalStateSchema?: ApplicationStateSchema;

  /**
   * [\lsch) local schema
   */
  public localStateSchema?: ApplicationStateSchema;

  /**
   * Creates a new `ApplicationParams` object.
   * @param approvalProgram - (approv) approval program.
   * @param clearStateProgram - (clearp) approval program.
   * @param creator - The address that created this application. This is the address where the
   * parameters and global state for this application can be found.
   * @param extraProgramPages - (epp) the amount of extra program pages available to this app.
   * @param globalState - [\gs) global schema
   * @param globalStateSchema - [\gsch) global schema
   * @param localStateSchema - [\lsch) local schema
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
    creator?: Address | string;
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
    ]);
    if (this.creator) {
      data.set('creator', this.creator.toString());
    }
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
      approvalProgram: data.get('approval-program') ?? new Uint8Array(),
      clearStateProgram: data.get('clear-state-program') ?? new Uint8Array(),
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
 *
 */
export class ApplicationResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'application',
          valueSchema: Application.encodingSchema,
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['current-round', this.currentRound],
    ]);
    if (this.application) {
      data.set('application', this.application.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationResponse({
      currentRound: data.get('current-round') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'num-byte-slice',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'num-uint',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
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
      numByteSlice: data.get('num-byte-slice') ?? 0,
      numUint: data.get('num-uint') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'applications',
          valueSchema: new ArraySchema(Application.encodingSchema),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['applications', this.applications.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
    ]);
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): ApplicationsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ApplicationsResponse({
      applications: (data.get('applications') ?? []).map(
        Application.fromEncodingData
      ),
      currentRound: data.get('current-round') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'index',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'params',
          valueSchema: AssetParams.encodingSchema,
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'created-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'deleted',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'destroyed-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['index', this.index],
      ['params', this.params.toEncodingData()],
    ]);
    if (this.createdAtRound) {
      data.set('created-at-round', this.createdAtRound);
    }
    if (this.deleted) {
      data.set('deleted', this.deleted);
    }
    if (this.destroyedAtRound) {
      data.set('destroyed-at-round', this.destroyedAtRound);
    }
    return data;
  }

  static fromEncodingData(data: unknown): Asset {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Asset({
      index: data.get('index') ?? 0,
      params: AssetParams.fromEncodingData(data.get('params') ?? {}),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'balances',
          valueSchema: new ArraySchema(MiniAssetHolding.encodingSchema),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['balances', this.balances.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
    ]);
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): AssetBalancesResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetBalancesResponse({
      balances: (data.get('balances') ?? []).map(
        MiniAssetHolding.fromEncodingData
      ),
      currentRound: data.get('current-round') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'amount',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'asset-id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'is-frozen',
          valueSchema: new BooleanSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'deleted',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'opted-in-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'opted-out-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
   * @param amount - (a) number of units held.
   * @param assetId - Asset ID of the holding.
   * @param isFrozen - (f) whether or not the holding is frozen.
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
    const data = new Map<string, unknown>([
      ['amount', this.amount],
      ['asset-id', this.assetId],
      ['is-frozen', this.isFrozen],
    ]);
    if (this.deleted) {
      data.set('deleted', this.deleted);
    }
    if (this.optedInAtRound) {
      data.set('opted-in-at-round', this.optedInAtRound);
    }
    if (this.optedOutAtRound) {
      data.set('opted-out-at-round', this.optedOutAtRound);
    }
    return data;
  }

  static fromEncodingData(data: unknown): AssetHolding {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetHolding({
      amount: data.get('amount') ?? 0,
      assetId: data.get('asset-id') ?? 0,
      isFrozen: data.get('is-frozen') ?? false,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'assets',
          valueSchema: new ArraySchema(AssetHolding.encodingSchema),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['assets', this.assets.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
    ]);
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): AssetHoldingsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetHoldingsResponse({
      assets: (data.get('assets') ?? []).map(AssetHolding.fromEncodingData),
      currentRound: data.get('current-round') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'creator',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'decimals',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'total',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'clawback',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'default-frozen',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'freeze',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'manager',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'metadata-hash',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'name',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'name-b64',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'reserve',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'unit-name',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'unit-name-b64',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'url',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'url-b64',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
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
 *
 */
export class AssetResponse implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'asset',
          valueSchema: Asset.encodingSchema,
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
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
    const data = new Map<string, unknown>([
      ['asset', this.asset.toEncodingData()],
      ['current-round', this.currentRound],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): AssetResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetResponse({
      asset: Asset.fromEncodingData(data.get('asset') ?? {}),
      currentRound: data.get('current-round') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'assets',
          valueSchema: new ArraySchema(Asset.encodingSchema),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['assets', this.assets.map((v) => v.toEncodingData())],
      ['current-round', this.currentRound],
    ]);
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): AssetsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new AssetsResponse({
      assets: (data.get('assets') ?? []).map(Asset.fromEncodingData),
      currentRound: data.get('current-round') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'genesis-hash',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'genesis-id',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'previous-block-hash',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'seed',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'timestamp',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'transactions-root',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'transactions-root-sha256',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'participation-updates',
          valueSchema: ParticipationUpdates.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'rewards',
          valueSchema: BlockRewards.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'state-proof-tracking',
          valueSchema: new ArraySchema(StateProofTracking.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'transactions',
          valueSchema: new ArraySchema(Transaction.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'txn-counter',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'upgrade-state',
          valueSchema: BlockUpgradeState.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'upgrade-vote',
          valueSchema: BlockUpgradeVote.encodingSchema,
          required: false,
          omitEmpty: !false,
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
   * Participation account data that needs to be checked/acted on by the network.
   */
  public participationUpdates?: ParticipationUpdates;

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
   * @param participationUpdates - Participation account data that needs to be checked/acted on by the network.
   * @param rewards - Fields relating to rewards,
   * @param stateProofTracking - Tracks the status of state proofs.
   * @param transactions - (txns) list of transactions corresponding to a given round.
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
    participationUpdates,
    rewards,
    stateProofTracking,
    transactions,
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
    participationUpdates?: ParticipationUpdates;
    rewards?: BlockRewards;
    stateProofTracking?: StateProofTracking[];
    transactions?: Transaction[];
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
    this.participationUpdates = participationUpdates;
    this.rewards = rewards;
    this.stateProofTracking = stateProofTracking;
    this.transactions = transactions;
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
    const data = new Map<string, unknown>([
      ['genesis-hash', this.genesisHash],
      ['genesis-id', this.genesisId],
      ['previous-block-hash', this.previousBlockHash],
      ['round', this.round],
      ['seed', this.seed],
      ['timestamp', this.timestamp],
      ['transactions-root', this.transactionsRoot],
      ['transactions-root-sha256', this.transactionsRootSha256],
    ]);
    if (this.participationUpdates) {
      data.set(
        'participation-updates',
        this.participationUpdates.toEncodingData()
      );
    }
    if (this.rewards) {
      data.set('rewards', this.rewards.toEncodingData());
    }
    if (this.stateProofTracking && this.stateProofTracking.length) {
      data.set(
        'state-proof-tracking',
        this.stateProofTracking.map((v) => v.toEncodingData())
      );
    }
    if (this.transactions && this.transactions.length) {
      data.set(
        'transactions',
        this.transactions.map((v) => v.toEncodingData())
      );
    }
    if (this.txnCounter) {
      data.set('txn-counter', this.txnCounter);
    }
    if (this.upgradeState) {
      data.set('upgrade-state', this.upgradeState.toEncodingData());
    }
    if (this.upgradeVote) {
      data.set('upgrade-vote', this.upgradeVote.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): Block {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Block({
      genesisHash: data.get('genesis-hash') ?? new Uint8Array(),
      genesisId: data.get('genesis-id') ?? '',
      previousBlockHash: data.get('previous-block-hash') ?? new Uint8Array(),
      round: data.get('round') ?? 0,
      seed: data.get('seed') ?? new Uint8Array(),
      timestamp: data.get('timestamp') ?? 0,
      transactionsRoot: data.get('transactions-root') ?? new Uint8Array(),
      transactionsRootSha256:
        data.get('transactions-root-sha256') ?? new Uint8Array(),
      participationUpdates:
        typeof data.get('participation-updates') !== 'undefined'
          ? ParticipationUpdates.fromEncodingData(
              data.get('participation-updates')
            )
          : undefined,
      rewards:
        typeof data.get('rewards') !== 'undefined'
          ? BlockRewards.fromEncodingData(data.get('rewards'))
          : undefined,
      stateProofTracking:
        typeof data.get('state-proof-tracking') !== 'undefined'
          ? data
              .get('state-proof-tracking')
              .map(StateProofTracking.fromEncodingData)
          : undefined,
      transactions:
        typeof data.get('transactions') !== 'undefined'
          ? data.get('transactions').map(Transaction.fromEncodingData)
          : undefined,
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
 * Fields relating to rewards,
 */
export class BlockRewards implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'fee-sink',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'rewards-calculation-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'rewards-level',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'rewards-pool',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'rewards-rate',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'rewards-residue',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
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
    const data = new Map<string, unknown>([
      ['fee-sink', this.feeSink],
      ['rewards-calculation-round', this.rewardsCalculationRound],
      ['rewards-level', this.rewardsLevel],
      ['rewards-pool', this.rewardsPool],
      ['rewards-rate', this.rewardsRate],
      ['rewards-residue', this.rewardsResidue],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): BlockRewards {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BlockRewards({
      feeSink: data.get('fee-sink') ?? '',
      rewardsCalculationRound: data.get('rewards-calculation-round') ?? 0,
      rewardsLevel: data.get('rewards-level') ?? 0,
      rewardsPool: data.get('rewards-pool') ?? '',
      rewardsRate: data.get('rewards-rate') ?? 0,
      rewardsResidue: data.get('rewards-residue') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'current-protocol',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'next-protocol',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'next-protocol-approvals',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'next-protocol-switch-on',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'next-protocol-vote-before',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['current-protocol', this.currentProtocol],
    ]);
    if (this.nextProtocol) {
      data.set('next-protocol', this.nextProtocol);
    }
    if (this.nextProtocolApprovals) {
      data.set('next-protocol-approvals', this.nextProtocolApprovals);
    }
    if (this.nextProtocolSwitchOn) {
      data.set('next-protocol-switch-on', this.nextProtocolSwitchOn);
    }
    if (this.nextProtocolVoteBefore) {
      data.set('next-protocol-vote-before', this.nextProtocolVoteBefore);
    }
    return data;
  }

  static fromEncodingData(data: unknown): BlockUpgradeState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BlockUpgradeState({
      currentProtocol: data.get('current-protocol') ?? '',
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'upgrade-approve',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'upgrade-delay',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'upgrade-propose',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.upgradeApprove) {
      data.set('upgrade-approve', this.upgradeApprove);
    }
    if (this.upgradeDelay) {
      data.set('upgrade-delay', this.upgradeDelay);
    }
    if (this.upgradePropose) {
      data.set('upgrade-propose', this.upgradePropose);
    }
    return data;
  }

  static fromEncodingData(data: unknown): BlockUpgradeVote {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'name',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'value',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
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
      name: data.get('name') ?? new Uint8Array(),
      round: data.get('round') ?? 0,
      value: data.get('value') ?? new Uint8Array(),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'name',
        valueSchema: new ByteArraySchema(),
        required: true,
        omitEmpty: !true,
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
      name: data.get('name') ?? new Uint8Array(),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'application-id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'boxes',
          valueSchema: new ArraySchema(BoxDescriptor.encodingSchema),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['application-id', this.applicationId],
      ['boxes', this.boxes.map((v) => v.toEncodingData())],
    ]);
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): BoxesResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new BoxesResponse({
      applicationId: data.get('application-id') ?? 0,
      boxes: (data.get('boxes') ?? []).map(BoxDescriptor.fromEncodingData),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'message',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'data',
          valueSchema: UntypedValue.encodingSchema,
          required: false,
          omitEmpty: !false,
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
      message: data.get('message') ?? '',
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
          omitEmpty: !true,
        },
        {
          key: 'bytes',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'uint',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
      action: data.get('action') ?? 0,
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
          omitEmpty: !true,
        },
        {
          key: 'value',
          valueSchema: EvalDelta.encodingSchema,
          required: true,
          omitEmpty: !true,
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
      key: data.get('key') ?? '',
      value: EvalDelta.fromEncodingData(data.get('value') ?? {}),
    });
  }
}

export class HashFactory implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'hash-type',
        valueSchema: new Uint64Schema(),
        required: false,
        omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.hashType) {
      data.set('hash-type', this.hashType);
    }
    return data;
  }

  static fromEncodingData(data: unknown): HashFactory {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new HashFactory({
      hashType: data.get('hash-type'),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'db-available',
          valueSchema: new BooleanSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'is-migrating',
          valueSchema: new BooleanSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'message',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'version',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'data',
          valueSchema: UntypedValue.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'errors',
          valueSchema: new ArraySchema(new StringSchema()),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['db-available', this.dbAvailable],
      ['is-migrating', this.isMigrating],
      ['message', this.message],
      ['round', this.round],
      ['version', this.version],
    ]);
    if (this.data) {
      data.set('data', this.data.toEncodingData());
    }
    if (this.errors && this.errors.length) {
      data.set('errors', this.errors);
    }
    return data;
  }

  static fromEncodingData(data: unknown): HealthCheck {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new HealthCheck({
      dbAvailable: data.get('db-available') ?? false,
      isMigrating: data.get('is-migrating') ?? false,
      message: data.get('message') ?? '',
      round: data.get('round') ?? 0,
      version: data.get('version') ?? '',
      data:
        typeof data.get('data') !== 'undefined'
          ? UntypedValue.fromEncodingData(data.get('data'))
          : undefined,
      errors: data.get('errors'),
    });
  }
}

export class IndexerStateProofMessage implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'block-headers-commitment',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'first-attested-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'latest-attested-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'ln-proven-weight',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'voters-commitment',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.blockHeadersCommitment) {
      data.set('block-headers-commitment', this.blockHeadersCommitment);
    }
    if (this.firstAttestedRound) {
      data.set('first-attested-round', this.firstAttestedRound);
    }
    if (this.latestAttestedRound) {
      data.set('latest-attested-round', this.latestAttestedRound);
    }
    if (this.lnProvenWeight) {
      data.set('ln-proven-weight', this.lnProvenWeight);
    }
    if (this.votersCommitment) {
      data.set('voters-commitment', this.votersCommitment);
    }
    return data;
  }

  static fromEncodingData(data: unknown): IndexerStateProofMessage {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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

export class MerkleArrayProof implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'hash-factory',
          valueSchema: HashFactory.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'path',
          valueSchema: new ArraySchema(new ByteArraySchema()),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'tree-depth',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.hashFactory) {
      data.set('hash-factory', this.hashFactory.toEncodingData());
    }
    if (this.path && this.path.length) {
      data.set('path', this.path);
    }
    if (this.treeDepth) {
      data.set('tree-depth', this.treeDepth);
    }
    return data;
  }

  static fromEncodingData(data: unknown): MerkleArrayProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'address',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'amount',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'is-frozen',
          valueSchema: new BooleanSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'deleted',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'opted-in-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'opted-out-at-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['address', this.address],
      ['amount', this.amount],
      ['is-frozen', this.isFrozen],
    ]);
    if (this.deleted) {
      data.set('deleted', this.deleted);
    }
    if (this.optedInAtRound) {
      data.set('opted-in-at-round', this.optedInAtRound);
    }
    if (this.optedOutAtRound) {
      data.set('opted-out-at-round', this.optedOutAtRound);
    }
    return data;
  }

  static fromEncodingData(data: unknown): MiniAssetHolding {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new MiniAssetHolding({
      address: data.get('address') ?? '',
      amount: data.get('amount') ?? 0,
      isFrozen: data.get('is-frozen') ?? false,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push({
        key: 'expired-participation-accounts',
        valueSchema: new ArraySchema(new StringSchema()),
        required: false,
        omitEmpty: !false,
      });
    }
    return this.encodingSchemaValue;
  }

  /**
   * (partupdrmv) a list of online accounts that needs to be converted to offline
   * since their participation key expired.
   */
  public expiredParticipationAccounts?: string[];

  /**
   * Creates a new `ParticipationUpdates` object.
   * @param expiredParticipationAccounts - (partupdrmv) a list of online accounts that needs to be converted to offline
   * since their participation key expired.
   */
  constructor({
    expiredParticipationAccounts,
  }: {
    expiredParticipationAccounts?: string[];
  }) {
    this.expiredParticipationAccounts = expiredParticipationAccounts;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return ParticipationUpdates.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([]);
    if (
      this.expiredParticipationAccounts &&
      this.expiredParticipationAccounts.length
    ) {
      data.set(
        'expired-participation-accounts',
        this.expiredParticipationAccounts
      );
    }
    return data;
  }

  static fromEncodingData(data: unknown): ParticipationUpdates {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new ParticipationUpdates({
      expiredParticipationAccounts: data.get('expired-participation-accounts'),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'part-proofs',
          valueSchema: MerkleArrayProof.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'positions-to-reveal',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'reveals',
          valueSchema: new ArraySchema(StateProofReveal.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'salt-version',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'sig-commit',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'sig-proofs',
          valueSchema: MerkleArrayProof.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'signed-weight',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.partProofs) {
      data.set('part-proofs', this.partProofs.toEncodingData());
    }
    if (this.positionsToReveal && this.positionsToReveal.length) {
      data.set('positions-to-reveal', this.positionsToReveal);
    }
    if (this.reveals && this.reveals.length) {
      data.set(
        'reveals',
        this.reveals.map((v) => v.toEncodingData())
      );
    }
    if (this.saltVersion) {
      data.set('salt-version', this.saltVersion);
    }
    if (this.sigCommit) {
      data.set('sig-commit', this.sigCommit);
    }
    if (this.sigProofs) {
      data.set('sig-proofs', this.sigProofs.toEncodingData());
    }
    if (this.signedWeight) {
      data.set('signed-weight', this.signedWeight);
    }
    return data;
  }

  static fromEncodingData(data: unknown): StateProofFields {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new StateProofFields({
      partProofs:
        typeof data.get('part-proofs') !== 'undefined'
          ? MerkleArrayProof.fromEncodingData(data.get('part-proofs'))
          : undefined,
      positionsToReveal: data.get('positions-to-reveal'),
      reveals:
        typeof data.get('reveals') !== 'undefined'
          ? data.get('reveals').map(StateProofReveal.fromEncodingData)
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'verifier',
          valueSchema: StateProofVerifier.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'weight',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.verifier) {
      data.set('verifier', this.verifier.toEncodingData());
    }
    if (this.weight) {
      data.set('weight', this.weight);
    }
    return data;
  }

  static fromEncodingData(data: unknown): StateProofParticipant {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'participant',
          valueSchema: StateProofParticipant.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'position',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'sig-slot',
          valueSchema: StateProofSigSlot.encodingSchema,
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.participant) {
      data.set('participant', this.participant.toEncodingData());
    }
    if (this.position) {
      data.set('position', this.position);
    }
    if (this.sigSlot) {
      data.set('sig-slot', this.sigSlot.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): StateProofReveal {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'lower-sig-weight',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'signature',
          valueSchema: StateProofSignature.encodingSchema,
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.lowerSigWeight) {
      data.set('lower-sig-weight', this.lowerSigWeight);
    }
    if (this.signature) {
      data.set('signature', this.signature.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): StateProofSigSlot {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'falcon-signature',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'merkle-array-index',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'proof',
          valueSchema: MerkleArrayProof.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'verifying-key',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.falconSignature) {
      data.set('falcon-signature', this.falconSignature);
    }
    if (this.merkleArrayIndex) {
      data.set('merkle-array-index', this.merkleArrayIndex);
    }
    if (this.proof) {
      data.set('proof', this.proof.toEncodingData());
    }
    if (this.verifyingKey) {
      data.set('verifying-key', this.verifyingKey);
    }
    return data;
  }

  static fromEncodingData(data: unknown): StateProofSignature {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'next-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'online-total-weight',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'type',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'voters-commitment',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.nextRound) {
      data.set('next-round', this.nextRound);
    }
    if (this.onlineTotalWeight) {
      data.set('online-total-weight', this.onlineTotalWeight);
    }
    if (this.type) {
      data.set('type', this.type);
    }
    if (this.votersCommitment) {
      data.set('voters-commitment', this.votersCommitment);
    }
    return data;
  }

  static fromEncodingData(data: unknown): StateProofTracking {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'commitment',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'key-lifetime',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.commitment) {
      data.set('commitment', this.commitment);
    }
    if (this.keyLifetime) {
      data.set('key-lifetime', this.keyLifetime);
    }
    return data;
  }

  static fromEncodingData(data: unknown): StateProofVerifier {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'num-byte-slice',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'num-uint',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        }
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
    const data = new Map<string, unknown>([
      ['num-byte-slice', this.numByteSlice],
      ['num-uint', this.numUint],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): StateSchema {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new StateSchema({
      numByteSlice: data.get('num-byte-slice') ?? 0,
      numUint: data.get('num-uint') ?? 0,
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
          omitEmpty: !true,
        },
        {
          key: 'value',
          valueSchema: TealValue.encodingSchema,
          required: true,
          omitEmpty: !true,
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
      key: data.get('key') ?? '',
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
          omitEmpty: !true,
        },
        {
          key: 'type',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'uint',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
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
      bytes: data.get('bytes') ?? '',
      type: data.get('type') ?? 0,
      uint: data.get('uint') ?? 0,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'fee',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'first-valid',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'last-valid',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'sender',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'application-transaction',
          valueSchema: TransactionApplication.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'asset-config-transaction',
          valueSchema: TransactionAssetConfig.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'asset-freeze-transaction',
          valueSchema: TransactionAssetFreeze.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'asset-transfer-transaction',
          valueSchema: TransactionAssetTransfer.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'auth-addr',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'close-rewards',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'closing-amount',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'confirmed-round',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'created-application-index',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'created-asset-index',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'genesis-hash',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'genesis-id',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'global-state-delta',
          valueSchema: new ArraySchema(EvalDeltaKeyValue.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'group',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'id',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'inner-txns',
          valueSchema: new ArraySchema(Transaction.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'intra-round-offset',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'keyreg-transaction',
          valueSchema: TransactionKeyreg.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'lease',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'local-state-delta',
          valueSchema: new ArraySchema(AccountStateDelta.encodingSchema),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'logs',
          valueSchema: new ArraySchema(new ByteArraySchema()),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'note',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'payment-transaction',
          valueSchema: TransactionPayment.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'receiver-rewards',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'rekey-to',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'round-time',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'sender-rewards',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'signature',
          valueSchema: TransactionSignature.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'state-proof-transaction',
          valueSchema: TransactionStateProof.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'tx-type',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['fee', this.fee],
      ['first-valid', this.firstValid],
      ['last-valid', this.lastValid],
      ['sender', this.sender],
    ]);
    if (this.applicationTransaction) {
      data.set(
        'application-transaction',
        this.applicationTransaction.toEncodingData()
      );
    }
    if (this.assetConfigTransaction) {
      data.set(
        'asset-config-transaction',
        this.assetConfigTransaction.toEncodingData()
      );
    }
    if (this.assetFreezeTransaction) {
      data.set(
        'asset-freeze-transaction',
        this.assetFreezeTransaction.toEncodingData()
      );
    }
    if (this.assetTransferTransaction) {
      data.set(
        'asset-transfer-transaction',
        this.assetTransferTransaction.toEncodingData()
      );
    }
    if (this.authAddr) {
      data.set('auth-addr', this.authAddr.toString());
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
    if (this.createdApplicationIndex) {
      data.set('created-application-index', this.createdApplicationIndex);
    }
    if (this.createdAssetIndex) {
      data.set('created-asset-index', this.createdAssetIndex);
    }
    if (this.genesisHash) {
      data.set('genesis-hash', this.genesisHash);
    }
    if (this.genesisId) {
      data.set('genesis-id', this.genesisId);
    }
    if (this.globalStateDelta && this.globalStateDelta.length) {
      data.set(
        'global-state-delta',
        this.globalStateDelta.map((v) => v.toEncodingData())
      );
    }
    if (this.group) {
      data.set('group', this.group);
    }
    if (this.id) {
      data.set('id', this.id);
    }
    if (this.innerTxns && this.innerTxns.length) {
      data.set(
        'inner-txns',
        this.innerTxns.map((v) => v.toEncodingData())
      );
    }
    if (this.intraRoundOffset) {
      data.set('intra-round-offset', this.intraRoundOffset);
    }
    if (this.keyregTransaction) {
      data.set('keyreg-transaction', this.keyregTransaction.toEncodingData());
    }
    if (this.lease) {
      data.set('lease', this.lease);
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
    if (this.note) {
      data.set('note', this.note);
    }
    if (this.paymentTransaction) {
      data.set('payment-transaction', this.paymentTransaction.toEncodingData());
    }
    if (this.receiverRewards) {
      data.set('receiver-rewards', this.receiverRewards);
    }
    if (this.rekeyTo) {
      data.set('rekey-to', this.rekeyTo.toString());
    }
    if (this.roundTime) {
      data.set('round-time', this.roundTime);
    }
    if (this.senderRewards) {
      data.set('sender-rewards', this.senderRewards);
    }
    if (this.signature) {
      data.set('signature', this.signature.toEncodingData());
    }
    if (this.stateProofTransaction) {
      data.set(
        'state-proof-transaction',
        this.stateProofTransaction.toEncodingData()
      );
    }
    if (this.txType) {
      data.set('tx-type', this.txType);
    }
    return data;
  }

  static fromEncodingData(data: unknown): Transaction {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new Transaction({
      fee: data.get('fee') ?? 0,
      firstValid: data.get('first-valid') ?? 0,
      lastValid: data.get('last-valid') ?? 0,
      sender: data.get('sender') ?? '',
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
              .map(EvalDeltaKeyValue.fromEncodingData)
          : undefined,
      group: data.get('group'),
      id: data.get('id'),
      innerTxns:
        typeof data.get('inner-txns') !== 'undefined'
          ? data.get('inner-txns').map(Transaction.fromEncodingData)
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
              .map(AccountStateDelta.fromEncodingData)
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'application-id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'accounts',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'application-args',
          valueSchema: new ArraySchema(new ByteArraySchema()),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'approval-program',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'clear-state-program',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'extra-program-pages',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'foreign-apps',
          valueSchema: new ArraySchema(new Uint64Schema()),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'foreign-assets',
          valueSchema: new ArraySchema(new Uint64Schema()),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'global-state-schema',
          valueSchema: StateSchema.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'local-state-schema',
          valueSchema: StateSchema.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'on-completion',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
   * Creates a new `TransactionApplication` object.
   * @param applicationId - (apid) ID of the application being configured or empty if creating.
   * @param accounts - (apat) List of accounts in addition to the sender that may be accessed from the
   * application's approval-program and clear-state-program.
   * @param applicationArgs - (apaa) transaction specific arguments accessed from the application's
   * approval-program and clear-state-program.
   * @param approvalProgram - (apap) Logic executed for every application transaction, except when
   * on-completion is set to "clear". It can read and write global state for the
   * application, as well as account-specific local state. Approval programs may
   * reject the transaction.
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
   */
  constructor({
    applicationId,
    accounts,
    applicationArgs,
    approvalProgram,
    clearStateProgram,
    extraProgramPages,
    foreignApps,
    foreignAssets,
    globalStateSchema,
    localStateSchema,
    onCompletion,
  }: {
    applicationId: number | bigint;
    accounts?: (Address | string)[];
    applicationArgs?: Uint8Array[];
    approvalProgram?: string | Uint8Array;
    clearStateProgram?: string | Uint8Array;
    extraProgramPages?: number | bigint;
    foreignApps?: (number | bigint)[];
    foreignAssets?: (number | bigint)[];
    globalStateSchema?: StateSchema;
    localStateSchema?: StateSchema;
    onCompletion?: string;
  }) {
    this.applicationId = ensureBigInt(applicationId);
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
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionApplication.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['application-id', this.applicationId],
    ]);
    if (this.accounts && this.accounts.length) {
      data.set(
        'accounts',
        this.accounts.map((addr) => addr.toString())
      );
    }
    if (this.applicationArgs && this.applicationArgs.length) {
      data.set('application-args', this.applicationArgs);
    }
    if (this.approvalProgram) {
      data.set('approval-program', this.approvalProgram);
    }
    if (this.clearStateProgram) {
      data.set('clear-state-program', this.clearStateProgram);
    }
    if (this.extraProgramPages) {
      data.set('extra-program-pages', this.extraProgramPages);
    }
    if (this.foreignApps && this.foreignApps.length) {
      data.set('foreign-apps', this.foreignApps);
    }
    if (this.foreignAssets && this.foreignAssets.length) {
      data.set('foreign-assets', this.foreignAssets);
    }
    if (this.globalStateSchema) {
      data.set('global-state-schema', this.globalStateSchema.toEncodingData());
    }
    if (this.localStateSchema) {
      data.set('local-state-schema', this.localStateSchema.toEncodingData());
    }
    if (this.onCompletion) {
      data.set('on-completion', this.onCompletion);
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionApplication {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionApplication({
      applicationId: data.get('application-id') ?? 0,
      accounts: data.get('accounts'),
      applicationArgs: data.get('application-args'),
      approvalProgram: data.get('approval-program'),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'asset-id',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'params',
          valueSchema: AssetParams.encodingSchema,
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.assetId) {
      data.set('asset-id', this.assetId);
    }
    if (this.params) {
      data.set('params', this.params.toEncodingData());
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionAssetConfig {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'address',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'asset-id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'new-freeze-status',
          valueSchema: new BooleanSchema(),
          required: true,
          omitEmpty: !true,
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
    const data = new Map<string, unknown>([
      ['address', this.address],
      ['asset-id', this.assetId],
      ['new-freeze-status', this.newFreezeStatus],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): TransactionAssetFreeze {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionAssetFreeze({
      address: data.get('address') ?? '',
      assetId: data.get('asset-id') ?? 0,
      newFreezeStatus: data.get('new-freeze-status') ?? false,
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'amount',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'asset-id',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'receiver',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'close-amount',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'close-to',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'sender',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['amount', this.amount],
      ['asset-id', this.assetId],
      ['receiver', this.receiver],
    ]);
    if (this.closeAmount) {
      data.set('close-amount', this.closeAmount);
    }
    if (this.closeTo) {
      data.set('close-to', this.closeTo);
    }
    if (this.sender) {
      data.set('sender', this.sender);
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionAssetTransfer {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionAssetTransfer({
      amount: data.get('amount') ?? 0,
      assetId: data.get('asset-id') ?? 0,
      receiver: data.get('receiver') ?? '',
      closeAmount: data.get('close-amount'),
      closeTo: data.get('close-to'),
      sender: data.get('sender'),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'non-participation',
          valueSchema: new BooleanSchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'selection-participation-key',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'state-proof-key',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'vote-first-valid',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'vote-key-dilution',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'vote-last-valid',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'vote-participation-key',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.nonParticipation) {
      data.set('non-participation', this.nonParticipation);
    }
    if (this.selectionParticipationKey) {
      data.set('selection-participation-key', this.selectionParticipationKey);
    }
    if (this.stateProofKey) {
      data.set('state-proof-key', this.stateProofKey);
    }
    if (this.voteFirstValid) {
      data.set('vote-first-valid', this.voteFirstValid);
    }
    if (this.voteKeyDilution) {
      data.set('vote-key-dilution', this.voteKeyDilution);
    }
    if (this.voteLastValid) {
      data.set('vote-last-valid', this.voteLastValid);
    }
    if (this.voteParticipationKey) {
      data.set('vote-participation-key', this.voteParticipationKey);
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionKeyreg {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'amount',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'receiver',
          valueSchema: new StringSchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'close-amount',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'close-remainder-to',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['amount', this.amount],
      ['receiver', this.receiver],
    ]);
    if (this.closeAmount) {
      data.set('close-amount', this.closeAmount);
    }
    if (this.closeRemainderTo) {
      data.set('close-remainder-to', this.closeRemainderTo);
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionPayment {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionPayment({
      amount: data.get('amount') ?? 0,
      receiver: data.get('receiver') ?? '',
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'transaction',
          valueSchema: Transaction.encodingSchema,
          required: true,
          omitEmpty: !true,
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
    const data = new Map<string, unknown>([
      ['current-round', this.currentRound],
      ['transaction', this.transaction.toEncodingData()],
    ]);
    return data;
  }

  static fromEncodingData(data: unknown): TransactionResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionResponse({
      currentRound: data.get('current-round') ?? 0,
      transaction: Transaction.fromEncodingData(data.get('transaction') ?? {}),
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'logicsig',
          valueSchema: TransactionSignatureLogicsig.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'multisig',
          valueSchema: TransactionSignatureMultisig.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'sig',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
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
   * (msig) structure holding multiple subsignatures.
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
   * @param multisig - (msig) structure holding multiple subsignatures.
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
    const data = new Map<string, unknown>([]);
    if (this.logicsig) {
      data.set('logicsig', this.logicsig.toEncodingData());
    }
    if (this.multisig) {
      data.set('multisig', this.multisig.toEncodingData());
    }
    if (this.sig) {
      data.set('sig', this.sig);
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionSignature {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'logic',
          valueSchema: new ByteArraySchema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'args',
          valueSchema: new ArraySchema(new ByteArraySchema()),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'multisig-signature',
          valueSchema: TransactionSignatureMultisig.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'signature',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
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
   * (msig) structure holding multiple subsignatures.
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
   * @param multisigSignature - (msig) structure holding multiple subsignatures.
   * Definition:
   * crypto/multisig.go : MultisigSig
   * @param signature - (sig) ed25519 signature.
   */
  constructor({
    logic,
    args,
    multisigSignature,
    signature,
  }: {
    logic: string | Uint8Array;
    args?: Uint8Array[];
    multisigSignature?: TransactionSignatureMultisig;
    signature?: string | Uint8Array;
  }) {
    this.logic = typeof logic === 'string' ? base64ToBytes(logic) : logic;
    this.args = args;
    this.multisigSignature = multisigSignature;
    this.signature =
      typeof signature === 'string' ? base64ToBytes(signature) : signature;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): Schema {
    return TransactionSignatureLogicsig.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([['logic', this.logic]]);
    if (this.args && this.args.length) {
      data.set('args', this.args);
    }
    if (this.multisigSignature) {
      data.set('multisig-signature', this.multisigSignature.toEncodingData());
    }
    if (this.signature) {
      data.set('signature', this.signature);
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionSignatureLogicsig {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionSignatureLogicsig({
      logic: data.get('logic') ?? new Uint8Array(),
      args: data.get('args'),
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
 * (msig) structure holding multiple subsignatures.
 * Definition:
 * crypto/multisig.go : MultisigSig
 */
export class TransactionSignatureMultisig implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  static get encodingSchema(): Schema {
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'subsignature',
          valueSchema: new ArraySchema(
            TransactionSignatureMultisigSubsignature.encodingSchema
          ),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'threshold',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'version',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.subsignature && this.subsignature.length) {
      data.set(
        'subsignature',
        this.subsignature.map((v) => v.toEncodingData())
      );
    }
    if (this.threshold) {
      data.set('threshold', this.threshold);
    }
    if (this.version) {
      data.set('version', this.version);
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionSignatureMultisig {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionSignatureMultisig({
      subsignature:
        typeof data.get('subsignature') !== 'undefined'
          ? data
              .get('subsignature')
              .map(TransactionSignatureMultisigSubsignature.fromEncodingData)
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'public-key',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'signature',
          valueSchema: new ByteArraySchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.publicKey) {
      data.set('public-key', this.publicKey);
    }
    if (this.signature) {
      data.set('signature', this.signature);
    }
    return data;
  }

  static fromEncodingData(
    data: unknown
  ): TransactionSignatureMultisigSubsignature {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'message',
          valueSchema: IndexerStateProofMessage.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'state-proof',
          valueSchema: StateProofFields.encodingSchema,
          required: false,
          omitEmpty: !false,
        },
        {
          key: 'state-proof-type',
          valueSchema: new Uint64Schema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([]);
    if (this.message) {
      data.set('message', this.message.toEncodingData());
    }
    if (this.stateProof) {
      data.set('state-proof', this.stateProof.toEncodingData());
    }
    if (this.stateProofType) {
      data.set('state-proof-type', this.stateProofType);
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionStateProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
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
      (this.encodingSchemaValue as NamedMapSchema).entries.push(
        {
          key: 'current-round',
          valueSchema: new Uint64Schema(),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'transactions',
          valueSchema: new ArraySchema(Transaction.encodingSchema),
          required: true,
          omitEmpty: !true,
        },
        {
          key: 'next-token',
          valueSchema: new StringSchema(),
          required: false,
          omitEmpty: !false,
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
    const data = new Map<string, unknown>([
      ['current-round', this.currentRound],
      ['transactions', this.transactions.map((v) => v.toEncodingData())],
    ]);
    if (this.nextToken) {
      data.set('next-token', this.nextToken);
    }
    return data;
  }

  static fromEncodingData(data: unknown): TransactionsResponse {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    return new TransactionsResponse({
      currentRound: data.get('current-round') ?? 0,
      transactions: (data.get('transactions') ?? []).map(
        Transaction.fromEncodingData
      ),
      nextToken: data.get('next-token'),
    });
  }
}
