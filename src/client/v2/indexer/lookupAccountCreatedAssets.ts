import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { Numeric } from '../../../types';

export default class LookupAccountCreatedAssets extends JSONRequest {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private account: string
  ) {
    super(c, intDecoding);
    this.account = account;
  }

  path() {
    return `/v2/accounts/${this.account}/created-assets`;
  }

  /**
   * Add a limit for filter.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const maxResults = 20;
   * const accountAssets = await indexerClient
   *        .lookupAccountCreatedAssets(address)
   *        .limit(maxResults)
   *        .do();
   * ```
   *
   * @param limit - maximum number of results to return.
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
   *        .lookupAccountCreatedAssets(address)
   *        .round(targetBlock)
   *        .do();
   * ```
   * @param round
   */
  round(round: Numeric) {
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
   * const nextToken = "APA6C7C3NCANRPIBUWQOF7WSKLJMK6RPQUVFLLDV4U5WCQE4DEF26D4E3E";
   * const accountAssets = await indexerClient
   *        .lookupAccountCreatedAssets(address)
   *        .limit(maxResults)
   *        .next(nextToken)
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
   *        .lookupAccountCreatedAssets(address)
   *        .includeAll(false)
   *        .do();
   * ```
   * @param value
   */
  includeAll(value = true) {
    this.query['include-all'] = value;
    return this;
  }

  /**
   * Specify an assetID to search for.
   *
   * #### Example
   * ```typescript
   * const assetID = 163650;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const assetAssets = await indexerClient
   *        .lookupAccountCreatedAssets(address)
   *        .assetID(assetID)
   *        .do();
   * ```
   * @param index - the assetID
   */
  assetID(index: Numeric) {
    this.query['asset-id'] = index;
    return this;
  }
}
