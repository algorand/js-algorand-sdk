import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { TransactionResponse } from './models/types.js';

export default class LookupTransactionByID extends JSONRequest<TransactionResponse> {
  /**
   * Returns information about the given transaction.
   *
   * #### Example
   * ```typescript
   * const txnId = "MEUOC4RQJB23CQZRFRKYEI6WBO73VTTPST5A7B3S5OKBUY6LFUDA";
   * const txnInfo = await indexerClient.lookupTransactionByID(txnId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2transactionstxid)
   * @param txID - The ID of the transaction to look up.
   * @category GET
   */
  constructor(
    c: HTTPClient,
    private txID: string
  ) {
    super(c);
  }

  /**
   * @returns `/v2/transactions/${txID}`
   */
  path() {
    return `/v2/transactions/${this.txID}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): TransactionResponse {
    return decodeJSON(response.getJSONText(), TransactionResponse);
  }
}
