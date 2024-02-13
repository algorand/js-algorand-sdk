import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { NodeStatusResponse } from './models/types.js';

export default class StatusAfterBlock extends JSONRequest<
  NodeStatusResponse,
  Record<string, any>
> {
  constructor(
    c: HTTPClient,
    private round: number
  ) {
    super(c);
    if (!Number.isInteger(round)) throw Error('round should be an integer');
  }

  path() {
    return `/v2/status/wait-for-block-after/${this.round}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): NodeStatusResponse {
    return NodeStatusResponse.from_obj_for_encoding(body);
  }
}
