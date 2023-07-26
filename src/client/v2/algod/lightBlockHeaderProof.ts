import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { LightBlockHeaderProof as LBHP } from './models/types';

export default class LightBlockHeaderProof extends JSONRequest<LBHP> {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private round: number) {
    super(c, intDecoding);

    this.round = round;
  }

  path() {
    return `/v2/blocks/${this.round}/lightheader/proof`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array): LBHP {
    return LBHP.from_obj_for_encoding(body);
  }
}
