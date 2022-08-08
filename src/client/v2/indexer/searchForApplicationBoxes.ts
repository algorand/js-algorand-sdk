import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';

export default class SearchForApplicationBoxes extends JSONRequest {
  /**
   * Returns information about indexed application boxes.
   *
   * #### Example
   * ```typescript
   * const apps = await indexerClient.SearchForApplicationBoxes(1234).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applicationsapplication-idboxes)
   * @oaram index - application index.
   * @category GET
   */
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
    super(c, intDecoding);
    this.index = index;
  }

  /**
   * @returns `/v2/applications/${index}/boxes`
   */
  path() {
    return `/v2/applications/${this.index}/boxes`;
  }

  /**
   * Specify the next page of results.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   *
   * const appsPage1 = await indexerClient
   *        .SearchForApplicationBoxes(1234)
   *        .limit(maxResults)
   *        .do();
   *
   * const appsPage2 = await indexerClient
   *        .SearchForApplicationBoxes(1234)
   *        .limit(maxResults)
   *        .nextToken(appsPage1["next-token"])
   *        .do();
   * ```
   * @param nextToken - provided by the previous results.
   * @category query
   */
  nextToken(next: string) {
    this.query.next = next;
    return this;
  }

  /**
   * Limit results for pagination.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const apps = await indexerClient
   *        .SearchForApplicationBoxes(1234)
   *        .limit(maxResults)
   *        .do();
   * ```
   *
   * @param limit - maximum number of results to return.
   * @category query
   */
  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }
}
