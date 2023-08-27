import JSONRequest from '../jsonrequest.js';
import HTTPClient from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class StateProof extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private round: number) {
    super(c, intDecoding);

    this.round = round;
  }

  path() {
    return `/v2/stateproofs/${this.round}`;
  }
}
