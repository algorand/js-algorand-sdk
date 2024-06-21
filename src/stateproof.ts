import { Encodable, Schema } from './encoding/encoding.js';
import {
  Uint64Schema,
  ByteArraySchema,
  FixedLengthByteArraySchema,
  ArraySchema,
  NamedMapSchema,
  Uint64MapSchema,
  allOmitEmpty,
  convertMap,
} from './encoding/schema/index.js';

export class HashFactory implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 't', valueSchema: new Uint64Schema() }, // hashType
    ])
  );

  public hashType: number; // `codec:"t"`

  public constructor(params: { hashType: number }) {
    this.hashType = params.hashType;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return HashFactory.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([['t', this.hashType]]);
  }

  public static fromEncodingData(data: unknown): HashFactory {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded HashFactory: ${data}`);
    }
    return new HashFactory({
      hashType: Number(data.get('t')),
    });
  }
}

export class MerkleArrayProof implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'pth', // path
        valueSchema: new ArraySchema(new ByteArraySchema()),
      },
      {
        key: 'hsh', // hashFactory
        valueSchema: HashFactory.encodingSchema,
      },
      {
        key: 'td', // treeDepth
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  /**
   * Path is bounded by MaxNumLeavesOnEncodedTree since there could be multiple reveals, and
   * given the distribution of the elt positions and the depth of the tree, the path length can
   * increase up to 2^MaxEncodedTreeDepth / 2
   */
  public path: Uint8Array[];

  public hashFactory: HashFactory;

  /**
   * TreeDepth represents the depth of the tree that is being proven. It is the number of edges
   * from the root to a leaf.
   */
  public treeDepth: number;

  public constructor(params: {
    path: Uint8Array[];
    hashFactory: HashFactory;
    treeDepth: number;
  }) {
    this.path = params.path;
    this.hashFactory = params.hashFactory;
    this.treeDepth = params.treeDepth;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return MerkleArrayProof.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['pth', this.path],
      ['hsh', this.hashFactory.toEncodingData()],
      ['td', this.treeDepth],
    ]);
  }

  public static fromEncodingData(data: unknown): MerkleArrayProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded MerkleArrayProof: ${data}`);
    }
    return new MerkleArrayProof({
      path: data.get('pth'),
      hashFactory: HashFactory.fromEncodingData(data.get('hsh')),
      treeDepth: Number(data.get('td')),
    });
  }
}

/**
 * MerkleSignatureVerifier is used to verify a merkle signature.
 */
export class MerkleSignatureVerifier implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'cmt', // commitment
        valueSchema: new FixedLengthByteArraySchema(64),
      },
      {
        key: 'lf', // keyLifetime
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  public commitment: Uint8Array;

  public keyLifetime: bigint;

  public constructor(params: { commitment: Uint8Array; keyLifetime: bigint }) {
    this.commitment = params.commitment;
    this.keyLifetime = params.keyLifetime;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return MerkleSignatureVerifier.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['cmt', this.commitment],
      ['lf', this.keyLifetime],
    ]);
  }

  public static fromEncodingData(data: unknown): MerkleSignatureVerifier {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded MerkleSignatureVerifier: ${data}`);
    }
    return new MerkleSignatureVerifier({
      commitment: data.get('cmt'),
      keyLifetime: data.get('lf'),
    });
  }
}

/**
 * A Participant corresponds to an account whose AccountData.Status is Online, and for which the
 * expected sigRound satisfies AccountData.VoteFirstValid <= sigRound <= AccountData.VoteLastValid.
 *
 * In the Algorand ledger, it is possible for multiple accounts to have the same PK. Thus, the PK is
 * not necessarily unique among Participants. However, each account will produce a unique Participant
 * struct, to avoid potential DoS attacks where one account claims to have the same VoteID PK as
 * another account.
 */
export class Participant implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'p', // pk
        valueSchema: MerkleSignatureVerifier.encodingSchema,
      },
      {
        key: 'w', // weight
        valueSchema: new Uint64Schema(),
      },
    ])
  );

  /**
   * pk is the identifier used to verify the signature for a specific participant
   */
  public pk: MerkleSignatureVerifier;

  /**
   * weight is AccountData.MicroAlgos.
   */
  public weight: bigint;

  public constructor(params: { pk: MerkleSignatureVerifier; weight: bigint }) {
    this.pk = params.pk;
    this.weight = params.weight;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return Participant.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['p', this.pk.toEncodingData()],
      ['w', this.weight],
    ]);
  }

  public static fromEncodingData(data: unknown): Participant {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded Participant: ${data}`);
    }
    return new Participant({
      pk: MerkleSignatureVerifier.fromEncodingData(data.get('p')),
      weight: data.get('w'),
    });
  }
}

/**
 * Reveal is a single array position revealed as part of a state proof. It reveals an element of the
 * signature array and the corresponding element of the participants array.
 */
