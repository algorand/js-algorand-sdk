import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { ApplicationResponse } from './models/types.js';

export default class LookupApplications extends JSONRequest<ApplicationResponse> {
  private index: bigint;

  /**
   * Returns information about the passed application.
   *
   * #### Example
   * ```typescript
   * const appId = 60553466;
   * const appInfo = await indexerClient.lookupApplications(appId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applicationsapplication-id)
   * @param index - The ID of the application to look up.
   * @category GET
   */
  constructor(c: HTTPClient, index: number | bigint) {
    super(c);
    this.index = BigInt(index);
  }

  /**
   * @returns `/v2/applications/${index}`
   */
  path() {
    return `/v2/applications/${this.index}`;
  }

  /**
   * Includes all items including closed accounts, deleted applications, destroyed assets, opted-out asset holdings, and closed-out application localstates
   *
   * #### Example 1
   * ```typescript
   * const appId = 60553466;
   * const appInfo = await indexerClient
   *        .lookupApplications(appId)
   *        .includeAll(false)
   *        .do();
   * ```
   *
   * #### Example 2
   * ```typescript
   * const appId = 60553466;
   * const appInfo = await indexerClient
   *        .lookupApplications(appId)
   *        .includeAll()
   *        .do();
   * ```
   *
   * @param value - default true when called without passing a value
   * @category query
   */
  includeAll(value = true) {
    this.query['include-all'] = value;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): ApplicationResponse {
    return decodeJSON(response.getJSONText(), ApplicationResponse);
  }
}
