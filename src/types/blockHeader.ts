import { MsgpackEncodingData } from '../encoding/encoding';

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
