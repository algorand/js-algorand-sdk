import { Encodable, Schema } from '../encoding/encoding.js';
import {
  NamedMapSchema,
  Uint64MapSchema,
  ByteArrayMapSchema,
  SpecialCaseBinaryStringMapSchema,
  SpecialCaseBinaryStringSchema,
  ArraySchema,
  BooleanSchema,
  Uint64Schema,
  AddressSchema,
  ByteArraySchema,
  FixedLengthByteArraySchema,
  OptionalSchema,
  UntypedSchema,
  allOmitEmpty,
  convertMap,
  combineMaps,
} from '../encoding/schema/index.js';
import { Address } from '../encoding/address.js';
import { BlockHeader } from './block.js';
import { UntypedValue } from '../client/v2/untypedmodel.js';

// TealValue contains type information and a value, representing a value in a TEAL program
export class TealValue implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'tt', valueSchema: new Uint64Schema() }, // type
      {
        key: 'tb', // bytes
        valueSchema: new OptionalSchema(new SpecialCaseBinaryStringSchema()),
      },
      { key: 'ui', valueSchema: new OptionalSchema(new Uint64Schema()) }, // uint
    ])
  );

  /**
   * Type determines the type of the value.
   * * 1 represents the type of a byte slice in a TEAL program
   * * 2 represents the type of an unsigned integer in a TEAL program
   */
  public type: number;
  public bytes?: Uint8Array;
  public uint?: bigint;

  constructor(params: { type: number; bytes?: Uint8Array; uint?: bigint }) {
    this.type = params.type;
    this.bytes = params.bytes;
    this.uint = params.uint;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return TealValue.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['tt', this.type],
      ['tb', this.bytes],
      ['ui', this.uint],
    ]);
  }

  public static fromEncodingData(data: unknown): TealValue {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TealValue: ${data}`);
    }
    return new TealValue({
      type: Number(data.get('tt')),
      bytes: data.get('tb'),
      uint: data.get('ui'),
    });
  }
}

/**
 * StateSchema sets maximums on the number of each type that may be stored
 */
export class StateSchema implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'nui', // numUints
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'nbs', // numByteSlices
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  public numUints: number;
  public numByteSlices: number;

  public constructor(params: { numUints: number; numByteSlices: number }) {
    this.numUints = params.numUints;
    this.numByteSlices = params.numByteSlices;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return StateSchema.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['nui', this.numUints],
      ['nbs', this.numByteSlices],
    ]);
  }

  public static fromEncodingData(data: unknown): StateSchema {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateSchema: ${data}`);
    }
    return new StateSchema({
      numUints: Number(data.get('nui')),
      numByteSlices: Number(data.get('nbs')),
    });
  }
}

/**
 * AppParams stores the global information associated with an application
 */
export class AppParams implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'approv', valueSchema: new ByteArraySchema() }, // approvalProgram
      { key: 'clearp', valueSchema: new ByteArraySchema() }, // alearStateProgram
      {
        key: 'gs',
        valueSchema: new SpecialCaseBinaryStringMapSchema(
          TealValue.encodingSchema
        ),
      }, // globalState
      { key: 'lsch', valueSchema: StateSchema.encodingSchema }, // localStateSchema
      { key: 'gsch', valueSchema: StateSchema.encodingSchema }, // globalStateSchema
      { key: 'epp', valueSchema: new Uint64Schema() }, // extraProgramPages
    ])
  );

  public approvalProgram: Uint8Array;
  public clearStateProgram: Uint8Array;
  public globalState: Map<Uint8Array, TealValue>;
  public localStateSchema: StateSchema;
  public globalStateSchema: StateSchema;
  public extraProgramPages: number;

  constructor(params: {
    approvalProgram: Uint8Array;
    clearStateProgram: Uint8Array;
    globalState: Map<Uint8Array, TealValue>;
    localStateSchema: StateSchema;
    globalStateSchema: StateSchema;
    extraProgramPages: number;
  }) {
    this.approvalProgram = params.approvalProgram;
    this.clearStateProgram = params.clearStateProgram;
    this.globalState = params.globalState;
    this.localStateSchema = params.localStateSchema;
    this.globalStateSchema = params.globalStateSchema;
    this.extraProgramPages = params.extraProgramPages;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AppParams.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['approv', this.approvalProgram],
      ['clearp', this.clearStateProgram],
      ['gs', convertMap(this.globalState, (k, v) => [k, v.toEncodingData()])],
      ['lsch', this.localStateSchema.toEncodingData()],
      ['gsch', this.globalStateSchema.toEncodingData()],
      ['epp', this.extraProgramPages],
    ]);
  }

  public static fromEncodingData(data: unknown) {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AppParams: ${data}`);
    }
    return new AppParams({
      approvalProgram: data.get('approv'),
      clearStateProgram: data.get('clearp'),
      globalState: convertMap(
        data.get('gs') as Map<Uint8Array, unknown>,
        (k, v) => [k, TealValue.fromEncodingData(v)]
      ),
      localStateSchema: StateSchema.fromEncodingData(data.get('lsch')),
      globalStateSchema: StateSchema.fromEncodingData(data.get('gsch')),
      extraProgramPages: Number(data.get('epp')),
    });
  }
}

/**
 * AppLocalState stores the LocalState associated with an application.
 */
export class AppLocalState implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'hsch', valueSchema: StateSchema.encodingSchema }, // schema
      {
        key: 'tkv', // keyValue
        valueSchema: new SpecialCaseBinaryStringMapSchema(
          TealValue.encodingSchema
        ),
      },
    ])
  );

  public schema: StateSchema;
  public keyValue: Map<Uint8Array, TealValue>;

  constructor(params: {
    schema: StateSchema;
    keyValue: Map<Uint8Array, TealValue>;
  }) {
    this.schema = params.schema;
    this.keyValue = params.keyValue;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AppLocalState.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['hsch', this.schema.toEncodingData()],
      ['tkv', convertMap(this.keyValue, (k, v) => [k, v.toEncodingData()])],
    ]);
  }

  public static fromEncodingData(data: unknown): AppLocalState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AppLocalState: ${data}`);
    }
    return new AppLocalState({
      schema: StateSchema.fromEncodingData(data.get('hsch')),
      keyValue: convertMap(
        data.get('tkv') as Map<Uint8Array, unknown>,
        (k, v) => [k, TealValue.fromEncodingData(v)]
      ),
    });
  }
}

