/**
 * NOTICE: This file was generated. Editing this file manually is not recommended.
 */

/* eslint-disable no-use-before-define */
import BaseModel from './base';
import { EncodedSignedTransaction } from '../../../../types/transactions/encoded';
import BlockHeader from '../../../../types/blockHeader';

/**
 * Transaction ID of the submission.
 */
export class PostTransactionsResponse extends BaseModel {
  /**
   * Creates a new `PostTransactionsResponse` object.
   * @param txid encoding of the transaction hash.
   */
  constructor(public txid: string) {
    super();
    this.txid = txid;

    this.attribute_map = {
      txid: 'txId',
    };
  }
}

/**
 * Application state delta.
 */
export class AccountStateDelta extends BaseModel {
  /**
   * Creates a new `AccountStateDelta` object.
   * @param address
   * @param delta Application state delta.
   */
  constructor(public address: string, public delta: EvalDeltaKeyValue[]) {
    super();
    this.address = address;
    this.delta = delta;

    this.attribute_map = {
      address: 'address',
      delta: 'delta',
    };
  }
}

/**
 * Stores the TEAL eval step data
 */
export class DryrunState extends BaseModel {
  public line: number;
  public pc: number;
  public stack: TealValue[];
  public error?: string;
  public scratch?: TealValue[];

  /**
   * Creates a new `DryrunState` object.
   * @param line Line number
   * @param pc Program counter
   * @param stack
   * @param error Evaluation error if any
   * @param scratch
   */
  constructor({
    line,
    pc,
    stack,
    error,
    scratch,
  }: {
    line: number;
    pc: number;
    stack: TealValue[];
    error?: string;
    scratch?: TealValue[];
  }) {
    super();
    this.line = line;
    this.pc = pc;
    this.stack = stack;
    this.error = error;
    this.scratch = scratch;

    this.attribute_map = {
      line: 'line',
      pc: 'pc',
      stack: 'stack',
      error: 'error',
      scratch: 'scratch',
    };
  }
}

/**
 * Proof of transaction in a block.
 */
export class ProofResponse extends BaseModel {
  /**
   * Creates a new `ProofResponse` object.
   * @param idx Index of the transaction in the block's payset.
   * @param proof Merkle proof of transaction membership.
   * @param stibhash Hash of SignedTxnInBlock for verifying proof.
   */
  constructor(
    public idx: number,
    public proof: string,
    public stibhash: string
  ) {
    super();
    this.idx = idx;
    this.proof = proof;
    this.stibhash = stibhash;

    this.attribute_map = {
      idx: 'idx',
      proof: 'proof',
      stibhash: 'stibhash',
    };
  }
}

/**
 * algod version information.
 */
export class Version extends BaseModel {
  /**
   * Creates a new `Version` object.
   * @param build
   * @param genesisHashB64
   * @param genesisId
   * @param versions
   */
  constructor(
    public build: BuildVersion,
    public genesisHashB64: string,
    public genesisId: string,
    public versions: string[]
  ) {
    super();
    this.build = build;
    this.genesisHashB64 = genesisHashB64;
    this.genesisId = genesisId;
    this.versions = versions;

    this.attribute_map = {
      build: 'build',
      genesisHashB64: 'genesis_hash_b64',
      genesisId: 'genesis_id',
      versions: 'versions',
    };
  }
}

/**
 * AccountParticipation describes the parameters used by this account in consensus protocol.
 */
export class AccountParticipation extends BaseModel {
  public selectionParticipationKey: string;
  public voteFirstValid: number;
  public voteKeyDilution: number;
  public voteLastValid: number;
  public voteParticipationKey: string;

  /**
   * Creates a new `AccountParticipation` object.
   * @param selectionParticipationKey \[sel\] Selection public key (if any) currently registered for this round.
   * @param voteFirstValid \[voteFst\] First round for which this participation is valid.
   * @param voteKeyDilution \[voteKD\] Number of subkeys in each batch of participation keys.
   * @param voteLastValid \[voteLst\] Last round for which this participation is valid.
   * @param voteParticipationKey \[vote\] root participation public key (if any) currently registered for this round.
   */
  constructor({
    selectionParticipationKey,
    voteFirstValid,
    voteKeyDilution,
    voteLastValid,
    voteParticipationKey,
  }: {
    selectionParticipationKey: string;
    voteFirstValid: number;
    voteKeyDilution: number;
    voteLastValid: number;
    voteParticipationKey: string;
  }) {
    super();
    this.selectionParticipationKey = selectionParticipationKey;
    this.voteFirstValid = voteFirstValid;
    this.voteKeyDilution = voteKeyDilution;
    this.voteLastValid = voteLastValid;
    this.voteParticipationKey = voteParticipationKey;

    this.attribute_map = {
      selectionParticipationKey: 'selection-participation-key',
      voteFirstValid: 'vote-first-valid',
      voteKeyDilution: 'vote-key-dilution',
      voteLastValid: 'vote-last-valid',
      voteParticipationKey: 'vote-participation-key',
    };
  }
}

