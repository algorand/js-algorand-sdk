import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';
import { NodeStatusResponse } from './models/types.js';

export default class StatusAfterBlock extends JSONRequest<
  NodeStatusResponse,
  Record<string, any>
> {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private round: number
  ) {
    super(c, intDecoding);
    if (!Number.isInteger(round)) throw Error('round should be an integer');
    this.round = round;
  }

  path() {
    return `/v2/status/wait-for-block-after/${this.round}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): NodeStatusResponse {
    return NodeStatusResponse.from_obj_for_encoding(body);
  }
}