/**
 * AppLocalStateDelta tracks a changed AppLocalState, and whether it was deleted
 */
export class AppLocalStateDelta implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'LocalState', // localState
        valueSchema: new OptionalSchema(AppLocalState.encodingSchema),
      },
      { key: 'Deleted', valueSchema: new BooleanSchema() }, // deleted
    ])
  );

  public localState?: AppLocalState;
  public deleted: boolean;

  constructor(params: { localState?: AppLocalState; deleted: boolean }) {
    this.localState = params.localState;
    this.deleted = params.deleted;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AppLocalStateDelta.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'LocalState',
        this.localState ? this.localState.toEncodingData() : undefined,
      ],
      ['Deleted', this.deleted],
    ]);
  }

  public static fromEncodingData(data: unknown): AppLocalStateDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AppLocalStateDelta: ${data}`);
    }
    return new AppLocalStateDelta({
      localState: data.get('LocalState')
        ? AppLocalState.fromEncodingData(data.get('LocalState'))
        : undefined,
      deleted: data.get('Deleted'),
    });
  }
}

/**
 * AppParamsDelta tracks a changed AppParams, and whether it was deleted
 */
export class AppParamsDelta implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'Params', // params
        valueSchema: new OptionalSchema(AppParams.encodingSchema),
      },
      { key: 'Deleted', valueSchema: new BooleanSchema() }, // deleted
    ])
  );

  public params?: AppParams;
  public deleted: boolean;

  constructor(params: { params?: AppParams; deleted: boolean }) {
    this.params = params.params;
    this.deleted = params.deleted;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AppParamsDelta.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Params', this.params ? this.params.toEncodingData() : undefined],
      ['Deleted', this.deleted],
    ]);
  }

  public static fromEncodingData(data: unknown): AppParamsDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AppParamsDelta: ${data}`);
    }
    return new AppParamsDelta({
      params: data.get('Params')
        ? AppParams.fromEncodingData(data.get('Params'))
        : undefined,
      deleted: data.get('Deleted'),
    });
  }
}

/**
 * AppResourceRecord represents AppParams and AppLocalState in deltas
 */
export class AppResourceRecord implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'Aidx', valueSchema: new Uint64Schema() }, // id
      { key: 'Addr', valueSchema: new AddressSchema() }, // address
      {
        key: 'Params', // params
        valueSchema: AppParamsDelta.encodingSchema,
      },
      {
        key: 'State', // state
        valueSchema: AppLocalStateDelta.encodingSchema,
      },
    ])
  );

  public id: bigint;
  public address: Address;
  public params: AppParamsDelta;
  public state: AppLocalStateDelta;

  constructor(params: {
    id: bigint;
    address: Address;
    params: AppParamsDelta;
    state: AppLocalStateDelta;
  }) {
    this.id = params.id;
    this.address = params.address;
    this.params = params.params;
    this.state = params.state;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AppResourceRecord.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Aidx', this.id],
      ['Addr', this.address],
      ['Params', this.params.toEncodingData()],
      ['State', this.state.toEncodingData()],
    ]);
  }

  public static fromEncodingData(data: unknown): AppResourceRecord {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AppResourceRecord: ${data}`);
    }
    return new AppResourceRecord({
      id: data.get('Aidx'),
      address: data.get('Addr'),
      params: AppParamsDelta.fromEncodingData(data.get('Params')),
      state: AppLocalStateDelta.fromEncodingData(data.get('State')),
    });
  }
}

/**
 * AssetHolding describes an asset held by an account.
 */
export class AssetHolding implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'a', valueSchema: new Uint64Schema() }, // amount
      { key: 'f', valueSchema: new BooleanSchema() }, // frozen
    ])
  );

  public amount: bigint;
  public frozen: boolean;

  constructor(params: { amount: bigint; frozen: boolean }) {
    this.amount = params.amount;
    this.frozen = params.frozen;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AssetHolding.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['a', this.amount],
      ['f', this.frozen],
    ]);
  }

  public static fromEncodingData(data: unknown): AssetHolding {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetHolding: ${data}`);
    }
    return new AssetHolding({
      amount: data.get('a'),
      frozen: data.get('f'),
    });
  }
}

