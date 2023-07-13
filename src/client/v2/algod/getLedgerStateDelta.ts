import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';

export default class GetLedgerStateDelta extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private round: bigint) {
    super(c, intDecoding);
    this.round = round;
    this.query = { format: 'json' };
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/${this.round}`;
  }
}
