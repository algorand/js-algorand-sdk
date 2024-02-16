import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';

export default class GetLedgerStateDeltaForTransactionGroup extends JSONRequest {
  constructor(
    c: HTTPClient,
    private id: string
  ) {
    super(c);
    this.query = { format: 'json' };
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/txn/group/${this.id}`;
  }
}
