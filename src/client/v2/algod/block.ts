import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeMsgpack } from '../../../encoding/encoding.js';
import { BlockResponse } from './models/types.js';

/**
 * block gets the block info for the given round. this call may block
 */
export default class Block extends JSONRequest<BlockResponse> {
  private round: number;

  constructor(c: HTTPClient, roundNumber: number) {
    super(c);
    this.round = roundNumber;
    this.query = { format: 'msgpack' };
  }

  path() {
    return `/v2/blocks/${this.round}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): BlockResponse {
    return decodeMsgpack(response.body, BlockResponse);
  }
}
