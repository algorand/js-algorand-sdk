import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { StateProof as SP } from './models/types';

export default class StateProof extends JSONRequest<SP, Record<string, any>> {
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
  prepare(body: Record<string, any>): SP {
    return SP.from_obj_for_encoding(body);
  }
}
