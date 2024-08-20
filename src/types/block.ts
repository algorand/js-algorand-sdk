import { Encodable, Schema } from '../encoding/encoding.js';
import {
  NamedMapSchema,
  Uint64MapSchema,
  SpecialCaseBinaryStringMapSchema,
  SpecialCaseBinaryStringSchema,
  ArraySchema,
  StringSchema,
  BooleanSchema,
  Uint64Schema,
  AddressSchema,
  ByteArraySchema,
  FixedLengthByteArraySchema,
  OptionalSchema,
  allOmitEmpty,
  combineMaps,
  convertMap,
  BlockHashSchema,
} from '../encoding/schema/index.js';
import { Address } from '../encoding/address.js';
import { SignedTransaction } from '../signedTransaction.js';

/**
 * StateProofTrackingData tracks the status of state proofs.
 */
export class StateProofTrackingData implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'v', // stateProofVotersCommitment
        valueSchema: new ByteArraySchema(),
      },
      {
        key: 't', // stateProofOnlineTotalWeight
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'n', // stateProofNextRound
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  /**
   * StateProofVotersCommitment is the root of a vector commitment containing the online accounts
   * that will help sign a state proof.  The VC root, and the state proof, happen on blocks that are
   * a multiple of ConsensusParams.StateProofRounds.  For blocks that are not a multiple of
   * ConsensusParams.StateProofRounds, this value is zero.
   */
  public stateProofVotersCommitment: Uint8Array;

  /**
   * StateProofOnlineTotalWeight is the total number of microalgos held by the online accounts during
   * the StateProof round (or zero, if the merkle root is zero - no commitment for StateProof voters).
   * This is intended for computing the threshold of votes to expect from StateProofVotersCommitment.
   */
  public stateProofOnlineTotalWeight: bigint;

  /**
   * StateProofNextRound is the next round for which we will accept a StateProof transaction.
   */
  public stateProofNextRound: bigint;

  public constructor(params: {
    stateProofVotersCommitment: Uint8Array;
    stateProofOnlineTotalWeight: bigint;
    stateProofNextRound: bigint;
  }) {
    this.stateProofVotersCommitment = params.stateProofVotersCommitment;
    this.stateProofOnlineTotalWeight = params.stateProofOnlineTotalWeight;
    this.stateProofNextRound = params.stateProofNextRound;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return StateProofTrackingData.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['v', this.stateProofVotersCommitment],
      ['t', this.stateProofOnlineTotalWeight],
      ['n', this.stateProofNextRound],
    ]);
  }

  public static fromEncodingData(data: unknown): StateProofTrackingData {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProofTrackingData: ${data}`);
    }
    return new StateProofTrackingData({
      stateProofVotersCommitment: data.get('v'),
      stateProofOnlineTotalWeight: data.get('t'),
      stateProofNextRound: data.get('n'),
    });
  }
}

/**
 * TxnCommitments represents the commitments computed from the transactions in the block.
 * It contains multiple commitments based on different algorithms and hash functions, to support
 * different use cases.
 */
export class TxnCommitments implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'txn', // nativeSha512_256Commitment
        valueSchema: new FixedLengthByteArraySchema(32),
      },
      {
        key: 'txn256', // sha256Commitment
        valueSchema: new FixedLengthByteArraySchema(32),
      },
    ])
  );

  /**
   * Root of transaction merkle tree using SHA512_256 hash function. This commitment is computed
   * based on the PaysetCommit type specified in the block's consensus protocol.
   */
  public nativeSha512_256Commitment: Uint8Array;

  /**
   * Root of transaction vector commitment merkle tree using SHA256 hash function
   */
  public sha256Commitment: Uint8Array;

  constructor(params: {
    nativeSha512_256Commitment: Uint8Array;
    sha256Commitment: Uint8Array;
  }) {
    this.nativeSha512_256Commitment = params.nativeSha512_256Commitment;
    this.sha256Commitment = params.sha256Commitment;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return TxnCommitments.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['txn', this.nativeSha512_256Commitment],
      ['txn256', this.sha256Commitment],
    ]);
  }

  public static fromEncodingData(data: unknown): TxnCommitments {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded TxnCommitments: ${data}`);
    }
    return new TxnCommitments({
      nativeSha512_256Commitment: data.get('txn'),
      sha256Commitment: data.get('txn256'),
    });
  }
}

