import * as encoding from '../../../encoding/encoding';
import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

/**
 * block gets the block info for the given round. this call may block
 */
export default class Block extends JSONRequest {
  private round: number;

  constructor(c: HTTPClient, roundNumber: number) {
    super(c);
    if (!Number.isInteger(roundNumber))
      throw Error('roundNumber should be an integer');
    this.round = roundNumber;
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
  prepare(body: Uint8Array) {
    if (body && body.byteLength > 0) {
      return encoding.decode(body) as Record<string, any>;
    }
    return undefined;
  }
}
