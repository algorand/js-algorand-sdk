import { Encodable, Schema } from '../encoding/encoding.js';
import {
  NamedMapSchema,
  Uint64MapSchema,
  ArraySchema,
  StringSchema,
  Uint64Schema,
  AddressSchema,
  ByteArraySchema,
  FixedLengthByteArraySchema,
  UntypedSchema,
  allOmitEmpty,
  combineMaps,
} from '../encoding/schema/index.js';
import { Address } from '../encoding/address.js';

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
        valueSchema: new Uint64Schema(),
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
        valueSchema: new ByteArraySchema(),
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
      ['spt', this.stateproofTracking],
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
      genesisHash: data.get('gen'),
      genesisID: data.get('gh'),
      proposer: data.get('prp'),
      feesCollected: data.get('fc'),
      bonus: data.get('bi'),
      proposerPayout: data.get('pp'),
      rewardState: RewardState.fromEncodingData(data),
      upgradeState: UpgradeState.fromEncodingData(data),
      upgradeVote: UpgradeVote.fromEncodingData(data),
      txnCounter: data.get('tc'),
      stateproofTracking: new Map(
        Array.from(
          (data.get('spt') as Map<bigint, StateProofTrackingData>).entries()
        ).map(([k, v]) => [Number(k), v])
      ),
      participationUpdates: ParticipationUpdates.fromEncodingData(data),
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
        valueSchema: new UntypedSchema(), // TODO: fix
      },
    ])
  );

  public header: BlockHeader;

  public payset: unknown; // TODO: fix

  public constructor(params: { header: BlockHeader; payset: unknown }) {
    this.header = params.header;
    this.payset = params.payset;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return Block.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['txns', this.payset], // TODO: fix
    ]);
    return combineMaps(data, this.header.toEncodingData());
  }

  public static fromEncodingData(data: unknown): Block {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BlockHeader: ${data}`);
    }
    return new Block({
      header: BlockHeader.fromEncodingData(data),
      payset: data.get('txn'), // TODO: fix
    });
  }
}
