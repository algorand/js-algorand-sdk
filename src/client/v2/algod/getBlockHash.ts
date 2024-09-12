import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { BlockHashResponse } from './models/types.js';

export default class GetBlockHash extends JSONRequest<BlockHashResponse> {
  private round: bigint;

  constructor(c: HTTPClient, roundNumber: number | bigint) {
    super(c);
    this.round = BigInt(roundNumber);
  }

  path() {
    return `/v2/blocks/${this.round}/hash`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): BlockHashResponse {
    return decodeJSON(response.getJSONText(), BlockHashResponse);
  }
}
