import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { bytesToBase64 } from '../../../encoding/binarydata.js';
import { ensureSafeInteger } from '../../../utils/utils.js';
import { BoxesResponse } from './models/types.js';

/**
 * Given an application ID, return all the box names associated with the app.
 *
 * #### Example
 * ```typescript
 * const index = 60553466;
 * const boxesResponse = await algodClient.getApplicationBoxes(index).max(3).do();
 * const boxNames = boxesResponse.boxes.map(box => box.name);
 * ```
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
   * Limits results when NOT using pagination. If using pagination, use {@link perPageLimit}
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
   *        .perPageLimit(20)
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
   * Include box values in the response.
   *
   * When true, the `value` field of each {@link BoxDescriptor} will contain the
   * box's value. When false (the default), only box names are returned.
   *
   * #### Example
   * ```typescript
   * const boxesResponse = await algodClient
   *        .getApplicationBoxes(1234)
   *        .values(true)
   *        .do();
   * // Access box values
   * const boxData = boxesResponse.boxes.map(box => ({
   *   name: box.name,
   *   value: box.value // Uint8Array
   * }));
   * ```
   *
   * @param includeValues - Whether to include box values in the response.
   * @category query
   */
  values(includeValues: boolean) {
    if (includeValues) {
      if (this.query.include) {
        this.query.include += ',values';
      } else {
        this.query.include = 'values';
      }
    } else if (this.query.include) {
      const include: string[] = this.query.include.split(',');
      const filteredInclude = include.filter((i) => i !== 'values');
      if (filteredInclude.length === 0) {
        delete this.query.include;
      } else {
        this.query.include = filteredInclude.join(',');
      }
    }

    return this;
  }

  /**
   * Limits results per page when using pagination. If not using pagination, use {@link max}
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const boxesResult = await algodClient
   *        .getApplicationBoxes(1234)
   *        .perPageLimit(maxResults)
   *        .do();
   * const { nextToken } = boxesResult
   * ```
   *
   * @param limit - maximum number of results to return per page.
   * @category query
   */
  perPageLimit(limit: number) {
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