/**
 *
 */
export class NodeStatusResponse extends BaseModel {
  public catchupTime: number;
  public lastRound: number;
  public lastVersion: string;
  public nextVersion: string;
  public nextVersionRound: number;
  public nextVersionSupported: boolean;
  public stoppedAtUnsupportedRound: boolean;
  public timeSinceLastRound: number;
  public catchpoint?: string;
  public catchpointAcquiredBlocks?: number;
  public catchpointProcessedAccounts?: number;
  public catchpointTotalAccounts?: number;
  public catchpointTotalBlocks?: number;
  public catchpointVerifiedAccounts?: number;
  public lastCatchpoint?: string;

  /**
   * Creates a new `NodeStatusResponse` object.
   * @param catchupTime CatchupTime in nanoseconds
   * @param lastRound LastRound indicates the last round seen
   * @param lastVersion LastVersion indicates the last consensus version supported
   * @param nextVersion NextVersion of consensus protocol to use
   * @param nextVersionRound NextVersionRound is the round at which the next consensus version will apply
   * @param nextVersionSupported NextVersionSupported indicates whether the next consensus version is supported by this node
   * @param stoppedAtUnsupportedRound StoppedAtUnsupportedRound indicates that the node does not support the new rounds and has stopped making progress
   * @param timeSinceLastRound TimeSinceLastRound in nanoseconds
   * @param catchpoint The current catchpoint that is being caught up to
   * @param catchpointAcquiredBlocks The number of blocks that have already been obtained by the node as part of the catchup
   * @param catchpointProcessedAccounts The number of accounts from the current catchpoint that have been processed so far as part of the catchup
   * @param catchpointTotalAccounts The total number of accounts included in the current catchpoint
   * @param catchpointTotalBlocks The total number of blocks that are required to complete the current catchpoint catchup
   * @param catchpointVerifiedAccounts The number of accounts from the current catchpoint that have been verified so far as part of the catchup
   * @param lastCatchpoint The last catchpoint seen by the node
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
    catchpointTotalAccounts,
    catchpointTotalBlocks,
    catchpointVerifiedAccounts,
    lastCatchpoint,
  }: {
    catchupTime: number;
    lastRound: number;
    lastVersion: string;
    nextVersion: string;
    nextVersionRound: number;
    nextVersionSupported: boolean;
    stoppedAtUnsupportedRound: boolean;
    timeSinceLastRound: number;
    catchpoint?: string;
    catchpointAcquiredBlocks?: number;
    catchpointProcessedAccounts?: number;
    catchpointTotalAccounts?: number;
    catchpointTotalBlocks?: number;
    catchpointVerifiedAccounts?: number;
    lastCatchpoint?: string;
  }) {
    super();
    this.catchupTime = catchupTime;
    this.lastRound = lastRound;
    this.lastVersion = lastVersion;
    this.nextVersion = nextVersion;
    this.nextVersionRound = nextVersionRound;
    this.nextVersionSupported = nextVersionSupported;
    this.stoppedAtUnsupportedRound = stoppedAtUnsupportedRound;
    this.timeSinceLastRound = timeSinceLastRound;
    this.catchpoint = catchpoint;
    this.catchpointAcquiredBlocks = catchpointAcquiredBlocks;
    this.catchpointProcessedAccounts = catchpointProcessedAccounts;
    this.catchpointTotalAccounts = catchpointTotalAccounts;
    this.catchpointTotalBlocks = catchpointTotalBlocks;
    this.catchpointVerifiedAccounts = catchpointVerifiedAccounts;
    this.lastCatchpoint = lastCatchpoint;

    this.attribute_map = {
      catchupTime: 'catchup-time',
      lastRound: 'last-round',
      lastVersion: 'last-version',
      nextVersion: 'next-version',
      nextVersionRound: 'next-version-round',
      nextVersionSupported: 'next-version-supported',
      stoppedAtUnsupportedRound: 'stopped-at-unsupported-round',
      timeSinceLastRound: 'time-since-last-round',
      catchpoint: 'catchpoint',
      catchpointAcquiredBlocks: 'catchpoint-acquired-blocks',
      catchpointProcessedAccounts: 'catchpoint-processed-accounts',
      catchpointTotalAccounts: 'catchpoint-total-accounts',
      catchpointTotalBlocks: 'catchpoint-total-blocks',
      catchpointVerifiedAccounts: 'catchpoint-verified-accounts',
      lastCatchpoint: 'last-catchpoint',
    };
  }
}

/**
 * Request data type for dryrun endpoint. Given the Transactions and simulated ledger state upload, run TEAL scripts and return debugging information.
 */
export class DryrunRequest extends BaseModel {
  public accounts: Account[];
  public apps: Application[];
  public latestTimestamp: number;
  public protocolVersion: string;
  public round: number;
  public sources: DryrunSource[];
  public txns: EncodedSignedTransaction[];

