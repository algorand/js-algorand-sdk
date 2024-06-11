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

  public toEncodingData(): unknown {
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
export interface TxnCommitments {
  /**
   * Root of transaction merkle tree using SHA512_256 hash function. This commitment is computed
   * based on the PaysetCommit type specified in the block's consensus protocol.
   */
  nativeSha512_256Commitment: Uint8Array;

  /**
   * Root of transaction vector commitment merkle tree using SHA256 hash function
   */
  sha256Commitment: Uint8Array;
}

/**
 * RewardsState represents the global parameters controlling the rate at which accounts accrue rewards.
 */
export interface RewardState {
  /**
   * The FeeSink address.
   */
  feeSink: Address;

  /**
   * The RewardsPool address.
   */
  rewardsPool: Address;

  /**
   * RewardsLevel specifies how many rewards, in MicroAlgos, have been distributed to each
   * config.Protocol.RewardUnit of MicroAlgos since genesis.
   */
  rewaredsLevel: bigint;

  /**
   * The number of new MicroAlgos added to the participation stake from rewards at the next round.
   */
  rewardsRate: bigint;

  /**
   * The number of leftover MicroAlgos after the distribution of RewardsRate/rewardUnits MicroAlgos for
   * every reward unit in the next round.
   */
  rewardsResidue: bigint;

  /**
   * The round at which the RewardsRate will be recalculated.
   */
  rewardsRecalculationRound: bigint;
}

/**
 * UpgradeState tracks the protocol upgrade state machine.  It is, strictly speaking, computable from
 * the history of all UpgradeVotes but we keep it in the block for explicitness and convenience
 * (instead of materializing it separately, like balances).
 */
export interface UpgradeState {
  currentProtocol: string;

  nextProtocol: string;

  nextProtocolApprovals: bigint;

  /**
   * NextProtocolVoteBefore specify the last voting round for the next protocol proposal. If there
   * is no voting for an upgrade taking place, this would be zero.
   */
  nextProtocolVoteBefore: bigint;

  /**
   * NextProtocolSwitchOn specify the round number at which the next protocol would be adopted. If
   * there is no upgrade taking place, nor a wait for the next protocol, this would be zero.
   */
  nextProtocolSwitchOn: bigint;
}

/**
 * UpgradeVote represents the vote of the block proposer with respect to protocol upgrades.
 */
export interface UpgradeVote {
  /**
   * UpgradePropose indicates a proposed upgrade
   */
  upgradePropose: string;

  /**
   * UpgradeDelay indicates the time between acceptance and execution
   */
  upgradeDelay: bigint;

  /**
   * UpgradeApprove indicates a yes vote for the current proposal
   */
  upgradeApprove: boolean;
}

/**
 * ParticipationUpdates represents participation account data that needs to be checked/acted on by
 * the network
 */
export interface ParticipationUpdates {
  /**
   * ExpiredParticipationAccounts contains a list of online accounts that needs to be converted to
   * offline since their participation key expired.
   */
  expiredParticipationAccounts: Address[];

  /**
   * AbsentParticipationAccounts contains a list of online accounts that needs to be converted to
   * offline since they are not proposing.
   */
  absentParticipationAccounts: Address[];
}

/**
 * Represents the metadata and state of a block.
 *
 * For more information, refer to: https://github.com/algorand/go-algorand/blob/master/data/bookkeeping/block.go
 */
export interface BlockHeader {
  /**
   * Round number
   */
  round: bigint;

  /**
   * Previous block hash
   */
  branch: Uint8Array;

  /**
   * Sortition seed
   */
  seed: Uint8Array;

  txnCommitments: TxnCommitments;

  /**
   * Timestamp in seconds since epoch
   */
  timestamp: bigint;

  /**
   * Genesis ID to which this block belongs.
   */
  genesisID: string;

  /**
   * Genesis hash to which this block belongs.
   */
  genesisHash: Uint8Array;

  /**
   *  Proposer is the proposer of this block. Like the Seed, agreement adds this after the block is
   * assembled by the transaction pool, so that the same block can be prepared for multiple
   * participating accounts in the same node. Populated if proto.Payouts.Enabled
   */
  proposer: Address;

  /**
   * FeesCollected is the sum of all fees paid by transactions in this block. Populated if
   * proto.EnableMining.
   */
  feesCollected: bigint;

  /**
   * Bonus is the bonus incentive to be paid for proposing this block.  It begins as a consensus
   * parameter value, and decays periodically.
   */
  bonus: bigint;

  /**
   * ProposerPayout is the amount that should be moved from the FeeSink to the Proposer at the start
   * of the next block.  It is basically the bonus + the payouts percent of FeesCollected, but may
   * be zero'd by proposer ineligibility.
   */
  proposerPayout: bigint;

  rewardState: RewardState;

  upgradeState: UpgradeState;

  upgradeVote: UpgradeVote;

  /**
   * TxnCounter is the number of the next transaction that will be committed after this block. Genesis
   * blocks can start at either 0 or 1000, depending on a consensus parameter (AppForbidLowResources).
   */
  txnCounter: bigint;

  /**
   * StateProofTracking tracks the status of the state proofs, potentially for multiple types of
   * ASPs (Algorand's State Proofs).
   */
  stateproofTracking: Map<number, StateProofTrackingData>;

  participationUpdates: ParticipationUpdates;
}

/**
 * A Block contains the Payset and metadata corresponding to a given Round.
 */
export class Block implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'rnd', // header.round
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'prev', // header.branch
        valueSchema: new ByteArraySchema(),
      },
      {
        key: 'seed', // header.seed
        valueSchema: new ByteArraySchema(),
      },
      {
        key: 'txn', // header.txnCommitments.nativeSha512_256Commitment
        valueSchema: new FixedLengthByteArraySchema(32),
      },
      {
        key: 'txn256', // header.txnCommitments.sha256Commitment
        valueSchema: new FixedLengthByteArraySchema(32),
      },
      {
        key: 'ts', // header.timestamp
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'gen', // header.genesisID
        valueSchema: new StringSchema(),
      },
      {
        key: 'gh', // header.genesisHash
        valueSchema: new FixedLengthByteArraySchema(32),
      },
      {
        key: 'prp', // header.proposer
        valueSchema: new AddressSchema(),
      },
      {
        key: 'fc', // header.feesCollected
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'bi', // header.bonus
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'pp', // header.proposerPayout
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'fees', // header.rewardState.feeSink
        valueSchema: new AddressSchema(),
      },
      {
        key: 'rwd', // header.rewardState.rewardsPool
        valueSchema: new AddressSchema(),
      },
      {
        key: 'earn', // header.rewardState.rewaredsLevel
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'rate', // header.rewardState.rewardsRate
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'frac', // header.rewardState.rewardsResidue
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'rwcalr', // header.rewardState.rewardsRecalculationRound
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'proto', // header.upgradeState.currentProtocol
        valueSchema: new StringSchema(),
      },
      {
        key: 'nextproto', // header.upgradeState.nextProtocol
        valueSchema: new StringSchema(),
      },
      {
        key: 'nextyes', // header.upgradeState.nextProtocolApprovals
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'nextbefore', // header.upgradeState.nextProtocolVoteBefore
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'nextswitch', // header.upgradeState.nextProtocolSwitchOn
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'upgradeprop', // header.upgradeVote.upgradePropose
        valueSchema: new StringSchema(),
      },
      {
        key: 'upgradedelay', // header.upgradeVote.upgradeDelay
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'upgradeyes', // header.upgradeVote.upgradeApprove
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'tc', // header.txnCounter
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'spt', // header.stateproofTracking
        valueSchema: new Uint64MapSchema(StateProofTrackingData.encodingSchema),
      },
      {
        key: 'partupdrmv', // header.participationUpdates.expiredParticipationAccounts
        valueSchema: new ArraySchema(new AddressSchema()),
      },
      {
        key: 'partupdabs', // header.participationUpdates.absentParticipationAccounts
        valueSchema: new ArraySchema(new AddressSchema()),
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

  public toEncodingData(): unknown {
    return new Map<string, unknown>([
      ['rnd', this.header.round],
      ['prev', this.header.branch],
      ['seed', this.header.seed],
      ['txn', this.header.txnCommitments.nativeSha512_256Commitment],
      ['txn256', this.header.txnCommitments.sha256Commitment],
      ['ts', this.header.timestamp],
      ['gen', this.header.genesisID],
      ['gh', this.header.genesisHash],
      ['prp', this.header.proposer],
      ['fc', this.header.feesCollected],
      ['bi', this.header.bonus],
      ['pp', this.header.proposerPayout],
      ['fees', this.header.rewardState.feeSink],
      ['rwd', this.header.rewardState.rewardsPool],
      ['earn', this.header.rewardState.rewaredsLevel],
      ['rate', this.header.rewardState.rewardsRate],
      ['frac', this.header.rewardState.rewardsResidue],
      ['rwcalr', this.header.rewardState.rewardsRecalculationRound],
      ['proto', this.header.upgradeState.currentProtocol],
      ['nextproto', this.header.upgradeState.nextProtocol],
      ['nextyes', this.header.upgradeState.nextProtocolApprovals],
      ['nextbefore', this.header.upgradeState.nextProtocolVoteBefore],
      ['nextswitch', this.header.upgradeState.nextProtocolSwitchOn],
      ['upgradeprop', this.header.upgradeVote.upgradePropose],
      ['upgradedelay', this.header.upgradeVote.upgradeDelay],
      ['upgradeyes', this.header.upgradeVote.upgradeApprove],
      ['tc', this.header.txnCounter],
      ['spt', this.header.stateproofTracking],
      [
        'partupdrmv',
        this.header.participationUpdates.expiredParticipationAccounts,
      ],
      [
        'partupdabs',
        this.header.participationUpdates.absentParticipationAccounts,
      ],
      ['txns', this.payset], // TODO: fix
    ]);
  }

  public static fromEncodingData(data: unknown): Block {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded BlockHeader: ${data}`);
    }
    return new Block({
      header: {
        round: data.get('rnd'),
        branch: data.get('prev'),
        seed: data.get('seed'),
        txnCommitments: {
          nativeSha512_256Commitment: data.get('txn'),
          sha256Commitment: data.get('txn256'),
        },
        timestamp: data.get('ts'),
        genesisHash: data.get('gen'),
        genesisID: data.get('gh'),
        proposer: data.get('prp'),
        feesCollected: data.get('fc'),
        bonus: data.get('bi'),
        proposerPayout: data.get('pp'),
        rewardState: {
          feeSink: data.get('fees'),
          rewardsPool: data.get('rwd'),
          rewaredsLevel: data.get('earn'),
          rewardsRate: data.get('rate'),
          rewardsResidue: data.get('frac'),
          rewardsRecalculationRound: data.get('rwcalr'),
        },
        upgradeState: {
          currentProtocol: data.get('proto'),
          nextProtocol: data.get('nextproto'),
          nextProtocolApprovals: data.get('nextyes'),
          nextProtocolVoteBefore: data.get('nextbefore'),
          nextProtocolSwitchOn: data.get('nextswitch'),
        },
        upgradeVote: {
          upgradePropose: data.get('upgradeprop'),
          upgradeDelay: data.get('upgradedelay'),
          upgradeApprove: data.get('upgradeyes'),
        },
        txnCounter: data.get('tc'),
        stateproofTracking: new Map(
          Array.from(
            (data.get('spt') as Map<bigint, StateProofTrackingData>).entries()
          ).map(([k, v]) => [Number(k), v])
        ),
        participationUpdates: {
          expiredParticipationAccounts: data.get('partupdrmv'),
          absentParticipationAccounts: data.get('partupdabs'),
        },
      },
      payset: data.get('txn'), // TODO: fix
    });
  }
}
