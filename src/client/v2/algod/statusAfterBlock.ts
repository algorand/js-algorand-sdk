import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { NodeStatusResponse } from './models/types.js';

export default class StatusAfterBlock extends JSONRequest<NodeStatusResponse> {
  private round: bigint;

  constructor(c: HTTPClient, round: number | bigint) {
    super(c);
    this.round = BigInt(round);
  }

  path() {
    return `/v2/status/wait-for-block-after/${this.round}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): NodeStatusResponse {
    return decodeJSON(response.getJSONText(), NodeStatusResponse);
  }
}
