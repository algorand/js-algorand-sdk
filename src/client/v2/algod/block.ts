import * as encoding from '../../../encoding/encoding.js';
import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { BlockResponse } from './models/types.js';

/**
 * block gets the block info for the given round. this call may block
 */
export default class Block extends JSONRequest<BlockResponse, Uint8Array> {
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
  prepare(body: Uint8Array): BlockResponse {
    return encoding.decodeMsgpack(body, BlockResponse);
  }
}