/**
 * RewardsState represents the global parameters controlling the rate at which accounts accrue rewards.
 */
export class RewardState implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'fees', // feeSink
        valueSchema: new AddressSchema(),
      },
      {
        key: 'rwd', // rewardsPool
        valueSchema: new AddressSchema(),
      },
      {
        key: 'earn', // rewardsLevel
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'rate', // rewardsRate
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'frac', // rewardsResidue
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'rwcalr', // rewardsRecalculationRound
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  /**
   * The FeeSink address.
   */
  public feeSink: Address;

  /**
   * The RewardsPool address.
   */
  public rewardsPool: Address;

  /**
   * RewardsLevel specifies how many rewards, in MicroAlgos, have been distributed to each
   * config.Protocol.RewardUnit of MicroAlgos since genesis.
   */
  public rewardsLevel: bigint;

  /**
   * The number of new MicroAlgos added to the participation stake from rewards at the next round.
   */
  public rewardsRate: bigint;

  /**
   * The number of leftover MicroAlgos after the distribution of RewardsRate/rewardUnits MicroAlgos for
   * every reward unit in the next round.
   */
  public rewardsResidue: bigint;

  /**
   * The round at which the RewardsRate will be recalculated.
   */
  public rewardsRecalculationRound: bigint;

  constructor(params: {
    feeSink: Address;
    rewardsPool: Address;
    rewardsLevel: bigint;
    rewardsRate: bigint;
    rewardsResidue: bigint;
    rewardsRecalculationRound: bigint;
  }) {
    this.feeSink = params.feeSink;
    this.rewardsPool = params.rewardsPool;
    this.rewardsLevel = params.rewardsLevel;
    this.rewardsRate = params.rewardsRate;
    this.rewardsResidue = params.rewardsResidue;
    this.rewardsRecalculationRound = params.rewardsRecalculationRound;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return RewardState.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['fees', this.feeSink],
      ['rwd', this.rewardsPool],
      ['earn', this.rewardsLevel],
      ['rate', this.rewardsRate],
      ['frac', this.rewardsResidue],
      ['rwcalr', this.rewardsRecalculationRound],
    ]);
  }

  public static fromEncodingData(data: unknown): RewardState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded RewardState: ${data}`);
    }
    return new RewardState({
      feeSink: data.get('fees'),
      rewardsPool: data.get('rwd'),
      rewardsLevel: data.get('earn'),
      rewardsRate: data.get('rate'),
      rewardsResidue: data.get('frac'),
      rewardsRecalculationRound: data.get('rwcalr'),
    });
  }
}

/**
 * UpgradeState tracks the protocol upgrade state machine.  It is, strictly speaking, computable from
 * the history of all UpgradeVotes but we keep it in the block for explicitness and convenience
 * (instead of materializing it separately, like balances).
 */
export class UpgradeState implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'proto', // currentProtocol
        valueSchema: new StringSchema(),
      },
      {
        key: 'nextproto', // nextProtocol
        valueSchema: new StringSchema(),
      },
      {
        key: 'nextyes', // nextProtocolApprovals
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'nextbefore', // nextProtocolVoteBefore
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'nextswitch', // nextProtocolSwitchOn
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  public currentProtocol: string;

  public nextProtocol: string;

  public nextProtocolApprovals: bigint;

  /**
   * NextProtocolVoteBefore specify the last voting round for the next protocol proposal. If there
   * is no voting for an upgrade taking place, this would be zero.
   */
  public nextProtocolVoteBefore: bigint;

  /**
   * NextProtocolSwitchOn specify the round number at which the next protocol would be adopted. If
   * there is no upgrade taking place, nor a wait for the next protocol, this would be zero.
   */
  public nextProtocolSwitchOn: bigint;

  public constructor(params: {
    currentProtocol: string;
    nextProtocol: string;
    nextProtocolApprovals: bigint;
    nextProtocolVoteBefore: bigint;
    nextProtocolSwitchOn: bigint;
  }) {
    this.currentProtocol = params.currentProtocol;
    this.nextProtocol = params.nextProtocol;
    this.nextProtocolApprovals = params.nextProtocolApprovals;
    this.nextProtocolVoteBefore = params.nextProtocolVoteBefore;
    this.nextProtocolSwitchOn = params.nextProtocolSwitchOn;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return UpgradeState.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['proto', this.currentProtocol],
      ['nextproto', this.nextProtocol],
      ['nextyes', this.nextProtocolApprovals],
      ['nextbefore', this.nextProtocolVoteBefore],
      ['nextswitch', this.nextProtocolSwitchOn],
    ]);
  }

  public static fromEncodingData(data: unknown): UpgradeState {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded UpgradeState: ${data}`);
    }
    return new UpgradeState({
      currentProtocol: data.get('proto'),
      nextProtocol: data.get('nextproto'),
      nextProtocolApprovals: data.get('nextyes'),
      nextProtocolVoteBefore: data.get('nextbefore'),
      nextProtocolSwitchOn: data.get('nextswitch'),
    });
  }
}

