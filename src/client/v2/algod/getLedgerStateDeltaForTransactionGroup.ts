import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class GetLedgerStateDeltaForTransactionGroup extends JSONRequest {
  constructor(c: HTTPClient, private id: string) {
    super(c);
    this.id = id;
    this.query = { format: 'json' };
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/txn/group/${this.id}`;
  }
}
