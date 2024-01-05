import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';
import { BlockHashResponse } from './models/types.js';

export default class GetBlockHash extends JSONRequest<
  BlockHashResponse,
  Record<string, any>
> {
  round: number | bigint;

  constructor(c: HTTPClient, intDecoding: IntDecoding, roundNumber: number) {
    super(c, intDecoding);
    this.round = roundNumber;
  }

  path() {
    return `/v2/blocks/${this.round}/hash`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): BlockHashResponse {
    return BlockHashResponse.from_obj_for_encoding(body);
  }
}