/**
 * UpgradeVote represents the vote of the block proposer with respect to protocol upgrades.
 */
export class UpgradeVote implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'upgradeprop', // upgradePropose
        valueSchema: new StringSchema(),
      },
      {
        key: 'upgradedelay', // upgradeDelay
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'upgradeyes', // upgradeApprove
        valueSchema: new BooleanSchema(),
      },
    ])
  );

  /**
   * UpgradePropose indicates a proposed upgrade
   */
  public upgradePropose: string;

  /**
   * UpgradeDelay indicates the time between acceptance and execution
   */
  public upgradeDelay: bigint;

  /**
   * UpgradeApprove indicates a yes vote for the current proposal
   */
  public upgradeApprove: boolean;

  public constructor(params: {
    upgradePropose: string;
    upgradeDelay: bigint;
    upgradeApprove: boolean;
  }) {
    this.upgradePropose = params.upgradePropose;
    this.upgradeDelay = params.upgradeDelay;
    this.upgradeApprove = params.upgradeApprove;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return UpgradeVote.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['upgradeprop', this.upgradePropose],
      ['upgradedelay', this.upgradeDelay],
      ['upgradeyes', this.upgradeApprove],
    ]);
  }

  public static fromEncodingData(data: unknown): UpgradeVote {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded UpgradeVote: ${data}`);
    }
    return new UpgradeVote({
      upgradePropose: data.get('upgradeprop'),
      upgradeDelay: data.get('upgradedelay'),
      upgradeApprove: data.get('upgradeyes'),
    });
  }
}

/**
 * ParticipationUpdates represents participation account data that needs to be checked/acted on by
 * the network
 */
export class ParticipationUpdates implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'partupdrmv', // expiredParticipationAccounts
        valueSchema: new ArraySchema(new AddressSchema()),
      },
      {
        key: 'partupdabs', // absentParticipationAccounts
        valueSchema: new ArraySchema(new AddressSchema()),
      },
    ])
  );

  /**
   * ExpiredParticipationAccounts contains a list of online accounts that needs to be converted to
   * offline since their participation key expired.
   */
  public expiredParticipationAccounts: Address[];

  /**
   * AbsentParticipationAccounts contains a list of online accounts that needs to be converted to
   * offline since they are not proposing.
   */
  public absentParticipationAccounts: Address[];

  public constructor(params: {
    expiredParticipationAccounts: Address[];
    absentParticipationAccounts: Address[];
  }) {
    this.expiredParticipationAccounts = params.expiredParticipationAccounts;
    this.absentParticipationAccounts = params.absentParticipationAccounts;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return ParticipationUpdates.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['partupdrmv', this.expiredParticipationAccounts],
      ['partupdabs', this.absentParticipationAccounts],
    ]);
  }

  public static fromEncodingData(data: unknown): ParticipationUpdates {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ParticipationUpdates: ${data}`);
    }
    return new ParticipationUpdates({
      expiredParticipationAccounts: data.get('partupdrmv'),
      absentParticipationAccounts: data.get('partupdabs'),
    });
  }
}