  /**
   * Creates a new `DryrunRequest` object.
   * @param accounts
   * @param apps
   * @param latestTimestamp LatestTimestamp is available to some TEAL scripts. Defaults to the latest confirmed timestamp this algod is attached to.
   * @param protocolVersion ProtocolVersion specifies a specific version string to operate under, otherwise whatever the current protocol of the network this algod is running in.
   * @param round Round is available to some TEAL scripts. Defaults to the current round on the network this algod is attached to.
   * @param sources
   * @param txns
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
    latestTimestamp: number;
    protocolVersion: string;
    round: number;
    sources: DryrunSource[];
    txns: EncodedSignedTransaction[];
  }) {
    super();
    this.accounts = accounts;
    this.apps = apps;
    this.latestTimestamp = latestTimestamp;
    this.protocolVersion = protocolVersion;
    this.round = round;
    this.sources = sources;
    this.txns = txns;

    this.attribute_map = {
      accounts: 'accounts',
      apps: 'apps',
      latestTimestamp: 'latest-timestamp',
      protocolVersion: 'protocol-version',
      round: 'round',
      sources: 'sources',
      txns: 'txns',
    };
  }
}

/**
 * DryrunResponse contains per-txn debug information from a dryrun.
 */
export class DryrunResponse extends BaseModel {
  /**
   * Creates a new `DryrunResponse` object.
   * @param error
   * @param protocolVersion Protocol version is the protocol version Dryrun was operated under.
   * @param txns
   */
  constructor(
    public error: string,
    public protocolVersion: string,
    public txns: DryrunTxnResult[]
  ) {
    super();
    this.error = error;
    this.protocolVersion = protocolVersion;
    this.txns = txns;

    this.attribute_map = {
      error: 'error',
      protocolVersion: 'protocol-version',
      txns: 'txns',
    };
  }
}

/**
 * An error response with optional data field.
 */
export class ErrorResponse extends BaseModel {
  /**
   * Creates a new `ErrorResponse` object.
   * @param message
   * @param data
   */
  constructor(public message: string, public data?: string) {
    super();
    this.message = message;
    this.data = data;

    this.attribute_map = {
      message: 'message',
      data: 'data',
    };
  }
}

export class BuildVersion extends BaseModel {
  public branch: string;
  public buildNumber: number;
  public channel: string;
  public commitHash: string;
  public major: number;
  public minor: number;

