import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';

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
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
    super(c, intDecoding);
    this.index = index;
  }

  /**
   * @returns `/v2/assets/${index}/balances`
   */
  path() {
    return `/v2/assets/${this.index}/balances`;
  }

  /**
   * Limit results for pagination.
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
   * @category query
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
   * @category query
   */
  currencyGreaterThan(greater: number) {
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
   * @category query
   */
  currencyLessThan(lesser: number) {
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
   *
   * const assetBalancesPage1 = await indexerClient
   *        .lookupAssetBalances(assetId)
   *        .limit(maxResults)
   *        .do();
   *
   * const assetBalancesPage2 = await indexerClient
   *        .lookupAssetBalances(assetId)
   *        .limit(maxResults)
   *        .nextToken(assetBalancesPage1["next-token"])
   *        .do();
   * ```
   * @param nextToken - provided by the previous results.
   * @category query
   */
  nextToken(nextToken: string) {
    this.query.next = nextToken;
    return this;
  }

  /**
   * Include all items including closed accounts, deleted applications, destroyed assets, opted-out asset holdings, and closed-out application localstates.
   *
   * #### Example 1
   * ```typescript
   * const assetId = 163650;
   * const assetBalances = await indexerClient
   *        .lookupAssetBalances(assetId)
   *        .includeAll(false)
   *        .do();
   * ```
   *
   * #### Example 2
   * ```typescript
   * const assetId = 163650;
   * const assetBalances = await indexerClient
   *        .lookupAssetBalances(assetId)
   *        .includeAll()
   *        .do();
   * ```
   *
   * @param value
   * @category query
   */
  includeAll(value = true) {
    this.query['include-all'] = value;
    return this;
  }
}