/**
 * Represents the metadata and state of a block.
 *
 * For more information, refer to: https://github.com/algorand/go-algorand/blob/master/data/bookkeeping/block.go
 */
export class BlockHeader implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'rnd', // round
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'prev', // branch
        valueSchema: new BlockHashSchema(),
      },
      {
        key: 'seed', // seed
        valueSchema: new ByteArraySchema(),
      },
      {
        key: '',
        valueSchema: TxnCommitments.encodingSchema,
        embedded: true,
      },
      {
        key: 'ts', // timestamp
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'gen', // genesisID
        valueSchema: new StringSchema(),
      },
      {
        key: 'gh', // genesisHash
        valueSchema: new FixedLengthByteArraySchema(32),
      },
      {
        key: 'prp', // proposer
        valueSchema: new AddressSchema(),
      },
      {
        key: 'fc', // feesCollected
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'bi', // bonus
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'pp', // proposerPayout
        valueSchema: new Uint64Schema(),
      },
      {
        key: '',
        valueSchema: RewardState.encodingSchema,
        embedded: true,
      },
      {
        key: '',
        valueSchema: UpgradeState.encodingSchema,
        embedded: true,
      },
      {
        key: '',
        valueSchema: UpgradeVote.encodingSchema,
        embedded: true,
      },
      {
        key: 'tc', // txnCounter
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'spt', // stateproofTracking
        valueSchema: new Uint64MapSchema(StateProofTrackingData.encodingSchema),
      },
      {
        key: '',
        valueSchema: ParticipationUpdates.encodingSchema,
        embedded: true,
      },
    ])
  );

  /**
   * Round number
   */
  public round: bigint;

  /**
   * Previous block hash
   */
  public branch: Uint8Array;

  /**
   * Sortition seed
   */
  public seed: Uint8Array;

  public txnCommitments: TxnCommitments;

  /**
   * Timestamp in seconds since epoch
   */
  public timestamp: bigint;

  /**
   * Genesis ID to which this block belongs.
   */
  public genesisID: string;

  /**
   * Genesis hash to which this block belongs.
   */
  public genesisHash: Uint8Array;

  /**
   *  Proposer is the proposer of this block. Like the Seed, agreement adds this after the block is
   * assembled by the transaction pool, so that the same block can be prepared for multiple
   * participating accounts in the same node. Populated if proto.Payouts.Enabled
   */
  public proposer: Address;

  /**
   * FeesCollected is the sum of all fees paid by transactions in this block. Populated if
   * proto.EnableMining.
   */
  public feesCollected: bigint;

  /**
   * Bonus is the bonus incentive to be paid for proposing this block.  It begins as a consensus
   * parameter value, and decays periodically.
   */
  public bonus: bigint;

  /**
   * ProposerPayout is the amount that should be moved from the FeeSink to the Proposer at the start
   * of the next block.  It is basically the bonus + the payouts percent of FeesCollected, but may
   * be zero'd by proposer ineligibility.
   */
  public proposerPayout: bigint;

  public rewardState: RewardState;

  public upgradeState: UpgradeState;

  public upgradeVote: UpgradeVote;

  /**
   * TxnCounter is the number of the next transaction that will be committed after this block. Genesis
   * blocks can start at either 0 or 1000, depending on a consensus parameter (AppForbidLowResources).
   */
  public txnCounter: bigint;

  /**
   * StateProofTracking tracks the status of the state proofs, potentially for multiple types of
   * ASPs (Algorand's State Proofs).
   */
  public stateproofTracking: Map<number, StateProofTrackingData>;

  public participationUpdates: ParticipationUpdates;

  public constructor(params: {
    round: bigint;
    branch: Uint8Array;
    seed: Uint8Array;
    txnCommitments: TxnCommitments;
    timestamp: bigint;
    genesisID: string;
    genesisHash: Uint8Array;
    proposer: Address;
    feesCollected: bigint;
    bonus: bigint;
    proposerPayout: bigint;
    rewardState: RewardState;
    upgradeState: UpgradeState;
    upgradeVote: UpgradeVote;
    txnCounter: bigint;
    stateproofTracking: Map<number, StateProofTrackingData>;
    participationUpdates: ParticipationUpdates;
  }) {
    this.round = params.round;
    this.branch = params.branch;
    this.seed = params.seed;
    this.txnCommitments = params.txnCommitments;
    this.timestamp = params.timestamp;
    this.genesisID = params.genesisID;
    this.genesisHash = params.genesisHash;
    this.proposer = params.proposer;
    this.feesCollected = params.feesCollected;
    this.bonus = params.bonus;
    this.proposerPayout = params.proposerPayout;
    this.rewardState = params.rewardState;
    this.upgradeState = params.upgradeState;
    this.upgradeVote = params.upgradeVote;
    this.txnCounter = params.txnCounter;
    this.stateproofTracking = params.stateproofTracking;
    this.participationUpdates = params.participationUpdates;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return BlockHeader.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['rnd', this.round],
      ['prev', this.branch],
      ['seed', this.seed],
      ['ts', this.timestamp],
      ['gen', this.genesisID],
      ['gh', this.genesisHash],
      ['prp', this.proposer],
      ['fc', this.feesCollected],
      ['bi', this.bonus],
      ['pp', this.proposerPayout],
      ['tc', this.txnCounter],
      [
        'spt',
        convertMap(this.stateproofTracking, (key, value) => [
          key,
          value.toEncodingData(),
        ]),
      ],
    ]);
    return combineMaps(
      data,
      this.txnCommitments.toEncodingData(),
      this.rewardState.toEncodingData(),
      this.upgradeState.toEncodingData(),
      this.upgradeVote.toEncodingData(),
      this.participationUpdates.toEncodingData()
    );
  }

  public static fromEncodingData(data: unknown): BlockHeader {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BlockHeader: ${data}`);
    }
    return new BlockHeader({
      round: data.get('rnd'),
      branch: data.get('prev'),
      seed: data.get('seed'),
      txnCommitments: TxnCommitments.fromEncodingData(data),
      timestamp: data.get('ts'),
      genesisID: data.get('gen'),
      genesisHash: data.get('gh'),
      proposer: data.get('prp'),
      feesCollected: data.get('fc'),
      bonus: data.get('bi'),
      proposerPayout: data.get('pp'),
      rewardState: RewardState.fromEncodingData(data),
      upgradeState: UpgradeState.fromEncodingData(data),
      upgradeVote: UpgradeVote.fromEncodingData(data),
      txnCounter: data.get('tc'),
      stateproofTracking: convertMap(
        data.get('spt') as Map<bigint, unknown>,
        (key, value) => [
          Number(key),
          StateProofTrackingData.fromEncodingData(value),
        ]
      ),
      participationUpdates: ParticipationUpdates.fromEncodingData(data),
    });
  }
}

export class ValueDelta implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'at', // action
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'bs', // bytes
        valueSchema: new SpecialCaseBinaryStringSchema(),
      },
      {
        key: 'ui', // uint
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  public action: number;
  public bytes: Uint8Array;
  public uint: bigint;

  public constructor(params: {
    action: number;
    bytes: Uint8Array;
    uint: bigint;
  }) {
    this.action = params.action;
    this.bytes = params.bytes;
    this.uint = params.uint;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return ValueDelta.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['at', this.action],
      ['bs', this.bytes],
      ['ui', this.uint],
    ]);
  }

  public static fromEncodingData(data: unknown): ValueDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ValueDelta: ${data}`);
    }
    return new ValueDelta({
      action: Number(data.get('at')),
      bytes: data.get('bs'),
      uint: data.get('ui'),
    });
  }
}

