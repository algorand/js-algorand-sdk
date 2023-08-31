import * as encoding from '../../../encoding/encoding';
import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import { BlockResponse } from './models/types';

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
    if (body && body.byteLength > 0) {
      return BlockResponse.from_obj_for_encoding(encoding.decode(body));
    }
    return undefined;
  }
}
