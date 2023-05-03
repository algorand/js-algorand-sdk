import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { NodeStatusResponse } from './models/types';

export default class StatusAfterBlock extends JSONRequest<NodeStatusResponse> {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private round: number) {
    super(c, intDecoding);
    if (!Number.isInteger(round)) throw Error('round should be an integer');
    this.round = round;
  }

  path() {
    return `/v2/status/wait-for-block-after/${this.round}`;
  }
}