/**
 * AssetHoldingDelta records a changed AssetHolding, and whether it was deleted
 */
export class AssetHoldingDelta implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'Holding', // holding
        valueSchema: new OptionalSchema(AssetHolding.encodingSchema),
      },
      { key: 'Deleted', valueSchema: new BooleanSchema() }, // deleted
    ])
  );

  public holding?: AssetHolding;
  public deleted: boolean;

  constructor(params: { holding?: AssetHolding; deleted: boolean }) {
    this.holding = params.holding;
    this.deleted = params.deleted;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AssetHoldingDelta.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Holding', this.holding ? this.holding.toEncodingData() : undefined],
      ['Deleted', this.deleted],
    ]);
  }

  public static fromEncodingData(data: unknown): AssetHoldingDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetHoldingDelta: ${data}`);
    }
    return new AssetHoldingDelta({
      holding: data.get('Holding')
        ? AssetHolding.fromEncodingData(data.get('Holding'))
        : undefined,
      deleted: data.get('Deleted'),
    });
  }
}

/**
 * AssetParams describes the parameters of an asset.
 */
export class AssetParams implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 't', valueSchema: new Uint64Schema() }, // total
      { key: 'dc', valueSchema: new Uint64Schema() }, // decimals
      { key: 'df', valueSchema: new BooleanSchema() }, // defaultFrozen
      {
        key: 'un', // unitName
        valueSchema: new OptionalSchema(new SpecialCaseBinaryStringSchema()),
      },
      {
        key: 'an', // assetName
        valueSchema: new OptionalSchema(new SpecialCaseBinaryStringSchema()),
      },
      {
        key: 'au', // url
        valueSchema: new OptionalSchema(new SpecialCaseBinaryStringSchema()),
      },
      { key: 'am', valueSchema: new FixedLengthByteArraySchema(32) }, // metadataHash
      { key: 'm', valueSchema: new OptionalSchema(new AddressSchema()) }, // manager
      { key: 'r', valueSchema: new OptionalSchema(new AddressSchema()) }, // reserve
      { key: 'f', valueSchema: new OptionalSchema(new AddressSchema()) }, // freeze
      { key: 'c', valueSchema: new OptionalSchema(new AddressSchema()) }, // clawback
    ])
  );

  /**
   * Total specifies the total number of units of this asset created.
   */
  public total: bigint;

  /**
   * Decimals specifies the number of digits to display after the decimal place when displaying this asset.
   * A value of 0 represents an asset that is not divisible, a value of 1 represents an asset divisible into tenths, and so on.
   * This value must be between 0 and 19 (inclusive).
   */
  public decimals: number;

  /**
   * DefaultFrozen specifies whether slots for this asset in user accounts are frozen by default or not.
   */
  public defaultFrozen: boolean;

  /**
   * UnitName specifies a hint for the name of a unit of this asset.
   */
  public unitName?: Uint8Array;

  /**
   * AssetName specifies a hint for the name of the asset.
   */
  public assetName?: Uint8Array;

  /**
   * URL specifies a URL where more information about the asset can be retrieved.
   */
  public url?: Uint8Array;

  /**
   * MetadataHash specifies a commitment to some unspecified asset metadata. The format of this
   * metadata is up to the application.
   */
  public metadataHash?: Uint8Array;

  /**
   * Manager specifies an account that is allowed to change the non-zero addresses in this AssetParams.
   */
  public manager?: Address;

  /**
   * Reserve specifies an account whose holdings of this asset should be reported as "not minted".
   */
  public reserve?: Address;

  /**
   * Freeze specifies an account that is allowed to change the frozen state of holdings of this asset.
   */
  public freeze?: Address;

  /**
   * Clawback specifies an account that is allowed to take units of this asset from any account.
   */
  public clawback?: Address;

  public constructor(params: {
    total: bigint;
    decimals: number;
    defaultFrozen: boolean;
    unitName?: Uint8Array;
    assetName?: Uint8Array;
    url?: Uint8Array;
    metadataHash?: Uint8Array;
    manager?: Address;
    reserve?: Address;
    freeze?: Address;
    clawback?: Address;
  }) {
    this.total = params.total;
    this.decimals = params.decimals;
    this.defaultFrozen = params.defaultFrozen;
    this.unitName = params.unitName;
    this.assetName = params.assetName;
    this.url = params.url;
    this.metadataHash = params.metadataHash;
    this.manager = params.manager;
    this.reserve = params.reserve;
    this.freeze = params.freeze;
    this.clawback = params.clawback;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AssetParams.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['t', this.total],
      ['dc', this.decimals],
      ['df', this.defaultFrozen],
      ['un', this.unitName],
      ['an', this.assetName],
      ['au', this.url],
      ['am', this.metadataHash],
      ['m', this.manager],
      ['r', this.reserve],
      ['f', this.freeze],
      ['c', this.clawback],
    ]);
  }

  public static fromEncodingData(data: unknown): AssetParams {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetParams: ${data}`);
    }
    return new AssetParams({
      total: data.get('t'),
      decimals: data.get('dc'),
      defaultFrozen: data.get('df'),
      unitName: data.get('un'),
      assetName: data.get('an'),
      url: data.get('au'),
      metadataHash: data.get('am'),
      manager: data.get('m'),
      reserve: data.get('r'),
      freeze: data.get('f'),
      clawback: data.get('c'),
    });
  }
}

