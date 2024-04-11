import { JSONEncodingData, MsgpackEncodingData } from '../encoding/encoding.js';
import {
  NamedMapSchema,
  StringSchema,
  Uint64Schema,
  UntypedSchema,
} from '../encoding/schema/index.js';

/**
 * Represents the metadata and state of a block.
 *
 * For more information, refer to: https://github.com/algorand/go-algorand/blob/master/data/bookkeeping/block.go
 */
export default interface BlockHeader {
  /**
   * Transaction fees
   */
  fees: string;

  /**
   * The number of leftover MicroAlgos after rewards distribution
   */
  frac: number;

  /**
   * Genesis ID to which this block belongs
   */
  gen: string;

  /**
   * Genesis hash to which this block belongs.
   */
  gh: string;

  /**
   * The hash of the previous block
   */
  prev: string;

  /**
   * Current protocol
   */
  proto: string;

  /**
   * Rewards rate
   */
  rate: number;

  /**
   * Round number
   */
  rnd: number;

  /**
   * Rewards recalculation round
   */
  rwcalr: number;

  /**
   * Rewards pool
   */
  rwd: string;

  /**
   * Sortition seed
   */
  seed: string;

  /**
   * Timestamp in seconds since epoch
   */
  ts: number;

  /**
   * Transaction root SHA512_256
   */
  txn: string;

  /**
   * Transaction root SHA256
   */
  txn256: string;

  /**
   * StateProofTracking map of type to tracking data
   */
  spt: Map<number, Uint8Array>;
}

export const BLOCK_HEADER_SCHEMA = new NamedMapSchema([
  {
    key: 'fees',
    valueSchema: new StringSchema(),
    required: true,
    omitEmpty: true,
  }, // TODO: address schema
  {
    key: 'frac',
    valueSchema: new Uint64Schema(),
    required: true,
    omitEmpty: true,
  },
  {
    key: 'gen',
    valueSchema: new StringSchema(),
    required: true,
    omitEmpty: true,
  },
  {
    key: 'gh',
    valueSchema: new StringSchema(),
    required: true,
    omitEmpty: true,
  }, // TODO: bytes schema
  {
    key: 'prev',
    valueSchema: new StringSchema(),
    required: true,
    omitEmpty: true,
  }, // TODO: bytes schema
  {
    key: 'proto',
    valueSchema: new StringSchema(),
    required: true,
    omitEmpty: true,
  },
  {
    key: 'rate',
    valueSchema: new Uint64Schema(),
    required: true,
    omitEmpty: true,
  },
  {
    key: 'rnd',
    valueSchema: new Uint64Schema(),
    required: true,
    omitEmpty: true,
  },
  {
    key: 'rwcalr',
    valueSchema: new Uint64Schema(),
    required: true,
    omitEmpty: true,
  },
  {
    key: 'rwd',
    valueSchema: new StringSchema(),
    required: true,
    omitEmpty: true,
  }, // TODO: address schema
  {
    key: 'seed',
    valueSchema: new StringSchema(),
    required: true,
    omitEmpty: true,
  }, // TODO: bytes schema
  {
    key: 'ts',
    valueSchema: new Uint64Schema(),
    required: true,
    omitEmpty: true,
  },
  {
    key: 'txn',
    valueSchema: new StringSchema(),
    required: true,
    omitEmpty: true,
  }, // TODO: bytes schema
  {
    key: 'txn256',
    valueSchema: new StringSchema(),
    required: true,
    omitEmpty: true,
  }, // TODO: bytes schema
  {
    key: 'spt',
    valueSchema: new UntypedSchema(), // TODO: fix
    required: true,
    omitEmpty: true,
  },
]);

export function blockHeaderFromDecodedMsgpack(data: unknown): BlockHeader {
  if (!(data instanceof Map)) {
    throw new Error(`Invalid decoded BlockHeader: ${data}`);
  }
  return {
    fees: data.get('fees'),
    frac: data.get('frac'),
    gen: data.get('gen'),
    gh: data.get('gh'),
    prev: data.get('prev'),
    proto: data.get('proto'),
    rate: data.get('rate'),
    rnd: data.get('rnd'),
    rwcalr: data.get('rwcalr'),
    rwd: data.get('rwd'),
    seed: data.get('seed'),
    ts: data.get('ts'),
    txn: data.get('txn'),
    txn256: data.get('txn256'),
    spt: data.get('spt'),
  };
}

export function blockHeaderMsgpackPrepare(
  header: BlockHeader
): MsgpackEncodingData {
  return new Map<string, MsgpackEncodingData>([
    ['fees', header.fees],
    ['frac', header.frac],
    ['gen', header.gen],
    ['gh', header.gh],
    ['prev', header.prev],
    ['proto', header.proto],
    ['rate', header.rate],
    ['rnd', header.rnd],
    ['rwcalr', header.rwcalr],
    ['rwd', header.rwd],
    ['seed', header.seed],
    ['ts', header.ts],
    ['txn', header.txn],
    ['txn256', header.txn256],
    ['spt', header.spt],
  ]);
}

export function blockHeaderFromDecodedJSON(data: unknown): BlockHeader {
  if (data === null || typeof data !== 'object') {
    throw new Error(`Invalid decoded EncodedSubsig: ${data}`);
  }
  const obj = data as Record<string, any>;
  return {
    fees: obj.fees,
    frac: obj.frac,
    gen: obj.gen,
    gh: obj.gh,
    prev: obj.prev,
    proto: obj.proto,
    rate: obj.rate,
    rnd: obj.rnd,
    rwcalr: obj.rwcalr,
    rwd: obj.rwd,
    seed: obj.seed,
    ts: obj.ts,
    txn: obj.txn,
    txn256: obj.txn256,
    spt: obj.spt,
  };
}

export function blockHeaderJSONPrepare(header: BlockHeader): JSONEncodingData {
  return {
    fees: header.fees,
    frac: header.frac,
    gen: header.gen,
    gh: header.gh,
    prev: header.prev,
    proto: header.proto,
    rate: header.rate,
    rnd: header.rnd,
    rwcalr: header.rwcalr,
    rwd: header.rwd,
    seed: header.seed,
    ts: header.ts,
    txn: header.txn,
    txn256: header.txn256,
    spt: header.spt as unknown, // TODO
  } as Record<string, JSONEncodingData>;
}
