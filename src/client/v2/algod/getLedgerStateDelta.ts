import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';

export default class GetLedgerStateDelta extends JSONRequest {
  constructor(
    c: HTTPClient,
    private round: number
  ) {
    super(c);
    this.query = { format: 'json' };
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/${this.round}`;
  }
}