  /**
   * Creates a new `BuildVersion` object.
   * @param branch
   * @param buildNumber
   * @param channel
   * @param commitHash
   * @param major
   * @param minor
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
    buildNumber: number;
    channel: string;
    commitHash: string;
    major: number;
    minor: number;
  }) {
    super();
    this.branch = branch;
    this.buildNumber = buildNumber;
    this.channel = channel;
    this.commitHash = commitHash;
    this.major = major;
    this.minor = minor;

    this.attribute_map = {
      branch: 'branch',
      buildNumber: 'build_number',
      channel: 'channel',
      commitHash: 'commit_hash',
      major: 'major',
      minor: 'minor',
    };
  }
}

/**
 * Specifies both the unique identifier and the parameters for an asset
 */
export class Asset extends BaseModel {
  /**
   * Creates a new `Asset` object.
   * @param index unique asset identifier
   * @param params AssetParams specifies the parameters for an asset.
   *
   * \[apar\] when part of an AssetConfig transaction.
   *
   * Definition:
   * data/transactions/asset.go : AssetParams
   */
  constructor(public index: number, public params: AssetParams) {
    super();
    this.index = index;
    this.params = params;

    this.attribute_map = {
      index: 'index',
      params: 'params',
    };
  }
}

/**
 * Specifies maximums on the number of each type that may be stored.
 */
export class ApplicationStateSchema extends BaseModel {
  /**
   * Creates a new `ApplicationStateSchema` object.
   * @param numByteSlice \[nbs\] num of byte slices.
   * @param numUint \[nui\] num of uints.
   */
  constructor(public numByteSlice: number, public numUint: number) {
    super();
    this.numByteSlice = numByteSlice;
    this.numUint = numUint;

    this.attribute_map = {
      numByteSlice: 'num-byte-slice',
      numUint: 'num-uint',
    };
  }
}

/**
 * Represents a TEAL value delta.
 */
export class EvalDelta extends BaseModel {
  /**
   * Creates a new `EvalDelta` object.
   * @param action \[at\] delta action.
   * @param bytes \[bs\] bytes value.
   * @param uint \[ui\] uint value.
   */
  constructor(
    public action: number,
    public bytes?: string,
    public uint?: number
  ) {
    super();
    this.action = action;
    this.bytes = bytes;
    this.uint = uint;

    this.attribute_map = {
      action: 'action',
      bytes: 'bytes',
      uint: 'uint',
    };
  }
}

/**
 * Stores local state associated with an application.
 */
export class ApplicationLocalState extends BaseModel {
  /**
   * Creates a new `ApplicationLocalState` object.
   * @param id The application which this local state is for.
   * @param schema \[hsch\] schema.
   * @param keyValue \[tkv\] storage.
   */
  constructor(
    public id: number,
    public schema: ApplicationStateSchema,
    public keyValue?: TealKeyValue[]
  ) {
    super();
    this.id = id;
    this.schema = schema;
    this.keyValue = keyValue;

    this.attribute_map = {
      id: 'id',
      schema: 'schema',
      keyValue: 'key-value',
    };
  }
}

/**
 * DryrunSource is TEAL source text that gets uploaded, compiled, and inserted into transactions or application state.
 */
export class DryrunSource extends BaseModel {
  /**
   * Creates a new `DryrunSource` object.
   * @param appIndex
   * @param fieldName FieldName is what kind of sources this is. If lsig then it goes into the transactions[this.TxnIndex].LogicSig. If approv or clearp it goes into the Approval Program or Clear State Program of application[this.AppIndex].
   * @param source
   * @param txnIndex
   */
  constructor(
    public appIndex: number,
    public fieldName: string,
    public source: string,
    public txnIndex: number
  ) {
    super();
    this.appIndex = appIndex;
    this.fieldName = fieldName;
    this.source = source;
    this.txnIndex = txnIndex;

    this.attribute_map = {
      appIndex: 'app-index',
      fieldName: 'field-name',
      source: 'source',
      txnIndex: 'txn-index',
    };
  }
}

/**
 * Stores the global information associated with an application.
 */
export class ApplicationParams extends BaseModel {
  public approvalProgram: string;
  public clearStateProgram: string;
  public creator: string;
  public globalState?: TealKeyValue[];
  public globalStateSchema?: ApplicationStateSchema;
  public localStateSchema?: ApplicationStateSchema;

  /**
   * Creates a new `ApplicationParams` object.
   * @param approvalProgram \[approv\] approval program.
   * @param clearStateProgram \[clearp\] approval program.
   * @param creator The address that created this application. This is the address where the parameters and global state for this application can be found.
   * @param globalState [\gs\] global schema
   * @param globalStateSchema [\lsch\] global schema
   * @param localStateSchema [\lsch\] local schema
   */
  constructor({
    approvalProgram,
    clearStateProgram,
    creator,
    globalState,
    globalStateSchema,
    localStateSchema,
  }: {
    approvalProgram: string;
    clearStateProgram: string;
    creator: string;
    globalState?: TealKeyValue[];
    globalStateSchema?: ApplicationStateSchema;
    localStateSchema?: ApplicationStateSchema;
  }) {
    super();
    this.approvalProgram = approvalProgram;
    this.clearStateProgram = clearStateProgram;
    this.creator = creator;
    this.globalState = globalState;
    this.globalStateSchema = globalStateSchema;
    this.localStateSchema = localStateSchema;

    this.attribute_map = {
      approvalProgram: 'approval-program',
      clearStateProgram: 'clear-state-program',
      creator: 'creator',
      globalState: 'global-state',
      globalStateSchema: 'global-state-schema',
      localStateSchema: 'local-state-schema',
    };
  }
}

/**
 * Application index and its parameters
 */
export class Application extends BaseModel {
  /**
   * Creates a new `Application` object.
   * @param id \[appidx\] application index.
   * @param params \[appparams\] application parameters.
   */
  constructor(public id: number, public params: ApplicationParams) {
    super();
    this.id = id;
    this.params = params;

    this.attribute_map = {
      id: 'id',
      params: 'params',
    };
  }
}

/**
 * A potentially truncated list of transactions currently in the node's transaction pool. You can compute whether or not the list is truncated if the number of elements in the **top-transactions** array is fewer than **total-transactions**.
 */
export class PendingTransactionsResponse extends BaseModel {
  /**
   * Creates a new `PendingTransactionsResponse` object.
   * @param topTransactions An array of signed transaction objects.
   * @param totalTransactions Total number of transactions in the pool.
   */
  constructor(
    public topTransactions: EncodedSignedTransaction[],
    public totalTransactions: number
  ) {
    super();
    this.topTransactions = topTransactions;
    this.totalTransactions = totalTransactions;

    this.attribute_map = {
      topTransactions: 'top-transactions',
      totalTransactions: 'total-transactions',
    };
  }
}

/**
 * Key-value pairs for StateDelta.
 */
export class EvalDeltaKeyValue extends BaseModel {
  /**
   * Creates a new `EvalDeltaKeyValue` object.
   * @param key
   * @param value Represents a TEAL value delta.
   */
  constructor(public key: string, public value: EvalDelta) {
    super();
    this.key = key;
    this.value = value;

    this.attribute_map = {
      key: 'key',
      value: 'value',
    };
  }
}

/**
 *
 */
export class CatchpointStartResponse extends BaseModel {
  /**
   * Creates a new `CatchpointStartResponse` object.
   * @param catchupMessage Catchup start response string
   */
  constructor(public catchupMessage: string) {
    super();
    this.catchupMessage = catchupMessage;

    this.attribute_map = {
      catchupMessage: 'catchup-message',
    };
  }
}

/**
 * AssetParams specifies the parameters for an asset.
 *
 * \[apar\] when part of an AssetConfig transaction.
 *
 * Definition:
 * data/transactions/asset.go : AssetParams
 */
export class AssetParams extends BaseModel {
  public creator: string;
  public decimals: number;
  public total: number;
  public clawback?: string;
  public defaultFrozen?: boolean;
  public freeze?: string;
  public manager?: string;
  public metadataHash?: string;
  public name?: string;
  public reserve?: string;
  public unitName?: string;
  public url?: string;

