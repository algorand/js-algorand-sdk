import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeMsgpack } from '../../../encoding/encoding.js';
import { PendingTransactionResponse } from './models/types.js';

/**
 * returns the transaction information for a specific txid of a pending transaction
 */
export default class PendingTransactionInformation extends JSONRequest<PendingTransactionResponse> {
  constructor(
    c: HTTPClient,
    private txid: string
  ) {
    super(c);
    this.query.format = 'msgpack';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): PendingTransactionResponse {
    return decodeMsgpack(response.body, PendingTransactionResponse);
  }

  path() {
    return `/v2/transactions/pending/${this.txid}`;
  }

  // max sets the maximum number of txs to return
  max(max: number) {
    this.query.max = max;
    return this;
  }
}
