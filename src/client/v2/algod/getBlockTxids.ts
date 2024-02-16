import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';

export default class GetBlockTxids extends JSONRequest {
  round: number;

  constructor(c: HTTPClient, roundNumber: number) {
    super(c);
    if (!Number.isInteger(roundNumber))
      throw Error('roundNumber should be an integer');
    this.round = roundNumber;
  }

  path() {
    return `/v2/blocks/${this.round}/txids`;
  }
}
