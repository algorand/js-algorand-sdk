import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class StatusAfterBlock extends JSONRequest {
  constructor(c: HTTPClient, private round: number) {
    super(c);
    if (!Number.isInteger(round)) throw Error('round should be an integer');
    this.round = round;
  }

  path() {
    return `/v2/status/wait-for-block-after/${this.round}`;
  }
}