/**
 * AssetParamsDelta tracks a changed AssetParams, and whether it was deleted
 */
export class AssetParamsDelta implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'Params', // params
        valueSchema: new OptionalSchema(AssetParams.encodingSchema),
      },
      { key: 'Deleted', valueSchema: new BooleanSchema() }, // deleted
    ])
  );

  public params?: AssetParams;
  public deleted: boolean;

  constructor(params: { params?: AssetParams; deleted: boolean }) {
    this.params = params.params;
    this.deleted = params.deleted;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AssetParamsDelta.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Params', this.params ? this.params.toEncodingData() : undefined],
      ['Deleted', this.deleted],
    ]);
  }

  public static fromEncodingData(data: unknown): AssetParamsDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetParamsDelta: ${data}`);
    }
    return new AssetParamsDelta({
      params: data.get('Params')
        ? AssetParams.fromEncodingData(data.get('Params'))
        : undefined,
      deleted: data.get('Deleted'),
    });
  }
}

/**
 * AssetResourceRecord represents AssetParams and AssetHolding in deltas
 */
export class AssetResourceRecord implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'Aidx', valueSchema: new Uint64Schema() }, // id
      { key: 'Addr', valueSchema: new AddressSchema() }, // address
      {
        key: 'Params', // params
        valueSchema: AssetParamsDelta.encodingSchema,
      },
      {
        key: 'Holding', // holding
        valueSchema: AssetHoldingDelta.encodingSchema,
      },
    ])
  );

  public id: bigint;
  public address: Address;
  public params: AssetParamsDelta;
  public holding: AssetHoldingDelta;

  constructor(params: {
    id: bigint;
    address: Address;
    params: AssetParamsDelta;
    holding: AssetHoldingDelta;
  }) {
    this.id = params.id;
    this.address = params.address;
    this.params = params.params;
    this.holding = params.holding;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AssetResourceRecord.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Aidx', this.id],
      ['Addr', this.address],
      ['Params', this.params.toEncodingData()],
      ['Holding', this.holding.toEncodingData()],
    ]);
  }

  public static fromEncodingData(data: unknown): AssetResourceRecord {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AssetResourceRecord: ${data}`);
    }
    return new AssetResourceRecord({
      id: data.get('Aidx'),
      address: data.get('Addr'),
      params: AssetParamsDelta.fromEncodingData(data.get('Params')),
      holding: AssetHoldingDelta.fromEncodingData(data.get('Holding')),
    });
  }
}

/**
 * VotingData holds participation information
 */
