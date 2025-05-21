import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { BoxesResponse } from './models/types.js';

/**
 * Given an application ID, return all the box names associated with the app.
 *
 * #### Example
 * ```typescript
 * const index = 60553466;
 * const boxesResponse = await algodClient.getApplicationBoxes(index).prefix('int:1234').next('b64:A==').values(true).do();
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
   * Limit results for pagination.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const boxesResult = await algodClient
   *        .GetApplicationBoxes(1234)
   *        .limit(maxResults)
   *        .do();
   * ```
   *
   * @param limit - maximum number of results to return.
   * @category query
   */
  max(max: number) {
    this.query.max = max;
    return this;
  }

  /**
   * A box name prefix, in the goal app call arg form 'encoding:value'. For ints, use the form 'int:1234'. For raw bytes, use the form 'b64:A=='. For printable strings, use the form 'str:hello'. For addresses, use the form 'addr:XYZ...'.
   *
   * #### Example
   * ```typescript
   * const prefix = 'int:1234';
   * const boxesResult = await algodClient
   *        .GetApplicationBoxes(1234)
   *        .prefix(prefix)
   *        .do();
   * ```
   *
   * @param prefix - the box name prefix in the form 'encoding:value'
   * @category query
   */
  prefix(prefix: string) {
    this.query.prefix = prefix;
    return this;
  }

  /**
   * A box name, in the goal app call arg form 'encoding:value'. When provided, the returned boxes begin (lexographically) with the supplied name. Callers may implement pagination by reinvoking the endpoint with the token from a previous call's next-token.
   *
   * #### Example
   * ```typescript
   * const next = 'int:1234';
   * const boxesResult = await algodClient
   *        .GetApplicationBoxes(1234)
   *        .next(next)
   *        .do();
   * ```
   *
   * @param next - the next box name for pagination, in the goal app call arg form 'encoding:value'
   * @category query
   */
  next(next: string) {
    this.query.next = next;
    return this;
  }

  /**
   * If true, box values will be returned.
   *
   * #### Example
   * ```typescript
   * const values = true;
   * const boxesResult = await algodClient
   *        .GetApplicationBoxes(1234)
   *        .values(values)
   *        .do();
   * ```
   *
   * @param values - if true, box values will be returned
   * @category query
   */
  values(values: boolean) {
    this.query.values = values;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): BoxesResponse {
    return decodeJSON(response.getJSONText(), BoxesResponse);
  }
}