  /**
   * Creates a new `AssetParams` object.
   * @param creator The address that created this asset. This is the address where the parameters for this asset can be found, and also the address where unwanted asset units can be sent in the worst case.
   * @param decimals \[dc\] The number of digits to use after the decimal point when displaying this asset. If 0, the asset is not divisible. If 1, the base unit of the asset is in tenths. If 2, the base unit of the asset is in hundredths, and so on. This value must be between 0 and 19 (inclusive).
   * @param total \[t\] The total number of units of this asset.
   * @param clawback \[c\] Address of account used to clawback holdings of this asset.  If empty, clawback is not permitted.
   * @param defaultFrozen \[df\] Whether holdings of this asset are frozen by default.
   * @param freeze \[f\] Address of account used to freeze holdings of this asset.  If empty, freezing is not permitted.
   * @param manager \[m\] Address of account used to manage the keys of this asset and to destroy it.
   * @param metadataHash \[am\] A commitment to some unspecified asset metadata. The format of this metadata is up to the application.
   * @param name \[an\] Name of this asset, as supplied by the creator.
   * @param reserve \[r\] Address of account holding reserve (non-minted) units of this asset.
   * @param unitName \[un\] Name of a unit of this asset, as supplied by the creator.
   * @param url \[au\] URL where more information about the asset can be retrieved.
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
    reserve,
    unitName,
    url,
  }: {
    creator: string;
    decimals: number;
    total: number;
    clawback?: string;
    defaultFrozen?: boolean;
    freeze?: string;
    manager?: string;
    metadataHash?: string;
    name?: string;
    reserve?: string;
    unitName?: string;
    url?: string;
  }) {
    super();
    this.creator = creator;
    this.decimals = decimals;
    this.total = total;
    this.clawback = clawback;
    this.defaultFrozen = defaultFrozen;
    this.freeze = freeze;
    this.manager = manager;
    this.metadataHash = metadataHash;
    this.name = name;
    this.reserve = reserve;
    this.unitName = unitName;
    this.url = url;

    this.attribute_map = {
      creator: 'creator',
      decimals: 'decimals',
      total: 'total',
      clawback: 'clawback',
      defaultFrozen: 'default-frozen',
      freeze: 'freeze',
      manager: 'manager',
      metadataHash: 'metadata-hash',
      name: 'name',
      reserve: 'reserve',
      unitName: 'unit-name',
      url: 'url',
    };
  }
}

/**
 * Encoded block object.
 */
export class BlockResponse extends BaseModel {
  /**
   * Creates a new `BlockResponse` object.
   * @param block Block header data.
   * @param cert Optional certificate object. This is only included when the format is set to message pack.
   */
  constructor(public block: BlockHeader, public cert?: Record<string, any>) {
    super();
    this.block = block;
    this.cert = cert;

    this.attribute_map = {
      block: 'block',
      cert: 'cert',
    };
  }
}

/**
 *
 */
export class CatchpointAbortResponse extends BaseModel {
  /**
   * Creates a new `CatchpointAbortResponse` object.
   * @param catchupMessage Catchup abort response string
   */
  constructor(public catchupMessage: string) {
    super();
    this.catchupMessage = catchupMessage;

    this.attribute_map = {
      catchupMessage: 'catchup-message',
    };
  }
}

/**
 * Describes an asset held by an account.
 *
 * Definition:
 * data/basics/userBalance.go : AssetHolding
 */
export class AssetHolding extends BaseModel {
  /**
   * Creates a new `AssetHolding` object.
   * @param amount \[a\] number of units held.
   * @param assetId Asset ID of the holding.
   * @param creator Address that created this asset. This is the address where the parameters for this asset can be found, and also the address where unwanted asset units can be sent in the worst case.
   * @param isFrozen \[f\] whether or not the holding is frozen.
   */
  constructor(
    public amount: number,
    public assetId: number,
    public creator: string,
    public isFrozen: boolean
  ) {
    super();
    this.amount = amount;
    this.assetId = assetId;
    this.creator = creator;
    this.isFrozen = isFrozen;

    this.attribute_map = {
      amount: 'amount',
      assetId: 'asset-id',
      creator: 'creator',
      isFrozen: 'is-frozen',
    };
  }
}

/**
 * Teal compile Result
 */
export class CompileResponse extends BaseModel {
  /**
   * Creates a new `CompileResponse` object.
   * @param hash base32 SHA512_256 of program bytes (Address style)
   * @param result base64 encoded program bytes
   */
  constructor(public hash: string, public result: string) {
    super();
    this.hash = hash;
    this.result = result;

    this.attribute_map = {
      hash: 'hash',
      result: 'result',
    };
  }
}

/**
 * DryrunTxnResult contains any LogicSig or ApplicationCall program debug information and state updates from a dryrun.
 */
export class DryrunTxnResult extends BaseModel {
  public disassembly: string[];
  public appCallMessages?: string[];
  public appCallTrace?: DryrunState[];
  public globalDelta?: EvalDeltaKeyValue[];
  public localDeltas?: AccountStateDelta[];
  public logicSigMessages?: string[];
  public logicSigTrace?: DryrunState[];