export class VotingData implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'VoteID', // voteID
        valueSchema: new FixedLengthByteArraySchema(32),
      },
      {
        key: 'SelectionID', // selectionID
        valueSchema: new FixedLengthByteArraySchema(32),
      },
      {
        key: 'StateProofID', // stateProofID
        valueSchema: new FixedLengthByteArraySchema(64),
      },
      {
        key: 'VoteFirstValid', // voteFirstValid
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'VoteLastValid', // voteLastValid
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'VoteKeyDilution', // voteKeyDilution
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  public voteID: Uint8Array;
  public selectionID: Uint8Array;
  public stateProofID: Uint8Array;

  public voteFirstValid: bigint;
  public voteLastValid: bigint;
  public voteKeyDilution: bigint;

  constructor(params: {
    voteID: Uint8Array;
    selectionID: Uint8Array;
    stateProofID: Uint8Array;
    voteFirstValid: bigint;
    voteLastValid: bigint;
    voteKeyDilution: bigint;
  }) {
    this.voteID = params.voteID;
    this.selectionID = params.selectionID;
    this.stateProofID = params.stateProofID;
    this.voteFirstValid = params.voteFirstValid;
    this.voteLastValid = params.voteLastValid;
    this.voteKeyDilution = params.voteKeyDilution;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return VotingData.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['VoteID', this.voteID],
      ['SelectionID', this.selectionID],
      ['StateProofID', this.stateProofID],
      ['VoteFirstValid', this.voteFirstValid],
      ['VoteLastValid', this.voteLastValid],
      ['VoteKeyDilution', this.voteKeyDilution],
    ]);
  }

  public static fromEncodingData(data: unknown): VotingData {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded VotingData: ${data}`);
    }
    return new VotingData({
      voteID: data.get('VoteID'),
      selectionID: data.get('SelectionID'),
      stateProofID: data.get('StateProofID'),
      voteFirstValid: data.get('VoteFirstValid'),
      voteLastValid: data.get('VoteLastValid'),
      voteKeyDilution: data.get('VoteKeyDilution'),
    });
  }
}

/**
 * AccountBaseData contains base account info like balance, status and total number of resources
 */
export class AccountBaseData implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'Status', valueSchema: new Uint64Schema() }, // status
      { key: 'MicroAlgos', valueSchema: new Uint64Schema() }, // microAlgos
      { key: 'RewardsBase', valueSchema: new Uint64Schema() }, // rewardsBase
      {
        key: 'RewardedMicroAlgos', // rewardedMicroAlgos
        valueSchema: new Uint64Schema(),
      },
      { key: 'AuthAddr', valueSchema: new AddressSchema() }, // authAddr
      {
        key: 'IncentiveEligible', // incentiveEligible
        valueSchema: new BooleanSchema(),
      },
      {
        key: 'TotalAppSchema', // totalAppSchema
        valueSchema: StateSchema.encodingSchema,
      },
      {
        key: 'TotalExtraAppPages', // totalExtraAppPages
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'TotalAppParams', // totalAppParams
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'TotalAppLocalStates', // totalAppLocalStates
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'TotalAssetParams', // totalAssetParams
        valueSchema: new Uint64Schema(),
      },
      { key: 'TotalAssets', valueSchema: new Uint64Schema() }, // totalAssets
      { key: 'TotalBoxes', valueSchema: new Uint64Schema() }, // totalBoxes
      {
        key: 'TotalBoxBytes', // totalBoxBytes
        valueSchema: new Uint64Schema(),
      },
      { key: 'LastProposed', valueSchema: new Uint64Schema() }, // lastProposed
      {
        key: 'LastHeartbeat', // lastHeartbeat
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  /**
   * Account status. Values are:
   * * 0: Offline
   * * 1: Online
   * * 2: NotParticipating
   */
  public status: number;
  public microAlgos: bigint;
  public rewardsBase: bigint;
  public rewardedMicroAlgos: bigint;
  public authAddr: Address;
  public incentiveEligible: boolean;

  /**
   * Totals across created globals, and opted in locals.
   */
  public totalAppSchema: StateSchema;
  /**
   * Total number of extra pages across all created apps
   */
  public totalExtraAppPages: number;
  /**
   * Total number of apps this account has created
   */
  public totalAppParams: bigint;
  /**
   * Total number of apps this account is opted into.
   */
  public totalAppLocalStates: bigint;
  /**
   * Total number of assets created by this account
   */
  public totalAssetParams: bigint;
  /**
   * Total of asset creations and optins (i.e. number of holdings)
   */
  public totalAssets: bigint;
  /**
   * Total number of boxes associated to this account
   */
  public totalBoxes: bigint;
  /**
   * Total bytes for this account's boxes. keys _and_ values count
   */
  public totalBoxBytes: bigint;

  /**
   * The last round that this account proposed the winning block.
   */
  public lastProposed: bigint;
  /**
   * The last round that this account sent a heartbeat to show it was online.
   */
  public lastHeartbeat: bigint;

  public constructor(params: {
    status: number;
    microAlgos: bigint;
    rewardsBase: bigint;
    rewardedMicroAlgos: bigint;
    authAddr: Address;
    incentiveEligible: boolean;
    totalAppSchema: StateSchema;
    totalExtraAppPages: number;
    totalAppParams: bigint;
    totalAppLocalStates: bigint;
    totalAssetParams: bigint;
    totalAssets: bigint;
    totalBoxes: bigint;
    totalBoxBytes: bigint;
    lastProposed: bigint;
    lastHeartbeat: bigint;
  }) {
    this.status = params.status;
    this.microAlgos = params.microAlgos;
    this.rewardsBase = params.rewardsBase;
    this.rewardedMicroAlgos = params.rewardedMicroAlgos;
    this.authAddr = params.authAddr;
    this.incentiveEligible = params.incentiveEligible;
    this.totalAppSchema = params.totalAppSchema;
    this.totalExtraAppPages = params.totalExtraAppPages;
    this.totalAppParams = params.totalAppParams;
    this.totalAppLocalStates = params.totalAppLocalStates;
    this.totalAssetParams = params.totalAssetParams;
    this.totalAssets = params.totalAssets;
    this.totalBoxes = params.totalBoxes;
    this.totalBoxBytes = params.totalBoxBytes;
    this.lastProposed = params.lastProposed;
    this.lastHeartbeat = params.lastHeartbeat;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AccountBaseData.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Status', this.status],
      ['MicroAlgos', this.microAlgos],
      ['RewardsBase', this.rewardsBase],
      ['RewardedMicroAlgos', this.rewardedMicroAlgos],
      ['AuthAddr', this.authAddr],
      ['IncentiveEligible', this.incentiveEligible],
      ['TotalAppSchema', this.totalAppSchema.toEncodingData()],
      ['TotalExtraAppPages', this.totalExtraAppPages],
      ['TotalAppParams', this.totalAppParams],
      ['TotalAppLocalStates', this.totalAppLocalStates],
      ['TotalAssetParams', this.totalAssetParams],
      ['TotalAssets', this.totalAssets],
      ['TotalBoxes', this.totalBoxes],
      ['TotalBoxBytes', this.totalBoxBytes],
      ['LastProposed', this.lastProposed],
      ['LastHeartbeat', this.lastHeartbeat],
    ]);
  }

  public static fromEncodingData(data: unknown): AccountBaseData {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AccountBaseData: ${data}`);
    }
    return new AccountBaseData({
      status: Number(data.get('Status')),
      microAlgos: data.get('MicroAlgos'),
      rewardsBase: data.get('RewardsBase'),
      rewardedMicroAlgos: data.get('RewardedMicroAlgos'),
      authAddr: data.get('AuthAddr'),
      incentiveEligible: data.get('IncentiveEligible'),
      totalAppSchema: StateSchema.fromEncodingData(data.get('TotalAppSchema')),
      totalExtraAppPages: Number(data.get('TotalExtraAppPages')),
      totalAppParams: data.get('TotalAppParams'),
      totalAppLocalStates: data.get('TotalAppLocalStates'),
      totalAssetParams: data.get('TotalAssetParams'),
      totalAssets: data.get('TotalAssets'),
      totalBoxes: data.get('TotalBoxes'),
      totalBoxBytes: data.get('TotalBoxBytes'),
      lastProposed: data.get('LastProposed'),
      lastHeartbeat: data.get('LastHeartbeat'),
    });
  }
}

