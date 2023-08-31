import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import * as encoding from '../../../encoding/encoding';
import { PendingTransactionsResponse } from './models/types';

/**
 * pendingTransactionsInformation returns transactions that are pending in the pool
 */
export default class PendingTransactions extends JSONRequest<
  PendingTransactionsResponse,
  Uint8Array
> {
  constructor(c: HTTPClient) {
    super(c);
    this.query.format = 'msgpack';
  }

  /* eslint-disable class-methods-use-this */
  path() {
    return '/v2/transactions/pending';
  }

  prepare(body: Uint8Array) {
    if (body && body.byteLength > 0) {
      return PendingTransactionsResponse.from_obj_for_encoding(
        encoding.decode(body)
      );
    }
    return undefined;
  }
  /* eslint-enable class-methods-use-this */

  // max sets the maximum number of txs to return
  max(max: number) {
    this.query.max = max;
    return this;
  }
}
