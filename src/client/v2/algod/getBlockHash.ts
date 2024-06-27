import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { BlockHashResponse } from './models/types.js';

export default class GetBlockHash extends JSONRequest<
  BlockHashResponse,
  Record<string, any>
> {
  round: number | bigint;

  constructor(c: HTTPClient, roundNumber: number) {
    super(c);
    this.round = roundNumber;
  }

  path() {
    return `/v2/blocks/${this.round}/hash`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): BlockHashResponse {
    return BlockHashResponse.fromEncodingData(
      BlockHashResponse.encodingSchema.fromPreparedJSON(body)
    );
  }
}
