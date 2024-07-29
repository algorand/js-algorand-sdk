import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { AssetResponse } from './models/types.js';

export default class LookupAssetByID extends JSONRequest<
  AssetResponse,
  Record<string, any>
> {
  /**
   * Returns asset information of the queried asset.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetInfo = await indexerClient.lookupAssetByID(assetId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2assetsasset-id)
   * @param index - The asset ID to look up.
   */
  constructor(
    c: HTTPClient,
    private index: number
  ) {
    super(c);
  }

  /**
   * @returns `/v2/assets/${index}`
   */
  path() {
    return `/v2/assets/${this.index}`;
  }

  /**
   * Includes all items including closed accounts, deleted applications, destroyed assets, opted-out asset holdings, and closed-out application localstates
   *
   * #### Example 1
   * ```typescript
   * const assetId = 163650;
   * const assetInfo = await indexerClient
   *        .lookupAssetByID(assetId)
   *        .includeAll(false)
   *        .do();
   * ```
   *
   * #### Example 2
   * ```typescript
   * const assetId = 163650;
   * const assetInfo = await indexerClient
   *        .lookupAssetByID(assetId)
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
  prepare(body: Record<string, any>): AssetResponse {
    return AssetResponse.fromEncodingData(
      AssetResponse.encodingSchema.fromPreparedJSON(body)
    );
  }
}