  /**
   * Creates a new `DryrunTxnResult` object.
   * @param disassembly Disassembled program line by line.
   * @param appCallMessages
   * @param appCallTrace
   * @param globalDelta Application state delta.
   * @param localDeltas
   * @param logicSigMessages
   * @param logicSigTrace
   */
  constructor({
    disassembly,
    appCallMessages,
    appCallTrace,
    globalDelta,
    localDeltas,
    logicSigMessages,
    logicSigTrace,
  }: {
    disassembly: string[];
    appCallMessages?: string[];
    appCallTrace?: DryrunState[];
    globalDelta?: EvalDeltaKeyValue[];
    localDeltas?: AccountStateDelta[];
    logicSigMessages?: string[];
    logicSigTrace?: DryrunState[];
  }) {
    super();
    this.disassembly = disassembly;
    this.appCallMessages = appCallMessages;
    this.appCallTrace = appCallTrace;
    this.globalDelta = globalDelta;
    this.localDeltas = localDeltas;
    this.logicSigMessages = logicSigMessages;
    this.logicSigTrace = logicSigTrace;

    this.attribute_map = {
      disassembly: 'disassembly',
      appCallMessages: 'app-call-messages',
      appCallTrace: 'app-call-trace',
      globalDelta: 'global-delta',
      localDeltas: 'local-deltas',
      logicSigMessages: 'logic-sig-messages',
      logicSigTrace: 'logic-sig-trace',
    };
  }
}

/**
 * Represents a key-value pair in an application store.
 */
export class TealKeyValue extends BaseModel {
  /**
   * Creates a new `TealKeyValue` object.
   * @param key
   * @param value Represents a TEAL value.
   */
  constructor(public key: string, public value: TealValue) {
    super();
    this.key = key;
    this.value = value;

    this.attribute_map = {
      key: 'key',
      value: 'value',
    };
  }
}

/**
 * Account information at a given round.
 *
 * Definition:
 * data/basics/userBalance.go : AccountData
 *
 */
export class Account extends BaseModel {
  public address: string;
  public amount: number;
  public amountWithoutPendingRewards: number;
  public pendingRewards: number;
  public rewards: number;
  public round: number;
  public status: string;
  public appsLocalState?: ApplicationLocalState[];
  public appsTotalSchema?: ApplicationStateSchema;
  public assets?: AssetHolding[];
  public authAddr?: string;
  public createdApps?: Application[];
  public createdAssets?: Asset[];
  public participation?: AccountParticipation;
  public rewardBase?: number;
  public sigType?: string;

