import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class GetLedgerStateDeltaForTransactionGroup extends JSONRequest {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private id: string
  ) {
    super(c, intDecoding);
    this.id = id;
    this.query = { format: 'json' };
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/txn/group/${this.id}`;
  }
}
