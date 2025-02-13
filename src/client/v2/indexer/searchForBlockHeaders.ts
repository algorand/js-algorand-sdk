import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { Address } from '../../../encoding/address.js';
import { BlockHeadersResponse } from './models/types.js';

/**
 * Returns information about indexed block headers.
 *
 * #### Example
 * ```typescript
 * const bhs = await indexerClient.searchForBlockHeaders().do();
 * ```
 *
 * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2block-headers)
 * @category GET
 */
export default class SearchForBlockHeaders extends JSONRequest<BlockHeadersResponse> {
  /**
   * @returns `/v2/block-headers`
   */
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/block-headers';
  }

  /**
   * Accounts marked as absent in the block header's participation updates.
   *
   * #### Example
   * ```typescript
   * const address1 = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const address2 = "4H5UNRBJ2Q6JENAXQ6HNTGKLKINP4J4VTQBEPK5F3I6RDICMZBPGNH6KD4";
   * const bhs = await indexerClient
   *        .searchForBlockHeaders()
   *        .absent([address1,address2])
   *        .do();
   * ```
   *
   * @param absent - a comma separated list of addresses
   * @category query
   */
  absent(absent: (string | Address)[]) {
    this.query.absent = absent;
    return this;
  }

  /**
   * Include results after the given time.
   *
   * #### Example
   * ```typescript
   * const afterTime = "2022-10-21T00:00:11.55Z";
   * const bhs = await indexerClient
   *        .searchForBlockHeaders()
   *        .afterTime(afterTime)
   *        .do();
   * ```
   *
   * @param after - rfc3339 string or Date object
   * @category query
   */
  afterTime(after: string | Date) {
    this.query['after-time'] =
      after instanceof Date ? after.toISOString() : after;
    return this;
  }

  /**
   * Include results before the given time.
   *
   * #### Example
   * ```typescript
   * const beforeTime = "2022-02-02T20:20:22.02Z";
   * const bhs = await indexerClient
   *        .searchForBlockHeaders()
   *        .beforeTime(beforeTime)
   *        .do();
   * ```
   *
   * @param before - rfc3339 string or Date object
   * @category query
   */
  beforeTime(before: string | Date) {
    this.query['before-time'] =
      before instanceof Date ? before.toISOString() : before;
    return this;
  }

  /**
   * Accounts marked as expired in the block header's participation updates.
   *
   * #### Example
   * ```typescript
   * const address1 = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const address2 = "4H5UNRBJ2Q6JENAXQ6HNTGKLKINP4J4VTQBEPK5F3I6RDICMZBPGNH6KD4";
   * const bhs = await indexerClient
   *        .searchForBlockHeaders()
   *        .expired([address1,address2])
   *        .do();
   * ```
   *
   * @param expired - - a comma separated list of addresses
   * @category query
   */
  expired(expired: (string | Address)[]) {
    this.query.expired = expired;
    return this;
  }

  /**
   * Maximum number of results to return.
   *
   * #### Example
   * ```typescript
   * const maxResults = 25;
   * const bhs = await indexerClient
   *        .searchForBlockHeaders()
   *        .limit(maxResults)
   *        .do();
   * ```
   *
   * @param limit
   * @category query
   */
  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  /**
   * Include results at or before the specified max-round.
   *
   * #### Example
   * ```typescript
   * const maxRound = 18309917;
   * const bhs = await indexerClient
   *        .searchForBlockHeaders()
   *        .maxRound(maxRound)
   *        .do();
   * ```
   *
   * @param round
   * @category query
   */
  maxRound(round: number | bigint) {
    this.query['max-round'] = round;
    return this;
  }

  /**
   * Include results at or after the specified min-round.
   *
   * #### Example
   * ```typescript
   * const minRound = 18309917;
   * const bhs = await indexerClient
   *        .searchForBlockHeaders()
   *        .minRound(minRound)
   *        .do();
   * ```
   *
   * @param round
   * @category query
   */
  minRound(round: number | bigint) {
    this.query['min-round'] = round;
    return this;
  }

  /**
   * The next page of results.
   *
   * #### Example
   * ```typescript
   * const maxResults = 25;
   *
   * const bh1 = await indexerClient
   *        .searchForBlockHeaders()
   *        .limit(maxResults)
   *        .do();
   *
   * const bh2 = await indexerClient
   *        .searchForBlockHeaders()
   *        .limit(maxResults)
   *        .nextToken(bh1["next-token"])
   *        .do();
   * ```
   *
   * @param nextToken - provided by the previous results
   * @category query
   */
  nextToken(nextToken: string) {
    this.query.next = nextToken;
    return this;
  }

  /**
   * Accounts marked as proposer in the block header's participation updates.
   *
   * #### Example
   * ```typescript
   * const address1 = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const address2 = "4H5UNRBJ2Q6JENAXQ6HNTGKLKINP4J4VTQBEPK5F3I6RDICMZBPGNH6KD4";
   * const bhs = await indexerClient
   *        .searchForBlockHeaders()
   *        .proposers([address1,address2])
   *        .do();
   * ```
   *
   * @param proposers - a comma separated list of addresses
   * @category query
   */
  proposers(proposers: (string | Address)[]) {
    this.query.proposers = proposers;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): BlockHeadersResponse {
    return decodeJSON(response.getJSONText(), BlockHeadersResponse);
  }
}
