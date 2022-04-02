import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { Numeric } from '../../../types';

/**
 * Accept base64 string or Uint8Array and output base64 string
 * @param data - Base64 string or Uint8Array
 * @returns The inputted base64 string, or a base64 string representation of the Uint8Array
 */
export function base64StringFunnel(data: Uint8Array | string) {
  if (typeof data === 'string') {
    return data;
  }
  return Buffer.from(data).toString('base64');
}

export default class LookupAccountTransactions extends JSONRequest {
  /**
   * Returns transactions relating to the given account.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient.lookupAccountTransactions(address).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2accountsaccount-idtransactions)
   * @param account - The address of the account.
   */
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private account: string
  ) {
    super(c, intDecoding);
    this.account = account;
  }

  /**
   * @returns /v2/accounts/`${account}`/transactions
   */
  path() {
    return `/v2/accounts/${this.account}/transactions`;
  }

  /**
   * Specifies a prefix which must be contained in the note field
   *
   * #### Example
   * ```typescript
   * const notePrefixBase64Encoded = "Y3JlYXRl";
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
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
   * Type of transaction to filter with
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .txType("appl")
   *        .do();
   * ```
   *
   * @param type - one of “pay”, “keyreg”, “acfg”, “axfer”, “afrz”, "appl"
   * @category query
   */
  txType(type: string) {
    this.query['tx-type'] = type;
    return this;
  }

  /**
   * Type of signature to filter with
   * - sig: Standard
   * - msig: MultiSig
   * - lsig: LogicSig
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .sigType("msig")
   *        .do();
   * ```
   *
   * @param type - one of “sig”, “msig”, “lsig”
   * @category query
   */
  sigType(type: string) {
    this.query['sig-type'] = type;
    return this;
  }

  /**
   * Lookup the specific transaction by ID
   *
   * #### Example
   * ```typescript
   * const txId = "MEUOC4RQJB23CQZRFRKYEI6WBO73VTTPST5A7B3S5OKBUY6LFUDA";
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
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
   * Include results for the specified round
   *
   * #### Example
   * ```typescript
   * const targetBlock = 18309917;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .round(targetBlock)
   *        .do();
   * ```
   *
   * @param round
   * @category query
   */
  round(round: Numeric) {
    this.query.round = round;
    return this;
  }

  /**
   * Include results at or after the specified min-round
   *
   * #### Example
   * ```typescript
   * const minRound = 18309917;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .minRound(minRound)
   *        .do();
   * ```
   *
   * @param round
   * @category query
   */
  minRound(round: Numeric) {
    this.query['min-round'] = round;
    return this;
  }

  /**
   * Include results at or before the specified max-round
   *
   * #### Example
   * ```typescript
   * const maxRound = 18309917;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .maxRound(maxRound)
   *        .do();
   * ```
   *
   * @param round
   * @category query
   */
  maxRound(round: Numeric) {
    this.query['max-round'] = round;
    return this;
  }

  /**
   * Asset ID to filter with
   *
   * #### Example
   * ```typescript
   * const assetID = 163650;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .assetID(assetID)
   *        .do();
   * ```
   *
   * @param id
   * @category query
   */
  assetID(id: Numeric) {
    this.query['asset-id'] = id;
    return this;
  }

  /**
   * Maximum number of results to return
   *
   * #### Example
   * ```typescript
   * const limit = 25;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .limit(limit)
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
   * Include results before the given time
   *
   * #### Example
   * ```typescript
   * const beforeTime = "2022-02-02T20:20:22.02Z";
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .beforeTime(beforeTime)
   *        .do();
   * ```
   *
   * @param before - rfc3339 string
   * @category query
   */
  beforeTime(before: string) {
    this.query['before-time'] = before;
    return this;
  }

  /**
   * Include results after the given time
   *
   * #### Example
   * ```typescript
   * const afterTime = "2022-10-21T00:00:11.55Z";
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .afterTime(afterTime)
   *        .do();
   * ```
   *
   * @param after - rfc3339 string
   * @category query
   */
  afterTime(after: string) {
    this.query['after-time'] = after;
    return this;
  }

  /**
   * Filtered results should have an amount greater than this value, as int, representing microAlgos, unless an asset-id is provided, in which case units are in the asset's units.
   *
   * #### Example 1
   * ```typescript
   * const minBalance = 300000;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .currencyGreaterThan(minBalance - 1)
   *        .do();
   * ```
   *
   * #### Example 2
   * ```typescript
   * const assetID = 163650;
   * const minBalance = 300000;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .assetID(assetID)
   *        .currencyGreaterThan(minBalance - 1)
   *        .do();
   * ```
   * @remarks
   * If you are looking for transactions with the currency amount greater than 0, simply construct the query without `currencyGreaterThan` because it doesn't accept `-1`, and passing the `0` `currency-greater-than` value would exclude transactions with a 0 amount.
   *
   * @param greater
   * @category query
   */
  currencyGreaterThan(greater: Numeric) {
    this.query['currency-greater-than'] = greater;
    return this;
  }

  /**
   * Filtered results should have an amount less than this value, as int, representing microAlgos, unless an asset-id is provided, in which case units are in the asset's units
   *
   * #### Example 1
   * ```typescript
   * const maxBalance = 500000;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .currencyLessThan(maxBalance + 1)
   *        .do();
   * ```
   *
   * #### Example 2
   * ```typescript
   * const assetID = 163650;
   * const maxBalance = 500000;
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .assetID(assetID)
   *        .currencyLessThan(maxBalance + 1)
   *        .do();
   * ```
   *
   * @param lesser
   * @category query
   */
  currencyLessThan(lesser: Numeric) {
    this.query['currency-less-than'] = lesser;
    return this;
  }

  /**
   * The next page of results. Use the next token provided by the previous results.
   *
   * #### Example
   * ```typescript
   * const limit = 25;
   * const nextToken = "the next token returned in the previous query response";
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
   *        .limit(limit)
   *        .nextToken(nextToken)
   *        .do();
   * ```
   *
   * @param nextToken
   * @category query
   */
  nextToken(nextToken: string) {
    this.query.next = nextToken;
    return this;
  }

  /**
   * Include results which include the rekey-to field
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient
   *        .lookupAccountTransactions(address)
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
}