/**
 * AccountData provides per-account data
 */
export class AccountData implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: '',
        valueSchema: AccountBaseData.encodingSchema,
        embedded: true,
      },
      {
        key: '',
        valueSchema: VotingData.encodingSchema,
        embedded: true,
      },
    ])
  );

  public accountBaseData: AccountBaseData;
  public votingData: VotingData;

  constructor(params: {
    accountBaseData: AccountBaseData;
    votingData: VotingData;
  }) {
    this.accountBaseData = params.accountBaseData;
    this.votingData = params.votingData;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AccountData.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return combineMaps(
      this.accountBaseData.toEncodingData(),
      this.votingData.toEncodingData()
    );
  }

  public static fromEncodingData(data: unknown): AccountData {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AccountData: ${data}`);
    }
    return new AccountData({
      accountBaseData: AccountBaseData.fromEncodingData(data),
      votingData: VotingData.fromEncodingData(data),
    });
  }
}

export class BalanceRecord implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'Addr',
        valueSchema: new AddressSchema(),
      },
      {
        key: '',
        valueSchema: AccountData.encodingSchema,
        embedded: true,
      },
    ])
  );

  public addr: Address;
  public accountData: AccountData;

  constructor(params: { addr: Address; accountData: AccountData }) {
    this.addr = params.addr;
    this.accountData = params.accountData;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return BalanceRecord.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return combineMaps(
      new Map<string, unknown>([['Addr', this.addr]]),
      this.accountData.toEncodingData()
    );
  }

  public static fromEncodingData(data: unknown): BalanceRecord {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BalanceRecord: ${data}`);
    }
    return new BalanceRecord({
      addr: data.get('Addr'),
      accountData: AccountData.fromEncodingData(data),
    });
  }
}

export class AccountDeltas implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'Accts', // accounts
        valueSchema: new ArraySchema(BalanceRecord.encodingSchema),
      },
      {
        key: 'AppResources', // appResources
        valueSchema: new OptionalSchema(
          new ArraySchema(AppResourceRecord.encodingSchema)
        ),
      },
      {
        key: 'AssetResources', // assetResources
        valueSchema: new OptionalSchema(
          new ArraySchema(AssetResourceRecord.encodingSchema)
        ),
      },
    ])
  );

  public accounts: BalanceRecord[];
  public appResources: AppResourceRecord[];
  public assetResources: AssetResourceRecord[];

  constructor(params: {
    accounts: BalanceRecord[];
    appResources: AppResourceRecord[];
    assetResources: AssetResourceRecord[];
  }) {
    this.accounts = params.accounts;
    this.appResources = params.appResources;
    this.assetResources = params.assetResources;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AccountDeltas.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Accts', this.accounts.map((account) => account.toEncodingData())],
      [
        'AppResources',
        this.appResources.length === 0
          ? undefined
          : this.appResources.map((appResource) =>
              appResource.toEncodingData()
            ),
      ],
      [
        'AssetResources',
        this.assetResources.length === 0
          ? undefined
          : this.assetResources.map((assetResource) =>
              assetResource.toEncodingData()
            ),
      ],
    ]);
  }

  public static fromEncodingData(data: unknown): AccountDeltas {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AccountDeltas: ${data}`);
    }
    return new AccountDeltas({
      accounts: (data.get('Accts') ?? []).map(BalanceRecord.fromEncodingData),
      appResources: (data.get('AppResources') ?? []).map(
        AppResourceRecord.fromEncodingData
      ),
      assetResources: (data.get('AssetResources') ?? []).map(
        AssetResourceRecord.fromEncodingData
      ),
    });
  }
}

/**
 * A KvValueDelta shows how the Data associated with a key in the kvstore has changed.
 */
export class KvValueDelta implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'Data',
        valueSchema: new OptionalSchema(new ByteArraySchema()),
      },
      {
        key: 'OldData',
        valueSchema: new OptionalSchema(new ByteArraySchema()),
      },
    ])
  );

  /**
   * Data stores the most recent value (undefined means deleted)
   */
  public data?: Uint8Array;

  /**
   * OldData stores the previous value (undefined means didn't exist)
   */
  public oldData?: Uint8Array;

  constructor(params: { data?: Uint8Array; oldData?: Uint8Array }) {
    this.data = params.data;
    this.oldData = params.oldData;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return KvValueDelta.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Data', this.data],
      ['OldData', this.oldData],
    ]);
  }

  public static fromEncodingData(data: unknown): KvValueDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded KvValueDelta: ${data}`);
    }
    return new KvValueDelta({
      data: data.get('Data'),
      oldData: data.get('OldData'),
    });
  }
}

