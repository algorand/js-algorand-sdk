import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { bytesToBase64 } from '../../../encoding/binarydata.js';
import { ensureSafeInteger } from '../../../utils/utils.js';
import { BoxesResponse } from './models/types.js';

export type BoxInclude = 'values';

/**
 * Given an application ID, return all the boxes associated with the app.
 *
 * #### Example
 * ```typescript
 * const index = 60553466;
 * const boxesResponse = await algodClient.getApplicationBoxes(index).max(3).do();
 * const boxNames = boxesResponse.boxes.map(box => box.name);
 * ```
 *
 * With the `.include("values")` parameter, returns values in addition to names. Pagination is supported with `limit`. If using pagination,
 * it is recommended to use the `.round()` parameter to ensure each page is for the same round.
 *
 * [Response data schema details](https://developer.algorand.org/docs/rest-apis/algod/#get-v2applicationsapplication-idboxes)
 * @param index - The application ID to look up.
 * @category GET
 */
export default class GetApplicationBoxes extends JSONRequest<BoxesResponse> {
  private index: bigint;

  constructor(c: HTTPClient, index: number | bigint) {
    super(c);
    this.index = BigInt(index);
    this.query.max = 0;
  }

  /**
   * @returns `/v2/applications/${index}/boxes`
   */
  path() {
    return `/v2/applications/${this.index}/boxes`;
  }

  /**
   * @deprecated - Use `limit` instead for proper pagination with a limit.
   *
   * Set the max amount of boxes to return. Returns HTTP 400 if max is exceeded.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const boxesResult = await algodClient
   *        .getApplicationBoxes(1234)
   *        .max(maxResults)
   *        .do();
   * ```
   *
   * @param max - maximum number of results to return.
   * @category query
   */
  max(max: number) {
    this.query.max = max;
    return this;
  }

  /**
   * Pagination token returned by the previous call.
   *
   * This is the value returned by a previous call to this endpoint in the
   * `next-token` response field. Provide this token to get the next page of
   * results. The token is the box name to use as the pagination cursor,
   * encoded in the goal app call arg form.
   *
   * #### Example
   * ```typescript
   * const boxesResponse = await algodClient
   *        .getApplicationBoxes(1234)
   *        .limit(20)
   *        .next("b64:AAECAw==")
   *        .do();
   * ```
   *
   * @param nextToken - The next token to use for pagination.
   * @category query
   */
  next(nextToken: string | undefined) {
    this.query.next = nextToken;
    return this;
  }

  /**
   * Filter box names by a prefix.
   *
   * #### Example
   * ```typescript
   * const boxesResponse = await algodClient
   *        .getApplicationBoxes(1234)
   *        .prefix(myAddr.publicKey)
   *        .do();
   * ```
   *
   * @param prefix - The prefix to filter box names by
   * @category query
   */
  prefix(prefix: Uint8Array) {
    this.query.prefix = `b64:${bytesToBase64(prefix)}`;
    return this;
  }

  /**
   * Include additional items in the response.
   *
   * Use `values` to include box values.
   *
   * #### Example
   * ```typescript
   * const boxesResponse = await algodClient
   *        .getApplicationBoxes(1234)
   *        .prefix(myAddr.publicKey)
   *        .include("values")
   *        .do();
   * ```
   *
   * @param include - The additional items to include in the response.
   * @category query
   */
  include(...include: BoxInclude[]) {
    this.query.include = include.join(',');
    return this;
  }

  /**
   * Limits results per page when using pagination.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const boxesResult = await algodClient
   *        .getApplicationBoxes(1234)
   *        .limit(maxResults)
   *        .do();
   * const { nextToken } = boxesResult
   * ```
   *
   * @param limit - maximum number of results to return per page.
   * @category query
   */
  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  /**
   * Return results for the specified round.
   *
   * If not provided, results will be from the latest round. This parameter
   * can be used to pin all pages of a paginated query to a consistent round.
   *
   * #### Example
   * ```typescript
   * const boxesResponse = await algodClient
   *        .getApplicationBoxes(1234)
   *        .round(12345678)
   *        .do();
   * ```
   *
   * @param roundNumber - The round to query.
   * @category query
   */
  round(roundNumber: number | bigint) {
    this.query.round = ensureSafeInteger(roundNumber);
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): BoxesResponse {
    return decodeJSON(response.getJSONText(), BoxesResponse);
  }
}
