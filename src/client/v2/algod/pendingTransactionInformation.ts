import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import * as encoding from '../../../encoding/encoding';
import { PendingTransactionResponse } from './models/types';

/**
 * returns the transaction information for a specific txid of a pending transaction
 */
export default class PendingTransactionInformation extends JSONRequest<PendingTransactionResponse> {
  constructor(c: HTTPClient, private txid: string) {
    super(c);
    this.txid = txid;
    this.query.format = 'msgpack';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array) {
    if (body && body.byteLength > 0) {
      return encoding.decode(body) as PendingTransactionResponse;
    }
    return undefined;
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
