import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { Numeric } from '../../../types';

export default class LookupAssetBalances extends JSONRequest {
  /**
   * Returns the list of accounts which hold the given asset and their balance.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetBalances = await indexerClient.lookupAssetBalances(assetId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2assetsasset-idbalances)
   * @param index - The asset ID to look up.
   */
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: Numeric) {
    super(c, intDecoding);
    this.index = index;
  }

  path() {
    return `/v2/assets/${this.index}/balances`;
  }

  /**
   * Add a limit for filter.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const maxResults = 20;
   * const assetBalances = await indexerClient
   *        .lookupAssetBalances(assetId)
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
   * Filtered results should have an asset balance greater than this value.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const minBalance = 1000000;
   * const assetBalances = await indexerClient
   *        .lookupAssetBalances(assetId)
   *        .currencyGreaterThan(minBalance)
   *        .do();
   * ```
   * @param greater
   */
  currencyGreaterThan(greater: Numeric) {
    this.query['currency-greater-than'] = greater;
    return this;
  }

  /**
   * Filtered results should have an asset balance less than this value.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const maxBalance = 2000000;
   * const assetBalances = await indexerClient
   *        .lookupAssetBalances(assetId)
   *        .currencyLessThan(maxBalance)
   *        .do();
   * ```
   * @param lesser
   */
  currencyLessThan(lesser: Numeric) {
    this.query['currency-less-than'] = lesser;
    return this;
  }

  /**
   * Specify the next page of results.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const maxResults = 20;
   * const nextToken = "APA6C7C3NCANRPIBUWQOF7WSKLJMK6RPQUVFLLDV4U5WCQE4DEF26D4E3E";
   * const assetBalances = await indexerClient
   *        .lookupAssetBalances(assetId)
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
   * const assetId = 163650;
   * const assetBalances = await indexerClient
   *        .lookupAssetBalances(assetId)
   *        .includeAll(false)
   *        .do();
   * ```
   * @param value
   */
  includeAll(value = true) {
    this.query['include-all'] = value;
    return this;
  }
}