export class Reveal implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 's', valueSchema: new Uint64Schema() }, // sigslotCommit
      { key: 'p', valueSchema: Participant.encodingSchema }, // participant
    ])
  );

  public sigslotCommit: bigint;

  public participant: Participant;

  public constructor(params: {
    sigslotCommit: bigint;
    participant: Participant;
  }) {
    this.sigslotCommit = params.sigslotCommit;
    this.participant = params.participant;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return Reveal.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['s', this.sigslotCommit],
      ['p', this.participant.toEncodingData()],
    ]);
  }

  public static fromEncodingData(data: unknown): Reveal {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded Reveal: ${data}`);
    }
    return new Reveal({
      sigslotCommit: data.get('s'),
      participant: Participant.fromEncodingData(data.get('p')),
    });
  }
}

export class StateProof implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'c', // sigCommit
        valueSchema: new ByteArraySchema(),
      },
      {
        key: 'w', // signedWeight
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'S', // sigProofs
        valueSchema: MerkleArrayProof.encodingSchema,
      },
      {
        key: 'P', // partProofs
        valueSchema: MerkleArrayProof.encodingSchema,
      },
      {
        key: 'v', // merkleSignatureSaltVersion
        valueSchema: new Uint64Schema(),
      },
      {
        key: 'r', // reveals
        valueSchema: new Uint64MapSchema(Reveal.encodingSchema),
      },
      {
        key: 'pr', // positionsToReveal
        valueSchema: new ArraySchema(new Uint64Schema()),
      },
    ])
  );

  public sigCommit: Uint8Array;

  public signedWeight: bigint;

  public sigProofs: MerkleArrayProof;

  public partProofs: MerkleArrayProof;

  public merkleSignatureSaltVersion: number;

  /**
   * Reveals is a sparse map from the position being revealed to the corresponding elements from the
   * sigs and participants arrays.
   */
  public reveals: Map<bigint, Reveal>;

  public positionsToReveal: bigint[];

  public constructor(params: {
    sigCommit: Uint8Array;
    signedWeight: bigint;
    sigProofs: MerkleArrayProof;
    partProofs: MerkleArrayProof;
    merkleSignatureSaltVersion: number;
    reveals: Map<bigint, Reveal>;
    positionsToReveal: bigint[];
  }) {
    this.sigCommit = params.sigCommit;
    this.signedWeight = params.signedWeight;
    this.sigProofs = params.sigProofs;
    this.partProofs = params.partProofs;
    this.merkleSignatureSaltVersion = params.merkleSignatureSaltVersion;
    this.reveals = params.reveals;
    this.positionsToReveal = params.positionsToReveal;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return StateProof.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['c', this.sigCommit],
      ['w', this.signedWeight],
      ['S', this.sigProofs.toEncodingData()],
      ['P', this.partProofs.toEncodingData()],
      ['v', this.merkleSignatureSaltVersion],
      [
        'r',
        convertMap(this.reveals, (key, value) => [key, value.toEncodingData()]),
      ],
      ['pr', this.positionsToReveal],
    ]);
  }

  public static fromEncodingData(data: unknown): StateProof {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProof: ${data}`);
    }
    return new StateProof({
      sigCommit: data.get('c'),
      signedWeight: data.get('w'),
      sigProofs: MerkleArrayProof.fromEncodingData(data.get('S')),
      partProofs: MerkleArrayProof.fromEncodingData(data.get('P')),
      merkleSignatureSaltVersion: Number(data.get('v')),
      reveals: convertMap(data.get('r'), (key, value) => [
        key as bigint,
        Reveal.fromEncodingData(value),
      ]),
      positionsToReveal: data.get('pr'),
    });
  }
}

export class StateProofMessage implements Encodable {
  public static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      { key: 'b', valueSchema: new ByteArraySchema() }, // blockHeadersCommitment
      { key: 'v', valueSchema: new ByteArraySchema() }, // votersCommitment
      { key: 'P', valueSchema: new Uint64Schema() }, // lnProvenWeight
      { key: 'f', valueSchema: new Uint64Schema() }, // firstAttestedRound
      { key: 'l', valueSchema: new Uint64Schema() }, // lastAttestedRound
    ])
  );

  public blockHeadersCommitment: Uint8Array;

  public votersCommitment: Uint8Array;

  public lnProvenWeight: bigint;

  public firstAttestedRound: bigint;

  public lastAttestedRound: bigint;

  public constructor(params: {
    blockHeadersCommitment: Uint8Array;
    votersCommitment: Uint8Array;
    lnProvenWeight: bigint;
    firstAttestedRound: bigint;
    lastAttestedRound: bigint;
  }) {
    this.blockHeadersCommitment = params.blockHeadersCommitment;
    this.votersCommitment = params.votersCommitment;
    this.lnProvenWeight = params.lnProvenWeight;
    this.firstAttestedRound = params.firstAttestedRound;
    this.lastAttestedRound = params.lastAttestedRound;
  }

  // eslint-disable-next-line class-methods-use-this
  public getEncodingSchema(): Schema {
    return StateProofMessage.encodingSchema;
  }

  public toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['b', this.blockHeadersCommitment],
      ['v', this.votersCommitment],
      ['P', this.lnProvenWeight],
      ['f', this.firstAttestedRound],
      ['l', this.lastAttestedRound],
    ]);
  }

  public static fromEncodingData(data: unknown): StateProofMessage {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded StateProofMessage: ${data}`);
    }
    return new StateProofMessage({
      blockHeadersCommitment: data.get('b'),
      votersCommitment: data.get('v'),
      lnProvenWeight: data.get('P'),
      firstAttestedRound: data.get('f'),
      lastAttestedRound: data.get('l'),
    });
  }

  public static fromMap(data: Map<string, unknown>): StateProofMessage {
    return new StateProofMessage({
      blockHeadersCommitment: data.get('b') as Uint8Array,
      votersCommitment: data.get('v') as Uint8Array,
      lnProvenWeight: data.get('P') as bigint,
      firstAttestedRound: data.get('f') as bigint,
      lastAttestedRound: data.get('l') as bigint,
    });
  }
}
