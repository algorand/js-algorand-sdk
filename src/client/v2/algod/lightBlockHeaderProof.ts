import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { LightBlockHeaderProof as LBHP } from './models/types.js';

export default class LightBlockHeaderProof extends JSONRequest<
  LBHP,
  Record<string, any>
> {
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
  prepare(body: Record<string, any>): LBHP {
    return LBHP.from_obj_for_encoding(body);
  }
}
