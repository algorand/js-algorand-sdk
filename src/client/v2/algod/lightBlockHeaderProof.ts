import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { LightBlockHeaderProof as LBHP } from './models/types.js';

export default class LightBlockHeaderProof extends JSONRequest<LBHP> {
  constructor(
    c: HTTPClient,
    private round: number
  ) {
    super(c);
  }

  path() {
    return `/v2/blocks/${this.round}/lightheader/proof`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): LBHP {
    return decodeJSON(response.getJSONText(), LBHP);
  }
}