  /**
   * Creates a new `Account` object.
   * @param address the account public key
   * @param amount \[algo\] total number of MicroAlgos in the account
   * @param amountWithoutPendingRewards specifies the amount of MicroAlgos in the account, without the pending rewards.
   * @param pendingRewards amount of MicroAlgos of pending rewards in this account.
   * @param rewards \[ern\] total rewards of MicroAlgos the account has received, including pending rewards.
   * @param round The round for which this information is relevant.
   * @param status \[onl\] delegation status of the account's MicroAlgos
   * * Offline - indicates that the associated account is delegated.
   * *  Online  - indicates that the associated account used as part of the delegation pool.
   * *   NotParticipating - indicates that the associated account is neither a delegator nor a delegate.
   * @param appsLocalState \[appl\] applications local data stored in this account.
   *
   * Note the raw object uses `map[int] -> AppLocalState` for this type.
   * @param appsTotalSchema \[tsch\] stores the sum of all of the local schemas and global schemas in this account.
   *
   * Note: the raw account uses `StateSchema` for this type.
   * @param assets \[asset\] assets held by this account.
   *
   * Note the raw object uses `map[int] -> AssetHolding` for this type.
   * @param authAddr \[spend\] the address against which signing should be checked. If empty, the address of the current account is used. This field can be updated in any transaction by setting the RekeyTo field.
   * @param createdApps \[appp\] parameters of applications created by this account including app global data.
   *
   * Note: the raw account uses `map[int] -> AppParams` for this type.
   * @param createdAssets \[apar\] parameters of assets created by this account.
   *
   * Note: the raw account uses `map[int] -> Asset` for this type.
   * @param participation AccountParticipation describes the parameters used by this account in consensus protocol.
   * @param rewardBase \[ebase\] used as part of the rewards computation. Only applicable to accounts which are participating.
   * @param sigType Indicates what type of signature is used by this account, must be one of:
   * * sig
   * * msig
   * * lsig
   */
  constructor({
    address,
    amount,
    amountWithoutPendingRewards,
    pendingRewards,
    rewards,
    round,
    status,
    appsLocalState,
    appsTotalSchema,
    assets,
    authAddr,
    createdApps,
    createdAssets,
    participation,
    rewardBase,
    sigType,
  }: {
    address: string;
    amount: number;
    amountWithoutPendingRewards: number;
    pendingRewards: number;
    rewards: number;
    round: number;
    status: string;
    appsLocalState?: ApplicationLocalState[];
    appsTotalSchema?: ApplicationStateSchema;
    assets?: AssetHolding[];
    authAddr?: string;
    createdApps?: Application[];
    createdAssets?: Asset[];
    participation?: AccountParticipation;
    rewardBase?: number;
    sigType?: string;
  }) {
    super();
    this.address = address;
    this.amount = amount;
    this.amountWithoutPendingRewards = amountWithoutPendingRewards;
    this.pendingRewards = pendingRewards;
    this.rewards = rewards;
    this.round = round;
    this.status = status;
    this.appsLocalState = appsLocalState;
    this.appsTotalSchema = appsTotalSchema;
    this.assets = assets;
    this.authAddr = authAddr;
    this.createdApps = createdApps;
    this.createdAssets = createdAssets;
    this.participation = participation;
    this.rewardBase = rewardBase;
    this.sigType = sigType;

    this.attribute_map = {
      address: 'address',
      amount: 'amount',
      amountWithoutPendingRewards: 'amount-without-pending-rewards',
      pendingRewards: 'pending-rewards',
      rewards: 'rewards',
      round: 'round',
      status: 'status',
      appsLocalState: 'apps-local-state',
      appsTotalSchema: 'apps-total-schema',
      assets: 'assets',
      authAddr: 'auth-addr',
      createdApps: 'created-apps',
      createdAssets: 'created-assets',
      participation: 'participation',
      rewardBase: 'reward-base',
      sigType: 'sig-type',
    };
  }
}

/**
 * Supply represents the current supply of MicroAlgos in the system.
 */
export class SupplyResponse extends BaseModel {
  /**
   * Creates a new `SupplyResponse` object.
   * @param currentRound Round
   * @param onlineMoney OnlineMoney
   * @param totalMoney TotalMoney
   */
  constructor(
    public currentRound: number,
    public onlineMoney: number,
    public totalMoney: number
  ) {
    super();
    this.currentRound = currentRound;
    this.onlineMoney = onlineMoney;
    this.totalMoney = totalMoney;

    this.attribute_map = {
      currentRound: 'current_round',
      onlineMoney: 'online-money',
      totalMoney: 'total-money',
    };
  }
}

/**
 * Represents a TEAL value.
 */
export class TealValue extends BaseModel {
  /**
   * Creates a new `TealValue` object.
   * @param bytes \[tb\] bytes value.
   * @param type \[tt\] value type.
   * @param uint \[ui\] uint value.
   */
  constructor(public bytes: string, public type: number, public uint: number) {
    super();
    this.bytes = bytes;
    this.type = type;
    this.uint = uint;

    this.attribute_map = {
      bytes: 'bytes',
      type: 'type',
      uint: 'uint',
    };
  }
}

/**
 * Given a transaction id of a recently submitted transaction, it returns information about it.  There are several cases when this might succeed:
 * - transaction committed (committed round > 0)
 * - transaction still in the pool (committed round = 0, pool error = "")
 * - transaction removed from pool due to error (committed round = 0, pool error != "")
 *
 * Or the transaction may have happened sufficiently long ago that the node no longer remembers it, and this will return an error.
 */
export class PendingTransactionResponse extends BaseModel {
  public poolError: string;
  public txn: EncodedSignedTransaction;
  public applicationIndex?: number;
  public assetClosingAmount?: number;
  public assetIndex?: number;
  public closeRewards?: number;
  public closingAmount?: number;
  public confirmedRound?: number;
  public globalStateDelta?: EvalDeltaKeyValue[];
  public localStateDelta?: AccountStateDelta[];
  public receiverRewards?: number;
  public senderRewards?: number;

