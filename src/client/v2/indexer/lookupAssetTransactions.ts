import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { base64StringFunnel } from './lookupAccountTransactions.js';
import { Address } from '../../../encoding/address.js';
import { TransactionsResponse } from './models/types.js';

export default class LookupAssetTransactions extends JSONRequest<TransactionsResponse> {
  private index: bigint;

  /**
   * Returns transactions relating to the given asset.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetTxns = await indexerClient.lookupAssetTransactions(assetId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2assetsasset-idtransactions)
   * @param index - The asset ID to look up.
   */
  constructor(c: HTTPClient, index: number | bigint) {
    super(c);
    this.index = BigInt(index);
  }

  /**
   * @returns `/v2/assets/${index}/transactions`
   */
  path() {
    return `/v2/assets/${this.index}/transactions`;
  }

  /**
   * Specifies a prefix which must be contained in the note field.
   *
   * #### Example
   * ```typescript
   * const notePrefixBase64Encoded = "Y3JlYXRl";
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .notePrefix(notePrefixBase64Encoded)
   *        .do();
   * ```
   *
   * @param prefix - base64 string or uint8array
   * @category query
   */
  notePrefix(prefix: Uint8Array | string) {
    this.query['note-prefix'] = base64StringFunnel(prefix);
    return this;
  }

  /**
   * Type of transaction to filter with.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .txType("axfer")
   *        .do();
   * ```
   *
   * @param type - one of `pay`, `keyreg`, `acfg`, `axfer`, `afrz`, `appl`
   * @category query
   */
  txType(type: string) {
    this.query['tx-type'] = type;
    return this;
  }

  /**
   * Type of signature to filter with.
   * - sig: Standard
   * - msig: MultiSig
   * - lsig: LogicSig
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .sigType("lsig")
   *        .do();
   * ```
   *
   * @param type - one of `sig`, `msig`, `lsig`
   * @category query
   */
  sigType(type: string) {
    this.query['sig-type'] = type;
    return this;
  }

  /**
   * Lookup the specific transaction by ID.
   *
   * #### Example
   * ```typescript
   * const txId = "MEUOC4RQJB23CQZRFRKYEI6WBO73VTTPST5A7B3S5OKBUY6LFUDA";
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .txid(txId)
   *        .do();
   * ```
   *
   * @param txid
   * @category query
   */
  txid(txid: string) {
    this.query.txid = txid;
    return this;
  }

  /**
   * Include results for the specified round.
   *
   * #### Example
   * ```typescript
   * const targetBlock = 18309917;
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .round(targetBlock)
   *        .do();
   * ```
   *
   * @param round
   * @category query
   */
  round(round: number | bigint) {
    this.query.round = round;
    return this;
  }

  /**
   * Include results at or after the specified min-round.
   *
   * #### Example
   * ```typescript
   * const minRound = 18309917;
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .minRound(minRound)
   *        .do();
   * ```
   *
   * @param round
   * @category query
   */
  minRound(round: number | bigint) {
    this.query['min-round'] = round;
    return this;
  }

  /**
   * Include results at or before the specified max-round.
   *
   * #### Example
   * ```typescript
   * const maxRound = 18309917;
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .maxRound(maxRound)
   *        .do();
   * ```
   *
   * @param round
   * @category query
   */
  maxRound(round: number | bigint) {
    this.query['max-round'] = round;
    return this;
  }

  /**
   * Maximum number of results to return.
   *
   * #### Example
   * ```typescript
   * const maxResults = 25;
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .limit(maxResults)
   *        .do();
   * ```
   *
   * @param limit
   * @category query
   */
  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  /**
   * Include results before the given time.
   *
   * #### Example
   * ```typescript
   * const beforeTime = "2022-02-02T20:20:22.02Z";
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .beforeTime(beforeTime)
   *        .do();
   * ```
   *
   * @param before - rfc3339 string or Date object
   * @category query
   */
  beforeTime(before: string | Date) {
    this.query['before-time'] =
      before instanceof Date ? before.toISOString() : before;
    return this;
  }

  /**
   * Include results after the given time.
   *
   * #### Example
   * ```typescript
   * const afterTime = "2022-10-21T00:00:11.55Z";
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .afterTime(afterTime)
   *        .do();
   * ```
   *
   * @param after - rfc3339 string or Date object
   * @category query
   */
  afterTime(after: string | Date) {
    this.query['after-time'] =
      after instanceof Date ? after.toISOString() : after;
    return this;
  }

  /**
   * Filtered results should have an amount greater than this value, as int, representing asset units.
   *
   * #### Example
   * ```typescript
   * const minBalance = 300000;
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .currencyGreaterThan(minBalance - 1)
   *        .do();
   * ```
   *
   * @param greater
   * @category query
   */
  currencyGreaterThan(greater: number | bigint) {
    // We convert the following to a string for now to correctly include zero values in request parameters.
    this.query['currency-greater-than'] = greater.toString();
    return this;
  }

  /**
   * Filtered results should have an amount less than this value, as int, representing asset units.
   *
   * #### Example
   * ```typescript
   * const maxBalance = 500000;
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .currencyLessThan(maxBalance + 1)
   *        .do();
   * ```
   *
   * @param lesser
   * @category query
   */
  currencyLessThan(lesser: number | bigint) {
    this.query['currency-less-than'] = lesser;
    return this;
  }

  /**
   * Combined with address, defines what address to filter on, as string.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const role = "sender";
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .address(address)
   *        .addressRole(role)
   *        .do();
   * ```
   *
   * @param role - one of `sender`, `receiver`, `freeze-target`
   * @category query
   */
  addressRole(role: string) {
    this.query['address-role'] = role;
    return this;
  }

  /**
   * Only include transactions with this address in one of the transaction fields.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .address(address)
   *        .do();
   * ```
   *
   * @param address
   * @category query
   */
  address(address: string | Address) {
    this.query.address = address.toString();
    return this;
  }

  /**
   * Whether or not to consider the `close-to` field as a receiver when filtering transactions, as bool. Set to `true` to ignore `close-to`.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .excludeCloseTo(true)
   *        .do();
   * ```
   *
   * @param exclude
   * @category query
   */
  excludeCloseTo(exclude: boolean) {
    this.query['exclude-close-to'] = exclude;
    return this;
  }

  /**
   * The next page of results.
   *
   * #### Example
   * ```typescript
   * const maxResults = 25;
   * const assetId = 163650;
   *
   * const assetTxnsPage1 = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .limit(maxResults)
   *        .do();
   *
   * const assetTxnsPage2 = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .limit(maxResults)
   *        .nextToken(assetTxnsPage1["next-token"])
   *        .do();
   * ```
   *
   * @param nextToken - provided by the previous results.
   * @category query
   */
  nextToken(nextToken: string) {
    this.query.next = nextToken;
    return this;
  }

  /**
   * Whether or not to include rekeying transactions.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetTxns = await indexerClient
   *        .lookupAssetTransactions(assetId)
   *        .rekeyTo(false)
   *        .do();
   * ```
   *
   * @param rekeyTo
   * @category query
   */
  rekeyTo(rekeyTo: boolean) {
    this.query['rekey-to'] = rekeyTo;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): TransactionsResponse {
    return decodeJSON(response.getJSONText(), TransactionsResponse);
  }
}
