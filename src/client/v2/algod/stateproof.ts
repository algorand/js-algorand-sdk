import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { StateProof as SP } from './models/types.js';

export default class StateProof extends JSONRequest<SP> {
  private round: bigint;

  constructor(c: HTTPClient, round: number | bigint) {
    super(c);
    this.round = BigInt(round);
  }

  path() {
    return `/v2/stateproofs/${this.round}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): SP {
    return decodeJSON(response.getJSONText(), SP);
  }
}
