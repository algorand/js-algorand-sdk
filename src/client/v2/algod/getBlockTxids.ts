import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { BlockTxidsResponse } from './models/types.js';

export default class GetBlockTxids extends JSONRequest<
  BlockTxidsResponse,
  Record<string, any>
> {
  round: number;

  constructor(c: HTTPClient, roundNumber: number) {
    super(c);
    if (!Number.isInteger(roundNumber))
      throw Error('roundNumber should be an integer');
    this.round = roundNumber;
  }

  path() {
    return `/v2/blocks/${this.round}/txids`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): BlockTxidsResponse {
    return BlockTxidsResponse.fromEncodingData(
      BlockTxidsResponse.encodingSchema.fromPreparedJSON(body)
    );
  }
}
