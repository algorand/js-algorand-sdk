import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeMsgpack } from '../../../encoding/encoding.js';
import { PendingTransactionsResponse } from './models/types.js';

/**
 * pendingTransactionsInformation returns transactions that are pending in the pool
 */
export default class PendingTransactions extends JSONRequest<PendingTransactionsResponse> {
  constructor(c: HTTPClient) {
    super(c);
    this.query.format = 'msgpack';
  }

  /* eslint-disable class-methods-use-this */
  path() {
    return '/v2/transactions/pending';
  }

  prepare(response: HTTPClientResponse): PendingTransactionsResponse {
    return decodeMsgpack(response.body, PendingTransactionsResponse);
  }
  /* eslint-enable class-methods-use-this */

  // max sets the maximum number of txs to return
  max(max: number) {
    this.query.max = max;
    return this;
  }
}
