import * as encoding from '../../../encoding/encoding';
import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import { BlockResponse } from './models/types';

/**
 * block gets the block info for the given round. this call may block
 */
export default class Block extends JSONRequest<BlockResponse> {
  private round: number;

  constructor(c: HTTPClient, roundNumber: number) {
    super(c);
    if (!Number.isInteger(roundNumber))
      throw Error('roundNumber should be an integer');
    this.round = roundNumber;
    this.query = { format: 'msgpack' };
  }

  path() {
    return `/v2/blocks/${this.round}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array) {
    if (body && body.byteLength > 0) {
      return encoding.decode(body) as BlockResponse;
    }
    return undefined;
  }
}
