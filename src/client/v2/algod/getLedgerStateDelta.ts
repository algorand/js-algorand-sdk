import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class GetLedgerStateDelta extends JSONRequest {
  constructor(c: HTTPClient, private round: bigint) {
    super(c);
    this.round = round;
    this.query = { format: 'json' };
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/${this.round}`;
  }
}
