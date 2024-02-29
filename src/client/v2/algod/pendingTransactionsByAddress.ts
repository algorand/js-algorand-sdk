import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import * as encoding from '../../../encoding/encoding.js';
import { PendingTransactionsResponse } from './models/types.js';
import { Address } from '../../../encoding/address.js';

/**
 * returns all transactions for a PK [addr] in the [first, last] rounds range.
 */
export default class PendingTransactionsByAddress extends JSONRequest<
  PendingTransactionsResponse,
  Uint8Array
> {
  private address: string;

  constructor(c: HTTPClient, address: string | Address) {
    super(c);
    this.address = address.toString();
    this.query.format = 'msgpack';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array): PendingTransactionsResponse {
    return PendingTransactionsResponse.from_obj_for_encoding(
      encoding.decode(body) as Record<string, any>
    );
  }

  path() {
    return `/v2/accounts/${this.address}/transactions/pending`;
  }

  // max sets the maximum number of txs to return
  max(max: number) {
    this.query.max = max;
    return this;
  }
}
