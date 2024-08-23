import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { Address } from '../../../encoding/address.js';
import { ApplicationLocalStatesResponse } from './models/types.js';

export default class LookupAccountAppLocalStates extends JSONRequest<ApplicationLocalStatesResponse> {
  private account: string | Address;

  /**
   * Returns application local state about the given account.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountAppLocalStates = await indexerClient.lookupAccountAppLocalStates(address).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2accountsaccount-idapps-local-state)
   * @param account - The address of the account to look up.
   * @category GET
   */
  constructor(c: HTTPClient, account: string | Address) {
    super(c);
    this.account = account.toString();
  }

  /**
   * @returns `/v2/accounts/${account}/apps-local-state`
   */
  path() {
    return `/v2/accounts/${this.account}/apps-local-state`;
  }

  /**
   * Add a limit for filter.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const maxResults = 20;
   * const accountAssets = await indexerClient
   *        .lookupAccountAppLocalStates(address)
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

  /**
   * Specify round to filter with.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const targetBlock = 18309917;
   * const accountAssets = await indexerClient
   *        .lookupAccountAppLocalStates(address)
   *        .round(targetBlock)
   *        .do();
   * ```
   * @param round
   * @category query
   */
  round(round: number | bigint) {
    this.query.round = round;
    return this;
  }

  /**
   * Specify the next page of results.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const maxResults = 20;
   *
   * const accountAssetsPage1 = await indexerClient
   *        .lookupAccountAppLocalStates(address)
   *        .limit(maxResults)
   *        .do();
   *
   * const accountAssetsPage2 = await indexerClient
   *        .lookupAccountAppLocalStates(address)
   *        .limit(maxResults)
   *        .next(accountAssetsPage1["next-token"])
   *        .do();
   * ```
   * @param nextToken - provided by the previous results.
   */
  nextToken(nextToken: string) {
    this.query.next = nextToken;
    return this;
  }

  /**
   * Include all items including closed accounts, deleted applications, destroyed assets, opted-out asset holdings, and closed-out application localstates
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountAssets = await indexerClient
   *        .lookupAccountAppLocalStates(address)
   *        .includeAll(false)
   *        .do();
   * ```
   * @param value
   * @category query
   */
  includeAll(value = true) {
    this.query['include-all'] = value;
    return this;
  }

  /**
   * Specify an applicationID to search for.
   *
   * #### Example
   * ```typescript
   * const applicationID = 163650;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountApplications = await indexerClient
   *        .lookupAccountAppLocalStates(address)
   *        .applicationID(applicationID)
   *        .do();
   * ```
   * @param index - the applicationID
   * @category query
   */
  applicationID(index: number | bigint) {
    this.query['application-id'] = index;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): ApplicationLocalStatesResponse {
    return decodeJSON(response.getJSONText(), ApplicationLocalStatesResponse);
  }
}