/**
 * IncludedTransactions defines the transactions included in a block, their index and last valid round.
 */
export class IncludedTransactions implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'LastValid',
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'Intra',
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  public lastValid: bigint;
  /**
   * The index of the transaction in the block
   */
  public intra: number;

  constructor(params: { lastValid: bigint; intra: number }) {
    this.lastValid = params.lastValid;
    this.intra = params.intra;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return IncludedTransactions.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['LastValid', this.lastValid],
      ['Intra', this.intra],
    ]);
  }

  public static fromEncodingData(data: unknown): IncludedTransactions {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded IncludedTransactions: ${data}`);
    }
    return new IncludedTransactions({
      lastValid: data.get('LastValid'),
      intra: Number(data.get('Intra')),
    });
  }
}

/**
 * ModifiedCreatable represents a change to a single creatable state
 */
export class ModifiedCreatable implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'Ctype', // creatableType
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'Created', // created
        valueSchema: new BooleanSchema(),
      },
      {
        key: 'Creator', // creator
        valueSchema: new AddressSchema(),
      },
      {
        key: 'Ndeltas', // ndeltas
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  /**
   * Type of the creatable. The values are:
   * * 0: Asset
   * * 1: Application
   */
  public creatableType: number;

  /**
   * Created if true, deleted if false
   */
  public created: boolean;

  /**
   * creator of the app/asset
   */
  public creator: Address;

  /**
   * Keeps track of how many times this app/asset appears in accountUpdates.creatableDeltas
   */
  public ndeltas: number;

  public constructor(params: {
    creatableType: number;
    created: boolean;
    creator: Address;
    ndeltas: number;
  }) {
    this.creatableType = params.creatableType;
    this.created = params.created;
    this.creator = params.creator;
    this.ndeltas = params.ndeltas;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return ModifiedCreatable.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Ctype', this.creatableType],
      ['Created', this.created],
      ['Creator', this.creator],
      ['Ndeltas', this.ndeltas],
    ]);
  }

  public static fromEncodingData(data: unknown): ModifiedCreatable {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ModifiedCreatable: ${data}`);
    }
    return new ModifiedCreatable({
      creatableType: Number(data.get('Ctype')),
      created: data.get('Created'),
      creator: data.get('Creator'),
      ndeltas: Number(data.get('Ndeltas')),
    });
  }
}

/**
 * AlgoCount represents a total of algos of a certain class of accounts (split up by their Status value).
 */
export class AlgoCount implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'mon', valueSchema: new Uint64Schema() }, // money
      { key: 'rwd', valueSchema: new Uint64Schema() }, // rewardUnits
    ])
  );

  /**
   * Sum of algos of all accounts in this class.
   */
  public money: bigint;

  /**
   * Total number of whole reward units in accounts.
   */
  public rewardUnits: bigint;

  constructor(params: { money: bigint; rewardUnits: bigint }) {
    this.money = params.money;
    this.rewardUnits = params.rewardUnits;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AlgoCount.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['mon', this.money],
      ['rwd', this.rewardUnits],
    ]);
  }

  public static fromEncodingData(data: unknown): AlgoCount {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AlgoCount: ${data}`);
    }
    return new AlgoCount({
      money: data.get('mon'),
      rewardUnits: data.get('rwd'),
    });
  }
}

/**
 * AccountTotals represents the totals of algos in the system grouped by different account status values.
 */
export class AccountTotals implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'online', valueSchema: AlgoCount.encodingSchema }, // online
      { key: 'offline', valueSchema: AlgoCount.encodingSchema }, // offline
      { key: 'notpart', valueSchema: AlgoCount.encodingSchema }, // notParticipating
      { key: 'rwdlvl', valueSchema: new Uint64Schema() }, // rewardsLevel
    ])
  );

  public online: AlgoCount;
  public offline: AlgoCount;
  public notParticipating: AlgoCount;

  /**
   * Total number of algos received per reward unit since genesis
   */
  public rewardsLevel: bigint;

  constructor(params: {
    online: AlgoCount;
    offline: AlgoCount;
    notParticipating: AlgoCount;
    rewardsLevel: bigint;
  }) {
    this.online = params.online;
    this.offline = params.offline;
    this.notParticipating = params.notParticipating;
    this.rewardsLevel = params.rewardsLevel;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return AccountTotals.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['online', this.online.toEncodingData()],
      ['offline', this.offline.toEncodingData()],
      ['notpart', this.notParticipating.toEncodingData()],
      ['rwdlvl', this.rewardsLevel],
    ]);
  }

  public static fromEncodingData(data: unknown): AccountTotals {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded AccountTotals: ${data}`);
    }
    return new AccountTotals({
      online: AlgoCount.fromEncodingData(data.get('online')),
      offline: AlgoCount.fromEncodingData(data.get('offline')),
      notParticipating: AlgoCount.fromEncodingData(data.get('notpart')),
      rewardsLevel: data.get('rwdlvl'),
    });
  }
}

/**
 * LedgerStateDelta describes the delta between a given round to the previous round
 */