export class EvalDelta implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  public static get encodingSchema(): Schema {
    // This is declared like this in order to break the circular dependency of
    // SignedTxnWithAD -> ApplyData -> EvalDelta -> SignedTxnWithAD
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        ...allOmitEmpty([
          {
            key: 'gd', // globalDelta
            valueSchema: new OptionalSchema(
              new SpecialCaseBinaryStringMapSchema(ValueDelta.encodingSchema)
            ),
          },
          {
            key: 'ld', // localDeltas
            valueSchema: new OptionalSchema(
              new Uint64MapSchema(
                new SpecialCaseBinaryStringMapSchema(ValueDelta.encodingSchema)
              )
            ),
          },
          {
            key: 'sa', // sharedAccts
            valueSchema: new OptionalSchema(
              new ArraySchema(new AddressSchema())
            ),
          },
          {
            key: 'lg', // logs
            valueSchema: new OptionalSchema(
              new ArraySchema(new SpecialCaseBinaryStringSchema())
            ),
          },
          {
            key: 'itx', // innerTxns
            valueSchema: new OptionalSchema(
              // eslint-disable-next-line no-use-before-define
              new ArraySchema(SignedTxnWithAD.encodingSchema)
            ),
          },
        ])
      );
    }
    return this.encodingSchemaValue;
  }

  public globalDelta: Map<Uint8Array, ValueDelta>;

  /**
   * When decoding EvalDeltas, the integer key represents an offset into
   * [txn.Sender, txn.Accounts[0], txn.Accounts[1], ...]
   */
  public localDeltas: Map<number, Map<Uint8Array, ValueDelta>>;

  /**
   * If a program modifies the local of an account that is not the Sender, or
   * in txn.Accounts, it must be recorded here, so that the key in LocalDeltas
   * can refer to it.
   */
  public sharedAccts: Address[];

  public logs: Uint8Array[];

  // eslint-disable-next-line no-use-before-define
  public innerTxns: SignedTxnWithAD[];

  public constructor(params: {
    globalDelta?: Map<Uint8Array, ValueDelta>;
    localDeltas?: Map<number, Map<Uint8Array, ValueDelta>>;
    sharedAccts?: Address[];
    logs?: Uint8Array[];
    // eslint-disable-next-line no-use-before-define
    innerTxns?: SignedTxnWithAD[];
  }) {
    this.globalDelta = params.globalDelta ?? new Map<Uint8Array, ValueDelta>();
    this.localDeltas =
      params.localDeltas ?? new Map<number, Map<Uint8Array, ValueDelta>>();
    this.sharedAccts = params.sharedAccts ?? [];
    this.logs = params.logs ?? [];
    this.innerTxns = params.innerTxns ?? [];
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return EvalDelta.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      [
        'gd',
        convertMap(this.globalDelta, (key, value) => [
          key,
          value.toEncodingData(),
        ]),
      ],
      [
        'ld',
        convertMap(this.localDeltas, (key, value) => [
          key,
          convertMap(value, (k, v) => [k, v.toEncodingData()]),
        ]),
      ],
      ['sa', this.sharedAccts],
      ['lg', this.logs],
      ['itx', this.innerTxns.map((t) => t.toEncodingData())],
    ]);
  }

  public static fromEncodingData(data: unknown): EvalDelta {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded EvalDelta: ${data}`);
    }
    return new EvalDelta({
      globalDelta: data.get('gd')
        ? convertMap(
            data.get('gd') as Map<Uint8Array, unknown>,
            (key, value) => [key, ValueDelta.fromEncodingData(value)]
          )
        : undefined,
      localDeltas: data.get('ld')
        ? convertMap(
            data.get('ld') as Map<bigint, Map<Uint8Array, unknown>>,
            (key, value) => [
              Number(key),
              convertMap(value, (k, v) => [k, ValueDelta.fromEncodingData(v)]),
            ]
          )
        : undefined,
      sharedAccts: data.get('sa'),
      logs: data.get('lg'),
      // eslint-disable-next-line no-use-before-define
      innerTxns: (data.get('itx') ?? []).map(SignedTxnWithAD.fromEncodingData),
    });
  }
}

export class ApplyData implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  public static get encodingSchema(): Schema {
    // This is declared like this in order to break the circular dependency of
    // SignedTxnWithAD -> ApplyData -> EvalDelta -> SignedTxnWithAD
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        ...allOmitEmpty([
          {
            key: 'ca', // closingAmount
            valueSchema: new OptionalSchema(new Uint64Schema()),
          },
          {
            key: 'aca', // assetClosingAmount
            valueSchema: new OptionalSchema(new Uint64Schema()),
          },
          {
            key: 'rs', // senderRewards
            valueSchema: new OptionalSchema(new Uint64Schema()),
          },
          {
            key: 'rr', // receiverRewards
            valueSchema: new OptionalSchema(new Uint64Schema()),
          },
          {
            key: 'rc', // closeRewards
            valueSchema: new OptionalSchema(new Uint64Schema()),
          },
          {
            key: 'dt', // evalDelta
            valueSchema: new OptionalSchema(EvalDelta.encodingSchema),
          },
          {
            key: 'caid', // configAsset
            valueSchema: new OptionalSchema(new Uint64Schema()),
          },
          {
            key: 'apid', // applicationID
            valueSchema: new OptionalSchema(new Uint64Schema()),
          },
        ])
      );
    }
    return this.encodingSchemaValue;
  }

  /**
   * Closing amount for transaction.
   */
  public closingAmount?: bigint;

  /**
   * Closing amount for asset transaction.
   */
  public assetClosingAmount?: bigint;

  /**
   * Rewards applied to the Sender.
   */
  public senderRewards?: bigint;

  /**
   * Rewards applied to the Receiver.
   */
  public receiverRewards?: bigint;

  /**
   * Rewards applied to the CloseRemainderTo account.
   */
  public closeRewards?: bigint;

  public evalDelta?: EvalDelta;

  /**
   * If an ASA is being created, this is its newly created ID. Else 0.
   */
  public configAsset?: bigint;

  /**
   * If an application is being created, this is its newly created ID. Else 0.
   */
  public applicationID?: bigint;

  public constructor(params: {
    closingAmount?: bigint;
    assetClosingAmount?: bigint;
    senderRewards?: bigint;
    receiverRewards?: bigint;
    closeRewards?: bigint;
    evalDelta?: EvalDelta;
    configAsset?: bigint;
    applicationID?: bigint;
  }) {
    this.closingAmount = params.closingAmount;
    this.assetClosingAmount = params.assetClosingAmount;
    this.senderRewards = params.senderRewards;
    this.receiverRewards = params.receiverRewards;
    this.closeRewards = params.closeRewards;
    this.evalDelta = params.evalDelta;
    this.configAsset = params.configAsset;
    this.applicationID = params.applicationID;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return ApplyData.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['ca', this.closingAmount],
      ['aca', this.assetClosingAmount],
      ['rs', this.senderRewards],
      ['rr', this.receiverRewards],
      ['rc', this.closeRewards],
      ['dt', this.evalDelta ? this.evalDelta.toEncodingData() : undefined],
      ['caid', this.configAsset],
      ['apid', this.applicationID],
    ]);
  }

  public static fromEncodingData(data: unknown): ApplyData {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded ApplyData: ${data}`);
    }
    return new ApplyData({
      closingAmount: data.get('ca'),
      assetClosingAmount: data.get('aca'),
      senderRewards: data.get('rs'),
      receiverRewards: data.get('rr'),
      closeRewards: data.get('rc'),
      evalDelta: data.get('dt')
        ? EvalDelta.fromEncodingData(data.get('dt'))
        : undefined,
      configAsset: data.get('caid'),
      applicationID: data.get('apid'),
    });
  }
}

