import JSONRequest from '../jsonrequest.js';
import HTTPClient from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class StatusAfterBlock extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private round: number) {
    super(c, intDecoding);
    if (!Number.isInteger(round)) throw Error('round should be an integer');
    this.round = round;
  }

  path() {
    return `/v2/status/wait-for-block-after/${this.round}`;
  }
}
