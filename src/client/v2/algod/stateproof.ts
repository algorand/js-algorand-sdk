import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { StateProof as SP } from './models/types';

export default class StateProof extends JSONRequest<SP> {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private round: number | bigint
  ) {
    super(c, intDecoding);

    this.round = round;
  }

  path() {
    return `/v2/stateproofs/${this.round}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array): SP {
    return SP.from_obj_for_encoding(body);
  }
}
