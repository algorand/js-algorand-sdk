import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { BlockTxidsResponse } from './models/types.js';

export default class GetBlockTxids extends JSONRequest<BlockTxidsResponse> {
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
  prepare(response: HTTPClientResponse): BlockTxidsResponse {
    return decodeJSON(response.getJSONText(), BlockTxidsResponse);
  }
}