export class LedgerStateDelta implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'Accts', // accounts
        valueSchema: AccountDeltas.encodingSchema,
      },
      {
        key: 'KvMods', // kvMods
        valueSchema: new OptionalSchema(
          new SpecialCaseBinaryStringMapSchema(KvValueDelta.encodingSchema)
        ),
      },
      {
        key: 'Txids', // txids
        valueSchema: new ByteArrayMapSchema(
          IncludedTransactions.encodingSchema
        ),
      },
      {
        key: 'Txleases', // txleases
        // Note: because txleases is currently just an UntypedSchema and we are expected to decode
        // null values for this field, we use OptionalSchema to coerce null values to undefined so
        // that the values can be properly omitted during encoding.
        valueSchema: new OptionalSchema(new UntypedSchema()),
      },
      {
        key: 'Creatables', // creatables
        valueSchema: new OptionalSchema(
          new Uint64MapSchema(ModifiedCreatable.encodingSchema)
        ),
      },
      {
        key: 'Hdr', // blockHeader
        valueSchema: BlockHeader.encodingSchema,
      },
      {
        key: 'StateProofNext', // stateProofNext
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'PrevTimestamp', // prevTimestamp
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'Totals', // totals
        valueSchema: AccountTotals.encodingSchema,
      },
    ])
  );

  /**
   * modified new accounts
   */
  public accounts: AccountDeltas;

  /**
   * modified kv pairs (nil == delete)
   */
  public kvMods: Map<Uint8Array, KvValueDelta>;

  /**
   * new Txids for the txtail and TxnCounter, mapped to txn.LastValid
   */
  public txids: Map<Uint8Array, IncludedTransactions>;

  // TODO: properly support txleases once we are able to decode msgpack maps with object keys.
  /**
   *  new txleases for the txtail mapped to expiration
   */
  public txleases: UntypedValue;

  /**
   * new creatables creator lookup table
   */
  public creatables: Map<bigint, ModifiedCreatable>;

  /**
   * new block header
   */
  public blockHeader: BlockHeader;

  /**
   * StateProofNext represents modification on StateProofNextRound field in the block header. If the block contains
   * a valid state proof transaction, this field will contain the next round for state proof.
   * otherwise it will be set to 0.
   */
  public stateProofNext: bigint;

  /**
   * previous block timestamp
   */
  public prevTimestamp: bigint;

  /**
   * The account totals reflecting the changes in this StateDelta object.
   */
  public totals: AccountTotals;

  public constructor(params: {
    accounts: AccountDeltas;
    kvMods: Map<Uint8Array, KvValueDelta>;
    txids: Map<Uint8Array, IncludedTransactions>;
    txleases: UntypedValue;
    creatables: Map<bigint, ModifiedCreatable>;
    blockHeader: BlockHeader;
    stateProofNext: bigint;
    prevTimestamp: bigint;
    totals: AccountTotals;
  }) {
    this.accounts = params.accounts;
    this.kvMods = params.kvMods;
    this.txids = params.txids;
    this.txleases = params.txleases;
    this.creatables = params.creatables;
    this.blockHeader = params.blockHeader;
    this.stateProofNext = params.stateProofNext;
    this.prevTimestamp = params.prevTimestamp;
    this.totals = params.totals;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return LedgerStateDelta.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['Accts', this.accounts.toEncodingData()],
      [
        'KvMods',
        this.kvMods.size === 0
          ? undefined
          : convertMap(this.kvMods, (key, value) => [
              key,
              value.toEncodingData(),
            ]),
      ],
      [
        'Txids',
        convertMap(this.txids, (key, value) => [key, value.toEncodingData()]),
      ],
      ['Txleases', this.txleases.toEncodingData()],
      [
        'Creatables',
        this.creatables.size === 0
          ? undefined
          : convertMap(this.creatables, (key, value) => [
              key,
              value.toEncodingData(),
            ]),
      ],
      ['Hdr', this.blockHeader.toEncodingData()],
      ['StateProofNext', this.stateProofNext],
      ['PrevTimestamp', this.prevTimestamp],
      ['Totals', this.totals.toEncodingData()],
    ]);
  }

  public static fromEncodingData(data: unknown): LedgerStateDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded LedgerStateDelta: ${data}`);
    }
    return new LedgerStateDelta({
      accounts: AccountDeltas.fromEncodingData(data.get('Accts')),
      kvMods: convertMap(
        (data.get('KvMods') ?? new Map()) as Map<Uint8Array, unknown>,
        (key, value) => [key, KvValueDelta.fromEncodingData(value)]
      ),
      txids: convertMap(
        data.get('Txids') as Map<Uint8Array, unknown>,
        (key, value) => [key, IncludedTransactions.fromEncodingData(value)]
      ),
      txleases: UntypedValue.fromEncodingData(data.get('Txleases')),
      creatables: convertMap(
        (data.get('Creatables') ?? new Map()) as Map<bigint, unknown>,
        (key, value) => [key, ModifiedCreatable.fromEncodingData(value)]
      ),
      blockHeader: BlockHeader.fromEncodingData(data.get('Hdr')),
      stateProofNext: data.get('StateProofNext'),
      prevTimestamp: data.get('PrevTimestamp'),
      totals: AccountTotals.fromEncodingData(data.get('Totals')),
    });
  }
}
