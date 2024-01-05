import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class GetBlockTxids extends JSONRequest {
  round: number;

  constructor(c: HTTPClient, intDecoding: IntDecoding, roundNumber: number) {
    super(c, intDecoding);
    if (!Number.isInteger(roundNumber))
      throw Error('roundNumber should be an integer');
    this.round = roundNumber;
  }

  path() {
    return `/v2/blocks/${this.round}/txids`;
  }
}
