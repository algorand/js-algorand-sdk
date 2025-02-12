import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeMsgpack } from '../../../encoding/encoding.js';
import { BlockResponse } from './models/types.js';

/**
 * block gets the block info for the given round. this call may block
 */
export default class Block extends JSONRequest<BlockResponse> {
  private round: bigint;

  constructor(c: HTTPClient, roundNumber: number | bigint) {
    super(c);
    this.round = BigInt(roundNumber);
    this.query = { format: 'msgpack' };
  }

  path() {
    return `/v2/blocks/${this.round}`;
  }

  /**
   * If true, only the block header (exclusive of payset or certificate) may be included in response.
   *
   * #### Example
   * ```typescript
   *
   * const roundNumber = 41000000;
   *
   * const blockResponse = await algodClient
   *        .block(roundNumber)
   *        .headerOnly(true)
   *        .do();
   * ```
   *
   * @param headerOnly - the flag indicating whether exclusively return header in response
   * @category query
   */
  headerOnly(headerOnly: boolean) {
    this.query['header-only'] = headerOnly;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): BlockResponse {
    return decodeMsgpack(response.body, BlockResponse);
  }
}