export class SignedTxnWithAD implements Encodable {
  private static encodingSchemaValue: Schema | undefined;

  public static get encodingSchema(): Schema {
    // This is declared like this in order to break the circular dependency of
    // SignedTxnWithAD -> ApplyData -> EvalDelta -> SignedTxnWithAD
    if (!this.encodingSchemaValue) {
      this.encodingSchemaValue = new NamedMapSchema([]);
      (this.encodingSchemaValue as NamedMapSchema).pushEntries(
        ...allOmitEmpty([
          {
            key: '',
            valueSchema: SignedTransaction.encodingSchema,
            embedded: true,
          },
          {
            key: '',
            valueSchema: ApplyData.encodingSchema,
            embedded: true,
          },
        ])
      );
    }
    return this.encodingSchemaValue;
  }

  public signedTxn: SignedTransaction;

  public applyData: ApplyData;

  public constructor(params: {
    signedTxn: SignedTransaction;
    applyData: ApplyData;
  }) {
    this.signedTxn = params.signedTxn;
    this.applyData = params.applyData;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return SignedTxnWithAD.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return combineMaps(
      this.signedTxn.toEncodingData(),
      this.applyData.toEncodingData()
    );
  }

  public static fromEncodingData(data: unknown): SignedTxnWithAD {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded SignedTxnWithAD: ${data}`);
    }
    return new SignedTxnWithAD({
      signedTxn: SignedTransaction.fromEncodingData(data),
      applyData: ApplyData.fromEncodingData(data),
    });
  }
}

/**
 * SignedTxnInBlock is how a signed transaction is encoded in a block.
 */
export class SignedTxnInBlock implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: '',
        valueSchema: SignedTxnWithAD.encodingSchema,
        embedded: true,
      },
      {
        key: 'hgi', // hasGenesisID
        valueSchema: new BooleanSchema(),
      },
      {
        key: 'hgh', // hasGenesisHash
        valueSchema: new BooleanSchema(),
      },
    ])
  );

  public signedTxn: SignedTxnWithAD;

  public hasGenesisID: boolean;

  public hasGenesisHash: boolean;

  public constructor(params: {
    signedTxn: SignedTxnWithAD;
    hasGenesisID: boolean;
    hasGenesisHash: boolean;
  }) {
    this.signedTxn = params.signedTxn;
    this.hasGenesisID = params.hasGenesisID;
    this.hasGenesisHash = params.hasGenesisHash;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return SignedTxnInBlock.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['hgi', this.hasGenesisID],
      ['hgh', this.hasGenesisHash],
    ]);
    return combineMaps(data, this.signedTxn.toEncodingData());
  }

  public static fromEncodingData(data: unknown): SignedTxnInBlock {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded SignedTxnInBlock: ${data}`);
    }
    return new SignedTxnInBlock({
      signedTxn: SignedTxnWithAD.fromEncodingData(data),
      hasGenesisID: data.get('hgi'),
      hasGenesisHash: data.get('hgh'),
    });
  }
}

/**
 * A Block contains the Payset and metadata corresponding to a given Round.
 */
export class Block implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: '',
        valueSchema: BlockHeader.encodingSchema,
        embedded: true,
      },
      {
        key: 'txns', // payset
        valueSchema: new ArraySchema(SignedTxnInBlock.encodingSchema),
      },
    ])
  );

  public header: BlockHeader;

  public payset: SignedTxnInBlock[];

  public constructor(params: {
    header: BlockHeader;
    payset: SignedTxnInBlock[];
  }) {
    this.header = params.header;
    this.payset = params.payset;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return Block.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['txns', this.payset.map((p) => p.toEncodingData())],
    ]);
    return combineMaps(data, this.header.toEncodingData());
  }

  public static fromEncodingData(data: unknown): Block {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BlockHeader: ${data}`);
    }
    return new Block({
      header: BlockHeader.fromEncodingData(data),
      payset: data.get('txns').map(SignedTxnInBlock.fromEncodingData),
    });
  }
}
