import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { StateProof as SP } from './models/types.js';

export default class StateProof extends JSONRequest<SP, Record<string, any>> {
  constructor(
    c: HTTPClient,
    private round: number
  ) {
    super(c);
  }

  path() {
    return `/v2/stateproofs/${this.round}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): SP {
    return SP.fromDecodedJSON(body);
  }
}