  /**
   * Creates a new `PendingTransactionResponse` object.
   * @param poolError Indicates that the transaction was kicked out of this node's transaction pool (and specifies why that happened).  An empty string indicates the transaction wasn't kicked out of this node's txpool due to an error.
   *
   * @param txn The raw signed transaction.
   * @param applicationIndex The application index if the transaction was found and it created an application.
   * @param assetClosingAmount The number of the asset's unit that were transferred to the close-to address.
   * @param assetIndex The asset index if the transaction was found and it created an asset.
   * @param closeRewards Rewards in microalgos applied to the close remainder to account.
   * @param closingAmount Closing amount for the transaction.
   * @param confirmedRound The round where this transaction was confirmed, if present.
   * @param globalStateDelta \[gd\] Global state key/value changes for the application being executed by this transaction.
   * @param localStateDelta \[ld\] Local state key/value changes for the application being executed by this transaction.
   * @param receiverRewards Rewards in microalgos applied to the receiver account.
   * @param senderRewards Rewards in microalgos applied to the sender account.
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
    localStateDelta,
    receiverRewards,
    senderRewards,
  }: {
    poolError: string;
    txn: EncodedSignedTransaction;
    applicationIndex?: number;
    assetClosingAmount?: number;
    assetIndex?: number;
    closeRewards?: number;
    closingAmount?: number;
    confirmedRound?: number;
    globalStateDelta?: EvalDeltaKeyValue[];
    localStateDelta?: AccountStateDelta[];
    receiverRewards?: number;
    senderRewards?: number;
  }) {
    super();
    this.poolError = poolError;
    this.txn = txn;
    this.applicationIndex = applicationIndex;
    this.assetClosingAmount = assetClosingAmount;
    this.assetIndex = assetIndex;
    this.closeRewards = closeRewards;
    this.closingAmount = closingAmount;
    this.confirmedRound = confirmedRound;
    this.globalStateDelta = globalStateDelta;
    this.localStateDelta = localStateDelta;
    this.receiverRewards = receiverRewards;
    this.senderRewards = senderRewards;

    this.attribute_map = {
      poolError: 'pool-error',
      txn: 'txn',
      applicationIndex: 'application-index',
      assetClosingAmount: 'asset-closing-amount',
      assetIndex: 'asset-index',
      closeRewards: 'close-rewards',
      closingAmount: 'closing-amount',
      confirmedRound: 'confirmed-round',
      globalStateDelta: 'global-state-delta',
      localStateDelta: 'local-state-delta',
      receiverRewards: 'receiver-rewards',
      senderRewards: 'sender-rewards',
    };
  }
}

/**
 * TransactionParams contains the parameters that help a client construct a new transaction.
 */
export class TransactionParametersResponse extends BaseModel {
  public consensusVersion: string;
  public fee: number;
  public genesisHash: string;
  public genesisId: string;
  public lastRound: number;
  public minFee: number;

  /**
   * Creates a new `TransactionParametersResponse` object.
   * @param consensusVersion ConsensusVersion indicates the consensus protocol version
   * as of LastRound.
   * @param fee Fee is the suggested transaction fee
   * Fee is in units of micro-Algos per byte.
   * Fee may fall to zero but transactions must still have a fee of
   * at least MinTxnFee for the current network protocol.
   * @param genesisHash GenesisHash is the hash of the genesis block.
   * @param genesisId GenesisID is an ID listed in the genesis block.
   * @param lastRound LastRound indicates the last round seen
   * @param minFee The minimum transaction fee (not per byte) required for the
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
    fee: number;
    genesisHash: string;
    genesisId: string;
    lastRound: number;
    minFee: number;
  }) {
    super();
    this.consensusVersion = consensusVersion;
    this.fee = fee;
    this.genesisHash = genesisHash;
    this.genesisId = genesisId;
    this.lastRound = lastRound;
    this.minFee = minFee;

    this.attribute_map = {
      consensusVersion: 'consensus-version',
      fee: 'fee',
      genesisHash: 'genesis-hash',
      genesisId: 'genesis-id',
      lastRound: 'last-round',
      minFee: 'min-fee',
    };
  }
}
