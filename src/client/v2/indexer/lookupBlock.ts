import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { Block } from './models/types.js';

export default class LookupBlock extends JSONRequest<Block> {
  private round: bigint;

  /**
   * Returns the block for the passed round.
   *
   * #### Example
   * ```typescript
   * const targetBlock = 18309917;
   * const blockInfo = await indexerClient.lookupBlock(targetBlock).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2blocksround-number)
   * @param round - The number of the round to look up.
   * @category GET
   */
  constructor(c: HTTPClient, round: number | bigint) {
    super(c);
    this.round = BigInt(round);
  }

  /**
   * @returns `/v2/blocks/${round}`
   */
  path() {
    return `/v2/blocks/${this.round}`;
  }

  /**
   * Header only flag. When this is set to true, returned block does not contain the
   * transactions.
   */
  headerOnly(headerOnly: boolean) {
    this.query['header-only'] = headerOnly;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): Block {
    return decodeJSON(response.getJSONText(), Block);
  }
}
