import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { LightBlockHeaderProof as LBHP } from './models/types.js';

export default class LightBlockHeaderProof extends JSONRequest<LBHP> {
  private round: bigint;

  constructor(c: HTTPClient, round: number | bigint) {
    super(c);
    this.round = BigInt(round);
  }

  path() {
    return `/v2/blocks/${this.round}/lightheader/proof`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): LBHP {
    return decodeJSON(response.getJSONText(), LBHP);
  }
}
